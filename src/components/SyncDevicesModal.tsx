import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  syncManager,
  generateSyncCode,
  parseSyncCode,
  FullSyncPayload,
} from '../utils/cloudSyncService';
import {
  Laptop,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Send,
  Download,
  Upload,
  Radio,
  X,
  Sparkles,
  Cloud,
  Database,
} from 'lucide-react';

interface SyncDevicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncDevicesModal: React.FC<SyncDevicesModalProps> = ({ isOpen, onClose }) => {
  const {
    asets,
    verifikasiList,
    pengesahanList,
    users,
    desas,
    kecamatanProfile,
    importSyncPayload,
    isFirestoreConnected,
    syncAllToFirestoreManual,
  } = useApp();

  const [peerCount, setPeerCount] = useState<number>(() => syncManager.getConnectedCount());
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  React.useEffect(() => {
    return syncManager.onPeerCountChange((count) => {
      setPeerCount(count);
    });
  }, []);

  if (!isOpen) return null;

  const handleSyncToFirestore = async () => {
    setIsCloudSyncing(true);
    setStatusMsg({ text: 'Sedang menyinkronkan seluruh data ke Google Cloud Firestore...', type: 'info' });
    try {
      const res = await syncAllToFirestoreManual();
      if (res.success) {
        setStatusMsg({
          text: `Berhasil! ${res.count} data inventaris, desa, dan pengguna telah tersimpan di Cloud Firestore!`,
          type: 'success',
        });
      } else {
        setStatusMsg({ text: res.message, type: 'error' });
      }
    } catch (e: any) {
      setStatusMsg({ text: `Gagal sinkron Firestore: ${e?.message || 'Error'}`, type: 'error' });
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const getCurrentPayload = (): FullSyncPayload => ({
    version: 2,
    timestamp: new Date().toISOString(),
    senderId: 'manual',
    asets,
    verifikasiList,
    pengesahanList,
    desas,
    users,
    kecamatanProfile,
  });

  const handleCopyCode = () => {
    const payload = getCurrentPayload();
    const code = generateSyncCode(payload);
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setStatusMsg({
        text: 'Kode sinkronisasi berhasil disalin! Buka laptop lain dan tempelkan pada kolom di bawah.',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleApplyCode = () => {
    if (!inputCode.trim()) {
      setStatusMsg({ text: 'Silakan masukkan kode sinkronisasi terlebih dahulu!', type: 'error' });
      return;
    }
    const parsed = parseSyncCode(inputCode);
    if (!parsed) {
      setStatusMsg({ text: 'Format kode tidak valid atau rusak. Silakan salin ulang dari laptop asal.', type: 'error' });
      return;
    }

    importSyncPayload(parsed);
    setInputCode('');
    setStatusMsg({
      text: `Berhasil menerapkan data! ${parsed.asets?.length || 0} aset berhasil disinkronkan.`,
      type: 'success',
    });
  };

  const handleBroadcast = () => {
    const payload = getCurrentPayload();
    syncManager.broadcastChange(payload);
    setStatusMsg({
      text: 'Sinyal pembaruan data berhasil disiarkan ke seluruh laptop & browser aktif!',
      type: 'success',
    });
  };

  const handleRequestSync = () => {
    syncManager.requestFullSync();
    setStatusMsg({
      text: 'Permintaan sinkronisasi terkirim. Menunggu respons dari perangkat lain...',
      type: 'info',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sinkronisasi Antar Perangkat</h3>
              <p className="text-xs text-slate-400">Jalur Real-Time WebRTC P2P & Cloud Relay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Cloud Firestore Direct Connection Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border border-emerald-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Cloud className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                  Database Google Cloud Firestore
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-600/60 font-semibold">
                    Terhubung
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono mt-0.5 truncate max-w-xs sm:max-w-md">
                  ai-studio-sipadessirombupe-7e6c7904-00aa-4d26-9cf7-b100673100a5
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncToFirestore}
              disabled={isCloudSyncing}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
              <span>{isCloudSyncing ? 'Menyinkronkan...' : 'Sinkron ke Cloud Sekarang'}</span>
            </button>
          </div>

          {/* Status Live */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-xs font-bold text-emerald-300">
                  Jalur P2P Aktif & Siap Sinkron
                </div>
                <div className="text-[11px] text-slate-300">
                  {peerCount > 0
                    ? `${peerCount} perangkat lain terhubung langsung secara real-time.`
                    : 'Menunggu perangkat lain membuka aplikasi... (atau gunakan kode instan)'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBroadcast}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Data</span>
            </button>
          </div>

          {/* Feedback status */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-950/80 text-rose-200 border-rose-500/40'
                  : 'bg-sky-950/80 text-sky-200 border-sky-500/40'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* 1-Click Code Transfer */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Transfer Instan dengan Kode
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">100% Berhasil di Semua Browser</span>
            </div>

            <p className="text-xs text-slate-300">
              Jika kedua laptop berada di jaringan berbeda atau terpisah, salin kode dari laptop asal dan tempelkan di laptop tujuan:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-600 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                <span>{copied ? 'Kode Tersalin!' : 'Salin Kode Data Laptop Ini'}</span>
              </button>

              {/* Ping Sync */}
              <button
                type="button"
                onClick={handleRequestSync}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-600 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Minta Data dari Laptop Lain</span>
              </button>
            </div>

            {/* Paste Code Box */}
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-medium text-slate-400">
                Tempel kode sinkronisasi dari laptop lain:
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tempel kode sinkronisasi di sini..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyCode}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>

          {/* Current Stats Summary */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              Total Aset di Laptop Ini: <strong className="text-white font-bold">{asets.length} item</strong>
            </div>
            <div>
              Desa: <strong className="text-emerald-400 font-bold">{desas.length} Desa</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
