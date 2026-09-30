import React, { useMemo } from 'react';
import {
  AttendanceRecord,
  AttendanceStatus,
  LockedEvent,
  PeriodConfig,
  ScheduleItem,
} from '../types/schedule';
import { KeycapCard } from './KeycapCard';
import { Clock, Coffee, Lock, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { getClassRank, isBaninClass, isBanatClass } from '../data/scheduleData';
import { isTimePastOrEqual, isTimeInPeriod } from '../utils/timeUtils';

interface DesktopScheduleGridProps {
  periods: PeriodConfig[];
  items: ScheduleItem[];
  allDayItems: ScheduleItem[]; // Unfiltered items for the day to derive all classes
  recordsMap: Record<string, AttendanceRecord>;
  onToggleStatus: (item: ScheduleItem, nextStatus: AttendanceStatus) => void;
  onOpenDetails: (item: ScheduleItem, record?: AttendanceRecord) => void;
  currentTime: string;
  currentPeriodNumber: number | null;
  selectedDate: string;
  strictTeachingHours: boolean;
  onLockedClick: (item: ScheduleItem) => void;
  isLightMode?: boolean;
  lockedEvents?: LockedEvent[];
  onLockedActivityClick?: (item: ScheduleItem, event: LockedEvent) => void;
  genderFilter: 'all' | 'banin' | 'banat';
}

export const DesktopScheduleGrid: React.FC<DesktopScheduleGridProps> = ({
  periods,
  items,
  allDayItems,
  recordsMap,
  onToggleStatus,
  onOpenDetails,
  currentTime,
  currentPeriodNumber,
  selectedDate,
  strictTeachingHours,
  onLockedClick,
  isLightMode = false,
  lockedEvents = [],
  onLockedActivityClick,
  genderFilter,
}) => {
  // Helper to find locked event for a card
  const getEventForCard = (item: ScheduleItem): LockedEvent | undefined => {
    return lockedEvents.find((evt) => {
      if (evt.targetClasses === 'semua') return true;
      if (evt.targetClasses === 'banin' && isBaninClass(item.className)) return true;
      if (evt.targetClasses === 'banat' && isBanatClass(item.className)) return true;
      return false;
    });
  };

  // Determine all unique classes for current day, filtered by gender, sorted largest to smallest (left to right)
  const sortedClasses = useMemo(() => {
    const classSet = new Set<string>();
    allDayItems.forEach((it) => {
      if (it.className) classSet.add(it.className.trim());
    });

    let classList = Array.from(classSet);

    // Apply gender filter to classes
    if (genderFilter === 'banin') {
      classList = classList.filter((c) => isBaninClass(c));
    } else if (genderFilter === 'banat') {
      classList = classList.filter((c) => isBanatClass(c));
    }

    // Sort: highest/largest class on the LEFT to lowest class on the RIGHT
    // 6A > 6B > 5A > 5B > 3A1 > 3A2 > 3 INT A > 3B > 3 INT B > 2A > 2B > 1A1 > 1A2 > 1 INT A > 1B > 1 INT B
    return classList.sort((a, b) => getClassRank(b) - getClassRank(a));
  }, [allDayItems, genderFilter]);

  // Lookup map: (period_className) -> ScheduleItem
  const itemLookup = useMemo(() => {
    const map = new Map<string, ScheduleItem>();
    items.forEach((it) => {
      map.set(`${it.period}_${it.className.trim().toUpperCase()}`, it);
    });
    return map;
  }, [items]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const isToday = selectedDate === todayStr;
  const isPastDate = selectedDate < todayStr;
  const isFutureDate = selectedDate > todayStr;
  const nowHM = currentTime.slice(0, 5);

  return (
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden transition-colors ${
        isLightMode ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
      }`}
    >
      {/* Scrollable Container with sticky headers */}
      <div className="overflow-x-auto max-w-full pb-2">
        <table className="w-full border-collapse text-left min-w-max">
          <thead>
            {/* Header: Top row showing Classes from largest (left) to smallest (right) */}
            <tr
              className={`border-b text-xs font-bold uppercase tracking-wider ${
                isLightMode
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-850 text-slate-300 border-slate-800'
              }`}
            >
              {/* Sticky Top-Left Corner: Jam Pelajaran */}
              <th
                scope="col"
                className={`sticky left-0 z-20 px-3.5 py-3 border-r min-w-[170px] max-w-[190px] shadow-sm ${
                  isLightMode
                    ? 'bg-slate-100 text-slate-900 border-slate-200'
                    : 'bg-slate-850 text-white border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>JAM (↓)</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-400 lowercase">
                    kelas terbesar (→)
                  </span>
                </div>
              </th>

              {/* Class columns: sorted from largest to smallest */}
              {sortedClasses.map((className) => {
                const isBanin = isBaninClass(className);
                return (
                  <th
                    key={className}
                    scope="col"
                    className={`px-2 py-2.5 text-center min-w-[165px] border-r last:border-r-0 ${
                      isLightMode ? 'border-slate-200' : 'border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-black tracking-wide shadow-xs border ${
                          isBanin
                            ? isLightMode
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-blue-900/60 text-blue-200 border-blue-700/60'
                            : isLightMode
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : 'bg-purple-900/60 text-purple-200 border-purple-700/60'
                        }`}
                      >
                        {className}
                      </span>
                      <span className="text-[9px] font-medium text-slate-400">
                        {isBanin ? 'Putra (Banin)' : 'Putri (Banat)'}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody
            className={`divide-y text-xs ${
              isLightMode ? 'divide-slate-200' : 'divide-slate-800/80'
            }`}
          >
            {/* Periods from TOP to BOTTOM */}
            {periods.map((periodConf) => {
              // 1. Break Period (Istirahat) row
              if (periodConf.isBreak) {
                return (
                  <tr
                    key={`break_${periodConf.period}`}
                    className={`transition-colors ${
                      isLightMode
                        ? 'bg-amber-50/70 border-y border-amber-200 text-amber-900'
                        : 'bg-amber-950/20 border-y border-amber-800/40 text-amber-200'
                    }`}
                  >
                    {/* Sticky Period Header for Break */}
                    <td
                      className={`sticky left-0 z-10 px-3.5 py-2.5 border-r shadow-xs font-bold ${
                        isLightMode
                          ? 'bg-amber-100/90 border-amber-200 text-amber-900'
                          : 'bg-slate-900 border-slate-800 text-amber-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1 rounded-md ${
                            isLightMode ? 'bg-amber-200 text-amber-800' : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          <Coffee className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-black">ISTIRAHAT</div>
                          <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400/80">
                            {periodConf.startTime} - {periodConf.endTime}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Break banner spanning across all classes */}
                    <td
                      colSpan={sortedClasses.length}
                      className="px-4 py-2 text-center text-xs font-semibold italic text-amber-700 dark:text-amber-300/80"
                    >
                      ☕ Jam Istirahat Santri & Dewan Asatidz ({periodConf.startTime} s/d {periodConf.endTime})
                    </td>
                  </tr>
                );
              }

              // 2. Regular Period Row
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

              // Items for this period
              const periodItems = sortedClasses
                .map((cls) => itemLookup.get(`${periodConf.period}_${cls.toUpperCase()}`))
                .filter((it): it is ScheduleItem => !!it);

              const hadirCount = periodItems.filter((it) => recordsMap[it.id]?.status === 'hadir').length;
              const tidakHadirCount = periodItems.filter((it) => recordsMap[it.id]?.status === 'tidak_hadir').length;
              const belumCount = periodItems.length - hadirCount - tidakHadirCount;

              return (
                <tr
                  key={periodConf.period}
                  className={`transition-colors ${
                    isCurrent
                      ? isLightMode
                        ? 'bg-blue-50/50'
                        : 'bg-blue-950/20'
                      : isLightMode
                      ? 'hover:bg-slate-50/70'
                      : 'hover:bg-slate-850/40'
                  }`}
                >
                  {/* Sticky Period Header on the left */}
                  <td
                    className={`sticky left-0 z-10 px-3.5 py-2.5 border-r shadow-xs ${
                      isLightMode
                        ? isCurrent
                          ? 'bg-blue-100/90 border-blue-300 text-blue-950'
                          : 'bg-white border-slate-200 text-slate-900'
                        : isCurrent
                        ? 'bg-slate-900 border-blue-800 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-100'
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${
                            isCurrent
                              ? 'bg-blue-600 text-white shadow-xs'
                              : isLightMode
                              ? 'bg-slate-100 text-slate-800 border border-slate-300'
                              : 'bg-slate-800 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {periodConf.name}
                        </span>

                        {isCurrent ? (
                          <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white animate-pulse">
                            Aktif
                          </span>
                        ) : !isPeriodStarted ? (
                          <span className="text-[9px] text-slate-400 font-medium">Belum</span>
                        ) : !isTeachingActive ? (
                          <Lock className="w-2.5 h-2.5 text-slate-400" />
                        ) : null}
                      </div>

                      <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {periodConf.startTime} - {periodConf.endTime}
                      </div>

                      {/* Mini summary badges for this row */}
                      <div className="flex items-center gap-1 text-[9.5px] font-bold mt-0.5">
                        <span
                          className={`px-1.5 py-0.2 rounded ${
                            !isPeriodStarted
                              ? isLightMode
                                ? 'bg-slate-100 text-slate-600 border'
                                : 'bg-slate-800 text-slate-400'
                              : isLightMode
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-blue-900/60 text-blue-300'
                          }`}
                          title="Belum Absen"
                        >
                          {belumCount}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded ${
                            isLightMode
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-emerald-900/60 text-emerald-300'
                          }`}
                          title="Hadir"
                        >
                          {hadirCount}
                        </span>
                        {tidakHadirCount > 0 && (
                          <span
                            className={`px-1.5 py-0.2 rounded ${
                              isLightMode
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-amber-900/60 text-amber-300'
                            }`}
                            title="Tidak Hadir"
                          >
                            {tidakHadirCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Class Cells from Left to Right (largest to smallest) */}
                  {sortedClasses.map((className) => {
                    const item = itemLookup.get(
                      `${periodConf.period}_${className.toUpperCase()}`
                    );

                    return (
                      <td
                        key={`${periodConf.period}_${className}`}
                        className={`p-1.5 align-middle border-r last:border-r-0 ${
                          isLightMode ? 'border-slate-200' : 'border-slate-800'
                        }`}
                      >
                        {item ? (
                          <KeycapCard
                            item={item}
                            record={recordsMap[item.id]}
                            onToggleStatus={onToggleStatus}
                            onOpenDetails={onOpenDetails}
                            isTeachingTimeActive={isTeachingActive}
                            isPeriodStarted={isPeriodStarted}
                            onLockedClick={onLockedClick}
                            lockedEvent={getEventForCard(item)}
                            onLockedActivityClick={onLockedActivityClick}
                          />
                        ) : (
                          <div
                            className={`w-full h-[64px] sm:h-[70px] rounded-xl border border-dashed flex flex-col items-center justify-center p-2 text-center select-none ${
                              isLightMode
                                ? 'border-slate-200 bg-slate-50/50 text-slate-400'
                                : 'border-slate-800/80 bg-slate-900/30 text-slate-600'
                            }`}
                          >
                            <span className="text-[10px] font-medium">- Kosong -</span>
                            <span className="text-[8.5px] opacity-60">Tidak ada KBM</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
