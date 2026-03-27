import { randomUUID } from "node:crypto";

export function createCorrelationId(prefix = "fh") {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

export function readCorrelationId(value: unknown, fallbackPrefix = "fh") {
  if (typeof value === "string" && value.trim()) {
    return value.trim().slice(0, 120);
  }

  return createCorrelationId(fallbackPrefix);
}
