import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah, exportToPermendagriPDF } from '../utils/reportGenerator';
import { INITIAL_KECAMATAN_PROFILE, INITIAL_DESA_LIST } from '../data/initialData';
import { NiasBaratLogo } from './NiasBaratLogo';
import {
  Building2,
  Building,
  User,
  MapPin,
  Mail,
  Phone,
  Hash,
  Save,
  CheckCircle2,
  FileText,
  Boxes,
  CircleDollarSign,
  Search,
  Printer,
  ShieldCheck,
  Edit3,
  ExternalLink,
  Info,
  Layers,
  Briefcase,
  GitBranch,
  RefreshCw,
} from 'lucide-react';
import { Desa, KecamatanProfile } from '../types';

export const DesaInfoView: React.FC = () => {
  const {
    desas,
    updateDesa,
    currentUser,
    asets,
    selectedYear,
    setActiveTab,
    setSelectedDesaFilter,
    kecamatanProfile,
    updateKecamatanProfile,
    saveMasterToSourceCode,
  } = useApp();

  const isDesaUser = currentUser?.role === 'admin_desa';
  const isKecamatanOrSuper = currentUser?.role === 'admin_kecamatan' || currentUser?.role === 'super_admin';

  // Sub-tab navigation for Admin / Super Admin: 'camat' or 'desa'
  const [activeSubTab, setActiveSubTab] = useState<'camat' | 'desa'>(
    isKecamatanOrSuper ? 'camat' : 'desa'
  );

  // ===========================================================================
  // STATE: CAMAT & KANTOR KECAMATAN (ADMIN / SUPER ADMIN)
  // ===========================================================================
  const [camatFormData, setCamatFormData] = useState<KecamatanProfile>(kecamatanProfile);
  const [isCamatDirty, setIsCamatDirty] = useState(false);

  useEffect(() => {
    if (!isCamatDirty) {
      setCamatFormData(kecamatanProfile);
    }
  }, [kecamatanProfile, isCamatDirty]);

  const handleCamatInputChange = (field: keyof KecamatanProfile, value: string) => {
    setIsCamatDirty(true);
    setCamatFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [isSavingMaster, setIsSavingMaster] = useState(false);

  const handleManualSyncMaster = async () => {
    setIsSavingMaster(true);
    const res = await saveMasterToSourceCode();
    setIsSavingMaster(false);
    setSaveSuccessMessage(res.message);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 7000);
  };

  const handleSaveCamat = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMaster(true);
    const cleaned = {
      ...camatFormData,
      namaCamat: camatFormData.namaCamat.trim(),
      nipCamat: camatFormData.nipCamat.trim(),
      pangkatCamat: camatFormData.pangkatCamat.trim(),
      jabatanCamat: camatFormData.jabatanCamat?.trim() || 'CAMAT SIROMBU',
      tempatSurat: camatFormData.tempatSurat.trim() || 'Tetesua',
      alamatKantor: camatFormData.alamatKantor.trim(),
      kodePos: camatFormData.kodePos.trim(),
      emailKantor: camatFormData.emailKantor.trim(),
      teleponKantor: camatFormData.teleponKantor.trim(),
    };
    updateKecamatanProfile(cleaned);
    setIsCamatDirty(false);

    // Save permanently to server database and master source code (src/data/initialData.ts)
    await saveMasterToSourceCode({ kecamatanProfile: cleaned });
    setIsSavingMaster(false);

    setSaveSuccessMessage(
      'Data Camat & Kantor Kecamatan Sirombu berhasil disimpan permanen ke Master Source Code (src/data/initialData.ts) dan Basis Data Server. Aman dari reset saat di-share ke GitHub!'
    );

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 7000);
  };

  // ===========================================================================
  // STATE: PROFIL DESA (25 DESA SE-KECAMATAN)
  // ===========================================================================
  const defaultDesaId = isDesaUser
    ? currentUser?.desaId || 'desa-21'
    : 'desa-21';

  const [activeDesaId, setActiveDesaId] = useState<string>(defaultDesaId);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isDesaDirty, setIsDesaDirty] = useState(false);

  const [previewKopType, setPreviewKopType] = useState<'admin' | 'desa'>(
    isDesaUser ? 'desa' : 'admin'
  );

  useEffect(() => {
    if (isDesaUser && currentUser?.desaId) {
      setActiveDesaId(currentUser.desaId);
      setActiveSubTab('desa');
      setPreviewKopType('desa');
    }
  }, [isDesaUser, currentUser?.desaId]);

  const targetDesa = desas.find((d) => d.id === activeDesaId) || desas[20] || desas[0] || INITIAL_DESA_LIST[20] || INITIAL_DESA_LIST[0];

  const [formData, setFormData] = useState({
    name: targetDesa.name,
    code: targetDesa.code,
    kepalaDesa: targetDesa.kepalaDesa || '',
    nipKepalaDesa: targetDesa.nipKepalaDesa || '',
    alamatDesa: targetDesa.alamatDesa || '',
    emailDesa: targetDesa.emailDesa || '',
    nomorHp: targetDesa.nomorHp || targetDesa.kontak || '',
    kodePos: targetDesa.kodePos || '22863',
    kaurAset: targetDesa.kaurAset || '',
  });

  useEffect(() => {
    const currentSelectedDesa = desas.find((d) => d.id === activeDesaId) || desas[20] || desas[0] || INITIAL_DESA_LIST[20] || INITIAL_DESA_LIST[0];
    setFormData({
      name: currentSelectedDesa.name,
      code: currentSelectedDesa.code,
      kepalaDesa: currentSelectedDesa.kepalaDesa || '',
      nipKepalaDesa: currentSelectedDesa.nipKepalaDesa || '',
      alamatDesa: currentSelectedDesa.alamatDesa || '',
      emailDesa: currentSelectedDesa.emailDesa || '',
      nomorHp: currentSelectedDesa.nomorHp || currentSelectedDesa.kontak || '',
      kodePos: currentSelectedDesa.kodePos || '22863',
      kaurAset: currentSelectedDesa.kaurAset || '',
    });
    setIsDesaDirty(false);
    setSaveSuccessMessage(null);
  }, [activeDesaId]);

  const handleInputChange = (field: string, value: string) => {
    setIsDesaDirty(true);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDesa = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMaster(true);
    const cleanedDesa = {
      kepalaDesa: formData.kepalaDesa.trim(),
      nipKepalaDesa: formData.nipKepalaDesa.trim(),
      alamatDesa: formData.alamatDesa.trim(),
      emailDesa: formData.emailDesa.trim(),
      nomorHp: formData.nomorHp.trim(),
      kontak: formData.nomorHp.trim(),
      kodePos: formData.kodePos.trim(),
      kaurAset: formData.kaurAset.trim(),
    };
    updateDesa(targetDesa.id, cleanedDesa);
    setIsDesaDirty(false);

    // Save permanently to server database and master source code (src/data/initialData.ts)
    const updatedDesasList = desas.map((d) => (d.id === targetDesa.id ? { ...d, ...cleanedDesa } : d));
    await saveMasterToSourceCode({ desas: updatedDesasList });
    setIsSavingMaster(false);

    setSaveSuccessMessage(
      `Profil ${targetDesa.name} berhasil disimpan permanen ke Master Source Code (src/data/initialData.ts) dan Basis Data Server. Aman dari reset saat di-share ke GitHub!`
    );

    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 7000);
  };

  const desaAsets = asets.filter((a) => a.desaId === targetDesa.id && a.status !== 'terhapus');
  const desaVal = desaAsets.reduce((sum, item) => sum + (item.nilaiPerolehan || 0), 0);

  // PDF Export Trigger
  const handleDownloadPDF = async (asAdminFormat: boolean = isKecamatanOrSuper) => {
    setIsGeneratingPDF(true);
    try {
      await exportToPermendagriPDF({
        desa: { ...targetDesa, ...formData },
        year: selectedYear,
        asets,
        isPrintedByAdmin: asAdminFormat,
        camatName: kecamatanProfile.namaCamat,
        camatPangkat: kecamatanProfile.pangkatCamat,
        camatNip: kecamatanProfile.nipCamat,
        alamatKecamatan: kecamatanProfile.alamatKantor,
        tempatSurat: kecamatanProfile.tempatSurat,
        kodePosKecamatan: kecamatanProfile.kodePos,
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Terjadi kesalahan saat membuat file PDF.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadRekapPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await exportToPermendagriPDF({
        allDesas: desas,
        isAllDesaMode: true,
        year: selectedYear,
        asets,
        isPrintedByAdmin: true,
        camatName: camatFormData.namaCamat,
        camatPangkat: camatFormData.pangkatCamat,
        camatNip: camatFormData.nipCamat,
        alamatKecamatan: camatFormData.alamatKantor,
        tempatSurat: camatFormData.tempatSurat,
        kodePosKecamatan: camatFormData.kodePos,
      });
    } catch (err) {
      console.error('Failed to generate rekap PDF:', err);
      alert('Terjadi kesalahan saat membuat file PDF Rekapitulasi.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const filteredDesas = desas.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.kepalaDesa.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Pengaturan Profil & Cetak PDF
            </span>
            <span className="text-xs text-slate-400">• Kecamatan Sirombu, Nias Barat</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Data Kecamatan, Camat & Profil Desa</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Kelola data resmi Camat Sirombu, alamat kantor kecamatan, dan data kepala desa untuk dicantumkan secara presisi pada Kop Surat dan Tanda Tangan Cetakan PDF Permendagri No. 20/2018.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleManualSyncMaster}
            disabled={isSavingMaster}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-all shadow cursor-pointer disabled:opacity-50"
            title="Simpan seluruh data saat ini ke src/data/initialData.ts agar tidak ter-reset ke setelan awal saat di-share ke GitHub"
          >
            <GitBranch className={`w-3.5 h-3.5 ${isSavingMaster ? 'animate-spin text-amber-300' : 'text-amber-400'}`} />
            <span>{isSavingMaster ? 'Menyimpan...' : 'Simpan Permanen Master (GitHub)'}</span>
          </button>

          {activeSubTab === 'camat' ? (
            <button
              onClick={handleDownloadRekapPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isGeneratingPDF ? 'Membuat PDF...' : 'Cetak Rekap Semua Desa'}</span>
            </button>
          ) : (
            <button
              onClick={() => handleDownloadPDF(isKecamatanOrSuper)}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              <span>{isGeneratingPDF ? 'Membuat PDF...' : 'Cetak PDF Sekarang'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Banner GitHub Persistence */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 text-sky-200 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            <strong>Proteksi GitHub Aktif:</strong> Perubahan data Camat, Desa, dan Aset otomatis ditulis permanen ke Master Source Code (<code className="font-mono text-sky-300 bg-sky-950/60 px-1 py-0.5 rounded">src/data/initialData.ts</code>) dan server. Data tidak akan kembali ke setelan awal saat di-share ke GitHub!
          </span>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3.5 flex items-center gap-3 text-emerald-300 text-xs shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-medium">{saveSuccessMessage}</span>
        </div>
      )}

      {/* Sub-tab Navigation (Camat vs Desa) for Admin & Super Admin */}
      {isKecamatanOrSuper && (
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveSubTab('camat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'camat'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Data Camat & Kantor Kecamatan</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                activeSubTab === 'camat' ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              Admin/Super
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('desa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'desa'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Data Profil 25 Desa</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                activeSubTab === 'desa' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              25 Desa
            </span>
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: DATA CAMAT & KANTOR KECAMATAN SIROMBU (ADMIN / SUPER ADMIN)   */}
      {/* ===================================================================== */}
      {activeSubTab === 'camat' && isKecamatanOrSuper && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Edit Camat (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0E1526] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Formulir Pejabat Camat & Kantor Kecamatan Sirombu
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Kop surat, alamat penetapan, dan pengesahan tanda tangan Camat di cetakan PDF
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveCamat} className="space-y-4 text-xs">
              {/* SECTION A: PEJABAT CAMAT */}
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <User className="w-4 h-4" />
                  <span>Data Pejabat Camat (Penandatangan Laporan)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Nama Lengkap & Gelar Camat *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: MESRAWAN HAREFA, S.Pd., M.M."
                      value={camatFormData.namaCamat}
                      onChange={(e) => handleCamatInputChange('namaCamat', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1">
                      NIP Camat *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 19780512 200501 1 008"
                      value={camatFormData.nipCamat}
                      onChange={(e) => handleCamatInputChange('nipCamat', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Pangkat / Golongan Ruang *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Pembina, IV/a"
                      value={camatFormData.pangkatCamat}
                      onChange={(e) => handleCamatInputChange('pangkatCamat', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Jabatan Resmi *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: CAMAT SIROMBU"
                      value={camatFormData.jabatanCamat || 'CAMAT SIROMBU'}
                      onChange={(e) => handleCamatInputChange('jabatanCamat', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-white mb-1">
                    Tempat Penetapan Surat / Pengesahan (Muncul sebelum tanggal cetak) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Tetesua"
                    value={camatFormData.tempatSurat}
                    onChange={(e) => handleCamatInputChange('tempatSurat', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format cetakan tanda tangan akan tercantum: <span className="text-amber-300 font-medium">{camatFormData.tempatSurat || 'Tetesua'}, [Tanggal Cetak]</span>
                  </p>
                </div>
              </div>

              {/* SECTION B: KANTOR KECAMATAN */}
              <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <MapPin className="w-4 h-4" />
                  <span>Identitas & Kop Surat Kantor Kecamatan Sirombu</span>
                </div>

                <div>
                  <label className="block font-semibold text-white mb-1">
                    Alamat Lengkap Kantor Kecamatan (Tercetak pada Kop Surat PDF) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Contoh: Tetesua Desa Tegideu Kec. Sirombu Kabupaten Nias Barat"
                    value={camatFormData.alamatKantor}
                    onChange={(e) => handleCamatInputChange('alamatKantor', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Kode Pos *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="22863"
                      value={camatFormData.kodePos}
                      onChange={(e) => handleCamatInputChange('kodePos', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1">
                      Email Resmi Kantor
                    </label>
                    <input
                      type="email"
                      placeholder="kecamatan.sirombu@niasbaratkab.go.id"
                      value={camatFormData.emailKantor}
                      onChange={(e) => handleCamatInputChange('emailKantor', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1">
                      No. HP / Kontak Kantor
                    </label>
                    <input
                      type="text"
                      placeholder="0813 6699 8787"
                      value={camatFormData.teleponKantor}
                      onChange={(e) => handleCamatInputChange('teleponKantor', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Data Camat & Kantor Kecamatan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview Camat Kop & Signature (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Pratinjau Kop & Tanda Tangan Camat</span>
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Live Preview
                </span>
              </div>

              {/* Simulated Kop Surat Admin Paper */}
              <div className="bg-white text-slate-900 rounded-xl p-4 shadow-xl border border-slate-300 font-sans select-none">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <NiasBaratLogo size={50} />
                  </div>
                  <div className="flex-1 text-center pr-3">
                    <div className="text-[11px] font-bold uppercase tracking-wide leading-tight text-black">
                      PEMERINTAH KABUPATEN NIAS BARAT
                    </div>
                    <div className="text-[13px] font-extrabold uppercase tracking-wider leading-tight text-black mt-0.5">
                      KECAMATAN SIROMBU
                    </div>
                    <div className="text-[8.5px] italic text-slate-800 leading-tight pt-0.5">
                      Alamat : {camatFormData.alamatKantor || 'Tetesua Desa Tegideu Kec. Sirombu Kabupaten Nias Barat'} KP. {camatFormData.kodePos || '22863'}
                    </div>
                  </div>
                </div>

                {/* Double Border Line */}
                <div className="pt-2">
                  <div className="border-b-[2px] border-black w-full" />
                  <div className="border-b-[0.75px] border-black w-full mt-[1.5px]" />
                </div>

                <div className="pt-2 text-center">
                  <div className="text-[10px] font-black uppercase text-black tracking-wide">
                    REKAPITULASI ASET TETAP DESA SE-KECAMATAN SIROMBU
                  </div>
                  <div className="text-[8px] italic text-slate-600">
                    Per 31 Desember {selectedYear} • Sesuai Lampiran Permendagri No. 20 Tahun 2018
                  </div>
                </div>
              </div>

              {/* Signature Preview Block */}
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                <div className="text-right">
                  <div className="inline-block text-center min-w-[220px] bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <p className="text-[11px] text-slate-300">
                      {camatFormData.tempatSurat || 'Tetesua'}, 31 Desember {selectedYear}
                    </p>
                    <p className="text-[11px] font-bold text-white uppercase mt-0.5">
                      {camatFormData.jabatanCamat || 'CAMAT SIROMBU'},
                    </p>

                    <div className="h-14 flex items-center justify-center text-[9px] text-amber-400 font-bold">
                      <ShieldCheck className="w-4 h-4 inline mr-1 text-amber-400" />
                      [ Cap Dinas & Tanda Tangan Camat ]
                    </div>

                    <p className="text-[11px] font-bold text-white underline tracking-wide uppercase">
                      {camatFormData.namaCamat || '(Nama Camat Belum Diisi)'}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      {camatFormData.pangkatCamat || '(Pangkat / Golongan)'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      NIP. {camatFormData.nipCamat || '(NIP Camat)'}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadRekapPDF}
                    disabled={isGeneratingPDF}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    <span>
                      {isGeneratingPDF ? 'Memproses PDF...' : 'Unduh Rekapitulasi Semua Desa (PDF)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: DATA PROFIL DESA (25 DESA SE-KECAMATAN SIROMBU)               */}
      {/* ===================================================================== */}
      {(activeSubTab === 'desa' || isDesaUser) && (
        <>
          {/* Village Selector for Kecamatan Admin / Super Admin */}
          {isKecamatanOrSuper && (
            <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Pilih Desa yang Akan Dikelola ({desas.length} Desa se-Kecamatan Sirombu)
                  </h3>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari desa atau kepala desa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {filteredDesas.map((d) => {
                  const isSelected = d.id === activeDesaId;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setActiveDesaId(d.id)}
                      className={`px-3 py-2 rounded-xl text-left shrink-0 transition-all border text-xs cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                          : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                      }`}
                    >
                      <div className="font-bold whitespace-nowrap">{d.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-slate-900/80 font-medium' : 'text-slate-400'}`}>
                        {d.kepalaDesa || 'Belum diatur'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Grid: Form on Left (7 cols), Live PDF Paper Preview on Right (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form Section (7 cols) */}
            <div className="lg:col-span-7 bg-[#0E1526] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black text-xs">
                    {targetDesa.code.split('.')[1] || '01'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Formulir Profil {targetDesa.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Kode Kemendagri: <span className="font-mono text-amber-400">{targetDesa.code}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Aset Tercatat</span>
                  <div className="text-xs font-bold text-emerald-400 font-mono">
                    {formatRupiah(desaVal)}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveDesa} className="space-y-4 text-xs">
                {/* Nama Kepala Desa & NIP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-white mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nama Kepala Desa *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Bazisokhi Daeli"
                      value={formData.kepalaDesa}
                      onChange={(e) => handleInputChange('kepalaDesa', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1.5 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-amber-400" />
                      <span>NIP Kepala Desa</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Kosongkan atau isi '-' jika non-PNS"
                      value={formData.nipKepalaDesa}
                      onChange={(e) => handleInputChange('nipKepalaDesa', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Bila dikosongkan atau diisi &apos;-&apos;, cetakan otomatis menampilkan: <span className="text-amber-300 font-mono">NIP. -</span>
                    </p>
                  </div>
                </div>

                {/* Alamat Desa & Kode Pos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-white mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Alamat Kantor Desa</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Desa Togideu Kecamatan Sirombu Kabupaten Nias Barat"
                      value={formData.alamatDesa}
                      onChange={(e) => handleInputChange('alamatDesa', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1.5 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Kode Pos</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 22863"
                      value={formData.kodePos}
                      onChange={(e) => handleInputChange('kodePos', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Email & Nomor HP */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block font-semibold text-white mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Email Resmi Desa (Opsional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Contoh: kantor@sirombu.desa.id"
                      value={formData.emailDesa}
                      onChange={(e) => handleInputChange('emailDesa', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Nomor HP / Telepon Desa (Opsional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 081263001021"
                      value={formData.nomorHp}
                      onChange={(e) => handleInputChange('nomorHp', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Petugas Kaur TU & Umum (Pengurus Barang Desa) */}
                <div className="pt-2">
                  <label className="block font-semibold text-white mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Petugas Pengelola Aset (Kaur TU & Umum)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Faomaso Hia"
                    value={formData.kaurAset}
                    onChange={(e) => handleInputChange('kaurAset', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Sebagai Penatausahaan Barang Milik Desa sesuai Pasal 7 Permendagri No. 20/2018.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Profil {targetDesa.name}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Preview Section (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Pratinjau Kop Surat PDF (Font Arial)
                  </h4>

                  {/* Toggle Format Kop */}
                  <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setPreviewKopType('admin')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        previewKopType === 'admin'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Kop Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewKopType('desa')}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        previewKopType === 'desa'
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Kop Desa
                    </button>
                  </div>
                </div>

                {/* Simulation of Paper Kop */}
                <div className="bg-white text-slate-900 rounded-xl p-4 shadow-xl border border-slate-300 font-sans select-none">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      <NiasBaratLogo size={50} />
                    </div>

                    <div className="flex-1 text-center pr-3">
                      {previewKopType === 'admin' ? (
                        <div className="space-y-0.5">
                          <div className="text-[11px] font-bold uppercase tracking-wide leading-tight text-black">
                            PEMERINTAH KABUPATEN NIAS BARAT
                          </div>
                          <div className="text-[13px] font-bold uppercase tracking-wider leading-tight text-black">
                            KECAMATAN SIROMBU
                          </div>
                          <div className="text-[8.5px] italic text-slate-800 leading-tight pt-0.5">
                            Alamat : {kecamatanProfile.alamatKantor} KP. {kecamatanProfile.kodePos}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="text-[10.5px] font-bold uppercase tracking-wide leading-tight text-black">
                            PEMERINTAH KABUPATEN NIAS BARAT
                          </div>
                          <div className="text-[11.5px] font-bold uppercase tracking-wider leading-tight text-black">
                            KECAMATAN SIROMBU
                          </div>
                          <div className="text-[12.5px] font-extrabold uppercase tracking-wide leading-tight text-black">
                            {formData.name.toUpperCase().startsWith('DESA ')
                              ? formData.name.toUpperCase()
                              : `DESA ${formData.name.toUpperCase()}`}
                          </div>
                          <div className="text-[8.5px] italic text-slate-800 leading-tight pt-0.5">
                            Alamat : {formData.alamatDesa || `${formData.name ? formData.name.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Desa Sirombu'} Kecamatan Sirombu Kabupaten Nias Barat`} KP. {formData.kodePos || '22863'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Double Line Underneath Kop */}
                  <div className="pt-2">
                    <div className="border-b-[2px] border-black w-full" />
                    <div className="border-b-[0.75px] border-black w-full mt-[1.5px]" />
                  </div>

                  <div className="pt-2 text-center">
                    <div className="text-[10px] font-black uppercase text-black tracking-wide">
                      RINCIAN ASET TETAP DESA PER 31 DESEMBER {selectedYear}
                    </div>
                    <div className="text-[8px] italic text-slate-600">
                      (Format Standar Berdasarkan Lampiran Permendagri Nomor 20 Tahun 2018)
                    </div>
                  </div>
                </div>

                {/* Simulation of Signature Block */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-white">Format Tanda Tangan Cetakan</h5>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        previewKopType === 'desa'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {previewKopType === 'desa' ? 'Cetak Akun Desa (Kepala Desa)' : 'Cetak Admin (Camat Sirombu)'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 text-[10px]">
                    <div className="flex justify-end">
                      {previewKopType === 'admin' ? (
                        <div className="text-center min-w-[210px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                          <p className="text-slate-300 text-[10px]">
                            {kecamatanProfile.tempatSurat || 'Tetesua'}, 31 Des {selectedYear}
                          </p>
                          <p className="font-bold text-white uppercase text-[10px] mt-0.5">
                            CAMAT SIROMBU,
                          </p>
                          <div className="h-10 flex items-center justify-center text-[9px] text-amber-400 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
                            (Cap Dinas & Tanda Tangan)
                          </div>
                          <p className="font-bold text-white underline underline-offset-2 uppercase text-[10px]">
                            {kecamatanProfile.namaCamat}
                          </p>
                          <p className="text-[9px] text-slate-300 mt-0.5">{kecamatanProfile.pangkatCamat}</p>
                          <p className="text-[9px] text-slate-400 font-mono">NIP. {kecamatanProfile.nipCamat}</p>
                        </div>
                      ) : (
                        <div className="text-center min-w-[210px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                          <p className="text-slate-300 text-[10px]">
                            {(targetDesa?.name || '').replace(/^DESA\s+/i, '')}, 31 Des {selectedYear}
                          </p>
                          <p className="font-bold text-white uppercase text-[10px] mt-0.5">
                            Kepala Desa {(targetDesa?.name || '').replace(/^DESA\s+/i, '')}
                          </p>
                          <div className="h-10 flex items-center justify-center text-[9px] text-slate-500 italic">
                            (Tanda Tangan & Cap Desa)
                          </div>
                          <p className="font-bold text-white underline underline-offset-2 uppercase text-[10px]">
                            {formData.kepalaDesa || 'Nama Kepala Desa'}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            {formData.nipKepalaDesa && formData.nipKepalaDesa.trim() !== '' && formData.nipKepalaDesa.trim() !== '-'
                              ? `NIP. ${formData.nipKepalaDesa.trim()}`
                              : 'NIP. -'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Print button right from the preview */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(previewKopType === 'admin')}
                        disabled={isGeneratingPDF}
                        className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                      >
                        <Printer className="w-4 h-4" />
                        <span>
                          {isGeneratingPDF
                            ? 'Memproses PDF...'
                            : `Unduh PDF (${previewKopType === 'admin' ? 'Format Admin' : 'Format Desa'})`}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setSelectedDesaFilter(targetDesa.id);
                      setActiveTab('aset');
                    }}
                    className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Lihat {desaAsets.length} Aset Desa &rarr;</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedDesaFilter(targetDesa.id);
                      setActiveTab('laporan');
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Buka Lembar Laporan &rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
