import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AttendanceRecord,
  AttendanceStatus,
  DayOfWeek,
  LockedEvent,
  PeriodConfig,
  PiketDutyRecord,
  ScheduleItem,
  BellSettingsConfig,
} from './types/schedule';
import {
  FULL_SCHEDULE,
  DEFAULT_PERIODS,
  GOOGLE_SHEET_INFO,
  getDayNameFromDate,
  getClassRank,
  DEFAULT_BELL_CONFIG,
  DEFAULT_BELL_PRESETS,
} from './data/scheduleData';
import { PeriodColumn } from './components/PeriodColumn';
import { DesktopScheduleGrid } from './components/DesktopScheduleGrid';
import { AttendanceModal } from './components/AttendanceModal';
import { LainLainModal } from './components/LainLainModal';
import { SyncSheetModal } from './components/SyncSheetModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { CalendarPickerModal } from './components/CalendarPickerModal';
import { WeeklyStatsModal } from './components/WeeklyStatsModal';
import { PdfExportModal } from './components/PdfExportModal';
import { DeleteAttendanceModal } from './components/DeleteAttendanceModal';
import { FirestoreCapacityModal } from './components/FirestoreCapacityModal';
import { sendPeriodNotification } from './utils/notifications';
import { formatCurrentTime, isTimePastOrEqual, isTimeInPeriod } from './utils/timeUtils';
import {
  subscribeAttendanceForDate,
  subscribeLockedEvents,
  subscribePiketDuties,
  subscribePeriodsConfig,
  subscribeBellSettings,
  savePeriodsConfigToFirestore,
  saveBellSettingsToFirestore,
  subscribeStrictTeachingHours,
  saveStrictTeachingHoursToFirestore,
  saveAttendanceToFirestore,
  saveLockedEventToFirestore,
  deleteLockedEventFromFirestore,
  savePiketDutyToFirestore,
  deletePiketDutyFromFirestore,
  resetAttendanceForDateInFirestore,
  deleteAllAttendanceFromFirestore,
} from './utils/firebase';
import { isMobileApp } from './utils/deviceUtils';
import {
  Calendar,
  Clock,
  Search,
  FileSpreadsheet,
  Bell,
  PlusCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  AlertTriangle,
  RotateCcw,
  LogOut,
  Shield,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Smartphone,
  Zap,
  Sun,
  Moon,
  CalendarCheck,
  TrendingUp,
  BarChart3,
  LayoutGrid,
  Columns,
  Cloud,
  CloudOff,
  RefreshCw,
  Printer,
  Trash2,
  MoreVertical,
  SlidersHorizontal,
  Database,
} from 'lucide-react';

const SCHOOL_LOGO_URL = 'https://iili.io/nYcZGTv.jpg';
const SCHOOL_LOGO_FALLBACK = '/logo.jpg';

export default function App() {
  // Mobile / HP detection
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileApp());

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(isMobileApp());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Current date (YYYY-MM-DD)
  const getTodayStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Theme: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return localStorage.getItem('piket_theme') === 'light' ? 'light' : 'dark';
  });
  const isLightMode = theme === 'light';

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('piket_theme', next);
  };

  // Background Theme Variations:
  // Light Mode: 'slate' (1. Abu Netral) | 'ivory' (2. Krem Hangat)
  // Dark Mode: 'midnight' (1. Midnight Navy) | 'oled' (2. Hitam Pekat)
  const [lightBg, setLightBg] = useState<'slate' | 'ivory'>(() => {
    return (localStorage.getItem('piket_light_bg') as 'slate' | 'ivory') || 'slate';
  });
  const [darkBg, setDarkBg] = useState<'midnight' | 'oled'>(() => {
    return (localStorage.getItem('piket_dark_bg') as 'midnight' | 'oled') || 'midnight';
  });

  const changeLightBg = (val: 'slate' | 'ivory') => {
    setLightBg(val);
    localStorage.setItem('piket_light_bg', val);
  };

  const changeDarkBg = (val: 'midnight' | 'oled') => {
    setDarkBg(val);
    localStorage.setItem('piket_dark_bg', val);
  };

  // Dynamic Theme Background CSS Classes
  const appBgClass = isLightMode
    ? lightBg === 'ivory'
      ? 'bg-[#f5f0e6] text-[#2c2722] selection:bg-amber-200 selection:text-amber-900'
      : 'bg-slate-100 text-slate-800 selection:bg-blue-200 selection:text-blue-900'
    : darkBg === 'oled'
    ? 'bg-black text-slate-100 selection:bg-blue-600 selection:text-white'
    : 'bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white';

  const headerBgClass = isLightMode
    ? lightBg === 'ivory'
      ? 'bg-[#fffdf9]/95 border-[#ded3c2] text-slate-900 shadow-xs'
      : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
    : darkBg === 'oled'
    ? 'bg-[#0d0d0d]/95 border-[#222222] text-slate-100 shadow-md'
    : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-md';

  const piketPanelBgClass = isLightMode
    ? lightBg === 'ivory'
      ? 'bg-[#fbf7ee]/90 border-[#e5dac8] text-[#3d3326]'
      : 'bg-blue-50/90 border-blue-200 text-blue-950'
    : darkBg === 'oled'
    ? 'bg-[#0d0d0d]/95 border-[#222222] text-neutral-200'
    : 'bg-slate-900/95 border-slate-800 text-blue-100';

  const filterBarBgClass = isLightMode
    ? lightBg === 'ivory'
      ? 'bg-[#fffdf9] border-[#ded3c2]'
      : 'bg-white border-slate-200 shadow-xs'
    : darkBg === 'oled'
    ? 'bg-[#0e0e0e] border-[#222222] shadow-sm'
    : 'bg-slate-900 border-slate-800 shadow-sm';

  const loginCardBgClass = isLightMode
    ? lightBg === 'ivory'
      ? 'bg-[#fffdfa] border-[#ded3c2]'
      : 'bg-white border-slate-200'
    : darkBg === 'oled'
    ? 'bg-[#0d0d0d] border-[#222222]'
    : 'bg-slate-900 border-slate-800';

  // Role Authentication: admin (adminalwa) or user (piket)
  // MANDATORY REQUIREMENT: Pastikan aplikasi yang terpasang di HP HANYA role user!
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(() => {
    if (isMobileApp()) {
      return 'user'; // HP is strictly locked to role user
    }
    const saved = localStorage.getItem('piket_auth_role');
    return saved === 'admin' || saved === 'user' ? saved : null;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Strict enforcement: if opened on mobile / HP, ALWAYS ensure role is 'user'
  useEffect(() => {
    if (isMobile) {
      if (userRole !== 'user') {
        setUserRole('user');
      }
      localStorage.setItem('piket_auth_role', 'user');
    }
  }, [isMobile, userRole]);

  // Cloud sync status indicator
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [periods, setPeriods] = useState<PeriodConfig[]>(() => {
    const saved = localStorage.getItem('piket_periods_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PERIODS;
  });

  const [bellConfig, setBellConfig] = useState<BellSettingsConfig>(() => {
    const saved = localStorage.getItem('piket_bell_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_BELL_CONFIG;
  });

  // Strict teaching hours requirement ("input harus manual satu-satu dan harus di jam mengajar")
  const [strictTeachingHours, setStrictTeachingHours] = useState<boolean>(true);
  const [lockWarningToast, setLockWarningToast] = useState<string | null>(null);

  // Notifications & Sound settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('piket_sound_enabled') !== 'false';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('piket_notifications_enabled') === 'true';
  });

  // =========================================================
  // DROPDOWN FILTERS (SEBARIS): JAM, KELAS (BANIN/BANAT), STATUS
  // =========================================================
  const [periodFilter, setPeriodFilter] = useState<number | 'all'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'banin' | 'banat'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all'); // all | belum | hadir | tidak_hadir
  const [filterTeacher, setFilterTeacher] = useState<string>('');

  // Current time & active period
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentPeriodNumber, setCurrentPeriodNumber] = useState<number | null>(null);

  // Modals
  const [activeModalItem, setActiveModalItem] = useState<{
    item: ScheduleItem;
    record?: AttendanceRecord;
  } | null>(null);
  const [isLainLainOpen, setIsLainLainOpen] = useState(false);
  const [isSyncSheetOpen, setIsSyncSheetOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isWeeklyStatsOpen, setIsWeeklyStatsOpen] = useState(false);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);
  const [isDeleteAttendanceOpen, setIsDeleteAttendanceOpen] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);

  // Dropdown menu state for clean, compact header
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMenuOpen]);

  // Auto-open install dialog if opened via ?install=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('install') === '1' || params.get('install') === 'auto') {
      setIsPWAInstallOpen(true);
    }
  }, []);

  // Desktop layout view mode: 'matrix' (Jam atas ke bawah, kelas kiri ke kanan) or 'column'
  const [desktopViewMode, setDesktopViewMode] = useState<'matrix' | 'column'>('matrix');

  // Last notified period tracker
  const lastNotifiedPeriodRef = useRef<string | null>(null);

  // Attendance Records mapped by scheduleId
  const [recordsMap, setRecordsMap] = useState<Record<string, AttendanceRecord>>({});

  // Custom (Lain-Lain) items for selected date
  const [customItems, setCustomItems] = useState<ScheduleItem[]>([]);

  // =========================================================
  // REAL-TIME FIRESTORE SYNC: MULTI-PRESET BEL & JAM PELAJARAN
  // SINKRONISASI 100% ANTARA HP & KOMPUTER
  // =========================================================
  useEffect(() => {
    const unsubscribe = subscribeBellSettings(
      (remoteConfig, remoteActivePeriods) => {
        if (remoteConfig) {
          setBellConfig(remoteConfig);
          localStorage.setItem('piket_bell_config', JSON.stringify(remoteConfig));
        }
        if (remoteActivePeriods && remoteActivePeriods.length > 0) {
          setPeriods(remoteActivePeriods);
          localStorage.setItem('piket_periods_config', JSON.stringify(remoteActivePeriods));
        }
      },
      (error) => {
        console.warn('Real-time sync bell config offline fallback:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Save bell & periods config to Firestore so all HP and PC update immediately
  const handleSavePeriods = async (newPeriods: PeriodConfig[], newBellConfig?: BellSettingsConfig) => {
    setPeriods(newPeriods);
    localStorage.setItem('piket_periods_config', JSON.stringify(newPeriods));

    const finalConfig = newBellConfig || bellConfig;
    if (newBellConfig) {
      setBellConfig(newBellConfig);
      localStorage.setItem('piket_bell_config', JSON.stringify(newBellConfig));
    }

    try {
      setCloudSyncStatus('syncing');
      await saveBellSettingsToFirestore(finalConfig, newPeriods);
      setCloudSyncStatus('synced');
      setLastSyncTime(
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.error('Failed to save bell settings to cloud:', err);
    }
  };

  // REAL-TIME FIRESTORE SYNC: KUNCI JAM KBM (BEBAS / KUNCI)
  useEffect(() => {
    const unsubscribe = subscribeStrictTeachingHours(
      (strict) => {
        setStrictTeachingHours(strict);
      },
      (error) => {
        console.warn('Real-time sync strict hours error:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleToggleStrictTeachingHours = async () => {
    const next = !strictTeachingHours;
    setStrictTeachingHours(next);
    try {
      await saveStrictTeachingHoursToFirestore(next);
    } catch (err) {
      console.error('Failed to save strict hours to cloud:', err);
    }
  };

  // =========================================================
  // REAL-TIME FIRESTORE SYNC: LOCKED EVENTS (AGENDA KUNCI)
  // =========================================================
  const [lockedEvents, setLockedEvents] = useState<LockedEvent[]>(() => {
    const saved = localStorage.getItem('piket_locked_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  useEffect(() => {
    const unsubscribe = subscribeLockedEvents(
      (remoteEvents) => {
        setLockedEvents(remoteEvents);
        localStorage.setItem('piket_locked_events', JSON.stringify(remoteEvents));
      },
      (error) => {
        console.warn('Real-time sync locked events offline fallback:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAddLockedEvent = async (eventData: Omit<LockedEvent, 'id' | 'createdAt'>) => {
    const newEvent: LockedEvent = {
      ...eventData,
      id: `lock_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEvent, ...lockedEvents];
    setLockedEvents(updated);
    localStorage.setItem('piket_locked_events', JSON.stringify(updated));

    try {
      setCloudSyncStatus('syncing');
      await saveLockedEventToFirestore(newEvent);
      setCloudSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync locked event to cloud:', err);
    }
  };

  const handleDeleteLockedEvent = async (id: string) => {
    const updated = lockedEvents.filter((e) => e.id !== id);
    setLockedEvents(updated);
    localStorage.setItem('piket_locked_events', JSON.stringify(updated));

    try {
      setCloudSyncStatus('syncing');
      await deleteLockedEventFromFirestore(id);
      setCloudSyncStatus('synced');
    } catch (err) {
      console.error('Failed to delete locked event from cloud:', err);
    }
  };

  const handleLockedActivityClick = (item: ScheduleItem, event: LockedEvent) => {
    setLockWarningToast(`🔒 Kelas ${item.className} dikunci kegiatan "${event.activity}". Absen KBM reguler dinonaktifkan.`);
    setTimeout(() => setLockWarningToast(null), 4000);
  };

  // =========================================================
  // REAL-TIME FIRESTORE SYNC: DATA PETUGAS PIKET
  // =========================================================
  const [piketDuties, setPiketDuties] = useState<PiketDutyRecord[]>(() => {
    const saved = localStorage.getItem('piket_duties');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'duty_sample_1',
        teacherName: 'GUS HAMAM YUSRON,S.Sy',
        startTime: '07:00',
        endTime: '12:15',
        day: 'SEMUA',
        note: 'Piket Harian KBM',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    const unsubscribe = subscribePiketDuties(
      (remoteDuties) => {
        if (remoteDuties && remoteDuties.length > 0) {
          setPiketDuties(remoteDuties);
          localStorage.setItem('piket_duties', JSON.stringify(remoteDuties));
        } else {
          // If remote is empty initially, seed default to Firestore
          const defaultDuty: PiketDutyRecord = {
            id: 'duty_sample_1',
            teacherName: 'GUS HAMAM YUSRON,S.Sy',
            startTime: '07:00',
            endTime: '12:15',
            day: 'SEMUA',
            note: 'Piket Harian KBM',
            createdAt: new Date().toISOString(),
          };
          savePiketDutyToFirestore(defaultDuty).catch(console.error);
        }
      },
      (error) => {
        console.warn('Real-time sync piket duties offline fallback:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleAddPiketDuty = async (dutyData: Omit<PiketDutyRecord, 'id' | 'createdAt'>) => {
    const newDuty: PiketDutyRecord = {
      ...dutyData,
      id: `duty_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newDuty, ...piketDuties];
    setPiketDuties(updated);
    localStorage.setItem('piket_duties', JSON.stringify(updated));

    try {
      setCloudSyncStatus('syncing');
      await savePiketDutyToFirestore(newDuty);
      setCloudSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync piket duty to cloud:', err);
    }
  };

  const handleDeletePiketDuty = async (id: string) => {
    const updated = piketDuties.filter((d) => d.id !== id);
    setPiketDuties(updated);
    localStorage.setItem('piket_duties', JSON.stringify(updated));

    try {
      setCloudSyncStatus('syncing');
      await deletePiketDutyFromFirestore(id);
      setCloudSyncStatus('synced');
    } catch (err) {
      console.error('Failed to delete piket duty from cloud:', err);
    }
  };

  // Day of week derived from selectedDate
  const currentDay: DayOfWeek | null = useMemo(() => {
    return getDayNameFromDate(selectedDate);
  }, [selectedDate]);

  // Guru Piket di Jam Aktif yang tampil di layar berdasarkan HARI KBM
  const activePiketTeachers = useMemo(() => {
    const nowHM = currentTime.slice(0, 5); // "08:15"
    if (!nowHM) return [];
    return piketDuties.filter((duty) => {
      if (duty.day && duty.day !== 'SEMUA' && duty.day !== currentDay) return false;
      return nowHM >= duty.startTime && nowHM <= duty.endTime;
    });
  }, [piketDuties, currentTime, currentDay]);

  // Guru piket terjadwal untuk hari ini
  const todayDuties = useMemo(() => {
    return piketDuties.filter((d) => d.day === 'SEMUA' || d.day === currentDay);
  }, [piketDuties, currentDay]);

  // =========================================================
  // REAL-TIME FIRESTORE SYNC: DATA ABSENSI 100% SAMA ANTAR PERANGKAT
  // =========================================================
  useEffect(() => {
    setCloudSyncStatus('syncing');

    // Subscribe to Firestore for real-time 2-way sync across all devices
    const unsubscribe = subscribeAttendanceForDate(
      selectedDate,
      (remoteRecords) => {
        setRecordsMap(remoteRecords);

        // Derive custom items from remote records
        const customs: ScheduleItem[] = Object.values(remoteRecords)
          .filter((rec) => rec.scheduleId.startsWith('custom_'))
          .map((rec) => ({
            id: rec.scheduleId,
            teacher: rec.teacher,
            subject: rec.subject,
            className: rec.className,
            day: rec.day,
            period: rec.period,
          }));
        setCustomItems(customs);

        // Update local cache
        const storageKey = `piket_attendance_${selectedDate}`;
        localStorage.setItem(storageKey, JSON.stringify(remoteRecords));

        setCloudSyncStatus('synced');
        setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      },
      (error) => {
        console.warn('Real-time sync falling back to local storage:', error);
        setCloudSyncStatus('offline');
        const storageKey = `piket_attendance_${selectedDate}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setRecordsMap(parsed);
          } catch {
            // ignore
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [selectedDate]);

  // Save records locally and push to Firestore
  const saveRecordsToStorage = (newMap: Record<string, AttendanceRecord>) => {
    setRecordsMap(newMap);
    const storageKey = `piket_attendance_${selectedDate}`;
    localStorage.setItem(storageKey, JSON.stringify(newMap));
  };

  // All schedules for current day, including custom items
  const daySchedule = useMemo(() => {
    if (!currentDay) return [];
    const regular = FULL_SCHEDULE.filter((s) => s.day === currentDay);
    return [...regular, ...customItems];
  }, [currentDay, customItems]);

  // Filtered schedule based on gender (Banin/Banat), Teacher, Status
  const filteredSchedule = useMemo(() => {
    return daySchedule.filter((item) => {
      // Banin: kelas mengandung huruf A
      if (genderFilter === 'banin' && !item.className.toUpperCase().includes('A')) {
        return false;
      }
      // Banat: kelas mengandung huruf B
      if (genderFilter === 'banat' && !item.className.toUpperCase().includes('B')) {
        return false;
      }
      if (filterTeacher && !item.teacher.toLowerCase().includes(filterTeacher.toLowerCase())) {
        return false;
      }
      if (filterStatus !== 'all') {
        const status = recordsMap[item.id]?.status || 'belum';
        if (status !== filterStatus) {
          return false;
        }
      }
      return true;
    });
  }, [daySchedule, genderFilter, filterTeacher, filterStatus, recordsMap]);

  // Periods to display based on periodFilter
  const periodsToRender = useMemo(() => {
    if (periodFilter === 'all') return periods;
    return periods.filter((p) => p.period === periodFilter);
  }, [periods, periodFilter]);

  // Overall Statistics for selected date
  const stats = useMemo(() => {
    const total = daySchedule.length;
    let hadir = 0;
    let tidakHadir = 0;

    daySchedule.forEach((item) => {
      const st = recordsMap[item.id]?.status || 'belum';
      if (st === 'hadir') hadir++;
      else if (st === 'tidak_hadir') tidakHadir++;
    });

    const belum = total - hadir - tidakHadir;
    const percentage = total > 0 ? Math.round((hadir / total) * 100) : 0;

    return { total, hadir, tidakHadir, belum, percentage };
  }, [daySchedule, recordsMap]);

  // Clock & Period Checker (Every second)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const { timeStr, hmStr } = formatCurrentTime(now);
      setCurrentTime(timeStr);

      // Check current active period reliably
      const active = periods.find((p) => {
        return isTimeInPeriod(hmStr, p.startTime, p.endTime);
      });
      setCurrentPeriodNumber(active ? active.period : null);

      // Automated period notification trigger:
      const startingPeriod = periods.find((p) => !p.isBreak && p.startTime === hmStr);
      if (startingPeriod) {
        const notificationKey = `${selectedDate}_p${startingPeriod.period}_${startingPeriod.startTime}`;
        if (lastNotifiedPeriodRef.current !== notificationKey) {
          lastNotifiedPeriodRef.current = notificationKey;

          const itemsInStarting = daySchedule.filter((s) => s.period === startingPeriod.period);
          const unrecordedCount = itemsInStarting.filter(
            (s) => !recordsMap[s.id] || recordsMap[s.id].status === 'belum'
          ).length;

          if (notificationsEnabled || soundEnabled) {
            sendPeriodNotification(startingPeriod.name, unrecordedCount);
          }
        }
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [periods, selectedDate, daySchedule, recordsMap, soundEnabled, notificationsEnabled]);

  // Handle Login with HP / Mobile Role Lockdown
  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pass = passwordInput.trim();

    if (isMobile && (pass === 'adminalwa' || pass.toLowerCase().includes('admin'))) {
      setLoginError('Aplikasi pada perangkat HP dikhususkan hanya untuk Role Petugas Piket (User). Akses Admin hanya diperbolehkan melalui perangkat Laptop / Komputer (Desktop).');
      return;
    }

    if (pass === 'adminalwa') {
      if (isMobile) {
        setLoginError('Akses Admin hanya diperbolehkan melalui perangkat Komputer / Laptop (Desktop).');
        return;
      }
      setUserRole('admin');
      localStorage.setItem('piket_auth_role', 'admin');
      setPasswordInput('');
      setLoginError('');
    } else if (pass === 'piket') {
      setUserRole('user');
      localStorage.setItem('piket_auth_role', 'user');
      setPasswordInput('');
      setLoginError('');
    } else {
      setLoginError('Sandi tidak sesuai. Gunakan sandi piket atau admin.');
    }
  };

  const handleQuickLogin = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      if (isMobile) {
        setLoginError('Akses Admin hanya diperbolehkan melalui perangkat Komputer / Laptop (Desktop). HP dikhususkan untuk Petugas Piket.');
        return;
      }
      setPasswordInput('adminalwa');
      setUserRole('admin');
      localStorage.setItem('piket_auth_role', 'admin');
    } else {
      setPasswordInput('piket');
      setUserRole('user');
      localStorage.setItem('piket_auth_role', 'user');
    }
    setLoginError('');
  };

  const handleLogout = () => {
    if (isMobile) {
      // HP must stay in role user
      setUserRole('user');
      localStorage.setItem('piket_auth_role', 'user');
      setLockWarningToast('Perangkat HP tetap dalam Mode Petugas Piket.');
      setTimeout(() => setLockWarningToast(null), 3000);
      return;
    }
    setUserRole(null);
    localStorage.removeItem('piket_auth_role');
  };

  // Handle click on locked card (outside teaching hours)
  const handleLockedClick = (item: ScheduleItem) => {
    const pConf = periods.find((p) => p.period === item.period);
    const timeText = pConf ? `(${pConf.startTime} - ${pConf.endTime})` : '';
    setLockWarningToast(
      `⚠️ Jam Ke-${item.period} ${timeText} belum berlangsung. Absen wajib diisi saat jam mengajar.`
    );
    setTimeout(() => setLockWarningToast(null), 4000);
  };

  // Toggle single item status (manual 1-by-1) with real-time cloud sync
  const handleToggleStatus = async (item: ScheduleItem, nextStatus: AttendanceStatus) => {
    const updated: AttendanceRecord = {
      ...(recordsMap[item.id] || {
        id: `${selectedDate}_${item.id}`,
        date: selectedDate,
        scheduleId: item.id,
        teacher: item.teacher,
        subject: item.subject,
        className: item.className,
        day: item.day,
        period: item.period,
      }),
      status: nextStatus,
      updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    // Optimistic local update
    const newMap = { ...recordsMap, [item.id]: updated };
    saveRecordsToStorage(newMap);

    // Push to Firestore so other devices immediately reflect the change
    try {
      setCloudSyncStatus('syncing');
      await saveAttendanceToFirestore(updated);
      setCloudSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to sync status to cloud:', err);
      setCloudSyncStatus('offline');
    }
  };

  // Save detail record from AttendanceModal with real-time cloud sync
  const handleSaveModalRecord = async (record: AttendanceRecord) => {
    const newMap = { ...recordsMap, [record.scheduleId]: record };
    saveRecordsToStorage(newMap);

    try {
      setCloudSyncStatus('syncing');
      await saveAttendanceToFirestore(record);
      setCloudSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to sync modal record to cloud:', err);
      setCloudSyncStatus('offline');
    }
  };

  // Add custom "Lain-Lain" attendance item with real-time cloud sync
  const handleAddCustomRecord = async (record: AttendanceRecord) => {
    const newCustomItem: ScheduleItem = {
      id: record.scheduleId,
      teacher: record.teacher,
      subject: record.subject,
      className: record.className,
      day: record.day,
      period: record.period,
    };
    setCustomItems((prev) => [...prev, newCustomItem]);
    const newMap = { ...recordsMap, [record.scheduleId]: record };
    saveRecordsToStorage(newMap);

    try {
      setCloudSyncStatus('syncing');
      await saveAttendanceToFirestore(record);
      setCloudSyncStatus('synced');
    } catch (err) {
      console.error('Failed to sync custom item to cloud:', err);
      setCloudSyncStatus('offline');
    }
  };

  // Reset all attendance for selected date (Admin only)
  const handleResetDay = async () => {
    if (window.confirm('Kosongkan semua data absensi pada tanggal ini? Data di perangkat lain juga akan otomatis ter-reset.')) {
      const recordsToDelete = Object.values(recordsMap);
      setRecordsMap({});
      setCustomItems([]);
      localStorage.removeItem(`piket_attendance_${selectedDate}`);

      try {
        setCloudSyncStatus('syncing');
        await resetAttendanceForDateInFirestore(selectedDate, recordsToDelete);
        setCloudSyncStatus('synced');
      } catch (err) {
        console.error('Failed to reset attendance in cloud:', err);
      }
    }
  };

  // Date navigation helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(getTodayStr());
  };

  // All records list for export
  const allDayRecordsList = useMemo(() => {
    return daySchedule.map((item) => {
      return (
        recordsMap[item.id] || {
          id: `${selectedDate}_${item.id}`,
          date: selectedDate,
          scheduleId: item.id,
          teacher: item.teacher,
          subject: item.subject,
          className: item.className,
          day: item.day,
          period: item.period,
          status: 'belum' as AttendanceStatus,
          updatedAt: '-',
        }
      );
    });
  }, [daySchedule, recordsMap, selectedDate]);

  // LOGIN SCREEN: If user is not authenticated yet
  if (!userRole) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-200 ${appBgClass}`}
      >
        <div
          className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 border transition-colors ${loginCardBgClass}`}
        >
          {/* Logo & School Header */}
          <div className="text-center space-y-2.5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white p-1 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
              <img
                src={SCHOOL_LOGO_URL}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = SCHOOL_LOGO_FALLBACK;
                }}
                alt="Logo SPM Al Ihsan Wat Taqwa"
                className="w-full h-full object-contain"
              />
            </div>
            <h1
              className={`text-lg font-black tracking-tight uppercase leading-snug ${
                isLightMode ? 'text-slate-900' : 'text-white'
              }`}
            >
              SPM AL IHSAN WAT TAQWA
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Sistem Absensi untuk Guru Piket
            </p>
          </div>

          {/* Theme switcher on login screen */}
          <div className="flex justify-center">
            <button
              onClick={toggleTheme}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                isLightMode
                  ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isLightMode ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mode Gelap</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Terang</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Detected Notice on Login */}
          {isMobile && (
            <div
              className={`p-2.5 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                isLightMode
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-blue-950/50 border-blue-800/80 text-blue-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[11px]">Perangkat HP Terdeteksi</p>
                <p className="text-[10px] opacity-90 leading-tight">
                  Aplikasi pada HP dikhususkan untuk <strong>Role Petugas Piket</strong>. Sinkronisasi data cloud Firestore otomatis aktif 100%.
                </p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 flex items-center gap-1.5 ${
                  isLightMode ? 'text-slate-700' : 'text-slate-300'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-500" />
                <span>Masukkan Sandi Akses:</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isMobile ? 'Ketik sandi piket...' : 'Ketik sandi piket / admin...'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors pr-10 border ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {loginError && (
                <p className="text-[11px] text-rose-500 mt-1.5 font-medium flex items-center gap-1 leading-snug">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{loginError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:translate-y-0.5 text-white font-bold text-sm border-b-2 border-blue-900 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Masuk Sistem</span>
            </button>
          </form>

          {/* Quick Login Options */}
          <div
            className={`pt-2 border-t text-center space-y-2 ${
              isLightMode ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <span className="text-[11px] text-slate-400 block">
              Pilih Peran Langsung:
            </span>
            {isMobile ? (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user')}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs ${
                    isLightMode
                      ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-900'
                      : 'bg-blue-950/70 hover:bg-blue-900/80 border-blue-600 text-blue-200'
                  }`}
                >
                  <User className="w-4 h-4 text-blue-500" />
                  <span>Masuk Sebagai Petugas Piket (Role User)</span>
                </button>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  🔒 Perangkat HP hanya untuk Role User. Akses Admin hanya lewat PC/Desktop.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('user')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isLightMode
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Piket (User)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isLightMode
                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Admin</span>
                </button>
              </div>
            )}

            {/* Install APK Piket Button on Login Screen */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsPWAInstallOpen(true)}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                  isLightMode
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-gradient-to-r from-emerald-900/60 to-blue-900/60 hover:from-emerald-800/80 hover:to-blue-800/80 border-emerald-600/50 text-emerald-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                <span>Pasang APK Piket di Layar HP</span>
              </button>
            </div>
          </div>
        </div>

        <PWAInstallModal isOpen={isPWAInstallOpen} onClose={() => setIsPWAInstallOpen(false)} />
      </div>
    );
  }

  // MAIN APPLICATION: Shown for logged-in user or admin
  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${appBgClass}`}
    >
      {/* Top Navigation & Brand Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 py-2 sm:px-6 transition-colors ${headerBgClass}`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* School Brand with Official Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={SCHOOL_LOGO_URL}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = SCHOOL_LOGO_FALLBACK;
                }}
                alt="Logo SPM Al Ihsan Wat Taqwa"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1
                  className={`text-sm sm:text-base font-black tracking-tight uppercase leading-none ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  SPM AL IHSAN WAT TAQWA
                </h1>
                {/* Role Badge: HP is strictly locked to User Role */}
                {isMobile ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 uppercase tracking-wider flex items-center gap-1 shadow-xs" title="Aplikasi pada HP terkunci khusus untuk Role Petugas Piket">
                    <Smartphone className="w-2.5 h-2.5 text-blue-500" />
                    HP: Petugas Piket
                  </span>
                ) : userRole === 'admin' ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-amber-500" />
                    Desktop Admin
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-2.5 h-2.5 text-blue-500" />
                    Piket
                  </span>
                )}
              </div>
              <p
                className={`text-[10px] font-medium ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {isMobile
                  ? 'Aplikasi HP Petugas Piket (Role User)'
                  : userRole === 'user'
                  ? 'Laman Absensi Petugas Piket'
                  : 'Laman Kelola Absensi & Integrasi Piket'}
              </p>
            </div>
          </div>

          {/* Action Buttons Pushed to the Right (Minimized & Neat) */}
          <div className="ml-auto flex items-center justify-end gap-1.5 sm:gap-2">
            {/* Merged Clock & Real-time Cloud Sync Pill (Clickable to view Capacity) */}
            <button
              type="button"
              onClick={() => setIsCapacityModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-mono shadow-xs transition-all cursor-pointer hover:ring-2 hover:ring-blue-400/40 active:translate-y-0.5 ${
                isLightMode
                  ? 'bg-slate-50 hover:bg-blue-50 border-slate-200 text-slate-700'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
              title={`Jam: ${currentTime || '--:--:--'} | Cloud Sync Firestore 100% Aktif (${lastSyncTime || 'Real-time'}). Klik untuk cek kapasitas & kuota database.`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                {currentTime || '--:--:--'}
              </span>
              <span className="text-slate-400 dark:text-slate-600">|</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                Sync 100%
              </span>
            </button>

            {/* LAIN - LAIN Button (Khusus Komputer / Desktop - Disembunyikan di versi HP) */}
            {!isMobile && (
              <button
                onClick={() => setIsLainLainOpen(true)}
                className="hidden md:flex px-2.5 sm:px-3 py-1 rounded-xl bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 active:translate-y-0.5 text-white font-black text-xs uppercase tracking-wider border-b-[2.5px] border-[#9a3412] border-t border-orange-200/50 shadow-md hover:from-orange-300 hover:to-orange-500 items-center gap-1 transition-all"
                title="Tambah Guru Pengganti (Badil) / Kunci Kegiatan / Petugas Piket"
              >
                <PlusCircle className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px]">LAIN - LAIN</span>
              </button>
            )}

            {/* Cetak PDF Per Rentang Tanggal (Print Preview) Button */}
            <button
              onClick={() => setIsPdfExportOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:translate-y-0.5 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
              title="Ekspor Laporan Absensi PDF per Rentang Tanggal (Print Preview Resmi)"
            >
              <Printer className="w-3.5 h-3.5 text-blue-100" />
              <span className="text-[11px] hidden xs:inline">Cetak PDF</span>
            </button>

            {/* Minimized Dropdown Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-1.5 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all shadow-xs ${
                  isMenuOpen
                    ? 'bg-blue-600 text-white border-blue-700'
                    : isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                }`}
                title="Menu Fitur & Pengaturan Lainnya"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="text-[11px] hidden sm:inline">Menu</span>
              </button>

              {/* Dropdown Menu Popup */}
              {isMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isLightMode
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-900 border-slate-700 text-slate-100'
                  }`}
                >
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    {isMobile ? 'Menu Aplikasi' : 'Fitur & Manajemen Piket'}
                  </div>

                  <div className="py-1 space-y-0.5">
                    {/* Statistik Mingguan (Tampil di HP & PC) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsWeeklyStatsOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                    >
                      <TrendingUp className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>Statistik Mingguan (Senin - Sabtu)</span>
                    </button>

                    {/* FITUR KHUSUS KOMPUTER / DESKTOP (Disembunyikan di versi HP) */}
                    {!isMobile && (
                      <>
                        {/* Pasang APK di HP */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsPWAInstallOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors text-emerald-700 dark:text-emerald-300"
                        >
                          <Smartphone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>Link Pasang APK di HP (Auto-Install)</span>
                        </button>

                        {/* Kapasitas Cloud Firestore */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsCapacityModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2.5 transition-colors text-indigo-700 dark:text-indigo-300"
                        >
                          <Database className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                          <span>Kapasitas Cloud Firestore</span>
                        </button>

                        {/* Hapus Semua Absen */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsDeleteAttendanceOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors text-rose-600 dark:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500 flex-shrink-0" />
                          <span>Hapus Semua Absen...</span>
                        </button>

                        {/* Atur Jam KBM & Bel (Edit Jam Pelajaran) */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsNotificationSettingsOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-amber-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                        >
                          <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>Atur Waktu Jam Pelajaran & Bel</span>
                        </button>

                        {/* Admin Only Controls inside Menu */}
                        {userRole === 'admin' && (
                          <>
                            <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                              <span className="px-3 text-[9px] font-black uppercase text-amber-500 tracking-wider">
                                Khusus Admin
                              </span>
                            </div>

                            {/* Google Sheet Sync */}
                            <button
                              type="button"
                              onClick={() => {
                                setIsSyncSheetOpen(true);
                                setIsMenuOpen(false);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors text-emerald-600 dark:text-emerald-400"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              <span>Sinkron ke Google Sheet Piket</span>
                            </button>

                            {/* Kunci Jam KBM Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                handleToggleStrictTeachingHours();
                                setIsMenuOpen(false);
                              }}
                              className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors"
                            >
                              {strictTeachingHours ? (
                                <>
                                  <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                  <span>Kunci Jam: Aktif (Di Jam Mengajar)</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <span>Kunci Jam: Nonaktif (Bebas)</span>
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1" />

                    {/* Toggle Theme (Mode Terang / Gelap - Tampil di HP & PC) */}
                    <button
                      type="button"
                      onClick={() => {
                        toggleTheme();
                      }}
                      className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {isLightMode ? (
                          <>
                            <Moon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <span>Ganti ke Mode Gelap</span>
                          </>
                        ) : (
                          <>
                            <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span>Ganti ke Mode Terang</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {isLightMode ? 'Terang' : 'Gelap'}
                      </span>
                    </button>

                    {/* 2 PILIHAN WARNA BACKGROUND SESUAI MODE (TERANG / GELAP) */}
                    <div className="mx-1 my-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Pilihan Warna Latar:</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {isLightMode ? 'Mode Terang' : 'Mode Gelap'}
                        </span>
                      </div>

                      {isLightMode ? (
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          {/* Option 1 Light: Abu Netral */}
                          <button
                            type="button"
                            onClick={() => changeLightBg('slate')}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
                              lightBg === 'slate'
                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                            title="Warna latar abu netral / klasik"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-400 flex-shrink-0"></span>
                            <span>Abu Netral</span>
                          </button>

                          {/* Option 2 Light: Krem Hangat */}
                          <button
                            type="button"
                            onClick={() => changeLightBg('ivory')}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
                              lightBg === 'ivory'
                                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                                : 'bg-[#fffdf9] hover:bg-[#f6f2e9] text-[#544633] border-[#d8cdb9]'
                            }`}
                            title="Warna latar krem lembut seperti kertas hangat"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f6f2e9] border border-amber-400 flex-shrink-0"></span>
                            <span>Krem Hangat</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                          {/* Option 1 Dark: Midnight Navy */}
                          <button
                            type="button"
                            onClick={() => changeDarkBg('midnight')}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
                              darkBg === 'midnight'
                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-700'
                            }`}
                            title="Warna latar biru malam pekat (Midnight)"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-blue-400 flex-shrink-0"></span>
                            <span>Midnight Navy</span>
                          </button>

                          {/* Option 2 Dark: Hitam Pekat */}
                          <button
                            type="button"
                            onClick={() => changeDarkBg('oled')}
                            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border flex items-center justify-center gap-1.5 transition-all ${
                              darkBg === 'oled'
                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                : 'bg-black hover:bg-neutral-900 text-neutral-300 border-neutral-700'
                            }`}
                            title="Warna hitam pekat murni (Hemat baterai OLED)"
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-black border border-neutral-500 flex-shrink-0"></span>
                            <span>Hitam Pekat</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Logout - Hanya di Desktop */}
                    {!isMobile && (
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span>Keluar / Ganti Peran</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* PANEL STATIS: NAMA GURU PIKET HARI INI                  */}
      {/* ======================================================== */}
      <div
        className={`border-b px-3 py-2 text-xs transition-colors shadow-xs ${piketPanelBgClass}`}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
            {/* Badge Label */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex-shrink-0 shadow-xs ${
                activePiketTeachers.length > 0
                  ? 'bg-emerald-600 text-white'
                  : isLightMode
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-slate-800 text-slate-300'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {activePiketTeachers.length > 0 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    activePiketTeachers.length > 0 ? 'bg-emerald-300' : 'bg-slate-400'
                  }`}
                ></span>
              </span>
              <span>
                {activePiketTeachers.length > 0
                  ? `PIKET AKTIF (${currentDay || 'HARI INI'})`
                  : `PIKET (${currentDay || 'HARI INI'})`}
              </span>
            </div>

            {/* Static List of Piket Teachers (Tidak Berjalan/Bergerak) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {activePiketTeachers.length > 0 ? (
                activePiketTeachers.map((duty) => (
                  <div
                    key={duty.id}
                    onClick={() => {
                      if (!isMobile) setIsLainLainOpen(true);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-xs transition-all ${
                      !isMobile ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isLightMode
                        ? `bg-white ${!isMobile ? 'hover:bg-emerald-50' : ''} text-slate-900 border-emerald-300`
                        : `bg-slate-800/90 ${!isMobile ? 'hover:bg-slate-750' : ''} text-white border-emerald-500/50`
                    }`}
                    title={!isMobile ? 'Klik untuk kelola data piket di menu LAIN - LAIN' : undefined}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="font-bold">{duty.teacherName}</span>
                    <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      ({duty.startTime} - {duty.endTime})
                    </span>
                    {duty.note && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        • {duty.note}
                      </span>
                    )}
                  </div>
                ))
              ) : todayDuties.length > 0 ? (
                todayDuties.map((duty) => (
                  <div
                    key={duty.id}
                    onClick={() => {
                      if (!isMobile) setIsLainLainOpen(true);
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-xs transition-all ${
                      !isMobile ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isLightMode
                        ? `bg-white ${!isMobile ? 'hover:bg-blue-50' : ''} text-slate-900 border-blue-200`
                        : `bg-slate-800/80 ${!isMobile ? 'hover:bg-slate-750' : ''} text-slate-200 border-slate-700`
                    }`}
                    title={!isMobile ? 'Klik untuk kelola data piket di menu LAIN - LAIN' : undefined}
                  >
                    <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="font-bold">{duty.teacherName}</span>
                    <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                      ({duty.startTime} - {duty.endTime})
                    </span>
                    {duty.note && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        • {duty.note}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <span
                  onClick={() => {
                    if (!isMobile) setIsLainLainOpen(true);
                  }}
                  className={`text-xs text-slate-500 dark:text-slate-400 italic ${
                    !isMobile ? 'cursor-pointer hover:underline' : 'cursor-default'
                  }`}
                  title={!isMobile ? 'Klik untuk mengatur guru piket' : undefined}
                >
                  Belum ada guru piket hari {currentDay || 'ini'}.
                  {!isMobile && ' Klik untuk menambah data piket.'}
                </span>
              )}
            </div>
          </div>

          {/* Quick link button to edit piket duties (Khusus Komputer / Desktop - Disembunyikan di versi HP) */}
          {!isMobile && (
            <button
              type="button"
              onClick={() => setIsLainLainOpen(true)}
              className={`hidden md:flex text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all items-center gap-1 flex-shrink-0 ${
                isLightMode
                  ? 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-800 hover:bg-slate-750 text-blue-300 border-slate-700'
              }`}
              title="Kelola jadwal dan nama guru piket di menu LAIN - LAIN"
            >
              <span>Kelola Piket</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2.5 sm:p-4 space-y-3">
        {/* Warning Toast if Clicked Outside Teaching Hours */}
        {lockWarningToast && (
          <div
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
              isLightMode
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-amber-500/20 border-amber-500/50 text-amber-200 shadow-md'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{lockWarningToast}</span>
            </div>
            {userRole === 'admin' && (
              <button
                onClick={() => setStrictTeachingHours(false)}
                className="ml-2 px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-[10px] hover:bg-amber-400"
              >
                Buka Kunci
              </button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* BAGIAN FILTER: TANGGAL DENGAN CALENDAR PICKER & DROPDOWN SEBARIS */}
        {/* ======================================================== */}
        <div
          className={`rounded-2xl p-2.5 sm:p-3 shadow-xs space-y-2.5 border transition-colors ${filterBarBgClass}`}
        >
          {/* Row 1: Tanggal Navigator dengan Calendar Picker Pop-up & Counters */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Date Navigator & Interactive Calendar Picker */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={handlePrevDay}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Hari Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* CALENDAR PICKER BUTTON: Click to open full month CalendarPickerModal */}
              <button
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-inner transition-all hover:scale-[1.02] active:scale-95 ${
                  isLightMode
                    ? 'bg-slate-50 hover:bg-blue-50 border-slate-300 text-slate-900 hover:border-blue-400'
                    : 'bg-slate-950 hover:bg-slate-850 border-slate-800 text-white hover:border-blue-500'
                }`}
                title="Klik untuk membuka Kalender Pemilih Tanggal"
              >
                <CalendarCheck className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold font-mono">{selectedDate}</span>
                <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">
                  (Pilih Tanggal)
                </span>
              </button>

              <button
                onClick={handleNextDay}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Hari Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSetToday}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Hari Ini
              </button>
            </div>

            {/* Current Day Badge & Counters */}
            <div className="flex items-center gap-2">
              <span
                className={`
                  px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider shadow-xs border
                  ${
                    currentDay
                      ? isLightMode
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-blue-600/30 text-blue-200 border-blue-500/50'
                      : isLightMode
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-rose-950/40 text-rose-300 border-rose-700/50'
                  }
                `}
              >
                {currentDay ? currentDay : 'AHAD (LIBUR)'}
              </span>

              {/* Active Bell Preset Indicator */}
              <span
                onClick={() => setIsNotificationSettingsOpen(true)}
                className={`cursor-pointer px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-xs border transition-all hover:scale-105 ${
                  bellConfig?.activePresetId === 'ujian'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                    : currentDay === 'JUMAT' || bellConfig?.activePresetId === 'jumat'
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                }`}
                title="Klik untuk mengatur jam bel & KBM"
              >
                {bellConfig?.activePresetId === 'ujian'
                  ? '📝 Mode Ujian'
                  : currentDay === 'JUMAT' || bellConfig?.activePresetId === 'jumat'
                  ? '🕌 Jam Jumat'
                  : '🏫 Jam Reguler'}
              </span>

              {/* Status Pill Badges Counter */}
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span
                  className={`px-2 py-0.5 rounded-md border ${
                    isLightMode
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : 'bg-blue-900/60 text-blue-300 border-blue-700/40'
                  }`}
                  title="Belum Absen (Biru)"
                >
                  🔵 {stats.belum}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md border ${
                    isLightMode
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-emerald-900/60 text-emerald-300 border-emerald-700/40'
                  }`}
                  title="Hadir (Hijau)"
                >
                  🟢 {stats.hadir}
                </span>
                {stats.tidakHadir > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-md border ${
                      isLightMode
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-amber-900/60 text-amber-300 border-amber-700/40'
                    }`}
                    title="Tidak Hadir (Kuning)"
                  >
                    🟡 {stats.tidakHadir}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] border ${
                    isLightMode
                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {stats.percentage}%
                </span>

                {/* Direct Trigger to Weekly Stats */}
                <button
                  type="button"
                  onClick={() => setIsWeeklyStatsOpen(true)}
                  className={`px-2 py-0.5 rounded-md border text-[10.5px] font-bold flex items-center gap-1 transition-all ${
                    isLightMode
                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                      : 'bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border-blue-800'
                  }`}
                  title="Buka Grafik Dashboard Statistik Mingguan (Senin-Sabtu)"
                >
                  <BarChart3 className="w-3 h-3 text-blue-500" />
                  <span className="hidden sm:inline">Statistik Mingguan</span>
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ROW 2: SEMUA FILTER FORMAT DROPDOWN SEBARIS             */}
          {/* (FILTER JAM, FILTER KELAS, FILTER STATUS, CARI GURU)    */}
          {/* ======================================================== */}
          <div
            className={`pt-2 border-t flex flex-wrap items-center gap-2 text-xs ${
              isLightMode ? 'border-slate-200' : 'border-slate-800/80'
            }`}
          >
            {/* 1. DROPDOWN FILTER JAM */}
            <div className="flex items-center gap-1">
              <select
                value={periodFilter}
                onChange={(e) =>
                  setPeriodFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer transition-colors ${
                  isLightMode
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
                title="Pilih Jam Pelajaran"
              >
                <option value="all">Semua Jam (1 - 6)</option>
                {periods
                  .filter((p) => !p.isBreak)
                  .map((p) => (
                    <option key={p.period} value={p.period}>
                      {p.name} ({p.startTime} - {p.endTime})
                    </option>
                  ))}
              </select>

              {/* Quick Jump to Active Jam button */}
              {currentPeriodNumber && currentPeriodNumber > 0 && (
                <button
                  type="button"
                  onClick={() => setPeriodFilter(currentPeriodNumber)}
                  className={`p-1.5 rounded-xl border transition-colors ${
                    periodFilter === currentPeriodNumber
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : isLightMode
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900/60'
                  }`}
                  title={`Langsung fokus ke Jam Ke-${currentPeriodNumber} yang sedang berlangsung`}
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                </button>
              )}

              {/* Shortcut to Edit Jam Pelajaran (Khusus Desktop - Disembunyikan di HP) */}
              {!isMobile && (
                <button
                  type="button"
                  onClick={() => setIsNotificationSettingsOpen(true)}
                  className={`hidden md:block p-1.5 rounded-xl border transition-colors ${
                    isLightMode
                      ? 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-300 border-slate-700'
                  }`}
                  title="Edit Waktu Jam Pelajaran (Jam Mulai & Selesai)"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                </button>
              )}
            </div>

            {/* 2. DROPDOWN FILTER KELAS (BANIN / BANAT / SEMUA) */}
            <div>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as 'all' | 'banin' | 'banat')}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer transition-colors ${
                  isLightMode
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
                title="Pilih Kategori Kelas Santri"
              >
                <option value="all">Semua Kelas (Banin & Banat)</option>
                <option value="banin">Kelas Banin (A)</option>
                <option value="banat">Kelas Banat (B)</option>
              </select>
            </div>

            {/* 3. DROPDOWN FILTER STATUS */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer transition-colors ${
                  isLightMode
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
                title="Pilih Status Kehadiran"
              >
                <option value="all">Semua Status</option>
                <option value="belum">🔵 Biru / ⚪ Abu-abu (Belum Absen)</option>
                <option value="hadir">🟢 Hijau (Hadir)</option>
                <option value="tidak_hadir">🟡 Kuning (Tidak Hadir)</option>
              </select>
            </div>

            {/* 4. SEARCH GURU */}
            <div className="flex-1 min-w-[130px] max-w-xs relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari guru..."
                value={filterTeacher}
                onChange={(e) => setFilterTeacher(e.target.value)}
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 transition-colors ${
                  isLightMode
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            {/* 5. TAMPILAN DESKTOP TOGGLE (Matriks Jam ↓ Kelas → vs Kolom) */}
            <div className="hidden md:flex items-center p-0.5 rounded-xl border text-[11px] font-semibold border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDesktopViewMode('matrix')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  desktopViewMode === 'matrix'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLightMode
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Versi Desktop: Jam dari atas ke bawah, kelas dari kiri ke kanan dari kelas terbesar"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Matriks (Jam ↓ Kelas →)</span>
              </button>
              <button
                type="button"
                onClick={() => setDesktopViewMode('column')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  desktopViewMode === 'column'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLightMode
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Kolom Per Jam"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Kolom</span>
              </button>
            </div>

            {/* Reset Day button (Admin only) */}
            {userRole === 'admin' && (
              <button
                onClick={handleResetDay}
                className={`px-2 py-1.5 rounded-xl border text-[11px] transition-colors flex items-center gap-1 ${
                  isLightMode
                    ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-rose-300 border-slate-700'
                }`}
                title="Kosongkan absensi hari ini"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* BAGIAN INPUT (KARTU KBM HORISONTAL & KELAS TERTINGGI ATAS) */}
        {/* ======================================================== */}
        {!currentDay ? (
          <div
            className={`p-8 text-center rounded-2xl border space-y-3 ${
              isLightMode
                ? 'bg-white border-slate-200'
                : 'bg-slate-900/50 border-slate-800'
            }`}
          >
            <CalendarDays className="w-12 h-12 text-slate-400 mx-auto" />
            <h3
              className={`text-base font-bold ${
                isLightMode ? 'text-slate-800' : 'text-slate-300'
              }`}
            >
              Hari Ahad / Libur Sekolah
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Tidak ada jadwal KBM formal di hari Ahad. Silakan gunakan tombol kalender untuk melihat hari Senin s/d Sabtu.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div
              className={`flex items-center justify-between px-1 text-[11px] font-medium ${
                isLightMode ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              <span className="flex items-center gap-1">
                {periodFilter === 'all' ? (
                  <span>Geser ke kanan untuk melihat jam berikutnya &rarr;</span>
                ) : (
                  <span className="font-bold text-blue-600 dark:text-blue-300">
                    Menampilkan Jam Ke-{periodFilter}
                  </span>
                )}
                {genderFilter !== 'all' && (
                  <span className="font-bold text-purple-600 dark:text-purple-300 ml-1">
                    &bull; Kelas {genderFilter === 'banin' ? 'Banin [A]' : 'Banat [B]'}
                  </span>
                )}
              </span>
              <span className="text-[10px]">
                {strictTeachingHours
                  ? 'Kartu aktif sesuai jam KBM berlangsung'
                  : 'Mode bebas: Semua jam dapat diinput'}
              </span>
            </div>

            {/* ======================================================== */}
            {/* 1. TAMPILAN DESKTOP (md:block)                            */}
            {/* Urutan jam: atas ke bawah                                 */}
            {/* Urutan kelas: kiri ke kanan dari kelas terbesar           */}
            {/* ======================================================== */}
            <div className="hidden md:block">
              {desktopViewMode === 'matrix' ? (
                <DesktopScheduleGrid
                  periods={periodsToRender}
                  items={filteredSchedule}
                  allDayItems={daySchedule}
                  recordsMap={recordsMap}
                  onToggleStatus={handleToggleStatus}
                  onOpenDetails={(item, record) => setActiveModalItem({ item, record })}
                  currentTime={currentTime}
                  currentPeriodNumber={currentPeriodNumber}
                  selectedDate={selectedDate}
                  strictTeachingHours={strictTeachingHours}
                  onLockedClick={handleLockedClick}
                  isLightMode={isLightMode}
                  lockedEvents={lockedEvents.filter((e) => e.date === selectedDate)}
                  onLockedActivityClick={handleLockedActivityClick}
                  genderFilter={genderFilter}
                />
              ) : (
                <div className="flex flex-row gap-2.5 overflow-x-auto pb-4 pt-1 px-1 items-start scrollbar-thin scrollbar-thumb-slate-400">
                  {periodsToRender.map((periodConf) => {
                    const itemsForPeriod = filteredSchedule.filter(
                      (item) => item.period === periodConf.period
                    );

                    const todayStr = getTodayStr();
                    const isToday = selectedDate === todayStr;
                    const isPastDate = selectedDate < todayStr;
                    const isFutureDate = selectedDate > todayStr;
                    const nowHM = currentTime.slice(0, 5);

                    const isPeriodStarted = isPastDate
                      ? true
                      : isFutureDate
                      ? false
                      : isTimePastOrEqual(nowHM, periodConf.startTime);

                    const isCurrent =
                      isToday &&
                      (currentPeriodNumber === periodConf.period ||
                        isTimeInPeriod(nowHM, periodConf.startTime, periodConf.endTime));
                    const isTeachingActive = !strictTeachingHours ? true : isCurrent;

                    return (
                      <PeriodColumn
                        key={periodConf.period}
                        periodConfig={periodConf}
                        items={itemsForPeriod}
                        recordsMap={recordsMap}
                        onToggleStatus={handleToggleStatus}
                        onOpenDetails={(item, record) => setActiveModalItem({ item, record })}
                        isCurrentPeriod={isCurrent}
                        isTeachingTimeActive={isTeachingActive}
                        isPeriodStarted={isPeriodStarted}
                        onLockedClick={handleLockedClick}
                        isLightMode={isLightMode}
                        lockedEvents={lockedEvents.filter((e) => e.date === selectedDate)}
                        onLockedActivityClick={handleLockedActivityClick}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* ======================================================== */}
            {/* 2. TAMPILAN MOBILE (md:hidden)                            */}
            {/* Horizontal Timeline Container untuk layar HP/Smartphone   */}
            {/* ======================================================== */}
            <div className="block md:hidden">
              <div className="flex flex-row gap-2.5 overflow-x-auto pb-4 pt-1 px-1 items-start scrollbar-thin scrollbar-thumb-slate-400">
                {periodsToRender.map((periodConf) => {
                  const itemsForPeriod = filteredSchedule.filter(
                    (item) => item.period === periodConf.period
                  );

                  const todayStr = getTodayStr();
                  const isToday = selectedDate === todayStr;
                  const isPastDate = selectedDate < todayStr;
                  const isFutureDate = selectedDate > todayStr;
                  const nowHM = currentTime.slice(0, 5);

                  const isPeriodStarted = isPastDate
                    ? true
                    : isFutureDate
                    ? false
                    : isTimePastOrEqual(nowHM, periodConf.startTime);

                  const isCurrent =
                    isToday &&
                    (currentPeriodNumber === periodConf.period ||
                      isTimeInPeriod(nowHM, periodConf.startTime, periodConf.endTime));
                  const isTeachingActive = !strictTeachingHours ? true : isCurrent;

                  return (
                    <PeriodColumn
                      key={periodConf.period}
                      periodConfig={periodConf}
                      items={itemsForPeriod}
                      recordsMap={recordsMap}
                      onToggleStatus={handleToggleStatus}
                      onOpenDetails={(item, record) => setActiveModalItem({ item, record })}
                      isCurrentPeriod={isCurrent}
                      isTeachingTimeActive={isTeachingActive}
                      isPeriodStarted={isPeriodStarted}
                      onLockedClick={handleLockedClick}
                      isLightMode={isLightMode}
                      lockedEvents={lockedEvents.filter((e) => e.date === selectedDate)}
                      onLockedActivityClick={handleLockedActivityClick}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Legend / Color Explanation */}
        <div
          className={`p-2.5 rounded-2xl border flex flex-wrap items-center justify-between gap-2.5 text-xs transition-colors ${
            isLightMode
              ? 'bg-white border-slate-200 text-slate-600 shadow-xs'
              : 'bg-slate-900/70 border-slate-800/80 text-slate-400'
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className={`font-bold ${isLightMode ? 'text-slate-800' : 'text-slate-300'}`}>
              Status Warna:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-500 border border-slate-400 shadow-xs"></span>
              <span>Belum Masuk Jam</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-blue-600 border border-blue-400 shadow-xs"></span>
              <span>Jam Aktif Belum Diabsen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-400 shadow-xs"></span>
              <span>Hadir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-300 shadow-xs"></span>
              <span>Tidak Hadir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-orange-500 border border-orange-300 shadow-xs"></span>
              <span>LAIN-LAIN</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer
        className={`mt-auto border-t py-2.5 px-4 text-center text-xs flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto w-full transition-colors ${
          isLightMode
            ? 'border-slate-200 bg-white text-slate-600'
            : 'border-slate-800 bg-slate-950 text-slate-400'
        }`}
      >
        <p>
          Sistem Absensi Guru Piket SPM Al Ihsan Wat Taqwa
        </p>
        <div className="flex items-center gap-3 text-[11px]">
          <span>
            Masuk sebagai: <strong className={isLightMode ? 'text-slate-900' : 'text-slate-200'}>{userRole === 'admin' ? 'Administrator' : 'Petugas Piket (User)'}</strong>
          </span>
          <button
            onClick={() => setIsPWAInstallOpen(true)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
          >
            <Smartphone className="w-3 h-3" />
            <span>Pasang APK</span>
          </button>
        </div>
      </footer>

      {/* Detail / Attendance Modal */}
      {activeModalItem && (
        <AttendanceModal
          isOpen={!!activeModalItem}
          item={activeModalItem.item}
          record={activeModalItem.record}
          onClose={() => setActiveModalItem(null)}
          onSave={handleSaveModalRecord}
          dateStr={selectedDate}
        />
      )}

      {/* Lain-Lain Modal with Badil, Kunci Absen, & Data Piket tabs */}
      <LainLainModal
        isOpen={isLainLainOpen}
        onClose={() => setIsLainLainOpen(false)}
        onAddCustomRecord={handleAddCustomRecord}
        dateStr={selectedDate}
        dayName={currentDay || 'SENIN'}
        lockedEvents={lockedEvents}
        onAddLockedEvent={handleAddLockedEvent}
        onDeleteLockedEvent={handleDeleteLockedEvent}
        piketDuties={piketDuties}
        onAddPiketDuty={handleAddPiketDuty}
        onDeletePiketDuty={handleDeletePiketDuty}
        isLightMode={isLightMode}
      />

      {/* Google Sheets Sync Modal (Admin only) */}
      {userRole === 'admin' && (
        <SyncSheetModal
          isOpen={isSyncSheetOpen}
          onClose={() => setIsSyncSheetOpen(false)}
          records={allDayRecordsList}
          periods={periods}
          dateStr={selectedDate}
        />
      )}

      {/* Notification & Bell Schedule Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
        periods={periods}
        bellConfig={bellConfig}
        onSavePeriods={handleSavePeriods}
        soundEnabled={soundEnabled}
        onToggleSound={(enabled) => {
          setSoundEnabled(enabled);
          localStorage.setItem('piket_sound_enabled', enabled ? 'true' : 'false');
        }}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={(enabled) => {
          setNotificationsEnabled(enabled);
          localStorage.setItem('piket_notifications_enabled', enabled ? 'true' : 'false');
        }}
        isLightMode={isLightMode}
      />

      {/* PWA / APK Install Modal for Piket */}
      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
      />

      {/* Interactive Calendar Picker Modal */}
      <CalendarPickerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
        isLightMode={isLightMode}
      />

      {/* Weekly Attendance Statistics Dashboard Modal (Senin-Sabtu) */}
      <WeeklyStatsModal
        isOpen={isWeeklyStatsOpen}
        onClose={() => setIsWeeklyStatsOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={(newDate) => setSelectedDate(newDate)}
        isLightMode={isLightMode}
      />

      {/* Ekspor & Cetak PDF Absensi KBM per Rentang Tanggal (Print Preview) */}
      <PdfExportModal
        isOpen={isPdfExportOpen}
        onClose={() => setIsPdfExportOpen(false)}
        defaultDate={selectedDate}
        periods={periods}
        isLightMode={isLightMode}
      />

      {/* Modal Hapus Semua Absen */}
      <DeleteAttendanceModal
        isOpen={isDeleteAttendanceOpen}
        onClose={() => setIsDeleteAttendanceOpen(false)}
        selectedDate={selectedDate}
        dayRecords={Object.values(recordsMap)}
        onDayDeleted={() => {
          setRecordsMap({});
          setCustomItems([]);
          localStorage.removeItem(`piket_attendance_${selectedDate}`);
        }}
        onAllDeleted={() => {
          setRecordsMap({});
          setCustomItems([]);
          // clear all piket_attendance_* from localStorage
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('piket_attendance_')) {
              localStorage.removeItem(key);
            }
          });
        }}
        isLightMode={isLightMode}
      />

      {/* Modal Kapasitas & Status Cloud Firestore */}
      <FirestoreCapacityModal
        isOpen={isCapacityModalOpen}
        onClose={() => setIsCapacityModalOpen(false)}
        isLightMode={isLightMode}
      />
    </div>
  );
}
