import React, { Component, ErrorInfo, ReactNode } from 'react';
import { NiasBaratLogo } from './NiasBaratLogo';
import { RefreshCw, RotateCcw, AlertOctagon } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SIPADES ErrorBoundary] Caught error:', error, errorInfo);
    // If storage quota error, immediately relieve localStorage so reload recovers cleanly
    if (
      error &&
      (error.name === 'QuotaExceededError' ||
        error.message?.includes('QuotaExceededError') ||
        error.message?.includes('exceeded the quota'))
    ) {
      try {
        localStorage.removeItem('sipad_asets_v2');
        console.warn('[ErrorBoundary] Relieved localStorage quota by clearing sipad_asets_v2.');
      } catch {}
    }
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    try {
      localStorage.removeItem('sipad_asets_v2');
    } catch {}
    window.location.reload();
  };

  private handleQuickRecover = () => {
    try {
      localStorage.removeItem('sipad_asets_v2');
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleResetCache = () => {
    try {
      // Clear session & cached data so user is never stuck
      localStorage.removeItem('sipades_sirombu_session_24h');
      localStorage.removeItem('sipad_users_v2');
      localStorage.removeItem('sipad_desas_v2');
      localStorage.removeItem('sipad_asets_v2');
      localStorage.removeItem('sipad_verifikasi_v2');
      localStorage.removeItem('sipad_pengesahan_v2');
      localStorage.removeItem('sipad_kecamatan_profile_v2');
      localStorage.removeItem('sipad_year_v2');
    } catch (e) {
      console.error('Failed to clear cache:', e);
    }
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-slate-100">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-md w-full relative z-10 space-y-6 text-center">
            <div className="flex justify-center mb-2">
              <NiasBaratLogo size={72} />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-black text-white tracking-tight uppercase">
                SIPADES SIROMBU
              </h1>
              <p className="text-xs text-emerald-400 font-semibold uppercase">
                Kecamatan Sirombu • Kabupaten Nias Barat
              </p>
            </div>

            <div className="bg-[#0E1526] border border-red-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-left space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 shrink-0">
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">
                    Pemulihan Tampilan Aplikasi
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sistem mendeteksi kendala pada cache tampilan. Silakan muat ulang atau pulihkan data di bawah ini.
                  </p>
                </div>
              </div>

              {this.state.error && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-rose-300 break-words max-h-28 overflow-y-auto">
                  {this.state.error.toString()}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={this.handleQuickRecover}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Lanjutkan Entri Data (Bersihkan Cache Memori)</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleReload}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Muat Ulang Halaman</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleResetCache}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  <span>Pulihkan Cache & Masuk Kembali</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Data tersimpan aman di Google Cloud Firestore.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
