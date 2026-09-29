import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Aset } from '../types';
import { INITIAL_DESA_LIST } from '../data/initialData';
import {
  exportToPermendagriPDF,
  exportToCSV,
  formatRupiah,
  formatNumber,
  formatTanggalIndonesia,
  KLASIFIKASI_LIST,
  ROMAN_KLASIFIKASI,
} from '../utils/reportGenerator';
import { NiasBaratLogo } from './NiasBaratLogo';
import { PdfPreviewModal } from './PdfPreviewModal';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Building,
  MapPin,
  ShieldCheck,
  HelpCircle,
  Layers,
  Eye,
} from 'lucide-react';

export const LaporanPermendagriView: React.FC = () => {
  const {
    asets,
    desas,
    currentUser,
    selectedYear,
    setSelectedYear,
    selectedDesaFilter,
    setSelectedDesaFilter,
  } = useApp();

  const isDesaUser = currentUser?.role === 'admin_desa';
  const isKecamatanOrSuper = currentUser?.role === 'admin_kecamatan' || currentUser?.role === 'super_admin';

  const [tanggalCetak, setTanggalCetak] = useState('2026-09-20');
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  // Available budget years dynamically generated from assets + defaults
  const availableYears = useMemo(() => {
    const set = new Set<number>([2026, 2025, 2024, 2023, 2022, 2021, 2020]);
    asets.forEach((a) => {
      if (a.tahunPerolehan && typeof a.tahunPerolehan === 'number' && a.tahunPerolehan > 1990 && a.tahunPerolehan < 2100) {
        set.add(a.tahunPerolehan);
      }
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [asets]);

  // Selected year filter: 'all' (Seluruh Tahun Anggaran) or specific year string like '2025'
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>(() => {
    return selectedYear ? selectedYear.toString() : 'all';
  });

  // Effective numeric year for PDF export/generator (0 = all years)
  const effectiveYearNumber = selectedYearFilter === 'all' ? 0 : Number(selectedYearFilter);

  // All desa mode is active when an admin selects "all"
  const isAllDesaMode = isKecamatanOrSuper && selectedDesaFilter === 'all';

  // Active village selection: If desa user, locked to their own village
  const currentDesaId = isDesaUser
    ? currentUser.desaId || 'desa-21'
    : selectedDesaFilter === 'all'
    ? 'all'
    : selectedDesaFilter;

  const currentDesa = desas.find((d) => d.id === currentDesaId) || desas[20] || desas[0] || INITIAL_DESA_LIST[20] || INITIAL_DESA_LIST[0];

  // Filter assets for this view: When specific year is selected, strictly match that year!
  const reportAsets = useMemo(() => {
    const matchYear = (a: Aset) => {
      if (selectedYearFilter === 'all') return true;
      return a.tahunPerolehan === Number(selectedYearFilter);
    };

    if (isAllDesaMode) {
      return asets
        .filter((a) => matchYear(a) && a.status !== 'terhapus')
        .sort((a, b) => {
          if (a.desaName !== b.desaName) {
            return (a.desaName || '').localeCompare(b.desaName || '');
          }
          const orderA = KLASIFIKASI_LIST.indexOf((a.klasifikasi || '').replace(/^[I|V|X]+\.\s*/, '') as any);
          const orderB = KLASIFIKASI_LIST.indexOf((b.klasifikasi || '').replace(/^[I|V|X]+\.\s*/, '') as any);
          return orderA - orderB;
        });
    }

    return asets
      .filter((a) => a.desaId === currentDesaId && matchYear(a) && a.status !== 'terhapus')
      .sort((a, b) => {
        const orderA = KLASIFIKASI_LIST.indexOf((a.klasifikasi || '').replace(/^[I|V|X]+\.\s*/, '') as any);
        const orderB = KLASIFIKASI_LIST.indexOf((b.klasifikasi || '').replace(/^[I|V|X]+\.\s*/, '') as any);
        return orderA - orderB;
      });
  }, [asets, currentDesaId, isAllDesaMode, selectedYearFilter]);

  // Aggregate stats
  const totalValuation = reportAsets.reduce((sum, item) => sum + (item.nilaiPerolehan || 0), 0);

  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Handle PDF Export
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportToPermendagriPDF({
        desa: currentDesa,
        allDesas: desas,
        isAllDesaMode,
        year: effectiveYearNumber,
        asets: reportAsets,
        isPrintedByAdmin: isKecamatanOrSuper,
        tanggalCetak,
        camatName,
        camatPangkat,
        camatNip,
        alamatKecamatan,
        tempatSurat,
        kodePosKecamatan,
      });
    } catch (err) {
      console.error('Export error:', err);
      alert('Terjadi kesalahan saat membuat file PDF.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    exportToCSV(currentDesa, effectiveYearNumber, reportAsets);
  };

  // Handle Print -> Opens interactive PDF Preview before printing/downloading
  const handlePrint = () => {
    setShowPdfPreview(true);
  };

  const { kecamatanProfile } = useApp();
  const camatName = kecamatanProfile.namaCamat;
  const camatPangkat = kecamatanProfile.pangkatCamat;
  const camatNip = kecamatanProfile.nipCamat;
  const tempatSurat = kecamatanProfile.tempatSurat || 'Tetesua';
  const alamatKecamatan = kecamatanProfile.alamatKantor;
  const kodePosKecamatan = kecamatanProfile.kodePos;

  return (
    <div className="space-y-6">
      {/* Header and Control Bar */}
      <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Format Permendagri No. 20 Tahun 2018
            </span>
            <span className="text-xs text-slate-400">
              Kecamatan Sirombu • Nias Barat
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {isAllDesaMode
              ? 'Laporan Rekapitulasi Seluruh Desa se-Kecamatan'
              : `Laporan Penatausahaan Aset Tetap • ${currentDesa.name}`}
          </h2>
          <p className="text-xs text-slate-400">
            {selectedYearFilter === 'all'
              ? 'Rekapitulasi Seluruh Tahun Anggaran'
              : `Per 31 Desember ${selectedYearFilter} (Tahun Anggaran ${selectedYearFilter})`} • {isAllDesaMode ? 'Memuat seluruh aset 25 desa dikelompokkan per desa' : `Format resmi penatausahaan aset tetap ${currentDesa.name}`}.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF || reportAsets.length === 0}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/20 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPDF ? 'Menyiapkan PDF...' : 'Ekspor PDF Resmi'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={reportAsets.length === 0}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-40 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            title="Tampilkan Pratinjau Cetakan PDF Sebelum Dicetak atau Diunduh"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Cetak / Pratinjau PDF</span>
          </button>
        </div>
      </div>

      {/* Village & Year Filter + Approval Status Bar */}
      <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Desa selector */}
          {!isDesaUser ? (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Pilih Cakupan Desa:</span>
              <select
                value={selectedDesaFilter}
                onChange={(e) => {
                  setSelectedDesaFilter(e.target.value);
                }}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-amber-300 font-bold">
                  ★ Semua Desa (25 Desa Se-Kecamatan Sirombu)
                </option>
                <optgroup label="Desa Individual" className="bg-slate-900 text-slate-400 font-semibold">
                  {desas.map((d) => (
                    <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentDesa.name}</span>
            </div>
          )}

          {/* Year selector with "Seluruh Tahun Anggaran" */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Tahun Anggaran:</span>
            <select
              value={selectedYearFilter}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedYearFilter(val);
                if (val !== 'all') {
                  setSelectedYear(parseInt(val, 10));
                }
              }}
              className="bg-transparent text-amber-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-amber-300 font-bold">
                ★ Seluruh Tahun Anggaran (Semua Tahun)
              </option>
              {availableYears.map((y) => (
                <option key={y} value={y.toString()} className="bg-slate-900 text-white">
                  Tahun Anggaran {y}
                </option>
              ))}
            </select>
          </div>

          {/* Menu Tanggal Cetak */}
          <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-slate-300 shadow-sm shadow-amber-500/10">
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-400 font-medium">Tanggal Cetak:</span>
            <input
              type="date"
              value={tanggalCetak}
              onChange={(e) => setTanggalCetak(e.target.value)}
              className="bg-slate-950 text-amber-300 font-bold px-2 py-0.5 rounded border border-slate-700 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              title="Atur Tanggal Cetak yang Tertera pada Tanda Tangan"
            />
            <span className="text-[11px] text-amber-400/90 font-medium hidden sm:inline">
              ({isKecamatanOrSuper ? 'Tetesua' : (currentDesa?.name || '').replace(/^DESA\s+/i, '')}, {formatTanggalIndonesia(tanggalCetak)})
            </span>
          </div>
        </div>
      </div>

      {/* Official Permendagri 20/2018 Document Paper Layout */}
      <div className="bg-[#0E1526] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Kop Surat Resmi Sesuai Format Foto */}
        <div className="bg-white text-slate-900 rounded-xl p-5 shadow-lg border border-slate-300 font-sans">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <NiasBaratLogo size={65} />
            </div>

            <div className="flex-1 text-center pr-4">
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wide text-black leading-tight">
                  PEMERINTAH KABUPATEN NIAS BARAT
                </h4>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-black leading-tight">
                  KECAMATAN SIROMBU
                </h3>
                {!isAllDesaMode && (
                  <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-black leading-tight">
                    {currentDesa.name.toUpperCase().startsWith('DESA ')
                      ? currentDesa.name.toUpperCase()
                      : `DESA ${currentDesa.name.toUpperCase()}`}
                  </h2>
                )}
                <p className="text-[10px] sm:text-xs italic text-slate-800 leading-tight pt-0.5">
                  {isAllDesaMode
                    ? `Alamat : ${alamatKecamatan} KP. ${kodePosKecamatan}`
                    : `Alamat : ${currentDesa.alamatDesa || `${currentDesa.name ? currentDesa.name.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Desa Sirombu'} Kecamatan Sirombu Kabupaten Nias Barat`}      KP. ${currentDesa.kodePos || '22863'}`}
                </p>
              </div>
            </div>
          </div>

          {/* Garis Ganda Kop Surat (Tebal + Tipis) */}
          <div className="pt-3">
            <div className="border-b-[2.5px] border-black w-full" />
            <div className="border-b-[1px] border-black w-full mt-[1.5px]" />
          </div>

          {/* Judul Laporan */}
          <div className="pt-3 text-center">
            <h1 className="text-xs sm:text-sm font-black uppercase text-black tracking-wide">
              {isAllDesaMode
                ? `REKAPITULASI ASET TETAP DESA SE-KECAMATAN SIROMBU ${selectedYearFilter === 'all' ? 'SELURUH TAHUN ANGGARAN' : `PER 31 DESEMBER ${selectedYearFilter}`}`
                : `RINCIAN ASET TETAP DESA ${selectedYearFilter === 'all' ? 'SELURUH TAHUN ANGGARAN' : `PER 31 DESEMBER ${selectedYearFilter}`}`}
            </h1>
            <p className="text-[10px] italic text-slate-600 mt-0.5">
              (Format Standar Berdasarkan Lampiran Permendagri Nomor 20 Tahun 2018 tentang Pengelolaan Keuangan & Aset Desa)
            </p>
          </div>
        </div>

        {/* Report Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Cakupan Laporan:</span>
            <span className="text-sm font-black text-white">
              {isAllDesaMode ? '25 Desa se-Kecamatan' : currentDesa.name}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Total Nilai Perolehan:</span>
            <span className="text-lg font-black text-emerald-400 font-mono">{formatRupiah(totalValuation)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Penandatangan Laporan:</span>
            <span className="text-sm font-bold text-amber-400">
              {isKecamatanOrSuper ? `CAMAT SIROMBU (${camatName})` : `KEPALA DESA (${currentDesa.kepalaDesa})`}
            </span>
          </div>
        </div>

        {/* 10-Column Permendagri 20/2018 Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead className="bg-slate-900/90 text-slate-300 font-bold uppercase text-[10px] text-center border-b border-slate-700">
              <tr>
                <th rowSpan={2} className="py-2 px-2 border-r border-slate-800 w-10">No</th>
                <th rowSpan={2} className="py-2 px-3 border-r border-slate-800 text-left">
                  Klas Aset dan Nama/Identitas Aset Tetap
                </th>
                <th colSpan={3} className="py-1 px-2 border-r border-slate-800 border-b border-slate-800">
                  Bukti Kepemilikan
                </th>
                <th rowSpan={2} className="py-2 px-2.5 border-r border-slate-800 w-28">Kode Aset Tetap</th>
                <th rowSpan={2} className="py-2 px-2 border-r border-slate-800 w-16">Tahun Perolehan</th>
                <th rowSpan={2} className="py-2 px-3 border-r border-slate-800 text-right w-28">Nilai Perolehan (Rp)</th>
                <th rowSpan={2} className="py-2 px-2 border-r border-slate-800 w-16">Kondisi Aset</th>
                <th rowSpan={2} className="py-2 px-3 text-left">Keterangan (Lokasi dan ...)</th>
              </tr>
              <tr className="bg-slate-950/90 text-slate-400 text-[9px]">
                <th className="py-1 px-2 border-r border-slate-800 w-20">Jenis</th>
                <th className="py-1 px-2 border-r border-slate-800 w-24">Nomor</th>
                <th className="py-1 px-2 border-r border-slate-800 w-20">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-normal">
              {isAllDesaMode ? (
                // TAMPILAN SEMUA DESA (DIKELOMPOKKAN PER DESA)
                desas.map((d, dIdx) => {
                  const desaItems = asets.filter(
                    (a) => a.desaId === d.id && (selectedYearFilter === 'all' ? true : a.tahunPerolehan === Number(selectedYearFilter)) && a.status !== 'terhapus'
                  );
                  const desaSubtotal = desaItems.reduce((s, a) => s + (a.nilaiPerolehan || 0), 0);

                  return (
                    <React.Fragment key={d.id}>
                      {/* Subheader Banner Desa */}
                      <tr className="bg-blue-950/40 border-t border-b border-blue-800/60 font-bold">
                        <td colSpan={7} className="py-2.5 px-3 text-blue-300">
                          {dIdx + 1}. DESA {d.name.toUpperCase().replace(/^DESA\s+/i, '')} (Kode: {d.code}) • Kepala Desa: {d.kepalaDesa || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                          {formatRupiah(desaSubtotal)}
                        </td>
                        <td colSpan={2} className="py-2.5 px-3"></td>
                      </tr>

                      {desaItems.length === 0 ? (
                        <tr>
                          <td className="py-2 px-2 text-center text-slate-600 font-mono text-[11px] border-r border-slate-800">-</td>
                          <td colSpan={6} className="py-2 px-3 italic text-slate-500 border-r border-slate-800">
                            Belum ada aset tetap tercatat pada {selectedYearFilter === 'all' ? 'seluruh tahun anggaran' : `tahun anggaran ${selectedYearFilter}`}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-500 font-mono border-r border-slate-800">0</td>
                          <td className="py-2 px-2 text-center text-slate-500 border-r border-slate-800">-</td>
                          <td className="py-2 px-3 text-slate-500">-</td>
                        </tr>
                      ) : (
                        ROMAN_KLASIFIKASI.map((cat) => {
                          const catItems = desaItems.filter(
                            (a) => (a.klasifikasi || '').replace(/^[I|V|X]+\.\s*/, '') === cat.key
                          );
                          if (catItems.length === 0) return null;
                          const catSubtotal = catItems.reduce((s, a) => s + (a.nilaiPerolehan || 0), 0);

                          return (
                            <React.Fragment key={cat.roman}>
                              <tr className="bg-slate-900/50 font-bold">
                                <td className="py-1.5 px-2 text-center text-amber-400 font-mono text-[11px] border-r border-slate-800">
                                  {cat.roman}
                                </td>
                                <td colSpan={6} className="py-1.5 px-3 text-amber-300 font-semibold border-r border-slate-800">
                                  {cat.title}
                                </td>
                                <td className="py-1.5 px-3 text-right font-mono text-emerald-400 border-r border-slate-800">
                                  {formatNumber(catSubtotal)}
                                </td>
                                <td colSpan={2} className="py-1.5 px-3"></td>
                              </tr>
                              {catItems.map((item, idx) => (
                                <tr key={item.id} className="hover:bg-slate-800/40">
                                  <td className="py-2 px-2 text-center text-slate-400 font-mono text-[11px] border-r border-slate-800"></td>
                                  <td className="py-2 px-3 border-r border-slate-800">
                                    <div className="font-bold text-white leading-tight">
                                      {idx + 1}. {item.namaAset}
                                    </div>
                                    {item.volume && <div className="text-[10px] text-slate-400">Vol: {item.volume}</div>}
                                  </td>
                                  <td className="py-2 px-2 border-r border-slate-800 text-center text-[11px] text-slate-300">
                                    {item.bukti?.jenis || '-'}
                                  </td>
                                  <td className="py-2 px-2 border-r border-slate-800 text-center text-[10px] font-mono text-slate-400">
                                    {item.bukti?.nomor || '-'}
                                  </td>
                                  <td className="py-2 px-2 border-r border-slate-800 text-center text-[10px] text-slate-500">
                                    {item.bukti?.tanggal || '-'}
                                  </td>
                                  <td className="py-2 px-2.5 border-r border-slate-800 font-mono text-[11px] text-slate-300">
                                    {item.kodeAset}
                                  </td>
                                  <td className="py-2 px-2 border-r border-slate-800 text-center font-medium">
                                    {item.tahunPerolehan}
                                  </td>
                                  <td className="py-2 px-3 border-r border-slate-800 text-right font-mono font-bold text-emerald-400">
                                    {formatNumber(item.nilaiPerolehan)}
                                  </td>
                                  <td className="py-2 px-2 border-r border-slate-800 text-center">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        item.kondisi === 'Baik'
                                          ? 'text-emerald-300 bg-emerald-950/60'
                                          : item.kondisi === 'Rusak Ringan'
                                          ? 'text-amber-300 bg-amber-950/60'
                                          : 'text-red-300 bg-red-950/60'
                                      }`}
                                    >
                                      {item.kondisi}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-slate-400 text-[11px]">
                                    {item.keterangan || (item.lokasi ? `Lokasi: ${item.lokasi}` : '-')}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          );
                        })
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                // TAMPILAN SATU DESA (HANYA DATA YANG ADA TANPA DST)
                reportAsets.length === 0 ? (
                  <tr>
                    <td className="py-4 px-2 text-center text-slate-500 font-mono text-[11px] border-r border-slate-800">-</td>
                    <td colSpan={6} className="py-4 px-3 text-slate-400 italic text-center border-r border-slate-800">
                      Belum ada data aset tetap yang tercatat pada tahun anggaran ini
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-slate-500 border-r border-slate-800">0</td>
                    <td className="py-4 px-2 text-center text-slate-500 border-r border-slate-800">-</td>
                    <td className="py-4 px-3 text-slate-500">-</td>
                  </tr>
                ) : (
                  ROMAN_KLASIFIKASI.map((cat) => {
                    const catItems = reportAsets.filter(
                      (a) => (a.klasifikasi || '').replace(/^[I|V|X]+\.\s*/, '') === cat.key
                    );
                    if (catItems.length === 0) return null;
                    const catSubtotal = catItems.reduce((s, a) => s + (a.nilaiPerolehan || 0), 0);

                    return (
                      <React.Fragment key={cat.roman}>
                        {/* Baris Kategori Roman (I TANAH, II PERALATAN, dst) */}
                        <tr className="bg-slate-900/70 font-bold border-t border-slate-700">
                          <td className="py-2 px-2 text-center text-amber-400 font-mono text-[11px] border-r border-slate-800">
                            {cat.roman}
                          </td>
                          <td colSpan={6} className="py-2 px-3 text-amber-300 font-bold border-r border-slate-800">
                            {cat.title}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-400 border-r border-slate-800">
                            {catSubtotal > 0 ? formatNumber(catSubtotal) : '-'}
                          </td>
                          <td colSpan={2} className="py-2 px-3"></td>
                        </tr>

                        {/* Daftar Seluruh Aset di Kategori Ini Tanpa Teks dst */}
                        {catItems.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-800/40">
                            <td className="py-2 px-2 text-center text-slate-400 font-mono text-[11px] border-r border-slate-800"></td>
                            <td className="py-2 px-3 border-r border-slate-800">
                              <div className="font-bold text-white leading-tight">
                                {idx + 1}. {item.namaAset}
                              </div>
                              {item.volume && <div className="text-[10px] text-slate-400">Vol: {item.volume}</div>}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-800 text-center text-[11px] text-slate-300">
                              {item.bukti?.jenis || '-'}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-800 text-center text-[10px] font-mono text-slate-400">
                              {item.bukti?.nomor || '-'}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-800 text-center text-[10px] text-slate-500">
                              {item.bukti?.tanggal || '-'}
                            </td>
                            <td className="py-2 px-2.5 border-r border-slate-800 font-mono text-[11px] text-slate-300">
                              {item.kodeAset}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-800 text-center font-medium">
                              {item.tahunPerolehan}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-800 text-right font-mono font-bold text-emerald-400">
                              {formatNumber(item.nilaiPerolehan)}
                            </td>
                            <td className="py-2 px-2 border-r border-slate-800 text-center">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  item.kondisi === 'Baik'
                                    ? 'text-emerald-300 bg-emerald-950/60'
                                    : item.kondisi === 'Rusak Ringan'
                                    ? 'text-amber-300 bg-amber-950/60'
                                    : 'text-red-300 bg-red-950/60'
                                }`}
                              >
                                {item.kondisi}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-400 text-[11px]">
                              {item.keterangan || (item.lokasi ? `Lokasi: ${item.lokasi}` : '-')}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })
                )
              )}
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-700 text-xs">
              <tr>
                <td colSpan={7} className="py-3 px-3 text-right uppercase tracking-wider text-amber-400">
                  {isAllDesaMode
                    ? 'Total Nilai Perolehan Seluruh Desa se-Kecamatan Sirombu:'
                    : `Total Nilai Aset Tetap per 31 Desember ${selectedYear}:`}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-400 text-sm">
                  {formatNumber(totalValuation)}
                </td>
                <td colSpan={2} className="py-3 px-3" />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Tanda Tangan Resmi Pengesahan Permendagri 20/2018 (Diposisikan di Sebelah Kanan Sesuai Permintaan) */}
        <div className="pt-6 border-t border-slate-800 flex justify-end">
          <div className="text-center min-w-[280px] space-y-1">
            {isKecamatanOrSuper ? (
              // AKUN ADMIN / SUPER ADMIN: CAMAT SIROMBU DI SEBELAH KANAN
              <>
                <p className="text-slate-400 text-xs">
                  {tempatSurat}, {formatTanggalIndonesia(tanggalCetak)}
                </p>
                <p className="font-bold text-white uppercase text-xs">
                  CAMAT SIROMBU,
                </p>

                <div className="h-20 flex items-center justify-center">
                  <div className="p-2 border border-amber-500/30 bg-amber-950/20 rounded-xl text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    PENGESAHAN RESMI CAMAT
                  </div>
                </div>

                <p className="font-extrabold text-white uppercase underline underline-offset-2 text-xs tracking-wide">
                  {camatName}
                </p>
                <p className="text-[11px] text-slate-300">
                  {camatPangkat}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  NIP. {camatNip}
                </p>
              </>
            ) : (
              // AKUN DESA: KEPALA DESA DI SEBELAH KANAN
              <>
                <p className="text-slate-400 text-xs">
                  {(currentDesa?.name || '').replace(/^DESA\s+/i, '')}, {formatTanggalIndonesia(tanggalCetak)}
                </p>
                <p className="font-bold text-white uppercase text-xs">
                  Kepala Desa {(currentDesa?.name || '').replace(/^DESA\s+/i, '')}
                </p>

                <div className="h-20 flex items-center justify-center">
                  <div className="p-2 border border-emerald-500/30 bg-emerald-950/20 rounded-xl text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    PENANGGUNG JAWAB ASET DESA
                  </div>
                </div>

                <p className="font-extrabold text-white uppercase underline underline-offset-2 text-xs tracking-wide">
                  {currentDesa.kepalaDesa || 'Kepala Desa'}
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {currentDesa.nipKepalaDesa && currentDesa.nipKepalaDesa.trim() !== '' && currentDesa.nipKepalaDesa.trim() !== '-'
                    ? `NIP. ${currentDesa.nipKepalaDesa.trim()}`
                    : 'NIP. -'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={showPdfPreview}
        onClose={() => setShowPdfPreview(false)}
        desa={currentDesa}
        allDesas={desas}
        isAllDesaMode={isAllDesaMode}
        year={effectiveYearNumber}
        asets={reportAsets}
        isPrintedByAdmin={isKecamatanOrSuper}
        tanggalCetak={tanggalCetak}
        onTanggalCetakChange={setTanggalCetak}
        camatName={camatName}
        camatPangkat={camatPangkat}
        camatNip={camatNip}
        alamatKecamatan={alamatKecamatan}
        tempatSurat={tempatSurat}
        kodePosKecamatan={kodePosKecamatan}
      />
    </div>
  );
};
