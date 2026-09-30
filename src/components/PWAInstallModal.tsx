import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  X,
  Check,
  Share2,
  Copy,
  ExternalLink,
  Sparkles,
  QrCode,
  Send,
  Trash2,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLightMode?: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isLightMode = false,
}) => {
  const { isInstallable, isInstalled, isIOS, install, getInstallUrl } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  if (!isOpen) return null;

  const installUrl = getInstallUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(installUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb. Berikut link aplikasi Absensi Petugas Piket SPM Al Ihsan Wat Taqwa. Buka link ini di browser HP Anda untuk langsung memasang aplikasi:\n\n${installUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    installUrl
  )}&bgcolor=ffffff&color=020617&margin=6`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border max-h-[95vh] ${
          isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-950 border-b border-slate-700 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Pasang APK Piket Melalui Link</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Auto-Install
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Buka link di HP untuk otomatis memasang aplikasi di layar utama
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
          {/* LINK KHUSUS PASANG APK */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2.5 ${
              isLightMode ? 'bg-emerald-50/80 border-emerald-300' : 'bg-emerald-950/40 border-emerald-600/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Link Auto-Install HP (Role Petugas Piket):
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white shadow-xs">
                Otomatis
              </span>
            </div>

            {/* URL Box */}
            <div
              className={`p-2.5 rounded-xl border font-mono text-[11px] break-all select-all flex items-center justify-between gap-2 ${
                isLightMode ? 'bg-white border-emerald-200 text-slate-800' : 'bg-slate-950 border-emerald-800 text-emerald-200'
              }`}
            >
              <span className="truncate">{installUrl}</span>
            </div>

            {/* Action Buttons: Copy Link & WhatsApp Share */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  copiedLink
                    ? 'bg-emerald-600 text-white border-emerald-700'
                    : isLightMode
                    ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Link Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Salin Link Pasang</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Kirim ke WhatsApp</span>
              </button>
            </div>
          </div>

          {/* QR CODE SCANNER SECTION (Khusus jika dibuka dari PC / Laptop) */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  Scan QR Code Menggunakan Kamera HP:
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrCode(!showQrCode)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showQrCode ? 'Sembunyikan QR' : 'Tampilkan QR'}
              </button>
            </div>

            {showQrCode && (
              <div className="pt-3 flex flex-col items-center justify-center text-center space-y-2 animate-in fade-in duration-200">
                <div className="p-2 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                  <img
                    src={qrImageUrl}
                    alt="QR Code Install Link"
                    className="w-40 h-40 object-contain rounded-xl"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                  Arahkan kamera HP Anda ke barcode ini untuk langsung membuka dan memasang aplikasi secara otomatis.
                </p>
              </div>
            )}
          </div>

          {/* DIRECT 1-CLICK INSTALL IF ON MOBILE BROWSER */}
          {isInstallable && (
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 active:translate-y-0.5 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all border-b-2 border-emerald-800"
            >
              <Download className="w-4 h-4" />
              <span>Pasang Aplikasi Sekarang ke Layar HP</span>
            </button>
          )}

          {isInstalled && (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-600 text-emerald-200 text-center font-bold">
              ✓ Aplikasi SPM Piket telah terpasang di HP Anda!
            </div>
          )}

          {/* PANDUAN CARA UNINSTALL VERSI LAMA DI HP */}
          <div
            className={`p-3.5 rounded-2xl border space-y-2 ${
              isLightMode ? 'bg-rose-50/60 border-rose-200' : 'bg-rose-950/30 border-rose-900/40'
            }`}
          >
            <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 text-xs">
              <Trash2 className="w-4 h-4" />
              <span>Cara Hapus / Uninstall Versi Lama di HP:</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>Cara 1 (Paling Mudah):</strong> Cari ikon aplikasi <strong>"Piket SPM"</strong> di layar HP Anda &gt; <strong>Tekan dan tahan (tahan lama)</strong> ikon tersebut selama 2 detik &gt; Pilih <strong>"Hapus Instalasi"</strong> / <strong>"Copot Pemasangan"</strong> / <strong>"Uninstall"</strong> (ikon tempat sampah).
              </p>
              <p>
                <strong>Cara 2 (Dari Browser Chrome HP):</strong> Buka Chrome di HP &gt; Tekan titik tiga <strong>(⋮)</strong> di kanan atas &gt; Pilih <strong>Setelan</strong> &gt; <strong>Setelan Situs</strong> &gt; cari <strong>SPM Piket</strong> &gt; Hapus data &amp; reset.
              </p>
              <p>
                <strong>Cara 3 (iPhone/iPad):</strong> Tekan dan tahan ikon <strong>Piket SPM</strong> di layar utama hingga ikon bergoyang &gt; Ketuk tanda minus <strong>(-)</strong> atau <strong>"Hapus Penanda"</strong> / <strong>"Hapus dari Layar Utama"</strong>.
              </p>
            </div>
          </div>

          {/* PANDUAN MANUAL (JIKA BROWSER TIDAK MUNCULKAN PROMPT) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {/* Android */}
            <div
              className={`p-3 rounded-xl border space-y-1 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>🤖 Android (Google Chrome):</span>
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-tight">
                Tekan titik tiga <strong>(⋮)</strong> di kanan atas browser Chrome &gt; Pilih <strong>"Pasang Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
              </p>
            </div>

            {/* iOS */}
            <div
              className={`p-3 rounded-xl border space-y-1 ${
                isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
              }`}
            >
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                <span>🍎 iPhone / iPad (Safari):</span>
              </p>
              <p className="text-slate-500 dark:text-slate-400 leading-tight">
                Tekan tombol <strong>Share 📤</strong> di bawah &gt; Pilih <strong>"Add to Home Screen"</strong> (Tambahkan ke Layar Utama).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-3 border-t flex justify-end ${
            isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
