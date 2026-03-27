# Backup and Restore Quickstart

This adds a real workspace backup and restore flow for FlowHolt.

## What this means

You can now export your FlowHolt workspace data into one backup JSON file, and later restore it if needed.

This is useful for:

- disaster recovery
- copying a workspace into another environment
- saving important automation configuration before risky changes

## Important safety note

The backup can include integration secrets so it can be used for real recovery.
Treat the backup file like a password file and store it safely.

## Setup

In `flowholt-web/.env.local` or your deploy environment, make sure you have:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Create a backup

From `flowholt-web`:

```bash
npm run backup:create -- --workspace-id your-workspace-id
```

If you also want run history, logs, jobs, and audit data:

```bash
npm run backup:create -- --workspace-id your-workspace-id --include-operational
```

This writes a JSON file into the repo `backups/` folder.

## Restore a backup

Restore into the same workspace id:

```bash
npm run backup:restore -- --input ../backups/your-backup-file.json
```

Restore into another workspace id:

```bash
npm run backup:restore -- --input ../backups/your-backup-file.json --target-workspace-id your-new-workspace-id
```

If user ids are different in the target environment, remap them:

```bash
npm run backup:restore -- --input ../backups/your-backup-file.json --target-workspace-id your-new-workspace-id --user-id your-auth-user-id
```

If you also want to restore operational history:

```bash
npm run backup:restore -- --input ../backups/your-backup-file.json --include-operational
```

## How to see output

This step is mainly terminal output.

You will see:

- where the backup file was written
- how many rows were saved per table
- which sections were restored
- the final workspace id used for restore

After restore, open your app normally and check:

- `/app/dashboard`
- `/app/workflows`
- `/app/settings`

## Easy meaning

- backup = save your FlowHolt workspace data to one file
- restore = bring that file back into FlowHolt later
- operational history = runs, logs, jobs, and audit-style history, which is optional because it is noisier than core product data
