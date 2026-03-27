import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMigrationPlan,
  parseMigrationFilename,
  resolveDatabaseUrl,
  sortMigrationEntries,
} from '../../scripts/flowholt-migrations.mjs';

test('parseMigrationFilename extracts version and name from valid files', () => {
  assert.deepEqual(parseMigrationFilename('20260327_0016_workflow_schedule_patterns.sql'), {
    version: '20260327_0016',
    name: 'workflow_schedule_patterns',
    filename: '20260327_0016_workflow_schedule_patterns.sql',
  });
  assert.equal(parseMigrationFilename('notes.txt'), null);
});

test('sortMigrationEntries keeps migrations in version order', () => {
  const sorted = sortMigrationEntries([
    { version: '20260327_0016', name: 'c' },
    { version: '20260325_0001', name: 'a' },
    { version: '20260326_0004', name: 'b' },
  ]);

  assert.deepEqual(sorted.map((entry) => entry.version), [
    '20260325_0001',
    '20260326_0004',
    '20260327_0016',
  ]);
});

test('buildMigrationPlan separates pending, applied, and unknown database versions', () => {
  const plan = buildMigrationPlan(
    [
      { version: '20260325_0001', name: 'flowholt_core' },
      { version: '20260326_0002', name: 'integration_connections' },
      { version: '20260327_0016', name: 'workflow_schedule_patterns' },
    ],
    ['20260325_0001', '20260327_0009'],
  );

  assert.deepEqual(plan.appliedLocal.map((entry) => entry.version), ['20260325_0001']);
  assert.deepEqual(plan.pending.map((entry) => entry.version), [
    '20260326_0002',
    '20260327_0016',
  ]);
  assert.deepEqual(plan.unknownAppliedVersions, ['20260327_0009']);
});

test('resolveDatabaseUrl prefers FlowHolt-specific envs before generic DATABASE_URL', () => {
  assert.equal(
    resolveDatabaseUrl({
      FLOWHOLT_DATABASE_URL: 'postgres://flowholt-db',
      SUPABASE_DB_URL: 'postgres://supabase-db',
      DATABASE_URL: 'postgres://generic-db',
    }),
    'postgres://flowholt-db',
  );

  assert.equal(
    resolveDatabaseUrl({
      FLOWHOLT_DATABASE_URL: '   ',
      SUPABASE_DB_URL: 'postgres://supabase-db',
      DATABASE_URL: 'postgres://generic-db',
    }),
    'postgres://supabase-db',
  );

  assert.equal(resolveDatabaseUrl({}), '');
});
