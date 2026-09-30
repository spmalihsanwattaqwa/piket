import React, { useState } from 'react';
import { AttendanceRecord, PeriodConfig } from '../types/schedule';
import { GOOGLE_SHEET_INFO } from '../data/scheduleData';
import {
  APPS_SCRIPT_TEMPLATE,
  generateCSVContent,
  generateTsvForClipboard,
  syncToGoogleSheetWebhook,
} from '../utils/sheetSync';
import {
  FileSpreadsheet,
  Download,
  Copy,
  ExternalLink,
  Check,
  Send,
  Code,
  X,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface SyncSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AttendanceRecord[];
  periods: PeriodConfig[];
  dateStr: string;
}

export const SyncSheetModal: React.FC<SyncSheetModalProps> = ({
  isOpen,
  onClose,
  records,
  periods,
  dateStr,
}) => {
  if (!isOpen) return null;

  const [copiedData, setCopiedData] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('piket_sheet_webhook_url') || '';
  });
  const [syncStatus, setSyncStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const handleCopyForSheet = () => {
    const tsv = generateTsvForClipboard(records, periods);
    navigator.clipboard.writeText(tsv);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2500);
  };

  const handleDownloadCSV = () => {
    const csv = generateCSVContent(records, periods);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Absensi_Piket_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE.trim());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSaveWebhook = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('piket_sheet_webhook_url', url.trim());
  };

  const handleSendWebhook = async () => {
    if (!webhookUrl.trim()) {
      alert('Silakan masukkan Web App URL Google Apps Script terlebih dahulu.');
      return;
    }
    setSyncStatus({ loading: true });
    const res = await syncToGoogleSheetWebhook(webhookUrl.trim(), records, periods);
    setSyncStatus({ loading: false, success: res.success, message: res.message });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-800 to-slate-900 border-b border-emerald-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Simpan & Sinkron ke Google Sheet
              </h3>
              <p className="text-xs text-emerald-300">
                Sheet: <span className="font-mono font-bold text-white">{GOOGLE_SHEET_INFO.sheetName}</span> (ID: {GOOGLE_SHEET_INFO.spreadsheetId.slice(0, 12)}...)
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
          {/* Direct Sheet Link */}
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-bold text-slate-200">
                Tautan Google Sheet Target
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md font-mono">
                {GOOGLE_SHEET_INFO.url}
              </div>
            </div>
            <a
              href={GOOGLE_SHEET_INFO.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Sheet</span>
            </a>
          </div>

          {/* Quick Methods */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Salin Clipboard */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Copy className="w-4 h-4 text-blue-400" />
                  Salin Data (Paste ke Sheet)
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Format baris & kolom siap langsung ditempel (Ctrl+V) ke baris sheet piket.
                </p>
              </div>
              <button
                onClick={handleCopyForSheet}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedData ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Tersalin! ({records.length} data)</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Data ({records.length} Baris)</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Download CSV */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  Download File CSV
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Download rekap absensi piket tanggal {dateStr} untuk dibuka di Excel atau diimpor.
                </p>
              </div>
              <button
                onClick={handleDownloadCSV}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File CSV</span>
              </button>
            </div>
          </div>

          {/* Direct Webhook Sync (Google Apps Script) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Otomatis: Sinkron Langsung via Webhook
              </h4>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <Code className="w-3 h-3" />
                {showCode ? 'Sembunyikan Script' : 'Lihat Script Apps Script'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Dengan memasang Apps Script 1x di sheet Anda, absensi dapat terkirim otomatis dengan 1 tombol tanpa unduh file.
            </p>

            {/* Checklist Pengaturan Penting Apps Script */}
            <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-850/60 text-[11px] space-y-1 text-slate-300">
              <div className="font-bold text-blue-300 flex items-center gap-1">
                <span>💡 Syarat agar sinkronisasi tidak gagal:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>
                  <span className="text-slate-300 font-semibold">Who has access:</span> Wajib disetel ke <span className="text-amber-300 font-bold">"Anyone" (Siapa saja)</span>, bukan "Only myself".
                </li>
                <li>
                  <span className="text-slate-300 font-semibold">Format URL:</span> Wajib berakhiran <span className="font-mono text-emerald-300 font-bold">/exec</span> (bukan /edit).
                </li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Tempelkan URL Web App (https://script.google.com/macros/s/.../exec)"
                  value={webhookUrl}
                  onChange={(e) => handleSaveWebhook(e.target.value)}
                  className={`flex-1 px-3 py-2 bg-slate-900 border rounded-lg text-white font-mono text-[11px] focus:outline-none transition-colors ${
                    webhookUrl && !webhookUrl.includes('/exec')
                      ? 'border-amber-500/80 focus:border-amber-400'
                      : 'border-slate-700 focus:border-emerald-400'
                  }`}
                />
                <button
                  onClick={handleSendWebhook}
                  disabled={syncStatus.loading || !webhookUrl}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{syncStatus.loading ? 'Mengirim...' : 'Kirim'}</span>
                </button>
              </div>

              {/* Warning if URL does not end with /exec */}
              {webhookUrl && !webhookUrl.includes('/exec') && (
                <div className="text-[10.5px] text-amber-300 flex items-center gap-1 font-medium bg-amber-950/30 px-2.5 py-1 rounded border border-amber-600/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>
                    Perhatian: URL belum berakhiran <strong className="font-mono">/exec</strong>. Pastikan menyalin dari menu Deploy &gt; Manage deployments.
                  </span>
                </div>
              )}
            </div>

            {syncStatus.message && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                  syncStatus.success
                    ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-600/50 text-rose-300'
                }`}
              >
                {syncStatus.success ? (
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-semibold">{syncStatus.message}</div>
                  {!syncStatus.success && (
                    <div className="text-[10.5px] text-slate-300 font-normal leading-relaxed">
                      Solusi: Buka Apps Script &gt; klik <strong>Deploy</strong> &gt; <strong>Manage deployments</strong> &gt; klik ikon pensil (Edit) &gt; ganti Version ke <strong>New version</strong> &gt; pastikan <strong>Who has access: Anyone</strong> &gt; Deploy &gt; salin URL baru.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Apps Script Code Accordion */}
            {showCode && (
              <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-slate-300 font-bold">
                    Kode Google Apps Script:
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Tersalin' : 'Salin Kode'}</span>
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded overflow-x-auto max-h-48 border border-slate-800/80">
                  {APPS_SCRIPT_TEMPLATE.trim()}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
