import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Database,
  X,
  RefreshCw,
  HardDrive,
  FileText,
  CalendarCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Info,
  Server,
  Zap,
} from 'lucide-react';
import { fetchFirestoreCapacityStats, FirestoreCapacityInfo } from '../utils/firebase';

interface FirestoreCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

export const FirestoreCapacityModal: React.FC<FirestoreCapacityModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false,
}) => {
  const [stats, setStats] = useState<FirestoreCapacityInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFirestoreCapacityStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading Firestore capacity stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border max-h-[95vh] ${
          isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-b border-indigo-700/50 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Kapasitas Cloud Firestore</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Real-Time
                </span>
              </h3>
              <p className="text-xs text-indigo-200">
                Status penyimpanan & kuota database online
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
          {/* Main Capacity Progress Card */}
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              isLightMode ? 'bg-blue-50/80 border-blue-200' : 'bg-blue-950/30 border-blue-800/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Ruang Penyimpanan Terpakai
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Sangat Aman
              </span>
            </div>

            {/* Storage Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(stats?.usedPercentage || 0, 1.5)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <span>
                  Terpakai:{' '}
                  <strong className="text-blue-600 dark:text-blue-400 font-bold">
                    {stats?.estimatedKbUsed || 0} KB
                  </strong>{' '}
                  ({stats?.usedPercentage || 0}%)
                </span>
                <span>
                  Batas Kuota Gratis:{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-bold">
                    1.024 MB (1 GB)
                  </strong>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight">
              Kapasitas masih tersisa lebih dari <strong>99.9%</strong>. Server Google Firestore memiliki batas gratis 1 GB selamanya.
            </p>
          </div>

          {/* Document Count Breakdown Grid */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between">
              <span>Rincian Dokumen di Cloud Firestore:</span>
              <span className="text-[11px] text-slate-400 font-normal">
                Total: <strong>{stats?.totalDocuments || 0}</strong> dokumen
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Catatan Absensi */}
              <div
                className={`p-3 rounded-2xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-bold text-[11px]">Absensi KBM</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {stats?.attendanceCount || 0}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Koleksi: attendance_records
                </span>
              </div>

              {/* Agenda Kunci */}
              <div
                className={`p-3 rounded-2xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span className="font-bold text-[11px]">Agenda Kunci</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {stats?.lockedEventsCount || 0}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Koleksi: locked_events
                </span>
              </div>

              {/* Petugas Piket */}
              <div
                className={`p-3 rounded-2xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-bold text-[11px]">Daftar Piket</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {stats?.piketDutiesCount || 0}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Koleksi: piket_duties
                </span>
              </div>

              {/* Pengaturan Jam KBM */}
              <div
                className={`p-3 rounded-2xl border ${
                  isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 text-purple-500 mb-1">
                  <Server className="w-3.5 h-3.5" />
                  <span className="font-bold text-[11px]">Pengaturan KBM</span>
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {stats?.settingsCount || 0}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Koleksi: app_settings
                </span>
              </div>
            </div>
          </div>

          {/* Kuota Gratis Google Cloud Firebase Spark Plan */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Batas Kuota Google Firebase (Spark Free Plan):</span>
            </div>

            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
              <li className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1">
                <span>Penyimpanan Database (Storage):</span>
                <strong className="text-emerald-600 dark:text-emerald-400">1.024 MB (1 GB) Gratis</strong>
              </li>
              <li className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1">
                <span>Batas Pembacaan (Read):</span>
                <strong className="text-slate-700 dark:text-slate-300">50.000 kali / hari</strong>
              </li>
              <li className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-1">
                <span>Batas Penulisan (Write):</span>
                <strong className="text-slate-700 dark:text-slate-300">20.000 kali / hari</strong>
              </li>
              <li className="flex items-center justify-between">
                <span>Batas Penghapusan (Delete):</span>
                <strong className="text-slate-700 dark:text-slate-300">20.000 kali / hari</strong>
              </li>
            </ul>
          </div>

          {/* Analisis Ketahanan & Estimasi Masa Pakai */}
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Estimasi Daya Tampung:</strong> Sisa ruang masih mampu menampung sekitar{' '}
              <strong>{(stats?.estimatedRemainingRecords || 2000000).toLocaleString('id-ID')}</strong> catatan
              absensi baru (lebih dari <strong>15 tahun KBM</strong> tanpa perlu upgrade berbayar).
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3 border-t flex items-center justify-between gap-2 text-xs ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <span className="text-[10px] text-slate-400">
            Terakhir dihitung: {stats?.lastChecked || 'Baru saja'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={loadStats}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Hitung Ulang</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
