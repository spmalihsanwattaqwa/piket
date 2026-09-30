import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Check, ShieldAlert, RotateCcw } from 'lucide-react';
import { AttendanceRecord } from '../types/schedule';
import { resetAttendanceForDateInFirestore, deleteAllAttendanceFromFirestore } from '../utils/firebase';

interface DeleteAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  dayRecords: AttendanceRecord[];
  onDayDeleted: () => void;
  onAllDeleted: () => void;
  isLightMode?: boolean;
}

export const DeleteAttendanceModal: React.FC<DeleteAttendanceModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  dayRecords,
  onDayDeleted,
  onAllDeleted,
  isLightMode = false,
}) => {
  const [deleteMode, setDeleteMode] = useState<'day' | 'all'>('day');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (deleteMode === 'all' && confirmText.trim().toUpperCase() !== 'HAPUS') {
      alert('Ketik kata "HAPUS" untuk konfirmasi penghapusan seluruh database.');
      return;
    }

    setIsDeleting(true);
    try {
      if (deleteMode === 'day') {
        await resetAttendanceForDateInFirestore(selectedDate, dayRecords);
        onDayDeleted();
        setFeedback(`Absensi tanggal ${selectedDate} berhasil dihapus dari cloud dan semua perangkat.`);
      } else {
        const count = await deleteAllAttendanceFromFirestore();
        onAllDeleted();
        setFeedback(`Seluruh database absensi (${count} data) berhasil dikosongkan.`);
      }
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Gagal menghapus data:', err);
      alert(`Gagal menghapus data: ${err.message || String(err)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border flex flex-col ${
          isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-rose-900 via-slate-900 to-red-950 border-b border-rose-900/40 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-black">Hapus Data Absensi</h3>
              <p className="text-xs text-rose-200">Kosongkan data absensi yang telah diinput</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 text-xs">
          {feedback ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-600 text-emerald-200 text-center space-y-1">
              <Check className="w-8 h-8 mx-auto text-emerald-400" />
              <p className="font-bold text-sm">{feedback}</p>
            </div>
          ) : (
            <>
              {/* Option Selector */}
              <div className="space-y-2">
                <label className="font-bold block text-slate-700 dark:text-slate-300">
                  Pilih Lingkup Penghapusan:
                </label>

                {/* Option 1: Hapus Hari Ini */}
                <div
                  onClick={() => setDeleteMode('day')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    deleteMode === 'day'
                      ? isLightMode
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20'
                        : 'bg-rose-950/40 border-rose-600 ring-2 ring-rose-600/30'
                      : isLightMode
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    checked={deleteMode === 'day'}
                    onChange={() => setDeleteMode('day')}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      Hapus Absen Hari Terpilih Saja
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Tanggal: <strong className="text-rose-600 dark:text-rose-400">{selectedDate}</strong> ({dayRecords.length} jadwal terdata).
                    </p>
                  </div>
                </div>

                {/* Option 2: Hapus Seluruh Database */}
                <div
                  onClick={() => setDeleteMode('all')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    deleteMode === 'all'
                      ? isLightMode
                        ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20'
                        : 'bg-rose-950/40 border-rose-600 ring-2 ring-rose-600/30'
                      : isLightMode
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    checked={deleteMode === 'all'}
                    onChange={() => setDeleteMode('all')}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      Hapus SEMUA Data Absensi (Semua Tanggal)
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Mengosongkan seluruh histori input absensi di cloud Firestore dan semua perangkat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-tight">
                  Tindakan ini permanen dan akan langsung tersinkronisasi ke seluruh HP dan komputer lain secara real-time.
                </p>
              </div>

              {/* Confirmation input for ALL mode */}
              {deleteMode === 'all' && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                  <label className="font-bold text-[11px] text-rose-700 dark:text-rose-300 block">
                    Ketik kata <span className="underline font-mono">HAPUS</span> untuk konfirmasi:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Ketik HAPUS..."
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold border focus:outline-none ${
                      isLightMode ? 'bg-white border-rose-300 text-rose-900' : 'bg-slate-950 border-rose-700 text-white'
                    }`}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!feedback && (
          <div
            className={`p-3 border-t flex items-center justify-end gap-2 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting || (deleteMode === 'all' && confirmText.trim().toUpperCase() !== 'HAPUS')}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:translate-y-0.5 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Menghapus...' : 'Hapus Sekarang'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
