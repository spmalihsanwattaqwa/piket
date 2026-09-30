import React from 'react';
import { AttendanceRecord, AttendanceStatus, LockedEvent, PeriodConfig, ScheduleItem } from '../types/schedule';
import { KeycapCard } from './KeycapCard';
import { Clock, Coffee, Lock } from 'lucide-react';
import { getClassRank, isBaninClass, isBanatClass } from '../data/scheduleData';

interface PeriodColumnProps {
  periodConfig: PeriodConfig;
  items: ScheduleItem[];
  recordsMap: Record<string, AttendanceRecord>;
  onToggleStatus: (item: ScheduleItem, nextStatus: AttendanceStatus) => void;
  onOpenDetails: (item: ScheduleItem, record?: AttendanceRecord) => void;
  isCurrentPeriod: boolean;
  isTeachingTimeActive: boolean;
  isPeriodStarted: boolean;
  onLockedClick: (item: ScheduleItem) => void;
  isLightMode?: boolean;
  lockedEvents?: LockedEvent[];
  onLockedActivityClick?: (item: ScheduleItem, event: LockedEvent) => void;
}

export const PeriodColumn: React.FC<PeriodColumnProps> = ({
  periodConfig,
  items,
  recordsMap,
  onToggleStatus,
  onOpenDetails,
  isCurrentPeriod,
  isTeachingTimeActive,
  isPeriodStarted,
  onLockedClick,
  isLightMode = false,
  lockedEvents = [],
  onLockedActivityClick,
}) => {
  // Helper to find lock event for a card
  const getEventForCard = (item: ScheduleItem): LockedEvent | undefined => {
    return lockedEvents.find((evt) => {
      if (evt.targetClasses === 'semua') return true;
      if (evt.targetClasses === 'banin' && isBaninClass(item.className)) return true;
      if (evt.targetClasses === 'banat' && isBanatClass(item.className)) return true;
      return false;
    });
  };

  // If it's a break period
  if (periodConfig.isBreak) {
    return (
      <div
        className={`
          flex-shrink-0 w-28 sm:w-32 rounded-2xl border p-2.5 flex flex-col items-center justify-center text-center
          min-h-[200px] sm:min-h-[300px] transition-all
          ${
            isLightMode
              ? isCurrentPeriod
                ? 'bg-amber-100 border-amber-400 shadow-md ring-2 ring-amber-400/40 text-amber-950'
                : 'bg-amber-50/60 border-amber-200 text-amber-800'
              : isCurrentPeriod
              ? 'bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-500/40 text-amber-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-400'
          }
        `}
      >
        <div
          className={`p-2 rounded-xl mb-2 ${
            isLightMode ? 'bg-amber-200 text-amber-800' : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          <Coffee className="w-5 h-5" />
        </div>
        <span
          className={`font-bold text-xs uppercase tracking-wider ${
            isLightMode ? 'text-amber-900' : 'text-amber-100'
          }`}
        >
          Istirahat
        </span>
        <span
          className={`text-[11px] font-mono mt-1 ${
            isLightMode ? 'text-amber-800' : 'text-amber-300/80'
          }`}
        >
          {periodConfig.startTime}
        </span>
        <span
          className={`text-[10px] font-mono ${
            isLightMode ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          s/d
        </span>
        <span
          className={`text-[11px] font-mono ${
            isLightMode ? 'text-amber-800' : 'text-amber-300/80'
          }`}
        >
          {periodConfig.endTime}
        </span>
        {isCurrentPeriod && (
          <span className="mt-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white animate-pulse">
            Sedang Istirahat
          </span>
        )}
      </div>
    );
  }

  // Count statuses
  const total = items.length;
  const hadir = items.filter((it) => recordsMap[it.id]?.status === 'hadir').length;
  const tidakHadir = items.filter((it) => recordsMap[it.id]?.status === 'tidak_hadir').length;
  const lockedCount = items.filter((it) => !!getEventForCard(it)).length;
  const belum = total - hadir - tidakHadir;

  return (
    <div
      className={`
        flex-shrink-0 w-[300px] sm:w-[185px] rounded-2xl border flex flex-col transition-all duration-200
        ${
          isLightMode
            ? isCurrentPeriod
              ? 'bg-blue-50/70 border-blue-400 shadow-md ring-2 ring-blue-400/40'
              : isPeriodStarted
              ? 'bg-white border-slate-200 shadow-xs'
              : 'bg-slate-50/80 border-slate-200 opacity-90'
            : isCurrentPeriod
            ? 'bg-slate-900/95 border-blue-500 shadow-lg ring-2 ring-blue-500/40'
            : isPeriodStarted
            ? 'bg-slate-900/75 border-slate-750'
            : 'bg-slate-900/50 border-slate-800/80 opacity-90'
        }
      `}
    >
      {/* Column Header */}
      <div
        className={`
          p-2.5 rounded-t-2xl border-b flex flex-col gap-1.5 transition-colors
          ${
            isLightMode
              ? isCurrentPeriod
                ? 'bg-blue-100/70 border-blue-200'
                : isPeriodStarted
                ? 'bg-slate-100/80 border-slate-200'
                : 'bg-slate-100/50 border-slate-200'
              : isCurrentPeriod
              ? 'bg-blue-950/60 border-blue-800/80'
              : isPeriodStarted
              ? 'bg-slate-850/80 border-slate-800/80'
              : 'bg-slate-900/60 border-slate-850/60'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`
                px-2 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider
                ${
                  isCurrentPeriod
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isLightMode
                    ? isPeriodStarted
                      ? 'bg-white text-slate-800 border border-slate-300 shadow-xs'
                      : 'bg-slate-200 text-slate-600 border border-slate-300'
                    : isPeriodStarted
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-slate-850 text-slate-400 border border-slate-750'
                }
              `}
            >
              {periodConfig.name}
            </span>
          </div>

          {/* Locked / Active Badge */}
          {isCurrentPeriod ? (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500 text-white animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
              Aktif
            </span>
          ) : !isPeriodStarted ? (
            <span
              className={`flex items-center gap-1 text-[10px] ${
                isLightMode ? 'text-slate-500' : 'text-slate-400'
              }`}
              title="Belum masuk jam pelajaran"
            >
              <Clock className="w-3 h-3" />
              <span className="text-[9px]">Belum</span>
            </span>
          ) : !isTeachingTimeActive ? (
            <span
              className={`flex items-center gap-1 text-[10px] ${
                isLightMode ? 'text-slate-400' : 'text-slate-500'
              }`}
              title="Di luar jam aktif KBM"
            >
              <Lock className="w-3 h-3" />
            </span>
          ) : null}
        </div>

        {/* Time and Color Counters */}
        <div className="flex items-center justify-between text-[11px]">
          <div
            className={`flex items-center gap-1 font-mono text-[10px] ${
              isLightMode ? 'text-slate-600' : 'text-slate-400'
            }`}
          >
            <Clock className={`w-3 h-3 ${isLightMode ? 'text-slate-400' : 'text-slate-500'}`} />
            <span>
              {periodConfig.startTime} - {periodConfig.endTime}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold">
            {lockedCount > 0 && (
              <span
                className="px-1.5 py-0.2 rounded bg-orange-950/70 text-orange-300 border border-orange-600/40"
                title={`${lockedCount} Kelas Dikunci Kegiatan`}
              >
                🔒 {lockedCount}
              </span>
            )}
            {/* If period has not started, show grey badge for belum; otherwise blue badge */}
            <span
              className={`px-1.5 py-0.2 rounded ${
                !isPeriodStarted
                  ? isLightMode
                    ? 'bg-slate-200 text-slate-700 border border-slate-300'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                  : isLightMode
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-blue-900/60 text-blue-300'
              }`}
              title={!isPeriodStarted ? 'Belum Masuk Jam (Abu-abu)' : 'Belum Absen (Biru)'}
            >
              {belum}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded ${
                isLightMode
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-emerald-900/60 text-emerald-300'
              }`}
              title="Hadir (Hijau)"
            >
              {hadir}
            </span>
            {tidakHadir > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded ${
                  isLightMode
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-amber-900/60 text-amber-300'
                }`}
                title="Tidak Hadir (Kuning)"
              >
                {tidakHadir}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Cards List:
          - NO independent scroll (perbaiki scrol mandiri tiap jam menjadi scrol semua jam)
          - HP View: 2 columns (grid grid-cols-2) so all cards are visible at a glance without scroll!
          - Desktop View: standard vertical stack (sm:flex sm:flex-col)
      */}
      <div className="p-2 grid grid-cols-2 gap-1.5 sm:flex sm:flex-col sm:space-y-2 sm:gap-0">
        {items.length === 0 ? (
          <div
            className={`col-span-2 py-8 text-center text-xs italic ${
              isLightMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Kosong
          </div>
        ) : (
          [...items]
            .sort((a, b) => getClassRank(b.className) - getClassRank(a.className))
            .map((item) => (
              <KeycapCard
                key={item.id}
                item={item}
                record={recordsMap[item.id]}
                onToggleStatus={onToggleStatus}
                onOpenDetails={onOpenDetails}
                isTeachingTimeActive={isTeachingTimeActive}
                isPeriodStarted={isPeriodStarted}
                onLockedClick={onLockedClick}
                lockedEvent={getEventForCard(item)}
                onLockedActivityClick={onLockedActivityClick}
              />
            ))
        )}
      </div>
    </div>
  );
};
