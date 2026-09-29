import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Desa, Aset } from '../types';
import { useApp } from '../context/AppContext';
import {
  generatePermendagriPDF,
  formatTanggalIndonesia,
  formatRupiah,
  formatNumber,
  ROMAN_KLASIFIKASI,
} from '../utils/reportGenerator';
import { NiasBaratLogo } from './NiasBaratLogo';
import {
  X,
  Printer,
  Download,
  Calendar,
  FileText,
  CheckCircle2,
  Building,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  desa?: Desa;
  allDesas?: Desa[];
  isAllDesaMode?: boolean;
  year: number;
  asets: Aset[];
  isPrintedByAdmin: boolean;
  tanggalCetak: string;
  onTanggalCetakChange: (newDate: string) => void;
  camatName?: string;
  camatPangkat?: string;
  camatNip?: string;
  alamatKecamatan?: string;
  tempatSurat?: string;
  kodePosKecamatan?: string;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  desa,
  allDesas = [],
  isAllDesaMode = false,
  year,
  asets,
  isPrintedByAdmin,
  tanggalCetak,
  onTanggalCetakChange,
  camatName,
  camatPangkat,
  camatNip,
  alamatKecamatan,
  tempatSurat,
  kodePosKecamatan,
}) => {
  const { kecamatanProfile } = useApp();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExporting, setIsExporting] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const effectiveCamatName = camatName || kecamatanProfile.namaCamat;
  const effectiveCamatPangkat = camatPangkat || kecamatanProfile.pangkatCamat;
  const effectiveCamatNip = camatNip || kecamatanProfile.nipCamat;
  const effectiveAlamatKecamatan = alamatKecamatan || kecamatanProfile.alamatKantor;
  const effectiveTempatSurat = tempatSurat || kecamatanProfile.tempatSurat || 'Tetesua';
  const effectiveKodePosKecamatan = kodePosKecamatan || kecamatanProfile.kodePos;

  const isAllYears = !year || year === 0 || (year as any) === 'all';
  const matchYear = (a: Aset) => isAllYears ? true : a.tahunPerolehan === Number(year);

  // Calculate filtered assets and totals: When specific year, strictly match that year
  const relevantAsets = isAllDesaMode
    ? asets.filter((a) => matchYear(a) && a.status !== 'terhapus')
    : asets.filter((a) => a.desaId === desa?.id && matchYear(a) && a.status !== 'terhapus');

  const totalNilai = relevantAsets.reduce((sum, item) => sum + (item.nilaiPerolehan || 0), 0);

  // Trigger Native Print Dialog
  const handlePrint = () => {
    const printContent = document.getElementById('printable-laporan-permendagri');
    if (!printContent) return;

    // Use popup print window with clean styled document
    const printWindow = window.open('', '_blank', 'width=1150,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Laporan Aset Permendagri 20/2018 - ${isAllDesaMode ? 'Semua Desa Sirombu' : desa?.name || 'Desa'}</title>
            <style>
              @page {
                size: A4 landscape;
                margin: 8mm 10mm 10mm 10mm;
              }
              body {
                font-family: Arial, Helvetica, sans-serif;
                background-color: #ffffff;
                color: #000000;
                margin: 0;
                padding: 10px;
                font-size: 11px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
                font-size: 10px;
              }
              th, td {
                border: 1px solid #333333;
                padding: 4px 6px;
              }
              th {
                background-color: #f3f4f6;
                font-weight: bold;
                text-align: center;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .font-bold { font-weight: bold; }
              .italic { font-style: italic; }
              .double-line {
                border-top: 2px solid #000000;
                border-bottom: 1px solid #000000;
                height: 3px;
                margin: 8px 0 12px 0;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 400);
    } else {
      window.print();
    }
  };

  // Trigger PDF Generation and Download
  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const doc = await generatePermendagriPDF({
        desa,
        allDesas,
        isAllDesaMode,
        year,
        asets,
        isPrintedByAdmin,
        tanggalCetak,
        camatName: effectiveCamatName,
        camatPangkat: effectiveCamatPangkat,
        camatNip: effectiveCamatNip,
        alamatKecamatan: effectiveAlamatKecamatan,
        tempatSurat: effectiveTempatSurat,
        kodePosKecamatan: effectiveKodePosKecamatan,
      });

      const prefix = isAllDesaMode
        ? 'Laporan_Rekapitulasi_Aset_Semua_Desa_Sirombu'
        : `Laporan_Aset_${(desa?.name || 'Desa').replace(/\s+/g, '_')}`;

      doc.save(`${prefix}_Permendagri_20_2018_${year}.pdf`);
    } catch (err) {
      console.error('Download PDF error:', err);
      alert('Gagal mengunduh berkas PDF. Silakan coba kembali.');
    } finally {
      setIsExporting(false);
    }
  };

  const formattedTanggalCetak = formatTanggalIndonesia(tanggalCetak);
  const namaDesaDisplay = desa?.name.toUpperCase().startsWith('DESA ')
    ? desa.name.toUpperCase()
    : `DESA ${desa?.name.toUpperCase() || ''}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[94vh] flex flex-col bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-3.5 sm:px-6 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                  {isAllDesaMode
                    ? 'Pratinjau Laporan Aset Semua Desa (25 Desa)'
                    : `Pratinjau Cetakan Laporan Aset Tetap • ${desa?.name}`}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Permendagri 20/2018
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isAllDesaMode
                  ? `25 Desa Se-Kecamatan Sirombu • Total Nilai: ${formatRupiah(totalNilai)}`
                  : `${desa?.name} • ${isAllYears ? 'Seluruh Tahun Anggaran' : `TA ${year}`} • Total Nilai: ${formatRupiah(totalNilai)}`}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tanggal Cetak Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-amber-500/30 rounded-xl px-3 py-1 text-xs text-slate-300">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] text-slate-400 font-medium leading-none">Tanggal Cetak:</span>
                <input
                  type="date"
                  value={tanggalCetak}
                  onChange={(e) => onTanggalCetakChange(e.target.value)}
                  className="bg-transparent text-amber-300 font-bold text-xs focus:outline-none cursor-pointer pt-0.5"
                  title="Ubah Tanggal Cetak"
                />
              </div>
            </div>

            {/* Zoom Controls */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-1 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="Perkecil"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold w-10 text-center">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
                className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                title="Perbesar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              title="Cetak Dokumen Sekarang (Dialog Print Peramban)"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Cetak Dokumen</span>
            </button>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
              title="Unduh Berkas PDF Resmi"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Menyiapkan...' : 'Unduh PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status & Signature Info Bar */}
        <div className="px-4 sm:px-6 py-2 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Penandatangan Laporan:</span>
            {isPrintedByAdmin ? (
              <span className="font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                CAMAT SIROMBU (Sisi Kanan) • {camatName}
              </span>
            ) : (
              <span className="font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                KEPALA DESA (Sisi Kanan) • {desa?.kepalaDesa || 'Kepala Desa'}
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-300">
            Tempat & Tanggal Tertera: <strong className="text-amber-400">{isPrintedByAdmin ? 'Tetesua' : (desa?.name || '').replace(/^DESA\s+/i, '')}, {formattedTanggalCetak}</strong>
          </div>
        </div>

        {/* WYSIWYG Document Sheet Preview (Active Canvas) */}
        <div className="flex-1 w-full bg-slate-950/90 overflow-auto p-4 sm:p-6 flex justify-center items-start">
          <div
            ref={sheetRef}
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full max-w-5xl"
          >
            {/* Printable Document Paper */}
            <div
              id="printable-laporan-permendagri"
              className="bg-white text-black p-8 sm:p-10 shadow-2xl rounded-sm border border-slate-300 font-sans mx-auto min-w-[960px] select-text"
            >
              {/* KOP SURAT */}
              <div className="flex items-center gap-5 border-b-2 border-black pb-2">
                <div className="w-20 h-20 shrink-0 flex items-center justify-center">
                  <NiasBaratLogo className="w-20 h-20" />
                </div>
                <div className="flex-1 text-center -ml-16">
                  <h4 className="text-[15px] font-bold tracking-wide uppercase leading-tight">
                    PEMERINTAH KABUPATEN NIAS BARAT
                  </h4>
                  <h3 className="text-lg font-black tracking-wider uppercase leading-tight mt-0.5">
                    KECAMATAN SIROMBU
                  </h3>
                  {!isAllDesaMode && (
                    <h2 className="text-base font-extrabold uppercase tracking-wide leading-tight mt-0.5">
                      {namaDesaDisplay}
                    </h2>
                  )}
                  <p className="text-[10px] italic text-gray-800 mt-1">
                    {isAllDesaMode
                      ? `Alamat : ${effectiveAlamatKecamatan} KP. ${effectiveKodePosKecamatan}`
                      : `Alamat : ${desa?.alamatDesa || `${desa?.name ? desa.name.toLowerCase().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Desa Sirombu'} Kecamatan Sirombu Kabupaten Nias Barat`}      ${desa?.emailDesa ? `Email : ${desa.emailDesa}      ` : ''}KP. ${desa?.kodePos || '22863'}`}
                  </p>
                </div>
              </div>

              {/* Double Line Under Kop */}
              <div className="border-t border-black mt-0.5 mb-4" />

              {/* Title Header */}
              <div className="text-center my-3">
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wide">
                  {isAllDesaMode
                    ? `REKAPITULASI ASET TETAP DESA SE-KECAMATAN SIROMBU ${isAllYears ? 'SELURUH TAHUN ANGGARAN' : `PER 31 DESEMBER ${year}`}`
                    : `RINCIAN ASET TETAP DESA ${isAllYears ? 'SELURUH TAHUN ANGGARAN' : `PER 31 DESEMBER ${year}`}`}
                </h2>
                <p className="text-[9.5px] italic text-gray-700 mt-0.5">
                  (Format Standar Berdasarkan Lampiran Permendagri Nomor 20 Tahun 2018 tentang Pengelolaan Keuangan & Aset Desa)
                </p>
              </div>

              {/* 10-COLUMN OFFICIAL TABLE */}
              <table className="w-full border-collapse border border-black text-[10px] my-3">
                <thead>
                  <tr className="bg-gray-100 text-center font-bold">
                    <th rowSpan={2} className="border border-black px-1 py-1 w-8">No</th>
                    <th rowSpan={2} className="border border-black px-2 py-1 text-left w-64">
                      Klas Aset dan Nama/Identitas Aset Tetap
                    </th>
                    <th colSpan={3} className="border border-black px-1 py-1">
                      Bukti Kepemilikan
                    </th>
                    <th rowSpan={2} className="border border-black px-1 py-1 w-24">
                      Kode Aset Tetap
                    </th>
                    <th rowSpan={2} className="border border-black px-1 py-1 w-16">
                      Tahun Perolehan
                    </th>
                    <th rowSpan={2} className="border border-black px-1 py-1 w-28 text-right">
                      Nilai Perolehan (Rp)
                    </th>
                    <th rowSpan={2} className="border border-black px-1 py-1 w-16">
                      Kondisi Aset
                    </th>
                    <th rowSpan={2} className="border border-black px-2 py-1 text-left">
                      Keterangan (Lokasi dan ...)
                    </th>
                  </tr>
                  <tr className="bg-gray-100 text-center font-bold">
                    <th className="border border-black px-1 py-0.5 w-16">Jenis</th>
                    <th className="border border-black px-1 py-0.5 w-24">Nomor</th>
                    <th className="border border-black px-1 py-0.5 w-18">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {isAllDesaMode ? (
                    // MODE SEMUA DESA (DIKELOMPOKKAN SESUAI DESA)
                    allDesas.map((d, dIdx) => {
                      const desaItems = asets.filter(
                        (a) => a.desaId === d.id && matchYear(a) && a.status !== 'terhapus'
                      );
                      const desaSubtotal = desaItems.reduce((s, a) => s + (a.nilaiPerolehan || 0), 0);

                      return (
                        <React.Fragment key={d.id}>
                          {/* Banner Nama Desa */}
                          <tr className="bg-blue-50/80 font-bold border-t border-b border-black">
                            <td colSpan={7} className="border border-black px-2 py-1 text-left">
                              {dIdx + 1}. DESA {d.name.toUpperCase().replace(/^DESA\s+/i, '')} (Kode: {d.code}) - Kepala Desa: {d.kepalaDesa || '-'}
                            </td>
                            <td className="border border-black px-2 py-1 text-right">
                              {formatNumber(desaSubtotal)}
                            </td>
                            <td colSpan={2} className="border border-black px-2 py-1"></td>
                          </tr>

                          {/* Kategori Klasifikasi untuk Desa ini */}
                          {desaItems.length === 0 ? (
                            <tr>
                              <td className="border border-black text-center text-gray-400 py-1">-</td>
                              <td className="border border-black px-2 py-1 italic text-gray-400" colSpan={6}>
                                Belum ada aset tetap tercatat pada {isAllYears ? 'seluruh tahun anggaran' : `tahun anggaran ${year}`}
                              </td>
                              <td className="border border-black text-right text-gray-400 py-1">0</td>
                              <td className="border border-black text-center text-gray-400 py-1">-</td>
                              <td className="border border-black px-2 py-1 text-gray-400">-</td>
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
                                  <tr className="bg-gray-100 font-bold">
                                    <td className="border border-black text-center py-0.5">{cat.roman}</td>
                                    <td colSpan={6} className="border border-black px-2 py-0.5">{cat.title}</td>
                                    <td className="border border-black px-2 py-0.5 text-right">{formatNumber(catSubtotal)}</td>
                                    <td colSpan={2} className="border border-black"></td>
                                  </tr>
                                  {catItems.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                      <td className="border border-black text-center py-0.5"></td>
                                      <td className="border border-black px-2 py-0.5">
                                        {idx + 1}. {item.namaAset} {item.volume ? `(${item.volume})` : ''}
                                      </td>
                                      <td className="border border-black text-center py-0.5">{item.bukti?.jenis || '-'}</td>
                                      <td className="border border-black text-center py-0.5">{item.bukti?.nomor || '-'}</td>
                                      <td className="border border-black text-center py-0.5">{item.bukti?.tanggal || '-'}</td>
                                      <td className="border border-black text-center py-0.5">{item.kodeAset || '-'}</td>
                                      <td className="border border-black text-center py-0.5">{item.tahunPerolehan}</td>
                                      <td className="border border-black px-2 py-0.5 text-right">{formatNumber(item.nilaiPerolehan)}</td>
                                      <td className="border border-black text-center py-0.5">{item.kondisi}</td>
                                      <td className="border border-black px-2 py-0.5">
                                        {item.lokasi ? `${item.lokasi}. ` : ''}{item.keterangan || ''} [{item.sumberDana}]
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
                    // MODE DESA TUNGGAL (FORMAT RESMI 10 KOLOM - HANYA DATA YANG ADA TANPA DST)
                    relevantAsets.length === 0 ? (
                      <tr>
                        <td className="border border-black text-center py-2 text-gray-400 font-mono">-</td>
                        <td colSpan={6} className="border border-black px-2 py-2 italic text-gray-400">
                          Belum ada data aset tetap yang tercatat pada tahun anggaran ini
                        </td>
                        <td className="border border-black px-2 py-2 text-right font-bold text-gray-400">0</td>
                        <td className="border border-black text-center py-2 text-gray-400">-</td>
                        <td className="border border-black px-2 py-2 text-gray-400">-</td>
                      </tr>
                    ) : (
                      ROMAN_KLASIFIKASI.map((cat) => {
                        const catItems = relevantAsets.filter(
                          (a) => (a.klasifikasi || '').replace(/^[I|V|X]+\.\s*/, '') === cat.key
                        );
                        if (catItems.length === 0) return null;
                        const catSubtotal = catItems.reduce((s, a) => s + (a.nilaiPerolehan || 0), 0);

                        return (
                          <React.Fragment key={cat.roman}>
                            {/* Row Kategori Roman (I TANAH, II PERALATAN, dst) */}
                            <tr className="bg-gray-100 font-bold border-t border-black">
                              <td className="border border-black text-center py-1">{cat.roman}</td>
                              <td colSpan={6} className="border border-black px-2 py-1">{cat.title}</td>
                              <td className="border border-black px-2 py-1 text-right">
                                {formatNumber(catSubtotal)}
                              </td>
                              <td colSpan={2} className="border border-black"></td>
                            </tr>

                            {/* Daftar Aset Sesuai Kategori Secara Lengkap Tanpa Tulisan dst */}
                            {catItems.map((item, idx) => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                <td className="border border-black text-center py-0.5"></td>
                                <td className="border border-black px-2 py-0.5">
                                  {idx + 1}. {item.namaAset} {item.volume ? `(${item.volume})` : ''}
                                </td>
                                <td className="border border-black text-center py-0.5">{item.bukti?.jenis || '-'}</td>
                                <td className="border border-black text-center py-0.5">{item.bukti?.nomor || '-'}</td>
                                <td className="border border-black text-center py-0.5">{item.bukti?.tanggal || '-'}</td>
                                <td className="border border-black text-center py-0.5">{item.kodeAset || '-'}</td>
                                <td className="border border-black text-center py-0.5">{item.tahunPerolehan}</td>
                                <td className="border border-black px-2 py-0.5 text-right">{formatNumber(item.nilaiPerolehan)}</td>
                                <td className="border border-black text-center py-0.5">{item.kondisi}</td>
                                <td className="border border-black px-2 py-0.5">
                                  {item.lokasi ? `${item.lokasi}. ` : ''}{item.keterangan || ''} [{item.sumberDana}]
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })
                    )
                  )}

                  {/* Grand Total Row */}
                  <tr className="bg-slate-200 font-bold border-t-2 border-b-2 border-black">
                    <td colSpan={7} className="border border-black px-3 py-1.5 text-left uppercase">
                      {isAllDesaMode
                        ? `TOTAL KESELURUHAN ASET DESA SE-KECAMATAN SIROMBU (25 DESA) ${isAllYears ? 'SELURUH TAHUN ANGGARAN' : `PER 31 DESEMBER ${year}`}`
                        : `Total Nilai Aset Tetap ${isAllYears ? 'Seluruh Tahun Anggaran' : `per 31 Desember ${year}`}`}
                    </td>
                    <td className="border border-black px-2 py-1.5 text-right font-black">
                      {formatNumber(totalNilai)}
                    </td>
                    <td colSpan={2} className="border border-black"></td>
                  </tr>
                </tbody>
              </table>

              {/* Footnote */}
              <div className="flex items-center justify-between text-[9px] text-gray-600 mt-1 italic">
                <span>*) Sesuai Lampiran Permendagri No. 20 Tahun 2018 tentang Pengelolaan Keuangan & Aset Desa</span>
                <span>Pemerintah Kabupaten Nias Barat</span>
              </div>

              {/* SIGNATURE SECTION (SISI KANAN) */}
              <div className="mt-8 flex justify-end">
                <div className="text-center min-w-[260px]">
                  {isPrintedByAdmin ? (
                    // ADMIN / SUPER ADMIN: DITANDATANGANI CAMAT SIROMBU
                    <>
                      <p className="text-[11px] text-black">
                        {effectiveTempatSurat}, {formattedTanggalCetak}
                      </p>
                      <p className="text-[11px] font-bold text-black uppercase mt-0.5">
                        CAMAT SIROMBU,
                      </p>

                      <div className="h-16 flex items-center justify-center">
                        <span className="text-[9px] italic text-gray-400 select-none">
                          [ Tanda Tangan & Cap Dinas Camat ]
                        </span>
                      </div>

                      <p className="text-[11px] font-bold text-black underline tracking-wide uppercase">
                        {effectiveCamatName}
                      </p>
                      <p className="text-[10px] text-black mt-0.5">
                        {effectiveCamatPangkat}
                      </p>
                      <p className="text-[10px] text-black font-mono">
                        NIP. {effectiveCamatNip}
                      </p>
                    </>
                  ) : (
                    // AKUN DESA: DITANDATANGANI KEPALA DESA
                    <>
                      <p className="text-[11px] text-black">
                        {(desa?.name || '').replace(/^DESA\s+/i, '')}, {formattedTanggalCetak}
                      </p>
                      <p className="text-[11px] font-bold text-black uppercase mt-0.5">
                        Kepala Desa {(desa?.name || '').replace(/^DESA\s+/i, '')}
                      </p>

                      <div className="h-16 flex items-center justify-center">
                        <span className="text-[9px] italic text-gray-400 select-none">
                          [ Tanda Tangan & Cap Desa ]
                        </span>
                      </div>

                      <p className="text-[11px] font-bold text-black underline tracking-wide uppercase">
                        {desa?.kepalaDesa || '...........................................'}
                      </p>
                      <p className="text-[10px] text-black mt-0.5 font-mono">
                        {desa?.nipKepalaDesa && desa.nipKepalaDesa.trim() !== '' && desa.nipKepalaDesa.trim() !== '-'
                          ? `NIP. ${desa.nipKepalaDesa.trim()}`
                          : 'NIP. -'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">
              Pratinjau Aktif (WYSIWYG)
            </span>
            <span className="text-slate-500">•</span>
            <span>Kertas A4 Landscape • Sesuai format Permendagri No. 20 Tahun 2018</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              Penandatangan: <strong className="text-slate-200">{isPrintedByAdmin ? 'CAMAT SIROMBU' : 'KEPALA DESA'}</strong>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
