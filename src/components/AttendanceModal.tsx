import React, { useState, useEffect } from 'react';
import { AttendanceRecord, AttendanceStatus, ScheduleItem } from '../types/schedule';
import { Check, X, Clock, UserCheck, AlertCircle, Save } from 'lucide-react';
import { TEACHERS_LIST } from '../data/scheduleData';
import { playKeyClickSound } from '../utils/audio';

interface AttendanceModalProps {
  isOpen: boolean;
  item: ScheduleItem | null;
  record?: AttendanceRecord;
  onClose: () => void;
  onSave: (record: AttendanceRecord) => void;
  dateStr: string;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  item,
  record,
  onClose,
  onSave,
  dateStr,
}) => {
  if (!isOpen || !item) return null;

  const [status, setStatus] = useState<AttendanceStatus>(record?.status || 'belum');
  const [reason, setReason] = useState<string>(record?.reason || '');
  const [substituteTeacher, setSubstituteTeacher] = useState<string>(record?.substituteTeacher || '');
  const [note, setNote] = useState<string>(record?.note || '');
  const [piketName, setPiketName] = useState<string>(record?.piketName || '');

  useEffect(() => {
    if (record) {
      setStatus(record.status);
      setReason(record.reason || '');
      setSubstituteTeacher(record.substituteTeacher || '');
      setNote(record.note || '');
      setPiketName(record.piketName || '');
    } else {
      setStatus('belum');
      setReason('');
      setSubstituteTeacher('');
      setNote('');
    }
  }, [record, item]);

  const handleSelectStatus = (newStatus: AttendanceStatus) => {
    setStatus(newStatus);
    playKeyClickSound(newStatus);
    if (newStatus === 'hadir') {
      if (reason === 'Sakit' || reason === 'Izin' || reason === 'Alpa') {
        setReason('');
      }
    }
  };

  const handleSave = () => {
    const updated: AttendanceRecord = {
      id: record?.id || `${dateStr}_${item.id}`,
      date: dateStr,
      scheduleId: item.id,
      teacher: item.teacher,
      subject: item.subject,
      className: item.className,
      day: item.day,
      period: item.period,
      status,
      reason: status === 'tidak_hadir' ? (reason || 'Tidak Hadir') : reason,
      substituteTeacher: substituteTeacher.trim() || undefined,
      note: note.trim() || undefined,
      piketName: piketName.trim() || undefined,
      updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/80 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Jam Ke-{item.period}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-200 border border-slate-600">
                Kelas {item.className}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {item.subject}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Guru: {item.teacher}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Status Selection Buttons in Embossed Keyboard Style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Pilih Status Kehadiran:
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Belum Absen Button (Biru) */}
              <button
                type="button"
                onClick={() => handleSelectStatus('belum')}
                className={`
                  p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs select-none transition-all
                  ${
                    status === 'belum'
                      ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-b-4 border-blue-900 ring-2 ring-blue-300 shadow-md translate-y-[1px]'
                      : 'bg-slate-800 text-slate-300 border-b-4 border-slate-950 hover:bg-slate-750 opacity-75'
                  }
                `}
              >
                <Clock className="w-4 h-4" />
                <span>Belum</span>
              </button>

              {/* Hadir Button (Hijau) */}
              <button
                type="button"
                onClick={() => handleSelectStatus('hadir')}
                className={`
                  p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs select-none transition-all
                  ${
                    status === 'hadir'
                      ? 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border-b-4 border-emerald-900 ring-2 ring-emerald-300 shadow-md translate-y-[1px]'
                      : 'bg-slate-800 text-slate-300 border-b-4 border-slate-950 hover:bg-slate-750 opacity-75'
                  }
                `}
              >
                <Check className="w-4 h-4" />
                <span>Hadir</span>
              </button>

              {/* Tidak Hadir Button (Kuning) */}
              <button
                type="button"
                onClick={() => handleSelectStatus('tidak_hadir')}
                className={`
                  p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-xs select-none transition-all
                  ${
                    status === 'tidak_hadir'
                      ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-amber-950 border-b-4 border-amber-900 ring-2 ring-amber-200 shadow-md translate-y-[1px]'
                      : 'bg-slate-800 text-slate-300 border-b-4 border-slate-950 hover:bg-slate-750 opacity-75'
                  }
                `}
              >
                <X className="w-4 h-4 text-amber-950" />
                <span>Tidak Hadir</span>
              </button>
            </div>
          </div>

          {/* Conditional: Alasan jika Tidak Hadir */}
          {status === 'tidak_hadir' && (
            <div className="space-y-3 p-3 rounded-xl bg-amber-950/20 border border-amber-700/40 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Alasan Tidak Hadir:
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Sakit', 'Izin', 'Tugas Luar', 'Alpa', 'Terlambat'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReason(preset)}
                      className={`
                        px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                        ${
                          reason === preset
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }
                      `}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Ketik keterangan alasan (opsional)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Guru Pengganti (Badil) */}
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  Guru Pengganti (Badil):
                </label>
                <input
                  list="teacher-suggestions"
                  type="text"
                  placeholder="Nama guru yang menggantikan..."
                  value={substituteTeacher}
                  onChange={(e) => setSubstituteTeacher(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
                <datalist id="teacher-suggestions">
                  {TEACHERS_LIST.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
            </div>
          )}

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Catatan Piket / Materi Kelas:
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Diberikan tugas mandiri bab 4 di kelas..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Nama Petugas Piket */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Petugas Piket yang Memeriksa (Opsional):
            </label>
            <input
              type="text"
              placeholder="Nama Ustadz / Petugas Piket..."
              value={piketName}
              onChange={(e) => setPiketName(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:translate-y-0.5 border-b-2 border-blue-800 shadow-md flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Absensi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
