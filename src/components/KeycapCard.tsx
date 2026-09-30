import React from 'react';
import { AttendanceRecord, AttendanceStatus, LockedEvent, ScheduleItem } from '../types/schedule';
import { MoreVertical, MessageSquare, Lock, Clock, Calendar } from 'lucide-react';
import { playKeyClickSound } from '../utils/audio';

interface KeycapCardProps {
  item: ScheduleItem;
  record?: AttendanceRecord;
  onToggleStatus: (item: ScheduleItem, nextStatus: AttendanceStatus) => void;
  onOpenDetails: (item: ScheduleItem, record?: AttendanceRecord) => void;
  isTeachingTimeActive?: boolean;
  isPeriodStarted?: boolean;
  onLockedClick?: (item: ScheduleItem) => void;
  lockedEvent?: LockedEvent;
  onLockedActivityClick?: (item: ScheduleItem, event: LockedEvent) => void;
}

export const KeycapCard: React.FC<KeycapCardProps> = ({
  item,
  record,
  onToggleStatus,
  onOpenDetails,
  isTeachingTimeActive = true,
  isPeriodStarted = true,
  onLockedClick,
  lockedEvent,
  onLockedActivityClick,
}) => {
  const status: AttendanceStatus = record ? record.status : 'belum';
  const isClassLockedByEvent = !!lockedEvent;

  // Card is inactive / grey if the period hasn't started yet, hasn't been marked, and not locked by event
  const isInactive = !isClassLockedByEvent && (!isPeriodStarted || !isTeachingTimeActive) && status === 'belum';

  const handleClick = (e: React.MouseEvent) => {
    // If locked by event (Kegiatan)
    if (isClassLockedByEvent) {
      if (onLockedActivityClick && lockedEvent) {
        onLockedActivityClick(item, lockedEvent);
      }
      return;
    }

    // If not active teaching time
    if (!isTeachingTimeActive || !isPeriodStarted) {
      if (onLockedClick) {
        onLockedClick(item);
      }
      return;
    }

    // Cycle: belum -> hadir -> tidak_hadir -> belum
    let next: AttendanceStatus = 'hadir';
    if (status === 'hadir') next = 'tidak_hadir';
    else if (status === 'tidak_hadir') next = 'belum';

    playKeyClickSound(next);
    onToggleStatus(item, next);
  };

  const handleOpenDetailModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenDetails(item, record);
  };

  // Color styles for keyboard embossed design:
  // - Locked by Activity: Oranye / Amber Emboss
  // - Inactive / Belum masuk jam: Abu-abu (Grey)
  // - Belum Absen (jam aktif): Biru (Blue)
  // - Hadir: Hijau (Green)
  // - Tidak Hadir: Kuning (Amber/Yellow)
  const getStyleClasses = () => {
    // 1. Locked by Activity (Kunci Absen Kegiatan)
    if (isClassLockedByEvent) {
      return {
        container:
          'bg-gradient-to-b from-amber-600 via-orange-600 to-orange-700 border-b-[4px] border-[#7c2d12] shadow-[0_3px_6px_rgba(124,45,18,0.4)] hover:from-amber-500 hover:to-orange-600',
        badgeBg: 'bg-orange-950/80 text-orange-200 border-orange-400/50',
        textColor: 'text-white',
      };
    }

    if (status === 'hadir') {
      return {
        container:
          'bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 border-b-[4px] border-[#065f46] shadow-[0_3px_6px_rgba(6,95,70,0.4)] hover:from-emerald-400 hover:to-emerald-600',
        badgeBg: 'bg-emerald-900/70 text-emerald-100 border-emerald-400/30',
        textColor: 'text-white',
      };
    }

    if (status === 'tidak_hadir') {
      return {
        container:
          'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-b-[4px] border-[#92400e] shadow-[0_3px_6px_rgba(146,64,14,0.4)] hover:from-amber-300 hover:to-amber-500',
        badgeBg: 'bg-amber-900/70 text-amber-100 border-amber-300/40',
        textColor: 'text-amber-950',
      };
    }

    // Status is 'belum': Check if inactive (belum masuk jam pelajaran)
    if (isInactive) {
      return {
        container:
          'bg-gradient-to-b from-slate-500 via-slate-600 to-slate-700 border-b-[4px] border-slate-900 shadow-[0_3px_6px_rgba(15,23,42,0.4)] hover:from-slate-450 hover:to-slate-650 opacity-90',
        badgeBg: 'bg-slate-800/80 text-slate-200 border-slate-600/50',
        textColor: 'text-slate-100',
      };
    }

    // Status is 'belum' and teaching time is active: Biru
    return {
      container:
        'bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 border-b-[4px] border-[#1e3a8a] shadow-[0_3px_6px_rgba(30,58,138,0.4)] hover:from-blue-400 hover:to-blue-600',
      badgeBg: 'bg-blue-900/70 text-blue-100 border-blue-400/30',
      textColor: 'text-white',
    };
  };

  const styling = getStyleClasses();

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      title={
        isClassLockedByEvent
          ? `Terkunci Kegiatan: ${lockedEvent?.activity} (${item.className})`
          : isInactive
          ? `Terkunci: Belum masuk jam pelajaran Ke-${item.period}`
          : `Klik untuk catat kehadiran: ${item.subject} (${item.className}) - ${item.teacher}`
      }
      className={`
        relative select-none cursor-pointer rounded-xl font-medium
        transition-all duration-75 active:translate-y-[2px] active:border-b-[2px]
        flex flex-col justify-between overflow-hidden
        border-t border-white/30 border-x border-white/15
        ${styling.container}
        ${isInactive ? 'ring-1 ring-slate-800/60' : 'ring-1 ring-white/20'}
        w-full min-w-0 h-[64px] sm:h-[70px] p-1.5 sm:p-2
      `}
    >
      {/* Top bevel gloss reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/35 pointer-events-none" />

      {/* Card Header: Subject + Class Badge + Menu */}
      <div className="flex items-center justify-between gap-1 w-full">
        <div className="flex items-center gap-1 min-w-0 flex-1">
          <span
            className={`font-bold text-[11px] sm:text-xs tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)] truncate ${
              isInactive ? 'text-slate-100' : 'text-white'
            }`}
          >
            {item.subject}
          </span>
          <span
            className={`
              px-1 py-0.2 rounded text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider
              border shadow-xs flex-shrink-0 ${styling.badgeBg}
            `}
          >
            {item.className}
          </span>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {isClassLockedByEvent ? (
            <span title={`Terkunci: ${lockedEvent?.activity}`}>
              <Lock className="w-2.5 h-2.5 text-amber-200" />
            </span>
          ) : isInactive ? (
            <span title="Belum masuk jam pelajaran">
              <Clock className="w-2.5 h-2.5 text-slate-300/80" />
            </span>
          ) : !isTeachingTimeActive ? (
            <span title="Terkunci di luar jam KBM">
              <Lock className="w-2.5 h-2.5 text-white/70" />
            </span>
          ) : null}

          <button
            onClick={handleOpenDetailModal}
            className="p-0.5 rounded text-white/80 hover:text-white hover:bg-black/20 transition-colors"
            title="Keterangan / Guru Pengganti"
          >
            {record?.note || record?.substituteTeacher || record?.reason ? (
              <MessageSquare className="w-3 h-3 text-yellow-200 animate-pulse" />
            ) : (
              <MoreVertical className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Card Footer: Teacher Name or Locked Activity */}
      <div className="mt-auto w-full text-left">
        {isClassLockedByEvent ? (
          <p
            className="font-bold text-[9.5px] sm:text-[10px] text-amber-100 truncate flex items-center gap-1 leading-tight"
            title={`Kegiatan: ${lockedEvent?.activity}`}
          >
            <span>🔒</span>
            <span className="truncate">{lockedEvent?.activity}</span>
          </p>
        ) : (
          <p
            className={`font-medium text-[9.5px] sm:text-[11px] truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] leading-tight ${
              isInactive ? 'text-slate-200' : 'text-white/95'
            }`}
            title={item.teacher}
          >
            {item.teacher}
          </p>
        )}

        {record?.substituteTeacher && (
          <p className="text-[8.5px] sm:text-[9px] text-yellow-200 italic truncate leading-none mt-0.5">
            Badil: {record.substituteTeacher}
          </p>
        )}
      </div>
    </div>
  );
};
