import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(SCRIPT_PATH);
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const PAGE_SIZE = 500;
const UPSERT_BATCH_SIZE = 200;
const INSERT_BATCH_SIZE = 200;
const USER_REFERENCE_FIELDS = ["owner_user_id", "created_by_user_id", "user_id", "actor_user_id"];

export const BACKUP_SECTIONS = [
  { key: "workspaces", table: "workspaces", filterColumn: "id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: false },
  { key: "workspace_memberships", table: "workspace_memberships", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: false },
  { key: "workspace_usage_limits", table: "workspace_usage_limits", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "workspace_id", operational: false },
  { key: "integration_connections", table: "integration_connections", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: false },
  { key: "workflows", table: "workflows", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: false },
  { key: "workflow_schedules", table: "workflow_schedules", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: false },
  { key: "workflow_revisions", table: "workflow_revisions", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: false },
  { key: "workflow_chat_threads", table: "workflow_chat_threads", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: false },
  { key: "workflow_chat_messages", table: "workflow_chat_messages", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: false },
  { key: "workflow_runs", table: "workflow_runs", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: true },
  { key: "workflow_run_jobs", table: "workflow_run_jobs", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "upsert", conflict: "id", operational: true },
  { key: "workflow_node_executions", table: "workflow_node_executions", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "insert", conflict: "", operational: true, generatedIdentity: true },
  { key: "run_logs", table: "run_logs", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "insert", conflict: "", operational: true, generatedIdentity: true },
  { key: "workspace_audit_logs", table: "workspace_audit_logs", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "insert", conflict: "", operational: true, generatedIdentity: true },
  { key: "webhook_event_receipts", table: "webhook_event_receipts", filterColumn: "workspace_id", orderColumn: "created_at", writeMode: "insert", conflict: "", operational: true, generatedIdentity: true },
];

export function getBackupSections(includeOperational) {
  return BACKUP_SECTIONS.filter((section) => includeOperational || !section.operational);
}

export function resolveSupabaseUrl(env = process.env) {
  const candidates = [env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_URL];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "";
}

export function resolveServiceRoleKey(env = process.env) {
  const value = typeof env.SUPABASE_SERVICE_ROLE_KEY === "string" ? env.SUPABASE_SERVICE_ROLE_KEY.trim() : "";
  return value;
}

export function parseBackupArgs(argv) {
  const rest = argv.slice(2);
  const command = rest[0] === "create" || rest[0] === "restore" ? rest[0] : "";
  const args = {
    command,
    workspaceId: "",
    inputPath: "",
    outputPath: "",
    targetWorkspaceId: "",
    userId: "",
    includeOperational: false,
  };

  for (let index = command ? 1 : 0; index < rest.length; index += 1) {
    const token = rest[index];
    switch (token) {
      case "--workspace-id":
        args.workspaceId = rest[index + 1] ?? "";
        index += 1;
        break;
      case "--input":
        args.inputPath = rest[index + 1] ?? "";
        index += 1;
        break;
      case "--output":
        args.outputPath = rest[index + 1] ?? "";
        index += 1;
        break;
      case "--target-workspace-id":
        args.targetWorkspaceId = rest[index + 1] ?? "";
        index += 1;
        break;
      case "--user-id":
        args.userId = rest[index + 1] ?? "";
        index += 1;
        break;
      case "--include-operational":
        args.includeOperational = true;
        break;
      default:
        throw new Error(`Unknown backup argument: ${token}`);
    }
  }

  return args;
}

export function defaultBackupPath({ workspaceId, timestamp, rootDir = REPO_ROOT }) {
  const safeWorkspaceId = workspaceId.replace(/[^a-zA-Z0-9_-]/g, "-") || "workspace";
  const safeTimestamp = timestamp.replace(/[:.]/g, "-");
  return path.join(rootDir, "backups", `flowholt-backup-${safeWorkspaceId}-${safeTimestamp}.json`);
}

export function normalizeRowsForRestore(section, rows, options) {
  return rows.map((row) => {
    const nextRow = { ...row };

    if (options.targetWorkspaceId) {
      if (section.key === "workspaces") {
        nextRow.id = options.targetWorkspaceId;
      }
      if (Object.prototype.hasOwnProperty.call(nextRow, "workspace_id")) {
        nextRow.workspace_id = options.targetWorkspaceId;
      }
    }

    if (options.userId) {
      for (const field of USER_REFERENCE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(nextRow, field) && nextRow[field] !== null) {
          nextRow[field] = options.userId;
        }
      }
    }

    if (section.generatedIdentity) {
      delete nextRow.id;
    }

    return nextRow;
  });
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function createAdminClient() {
  const url = resolveSupabaseUrl(process.env);
  const key = resolveServiceRoleKey(process.env);

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
  }
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function fetchWorkspaceRows(supabase, section, workspaceId) {
  const rows = [];
  let start = 0;

  while (true) {
    let query = supabase
      .from(section.table)
      .select("*")
      .eq(section.filterColumn, workspaceId)
      .range(start, start + PAGE_SIZE - 1);

    if (section.orderColumn) {
      query = query.order(section.orderColumn, { ascending: true });
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`${section.table}: ${error.message}`);
    }

    const page = Array.isArray(data) ? data : [];
    rows.push(...page);

    if (page.length < PAGE_SIZE) {
      break;
    }

    start += PAGE_SIZE;
  }

  return rows;
}

async function createBackupSnapshot({ workspaceId, includeOperational }) {
  const supabase = createAdminClient();
  const sections = getBackupSections(includeOperational);
  const snapshot = {
    backup_version: 1,
    created_at: new Date().toISOString(),
    workspace_id: workspaceId,
    include_operational: includeOperational,
    sections: {},
    counts: {},
  };

  for (const section of sections) {
    const rows = await fetchWorkspaceRows(supabase, section, workspaceId);
    snapshot.sections[section.key] = rows;
    snapshot.counts[section.key] = rows.length;
  }

  return snapshot;
}

async function writeBackupFile(snapshot, outputPath) {
  const resolved = outputPath || defaultBackupPath({ workspaceId: snapshot.workspace_id, timestamp: snapshot.created_at });
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(snapshot, null, 2));
  return resolved;
}

async function restoreSnapshot({ inputPath, targetWorkspaceId, userId, includeOperational }) {
  if (!inputPath) {
    throw new Error("Provide --input with a backup JSON path.");
  }

  const raw = fs.readFileSync(path.resolve(inputPath), "utf8");
  const snapshot = JSON.parse(raw);
  const sourceWorkspaceId = typeof snapshot.workspace_id === "string" ? snapshot.workspace_id : "";
  if (!sourceWorkspaceId) {
    throw new Error("Backup file is missing workspace_id.");
  }

  const supabase = createAdminClient();
  const sections = getBackupSections(Boolean(includeOperational)).filter(
    (section) => Array.isArray(snapshot.sections?.[section.key]) && (includeOperational || !section.operational),
  );

  const workspaceIdToUse = targetWorkspaceId || sourceWorkspaceId;
  const restoreSummary = [];

  for (const section of sections) {
    const rows = normalizeRowsForRestore(section, snapshot.sections[section.key], {
      sourceWorkspaceId,
      targetWorkspaceId: workspaceIdToUse,
      userId,
    });

    if (!rows.length) {
      restoreSummary.push({ key: section.key, count: 0 });
      continue;
    }

    const chunks = chunk(rows, section.writeMode === "insert" ? INSERT_BATCH_SIZE : UPSERT_BATCH_SIZE);
    for (const batch of chunks) {
      if (section.writeMode === "upsert") {
        const { error } = await supabase
          .from(section.table)
          .upsert(batch, { onConflict: section.conflict });
        if (error) {
          throw new Error(`${section.table}: ${error.message}`);
        }
      } else {
        const { error } = await supabase.from(section.table).insert(batch);
        if (error) {
          throw new Error(`${section.table}: ${error.message}`);
        }
      }
    }

    restoreSummary.push({ key: section.key, count: rows.length });
  }

  return {
    workspaceId: workspaceIdToUse,
    sourceWorkspaceId,
    restored: restoreSummary,
  };
}

async function main() {
  const args = parseBackupArgs(process.argv);

  if (args.command === "create") {
    if (!args.workspaceId) {
      throw new Error("Provide --workspace-id to create a backup.");
    }

    const snapshot = await createBackupSnapshot({
      workspaceId: args.workspaceId,
      includeOperational: args.includeOperational,
    });
    const outputPath = await writeBackupFile(snapshot, args.outputPath);
    console.log(`[flowholt:backup] Backup written to ${outputPath}`);
    console.log(`[flowholt:backup] Sections saved: ${Object.keys(snapshot.counts).length}`);
    for (const [key, count] of Object.entries(snapshot.counts)) {
      console.log(`  - ${key}: ${count}`);
    }
    return;
  }

  if (args.command === "restore") {
    const result = await restoreSnapshot({
      inputPath: args.inputPath,
      targetWorkspaceId: args.targetWorkspaceId,
      userId: args.userId,
      includeOperational: args.includeOperational,
    });

    console.log(`[flowholt:backup] Restore completed for workspace ${result.workspaceId}`);
    if (result.workspaceId !== result.sourceWorkspaceId) {
      console.log(`[flowholt:backup] Source workspace ${result.sourceWorkspaceId} was restored into ${result.workspaceId}`);
    }
    for (const entry of result.restored) {
      console.log(`  - ${entry.key}: ${entry.count}`);
    }
    return;
  }

  throw new Error("Use `create` or `restore`. Example: npm run backup:create -- --workspace-id your-workspace-id");
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH;
if (isEntrypoint) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : "Backup command failed.";
    console.error(`[flowholt:backup] ${message}`);
    process.exitCode = 1;
  });
}
