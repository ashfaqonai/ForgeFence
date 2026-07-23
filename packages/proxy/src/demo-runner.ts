/**
 * Headless proof: read_private taints session → post_public is denied.
 * Run: npm run demo
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateSink, labelsForTool, loadPolicy } from "./policy.js";
import { SessionTaint } from "./session.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const policy = loadPolicy(resolve(root, "policies/default.yaml"));
const session = new SessionTaint();

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

// 1) Clean session can post
{
  const d = evaluateSink(policy, "demo__post_public", session.snapshot());
  assert(d.allow, "expected post_public allowed on clean session");
  console.log("OK  clean session → post_public ALLOW");
}

// 2) read_private taints
{
  const labels = labelsForTool(policy, "demo__read_private");
  assert(labels.includes("untrusted") && labels.includes("confidential"), "expected taint labels");
  session.add(labels);
  console.log(`OK  read_private → taint ${JSON.stringify(session.snapshot())}`);
}

// 3) post_public denied
{
  const d = evaluateSink(policy, "demo__post_public", session.snapshot());
  assert(!d.allow, "expected post_public DENY after taint");
  if (!d.allow) {
    console.log(`OK  tainted session → post_public DENY (${d.reason})`);
  }
}

// 4) ping still allowed
{
  const d = evaluateSink(policy, "demo__ping", session.snapshot());
  assert(d.allow, "expected ping allow_always");
  console.log("OK  allow_always → demo__ping ALLOW");
}

console.log("\nForgeFence exfil-block demo passed.");
