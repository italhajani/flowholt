-- 20260327_0016_workflow_schedule_patterns.sql
-- Adds schedule pattern metadata so FlowHolt can support daily and weekday presets.

alter table public.workflow_schedules
  add column if not exists pattern jsonb not null default '{}'::jsonb;