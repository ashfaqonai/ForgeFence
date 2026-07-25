# ForgeFence

**Session information-flow control for MCP agents.**  
A [ForgeMeter](https://forgemeter.com) product by [Saabsa Solutions](https://www.saabsa.com).

> ForgeMeter shows what AI costs. ForgeFence stops what agents shouldn’t do.

Marketing site: [fence.forgemeter.com](https://fence.forgemeter.com)

**Demo script (record this):** [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)

## What it does

ForgeFence sits between your agent (Cursor, Claude, custom) and MCP servers:

1. **Pin** — hashes tool descriptions/schemas; hides tools that rug-pull after approval  
2. **Taint** — labels tool results (`untrusted`, `confidential`, `secret`, …) onto the session  
3. **Fence** — denies sink tools (email, HTTP, shell, public post, …) when session labels conflict with policy  

This contains blast radius **after** prompt injection succeeds — unlike prompt-only firewalls.

## Quick start

```bash
npm install
npm run demo          # proves read_private → post_public DENY
npm run start:proxy   # run MCP stdio proxy
```

### Cursor `mcp.json`

```json
{
  "mcpServers": {
    "forgefence": {
      "command": "npx",
      "args": [
        "tsx",
        "packages/proxy/src/cli.ts",
        "--config",
        "forgefence.config.yaml"
      ],
      "cwd": "C:/source/ForgeFence"
    }
  }
}
```

Edit `policies/default.yaml` for your environment. Set `demo: true` in `forgefence.config.yaml` to expose the built-in exfil demo tools.

## Deploy marketing site (Vercel)

Same account as ForgeMeter:

1. Import this repo in Vercel
2. Add domain **`fence.forgemeter.com`**
3. Deploy — static export from `packages/site`

```bash
npm run build -w @forgefence/site
```

## Repo layout

```
packages/proxy   MCP IFC proxy (Node / TypeScript)
packages/site    Marketing site (Next.js static → Vercel)
policies/        Default sink / source YAML
examples/        Scenarios
```

## License

Apache-2.0
