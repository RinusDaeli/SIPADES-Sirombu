import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { Aset } from '../types';
import { NiasBaratLogo } from './NiasBaratLogo';
import { X, Printer, Download, Copy, Check, QrCode as QrIcon } from 'lucide-react';

interface BarcodeModalProps {
  aset: Aset | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ aset, isOpen, onClose }) => {
  const barcodeSvgRef = useRef<SVGSVGElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [labelQuantity, setLabelQuantity] = useState<number>(1);
  const [formatSize, setFormatSize] = useState<'standard' | 'compact'>('standard');

  useEffect(() => {
    if (!isOpen || !aset) return;

    // Generate 1D Barcode
    const cleanKode = (aset.kodeAset || 'ASET-001').replace(/[^a-zA-Z0-9.-]/g, '');
    if (barcodeSvgRef.current) {
      try {
        JsBarcode(barcodeSvgRef.current, cleanKode, {
          format: 'CODE128',
          width: formatSize === 'standard' ? 1.6 : 1.3,
          height: formatSize === 'standard' ? 36 : 28,
          displayValue: true,
          font: 'monospace',
          fontSize: 10,
          textMargin: 2,
          margin: 4,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (err) {
        console.error('Error generating barcode:', err);
      }
    }

    // Generate 2D QR Code
    if (qrCanvasRef.current) {
      const qrData = JSON.stringify({
        id: aset.id,
        kode: aset.kodeAset,
        nama: aset.namaAset,
        desa: aset.desaName,
        tahun: aset.tahunPerolehan,
        dana: aset.sumberDana,
        kondisi: aset.kondisi,
      });

      QRCode.toCanvas(
        qrCanvasRef.current,
        qrData,
        {
          width: formatSize === 'standard' ? 84 : 70,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR:', error);
        }
      );
    }
  }, [isOpen, aset, formatSize]);

  if (!isOpen || !aset) return null;

  const handleCopyKode = () => {
    navigator.clipboard.writeText(aset.kodeAset);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85, 54], // Standard ID-1 / asset sticker size (85mm x 54mm)
    });

    doc.setFont('helvetica');

    // Outer border
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.4);
    doc.roundedRect(2, 2, 81, 50, 2, 2, 'S');

    // Header bar
    doc.setFillColor(21, 52, 34); // #153422
    doc.roundedRect(2.2, 2.2, 80.6, 11, 1.5, 1.5, 'F');

    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('PEMERINTAH KABUPATEN NIAS BARAT', 42.5, 5, { align: 'center' });
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('KECAMATAN SIROMBU', 42.5, 8, { align: 'center' });
    doc.setFontSize(5.5);
    doc.setTextColor(253, 224, 71); // #fde047
    doc.text(aset.desaName, 42.5, 11.2, { align: 'center' });

    // Asset Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const splitTitle = doc.splitTextToSize(aset.namaAset, 50);
    doc.text(splitTitle, 4, 16.5);

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Kode Aset : ${aset.kodeAset}`, 4, 22.5);
    doc.text(`Klasifikasi: ${aset.klasifikasi}`, 4, 25.5);
    doc.text(`Tahun/Dana: ${aset.tahunPerolehan} / ${aset.sumberDana}`, 4, 28.5);
    doc.text(`Kondisi   : ${aset.kondisi} ${aset.volume ? `| Vol: ${aset.volume}` : ''}`, 4, 31.5);

    // QR Code on right side
    if (qrCanvasRef.current) {
      try {
        const qrDataUrl = qrCanvasRef.current.toDataURL('image/png');
        doc.addImage(qrDataUrl, 'PNG', 58, 12, 22, 22);
      } catch (e) {
        console.error(e);
      }
    }

    // Barcode on bottom
    if (barcodeSvgRef.current) {
      try {
        const xml = new XMLSerializer().serializeToString(barcodeSvgRef.current);
        const svg64 = btoa(unescape(encodeURIComponent(xml)));
        const image64 = 'data:image/svg+xml;base64,' + svg64;

        const img = new Image();
        img.src = image64;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 120;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const pngBarcode = canvas.toDataURL('image/png');
            doc.addImage(pngBarcode, 'PNG', 12, 33, 58, 15);
            doc.save(`Barcode-Aset-${aset.kodeAset}.pdf`);
          }
        };
        return;
      } catch (e) {
        console.error(e);
      }
    }

    doc.save(`Barcode-Aset-${aset.kodeAset}.pdf`);
  };

  return (
    <>
      {/* CSS @media print styles to only print the barcode label sticker */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-barcode-area, #printable-barcode-area * {
            visibility: visible;
          }
          #printable-barcode-area {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 10mm;
            background: white !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#0E1526] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2.5 mb-5">
            <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <QrIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-white">
                Cetak Barcode & Label Aset Desa
              </h3>
              <p className="text-xs text-slate-400">
                Label fisik inventaris aset untuk dipasang pada barang/fasilitas milik desa
              </p>
            </div>
          </div>

          {/* Options Toolbar */}
          <div className="flex items-center justify-between gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800 mb-5 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Ukuran Label:</span>
              <button
                type="button"
                onClick={() => setFormatSize('standard')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  formatSize === 'standard'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Standar (85×54 mm)
              </button>
              <button
                type="button"
                onClick={() => setFormatSize('compact')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  formatSize === 'compact'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                Kecil (70×40 mm)
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Jumlah:</span>
              <select
                value={labelQuantity}
                onChange={(e) => setLabelQuantity(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-white"
              >
                <option value={1}>1 Stiker</option>
                <option value={2}>2 Stiker</option>
                <option value={4}>4 Stiker</option>
                <option value={6}>6 Stiker</option>
              </select>
            </div>
          </div>

          {/* Printable Label Preview Area */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-xl border border-slate-800/80 mb-6">
            <div
              id="printable-barcode-area"
              className="bg-white text-slate-950 rounded-lg shadow-xl p-3 border-2 border-slate-900 select-none"
              style={{
                width: formatSize === 'standard' ? '340px' : '300px',
                minHeight: formatSize === 'standard' ? '210px' : '180px',
              }}
            >
              {/* Label Header */}
              <div className="bg-[#153422] text-white p-2 rounded flex items-center justify-between gap-2 border-b border-emerald-900">
                <div className="shrink-0 bg-white p-0.5 rounded">
                  <NiasBaratLogo size={26} />
                </div>
                <div className="text-center flex-1">
                  <div className="text-[9px] font-extrabold uppercase tracking-wide leading-tight">
                    PEMERINTAH KABUPATEN NIAS BARAT
                  </div>
                  <div className="text-[8px] font-bold uppercase tracking-wider text-emerald-100 leading-tight mt-0.5">
                    KECAMATAN SIROMBU
                  </div>
                  <div className="text-[8.5px] font-black uppercase tracking-wider text-amber-300 leading-tight">
                    {aset.desaName}
                  </div>
                </div>
              </div>

              {/* Body Content */}
              <div className="pt-2 pb-1 flex items-start gap-2">
                <div className="flex-1 space-y-1 text-left">
                  <div className="text-[11px] font-extrabold text-slate-900 leading-snug line-clamp-2">
                    {aset.namaAset}
                  </div>
                  <div className="text-[9px] text-slate-700 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-200 inline-block">
                    KODE: {aset.kodeAset}
                  </div>
                  <div className="text-[8px] text-slate-600 space-y-0.5 pt-0.5">
                    <div>
                      <span className="font-semibold">Klasifikasi:</span> {aset.klasifikasi}
                    </div>
                    <div>
                      <span className="font-semibold">Perolehan:</span> Tahun {aset.tahunPerolehan} • {aset.sumberDana}
                    </div>
                    {aset.volume && (
                      <div>
                        <span className="font-semibold">Volume:</span> {aset.volume}
                      </div>
                    )}
                    {aset.lokasi && (
                      <div className="truncate max-w-[190px]">
                        <span className="font-semibold">Lokasi:</span> {aset.lokasi}
                      </div>
                    )}
                  </div>
                </div>

                {/* QR Code Canvas */}
                <div className="shrink-0 flex flex-col items-center bg-slate-50 p-1 rounded border border-slate-200">
                  <canvas ref={qrCanvasRef} className="rounded" />
                  <span className="text-[7px] text-slate-500 font-semibold mt-0.5">
                    VERIFIKASI
                  </span>
                </div>
              </div>

              {/* 1D Barcode Container */}
              <div className="border-t border-slate-200 pt-1.5 flex flex-col items-center justify-center">
                <svg ref={barcodeSvgRef} className="w-full max-h-[48px] overflow-visible" />
                <div className="text-[7px] text-slate-500 uppercase tracking-widest -mt-1 font-semibold">
                  BARANG MILIK DESA • SIPADES KECAMATAN SIROMBU
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 text-center">
              Pratinjau label stiker barcode 1D (Code128) & QR Code 2D untuk identifikasi fisik aset.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCopyKode}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin Kode Aset'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Unduh PDF Label</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Label (Print)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
