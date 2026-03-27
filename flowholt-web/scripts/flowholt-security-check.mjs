import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { buildSecurityChecks, summarizeSecurityChecks } from "../src/lib/flowholt/security.ts";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(SCRIPT_PATH);
const APP_DIR = path.resolve(SCRIPT_DIR, "..");
const ENV_FILES = [".env.local", ".env"];

function applyEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    const rawKey = trimmed.slice(0, separatorIndex).trim();
    if (!rawKey || process.env[rawKey]) {
      continue;
    }

    let rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
    ) {
      rawValue = rawValue.slice(1, -1);
    }

    process.env[rawKey] = rawValue;
  }

  return true;
}

function loadLocalEnvFiles() {
  const loaded = [];

  for (const fileName of ENV_FILES) {
    const filePath = path.join(APP_DIR, fileName);
    if (applyEnvFile(filePath)) {
      loaded.push(fileName);
    }
  }

  return loaded;
}

function printChecks(checks) {
  for (const check of checks) {
    console.log(`[${check.status.toUpperCase()}] ${check.label}: ${check.detail}`);
  }
}

function runDependencyAudit() {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCommand, ["audit", "--audit-level=high"], {
    cwd: APP_DIR,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    throw new Error("Unable to run npm audit. Check your Node/npm installation and network access.");
  }

  if (result.status !== 0) {
    throw new Error("npm audit reported high-severity issues or could not complete.");
  }
}

function main() {
  const args = new Set(process.argv.slice(2));
  const loadedFiles = loadLocalEnvFiles();
  const checks = buildSecurityChecks(process.env);
  const summary = summarizeSecurityChecks(checks);

  console.log("[flowholt:security] Environment and secret check");
  if (loadedFiles.length) {
    console.log(`[flowholt:security] Loaded env files: ${loadedFiles.join(", ")}`);
  }
  printChecks(checks);
  console.log(`[flowholt:security] Summary: ${summary.ok} ok, ${summary.warn} warnings, ${summary.error} errors`);

  if (args.has("--deps")) {
    console.log("[flowholt:security] Running dependency audit...");
    runDependencyAudit();
    console.log("[flowholt:security] Dependency audit completed without high-severity findings.");
  }

  if (summary.error > 0) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : "Security check failed.";
  console.error(`[flowholt:security] ${message}`);
  process.exitCode = 1;
}
