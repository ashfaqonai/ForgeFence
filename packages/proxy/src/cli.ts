#!/usr/bin/env node
import { resolve } from "node:path";
import { createForgeFenceServer } from "./server.js";

function usage(): never {
  console.error(`ForgeFence — MCP session information-flow control
A ForgeMeter product by Saabsa Solutions

Usage:
  forgefence --config <path-to-forgefence.config.yaml>

Cursor mcp.json example:
  {
    "mcpServers": {
      "forgefence": {
        "command": "npx",
        "args": ["tsx", "packages/proxy/src/cli.ts", "--config", "forgefence.config.yaml"],
        "cwd": "/path/to/ForgeFence"
      }
    }
  }
`);
  process.exit(1);
}

async function main() {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--config");
  if (idx < 0 || !args[idx + 1]) usage();
  const configPath = resolve(args[idx + 1]!);

  console.error(`[forgefence] starting with config ${configPath}`);
  const fg = await createForgeFenceServer(configPath);
  await fg.startStdio();
}

main().catch((err) => {
  console.error("[forgefence] fatal", err);
  process.exit(1);
});
