export type Label = string;

export type SourceRule = {
  match: string;
  labels: Label[];
};

export type SinkRule = {
  match: string;
  deny_if_tainted_with: Label[];
  reason: string;
};

export type Policy = {
  version: number;
  sources: SourceRule[];
  sinks: SinkRule[];
  allow_always: string[];
  audit?: { path?: string };
};

export type UpstreamConfig = {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
};

export type ForgeFenceConfig = {
  policy: string;
  pins?: string;
  audit?: string;
  demo?: boolean;
  upstream?: UpstreamConfig[];
};

export type ToolPin = {
  name: string;
  hash: string;
  description?: string;
  inputSchema?: unknown;
};

export type PinStore = {
  updatedAt: string;
  tools: Record<string, ToolPin>;
};

export type AuditEvent = {
  ts: string;
  type: "allow" | "deny" | "taint" | "rug_pull" | "info";
  tool?: string;
  labels?: Label[];
  reason?: string;
  detail?: string;
};
