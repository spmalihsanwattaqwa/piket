import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDocs,
  getCountFromServer,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AttendanceRecord, LockedEvent, PiketDutyRecord, PeriodConfig, BellSchedulePreset, BellSettingsConfig } from '../types/schedule';
import { DEFAULT_BELL_CONFIG, DEFAULT_BELL_PRESETS, DEFAULT_PERIODS } from '../data/scheduleData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory testConnection function as per skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is disconnected.');
    }
  }
}
testConnection();

// ==========================================
// REAL-TIME FIRESTORE SUBSCRIPTIONS
// ==========================================

export function subscribeAttendanceForDate(
  date: string,
  onUpdate: (records: Record<string, AttendanceRecord>) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const collRef = collection(db, 'attendance_records');
  const q = query(collRef, where('date', '==', date));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: Record<string, AttendanceRecord> = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as AttendanceRecord;
        records[data.scheduleId] = data;
      });
      onUpdate(records);
    },
    (error) => {
      console.error(`Error subscribing to attendance for date ${date}:`, error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `attendance_records?date=${date}`);
    }
  );
}

export function subscribeLockedEvents(
  onUpdate: (events: LockedEvent[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const collRef = collection(db, 'locked_events');

  return onSnapshot(
    collRef,
    (snapshot) => {
      const events: LockedEvent[] = [];
      snapshot.forEach((docSnap) => {
        events.push(docSnap.data() as LockedEvent);
      });
      // Sort newest first
      events.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(events);
    },
    (error) => {
      console.error('Error subscribing to locked events:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'locked_events');
    }
  );
}

export function subscribePiketDuties(
  onUpdate: (duties: PiketDutyRecord[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const collRef = collection(db, 'piket_duties');

  return onSnapshot(
    collRef,
    (snapshot) => {
      const duties: PiketDutyRecord[] = [];
      snapshot.forEach((docSnap) => {
        duties.push(docSnap.data() as PiketDutyRecord);
      });
      onUpdate(duties);
    },
    (error) => {
      console.error('Error subscribing to piket duties:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'piket_duties');
    }
  );
}

// REAL-TIME FIRESTORE SYNC: JAM PELAJARAN (PERIODS CONFIG)
export function subscribePeriodsConfig(
  onUpdate: (periods: PeriodConfig[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docRef = doc(db, 'app_settings', 'periods_config');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.periods) && data.periods.length > 0) {
          onUpdate(data.periods as PeriodConfig[]);
        } else {
          onUpdate([]);
        }
      } else {
        onUpdate([]);
      }
    },
    (error) => {
      console.warn('Error subscribing to periods config:', error);
      if (onError) onError(error);
    }
  );
}

// REAL-TIME FIRESTORE SYNC: MULTI-PRESET BEL & PENGATURAN WAKTU
export function subscribeBellSettings(
  onUpdate: (config: BellSettingsConfig, activePeriods: PeriodConfig[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docRef = doc(db, 'app_settings', 'periods_config');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let bellConfig: BellSettingsConfig = DEFAULT_BELL_CONFIG;
        if (data.bellConfig && typeof data.bellConfig === 'object') {
          bellConfig = {
            activePresetId: data.bellConfig.activePresetId || 'auto',
            autoFridaySwitch: data.bellConfig.autoFridaySwitch ?? true,
            presets: data.bellConfig.presets || DEFAULT_BELL_PRESETS,
          };
        } else if (Array.isArray(data.periods) && data.periods.length > 0) {
          bellConfig = {
            ...DEFAULT_BELL_CONFIG,
            presets: {
              ...DEFAULT_BELL_PRESETS,
              reguler: {
                ...DEFAULT_BELL_PRESETS.reguler,
                periods: data.periods,
              },
            },
          };
        }

        const activePeriods = Array.isArray(data.periods) && data.periods.length > 0
          ? (data.periods as PeriodConfig[])
          : bellConfig.presets.reguler?.periods || DEFAULT_PERIODS;

        onUpdate(bellConfig, activePeriods);
      } else {
        onUpdate(DEFAULT_BELL_CONFIG, DEFAULT_PERIODS);
      }
    },
    (error) => {
      console.warn('Error subscribing to bell settings:', error);
      if (onError) onError(error);
    }
  );
}

// REAL-TIME FIRESTORE SYNC: KUNCI JAM KBM
export function subscribeStrictTeachingHours(
  onUpdate: (strict: boolean) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docRef = doc(db, 'app_settings', 'kbm_lock');

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.strict === 'boolean') {
          onUpdate(data.strict);
        }
      }
    },
    (error) => {
      console.warn('Error subscribing to strict teaching hours:', error);
      if (onError) onError(error);
    }
  );
}

// ==========================================
// FIRESTORE WRITE / UPDATE / DELETE
// ==========================================

export async function saveAttendanceToFirestore(record: AttendanceRecord): Promise<void> {
  const docRef = doc(db, 'attendance_records', record.id);
  try {
    // Sanitize record to only include defined properties
    const cleanRecord: Record<string, any> = {
      id: record.id,
      date: record.date,
      scheduleId: record.scheduleId,
      teacher: record.teacher || '-',
      subject: record.subject || '-',
      className: record.className || '-',
      day: record.day,
      period: Number(record.period),
      status: record.status,
      updatedAt: record.updatedAt || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    if (record.reason) cleanRecord.reason = record.reason;
    if (record.substituteTeacher) cleanRecord.substituteTeacher = record.substituteTeacher;
    if (record.note) cleanRecord.note = record.note;
    if (record.piketName) cleanRecord.piketName = record.piketName;

    await setDoc(docRef, cleanRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `attendance_records/${record.id}`);
  }
}

export async function saveLockedEventToFirestore(event: LockedEvent): Promise<void> {
  const docRef = doc(db, 'locked_events', event.id);
  try {
    const cleanEvent = {
      id: event.id,
      date: event.date,
      activity: event.activity,
      targetClasses: event.targetClasses,
      createdAt: event.createdAt || new Date().toISOString(),
    };
    await setDoc(docRef, cleanEvent);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `locked_events/${event.id}`);
  }
}

export async function deleteLockedEventFromFirestore(eventId: string): Promise<void> {
  const docRef = doc(db, 'locked_events', eventId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `locked_events/${eventId}`);
  }
}

export async function savePiketDutyToFirestore(duty: PiketDutyRecord): Promise<void> {
  const docRef = doc(db, 'piket_duties', duty.id);
  try {
    const cleanDuty: Record<string, any> = {
      id: duty.id,
      teacherName: duty.teacherName,
      startTime: duty.startTime,
      endTime: duty.endTime,
      day: duty.day,
      createdAt: duty.createdAt || new Date().toISOString(),
    };
    if (duty.note) cleanDuty.note = duty.note;
    await setDoc(docRef, cleanDuty);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `piket_duties/${duty.id}`);
  }
}

export async function deletePiketDutyFromFirestore(dutyId: string): Promise<void> {
  const docRef = doc(db, 'piket_duties', dutyId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `piket_duties/${dutyId}`);
  }
}

export async function resetAttendanceForDateInFirestore(
  date: string,
  records: AttendanceRecord[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    records.forEach((rec) => {
      const docRef = doc(db, 'attendance_records', rec.id);
      batch.delete(docRef);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `attendance_records?date=${date}`);
  }
}

export async function fetchAttendanceForDateRange(
  startDate: string,
  endDate: string
): Promise<AttendanceRecord[]> {
  try {
    const collRef = collection(db, 'attendance_records');
    // Query by date range
    const q = query(
      collRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    const snap = await getDocs(q);
    const results: AttendanceRecord[] = [];
    snap.forEach((d) => {
      results.push(d.data() as AttendanceRecord);
    });
    // Sort by date ascending, then period ascending, then className
    results.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.period !== b.period) return a.period - b.period;
      return a.className.localeCompare(b.className);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `attendance_records?range=${startDate}_${endDate}`);
    return [];
  }
}

export async function deleteAllAttendanceFromFirestore(): Promise<number> {
  try {
    const collRef = collection(db, 'attendance_records');
    const snap = await getDocs(collRef);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach((d) => {
      batch.delete(d.ref);
      count++;
    });
    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'attendance_records/all');
    return 0;
  }
}

export async function savePeriodsConfigToFirestore(periods: PeriodConfig[]): Promise<void> {
  const docRef = doc(db, 'app_settings', 'periods_config');
  try {
    await setDoc(
      docRef,
      {
        id: 'periods_config',
        periods,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed to save periods config to cloud:', error);
  }
}

export async function saveBellSettingsToFirestore(
  bellConfig: BellSettingsConfig,
  activePeriods: PeriodConfig[]
): Promise<void> {
  const docRef = doc(db, 'app_settings', 'periods_config');
  try {
    await setDoc(docRef, {
      id: 'periods_config',
      periods: activePeriods,
      bellConfig,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to save bell settings to cloud:', error);
  }
}

export async function saveStrictTeachingHoursToFirestore(strict: boolean): Promise<void> {
  const docRef = doc(db, 'app_settings', 'kbm_lock');
  try {
    await setDoc(docRef, {
      id: 'kbm_lock',
      strict,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to save strict teaching hours to cloud:', error);
  }
}

export interface FirestoreCapacityInfo {
  attendanceCount: number;
  lockedEventsCount: number;
  piketDutiesCount: number;
  settingsCount: number;
  totalDocuments: number;
  estimatedBytesUsed: number;
  estimatedKbUsed: number;
  estimatedMbUsed: number;
  quotaMb: number; // 1024 MB (1 GB Free Tier)
  usedPercentage: number;
  estimatedRemainingRecords: number;
  lastChecked: string;
}

export async function fetchFirestoreCapacityStats(): Promise<FirestoreCapacityInfo> {
  try {
    // Count documents across collections
    const [attSnap, lockSnap, dutySnap, setSnap] = await Promise.all([
      getCountFromServer(collection(db, 'attendance_records')).catch(() => ({ data: () => ({ count: 0 }) })),
      getCountFromServer(collection(db, 'locked_events')).catch(() => ({ data: () => ({ count: 0 }) })),
      getCountFromServer(collection(db, 'piket_duties')).catch(() => ({ data: () => ({ count: 0 }) })),
      getCountFromServer(collection(db, 'app_settings')).catch(() => ({ data: () => ({ count: 0 }) })),
    ]);

    const attendanceCount = attSnap.data().count || 0;
    const lockedEventsCount = lockSnap.data().count || 0;
    const piketDutiesCount = dutySnap.data().count || 0;
    const settingsCount = setSnap.data().count || 0;

    const totalDocuments = attendanceCount + lockedEventsCount + piketDutiesCount + settingsCount;

    // Approximate size in bytes per document:
    // Attendance record: ~350 bytes (plus index overhead ~150 bytes = ~500 bytes)
    // Locked event: ~250 bytes
    // Piket duty: ~250 bytes
    // App settings: ~1200 bytes
    const estimatedBytesUsed =
      attendanceCount * 500 +
      lockedEventsCount * 300 +
      piketDutiesCount * 300 +
      settingsCount * 1500 +
      10240; // Base metadata

    const estimatedKbUsed = Math.max(1, Math.round(estimatedBytesUsed / 1024));
    const estimatedMbUsed = Number((estimatedBytesUsed / (1024 * 1024)).toFixed(3));
    const quotaMb = 1024; // 1 GB free quota in Firebase Spark Plan
    const usedPercentage = Number(((estimatedMbUsed / quotaMb) * 100).toFixed(4));

    // Approximate how many more attendance records could fit in remaining quota
    const remainingBytes = Math.max(0, quotaMb * 1024 * 1024 - estimatedBytesUsed);
    const estimatedRemainingRecords = Math.floor(remainingBytes / 500);

    return {
      attendanceCount,
      lockedEventsCount,
      piketDutiesCount,
      settingsCount,
      totalDocuments,
      estimatedBytesUsed,
      estimatedKbUsed,
      estimatedMbUsed,
      quotaMb,
      usedPercentage,
      estimatedRemainingRecords,
      lastChecked: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  } catch (error) {
    console.error('Error calculating Firestore capacity:', error);
    return {
      attendanceCount: 0,
      lockedEventsCount: 0,
      piketDutiesCount: 0,
      settingsCount: 0,
      totalDocuments: 0,
      estimatedBytesUsed: 0,
      estimatedKbUsed: 0,
      estimatedMbUsed: 0,
      quotaMb: 1024,
      usedPercentage: 0,
      estimatedRemainingRecords: 2000000,
      lastChecked: new Date().toLocaleTimeString('id-ID'),
    };
  }
}



