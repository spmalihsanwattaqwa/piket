import React, { useState, useEffect, useMemo } from 'react';
import { AttendanceRecord, PeriodConfig } from '../types/schedule';
import { fetchAttendanceForDateRange } from '../utils/firebase';
import {
  Printer,
  X,
  Calendar,
  Filter,
  Download,
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  School,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: string;
  periods: PeriodConfig[];
  isLightMode?: boolean;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  periods,
  isLightMode = false,
}) => {
  // Date range defaults: 7 days ago to defaultDate
  const getInitialStartDate = () => {
    const d = new Date(defaultDate + 'T00:00:00');
    // Start of current week (Monday)
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState<string>(getInitialStartDate);
  const [endDate, setEndDate] = useState<string>(defaultDate);
  const [genderFilter, setGenderFilter] = useState<'all' | 'banin' | 'banat'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTeacher, setSearchTeacher] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // Load data whenever modal opens or dates change
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAttendanceForDateRange(startDate, endDate);
      setRecords(data);
    } catch (err) {
      console.error('Error fetching date range attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, startDate, endDate]);

  // Filter records based on UI controls
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (genderFilter === 'banin' && !rec.className.toUpperCase().includes('A')) {
        return false;
      }
      if (genderFilter === 'banat' && !rec.className.toUpperCase().includes('B')) {
        return false;
      }
      if (statusFilter !== 'all' && rec.status !== statusFilter) {
        return false;
      }
      if (
        searchTeacher &&
        !rec.teacher.toLowerCase().includes(searchTeacher.toLowerCase()) &&
        !rec.subject.toLowerCase().includes(searchTeacher.toLowerCase()) &&
        !(rec.substituteTeacher || '').toLowerCase().includes(searchTeacher.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [records, genderFilter, statusFilter, searchTeacher]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    let hadir = 0;
    let tidakHadir = 0;
    let belum = 0;

    filteredRecords.forEach((r) => {
      if (r.status === 'hadir') hadir++;
      else if (r.status === 'tidak_hadir') tidakHadir++;
      else belum++;
    });

    const percent = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, tidakHadir, belum, percent };
  }, [filteredRecords]);

  // Teacher recap summary
  const teacherRecap = useMemo(() => {
    const map: Record<string, { teacher: string; total: number; hadir: number; tidakHadir: number; badilCount: number }> = {};

    filteredRecords.forEach((r) => {
      const tName = r.teacher || 'Tidak Diketahui';
      if (!map[tName]) {
        map[tName] = { teacher: tName, total: 0, hadir: 0, tidakHadir: 0, badilCount: 0 };
      }
      map[tName].total++;
      if (r.status === 'hadir') map[tName].hadir++;
      if (r.status === 'tidak_hadir') map[tName].tidakHadir++;
      if (r.substituteTeacher) map[tName].badilCount++;
    });

    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [filteredRecords]);

  // Trigger Native Browser Print Dialog for PDF export
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border ${
          isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Modal Toolbar Header */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black flex items-center gap-2">
                <span>Ekspor & Cetak PDF Absensi KBM</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Print Preview
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Pilih rentang tanggal untuk mencetak rekapan resmi PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={filteredRecords.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
              title="Cetak langsung atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Date Range & Filter Controls (Disembunyikan saat dicetak di kertas) */}
        <div
          className={`p-3 border-b text-xs space-y-2.5 print:hidden ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Rentang Tanggal */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>Rentang Tanggal:</span>
              </div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-blue-500 ${
                  isLightMode
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
              <span className="text-slate-400">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-blue-500 ${
                  isLightMode
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
              <button
                onClick={loadData}
                className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 shadow-xs"
                title="Muat Ulang Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Muat Data</span>
              </button>
            </div>

            {/* Filter Kelas, Status & Pencarian */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Kelas Banin / Banat */}
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as any)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                  isLightMode
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="all">Semua Kelas</option>
                <option value="banin">Banin (Putra)</option>
                <option value="banat">Banat (Putri)</option>
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                  isLightMode
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="all">Semua Status</option>
                <option value="hadir">Hanya Hadir</option>
                <option value="tidak_hadir">Tidak Hadir / Badil</option>
              </select>

              {/* Cari Guru */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari guru / mapel..."
                  value={searchTeacher}
                  onChange={(e) => setSearchTeacher(e.target.value)}
                  className={`w-36 sm:w-44 px-2.5 py-1.5 pl-7 rounded-xl border text-xs focus:outline-none focus:border-blue-500 ${
                    isLightMode
                      ? 'bg-white border-slate-300 text-slate-900'
                      : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              </div>
            </div>
          </div>
        </div>

        {/* PRINT PREVIEW BODY (Styled to look like A4 paper document) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200 dark:bg-slate-950/80">
          <div
            id="print-document"
            className="max-w-4xl mx-auto bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0"
          >
            {/* KOP SURAT RESMI */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4 flex items-center justify-between gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center p-1 border border-slate-300 rounded-xl">
                <img
                  src="https://iili.io/nYcZGTv.jpg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.jpg';
                  }}
                  alt="Logo Sekolah"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 text-center">
                <h1 className="text-base sm:text-xl font-black uppercase tracking-wider text-slate-900">
                  SATUAN PENDIDIKAN MU'ADALAH (SPM)
                </h1>
                <h2 className="text-lg sm:text-2xl font-black uppercase text-blue-900 tracking-tight">
                  AL IHSAN WAT TAQWA
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
                  Jl. Pesantren Al Ihsan Wat Taqwa • Sistem Absensi & Jurnal Mengajar Guru Piket KBM
                </p>
                <div className="mt-1 inline-block px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Laporan Rekapitulasi Absensi KBM
                </div>
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 hidden sm:block opacity-0"></div>
            </div>

            {/* METADATA LAPORAN */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 mb-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Periode Laporan:</span>
                <span className="font-bold text-slate-900">
                  {startDate} s/d {endDate}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Total KBM Terdata:</span>
                <span className="font-bold text-blue-700">{stats.total} Jam Pelajaran</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Hadir / Terlaksana:</span>
                <span className="font-bold text-emerald-700">
                  {stats.hadir} Jam ({stats.percent}%)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Tidak Hadir / Badil:</span>
                <span className="font-bold text-rose-700">{stats.tidakHadir} Jam</span>
              </div>
            </div>

            {/* TABEL REKAP PER GURU */}
            <div className="mb-5">
              <h4 className="text-xs font-black uppercase text-slate-800 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Ringkasan Kehadiran Tiap Guru Pengampu:</span>
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-1.5 px-2 w-8 text-center">No</th>
                      <th className="py-1.5 px-2">Nama Guru Pengampu</th>
                      <th className="py-1.5 px-2 text-center w-20">Total Jam</th>
                      <th className="py-1.5 px-2 text-center w-20">Hadir</th>
                      <th className="py-1.5 px-2 text-center w-20">Absen/Badil</th>
                      <th className="py-1.5 px-2 text-center w-20">% Hadir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherRecap.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-3 text-center text-slate-400 italic">
                          Tidak ada data absensi untuk rentang tanggal yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      teacherRecap.map((t, idx) => {
                        const pct = t.total > 0 ? Math.round((t.hadir / t.total) * 100) : 0;
                        return (
                          <tr
                            key={t.teacher}
                            className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
                          >
                            <td className="py-1 px-2 text-center font-medium text-slate-500">{idx + 1}</td>
                            <td className="py-1 px-2 font-bold text-slate-900">{t.teacher}</td>
                            <td className="py-1 px-2 text-center font-semibold">{t.total}</td>
                            <td className="py-1 px-2 text-center font-bold text-emerald-700">{t.hadir}</td>
                            <td className="py-1 px-2 text-center font-bold text-rose-700">
                              {t.tidakHadir > 0 ? `${t.tidakHadir} ${t.badilCount > 0 ? `(Badil ${t.badilCount})` : ''}` : '-'}
                            </td>
                            <td className="py-1 px-2 text-center font-bold">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] ${
                                  pct >= 85
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : pct >= 60
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TABEL RINCIAN LENGKAP ABSENSI KBM */}
            <div className="mb-6">
              <h4 className="text-xs font-black uppercase text-slate-800 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Rincian Catatan Jurnal & Absensi Kelas:</span>
              </h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[10px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-1.5 px-1.5 w-6 text-center">No</th>
                      <th className="py-1.5 px-2 w-20">Tanggal</th>
                      <th className="py-1.5 px-1.5 w-12 text-center">Jam Ke</th>
                      <th className="py-1.5 px-2 w-14">Kelas</th>
                      <th className="py-1.5 px-2">Mata Pelajaran</th>
                      <th className="py-1.5 px-2">Guru Terjadwal</th>
                      <th className="py-1.5 px-1.5 w-16 text-center">Status</th>
                      <th className="py-1.5 px-2">Guru Pengganti (Badil) / Tugas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-slate-400 italic">
                          Tidak ada data rincian untuk filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r, idx) => (
                        <tr
                          key={r.id || idx}
                          className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                        >
                          <td className="py-1 px-1.5 text-center text-slate-500">{idx + 1}</td>
                          <td className="py-1 px-2 font-mono font-medium whitespace-nowrap">
                            {r.date} ({r.day})
                          </td>
                          <td className="py-1 px-1.5 text-center font-bold text-blue-800">Ke-{r.period}</td>
                          <td className="py-1 px-2 font-bold text-slate-800">{r.className}</td>
                          <td className="py-1 px-2 text-slate-900">{r.subject}</td>
                          <td className="py-1 px-2 font-bold text-slate-900">{r.teacher}</td>
                          <td className="py-1 px-1.5 text-center">
                            {r.status === 'hadir' ? (
                              <span className="font-bold text-emerald-700">HADIR</span>
                            ) : r.status === 'tidak_hadir' ? (
                              <span className="font-bold text-rose-700">ABSEN</span>
                            ) : (
                              <span className="font-medium text-slate-400">BELUM</span>
                            )}
                          </td>
                          <td className="py-1 px-2 text-slate-700">
                            {r.substituteTeacher ? (
                              <div>
                                <span className="font-bold text-blue-900">Badil: {r.substituteTeacher}</span>
                                {r.reason && <span className="text-slate-500"> ({r.reason})</span>}
                              </div>
                            ) : r.reason ? (
                              <span>Ket: {r.reason}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                            {r.note && <div className="text-[9px] text-slate-500 italic">"{r.note}"</div>}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LEMBAR PENGESAHAN TANDA TANGAN */}
            <div className="pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-center text-slate-900">
              <div>
                <p className="text-slate-600 mb-12">
                  Mengetahui,
                  <br />
                  <strong>Kepala Madrasah / Pengasuh</strong>
                  <br />
                  SPM Al Ihsan Wat Taqwa
                </p>
                <div className="inline-block border-b border-slate-900 pb-0.5 px-8 font-bold">
                  ( ........................................................... )
                </div>
              </div>

              <div>
                <p className="text-slate-600 mb-12">
                  Jombang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  <br />
                  <strong>Koordinator Guru Piket</strong>
                  <br />
                  SPM Al Ihsan Wat Taqwa
                </p>
                <div className="inline-block border-b border-slate-900 pb-0.5 px-8 font-bold">
                  ( ........................................................... )
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div
          className={`p-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs print:hidden ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span>
              Tip: Pada dialog cetak browser, pilih <strong>"Save as PDF"</strong> / <strong>"Simpan sebagai PDF"</strong> pada tujuan printer.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              disabled={filteredRecords.length === 0}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
