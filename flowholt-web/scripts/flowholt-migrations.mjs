import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(SCRIPT_PATH);
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");
const DEFAULT_MIGRATIONS_DIR = path.join(REPO_ROOT, "supabase", "migrations");
const TRACKING_TABLE = "flowholt_schema_migrations";

export function parseMigrationFilename(filename) {
  const match = /^(\d{8}_\d{4})_(.+)\.sql$/i.exec(path.basename(filename));
  if (!match) {
    return null;
  }

  return {
    version: match[1],
    name: match[2],
    filename: path.basename(filename),
  };
}

export function sortMigrationEntries(entries) {
  return [...entries].sort((left, right) => left.version.localeCompare(right.version));
}

export function buildMigrationPlan(localMigrations, appliedVersions) {
  const sortedLocal = sortMigrationEntries(localMigrations);
  const appliedSet = new Set(appliedVersions);

  return {
    pending: sortedLocal.filter((entry) => !appliedSet.has(entry.version)),
    appliedLocal: sortedLocal.filter((entry) => appliedSet.has(entry.version)),
    unknownAppliedVersions: [...appliedSet]
      .filter((version) => !sortedLocal.some((entry) => entry.version === version))
      .sort((left, right) => left.localeCompare(right)),
  };
}

export function resolveDatabaseUrl(env = process.env) {
  const candidates = [env.FLOWHOLT_DATABASE_URL, env.SUPABASE_DB_URL, env.DATABASE_URL];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }
  return "";
}

function resolvePsqlCommand(env = process.env) {
  const configured = typeof env.FLOWHOLT_PSQL_PATH === "string" ? env.FLOWHOLT_PSQL_PATH.trim() : "";
  return configured || "psql";
}

function readLocalMigrations(migrationsDir) {
  const filenames = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".sql"))
    .map((entry) => entry.name);

  return sortMigrationEntries(
    filenames
      .map((filename) => {
        const parsed = parseMigrationFilename(filename);
        if (!parsed) {
          return null;
        }

        return {
          ...parsed,
          fullPath: path.join(migrationsDir, filename),
        };
      })
      .filter(Boolean),
  );
}

function runPsql({ databaseUrl, psqlCommand, sql, filePath, captureOutput = true }) {
  const args = ["-d", databaseUrl, "-v", "ON_ERROR_STOP=1"];
  if (sql) {
    args.push("-c", sql);
  }
  if (filePath) {
    args.push("-f", filePath);
  }
  if (captureOutput) {
    args.push("-t", "-A");
  }

  const result = spawnSync(psqlCommand, args, {
    encoding: "utf8",
    stdio: captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (result.error) {
    const hint = psqlCommand === "psql"
      ? "Install the PostgreSQL client or set FLOWHOLT_PSQL_PATH to your psql executable."
      : `Check FLOWHOLT_PSQL_PATH: ${psqlCommand}`;
    throw new Error(`Unable to run psql. ${hint}`);
  }

  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || "psql command failed.").trim();
    throw new Error(details);
  }

  return (result.stdout || "").trim();
}

function ensureTrackingTable(databaseUrl, psqlCommand) {
  runPsql({
    databaseUrl,
    psqlCommand,
    sql: `create table if not exists public.${TRACKING_TABLE} (version text primary key, name text not null, applied_at timestamptz not null default now());`,
  });
}

function readAppliedVersions(databaseUrl, psqlCommand) {
  const output = runPsql({
    databaseUrl,
    psqlCommand,
    sql: `select version from public.${TRACKING_TABLE} order by version asc;`,
  });

  if (!output) {
    return [];
  }

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function escapeSqlLiteral(value) {
  return value.replace(/'/g, "''");
}

function applyMigration(databaseUrl, psqlCommand, migration) {
  const migrationSql = fs.readFileSync(migration.fullPath, "utf8");
  const wrappedSql = [
    "begin;",
    migrationSql.trim(),
    `insert into public.${TRACKING_TABLE} (version, name) values ('${escapeSqlLiteral(migration.version)}', '${escapeSqlLiteral(migration.name)}') on conflict (version) do nothing;`,
    "commit;",
    "",
  ].join("\n\n");

  const tempPath = path.join(os.tmpdir(), `flowholt-migration-${migration.version}.sql`);
  fs.writeFileSync(tempPath, wrappedSql, "utf8");

  try {
    runPsql({
      databaseUrl,
      psqlCommand,
      filePath: tempPath,
      captureOutput: false,
    });
  } finally {
    fs.rmSync(tempPath, { force: true });
  }
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  return {
    apply: args.has("--apply"),
    status: args.has("--status") || !args.has("--apply"),
  };
}

function printStatus(plan, migrationsDir) {
  console.log(`[flowholt:migrations] Migrations directory: ${migrationsDir}`);
  console.log(`[flowholt:migrations] Applied local migrations: ${plan.appliedLocal.length}`);
  console.log(`[flowholt:migrations] Pending local migrations: ${plan.pending.length}`);

  if (plan.unknownAppliedVersions.length) {
    console.log("[flowholt:migrations] Applied in DB but missing locally:");
    for (const version of plan.unknownAppliedVersions) {
      console.log(`  - ${version}`);
    }
  }

  if (!plan.pending.length) {
    console.log("[flowholt:migrations] No pending migrations.");
    return;
  }

  console.log("[flowholt:migrations] Pending migrations:");
  for (const migration of plan.pending) {
    console.log(`  - ${migration.version} ${migration.name}`);
  }
}

function main() {
  const args = parseArgs(process.argv);
  const databaseUrl = resolveDatabaseUrl(process.env);
  const psqlCommand = resolvePsqlCommand(process.env);
  const migrationsDir = DEFAULT_MIGRATIONS_DIR;

  if (!databaseUrl) {
    throw new Error("Set FLOWHOLT_DATABASE_URL, SUPABASE_DB_URL, or DATABASE_URL before running the migration runner.");
  }

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const localMigrations = readLocalMigrations(migrationsDir);
  if (!localMigrations.length) {
    throw new Error("No local SQL migrations were found.");
  }

  ensureTrackingTable(databaseUrl, psqlCommand);
  const appliedVersions = readAppliedVersions(databaseUrl, psqlCommand);
  const plan = buildMigrationPlan(localMigrations, appliedVersions);

  if (args.status) {
    printStatus(plan, migrationsDir);
  }

  if (!args.apply) {
    return;
  }

  if (!plan.pending.length) {
    console.log("[flowholt:migrations] Nothing to apply.");
    return;
  }

  console.log(`[flowholt:migrations] Applying ${plan.pending.length} migration(s)...`);
  for (const migration of plan.pending) {
    console.log(`[flowholt:migrations] Applying ${migration.version} ${migration.name}`);
    applyMigration(databaseUrl, psqlCommand, migration);
  }
  console.log("[flowholt:migrations] All pending migrations applied.");
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH;

if (isEntrypoint) {
  try {
    main();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Migration runner failed.";
    console.error(`[flowholt:migrations] ${message}`);
    process.exitCode = 1;
  }
}
