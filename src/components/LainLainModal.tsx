import React, { useState } from 'react';
import {
  AttendanceRecord,
  AttendanceStatus,
  DayOfWeek,
  LockedClassTarget,
  LockedEvent,
  PiketDutyRecord,
} from '../types/schedule';
import { TEACHERS_LIST, CLASSES_LIST } from '../data/scheduleData';
import {
  X,
  Save,
  Lock,
  Trash2,
  Calendar,
  UserCheck,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { playKeyClickSound } from '../utils/audio';

interface LainLainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomRecord: (record: AttendanceRecord) => void;
  dateStr: string;
  dayName: DayOfWeek;
  lockedEvents: LockedEvent[];
  onAddLockedEvent: (event: Omit<LockedEvent, 'id' | 'createdAt'>) => void;
  onDeleteLockedEvent: (id: string) => void;
  piketDuties: PiketDutyRecord[];
  onAddPiketDuty: (duty: Omit<PiketDutyRecord, 'id' | 'createdAt'>) => void;
  onDeletePiketDuty: (id: string) => void;
  isLightMode?: boolean;
}

export const LainLainModal: React.FC<LainLainModalProps> = ({
  isOpen,
  onClose,
  onAddCustomRecord,
  dateStr,
  dayName,
  lockedEvents,
  onAddLockedEvent,
  onDeleteLockedEvent,
  piketDuties,
  onAddPiketDuty,
  onDeletePiketDuty,
  isLightMode = false,
}) => {
  if (!isOpen) return null;

  // Active tab: 'badil' | 'kunci' | 'piket'
  const [activeTab, setActiveTab] = useState<'badil' | 'kunci' | 'piket'>('badil');

  // Form state for Badil / Guru Tambahan
  const [teacher, setTeacher] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');
  const [period, setPeriod] = useState<number>(1);
  const [status, setStatus] = useState<AttendanceStatus>('hadir');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');

  // Form state for Kunci Absen Kegiatan
  const [lockDate, setLockDate] = useState(dateStr);
  const [lockActivity, setLockActivity] = useState('');
  const [lockTargetClasses, setLockTargetClasses] = useState<LockedClassTarget>('semua');
  const [lockSuccessMessage, setLockSuccessMessage] = useState<string | null>(null);

  // Form state for Data Petugas Piket
  const [piketTeacher, setPiketTeacher] = useState('');
  const [piketStartTime, setPiketStartTime] = useState('07:00');
  const [piketEndTime, setPiketEndTime] = useState('12:15');
  const [piketDay, setPiketDay] = useState<DayOfWeek | 'SEMUA'>(dayName || 'SENIN');
  const [piketNote, setPiketNote] = useState('');
  const [piketSuccessMessage, setPiketSuccessMessage] = useState<string | null>(null);

  // Handle submit Badil / Tugas Tambahan
  const handleBadilSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher.trim() || !subject.trim()) {
      alert('Mohon isi nama guru dan kegiatan/mata pelajaran.');
      return;
    }

    const customId = `custom_${Date.now()}`;
    const newRecord: AttendanceRecord = {
      id: `${dateStr}_${customId}`,
      date: dateStr,
      scheduleId: customId,
      teacher: teacher.trim(),
      subject: subject.trim(),
      className: className.trim() || 'Umum',
      day: dayName,
      period,
      status,
      reason: status === 'tidak_hadir' ? (reason || 'Tidak Hadir') : undefined,
      note: note.trim() ? `[Lain-Lain] ${note.trim()}` : '[Kegiatan Khusus/Pengganti]',
      updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    playKeyClickSound(status);
    onAddCustomRecord(newRecord);
    onClose();
  };

  // Handle submit Kunci Absen Kegiatan
  const handleLockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockActivity.trim()) {
      alert('Mohon ketik nama kegiatan.');
      return;
    }

    onAddLockedEvent({
      date: lockDate,
      activity: lockActivity.trim(),
      targetClasses: lockTargetClasses,
    });

    setLockSuccessMessage(
      `Berhasil mengunci absen untuk ${
        lockTargetClasses === 'semua'
          ? 'Semua Kelas'
          : lockTargetClasses === 'banin'
          ? 'Kelas Banin'
          : 'Kelas Banat'
      } pada tanggal ${lockDate}!`
    );
    setLockActivity('');
    setTimeout(() => setLockSuccessMessage(null), 3500);
  };

  // Handle submit Data Petugas Piket
  const handlePiketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!piketTeacher.trim()) {
      alert('Mohon isi atau pilih nama guru piket.');
      return;
    }

    onAddPiketDuty({
      teacherName: piketTeacher.trim(),
      startTime: piketStartTime,
      endTime: piketEndTime,
      day: piketDay,
      note: piketNote.trim() || undefined,
    });

    setPiketSuccessMessage(`Jadwal guru piket ${piketTeacher.trim()} (${piketDay === 'SEMUA' ? 'Setiap Hari' : 'Hari ' + piketDay}, ${piketStartTime} - ${piketEndTime}) berhasil disimpan!`);
    setPiketTeacher('');
    setPiketNote('');
    setTimeout(() => setPiketSuccessMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border transition-colors ${
          isLightMode
            ? 'bg-white border-slate-300 text-slate-800'
            : 'bg-slate-900 border-orange-500/40 text-slate-100'
        }`}
      >
        {/* Header with School Branding */}
        <div className="p-4 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 border-b border-orange-700/80 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-orange-950/40 border border-orange-300/40 font-black text-xs tracking-wider">
              LAIN - LAIN
            </span>
            <h3 className="text-sm sm:text-base font-bold">
              Fitur Tambahan, Kunci, & Data Piket
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-black/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation: 3 Tabs */}
        <div
          className={`flex border-b text-[11px] sm:text-xs font-bold overflow-x-auto ${
            isLightMode ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
          }`}
        >
          <button
            type="button"
            onClick={() => setActiveTab('badil')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'badil'
                ? 'border-orange-500 text-orange-500 bg-orange-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Badil / Tambahan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kunci')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'kunci'
                ? 'border-orange-500 text-orange-500 bg-orange-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Kunci Absen</span>
            {lockedEvents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-orange-600 text-white font-black">
                {lockedEvents.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('piket')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'piket'
                ? 'border-orange-500 text-orange-500 bg-orange-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Data Piket</span>
            {piketDuties.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-blue-600 text-white font-black">
                {piketDuties.length}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: FORM GURU PENGGANTI / BADIL                         */}
        {/* ========================================================= */}
        {activeTab === 'badil' && (
          <form onSubmit={handleBadilSubmit} className="p-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold mb-1">
                Nama Guru / Ustadz:
              </label>
              <input
                list="teacher-names"
                type="text"
                required
                placeholder="Pilih atau ketik nama guru..."
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 ${
                  isLightMode
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
              <datalist id="teacher-names">
                {TEACHERS_LIST.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold mb-1">
                  Kegiatan / Mapel:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengajian, Badil Nahwu..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Kelas:
                </label>
                <input
                  list="class-names"
                  type="text"
                  placeholder="Contoh: 1A1, 2B, Umum..."
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
                <datalist id="class-names">
                  {CLASSES_LIST.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold mb-1">
                  Pada Jam Ke-:
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  {[1, 2, 3, 4, 5, 6].map((p) => (
                    <option key={p} value={p}>
                      Jam Ke-{p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Status Kehadiran:
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                >
                  <option value="hadir">Hadir (Hijau)</option>
                  <option value="tidak_hadir">Tidak Hadir (Kuning)</option>
                  <option value="belum">Belum Absen (Biru)</option>
                </select>
              </div>
            </div>

            {status === 'tidak_hadir' && (
              <div>
                <label className="block font-semibold text-amber-500 mb-1">
                  Alasan:
                </label>
                <input
                  type="text"
                  placeholder="Sakit / Izin / Dinas Luar..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-amber-500 ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1">
                Keterangan / Catatan:
              </label>
              <textarea
                rows={2}
                placeholder="Catatan tambahan piket..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 resize-none ${
                  isLightMode
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-3.5 py-1.5 rounded-xl border ${
                  isLightMode
                    ? 'border-slate-300 text-slate-600 hover:bg-slate-100'
                    : 'border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold border-b-2 border-orange-800 shadow-md flex items-center gap-1.5 active:translate-y-0.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Kartu</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 2: KUNCI ABSEN KEGIATAN                                */}
        {/* ========================================================= */}
        {activeTab === 'kunci' && (
          <div className="p-4 space-y-4 text-xs overflow-y-auto max-h-[calc(85vh-120px)]">
            <form onSubmit={handleLockSubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-orange-950/20 border border-orange-500/30 space-y-1">
                <span className="font-bold text-orange-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Kunci Absen Kegiatan / Ujian
                </span>
                <p className="text-[11px] text-slate-400">
                  Gunakan fitur ini saat santri mengikuti ujian, outbound, apel, atau agenda khusus sehingga absen KBM reguler tidak diperlukan.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tanggal Kegiatan:</span>
                </label>
                <input
                  type="date"
                  required
                  value={lockDate}
                  onChange={(e) => setLockDate(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 font-bold ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Nama Kegiatan / Agenda:
                </label>
                <input
                  list="activity-suggestions"
                  type="text"
                  required
                  placeholder="Contoh: Ujian Semester, Outbound, Apel Akbar..."
                  value={lockActivity}
                  onChange={(e) => setLockActivity(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-orange-500 ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
                <datalist id="activity-suggestions">
                  <option value="Ujian Semester" />
                  <option value="Pondok Ramadhan" />
                  <option value="Outbound / Rihlah" />
                  <option value="Apel Akbar" />
                  <option value="Bakti Sosial" />
                  <option value="Libur Khusus" />
                  <option value="Kegiatan Pondok" />
                </datalist>
              </div>

              <div>
                <label className="block font-semibold mb-1.5">
                  Kelas yang Dikunci:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLockTargetClasses('semua')}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      lockTargetClasses === 'semua'
                        ? 'bg-orange-600 text-white border-orange-700 shadow-sm'
                        : isLightMode
                        ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    Semua Kelas
                  </button>

                  <button
                    type="button"
                    onClick={() => setLockTargetClasses('banin')}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      lockTargetClasses === 'banin'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : isLightMode
                        ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    Kelas Banin (A)
                  </button>

                  <button
                    type="button"
                    onClick={() => setLockTargetClasses('banat')}
                    className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                      lockTargetClasses === 'banat'
                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                        : isLightMode
                        ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                        : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    Kelas Banat (B)
                  </button>
                </div>
              </div>

              {lockSuccessMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{lockSuccessMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:translate-y-0.5 text-white font-bold text-xs border-b-2 border-orange-900 shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Kunci Absen Kegiatan Ini</span>
              </button>
            </form>

            {/* List of Active Lock Rules */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <h5 className="font-bold flex items-center justify-between text-slate-300">
                <span>Daftar Kunci Absen Aktif:</span>
                <span className="text-[10px] text-slate-500">
                  {lockedEvents.length} aturan aktif
                </span>
              </h5>

              {lockedEvents.length === 0 ? (
                <p className="text-slate-500 text-[11px] italic py-2 text-center">
                  Belum ada kelas yang dikunci kegiatan.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {lockedEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isLightMode
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs truncate text-orange-400">
                            🔒 {evt.activity}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                              evt.targetClasses === 'semua'
                                ? 'bg-orange-950 text-orange-200 border border-orange-700/50'
                                : evt.targetClasses === 'banin'
                                ? 'bg-blue-950 text-blue-200 border border-blue-700/50'
                                : 'bg-purple-950 text-purple-200 border border-purple-700/50'
                            }`}
                          >
                            {evt.targetClasses === 'semua'
                              ? 'Semua Kelas'
                              : evt.targetClasses === 'banin'
                              ? 'Banin (A)'
                              : 'Banat (B)'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Tanggal: {evt.date}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteLockedEvent(evt.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/50 transition-colors"
                        title="Buka Kunci / Hapus Aturan Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DATA PETUGAS PIKET (INPUT GURU, DARI JAM, SAMPAI JAM) */}
        {/* ========================================================= */}
        {activeTab === 'piket' && (
          <div className="p-4 space-y-4 text-xs overflow-y-auto max-h-[calc(85vh-120px)]">
            <form onSubmit={handlePiketSubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-1">
                <span className="font-bold text-blue-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Jadwal Guru Piket Bertugas
                </span>
                <p className="text-[11px] text-slate-400">
                  Nama guru piket yang jam tugasnya sedang berlangsung akan otomatis tampil di layar utama aplikasi.
                </p>
              </div>

              {/* Nama Guru Piket */}
              <div>
                <label className="block font-semibold mb-1">
                  Nama Guru Piket:
                </label>
                <input
                  list="piket-teacher-list"
                  type="text"
                  required
                  placeholder="Pilih atau ketik nama guru piket..."
                  value={piketTeacher}
                  onChange={(e) => setPiketTeacher(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
                <datalist id="piket-teacher-list">
                  {TEACHERS_LIST.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>

              {/* Rentang Jam: Dari Jam s/d Sampai Jam */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>Dari Jam:</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={piketStartTime}
                    onChange={(e) => setPiketStartTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-mono font-bold ${
                      isLightMode
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>Sampai Jam:</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={piketEndTime}
                    onChange={(e) => setPiketEndTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 font-mono font-bold ${
                      isLightMode
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Hari Pelaksanaan Piket */}
              <div>
                <label className="block font-semibold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hari Piket:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Pilih hari jadwal bertugas
                  </span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {(['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'SEMUA'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPiketDay(d)}
                      className={`py-2 px-1 rounded-xl border text-center font-bold text-xs transition-all ${
                        piketDay === d
                          ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-1 ring-blue-400/50'
                          : isLightMode
                          ? 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                          : 'bg-slate-950 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {d === 'SEMUA' ? 'Semua Hari' : d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keterangan / Pos */}
              <div>
                <label className="block font-semibold mb-1">
                  Catatan / Pos Piket (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kantor Utama, Gedung Banin..."
                  value={piketNote}
                  onChange={(e) => setPiketNote(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:border-blue-500 ${
                    isLightMode
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              {piketSuccessMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{piketSuccessMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:translate-y-0.5 text-white font-bold text-xs border-b-2 border-indigo-900 shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Jadwal Guru Piket</span>
              </button>
            </form>

            {/* List of Registered Piket Duties */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <h5 className="font-bold flex items-center justify-between text-slate-300">
                <span>Daftar Guru Piket Terdaftar:</span>
                <span className="text-[10px] text-slate-500">
                  {piketDuties.length} petugas
                </span>
              </h5>

              {piketDuties.length === 0 ? (
                <p className="text-slate-500 text-[11px] italic py-2 text-center">
                  Belum ada jadwal guru piket yang ditambahkan.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {piketDuties.map((duty) => (
                    <div
                      key={duty.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        isLightMode
                          ? 'bg-slate-50 border-slate-200 text-slate-800'
                          : 'bg-slate-950 border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs truncate text-blue-400">
                            👤 {duty.teacherName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800/50">
                            {duty.startTime} - {duty.endTime}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.2 rounded font-black text-[9px] bg-blue-900/40 text-blue-300 border border-blue-700/40">
                            Hari: {duty.day === 'SEMUA' ? 'Semua Hari' : duty.day}
                          </span>
                          {duty.note && <span>• {duty.note}</span>}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeletePiketDuty(duty.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/50 transition-colors"
                        title="Hapus Jadwal Piket Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer for all tabs */}
        <div
          className={`p-3 border-t flex justify-end ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold ${
              isLightMode ? 'bg-slate-200 hover:bg-slate-300' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
