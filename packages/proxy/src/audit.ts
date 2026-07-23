import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { AuditEvent } from "./types.js";

export class AuditLog {
  constructor(private readonly path: string) {
    mkdirSync(dirname(path), { recursive: true });
  }

  write(event: Omit<AuditEvent, "ts"> & { ts?: string }): void {
    const row: AuditEvent = {
      ts: event.ts ?? new Date().toISOString(),
      type: event.type,
      tool: event.tool,
      labels: event.labels,
      reason: event.reason,
      detail: event.detail,
    };
    appendFileSync(this.path, JSON.stringify(row) + "\n", "utf8");
  }
}
