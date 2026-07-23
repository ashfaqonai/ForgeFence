import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export type DemoTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  handler: (args: Record<string, unknown>) => Promise<CallToolResult>;
};

/** Built-in tools that prove cross-tool exfil containment. */
export function createDemoTools(): DemoTool[] {
  return [
    {
      name: "demo__ping",
      description: "Health check for ForgeFence demo tools.",
      inputSchema: { type: "object", properties: {} },
      handler: async () => ({
        content: [{ type: "text", text: "pong" }],
      }),
    },
    {
      name: "demo__read_private",
      description:
        "Read a simulated confidential record (customer SSN / API key). " +
        "After this call, ForgeFence taints the session so public sinks are blocked.",
      inputSchema: {
        type: "object",
        properties: {
          record_id: { type: "string", description: "Record identifier" },
        },
        required: ["record_id"],
      },
      handler: async (args) => {
        const id = String(args.record_id ?? "unknown");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  record_id: id,
                  classification: "confidential",
                  ssn: "***-**-4281",
                  api_key: "sk_live_demo_exfil_target",
                  note: "This payload would be useful to an attacker if posted publicly.",
                },
                null,
                2,
              ),
            },
          ],
        };
      },
    },
    {
      name: "demo__post_public",
      description:
        "Post a message to a simulated public channel (Slack/webhook). " +
        "ForgeFence denies this when the session is tainted with confidential data.",
      inputSchema: {
        type: "object",
        properties: {
          channel: { type: "string" },
          message: { type: "string" },
        },
        required: ["channel", "message"],
      },
      handler: async (args) => ({
        content: [
          {
            type: "text",
            text: `posted to #${args.channel}: ${args.message}`,
          },
        ],
      }),
    },
  ];
}
