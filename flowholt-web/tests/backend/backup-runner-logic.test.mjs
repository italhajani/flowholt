import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';

import {
  BACKUP_SECTIONS,
  defaultBackupPath,
  getBackupSections,
  normalizeRowsForRestore,
  parseBackupArgs,
  resolveServiceRoleKey,
  resolveSupabaseUrl,
} from '../../scripts/flowholt-backup.mjs';

test('getBackupSections excludes operational history by default', () => {
  const core = getBackupSections(false);
  const full = getBackupSections(true);

  assert.equal(core.some((section) => section.key === 'workflow_runs'), false);
  assert.equal(full.some((section) => section.key === 'workflow_runs'), true);
  assert.equal(full.length > core.length, true);
  assert.equal(full.length, BACKUP_SECTIONS.length);
});

test('parseBackupArgs reads create and restore flags safely', () => {
  assert.deepEqual(
    parseBackupArgs(['node', 'script', 'create', '--workspace-id', 'ws_1', '--include-operational']),
    {
      command: 'create',
      workspaceId: 'ws_1',
      inputPath: '',
      outputPath: '',
      targetWorkspaceId: '',
      userId: '',
      includeOperational: true,
    },
  );

  assert.deepEqual(
    parseBackupArgs(['node', 'script', 'restore', '--input', 'backup.json', '--target-workspace-id', 'ws_2', '--user-id', 'user_1']),
    {
      command: 'restore',
      workspaceId: '',
      inputPath: 'backup.json',
      outputPath: '',
      targetWorkspaceId: 'ws_2',
      userId: 'user_1',
      includeOperational: false,
    },
  );
});

test('defaultBackupPath creates a stable workspace backup filename', () => {
  const backupPath = defaultBackupPath({
    workspaceId: 'ws_demo',
    timestamp: '2026-03-27T18:22:33.123Z',
    rootDir: '/repo',
  });

  assert.equal(
    backupPath,
    path.join('/repo', 'backups', 'flowholt-backup-ws_demo-2026-03-27T18-22-33-123Z.json'),
  );
});

test('normalizeRowsForRestore remaps workspace and user ids and strips generated identities', () => {
  const section = {
    key: 'workspace_audit_logs',
    generatedIdentity: true,
  };

  const rows = normalizeRowsForRestore(section, [
    {
      id: 42,
      workspace_id: 'ws_source',
      actor_user_id: 'user_old',
      target_id: 'workflow_1',
    },
  ], {
    sourceWorkspaceId: 'ws_source',
    targetWorkspaceId: 'ws_target',
    userId: 'user_new',
  });

  assert.deepEqual(rows, [
    {
      workspace_id: 'ws_target',
      actor_user_id: 'user_new',
      target_id: 'workflow_1',
    },
  ]);
});

test('resolveSupabaseUrl and resolveServiceRoleKey read env values safely', () => {
  assert.equal(resolveSupabaseUrl({ NEXT_PUBLIC_SUPABASE_URL: 'https://demo.supabase.co' }), 'https://demo.supabase.co');
  assert.equal(resolveSupabaseUrl({ SUPABASE_URL: 'https://server.supabase.co' }), 'https://server.supabase.co');
  assert.equal(resolveSupabaseUrl({}), '');

  assert.equal(resolveServiceRoleKey({ SUPABASE_SERVICE_ROLE_KEY: 'secret' }), 'secret');
  assert.equal(resolveServiceRoleKey({}), '');
});
