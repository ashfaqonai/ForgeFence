import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { resolve, isAbsolute } from "node:path";
import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { AuditLog } from "./audit.js";
import { approvePin, checkPin, loadPins, savePins } from "./pin.js";
import { evaluateSink, labelsForTool, loadPolicy } from "./policy.js";
import { SessionTaint } from "./session.js";
import { createDemoTools } from "./demo-tools.js";
import type { ForgeFenceConfig, UpstreamConfig } from "./types.js";

function resolvePath(baseDir: string, p: string): string {
  return isAbsolute(p) ? p : resolve(baseDir, p);
}

export function loadConfig(configPath: string): { config: ForgeFenceConfig; baseDir: string } {
  const baseDir = resolve(configPath, "..");
  const config = yaml.load(readFileSync(configPath, "utf8")) as ForgeFenceConfig;
  return { config, baseDir };
}

type UpstreamHandle = {
  name: string;
  client: Client;
};

export async function createForgeFenceServer(configPath: string) {
  const { config, baseDir } = loadConfig(configPath);
  const policyPath = resolvePath(baseDir, config.policy);
  const policy = loadPolicy(policyPath);
  const pinsPath = resolvePath(baseDir, config.pins ?? "./pins/tools.json");
  const auditPath = resolvePath(baseDir, config.audit ?? policy.audit?.path ?? "./audit/forgefence.jsonl");
  const audit = new AuditLog(auditPath);
  const session = new SessionTaint();
  const pinStore = loadPins(pinsPath);

  const upstreams: UpstreamHandle[] = [];
  for (const u of config.upstream ?? []) {
    upstreams.push(await connectUpstream(u));
  }

  const demoTools = config.demo === false ? [] : createDemoTools();
  const demoByName = new Map(demoTools.map((t) => [t.name, t]));

  const server = new Server(
    { name: "forgefence", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );

  async function listAllTools(): Promise<Tool[]> {
    const tools: Tool[] = [];

    for (const d of demoTools) {
      tools.push({
        name: d.name,
        description: d.description,
        inputSchema: d.inputSchema as Tool["inputSchema"],
      });
    }

    for (const up of upstreams) {
      const listed = await up.client.listTools();
      for (const t of listed.tools) {
        tools.push({
          name: `${up.name}__${t.name}`,
          description: t.description,
          inputSchema: t.inputSchema,
        });
      }
    }

    tools.push(
      {
        name: "forgefence__session_labels",
        description: "Show current ForgeFence session taint labels.",
        inputSchema: { type: "object", properties: {} },
      },
      {
        name: "forgefence__clear_session",
        description: "Clear session taint labels (operator / human approval path).",
        inputSchema: { type: "object", properties: {} },
      },
    );

    const visible: Tool[] = [];
    for (const t of tools) {
      if (t.name.startsWith("forgefence__")) {
        visible.push(t);
        continue;
      }
      const check = checkPin(pinStore, t.name, t.description, t.inputSchema);
      if (check.status === "new") {
        approvePin(pinStore, check.pin);
        savePins(pinsPath, pinStore);
        audit.write({ type: "info", tool: t.name, detail: "pinned new tool definition" });
        visible.push(t);
      } else if (check.status === "ok") {
        visible.push(t);
      } else {
        audit.write({
          type: "rug_pull",
          tool: t.name,
          reason: "tool definition drifted from pin",
          detail: `was ${check.previous.hash.slice(0, 12)} now ${check.pin.hash.slice(0, 12)}`,
        });
      }
    }
    return visible;
  }

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: await listAllTools(),
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
    const toolName = request.params.name;
    const args = (request.params.arguments ?? {}) as Record<string, unknown>;

    if (toolName === "forgefence__session_labels") {
      return textResult(`session_labels=${JSON.stringify(session.snapshot())}`);
    }
    if (toolName === "forgefence__clear_session") {
      session.clear();
      audit.write({ type: "info", detail: "session taint cleared" });
      return textResult("session cleared");
    }

    if (!toolName.startsWith("forgefence__")) {
      const listed = await listAllTools();
      const tool = listed.find((t) => t.name === toolName);
      if (!tool && !demoByName.has(toolName)) {
        audit.write({ type: "deny", tool: toolName, reason: "tool not available (missing or rug-pulled)" });
        return textResult(`ForgeFence DENY: tool '${toolName}' is not available (missing or rug-pull).`, true);
      }
    }

    const decision = evaluateSink(policy, toolName, session.snapshot());
    if (!decision.allow) {
      audit.write({
        type: "deny",
        tool: toolName,
        labels: session.snapshot(),
        reason: decision.reason,
        detail: `hit=${decision.hit.join(",")}`,
      });
      return textResult(
        `ForgeFence DENY: ${decision.reason}\n` +
          `tool=${toolName}\n` +
          `session_labels=${JSON.stringify(session.snapshot())}\n` +
          `hit=${JSON.stringify(decision.hit)}`,
        true,
      );
    }

    let result: CallToolResult;

    const demo = demoByName.get(toolName);
    if (demo) {
      result = await demo.handler(args);
    } else {
      const sep = toolName.indexOf("__");
      if (sep < 0) {
        return textResult(`ForgeFence DENY: unknown tool '${toolName}'`, true);
      }
      const serverName = toolName.slice(0, sep);
      const upstreamTool = toolName.slice(sep + 2);
      const up = upstreams.find((u) => u.name === serverName);
      if (!up) {
        return textResult(`ForgeFence DENY: unknown upstream '${serverName}'`, true);
      }
      result = (await up.client.callTool({
        name: upstreamTool,
        arguments: args,
      })) as CallToolResult;
    }

    const newLabels = labelsForTool(policy, toolName);
    if (newLabels.length > 0) {
      session.add(newLabels);
      audit.write({ type: "taint", tool: toolName, labels: newLabels, detail: `session=${session.snapshot().join(",")}` });
    } else {
      audit.write({ type: "allow", tool: toolName, labels: session.snapshot() });
    }

    return result;
  });

  audit.write({ type: "info", detail: `ForgeFence ready policy=${policyPath}` });

  return {
    server,
    session,
    audit,
    policy,
    async startStdio() {
      const transport = new StdioServerTransport();
      await server.connect(transport);
    },
  };
}

async function connectUpstream(u: UpstreamConfig): Promise<UpstreamHandle> {
  const transport = new StdioClientTransport({
    command: u.command,
    args: u.args ?? [],
    env: u.env,
    cwd: u.cwd,
  });
  const client = new Client({ name: `forgefence-upstream-${u.name}`, version: "0.1.0" });
  await client.connect(transport);
  return { name: u.name, client };
}

function textResult(text: string, isError = false): CallToolResult {
  return {
    content: [{ type: "text", text }],
    isError,
  };
}
