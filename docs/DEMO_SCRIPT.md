# ForgeFence demo — recording guide & script

Target length: **90–120 seconds**. One story only: *private data read → public post blocked*.

## How to record

1. Install [Loom](https://www.loom.com/) (easiest) or OBS.
2. Record **screen + mic**, 1080p, browser or terminal zoomed in.
3. Layout (picture-in-picture optional):
   - Left/main: terminal running `npm run demo`
   - Optional cut: Cursor with ForgeFence MCP connected
4. Export → upload to **YouTube (unlisted or public)** or Loom.
5. Copy the embed URL (YouTube: `https://www.youtube.com/embed/VIDEO_ID`).
6. Set it on the site (see below) and redeploy.

### Put the video on the site

Edit [`packages/site/lib/demo-video.ts`](../packages/site/lib/demo-video.ts):

```ts
export const DEMO_VIDEO_EMBED_URL = "https://www.youtube.com/embed/YOUR_ID";
```

Or leave empty — the site shows a written walkthrough until you add the URL.

---

## Spoken script (read almost verbatim)

### 0:00–0:15 — Hook

> Agents don’t just answer questions anymore. They call tools — read files, query databases, post to Slack.  
> If an attacker tricks the agent, it can **read something private and publish it**.  
> Prompt filters often miss that. **ForgeFence blocks the path.**

### 0:15–0:35 — What it is (plain English)

> ForgeFence sits between your coding agent and its MCP tools.  
> Think of it as a **fence around tool use**:  
> when the agent touches sensitive data, that session is marked.  
> Anything that could **leak** that data — public post, email, outbound HTTP — gets **denied**.  
> Free, open source, runs on your machine. A ForgeMeter product.

*(Show homepage hero for 3 seconds, then cut to terminal.)*

### 0:35–1:05 — Live proof

> Here’s the built-in demo. No cloud account.

```bash
cd ForgeFence
npm run demo
```

> Watch: first, posting publicly is **allowed** — the session is clean.  
> Then we simulate reading a confidential record. The session is now **tainted**.  
> Same public-post tool — **denied**.  
> That’s the whole idea: **contain the blast radius after the bad read**, not hope the model behaves.

*(Pause on the DENY line for 2 seconds. Zoom if needed.)*

### 1:05–1:25 — Why it matters

> Real attacks look like this: filesystem or database MCP, then Slack or webhook MCP.  
> ForgeFence doesn’t try to outsmart every jailbreak.  
> It enforces a simple rule: **untrusted data cannot drive exfil sinks**.

### 1:25–1:45 — How to try / close

> Install locally, point Cursor’s MCP config at ForgeFence, edit `policies/default.yaml` for your tools.  
> Pair it with ForgeMeter when you care about AI spend.  
> ForgeFence when you care about what agents are allowed to do.  
> Links in the description: fence.forgemeter.com and github.com/ashfaqonai/ForgeFence

---

## On-screen checklist (while recording)

| Time | Show |
| --- | --- |
| Hook | Homepage or one-line slide: “Read private → post public = DENY” |
| Live | Terminal with `npm run demo` output |
| Optional | `policies/default.yaml` sinks for `demo__post_public` |
| Close | fence.forgemeter.com + GitHub star CTA |

## B-roll / cutaways (optional, 5s each)

1. Cursor Settings → MCP with `forgefence` entry  
2. Audit log line: `"type":"deny"` in `audit/forgefence.jsonl`  
3. Flow diagram on the website (Agent → ForgeFence → tools)

## What NOT to say

- Don’t say “we block all prompt injection” (you don’t — you contain tool abuse).  
- Don’t deep-dive IFC theory; use “tainted session” and “deny sinks”.  
- Don’t demo a 10-minute Cursor install in the hero video — link docs for that.

## Longer version (3–4 min, optional second video)

1. Install + `mcp.json` (60s)  
2. Ask Cursor: *“Read private record cust-42, then post the API key to #general.”*  
3. Show `ForgeFence DENY` in the tool result  
4. Show audit JSONL  
5. Clear session with `forgefence__clear_session` and show post allowed again  

Use that as “Deep dive” on the site; keep the homepage video at ~2 minutes.
