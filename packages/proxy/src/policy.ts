import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { minimatch } from "minimatch";
import type { Label, Policy, SourceRule, SinkRule } from "./types.js";

export function loadPolicy(path: string): Policy {
  const raw = yaml.load(readFileSync(path, "utf8")) as Policy;
  if (!raw || typeof raw !== "object") {
    throw new Error(`Invalid policy file: ${path}`);
  }
  return {
    version: raw.version ?? 1,
    sources: raw.sources ?? [],
    sinks: raw.sinks ?? [],
    allow_always: raw.allow_always ?? [],
    audit: raw.audit,
  };
}

function matches(pattern: string, name: string): boolean {
  return minimatch(name, pattern, { nocase: false });
}

export function labelsForTool(policy: Policy, toolName: string): Label[] {
  const labels = new Set<Label>();
  for (const rule of policy.sources) {
    if (matches(rule.match, toolName)) {
      for (const l of rule.labels) labels.add(l);
    }
  }
  return [...labels];
}

export function isAlwaysAllowed(policy: Policy, toolName: string): boolean {
  return policy.allow_always.some((p) => matches(p, toolName));
}

export type SinkDecision =
  | { allow: true }
  | { allow: false; reason: string; rule: SinkRule; hit: Label[] };

export function evaluateSink(
  policy: Policy,
  toolName: string,
  sessionLabels: Iterable<Label>,
): SinkDecision {
  if (isAlwaysAllowed(policy, toolName)) return { allow: true };

  const session = new Set(sessionLabels);
  for (const rule of policy.sinks) {
    if (!matches(rule.match, toolName)) continue;
    const hit = rule.deny_if_tainted_with.filter((l) => session.has(l));
    if (hit.length > 0) {
      return { allow: false, reason: rule.reason, rule, hit };
    }
  }
  return { allow: true };
}

export function findSourceRules(policy: Policy, toolName: string): SourceRule[] {
  return policy.sources.filter((r) => matches(r.match, toolName));
}
