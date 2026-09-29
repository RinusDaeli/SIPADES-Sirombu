import React, { useState, useRef, useMemo } from 'react';
import {
  X,
  Download,
  Upload,
  Database,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  ShieldCheck,
  Building,
  Layers,
  MapPin,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/reportGenerator';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDesaId?: string;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  initialDesaId,
}) => {
  const {
    asets,
    verifikasiList,
    desas,
    users,
    currentUser,
    selectedYear,
    getBackupData,
    restoreBackupData,
  } = useApp();

  const isDesaUser = currentUser?.role === 'admin_desa';
  const userDesaId = isDesaUser ? (currentUser.desaId || 'desa-21') : undefined;

  const [activeSubTab, setActiveSubTab] = useState<'backup' | 'restore'>('backup');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Backup Scope: 'all' or specific desaId
  const [backupScope, setBackupScope] = useState<string>(() => {
    if (isDesaUser) return userDesaId || 'desa-21';
    if (initialDesaId && initialDesaId !== 'all') return initialDesaId;
    return 'all';
  });

  // Restore State
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [restoreMode, setRestoreMode] = useState<'all' | 'single_desa'>('all');
  const [restoreTargetDesaId, setRestoreTargetDesaId] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Compute stats for current backup selection
  const backupStats = useMemo(() => {
    const isPerDesa = backupScope !== 'all';
    const targetDesa = isPerDesa ? desas.find((d) => d.id === backupScope) : null;
    const scopedAsets = isPerDesa ? asets.filter((a) => a.desaId === backupScope && a.status !== 'terhapus') : asets.filter((a) => a.status !== 'terhapus');
    const scopedVerif = isPerDesa ? verifikasiList.filter((v) => v.desaId === backupScope) : verifikasiList;
    const totalValuation = scopedAsets.reduce((sum, a) => sum + (a.nilaiPerolehan || 0), 0);

    return {
      isPerDesa,
      desaName: isPerDesa ? targetDesa?.name || 'Desa' : 'Seluruh 25 Desa se-Kecamatan Sirombu',
      totalAset: scopedAsets.length,
      totalNilai: totalValuation,
      totalVerifikasi: scopedVerif.length,
    };
  }, [backupScope, asets, verifikasiList, desas]);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const data = getBackupData(backupScope);
      const isPerDesa = backupScope !== 'all';
      const targetDesa = isPerDesa ? desas.find((d) => d.id === backupScope) : null;
      const desaNameClean = isPerDesa
        ? (targetDesa?.name || 'DESA').toUpperCase().replace(/[^A-Z0-9]/g, '_')
        : 'KEC_SIROMBU_25_DESA';

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `BACKUP-SIPADES-${desaNameClean}-${dateStr}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Gagal membuat berkas cadangan: ' + (err?.message || 'Error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setRestoreFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const payload = parsed.data || parsed;
        const fileScope = parsed.scope || payload.scope;
        const fileDesaId = parsed.desaId || payload.desaId;
        const fileDesaName = parsed.desaName || payload.desaName;

        if (!Array.isArray(payload.asets) && !Array.isArray(payload.desas)) {
          setErrorMessage('Berkas tidak memuat struktur basis data SIPADES yang sah!');
          setPreviewData(null);
          return;
        }

        const isFileSingleDesa = fileScope === 'desa' && fileDesaId && fileDesaId !== 'all';

        setPreviewData({
          exportDate: parsed.exportDate || parsed.timestamp ? new Date(parsed.exportDate || parsed.timestamp).toLocaleString('id-ID') : 'Tidak diketahui',
          totalAset: Array.isArray(payload.asets) ? payload.asets.length : 0,
          totalVerifikasi: Array.isArray(payload.verifikasiList) ? payload.verifikasiList.length : 0,
          totalDesa: Array.isArray(payload.desas) ? payload.desas.length : 0,
          totalUsers: Array.isArray(payload.users) ? payload.users.length : 0,
          appName: parsed.appName || 'SIPADES Sirombu',
          fileScope: isFileSingleDesa ? 'desa' : 'kecamatan',
          fileDesaId: isFileSingleDesa ? fileDesaId : null,
          fileDesaName: isFileSingleDesa ? fileDesaName : null,
          raw: parsed,
        });

        if (isFileSingleDesa) {
          setRestoreMode('single_desa');
          setRestoreTargetDesaId(fileDesaId);
        } else if (isDesaUser && userDesaId) {
          setRestoreMode('single_desa');
          setRestoreTargetDesaId(userDesaId);
        } else {
          setRestoreMode('all');
          setRestoreTargetDesaId(desas[0]?.id || 'desa-01');
        }
      } catch (err) {
        setErrorMessage('Berkas bukan format JSON yang valid!');
        setPreviewData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!previewData?.raw) {
      setErrorMessage('Pilih berkas cadangan JSON yang valid terlebih dahulu.');
      return;
    }

    const isRestoringSingle = restoreMode === 'single_desa' || previewData.fileScope === 'desa';
    const effectiveTargetDesaId = isRestoringSingle ? (restoreTargetDesaId || previewData.fileDesaId) : undefined;
    const targetDesaObj = desas.find((d) => d.id === effectiveTargetDesaId);

    const confirmMsg = isRestoringSingle
      ? `PERINGATAN: Anda akan memulihkan data khusus untuk ${targetDesaObj?.name || 'Desa Terpilih'}. Data 24 desa lainnya dijamin tetap aman dan tidak akan terhapus. Lanjutkan pemulihan?`
      : 'PERINGATAN: Pemulihan data seluruh kecamatan akan memperbarui database seluruh 25 desa. Lanjutkan pemulihan?';

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const result = restoreBackupData(previewData.raw, effectiveTargetDesaId);
    setIsProcessing(false);

    if (result.success) {
      setSuccessMessage(
        result.message ||
        `Pemulihan berhasil! Memulihkan ${result.stats?.asets ?? 0} aset dan ${result.stats?.verifikasi ?? 0} data mutasi.`
      );
      setPreviewData(null);
      setRestoreFile(null);
      setTimeout(() => {
        onClose();
      }, 2500);
    } else {
      setErrorMessage(result.message || 'Gagal memulihkan cadangan data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0E1526] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Database className="w-6 h-6" />
          </span>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Backup & Restore Data Desa
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                {isDesaUser ? 'Admin Desa' : 'Admin & Super Admin'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Cadangkan data inventaris aset per desa atau seluruh kecamatan, serta pulihkan kapan saja tanpa takut data tertimpa
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 mb-6">
          <button
            onClick={() => {
              setActiveSubTab('backup');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'backup'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            Cadangkan Data (Backup)
          </button>
          <button
            onClick={() => {
              setActiveSubTab('restore');
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'restore'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Pulihkan Data (Restore)
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="p-3.5 mb-4 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 mb-4 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ================= BACKUP TAB CONTENT ================= */}
        {activeSubTab === 'backup' && (
          <div className="space-y-5">
            {/* Scope Selection */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Pilih Cakupan Desa yang Akan Dicadangkan:
              </label>

              {!isDesaUser ? (
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <select
                    value={backupScope}
                    onChange={(e) => setBackupScope(e.target.value)}
                    className="w-full bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-slate-900 text-amber-300 font-bold">
                      ★ Seluruh Kecamatan (Semua 25 Desa Lengkap)
                    </option>
                    <optgroup label="Backup Per Desa Spesifik" className="bg-slate-900 text-slate-400 font-semibold">
                      {desas.map((d) => {
                        const count = asets.filter((a) => a.desaId === d.id && a.status !== 'terhapus').length;
                        return (
                          <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                            {d.name} ({count} Aset)
                          </option>
                        );
                      })}
                    </optgroup>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs text-white">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold text-emerald-300">{backupStats.desaName}</span>
                  <span className="text-[10px] text-slate-400 ml-auto bg-slate-800 px-2 py-0.5 rounded">
                    Khusus Akun Desa Anda
                  </span>
                </div>
              )}

              {/* Preview Stats for chosen scope */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-lg font-black text-emerald-400">{backupStats.totalAset}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Item Aset Tetap</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-xs sm:text-sm font-black text-amber-300 truncate">
                    {formatRupiah(backupStats.totalNilai)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Total Nilai Perolehan</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                  <div className="text-lg font-black text-blue-400">{backupStats.totalVerifikasi}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Riwayat Mutasi</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200/90 leading-relaxed">
              <p className="font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {backupStats.isPerDesa
                  ? `Cadangan Mandiri ${backupStats.desaName}:`
                  : 'Cadangan Lengkap Seluruh Kecamatan Sirombu:'}
              </p>
              {backupStats.isPerDesa ? (
                <span>
                  Berkas JSON yang dihasilkan khusus memuat inventaris dan mutasi <strong>{backupStats.desaName}</strong>. Saat dipulihkan, berkas ini <strong>hanya akan memperbarui desa ini</strong> tanpa mengganggu atau menghapus data 24 desa lainnya!
                </span>
              ) : (
                <span>
                  Berkas JSON memuat seluruh aset dari 25 desa se-Kecamatan Sirombu, rekapitulasi mutasi, pengesahan laporan tahun anggaran {selectedYear}, dan akun pengguna.
                </span>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={isProcessing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all disabled:opacity-50 cursor-pointer"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    Cadangan Terunduh!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Unduh Cadangan {backupStats.isPerDesa ? 'Desa' : 'Kecamatan'} (.JSON)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ================= RESTORE TAB CONTENT ================= */}
        {activeSubTab === 'restore' && (
          <div className="space-y-5">
            {/* File drop area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 hover:bg-slate-900/60 rounded-xl p-6 text-center cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-white mb-1">
                {restoreFile ? restoreFile.name : 'Klik atau Pilih Berkas Cadangan (.JSON)'}
              </div>
              <p className="text-[11px] text-slate-400">
                Pilih berkas cadangan SIPADES (baik cadangan 1 desa ataupun seluruh kecamatan)
              </p>
            </div>

            {/* Preview and restore options */}
            {previewData && (
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Informasi Berkas Cadangan:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Waktu Backup: {previewData.exportDate}
                  </span>
                </div>

                {/* Scope Notification */}
                {previewData.fileScope === 'desa' ? (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200">
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-0.5">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      Berkas Cadangan Khusus: {previewData.fileDesaName || 'Desa Spesifik'}
                    </div>
                    <div className="text-[11px] text-emerald-200/80">
                      Mode Perlindungan Aktif: Pemulihan hanya akan memperbarui aset dan data untuk desa ini. Data 24 desa lainnya dijamin aman dan tidak akan terhapus.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-300">
                      Pilihan Pemulihan untuk Berkas Seluruh Kecamatan ini:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label
                        className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${
                          restoreMode === 'all'
                            ? 'bg-blue-950/60 border-blue-500 text-white font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="restore_mode"
                          checked={restoreMode === 'all'}
                          onChange={() => setRestoreMode('all')}
                          disabled={isDesaUser}
                          className="text-blue-500"
                        />
                        <span>Pulihkan Seluruh 25 Desa</span>
                      </label>

                      <label
                        className={`p-2.5 rounded-lg border cursor-pointer flex items-center gap-2 ${
                          restoreMode === 'single_desa'
                            ? 'bg-blue-950/60 border-blue-500 text-white font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="restore_mode"
                          checked={restoreMode === 'single_desa'}
                          onChange={() => setRestoreMode('single_desa')}
                          className="text-blue-500"
                        />
                        <span>Pulihkan 1 Desa Tertentu Saja (Aman)</span>
                      </label>
                    </div>

                    {restoreMode === 'single_desa' && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-700 flex items-center gap-2 text-xs">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-slate-400">Pilih Desa yang Akan Dipulihkan:</span>
                        <select
                          value={restoreTargetDesaId}
                          onChange={(e) => setRestoreTargetDesaId(e.target.value)}
                          disabled={isDesaUser}
                          className="bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer flex-1"
                        >
                          {desas.map((d) => (
                            <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Counts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                    <div className="font-bold text-emerald-400 text-base">{previewData.totalAset}</div>
                    <div className="text-[10px] text-slate-400">Aset dalam File</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                    <div className="font-bold text-amber-400 text-base">{previewData.totalVerifikasi}</div>
                    <div className="text-[10px] text-slate-400">Data Mutasi</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                    <div className="font-bold text-blue-400 text-base">
                      {previewData.fileScope === 'desa' ? '1 Desa' : `${previewData.totalDesa} Desa`}
                    </div>
                    <div className="text-[10px] text-slate-400">Cakupan Data</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950/80 border border-slate-800">
                    <div className="font-bold text-purple-400 text-base">{previewData.totalUsers}</div>
                    <div className="text-[10px] text-slate-400">Akun Pengguna</div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={!previewData || isProcessing}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                {restoreMode === 'single_desa' || previewData?.fileScope === 'desa'
                  ? 'Mulai Pulihkan Data Desa Ini'
                  : 'Mulai Pulihkan Seluruh Kecamatan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
