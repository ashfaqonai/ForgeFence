import type { Label } from "./types.js";

/** Session-scoped taint set. LLM is treated as an untracked mixer — labels accumulate conservatively. */
export class SessionTaint {
  private labels = new Set<Label>();

  add(labels: Label[]): void {
    for (const l of labels) this.labels.add(l);
  }

  has(label: Label): boolean {
    return this.labels.has(label);
  }

  snapshot(): Label[] {
    return [...this.labels].sort();
  }

  clear(): void {
    this.labels.clear();
  }

  get size(): number {
    return this.labels.size;
  }
}
