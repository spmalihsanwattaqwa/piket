export type DayOfWeek = 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU';

export type AttendanceStatus = 'belum' | 'hadir' | 'tidak_hadir';

export interface ScheduleItem {
  id: string;
  teacher: string;
  subject: string;
  className: string;
  day: DayOfWeek;
  period: number; // 1 to 6
}

export interface AttendanceRecord {
  id: string; // `${date}_${scheduleId}`
  date: string; // YYYY-MM-DD
  scheduleId: string;
  teacher: string;
  subject: string;
  className: string;
  day: DayOfWeek;
  period: number;
  status: AttendanceStatus;
  reason?: string; // Sakit, Izin, Alpa, Terlambat, dll
  substituteTeacher?: string; // Guru Pengganti / Badil
  note?: string;
  updatedAt: string;
  piketName?: string;
}

export interface PeriodConfig {
  period: number;
  name: string;
  startTime: string; // "07:15"
  endTime: string; // "08:00"
  isBreak?: boolean;
}

export interface CustomAttendanceEntry {
  id: string;
  date: string;
  period: number;
  teacher: string;
  subject: string;
  className: string;
  status: AttendanceStatus;
  note: string;
  updatedAt: string;
}

export type LockedClassTarget = 'semua' | 'banin' | 'banat';

export interface LockedEvent {
  id: string;
  date: string; // YYYY-MM-DD
  activity: string; // Nama kegiatan
  targetClasses: LockedClassTarget; // 'semua' | 'banin' | 'banat'
  createdAt: string;
}

export interface PiketDutyRecord {
  id: string;
  day: DayOfWeek | 'SEMUA'; // Hari piket: SENIN, SELASA, RABU, KAMIS, JUMAT, SABTU, SEMUA
  teacherName: string;
  startTime: string; // "07:00"
  endTime: string; // "12:15"
  note?: string;
  createdAt: string;
}


