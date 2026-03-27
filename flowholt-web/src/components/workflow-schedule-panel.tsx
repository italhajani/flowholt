"use client";

import { useMemo, useState } from "react";

import type { WorkflowScheduleRecord } from "@/lib/flowholt/types";

type WorkflowSchedulePanelProps = {
  workflowId: string;
  workflowName: string;
  initialSchedules: WorkflowScheduleRecord[];
};

type ScheduleMode = "interval" | "daily" | "weekdays";

const intervalPresets = [
  { label: "15 min", value: 15 },
  { label: "1 hour", value: 60 },
  { label: "6 hours", value: 360 },
  { label: "1 day", value: 1440 },
  { label: "1 week", value: 10080 },
];

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sortSchedules(schedules: WorkflowScheduleRecord[]) {
  return [...schedules].sort(
    (left, right) => new Date(left.next_run_at).getTime() - new Date(right.next_run_at).getTime(),
  );
}

function intervalLabel(minutes: number) {
  if (minutes % 10080 === 0) {
    const weeks = minutes / 10080;
    return weeks === 1 ? "Every week" : `Every ${weeks} weeks`;
  }

  if (minutes % 1440 === 0) {
    const days = minutes / 1440;
    return days === 1 ? "Every day" : `Every ${days} days`;
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? "Every hour" : `Every ${hours} hours`;
  }

  return minutes === 1 ? "Every minute" : `Every ${minutes} minutes`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readScheduleMode(pattern: unknown): ScheduleMode {
  const record = asRecord(pattern);
  const kind = typeof record.kind === "string" ? record.kind.trim().toLowerCase() : "interval";
  if (kind === "daily") {
    return "daily";
  }
  if (kind === "weekdays") {
    return "weekdays";
  }
  return "interval";
}

function formatLocalTimeFromUtcParts(hour: number, minute: number) {
  return new Date(Date.UTC(2026, 0, 1, hour, minute, 0, 0)).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function schedulePatternLabel(schedule: WorkflowScheduleRecord) {
  const pattern = asRecord(schedule.pattern);
  const mode = readScheduleMode(pattern);

  if (mode === "daily") {
    return `Every day at ${formatLocalTimeFromUtcParts(Number(pattern.hour) || 0, Number(pattern.minute) || 0)}`;
  }

  if (mode === "weekdays") {
    const days = Array.isArray(pattern.days)
      ? pattern.days.map((value) => Number(value)).filter((value) => Number.isFinite(value))
      : [1, 2, 3, 4, 5];
    const label = days.length === 5 && days.join(",") === "1,2,3,4,5"
      ? "Weekdays"
      : days.map((day) => weekdayLabels[Math.min(6, Math.max(0, Math.floor(day)))]) .join(", ");
    return `${label} at ${formatLocalTimeFromUtcParts(Number(pattern.hour) || 0, Number(pattern.minute) || 0)}`;
  }

  return intervalLabel(schedule.interval_minutes);
}

function formatLocalDateTime(value: string | null) {
  if (!value) {
    return "Not scheduled yet";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleString();
}

function toDateTimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const shifted = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
}

function defaultNextRunAt() {
  return toDateTimeLocalValue(new Date(Date.now() + 5 * 60 * 1000).toISOString());
}

function readError(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const value = (payload as { error?: unknown }).error;
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function buildPattern(scheduleMode: ScheduleMode, nextRunAt: string, intervalMinutes: number) {
  const parsed = nextRunAt ? new Date(nextRunAt) : new Date();
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const hour = safeDate.getUTCHours();
  const minute = safeDate.getUTCMinutes();

  if (scheduleMode === "daily") {
    return {
      kind: "daily",
      hour,
      minute,
    };
  }

  if (scheduleMode === "weekdays") {
    return {
      kind: "weekdays",
      hour,
      minute,
      days: [1, 2, 3, 4, 5],
    };
  }

  return {
    kind: "interval",
    intervalMinutes,
  };
}

export function WorkflowSchedulePanel({
  workflowId,
  workflowName,
  initialSchedules,
}: WorkflowSchedulePanelProps) {
  const [schedules, setSchedules] = useState<WorkflowScheduleRecord[]>(() => sortSchedules(initialSchedules));
  const [label, setLabel] = useState(`${workflowName} schedule`);
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("interval");
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [nextRunAt, setNextRunAt] = useState(defaultNextRunAt);
  const [busyAction, setBusyAction] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const activeCount = useMemo(
    () => schedules.filter((schedule) => schedule.status === "active").length,
    [schedules],
  );

  async function refreshSchedules() {
    setBusyAction("refresh");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/schedules?workflowId=${workflowId}`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => ({}))) as {
        schedules?: WorkflowScheduleRecord[];
      };

      if (!response.ok) {
        throw new Error(readError(payload, "Unable to load schedules."));
      }

      setSchedules(sortSchedules(Array.isArray(payload.schedules) ? payload.schedules : []));
      setSuccessMessage("Schedules refreshed.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load schedules.");
    } finally {
      setBusyAction("");
    }
  }

  async function createSchedule() {
    setBusyAction("create");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workflowId,
          label: label.trim() || `${workflowName} schedule`,
          intervalMinutes,
          pattern: buildPattern(scheduleMode, nextRunAt, intervalMinutes),
          nextRunAt: nextRunAt ? new Date(nextRunAt).toISOString() : undefined,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        schedule?: WorkflowScheduleRecord;
      };

      if (!response.ok || !payload.schedule) {
        throw new Error(readError(payload, "Unable to create schedule."));
      }

      setSchedules((current) => sortSchedules([payload.schedule!, ...current]));
      setSuccessMessage("Automatic run schedule created.");
      setLabel(`${workflowName} schedule`);
      setScheduleMode("interval");
      setIntervalMinutes(60);
      setNextRunAt(defaultNextRunAt());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create schedule.");
    } finally {
      setBusyAction("");
    }
  }

  async function updateSchedule(
    scheduleId: string,
    patch: Record<string, unknown>,
    actionLabel: string,
  ) {
    setBusyAction(`${actionLabel}:${scheduleId}`);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patch),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        schedule?: WorkflowScheduleRecord;
      };

      if (!response.ok || !payload.schedule) {
        throw new Error(readError(payload, "Unable to update schedule."));
      }

      setSchedules((current) =>
        sortSchedules(
          current.map((schedule) =>
            schedule.id === scheduleId ? payload.schedule! : schedule,
          ),
        ),
      );
      setSuccessMessage("Schedule updated.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update schedule.");
    } finally {
      setBusyAction("");
    }
  }

  async function deleteSchedule(scheduleId: string) {
    setBusyAction(`delete:${scheduleId}`);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(readError(payload, "Unable to delete schedule."));
      }

      setSchedules((current) => current.filter((schedule) => schedule.id !== scheduleId));
      setSuccessMessage("Schedule removed.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete schedule.");
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="space-y-4 text-sm text-stone-700">
      <div className="rounded-2xl bg-white/80 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {activeCount} active
          </span>
          <span className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
            {schedules.length} total
          </span>
          <button
            type="button"
            onClick={() => void refreshSchedules()}
            disabled={Boolean(busyAction)}
            className="rounded-full border border-stone-900/10 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500 transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
          >
            Refresh
          </button>
        </div>
        <p className="mt-3 leading-6 text-stone-600">
          Turn this on when you want FlowHolt to run this workflow automatically, without clicking the Run button each time.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl bg-white/80 px-4 py-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Schedule name</label>
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            placeholder={`${workflowName} schedule`}
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">Schedule preset</label>
          <div className="flex flex-wrap gap-2">
            {([
              { label: "Custom interval", value: "interval" },
              { label: "Daily", value: "daily" },
              { label: "Weekdays", value: "weekdays" },
            ] as Array<{ label: string; value: ScheduleMode }>).map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setScheduleMode(preset.value)}
                className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                  scheduleMode === preset.value
                    ? "bg-stone-900 text-white"
                    : "border border-stone-900/10 bg-white text-stone-600 hover:bg-stone-50"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {scheduleMode === "interval" ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">Run every</label>
            <div className="flex flex-wrap gap-2">
              {intervalPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setIntervalMinutes(preset.value)}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition ${
                    intervalMinutes === preset.value
                      ? "bg-stone-900 text-white"
                      : "border border-stone-900/10 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <input
                type="number"
                min={1}
                max={10080}
                value={String(intervalMinutes)}
                onChange={(event) => setIntervalMinutes(Math.min(10080, Math.max(1, Number(event.target.value) || 1)))}
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
              />
              <p className="mt-2 text-xs leading-5 text-stone-500">
                {intervalLabel(intervalMinutes)}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-stone-50 px-4 py-3 text-xs leading-6 text-stone-600">
            {scheduleMode === "daily"
              ? "After the first run time below, FlowHolt will keep running every day at that same time."
              : "After the first run time below, FlowHolt will keep running on weekdays at that same time."}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">First run time</label>
          <input
            type="datetime-local"
            value={nextRunAt}
            onChange={(event) => setNextRunAt(event.target.value)}
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 text-sm outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => void createSchedule()}
          disabled={Boolean(busyAction)}
          className="rounded-full bg-[#ff7f5f] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#f26f4d] disabled:cursor-wait disabled:opacity-60"
        >
          {busyAction === "create" ? "Creating..." : "Create automatic schedule"}
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl bg-[#f7ede2] px-4 py-3 text-sm text-amber-950">{errorMessage}</div>
      ) : null}
      {successMessage ? (
        <div className="rounded-2xl bg-[#eef4ef] px-4 py-3 text-sm text-emerald-900">{successMessage}</div>
      ) : null}

      <div className="space-y-3">
        {schedules.length ? (
          schedules.map((schedule) => {
            const isActive = schedule.status === "active";
            const isPaused = schedule.status === "paused";
            const toggleAction = isActive ? "pause" : "resume";
            const toggleBusy = busyAction === `${toggleAction}:${schedule.id}`;
            const deleteBusy = busyAction === `delete:${schedule.id}`;

            return (
              <div key={schedule.id} className="rounded-2xl bg-white/80 px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{schedule.label}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-400">
                      {schedule.status} | {schedulePatternLabel(schedule)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void updateSchedule(
                          schedule.id,
                          { status: isActive ? "paused" : "active" },
                          toggleAction,
                        )
                      }
                      disabled={Boolean(busyAction)}
                      className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      {toggleBusy ? `${isActive ? "Pausing" : "Resuming"}...` : isActive ? "Pause" : "Resume"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void updateSchedule(
                          schedule.id,
                          { nextRunAt: new Date().toISOString() },
                          "run-now",
                        )
                      }
                      disabled={Boolean(busyAction) || isPaused}
                      className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      {busyAction === `run-now:${schedule.id}` ? "Updating..." : "Run soon"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteSchedule(schedule.id)}
                      disabled={Boolean(busyAction)}
                      className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
                    >
                      {deleteBusy ? "Removing..." : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm leading-6 text-stone-600 md:grid-cols-2">
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Next run</p>
                    <p className="mt-2 text-stone-900">{formatLocalDateTime(schedule.next_run_at)}</p>
                  </div>
                  <div className="rounded-2xl bg-stone-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">Last run</p>
                    <p className="mt-2 text-stone-900">{formatLocalDateTime(schedule.last_run_at)}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {schedule.last_run_status ? `Last status: ${schedule.last_run_status}` : "No runs yet"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-stone-50 px-4 py-3 text-sm leading-6 text-stone-600">
                  <p>Total automatic runs: {schedule.run_count}</p>
                  <p>{isPaused ? "This schedule is paused right now." : "This schedule is ready to queue future runs."}</p>
                  {schedule.last_error ? (
                    <p className="mt-2 text-amber-800">Last error: {schedule.last_error}</p>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl bg-white/80 px-4 py-4 text-sm leading-6 text-stone-500">
            No automatic schedules yet. Create one above if you want this workflow to run on its own.
          </div>
        )}
      </div>
    </div>
  );
}