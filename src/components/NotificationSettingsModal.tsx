import React, { useState, useEffect, useRef } from 'react';
import {
  PeriodConfig,
  BellSettingsConfig,
  BellSchedulePreset,
  BellSoundType,
} from '../types/schedule';
import {
  requestNotificationPermission,
} from '../utils/notifications';
import { playPeriodChime, stopChimeSound } from '../utils/audio';
import {
  Bell,
  Volume2,
  Clock,
  Check,
  X,
  Play,
  Square,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Calendar,
  Music,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import {
  DEFAULT_PERIODS,
  DEFAULT_BELL_CONFIG,
  DEFAULT_BELL_PRESETS,
  FRIDAY_PERIODS,
  EXAM_PERIODS,
} from '../data/scheduleData';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: PeriodConfig[];
  onSavePeriods: (periods: PeriodConfig[], bellConfig?: BellSettingsConfig) => void;
  bellConfig?: BellSettingsConfig;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  isLightMode?: boolean;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  periods,
  onSavePeriods,
  bellConfig: initialBellConfig,
  soundEnabled,
  onToggleSound,
  notificationsEnabled,
  onToggleNotifications,
  isLightMode = false,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for full bell configuration
  const [config, setConfig] = useState<BellSettingsConfig>(() => {
    if (initialBellConfig && initialBellConfig.presets) {
      return initialBellConfig;
    }
    const saved = localStorage.getItem('piket_bell_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      ...DEFAULT_BELL_CONFIG,
      presets: {
        ...DEFAULT_BELL_PRESETS,
        reguler: {
          ...DEFAULT_BELL_PRESETS.reguler,
          periods: periods && periods.length > 0 ? periods : DEFAULT_PERIODS,
        },
      },
    };
  });

  // Sound selection state
  const [selectedSoundType, setSelectedSoundType] = useState<BellSoundType>(() => {
    return (
      config.soundType ||
      (localStorage.getItem('piket_bell_sound_type') as BellSoundType) ||
      'westminster'
    );
  });

  const [customAudioName, setCustomAudioName] = useState<string>(() => {
    return (
      config.customSoundName ||
      localStorage.getItem('piket_custom_bell_name') ||
      ''
    );
  });

  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);

  // Which preset is currently being edited in the modal
  const [editingPresetId, setEditingPresetId] = useState<string>('reguler');
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialBellConfig && initialBellConfig.presets) {
        setConfig(initialBellConfig);
        if (initialBellConfig.soundType) {
          setSelectedSoundType(initialBellConfig.soundType);
        }
        if (initialBellConfig.customSoundName) {
          setCustomAudioName(initialBellConfig.customSoundName);
        }
      }
    }
  }, [isOpen, initialBellConfig]);

  const currentPreset: BellSchedulePreset =
    config.presets[editingPresetId] ||
    config.presets.reguler ||
    DEFAULT_BELL_PRESETS.reguler;

  const currentPeriods: PeriodConfig[] = currentPreset.periods || DEFAULT_PERIODS;

  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied';
  });

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionState(res);
    if (res === 'granted') {
      onToggleNotifications(true);
    }
  };

  const handleTestSpecificSound = (type: BellSoundType) => {
    if (playingSoundId === type) {
      stopChimeSound();
      setPlayingSoundId(null);
      return;
    }

    stopChimeSound();
    setPlayingSoundId(type);
    playPeriodChime(type);

    const timeout = type === 'westminster' ? 4500 : 2500;
    setTimeout(() => {
      setPlayingSoundId((curr) => (curr === type ? null : curr));
    }, timeout);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem('piket_custom_bell_audio', dataUrl);
        localStorage.setItem('piket_custom_bell_name', file.name);
        setCustomAudioName(file.name);
        setSelectedSoundType('custom');
        setConfig((prev) => ({
          ...prev,
          soundType: 'custom',
          customSoundName: file.name,
        }));
      } catch (err) {
        alert('Gagal menyimpan file audio ke memori browser. Coba gunakan file yang lebih kecil (<3MB).');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAudio = () => {
    localStorage.removeItem('piket_custom_bell_audio');
    localStorage.removeItem('piket_custom_bell_name');
    setCustomAudioName('');
    setSelectedSoundType('westminster');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Change period fields in the current preset
  const handleUpdatePeriod = (
    index: number,
    field: keyof PeriodConfig,
    value: any
  ) => {
    const updatedPeriods = [...currentPeriods];
    updatedPeriods[index] = {
      ...updatedPeriods[index],
      [field]: value,
    };

    setConfig({
      ...config,
      presets: {
        ...config.presets,
        [editingPresetId]: {
          ...currentPreset,
          periods: updatedPeriods,
        },
      },
    });
  };

  // Add new empty slot to current preset
  const handleAddNewSlot = () => {
    const maxPeriod = currentPeriods.reduce(
      (max, p) => (p.period > max ? p.period : max),
      0
    );
    const nextPeriodNum = maxPeriod + 1;

    let defaultStart = '07:15';
    let defaultEnd = '08:00';
    if (currentPeriods.length > 0) {
      const last = currentPeriods[currentPeriods.length - 1];
      defaultStart = last.endTime;
      const [hStr, mStr] = defaultStart.split(':');
      const totalMin = (parseInt(hStr, 10) || 7) * 60 + (parseInt(mStr, 10) || 0) + 45;
      const endH = String(Math.floor(totalMin / 60) % 24).padStart(2, '0');
      const endM = String(totalMin % 60).padStart(2, '0');
      defaultEnd = `${endH}:${endM}`;
    }

    const newSlot: PeriodConfig = {
      period: nextPeriodNum,
      name: `Jam Ke-${nextPeriodNum}`,
      startTime: defaultStart,
      endTime: defaultEnd,
      isBreak: false,
    };

    const updatedPeriods = [...currentPeriods, newSlot];

    setConfig({
      ...config,
      presets: {
        ...config.presets,
        [editingPresetId]: {
          ...currentPreset,
          periods: updatedPeriods,
        },
      },
    });
  };

  // Delete slot from current preset
  const handleDeleteSlot = (index: number) => {
    if (currentPeriods.length <= 1) {
      alert('Minimal harus ada 1 slot jam.');
      return;
    }
    const updatedPeriods = currentPeriods.filter((_, i) => i !== index);
    setConfig({
      ...config,
      presets: {
        ...config.presets,
        [editingPresetId]: {
          ...currentPreset,
          periods: updatedPeriods,
        },
      },
    });
  };

  // Reset current preset to its default
  const handleResetCurrentPreset = () => {
    let defaultList: PeriodConfig[] = DEFAULT_PERIODS;
    if (editingPresetId === 'jumat') defaultList = FRIDAY_PERIODS;
    if (editingPresetId === 'ujian') defaultList = EXAM_PERIODS;

    setConfig({
      ...config,
      presets: {
        ...config.presets,
        [editingPresetId]: {
          ...currentPreset,
          periods: defaultList,
        },
      },
    });
  };

  // Determine active periods based on activePresetId and today's day
  const calculateActivePeriods = (cfg: BellSettingsConfig): PeriodConfig[] => {
    const today = new Date();
    const isFriday = today.getDay() === 5;

    if (cfg.activePresetId === 'ujian') {
      return cfg.presets.ujian?.periods || EXAM_PERIODS;
    }
    if (cfg.activePresetId === 'jumat') {
      return cfg.presets.jumat?.periods || FRIDAY_PERIODS;
    }
    if (cfg.activePresetId === 'reguler') {
      return cfg.presets.reguler?.periods || DEFAULT_PERIODS;
    }
    // Auto mode
    if (cfg.autoFridaySwitch && isFriday) {
      return cfg.presets.jumat?.periods || FRIDAY_PERIODS;
    }
    return cfg.presets.reguler?.periods || DEFAULT_PERIODS;
  };

  // Save changes
  const handleSave = () => {
    const finalConfig: BellSettingsConfig = {
      ...config,
      soundType: selectedSoundType,
      customSoundName: customAudioName,
    };

    const active = calculateActivePeriods(finalConfig);

    localStorage.setItem('piket_bell_sound_type', selectedSoundType);
    localStorage.setItem('piket_bell_config', JSON.stringify(finalConfig));
    localStorage.setItem('piket_periods_config', JSON.stringify(active));

    onSavePeriods(active, finalConfig);

    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border max-h-[94vh] ${
          isLightMode
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-indigo-700/50 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Pengaturan Jam KBM & Bel Otomatis</span>
              </h3>
              <p className="text-xs text-indigo-200">
                Pilihan jadwal, slot bebas, serta pilihan nada bunyi bel (costumize)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
          {/* SECTION 1: MODE JADWAL AKTIF HARI INI */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isLightMode ? 'bg-indigo-50/70 border-indigo-200' : 'bg-indigo-950/30 border-indigo-800/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Mode Jadwal Berlaku Sekarang:</span>
              </h4>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                Sinkron Cloud Real-Time
              </span>
            </div>

            {/* Radio / Pill Grid for Active Mode */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {/* Option Auto */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, activePresetId: 'auto' })}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  config.activePresetId === 'auto'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">⚡ Otomatis</span>
                  {config.activePresetId === 'auto' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[10px] opacity-80 leading-tight">
                  Senin-Sabtu: Reguler, Jumat: Khusus Jumat
                </span>
              </button>

              {/* Option Reguler */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, activePresetId: 'reguler' })}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  config.activePresetId === 'reguler'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">🏫 Reguler</span>
                  {config.activePresetId === 'reguler' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[10px] opacity-80 leading-tight">
                  Paksa Jadwal Standar (6 Jam)
                </span>
              </button>

              {/* Option Jumat */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, activePresetId: 'jumat' })}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  config.activePresetId === 'jumat'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">🕌 Khusus Jumat</span>
                  {config.activePresetId === 'jumat' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[10px] opacity-80 leading-tight">
                  Jam pendek sebelum Sholat Jumat
                </span>
              </button>

              {/* Option Ujian */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, activePresetId: 'ujian' })}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  config.activePresetId === 'ujian'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">📝 Ujian</span>
                  {config.activePresetId === 'ujian' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className="text-[10px] opacity-80 leading-tight">
                  UTS/UAS (Sesi 90 Menit)
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 2: EDIT DAFTAR JAM & SLOT UNTUK PRESET */}
          <div
            className={`p-3.5 rounded-2xl border space-y-3 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            {/* Tab Navigasi Preset yang diedit */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">Edit Jadwal:</span>
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-200 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setEditingPresetId('reguler')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      editingPresetId === 'reguler'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Reguler
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPresetId('jumat')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      editingPresetId === 'jumat'
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Jumat
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPresetId('ujian')}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      editingPresetId === 'ujian'
                        ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Ujian (PAS/PAT)
                  </button>
                </div>
              </div>

              {/* Tombol Reset Preset */}
              <button
                type="button"
                onClick={handleResetCurrentPreset}
                className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors"
                title="Kembalikan ke susunan standar awal untuk jadwal ini"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Standar</span>
              </button>
            </div>

            {/* Description of current preset */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              {currentPreset.description} — Anda dapat mengubah nama slot, waktu mulai & selesai, atau menambah slot baru.
            </p>

            {/* Table of Period Slots */}
            <div className="space-y-1.5">
              {currentPeriods.map((p, idx) => (
                <div
                  key={idx}
                  className={`flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2.5 rounded-xl border text-xs transition-colors ${
                    p.isBreak
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                      : isLightMode
                      ? 'bg-white border-slate-200 text-slate-800'
                      : 'bg-slate-900 border-slate-800 text-slate-100'
                  }`}
                >
                  {/* Left: Slot Name & Break Toggle */}
                  <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                    <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-bold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>

                    {/* Editable Slot Name */}
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleUpdatePeriod(idx, 'name', e.target.value)}
                      placeholder="Nama jam / slot..."
                      className={`px-2 py-1 rounded-lg border text-xs font-bold w-full max-w-[160px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        isLightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    />

                    {/* Break / Istirahat Chip Toggle */}
                    <button
                      type="button"
                      onClick={() => handleUpdatePeriod(idx, 'isBreak', !p.isBreak)}
                      className={`px-2 py-0.5 rounded text-[9.5px] font-bold border transition-all ${
                        p.isBreak
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-transparent hover:border-slate-400'
                      }`}
                      title="Klik untuk ubah status slot ini (Jam Mengajar vs Jam Istirahat)"
                    >
                      {p.isBreak ? 'Istirahat' : 'KBM'}
                    </button>
                  </div>

                  {/* Middle: Start & End Time Inputs */}
                  <div className="flex items-center gap-1.5 font-mono ml-auto">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-sans">Mulai:</span>
                      <input
                        type="time"
                        value={p.startTime}
                        onChange={(e) => handleUpdatePeriod(idx, 'startTime', e.target.value)}
                        className={`px-1.5 py-1 rounded-lg border font-bold text-xs focus:outline-none focus:border-blue-500 ${
                          isLightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-white'
                        }`}
                      />
                    </div>

                    <span className="text-slate-400">-</span>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-sans">Selesai:</span>
                      <input
                        type="time"
                        value={p.endTime}
                        onChange={(e) => handleUpdatePeriod(idx, 'endTime', e.target.value)}
                        className={`px-1.5 py-1 rounded-lg border font-bold text-xs focus:outline-none focus:border-blue-500 ${
                          isLightMode
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-slate-950 border-slate-700 text-white'
                        }`}
                      />
                    </div>

                    {/* Delete Slot Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors ml-1"
                      title="Hapus slot jam ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Button: + Tambah Slot Kosong Baru */}
            <button
              type="button"
              onClick={handleAddNewSlot}
              className={`w-full py-2 px-3 rounded-xl border border-dashed font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                isLightMode
                  ? 'border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700'
                  : 'border-blue-700/60 bg-blue-950/20 hover:bg-blue-950/40 text-blue-300'
              }`}
            >
              <Plus className="w-4 h-4 text-blue-500" />
              <span>+ Tambah Slot Jam / Bel Baru (Isi Sendiri)</span>
            </button>
          </div>

          {/* SECTION 3: PILIHAN BUNYI / NADA BEL (CUSTOMIZE SOUND) */}
          <div
            className={`p-3.5 rounded-2xl border space-y-3 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs flex items-center gap-1.5">
                <Music className="w-4 h-4 text-amber-500" />
                <span>Pilihan Nada / Bunyi Bel (Customize):</span>
              </h4>
              <span className="text-[10px] text-slate-400">Pilih nada atau upload lagu bel sendiri</span>
            </div>

            {/* Grid Sound Presets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Sound 1: Westminster Chime */}
              <div
                onClick={() => setSelectedSoundType('westminster')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedSoundType === 'westminster'
                    ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">
                    🔔
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1">
                      <span>Melodi Sekolah Standar</span>
                      {selectedSoundType === 'westminster' && (
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Westminster Chime (8 Nada khas)</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestSpecificSound('westminster');
                  }}
                  className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-[10px] flex items-center gap-1 border border-blue-500/30"
                  title="Putar pratinjau nada ini"
                >
                  {playingSoundId === 'westminster' ? (
                    <>
                      <Square className="w-3 h-3 text-amber-500" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-blue-500" />
                      <span>Tes</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sound 2: Ding-Dong */}
              <div
                onClick={() => setSelectedSoundType('dingdong')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedSoundType === 'dingdong'
                    ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs">
                    🛎️
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1">
                      <span>Lonceng Ding-Dong</span>
                      {selectedSoundType === 'dingdong' && (
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Dua nada resonan jernih</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestSpecificSound('dingdong');
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30"
                  title="Putar pratinjau nada ini"
                >
                  {playingSoundId === 'dingdong' ? (
                    <>
                      <Square className="w-3 h-3 text-amber-500" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-emerald-500" />
                      <span>Tes</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sound 3: Digital Beep / Exam Bell */}
              <div
                onClick={() => setSelectedSoundType('digital')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedSoundType === 'digital'
                    ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1">
                      <span>Bel Digital / Ujian</span>
                      {selectedSoundType === 'digital' && (
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Nada elektronik tegas & jelas</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestSpecificSound('digital');
                  }}
                  className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1 border border-amber-500/30"
                  title="Putar pratinjau nada ini"
                >
                  {playingSoundId === 'digital' ? (
                    <>
                      <Square className="w-3 h-3 text-amber-500" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-amber-500" />
                      <span>Tes</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sound 4: Marimba */}
              <div
                onClick={() => setSelectedSoundType('marimba')}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedSoundType === 'marimba'
                    ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-100 border-slate-200'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-xs">
                    🪵
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1">
                      <span>Marimba Alami</span>
                      {selectedSoundType === 'marimba' && (
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">Nada ketukan kayu lembut & sejuk</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestSpecificSound('marimba');
                  }}
                  className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-[10px] flex items-center gap-1 border border-purple-500/30"
                  title="Putar pratinjau nada ini"
                >
                  {playingSoundId === 'marimba' ? (
                    <>
                      <Square className="w-3 h-3 text-amber-500" />
                      <span>Stop</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 text-purple-500" />
                      <span>Tes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Custom Audio Upload Option */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                selectedSoundType === 'custom'
                  ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                  : isLightMode
                  ? 'bg-white border-slate-200'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div
                  className="flex items-center gap-2 cursor-pointer flex-1"
                  onClick={() => {
                    if (customAudioName) setSelectedSoundType('custom');
                    else fileInputRef.current?.click();
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-500 flex items-center justify-center font-bold text-sm">
                    🎵
                  </div>
                  <div>
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>Upload File Audio Bel Sendiri (MP3 / WAV)</span>
                      {selectedSoundType === 'custom' && (
                        <Check className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-[10.5px] text-slate-400">
                      {customAudioName ? (
                        <span className="text-emerald-500 font-semibold font-mono">
                          ✓ File aktif: {customAudioName}
                        </span>
                      ) : (
                        'Gunakan rekaman suara bel pesantren / file audio sendiri (maks. 8MB)'
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {customAudioName && (
                    <button
                      type="button"
                      onClick={() => handleTestSpecificSound('custom')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold text-[10.5px] flex items-center gap-1 border border-emerald-500/30"
                      title="Tes putar file audio Anda"
                    >
                      {playingSoundId === 'custom' ? (
                        <>
                          <Square className="w-3 h-3 text-amber-500" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-emerald-500" />
                          <span>Tes File</span>
                        </>
                      )}
                    </button>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10.5px] flex items-center gap-1 shadow-xs"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{customAudioName ? 'Ganti File' : 'Pilih File Audio'}</span>
                  </button>

                  {customAudioName && (
                    <button
                      type="button"
                      onClick={handleRemoveCustomAudio}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                      title="Hapus file audio kustom"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: TOGGLE NOTIFIKASI & BEL */}
          <div
            className={`p-3.5 rounded-2xl border space-y-3 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <h4 className="font-bold text-xs flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-blue-500" />
              <span>Pengaturan Bel & Layar HP:</span>
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="font-bold">Bunyi Bel Otomatis</div>
                  <div className="text-[11px] text-slate-400">
                    Memutar bunyi bel saat jam pelajaran dimulai
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => onToggleSound(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-bold">Notifikasi Layar HP</div>
                  <div className="text-[11px] text-slate-400">
                    Status izin: <span className="font-semibold text-blue-500">{permissionState}</span>
                  </div>
                </div>
              </div>

              {permissionState !== 'granted' ? (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Izinkan Notifikasi
                </button>
              ) : (
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => onToggleNotifications(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3.5 border-t flex items-center justify-between gap-2 ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="text-[11px] text-slate-400">
            Jadwal: <strong className="text-blue-500 font-bold capitalize">{config.activePresetId}</strong> | Nada:{' '}
            <strong className="text-amber-500 font-bold capitalize">{selectedSoundType}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-bold text-xs"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                isSavedFeedback
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isSavedFeedback ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSavedFeedback ? 'Tersimpan & Sinkron!' : 'Simpan Semua Perubahan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
