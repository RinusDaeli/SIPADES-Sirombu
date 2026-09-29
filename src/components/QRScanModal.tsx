import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/reportGenerator';
import {
  QrCode,
  Camera,
  X,
  Search,
  CheckCircle2,
  Building,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface QRScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScanModal: React.FC<QRScanModalProps> = ({ isOpen, onClose }) => {
  const { asets, setSelectedDesaFilter, setActiveTab } = useApp();
  const [scannedCode, setScannedCode] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const foundAsset = asets.find(
    (a) =>
      a.kodeAset.toLowerCase() === scannedCode.trim().toLowerCase() ||
      a.id === selectedAssetId
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0E1526] border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Pindai QR / Kode Label Aset Desa
            </h3>
            <p className="text-xs text-slate-400">
              Kecamatan Sirombu, Kabupaten Nias Barat
            </p>
          </div>
        </div>

        {/* Camera simulation viewport */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex flex-col items-center justify-center p-4 text-center">
          <div className="w-36 h-36 border-2 border-emerald-400/80 rounded-2xl relative flex items-center justify-center animate-pulse">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl" />
            <Camera className="w-8 h-8 text-emerald-400/80" />
            {/* Scanline beam */}
            <div className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] top-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            Arahkan kamera ke QR Code fisik aset desa atau masukkan kode di bawah
          </p>
        </div>

        {/* Input Manual Code */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Input Kode Aset Manual atau Pilih Contoh:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Contoh: AST-2024-001"
                value={scannedCode}
                onChange={(e) => {
                  setScannedCode(e.target.value);
                  setSelectedAssetId(null);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              onChange={(e) => {
                setSelectedAssetId(e.target.value);
                setScannedCode('');
              }}
              value={selectedAssetId || ''}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none max-w-[150px] truncate"
            >
              <option value="">-- Contoh Aset --</option>
              {asets.slice(0, 8).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.kodeAset} - {a.namaAset}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scanned Result Card */}
        {foundAsset ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Aset Ditemukan
              </span>
              <span className="font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/30">
                {foundAsset.kodeAset}
              </span>
            </div>

            <div className="text-sm font-extrabold text-white">
              {foundAsset.namaAset}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
              <div>
                <span className="text-slate-500 block">Desa Pemilik:</span>
                <span className="font-semibold text-white">{foundAsset.desaName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nilai Perolehan:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {formatRupiah(foundAsset.nilaiPerolehan)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Tahun / Kondisi:</span>
                <span>{foundAsset.tahunPerolehan} • {foundAsset.kondisi}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sumber Dana:</span>
                <span className="font-semibold">{foundAsset.sumberDana}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedDesaFilter(foundAsset.desaId);
                setActiveTab('aset');
                onClose();
              }}
              className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Buka di Modul Data Aset</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : scannedCode ? (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 text-center">
            Kode aset <strong>{scannedCode}</strong> tidak ditemukan pada database Kecamatan Sirombu.
          </div>
        ) : null}
      </div>
    </div>
  );
};
