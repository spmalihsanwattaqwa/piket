/**
 * Utility functions for reliable time calculation and period comparison
 * Handles both colon format (22:00) and dot format (22.00)
 */

export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(/\./g, ':');
  const parts = clean.split(':');
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export function isTimePastOrEqual(currentTimeStr: string, targetTimeStr: string): boolean {
  return timeStringToMinutes(currentTimeStr) >= timeStringToMinutes(targetTimeStr);
}

export function isTimeInPeriod(currentTimeStr: string, startTimeStr: string, endTimeStr: string): boolean {
  const current = timeStringToMinutes(currentTimeStr);
  const start = timeStringToMinutes(startTimeStr);
  const end = timeStringToMinutes(endTimeStr);
  return current >= start && current <= end;
}

export function formatCurrentTime(date: Date = new Date()): { timeStr: string; hmStr: string } {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return {
    timeStr: `${h}:${m}:${s}`,
    hmStr: `${h}:${m}`,
  };
}
