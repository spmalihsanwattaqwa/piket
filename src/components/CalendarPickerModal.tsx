import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { DayOfWeek } from '../types/schedule';
import { getDayNameFromDate } from '../data/scheduleData';

interface CalendarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  isLightMode?: boolean;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_LABELS = ['Ahad', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onSelectDate,
  isLightMode = false,
}) => {
  if (!isOpen) return null;

  // Initial view year & month from selectedDate
  const initialDate = new Date(selectedDate + 'T00:00:00');
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear() || new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth() || new Date().getMonth());

  // Today string
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };
  const todayStr = getTodayStr();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleDayClick = (dayNumber: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(dayNumber).padStart(2, '0');
    const dateFormatted = `${viewYear}-${mStr}-${dStr}`;
    onSelectDate(dateFormatted);
    onClose();
  };

  const handleQuickJump = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateFormatted = `${y}-${m}-${day}`;
    onSelectDate(dateFormatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col border transition-colors ${
          isLightMode
            ? 'bg-white border-slate-300 text-slate-800'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-3.5 bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-white/20">
              <CalendarIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">Pilih Tanggal Absensi</h3>
              <p className="text-[11px] text-blue-100">
                {selectedDate} ({getDayNameFromDate(selectedDate) || 'Ahad'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Month & Year Bar */}
        <div
          className={`px-4 py-2.5 flex items-center justify-between border-b ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <button
            type="button"
            onClick={handlePrevMonth}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLightMode
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-sm tracking-wide">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className={`p-1.5 rounded-lg border transition-colors ${
              isLightMode
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-3.5 space-y-2">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold">
            {DAY_LABELS.map((dayLabel, idx) => (
              <span
                key={dayLabel}
                className={`py-1 ${
                  idx === 0
                    ? 'text-rose-500' // Ahad (Sunday)
                    : idx === 5
                    ? 'text-emerald-500' // Jum'at (Friday)
                    : isLightMode
                    ? 'text-slate-500'
                    : 'text-slate-400'
                }`}
              >
                {dayLabel}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for start padding */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-9 w-full" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const mStr = String(viewMonth + 1).padStart(2, '0');
              const dStr = String(dayNum).padStart(2, '0');
              const thisDateStr = `${viewYear}-${mStr}-${dStr}`;

              const isSelected = thisDateStr === selectedDate;
              const isToday = thisDateStr === todayStr;
              const dayOfWeek = (firstDayOfMonth + index) % 7;
              const isSunday = dayOfWeek === 0;

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleDayClick(dayNum)}
                  className={`
                    h-9 w-full rounded-xl text-xs font-bold transition-all relative flex flex-col items-center justify-center
                    ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                        : isToday
                        ? isLightMode
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50'
                        : isSunday
                        ? isLightMode
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-rose-400 hover:bg-rose-950/30'
                        : isLightMode
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-800'
                    }
                  `}
                >
                  <span>{dayNum}</span>
                  {isToday && (
                    <span className="w-1 h-1 rounded-full bg-emerald-400 absolute bottom-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Shortcuts */}
        <div
          className={`p-3 border-t flex flex-wrap items-center justify-between gap-1.5 text-xs ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleQuickJump(-1)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                isLightMode
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              Kemarin
            </button>
            <button
              type="button"
              onClick={() => handleQuickJump(0)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs"
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => handleQuickJump(1)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                isLightMode
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              Besok
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1 rounded-lg font-bold text-[11px] ${
              isLightMode ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
