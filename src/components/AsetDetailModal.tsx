import React, { useState } from 'react';
import { Aset } from '../types';
import {
  X,
  Camera,
  FileText,
  Calendar,
  DollarSign,
  Tag,
  MapPin,
  FileCheck2,
  QrCode,
  Maximize2,
  AlertCircle
} from 'lucide-react';

interface AsetDetailModalProps {
  aset: Aset | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenBarcode: (aset: Aset) => void;
}

export const AsetDetailModal: React.FC<AsetDetailModalProps> = ({
  aset,
  isOpen,
  onClose,
  onOpenBarcode,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  if (!isOpen || !aset) return null;

  const photos = aset.fotoAset && aset.fotoAset.length > 0 ? aset.fotoAset : [];
  const activePhoto = photos[selectedPhotoIndex] || photos[0];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <>
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full bg-slate-800/80"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-white text-sm font-semibold mb-3 bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
            {lightboxImage.title} (Klik di mana saja untuk menutup)
          </div>
          <img
            src={lightboxImage.url}
            alt={lightboxImage.title}
            className="max-w-[92vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        </div>
      )}

      {/* Main Detail Modal */}
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#0E1526] border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-slate-100">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3 mb-6 pr-8">
            <span className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <Camera className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {aset.klasifikasi}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {aset.desaName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  KODE: {aset.kodeAset}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white leading-snug">
                {aset.namaAset}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Photos Gallery & BAST (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Foto Fisik Aset */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Foto Fisik Aset ({photos.length} Foto)
                    </h3>
                  </div>
                  {photos.length > 0 && (
                    <span className="text-[11px] text-slate-400">
                      Foto {selectedPhotoIndex + 1} dari {photos.length}
                    </span>
                  )}
                </div>

                {photos.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-slate-500">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">Belum ada foto fisik aset diunggah</p>
                  </div>
                ) : (
                  <div>
                    {/* Big Active Photo */}
                    <div className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center aspect-video max-h-[300px]">
                      <img
                        src={activePhoto}
                        alt={`Foto Aset ${selectedPhotoIndex + 1}`}
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            url: activePhoto,
                            title: `Foto Fisik ${selectedPhotoIndex + 1} - ${aset.namaAset}`,
                          })
                        }
                        className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Perbesar</span>
                      </button>
                    </div>

                    {/* Thumbnails */}
                    {photos.length > 1 && (
                      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                        {photos.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedPhotoIndex(idx)}
                            className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              selectedPhotoIndex === idx
                                ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/20'
                                : 'border-slate-800 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={p}
                              alt={`Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Foto BAST Aset kepada Pengguna */}
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Foto BAST Aset Kepada Pengguna (Berita Acara Serah Terima)
                  </h3>
                </div>

                {aset.fotoBast ? (
                  <div className="relative group rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center aspect-video max-h-[200px]">
                    <img
                      src={aset.fotoBast}
                      alt="Foto BAST Aset kepada Pengguna"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setLightboxImage({
                          url: aset.fotoBast!,
                          title: `Dokumen BAST Aset Kepada Pengguna - ${aset.namaAset}`,
                        })
                      }
                      className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/70 hover:bg-black/90 text-white text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Perbesar Dokumen</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-slate-500">
                    <FileText className="w-6 h-6 mb-1 opacity-50" />
                    <p className="text-xs">Foto BAST Aset kepada Pengguna belum diunggah</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Asset Details & Quick Actions (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3.5 text-xs">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Informasi Lengkap Aset Tetap
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-500" /> Klasifikasi
                    </span>
                    <span className="font-semibold text-white text-right max-w-[180px]">
                      {aset.klasifikasi}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Nilai Perolehan
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {formatRupiah(aset.nilaiPerolehan)}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Tahun Perolehan
                    </span>
                    <span className="font-semibold text-white">
                      {aset.tahunPerolehan} ({aset.sumberDana})
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-slate-400">Kondisi Fisik</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        aset.kondisi === 'Baik'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : aset.kondisi === 'Rusak Ringan'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-red-950 text-red-300 border border-red-500/40'
                      }`}
                    >
                      {aset.kondisi}
                    </span>
                  </div>

                  {aset.volume && (
                    <div className="flex items-start justify-between">
                      <span className="text-slate-400">Volume / Luas</span>
                      <span className="font-medium text-slate-200">{aset.volume}</span>
                    </div>
                  )}

                  {aset.lokasi && (
                    <div className="flex items-start justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> Lokasi
                      </span>
                      <span className="font-medium text-slate-200 text-right max-w-[180px]">
                        {aset.lokasi}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-slate-400 font-medium mb-1">Bukti Kepemilikan:</div>
                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-0.5">
                      <div className="font-bold text-amber-300">{aset.bukti.jenis}</div>
                      <div className="text-slate-300">Nomor: {aset.bukti.nomor || '-'}</div>
                      <div className="text-slate-400">Tanggal: {aset.bukti.tanggal || '-'}</div>
                    </div>
                  </div>

                  {aset.keterangan && (
                    <div className="pt-2 border-t border-slate-800">
                      <div className="text-slate-400 font-medium mb-1">Keterangan:</div>
                      <p className="text-slate-300 text-[11px] italic bg-slate-950/50 p-2 rounded border border-slate-800">
                        "{aset.keterangan}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Print Barcode Action Button */}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <button
                    type="button"
                    onClick={() => onOpenBarcode(aset)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Cetak Barcode / Label Aset</span>
                  </button>

                  <p className="text-[10px] text-slate-400 text-center">
                    Cetak barcode Code128 & QR code untuk inventaris barang milik desa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
