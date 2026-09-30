import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AttendanceRecord,
  AttendanceStatus,
  DayOfWeek,
  LockedEvent,
  PeriodConfig,
  PiketDutyRecord,
  ScheduleItem,
} from './types/schedule';
import {
  FULL_SCHEDULE,
  DEFAULT_PERIODS,
  GOOGLE_SHEET_INFO,
  getDayNameFromDate,
  getClassRank,
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
import { sendPeriodNotification } from './utils/notifications';
import { formatCurrentTime, isTimePastOrEqual, isTimeInPeriod } from './utils/timeUtils';
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
} from 'lucide-react';

const SCHOOL_LOGO_URL = 'https://iili.io/nYcZGTv.jpg';
const SCHOOL_LOGO_FALLBACK = '/logo.jpg';

export default function App() {
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

  // Role Authentication: admin (adminalwa) or user (piket)
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(() => {
    const saved = localStorage.getItem('piket_auth_role');
    return saved === 'admin' || saved === 'user' ? saved : null;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Auto-authenticate role if opened via APK PWA or ?role=piket
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('role') === 'piket') {
      setUserRole('user');
      localStorage.setItem('piket_auth_role', 'user');
    }
  }, []);

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

  // Desktop layout view mode: 'matrix' (Jam atas ke bawah, kelas kiri ke kanan) or 'column'
  const [desktopViewMode, setDesktopViewMode] = useState<'matrix' | 'column'>('matrix');

  // Last notified period tracker
  const lastNotifiedPeriodRef = useRef<string | null>(null);

  // Attendance Records mapped by scheduleId
  const [recordsMap, setRecordsMap] = useState<Record<string, AttendanceRecord>>({});

  // Custom (Lain-Lain) items for selected date
  const [customItems, setCustomItems] = useState<ScheduleItem[]>([]);

  // Locked Events (Kunci Absen Kegiatan)
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

  const handleAddLockedEvent = (eventData: Omit<LockedEvent, 'id' | 'createdAt'>) => {
    const newEvent: LockedEvent = {
      ...eventData,
      id: `lock_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEvent, ...lockedEvents];
    setLockedEvents(updated);
    localStorage.setItem('piket_locked_events', JSON.stringify(updated));
  };

  const handleDeleteLockedEvent = (id: string) => {
    const updated = lockedEvents.filter((e) => e.id !== id);
    setLockedEvents(updated);
    localStorage.setItem('piket_locked_events', JSON.stringify(updated));
  };

  const handleLockedActivityClick = (item: ScheduleItem, event: LockedEvent) => {
    setLockWarningToast(`🔒 Kelas ${item.className} dikunci kegiatan "${event.activity}". Absen KBM reguler dinonaktifkan.`);
    setTimeout(() => setLockWarningToast(null), 4000);
  };

  // =========================================================
  // DATA PETUGAS PIKET (NAMA GURU, DARI JAM, SAMPAI JAM)
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
    // Default initial piket schedule sample
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

  const handleAddPiketDuty = (dutyData: Omit<PiketDutyRecord, 'id' | 'createdAt'>) => {
    const newDuty: PiketDutyRecord = {
      ...dutyData,
      id: `duty_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newDuty, ...piketDuties];
    setPiketDuties(updated);
    localStorage.setItem('piket_duties', JSON.stringify(updated));
  };

  const handleDeletePiketDuty = (id: string) => {
    const updated = piketDuties.filter((d) => d.id !== id);
    setPiketDuties(updated);
    localStorage.setItem('piket_duties', JSON.stringify(updated));
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

  // Load records whenever selectedDate changes
  useEffect(() => {
    const storageKey = `piket_attendance_${selectedDate}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed: Record<string, AttendanceRecord> = JSON.parse(saved);
        setRecordsMap(parsed);

        const customs: ScheduleItem[] = Object.values(parsed)
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
      } catch {
        setRecordsMap({});
        setCustomItems([]);
      }
    } else {
      setRecordsMap({});
      setCustomItems([]);
    }
  }, [selectedDate]);

  // Save records to localStorage
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

  // Handle Login
  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const pass = passwordInput.trim();
    if (pass === 'adminalwa') {
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

  // Toggle single item status (manual 1-by-1)
  const handleToggleStatus = (item: ScheduleItem, nextStatus: AttendanceStatus) => {
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

    const newMap = { ...recordsMap, [item.id]: updated };
    saveRecordsToStorage(newMap);
  };

  // Save detail record from AttendanceModal
  const handleSaveModalRecord = (record: AttendanceRecord) => {
    const newMap = { ...recordsMap, [record.scheduleId]: record };
    saveRecordsToStorage(newMap);
  };

  // Add custom "Lain-Lain" attendance item
  const handleAddCustomRecord = (record: AttendanceRecord) => {
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
  };

  // Reset all attendance for selected date (Admin only)
  const handleResetDay = () => {
    if (window.confirm('Kosongkan semua data absensi pada tanggal ini?')) {
      saveRecordsToStorage({});
      setCustomItems([]);
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
        className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-200 ${
          isLightMode
            ? 'bg-slate-100 text-slate-800'
            : 'bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white'
        }`}
      >
        <div
          className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 border transition-colors ${
            isLightMode
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
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
              Sistem Absensi Guru Piket
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
                  placeholder="Ketik sandi piket / admin..."
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
                <p className="text-[11px] text-rose-500 mt-1.5 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {loginError}
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
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isLightMode
          ? 'bg-slate-100 text-slate-800 selection:bg-blue-200 selection:text-blue-900'
          : 'bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white'
      }`}
    >
      {/* Top Navigation & Brand Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b shadow-xs px-3 py-2 sm:px-6 transition-colors ${
          isLightMode
            ? 'bg-white/95 border-slate-200 text-slate-900'
            : 'bg-slate-900/95 border-slate-800 text-slate-100 shadow-md'
        }`}
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
              <div className="flex items-center gap-1.5">
                <h1
                  className={`text-sm sm:text-base font-black tracking-tight uppercase leading-none ${
                    isLightMode ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  SPM AL IHSAN WAT TAQWA
                </h1>
                {/* Role Badge */}
                {userRole === 'admin' ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    Admin
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/40 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    Piket
                  </span>
                )}
              </div>
              <p
                className={`text-[10px] font-medium ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {userRole === 'user' ? 'Laman Absensi Petugas Piket' : 'Laman Kelola Absensi & Integrasi Piket'}
              </p>
            </div>
          </div>

          {/* Action Buttons Pushed to the Right (Rata Kanan) */}
          <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            {/* Real-time Clock */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border font-mono text-xs shadow-inner ${
                isLightMode
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className={`font-bold ${isLightMode ? 'text-slate-900' : 'text-white'}`}>
                {currentTime || '--:--:--'}
              </span>
            </div>

            {/* Theme Toggle Button (Terang / Gelap) */}
            <button
              onClick={toggleTheme}
              className={`px-2 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all shadow-xs ${
                isLightMode
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
              }`}
              title={isLightMode ? 'Beralih ke Tema Gelap' : 'Beralih ke Tema Terang'}
            >
              {isLightMode ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline text-[11px]">Gelap</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline text-[11px]">Terang</span>
                </>
              )}
            </button>

            {/* Weekly Statistics Dashboard Button */}
            <button
              onClick={() => setIsWeeklyStatsOpen(true)}
              className={`px-2 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                isLightMode
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-blue-600/25 hover:bg-blue-600/40 text-blue-200 border-blue-500/50'
              }`}
              title="Dashboard Statistik Mingguan (Senin - Sabtu)"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline text-[11px]">Statistik</span>
            </button>

            {/* Install APK Piket Button */}
            <button
              onClick={() => setIsPWAInstallOpen(true)}
              className={`px-2 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all shadow-xs ${
                isLightMode
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300'
                  : 'bg-emerald-700/60 hover:bg-emerald-600 text-emerald-200 border-emerald-500/60'
              }`}
              title="Pasang Aplikasi Piket ke Layar Utama HP"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline text-[11px]">APK Piket</span>
            </button>

            {/* Edit Waktu Jam Pelajaran & Bel Button */}
            <button
              onClick={() => setIsNotificationSettingsOpen(true)}
              className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                isLightMode
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/40'
              }`}
              title="Edit Waktu Jam Pelajaran (Jam Ke-1 s/d Jam Ke-6, Mulai & Selesai) serta Bel Masuk"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-[11px]">Atur Jam KBM</span>
            </button>

            {/* ADMIN ONLY CONTROLS */}
            {userRole === 'admin' && (
              <>
                {/* Teaching Hour Lock Toggle Switch (Admin only) */}
                <button
                  onClick={() => setStrictTeachingHours(!strictTeachingHours)}
                  className={`
                    px-2.5 py-1 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs
                    ${
                      strictTeachingHours
                        ? isLightMode
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : isLightMode
                        ? 'bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-900'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }
                  `}
                  title={
                    strictTeachingHours
                      ? 'Kunci Jam KBM Aktif: Hanya kartu jam yang sedang berlangsung yang dapat diabsen'
                      : 'Mode Bebas: Semua jam dapat diabsen'
                  }
                >
                  {strictTeachingHours ? (
                    <>
                      <Lock className="w-3 h-3 text-amber-500" />
                      <span className="hidden sm:inline">Kunci Jam</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-slate-400" />
                      <span className="hidden sm:inline">Bebas</span>
                    </>
                  )}
                </button>

                {/* Google Sheets Sync Button (Admin only) */}
                <button
                  onClick={() => setIsSyncSheetOpen(true)}
                  className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:translate-y-0.5 text-white font-bold text-xs border-b-2 border-emerald-900 shadow-xs flex items-center gap-1 transition-all"
                  title="Simpan & Sinkronkan ke Google Sheet piket"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-100" />
                  <span className="hidden sm:inline text-[11px]">Sheet Piket</span>
                </button>
              </>
            )}

            {/* LAIN - LAIN Button (Accessible by both User and Admin for input!) */}
            <button
              onClick={() => setIsLainLainOpen(true)}
              className="px-3 py-1 rounded-xl bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 active:translate-y-0.5 text-white font-black text-xs uppercase tracking-wider border-b-[3px] border-[#9a3412] border-t border-orange-200/50 shadow-md hover:from-orange-300 hover:to-orange-500 flex items-center gap-1 transition-all drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
              title="Tambah Guru Pengganti / Kunci Kegiatan / Data Piket"
            >
              <PlusCircle className="w-3 h-3 text-white" />
              <span className="text-[11px]">LAIN - LAIN</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-xl border transition-colors ${
                isLightMode
                  ? 'bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-300'
                  : 'bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border-slate-700'
              }`}
              title="Keluar / Ganti Peran"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* PANEL STATIS: NAMA GURU PIKET HARI INI                  */}
      {/* ======================================================== */}
      <div
        className={`border-b px-3 py-2 text-xs transition-colors shadow-xs ${
          isLightMode
            ? 'bg-blue-50/90 border-blue-200 text-blue-950'
            : 'bg-slate-900/95 border-slate-800 text-blue-100'
        }`}
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
                  : `GURU PIKET (${currentDay || 'HARI INI'})`}
              </span>
            </div>

            {/* Static List of Piket Teachers (Tidak Berjalan/Bergerak) */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {activePiketTeachers.length > 0 ? (
                activePiketTeachers.map((duty) => (
                  <div
                    key={duty.id}
                    onClick={() => setIsLainLainOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-xs cursor-pointer transition-all ${
                      isLightMode
                        ? 'bg-white hover:bg-emerald-50 text-slate-900 border-emerald-300'
                        : 'bg-slate-800/90 hover:bg-slate-750 text-white border-emerald-500/50'
                    }`}
                    title="Klik untuk kelola data piket di menu LAIN - LAIN"
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
                    onClick={() => setIsLainLainOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold shadow-xs cursor-pointer transition-all ${
                      isLightMode
                        ? 'bg-white hover:bg-blue-50 text-slate-900 border-blue-200'
                        : 'bg-slate-800/80 hover:bg-slate-750 text-slate-200 border-slate-700'
                    }`}
                    title="Klik untuk kelola data piket di menu LAIN - LAIN"
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
                  onClick={() => setIsLainLainOpen(true)}
                  className="text-xs text-slate-500 dark:text-slate-400 italic cursor-pointer hover:underline"
                  title="Klik untuk mengatur guru piket"
                >
                  Belum ada jadwal guru piket hari {currentDay || 'ini'}. Klik untuk menambah data piket.
                </span>
              )}
            </div>
          </div>

          {/* Quick link button to edit piket duties */}
          <button
            type="button"
            onClick={() => setIsLainLainOpen(true)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 flex-shrink-0 ${
              isLightMode
                ? 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-800 hover:bg-slate-750 text-blue-300 border-slate-700'
            }`}
            title="Kelola jadwal dan nama guru piket di menu LAIN - LAIN"
          >
            <span>Kelola Guru Piket</span>
            <ChevronRight className="w-3 h-3" />
          </button>
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
          className={`rounded-2xl p-2.5 sm:p-3 shadow-xs space-y-2.5 border transition-colors ${
            isLightMode
              ? 'bg-white border-slate-200'
              : 'bg-slate-900 border-slate-800'
          }`}
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

              {/* Shortcut to Edit Jam Pelajaran */}
              <button
                type="button"
                onClick={() => setIsNotificationSettingsOpen(true)}
                className={`p-1.5 rounded-xl border transition-colors ${
                  isLightMode
                    ? 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-300 border-slate-700'
                }`}
                title="Edit Waktu Jam Pelajaran (Jam Mulai & Selesai)"
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </button>
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
                <option value="banin">Kelas Banin (Putra - Huruf A)</option>
                <option value="banat">Kelas Banat (Putri - Huruf B)</option>
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
        onSavePeriods={(newPeriods) => {
          setPeriods(newPeriods);
          localStorage.setItem('piket_periods_config', JSON.stringify(newPeriods));
        }}
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
    </div>
  );
}
