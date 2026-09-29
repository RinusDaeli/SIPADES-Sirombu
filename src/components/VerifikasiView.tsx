import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PermohonanVerifikasi } from '../types';
import { formatRupiah } from '../utils/reportGenerator';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightLeft,
  FileMinus,
  FileText,
  Building2,
  AlertTriangle,
  X,
  Send,
  Calendar,
  UserCheck,
  RotateCcw,
  Trash2,
  Edit3,
  HelpCircle,
  Check,
} from 'lucide-react';

export const VerifikasiView: React.FC = () => {
  const {
    verifikasiList,
    prosesVerifikasi,
    revisiMutasi,
    deleteVerifikasi,
    currentUser,
    desas,
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isKecamatan = currentUser?.role === 'admin_kecamatan';
  const canVerify = isSuperAdmin || isKecamatan;
  const isDesa = currentUser?.role === 'admin_desa';

  const [activeStatusTab, setActiveStatusTab] = useState<'all' | 'menunggu_verifikasi' | 'disetujui' | 'ditolak'>('all');
  const [filterTipe, setFilterTipe] = useState<'all' | 'mutasi' | 'penghapusan'>('all');
  const [filterDesa, setFilterDesa] = useState<string>('all');

  // Modal Action: Kecamatan (Approve / Reject)
  const [selectedVerif, setSelectedVerif] = useState<PermohonanVerifikasi | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [catatan, setCatatan] = useState('');
  const [nomorSK, setNomorSK] = useState('');

  // Modal Action: Desa Revision
  const [revisiModalVerif, setRevisiModalVerif] = useState<PermohonanVerifikasi | null>(null);
  const [revisiAlasan, setRevisiAlasan] = useState('');
  const [revisiNomorSurat, setRevisiNomorSurat] = useState('');
  const [revisiDokumen, setRevisiDokumen] = useState('');
  const [revisiTujuanMutasi, setRevisiTujuanMutasi] = useState('');

  // Modal Action: Admin Deletion
  const [deleteModalVerif, setDeleteModalVerif] = useState<PermohonanVerifikasi | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter list
  // Note: For desa account, strictly show only items for their desa
  const filteredList = verifikasiList.filter((item) => {
    if (isDesa && item.desaId !== currentUser.desaId) return false;
    if (filterDesa !== 'all' && item.desaId !== filterDesa) return false;
    if (activeStatusTab !== 'all' && item.status !== activeStatusTab) return false;
    if (filterTipe !== 'all' && item.tipe !== filterTipe) return false;
    return true;
  });

  const totalDesaSubmissions = verifikasiList.filter((v) => {
    if (isDesa) return v.desaId === currentUser.desaId;
    return true;
  }).length;

  const countPending = verifikasiList.filter((v) => {
    if (isDesa) return v.desaId === currentUser.desaId && v.status === 'menunggu_verifikasi';
    return v.status === 'menunggu_verifikasi';
  }).length;

  const countApproved = verifikasiList.filter((v) => {
    if (isDesa) return v.desaId === currentUser.desaId && v.status === 'disetujui';
    return v.status === 'disetujui';
  }).length;

  const countRejected = verifikasiList.filter((v) => {
    if (isDesa) return v.desaId === currentUser.desaId && v.status === 'ditolak';
    return v.status === 'ditolak';
  }).length;

  const handleOpenAction = (verif: PermohonanVerifikasi, type: 'approve' | 'reject') => {
    setSelectedVerif(verif);
    setActionType(type);
    if (type === 'approve') {
      const year = new Date().getFullYear();
      const codeType = verif.tipe === 'mutasi' ? 'MUT' : 'HPS';
      setNomorSK(`SK-KEC-SRB/${year}/${codeType}-${verif.id.slice(-4)}`);
      setCatatan(`Telah diverifikasi berkas dan cek fisik lapangan oleh Tim Monitoring Kecamatan Sirombu. Disetujui.`);
    } else {
      setNomorSK('');
      setCatatan('Berkas Berita Acara Musyawarah Desa belum lengkap / fisik aset masih layak digunakan.');
    }
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerif || !actionType) return;

    prosesVerifikasi(
      selectedVerif.id,
      actionType === 'approve' ? 'disetujui' : 'ditolak',
      catatan,
      actionType === 'approve' ? nomorSK : undefined
    );

    const assetName = selectedVerif.asetSnapshot?.namaAset || 'Aset';
    const msg =
      actionType === 'approve'
        ? `Permohonan ${assetName} berhasil disetujui!`
        : `Permohonan ${assetName} ditolak dan dikembalikan untuk revisi.`;

    setSelectedVerif(null);
    setActionType(null);
    showToast(msg);
  };

  // Open Revision Modal
  const handleOpenRevisi = (verif: PermohonanVerifikasi) => {
    setRevisiModalVerif(verif);
    setRevisiAlasan(verif.alasan || '');
    setRevisiNomorSurat(verif.nomorSuratDesa || '');
    setRevisiDokumen(verif.dokumenPendukung || '');
    setRevisiTujuanMutasi(verif.tujuanMutasi || '');
  };

  const handleConfirmRevisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisiModalVerif) return;

    const res = revisiMutasi(revisiModalVerif.id, {
      alasan: revisiAlasan,
      nomorSuratDesa: revisiNomorSurat,
      dokumenPendukung: revisiDokumen,
      tujuanMutasi: revisiModalVerif.tipe === 'mutasi' ? revisiTujuanMutasi : undefined,
    });

    setRevisiModalVerif(null);
    if (res.success) {
      showToast(res.message || 'Permohonan berhasil direvisi dan diajukan ulang!');
    }
  };

  // Admin Delete Confirmation
  const handleConfirmDelete = () => {
    if (!deleteModalVerif) return;
    const res = deleteVerifikasi(deleteModalVerif.id);
    setDeleteModalVerif(null);
    if (res.success) {
      showToast(res.message || 'Data permohonan berhasil dihapus!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Notification Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Modul Verifikasi Kecamatan
            </span>
            <span className="text-xs text-slate-400">
              Kecamatan Sirombu • Nias Barat
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Verifikasi Mutasi & Penghapusan Aset Desa
          </h2>
          <p className="text-xs text-slate-400">
            Sesuai Permendagri No. 20 Tahun 2018, mutasi dan penghapusan aset tetap desa harus melalui telaah dan verifikasi pihak Kecamatan sebelum penetapan laporan final.
          </p>
        </div>

        {canVerify ? (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold block">Hak Otoritas Kecamatan Aktif</span>
              <span className="text-[11px] text-slate-400">
                Anda dapat menyetujui, menolak, atau menghapus permohonan mutasi desa.
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-bold block">Status Pengajuan Desa Anda</span>
              <span className="text-[11px] text-slate-400">
                {currentUser?.desaName || 'Akun Desa'} — pantau proses verifikasi dokumen oleh Kecamatan Sirombu.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Metric Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveStatusTab('all')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeStatusTab === 'all'
              ? 'bg-slate-800 border-amber-500 text-white shadow-md'
              : 'bg-[#0E1526] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider">
            {isDesa ? 'Semua Pengajuan Desa' : 'Semua Pengajuan'}
          </div>
          <div className="text-xl font-black text-white mt-1">
            {totalDesaSubmissions}
          </div>
        </button>

        <button
          onClick={() => setActiveStatusTab('menunggu_verifikasi')}
          className={`p-3.5 rounded-xl border text-left transition-all relative ${
            activeStatusTab === 'menunggu_verifikasi'
              ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-md'
              : 'bg-[#0E1526] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Menunggu Verifikasi</span>
            {countPending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <div className="text-xl font-black text-amber-400 mt-1">
            {countPending}
          </div>
        </button>

        <button
          onClick={() => setActiveStatusTab('disetujui')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeStatusTab === 'disetujui'
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md'
              : 'bg-[#0E1526] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider">Telah Disetujui</div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {countApproved}
          </div>
        </button>

        <button
          onClick={() => setActiveStatusTab('ditolak')}
          className={`p-3.5 rounded-xl border text-left transition-all ${
            activeStatusTab === 'ditolak'
              ? 'bg-red-950/60 border-red-500 text-red-200 shadow-md'
              : 'bg-[#0E1526] border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="text-[11px] font-semibold uppercase tracking-wider">Ditolak / Perlu Revisi</div>
          <div className="text-xl font-black text-red-400 mt-1">
            {countRejected}
          </div>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Tipe Pengajuan:</span>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
            >
              <option value="all">Semua Tipe (Mutasi & Penghapusan)</option>
              <option value="mutasi">Khusus Mutasi Aset</option>
              <option value="penghapusan">Khusus Penghapusan Aset</option>
            </select>
          </div>

          {!isDesa && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Desa Pemohon:</span>
              <select
                value={filterDesa}
                onChange={(e) => setFilterDesa(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none max-w-[160px] truncate"
              >
                <option value="all">Semua 25 Desa</option>
                {desas.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-slate-400">
          Ditemukan <span className="font-bold text-white">{filteredList.length}</span> permohonan
        </div>
      </div>

      {/* Verification Cards List */}
      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            {isDesa && totalDesaSubmissions === 0 ? (
              <>
                <p className="text-sm font-semibold text-slate-300">
                  Belum Ada Pengajuan Mutasi atau Penghapusan dari {currentUser?.desaName || 'Desa Anda'}.
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Jika desa hendak memindahkan hak kelola aset atau menghapus aset rusak berat, silakan buka menu <strong>DATA ASET</strong>, klik pada aset, lalu pilih tombol <em>Ajukan Mutasi</em> atau <em>Ajukan Penghapusan</em>.
                </p>
              </>
            ) : isDesa && countPending === 0 && activeStatusTab === 'menunggu_verifikasi' ? (
              <>
                <p className="text-sm font-semibold text-emerald-400">
                  Tidak Ada Pengajuan Menunggu Verifikasi
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh permohonan mutasi/penghapusan dari {currentUser?.desaName || 'desa Anda'} sudah selesai diproses oleh Kecamatan Sirombu.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-slate-400">
                  Tidak ada permohonan verifikasi dalam kriteria filter ini.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan menu filter di atas atau pilih tab status lain untuk melihat data pengajuan.
                </p>
              </>
            )}
          </div>
        ) : (
          filteredList.map((verif) => {
            const isMutasi = verif.tipe === 'mutasi';
            const isPending = verif.status === 'menunggu_verifikasi';
            const isApproved = verif.status === 'disetujui';
            const isRejected = verif.status === 'ditolak';

            const canDesaRevisi = isRejected && (isDesa || canVerify);

            return (
              <div
                key={verif.id}
                className="bg-[#0E1526] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        isMutasi
                          ? 'bg-blue-950/80 border border-blue-500/40 text-blue-300'
                          : 'bg-red-950/80 border border-red-500/40 text-red-300'
                      }`}
                    >
                      {isMutasi ? (
                        <>
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Permohonan Mutasi Aset
                        </>
                      ) : (
                        <>
                          <FileMinus className="w-3.5 h-3.5" />
                          Permohonan Penghapusan Aset
                        </>
                      )}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs font-semibold">
                      {verif.desaName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-slate-400">
                      Diajukan: {new Date(verif.tanggalPengajuan).toLocaleDateString('id-ID')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isPending
                          ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                          : isApproved
                          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                          : 'bg-red-950/80 border-red-500/40 text-red-300'
                      }`}
                    >
                      {isPending
                        ? 'Menunggu Verifikasi Kecamatan'
                        : isApproved
                        ? 'Telah Disetujui Kecamatan'
                        : 'Ditolak / Perlu Revisi'}
                    </span>

                    {/* Admin Delete Action Button */}
                    {canVerify && (
                      <button
                        onClick={() => setDeleteModalVerif(verif)}
                        className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/80 border border-red-500/30 text-red-400 hover:text-white text-xs transition-colors ml-1"
                        title="Hapus permanen data pengajuan mutasi/penghapusan ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 py-4">
                  {/* Left: Asset details snapshot */}
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                      Objek Aset Tetap Terkait
                    </div>
                    <div className="font-bold text-white text-sm">
                      {verif.asetSnapshot?.namaAset || 'Aset'}
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      Kode: {verif.asetSnapshot?.kodeAset || '-'}
                    </div>
                    <div className="text-slate-400">
                      Klasifikasi: <span className="text-slate-200">{verif.asetSnapshot?.klasifikasi || '-'}</span>
                    </div>
                    <div className="text-slate-400">
                      Nilai Perolehan:{' '}
                      <span className="text-emerald-400 font-bold font-mono">
                        {formatRupiah(verif.asetSnapshot?.nilaiPerolehan || 0)}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      Tahun Perolehan: <span className="text-slate-200">{verif.asetSnapshot?.tahunPerolehan || '-'}</span> ({verif.asetSnapshot?.sumberDana || '-'})
                    </div>
                    <div className="text-slate-400">
                      Kondisi Fisik: <span className="text-amber-300 font-bold">{verif.asetSnapshot?.kondisi || '-'}</span>
                    </div>
                  </div>

                  {/* Middle: Justification & Documents */}
                  <div className="lg:col-span-2 text-xs space-y-2.5">
                    {isMutasi && verif.tujuanMutasi && (
                      <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-blue-200">
                        <span className="font-semibold text-slate-300">Pihak / Instansi Penerima Mutasi: </span>
                        <span className="font-bold text-white">{verif.tujuanMutasi}</span>
                      </div>
                    )}

                    <div>
                      <span className="font-semibold text-slate-400 block mb-0.5">
                        Alasan & Dasar Pertimbangan Desa:
                      </span>
                      <p className="text-slate-200 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800 leading-relaxed">
                        {verif.alasan}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Nomor Surat Pengantar Kades:</span>
                        <span className="font-mono text-slate-300 font-semibold">{verif.nomorSuratDesa}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Dokumen Berita Acara / Dasar Hukum:</span>
                        <span className="text-slate-300 font-semibold">{verif.dokumenPendukung}</span>
                      </div>
                    </div>

                    {/* If processed: show result from Kecamatan */}
                    {!isPending && (
                      <div
                        className={`p-3 rounded-xl border mt-3 ${
                          isApproved
                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                            : 'bg-red-950/40 border-red-500/30 text-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span className="flex items-center gap-1.5">
                            {isApproved ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            Keputusan Verifikasi Kecamatan Sirombu
                          </span>
                          {verif.tanggalDiproses && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              Diproses: {new Date(verif.tanggalDiproses).toLocaleDateString('id-ID')}
                            </span>
                          )}
                        </div>
                        {verif.nomorSKKecamatan && (
                          <div className="text-[11px] font-mono text-amber-300 font-bold mb-0.5">
                            Nomor SK: {verif.nomorSKKecamatan}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-300 mt-0.5">
                          <span className="font-semibold text-slate-400">Catatan Kecamatan:</span> {verif.catatanKecamatan}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Verifikator: <span className="text-slate-200 font-medium">{verif.diverifikasiOleh}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
                  <div>
                    {/* Admin Delete Action Button inside card */}
                    {canVerify && (
                      <button
                        onClick={() => setDeleteModalVerif(verif)}
                        className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Hapus Pengajuan Ini</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Desa Revision button for rejected items */}
                    {canDesaRevisi && (
                      <button
                        onClick={() => handleOpenRevisi(verif)}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-950" />
                        <span>Revisi & Ajukan Kembali</span>
                      </button>
                    )}

                    {/* Kecamatan Admin Approve / Reject actions */}
                    {canVerify && isPending && (
                      <>
                        <button
                          onClick={() => handleOpenAction(verif, 'reject')}
                          className="px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Tolak / Minta Revisi</span>
                        </button>

                        <button
                          onClick={() => handleOpenAction(verif, 'approve')}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Setujui Permohonan Ini</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: Kecamatan Action (Approve / Reject) */}
      {selectedVerif && actionType && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0E1526] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedVerif(null);
                setActionType(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`p-2 rounded-xl ${
                  actionType === 'approve'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {actionType === 'approve' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  {actionType === 'approve'
                    ? 'Persetujuan Verifikasi Kecamatan Sirombu'
                    : 'Penolakan / Catatan Perbaikan Permohonan'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedVerif.desaName} • {selectedVerif.asetSnapshot?.namaAset || 'Aset'}
                </p>
              </div>
            </div>

            {actionType === 'approve' && (
              <div className="p-3 mb-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-200 space-y-1">
                <span className="font-bold text-blue-300 block">
                  {selectedVerif.tipe === 'mutasi' ? 'Dampak Persetujuan Mutasi:' : 'Dampak Persetujuan Penghapusan:'}
                </span>
                <p className="text-slate-300">
                  {selectedVerif.tipe === 'mutasi'
                    ? `Aset akan berpindah/berubah status dan kolom keterangan otomatis diberi catatan: "Telah dilakukan mutasi dari ${selectedVerif.desaName} ke ${selectedVerif.tujuanMutasi || 'Pihak Lain'} pada tanggal [Tanggal Hari Ini] (SK No. ...)"`
                    : `Aset akan diberi status terhapus dan kolom keterangan otomatis diberi catatan: "Telah dihapus pada tanggal [Tanggal Hari Ini] (SK No. ...)"`}
                </p>
              </div>
            )}

            <form onSubmit={handleConfirmAction} className="space-y-3.5 text-xs">
              {actionType === 'approve' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Nomor Surat Keputusan (SK) Camat Sirombu
                  </label>
                  <input
                    type="text"
                    required
                    value={nomorSK}
                    onChange={(e) => setNomorSK(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Format resmi penomoran SK verifikasi Kecamatan Sirombu
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Catatan Berita Acara & Rekomendasi Verifikator *
                </label>
                <textarea
                  required
                  rows={4}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVerif(null);
                    setActionType(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold shadow-lg transition-all ${
                    actionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                  }`}
                >
                  {actionType === 'approve' ? 'Konfirmasi & Terbitkan Persetujuan' : 'Kirim Penolakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Desa Revision & Re-submission */}
      {revisiModalVerif && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0E1526] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setRevisiModalVerif(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Revisi & Ajukan Ulang Permohonan {revisiModalVerif.tipe === 'mutasi' ? 'Mutasi' : 'Penghapusan'}
                </h3>
                <p className="text-xs text-amber-300/80 font-mono">
                  {revisiModalVerif.desaName} • {revisiModalVerif.asetSnapshot?.namaAset || 'Aset'}
                </p>
              </div>
            </div>

            {/* Catatan Penolakan Sebelumnya dari Kecamatan */}
            {revisiModalVerif.catatanKecamatan && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-200 space-y-1">
                <div className="font-bold flex items-center gap-1 text-red-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Catatan Penolakan dari Kecamatan Sirombu:
                </div>
                <p className="text-slate-300 leading-relaxed pl-4">
                  "{revisiModalVerif.catatanKecamatan}"
                </p>
                {revisiModalVerif.diverifikasiOleh && (
                  <div className="text-[10px] text-slate-400 pl-4">
                    Oleh: {revisiModalVerif.diverifikasiOleh}
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleConfirmRevisi} className="space-y-3.5 text-xs">
              {revisiModalVerif.tipe === 'mutasi' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Tujuan Mutasi / Instansi Penerima Aset *
                  </label>
                  <input
                    type="text"
                    required
                    value={revisiTujuanMutasi}
                    onChange={(e) => setRevisiTujuanMutasi(e.target.value)}
                    placeholder="Contoh: BUMDes Sirombu Mandiri, Desa Tetesua, dsb."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Alasan & Dasar Pertimbangan Desa (Diperbaiki) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={revisiAlasan}
                  onChange={(e) => setRevisiAlasan(e.target.value)}
                  placeholder="Jelaskan alasan dan dasar pertimbangan baru atau yang telah disempurnakan..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nomor Surat Pengantar Kades (Baru / Revisi) *
                </label>
                <input
                  type="text"
                  required
                  value={revisiNomorSurat}
                  onChange={(e) => setRevisiNomorSurat(e.target.value)}
                  placeholder="Contoh: 141/025/DS-SRB/II/2026"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Dokumen Pendukung / Berita Acara Musdes Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={revisiDokumen}
                  onChange={(e) => setRevisiDokumen(e.target.value)}
                  placeholder="Contoh: Berita Acara Musdes No. 06/BAMD/2026 & Hasil Cek Fisik"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRevisiModalVerif(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-slate-950" />
                  <span>Simpan Revisi & Ajukan Ulang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Admin Deletion Confirmation */}
      {deleteModalVerif && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0E1526] border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setDeleteModalVerif(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Hapus Pengajuan Mutasi / Penghapusan
                </h3>
                <p className="text-xs text-red-300/80 font-mono">
                  {deleteModalVerif.desaName} • {deleteModalVerif.asetSnapshot?.namaAset || 'Aset'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                Apakah Anda yakin ingin menghapus data permohonan {deleteModalVerif.tipe === 'mutasi' ? 'mutasi' : 'penghapusan'} untuk aset:
              </p>
              <div className="p-2 rounded bg-slate-800 font-bold text-white">
                {deleteModalVerif.asetSnapshot?.namaAset || 'Aset'} (Kode: {deleteModalVerif.asetSnapshot?.kodeAset || '-'})
              </div>
              <p className="text-[11px] text-amber-300">
                Data permohonan akan dihapus secara permanen dari daftar verifikasi, dan status mutasi aset terkait akan dikembalikan ke normal (aktif).
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModalVerif(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-white" />
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
