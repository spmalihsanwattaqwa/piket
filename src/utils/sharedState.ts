import { AttendanceRecord, LockedEvent, PeriodConfig, PiketDutyRecord } from '../types/schedule';
import { DEFAULT_WEBHOOK_URL, generatePayloadFromRecords } from './sheetSync';

export interface SharedAppState {
  periods: PeriodConfig[] | null;
  lockedEvents: LockedEvent[];
  piketDuties: PiketDutyRecord[];
  adminPassword: string;
  attendance: Record<string, Record<string, AttendanceRecord>>; // date -> (recordId -> record)
}

/**
 * Fetch the shared application state from the server database
 */
export async function fetchSharedState(): Promise<SharedAppState | null> {
  try {
    const res = await fetch('/api/state', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return {
          periods: data.periods || null,
          lockedEvents: data.lockedEvents || [],
          piketDuties: data.piketDuties || [],
          adminPassword: data.adminPassword || 'adminalwa',
          attendance: data.attendance || {},
        };
      }
    }
  } catch {
    // Network / offline fallback
  }
  return null;
}

export interface SaveStatePatch {
  attendanceByDate?: Record<string, Record<string, AttendanceRecord>>;
  periods?: PeriodConfig[];
  lockedEvents?: LockedEvent[];
  piketDuties?: PiketDutyRecord[];
  adminPassword?: string;
  syncToWebhook?: Record<string, unknown>;
}

/**
 * Save state updates to the shared server database and Google Sheets
 */
export async function saveSharedState(patch: SaveStatePatch): Promise<boolean> {
  try {
    const res = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Helper to build Google Sheets sync payload from attendance records
 */
export function buildSheetsWebhookPayload(
  date: string,
  records: AttendanceRecord[],
  periods: PeriodConfig[]
) {
  return generatePayloadFromRecords(date, records, periods, DEFAULT_WEBHOOK_URL);
}
