import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share2, PlusSquare, Sparkles } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-900 via-slate-900 to-emerald-950 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Pasang Aplikasi Piket (APK)</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  HP
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Aplikasi khusus petugas piket SPM Al Ihsan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* App Preview Card */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
            <img
              src="/icon.svg"
              alt="Icon Piket"
              className="w-14 h-14 rounded-2xl shadow-md border border-slate-700 p-1 bg-slate-900 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-white text-sm truncate">
                Piket SPM Al Ihsan
              </h4>
              <p className="text-[11px] text-slate-400">
                Aplikasi Khusus Role Piket
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Standalone Fullscreen
                </span>
                <span className="text-[10px] text-blue-400 flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> Akses Cepat
                </span>
              </div>
            </div>
          </div>

          {/* If already installed */}
          {isInstalled ? (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-200 text-center space-y-1">
              <p className="font-bold">Aplikasi Sudah Terpasang di HP Anda!</p>
              <p className="text-[11px] text-emerald-300">
                Buka melalui icon di Layar Utama HP untuk pengalaman fullscreen tanpa browser bar.
              </p>
            </div>
          ) : (
            <>
              {/* Direct 1-Click Install Button if supported by browser */}
              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 active:translate-y-0.5 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all border-b-2 border-emerald-800"
                >
                  <Download className="w-4 h-4" />
                  <span>Pasang Aplikasi ke Layar Utama HP</span>
                </button>
              )}

              {/* Android Chrome Guide */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Cara Pasang di HP Android (Google Chrome):
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>
                    Tekan tombol titik tiga <strong className="text-white">(&#8942;)</strong> di sudut kanan atas browser Chrome.
                  </li>
                  <li>
                    Pilih menu <strong className="text-emerald-300">"Pasang Aplikasi"</strong> atau <strong className="text-emerald-300">"Tambahkan ke Layar Utama"</strong>.
                  </li>
                  <li>
                    Tekan <strong className="text-white">"Install / Tambahkan"</strong>.
                  </li>
                  <li>
                    Icon <strong>Piket SPM</strong> akan muncul di daftar aplikasi HP Anda seperti APK asli!
                  </li>
                </ol>
              </div>

              {/* iOS Safari Guide */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-blue-400" />
                  Cara Pasang di iPhone / iPad (Safari):
                </h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                  <li>
                    Tekan tombol <strong className="text-blue-300">Share</strong> (ikon kotak tanda panah ke atas) di bagian bawah Safari.
                  </li>
                  <li>
                    Gulir ke bawah lalu pilih <strong className="text-blue-300">"Add to Home Screen"</strong> (Tambahkan ke Layar Utama).
                  </li>
                  <li>
                    Tekan <strong className="text-white">"Add"</strong> di pojok kanan atas.
                  </li>
                </ol>
              </div>
            </>
          )}

          {/* Keunggulan APK Khusus Piket */}
          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-800/40 text-[11px] text-blue-200 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Keunggulan Aplikasi Khusus Piket:
            </div>
            <p className="text-slate-300">
              Otomatis masuk ke peran <strong>Petugas Piket</strong> tanpa perlu login berulang, tampilan bersih tanpa menu admin, dan hemat baterai serta data.
            </p>
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
