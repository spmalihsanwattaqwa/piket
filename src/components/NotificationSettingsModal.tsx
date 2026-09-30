import React, { useState } from 'react';
import { PeriodConfig } from '../types/schedule';
import {
  requestNotificationPermission,
  isNotificationSupported,
} from '../utils/notifications';
import { playPeriodChime } from '../utils/audio';
import {
  Bell,
  Volume2,
  Clock,
  Check,
  X,
  Play,
  Save,
  RotateCcw,
} from 'lucide-react';
import { DEFAULT_PERIODS } from '../data/scheduleData';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: PeriodConfig[];
  onSavePeriods: (periods: PeriodConfig[]) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  periods,
  onSavePeriods,
  soundEnabled,
  onToggleSound,
  notificationsEnabled,
  onToggleNotifications,
}) => {
  if (!isOpen) return null;

  const [periodList, setPeriodList] = useState<PeriodConfig[]>(periods);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Keep periodList in sync whenever modal opens or periods prop changes
  React.useEffect(() => {
    if (isOpen) {
      setPeriodList(periods);
    }
  }, [isOpen, periods]);

  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied';
  });
  const [testChimePlaying, setTestChimePlaying] = useState(false);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      onToggleNotifications(true);
    }
  };

  const handleTestChime = () => {
    setTestChimePlaying(true);
    playPeriodChime();
    setTimeout(() => setTestChimePlaying(false), 2000);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...periodList];
    updated[index] = { ...updated[index], [field]: value };
    setPeriodList(updated);
  };

  const handleResetDefaults = () => {
    setPeriodList(DEFAULT_PERIODS);
  };

  const handleSave = () => {
    onSavePeriods(periodList);
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 border-b border-blue-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pengaturan Waktu Jam Pelajaran & Bel
              </h3>
              <p className="text-xs text-blue-300">
                Ubah jam mulai & selesai (Jam Ke-1 s/d Jam Ke-6) serta nada bel otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto text-xs">
          {/* Schedule Bell & Period Times Table (UTAMA) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Waktu Jam Pelajaran (Jam Mulai & Selesai):
                </h4>
                <p className="text-[11px] text-slate-400">
                  Sesuaikan rentang waktu jam KBM sesuai jadwal pesantren
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10.5px] text-slate-300 hover:text-white flex items-center gap-1 border border-slate-700 transition-colors"
                title="Kembalikan ke jadwal standar awal"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Standar</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {periodList.map((p, idx) => (
                <div
                  key={p.period}
                  className={`
                    flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors
                    ${p.isBreak ? 'bg-amber-950/25 border-amber-800/50 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-100'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{p.name}</span>
                    {p.isBreak && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Istirahat
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 font-sans">Mulai</span>
                      <input
                        type="time"
                        value={p.startTime}
                        onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                        className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <span className="text-slate-500 mt-3">-</span>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-400 font-sans">Selesai</span>
                      <input
                        type="time"
                        value={p.endTime}
                        onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                        className="px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audio Chime & Browser Notification Toggles */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-100 flex items-center gap-1.5 text-xs">
              <Bell className="w-4 h-4 text-blue-400" />
              Pengaturan Bel & Pengingat Masuk Jam:
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold text-slate-200">Bunyi Bel Otomatis</div>
                  <div className="text-[11px] text-slate-400">
                    Memutar nada bel saat awal jam pelajaran tiba
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestChime}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 border border-slate-700"
                  title="Tes bunyi bel"
                >
                  <Play className={`w-3 h-3 ${testChimePlaying ? 'text-amber-400 animate-spin' : ''}`} />
                  <span>Tes Bel</span>
                </button>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => onToggleSound(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold text-slate-200">Notifikasi Pop-up Layar HP</div>
                  <div className="text-[11px] text-slate-400">
                    Izin: <span className="font-semibold text-white">{permissionState}</span>
                  </div>
                </div>
              </div>

              {permissionState !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Izinkan Notifikasi
                </button>
              ) : (
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => onToggleNotifications(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isSavedFeedback
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isSavedFeedback ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSavedFeedback ? 'Tersimpan!' : 'Simpan Jadwal Waktu'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
