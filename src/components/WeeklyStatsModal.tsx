import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  X,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BarChart2,
  Percent,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import { FULL_SCHEDULE } from '../data/scheduleData';
import { AttendanceRecord, DayOfWeek } from '../types/schedule';

interface WeeklyStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  isLightMode?: boolean;
}

interface DayStatItem {
  dayName: DayOfWeek;
  dayLabel: string;
  dateStr: string; // YYYY-MM-DD
  formattedDate: string; // 29 Sep
  totalScheduled: number;
  hadir: number;
  tidakHadir: number;
  belum: number;
  attendanceRate: number; // percentage 0-100
  hasRecords: boolean;
}

export const WeeklyStatsModal: React.FC<WeeklyStatsModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  isLightMode = false,
}) => {
  // Reference date for the week: defaults to selectedDate
  const [currentWeekRefDate, setCurrentWeekRefDate] = useState<string>(selectedDate);
  const [viewMode, setViewMode] = useState<'counts' | 'percentage'>('counts');

  // Sync refDate when modal opens or selectedDate changes
  React.useEffect(() => {
    if (isOpen) {
      setCurrentWeekRefDate(selectedDate);
    }
  }, [isOpen, selectedDate]);

  // Calculate Monday to Saturday dates for the week of currentWeekRefDate
  const weekDays = useMemo<DayStatItem[]>(() => {
    const ref = new Date(currentWeekRefDate + 'T00:00:00');
    const dayOfWeek = ref.getDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday

    // Calculate diff to Monday:
    // If Sunday (0), Monday was 6 days ago (or next day)
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() + diffToMonday);

    const DAYS_MAP: { dayName: DayOfWeek; label: string; offset: number }[] = [
      { dayName: 'SENIN', label: 'Senin', offset: 0 },
      { dayName: 'SELASA', label: 'Selasa', offset: 1 },
      { dayName: 'RABU', label: 'Rabu', offset: 2 },
      { dayName: 'KAMIS', label: 'Kamis', offset: 3 },
      { dayName: 'JUMAT', label: 'Jumat', offset: 4 },
      { dayName: 'SABTU', label: 'Sabtu', offset: 5 },
    ];

    return DAYS_MAP.map((item) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + item.offset);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const formattedDate = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
      });

      // Scheduled items for this day
      const scheduledItems = FULL_SCHEDULE.filter((s) => s.day === item.dayName);
      const totalScheduled = scheduledItems.length;

      // Read records from localStorage
      const storageKey = `piket_attendance_${dateStr}`;
      const saved = localStorage.getItem(storageKey);
      let hadir = 0;
      let tidakHadir = 0;
      let hasRecords = false;

      if (saved) {
        try {
          const map: Record<string, AttendanceRecord> = JSON.parse(saved);
          const records = Object.values(map);
          if (records.length > 0) {
            hasRecords = true;
            records.forEach((rec) => {
              if (rec.status === 'hadir') hadir++;
              else if (rec.status === 'tidak_hadir') tidakHadir++;
            });
          }
        } catch {
          // ignore
        }
      }

      const recordedTotal = hadir + tidakHadir;
      const belum = Math.max(0, totalScheduled - recordedTotal);
      const attendanceRate =
        totalScheduled > 0 ? Math.round((hadir / totalScheduled) * 100) : 0;

      return {
        dayName: item.dayName,
        dayLabel: item.label,
        dateStr,
        formattedDate,
        totalScheduled,
        hadir,
        tidakHadir,
        belum,
        attendanceRate,
        hasRecords,
      };
    });
  }, [currentWeekRefDate]);

  // Overall Weekly KPIs
  const weeklySummary = useMemo<{
    totalScheduled: number;
    totalHadir: number;
    totalTidakHadir: number;
    totalBelum: number;
    averageRate: number;
    daysWithData: number;
    bestDay: DayStatItem | null;
  }>(() => {
    let totalScheduled = 0;
    let totalHadir = 0;
    let totalTidakHadir = 0;
    let totalBelum = 0;
    let daysWithData = 0;

    let bestDay: DayStatItem | null = null;

    weekDays.forEach((d) => {
      totalScheduled += d.totalScheduled;
      totalHadir += d.hadir;
      totalTidakHadir += d.tidakHadir;
      totalBelum += d.belum;
      if (d.hasRecords) {
        daysWithData++;
        if (!bestDay || d.attendanceRate > (bestDay as DayStatItem).attendanceRate) {
          bestDay = d;
        }
      }
    });

    const averageRate =
      totalScheduled > 0 ? Math.round((totalHadir / totalScheduled) * 100) : 0;

    return {
      totalScheduled,
      totalHadir,
      totalTidakHadir,
      totalBelum,
      averageRate,
      daysWithData,
      bestDay,
    };
  }, [weekDays]);

  // Navigation handlers
  const handlePrevWeek = () => {
    const d = new Date(currentWeekRefDate + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setCurrentWeekRefDate(d.toISOString().split('T')[0]);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekRefDate + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setCurrentWeekRefDate(d.toISOString().split('T')[0]);
  };

  const handleThisWeek = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    setCurrentWeekRefDate(`${y}-${m}-${d}`);
  };

  // Helper: Seed realistic simulation data for the current week if requested
  const handleSeedSimulationData = () => {
    if (
      !window.confirm(
        'Muat data simulasi kehadiran mingguan (Senin-Sabtu) untuk melihat grafik dan statistik lengkap?'
      )
    ) {
      return;
    }

    weekDays.forEach((dayItem, index) => {
      const scheduled = FULL_SCHEDULE.filter((s) => s.day === dayItem.dayName);
      const newMap: Record<string, AttendanceRecord> = {};

      scheduled.forEach((item, idx) => {
        // High realistic presence rate (approx 90-95% hadir, 1-3 tidak hadir)
        const isAbsent = (idx + index * 3) % 15 === 0;
        const status = isAbsent ? 'tidak_hadir' : 'hadir';

        newMap[item.id] = {
          id: `${dayItem.dateStr}_${item.id}`,
          date: dayItem.dateStr,
          scheduleId: item.id,
          teacher: item.teacher,
          subject: item.subject,
          className: item.className,
          day: item.day,
          period: item.period,
          status,
          reason: isAbsent ? (idx % 2 === 0 ? 'Sakit' : 'Izin Keperluan') : undefined,
          updatedAt: '08:00',
        };
      });

      localStorage.setItem(
        `piket_attendance_${dayItem.dateStr}`,
        JSON.stringify(newMap)
      );
    });

    // Force re-render by updating currentWeekRefDate
    setCurrentWeekRefDate((prev) => prev);
    window.location.reload();
  };

  if (!isOpen) return null;

  // Chart data format
  const chartData = weekDays.map((d) => ({
    name: `${d.dayLabel}`,
    fullLabel: `${d.dayLabel} (${d.formattedDate})`,
    hadir: d.hadir,
    tidakHadir: d.tidakHadir,
    belum: d.belum,
    rate: d.attendanceRate,
    total: d.totalScheduled,
    dateStr: d.dateStr,
  }));

  const weekRangeText = `${weekDays[0].dayLabel} (${weekDays[0].formattedDate}) - ${weekDays[5].dayLabel} (${weekDays[5].formattedDate})`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col border overflow-hidden transition-all ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3 ${
            isLightMode ? 'bg-slate-50/90 border-slate-200' : 'bg-slate-850 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Dashboard Statistik Mingguan (Senin - Sabtu)
              </h2>
              <p
                className={`text-xs ${
                  isLightMode ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                Ringkasan performa absensi KBM SPM Al Ihsan Wat Taqwa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors ${
                isLightMode
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Week Selector Bar */}
          <div
            className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            {/* Week Navigator */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevWeek}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isLightMode
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="Minggu Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs shadow-inner">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>{weekRangeText}</span>
              </div>

              <button
                onClick={handleNextWeek}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isLightMode
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
                title="Minggu Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleThisWeek}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  isLightMode
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                Minggu Ini
              </button>
            </div>

            {/* Mode Toggle & Simulation */}
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`flex items-center p-1 rounded-xl border text-xs font-semibold ${
                  isLightMode
                    ? 'bg-white border-slate-300'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <button
                  onClick={() => setViewMode('counts')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                    viewMode === 'counts'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isLightMode
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>Jumlah Jam</span>
                </button>
                <button
                  onClick={() => setViewMode('percentage')}
                  className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                    viewMode === 'percentage'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isLightMode
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5" />
                  <span>Persentase (%)</span>
                </button>
              </div>

              {weeklySummary.daysWithData === 0 && (
                <button
                  onClick={handleSeedSimulationData}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                  title="Isi data simulasi kehadiran mingguan untuk demonstrasi"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Isi Data Simulasi</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: Rata-rata Kehadiran */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-colors shadow-xs ${
                isLightMode
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : 'bg-emerald-950/20 border-emerald-800/40'
              }`}
            >
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Rata-rata Hadir
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {weeklySummary.averageRate}%
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {weeklySummary.totalHadir} / {weeklySummary.totalScheduled} Jam
                </span>
              </div>
            </div>

            {/* Card 2: Total KBM Hadir */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-colors shadow-xs ${
                isLightMode
                  ? 'bg-blue-50/70 border-blue-200'
                  : 'bg-blue-950/20 border-blue-800/40'
              }`}
            >
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Total KBM Hadir
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  {weeklySummary.totalHadir}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                  Jam Pelajaran
                </span>
              </div>
            </div>

            {/* Card 3: Total Tidak Hadir */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-colors shadow-xs ${
                isLightMode
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-amber-950/20 border-amber-800/40'
              }`}
            >
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Tidak Hadir / Badil
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  {weeklySummary.totalTidakHadir}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                  Jam Pelajaran
                </span>
              </div>
            </div>

            {/* Card 4: Belum Absen / Hari Terbaik */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-colors shadow-xs ${
                isLightMode
                  ? 'bg-purple-50/70 border-purple-200'
                  : 'bg-purple-950/20 border-purple-800/40'
              }`}
            >
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                Hari Terbaik
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-base sm:text-lg font-black text-purple-600 dark:text-purple-300 truncate">
                  {weeklySummary.bestDay ? weeklySummary.bestDay.dayLabel : '-'}
                </span>
                {weeklySummary.bestDay && (
                  <span className="text-xs font-bold text-purple-500">
                    ({weeklySummary.bestDay.attendanceRate}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Recharts Bar Chart Card */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border shadow-xs transition-colors ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black tracking-tight">
                  Grafik Batang Performa Absensi Mingguan
                </h3>
                <p
                  className={`text-[11px] ${
                    isLightMode ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  {viewMode === 'counts'
                    ? 'Jumlah jam pelajaran: Hadir (Hijau), Tidak Hadir (Kuning), Belum Diabsen (Biru/Abu)'
                    : 'Tingkat persentase kehadiran guru per hari (%)'}
                </p>
              </div>

              {/* Legend Summary */}
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Hadir
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Tidak Hadir
                </span>
                {viewMode === 'counts' && (
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    Belum
                  </span>
                )}
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="w-full h-[280px] sm:h-[310px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isLightMode ? '#e2e8f0' : '#1e293b'}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: isLightMode ? '#475569' : '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  />
                  <YAxis
                    tick={{ fill: isLightMode ? '#475569' : '#94a3b8', fontSize: 11 }}
                    domain={viewMode === 'percentage' ? [0, 100] : [0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isLightMode ? '#ffffff' : '#0f172a',
                      borderColor: isLightMode ? '#e2e8f0' : '#334155',
                      borderRadius: '16px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      color: isLightMode ? '#0f172a' : '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'hadir') return [`${value} Jam`, 'Hadir'];
                      if (name === 'tidakHadir') return [`${value} Jam`, 'Tidak Hadir'];
                      if (name === 'belum') return [`${value} Jam`, 'Belum Absen'];
                      if (name === 'rate') return [`${value}%`, 'Tingkat Kehadiran'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `Jadwal KBM: ${label}`}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                  />

                  {viewMode === 'counts' ? (
                    <>
                      <Bar
                        dataKey="hadir"
                        name="Hadir"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="tidakHadir"
                        name="Tidak Hadir"
                        fill="#f59e0b"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                      <Bar
                        dataKey="belum"
                        name="Belum Absen"
                        fill={isLightMode ? '#cbd5e1' : '#475569'}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                    </>
                  ) : (
                    <Bar
                      dataKey="rate"
                      name="% Kehadiran"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Daily Breakdown Table (Senin - Sabtu) */}
          <div
            className={`rounded-2xl border overflow-hidden transition-colors ${
              isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div
              className={`px-4 py-3 border-b flex items-center justify-between ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
              }`}
            >
              <h4 className="text-xs font-black uppercase tracking-wider">
                Rincian Hari (Senin - Sabtu)
              </h4>
              <span className="text-[11px] text-slate-400">
                Klik baris atau tombol untuk buka absensi tanggal tersebut
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isLightMode
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/80'
                  }`}
                >
                  <tr>
                    <th className="px-4 py-2.5">Hari & Tanggal</th>
                    <th className="px-3 py-2.5 text-center">Total KBM</th>
                    <th className="px-3 py-2.5 text-center">Hadir</th>
                    <th className="px-3 py-2.5 text-center">Tidak Hadir</th>
                    <th className="px-3 py-2.5 text-center">Belum</th>
                    <th className="px-3 py-2.5 text-center">% Kehadiran</th>
                    <th className="px-4 py-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isLightMode ? 'divide-slate-200' : 'divide-slate-800/80'
                  }`}
                >
                  {weekDays.map((day) => {
                    const isSelected = day.dateStr === selectedDate;

                    return (
                      <tr
                        key={day.dateStr}
                        onClick={() => {
                          onSelectDate(day.dateStr);
                          onClose();
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? isLightMode
                              ? 'bg-blue-50 font-semibold'
                              : 'bg-blue-950/40 font-semibold'
                            : isLightMode
                            ? 'hover:bg-slate-50'
                            : 'hover:bg-slate-850/50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isSelected ? 'bg-blue-500' : 'bg-transparent'
                              }`}
                            />
                            <div>
                              <div className="font-bold">{day.dayLabel}</div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {day.dateStr}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3 text-center font-mono font-medium">
                          {day.totalScheduled} Jam
                        </td>

                        <td className="px-3 py-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {day.hadir}
                        </td>

                        <td className="px-3 py-3 text-center font-bold text-amber-600 dark:text-amber-400">
                          {day.tidakHadir}
                        </td>

                        <td className="px-3 py-3 text-center font-medium text-slate-400">
                          {day.belum}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span className="font-black font-mono">
                              {day.attendanceRate}%
                            </span>
                            <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${day.attendanceRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDate(day.dateStr);
                              onClose();
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors inline-flex items-center gap-1 ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-700'
                                : isLightMode
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                          >
                            <span>Buka</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
          }`}
        >
          <div className="text-[11px] text-slate-400">
            Sumber Data: Catatan Kehadiran Piket KBM SPM Al Ihsan Wat Taqwa
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs"
          >
            Tutup Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
