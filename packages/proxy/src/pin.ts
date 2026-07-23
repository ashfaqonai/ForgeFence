import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type { PinStore, ToolPin } from "./types.js";

export function toolHash(name: string, description: string | undefined, inputSchema: unknown): string {
  const payload = JSON.stringify({
    name,
    description: description ?? "",
    inputSchema: inputSchema ?? {},
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function loadPins(path: string): PinStore {
  if (!existsSync(path)) {
    return { updatedAt: new Date().toISOString(), tools: {} };
  }
  return JSON.parse(readFileSync(path, "utf8")) as PinStore;
}

export function savePins(path: string, store: PinStore): void {
  mkdirSync(dirname(path), { recursive: true });
  store.updatedAt = new Date().toISOString();
  writeFileSync(path, JSON.stringify(store, null, 2) + "\n", "utf8");
}

export type PinCheck =
  | { status: "new"; pin: ToolPin }
  | { status: "ok"; pin: ToolPin }
  | { status: "rug_pull"; pin: ToolPin; previous: ToolPin };

export function checkPin(
  store: PinStore,
  name: string,
  description: string | undefined,
  inputSchema: unknown,
): PinCheck {
  const hash = toolHash(name, description, inputSchema);
  const pin: ToolPin = { name, hash, description, inputSchema };
  const previous = store.tools[name];
  if (!previous) return { status: "new", pin };
  if (previous.hash === hash) return { status: "ok", pin };
  return { status: "rug_pull", pin, previous };
}

export function approvePin(store: PinStore, pin: ToolPin): void {
  store.tools[pin.name] = pin;
}
