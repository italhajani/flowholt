export function toIntervalMinutes(value: unknown, fallback = 60) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const intValue = Math.floor(parsed);
  return Math.min(10080, Math.max(1, intValue));
}

export function nextRunAtFrom(baseTime: Date, intervalMinutes: number) {
  return new Date(baseTime.getTime() + intervalMinutes * 60_000).toISOString();
}

export function isScheduleClaimable(lockUntil: string | null | undefined, now: Date) {
  if (!lockUntil) {
    return true;
  }

  return new Date(lockUntil).getTime() <= now.getTime();
}
