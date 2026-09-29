import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/reportGenerator';
import { ThreeDColumnChart, ColumnChartItem } from './ThreeDColumnChart';
import { ThreeDPieChart, PieChartItem } from './ThreeDPieChart';
import {
  Boxes,
  Layers,
  Coins,
  Building,
  Filter,
  ArrowRight,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { asets, desas, selectedDesaFilter, setSelectedDesaFilter, currentUser, setActiveTab } = useApp();

  // Active village filter
  const isDesaUser = currentUser?.role === 'admin_desa';
  const effectiveDesaId = isDesaUser ? currentUser.desaId || 'desa-21' : selectedDesaFilter;

  const currentDesa = desas.find((d) => d.id === effectiveDesaId);

  // Filtered assets based on village
  const activeAsets = useMemo(() => {
    return asets.filter((a) => {
      if (a.status === 'terhapus') return false;
      if (effectiveDesaId !== 'all') {
        return a.desaId === effectiveDesaId;
      }
      return true;
    });
  }, [asets, effectiveDesaId]);

  // Calculate metrics
  const distinctCategories = new Set(activeAsets.map((a) => a.klasifikasi)).size;
  const totalUnit = activeAsets.length;
  const totalNilai = activeAsets.reduce((sum, item) => sum + (item.nilaiPerolehan || 0), 0);

  // 1. Data Total Aset Per Desa (Untuk Admin / Super Admin)
  const totalAsetPerDesaData: ColumnChartItem[] = useMemo(() => {
    return (desas || []).map((d) => {
      const desaAsets = asets.filter((a) => a.desaId === d.id && a.status !== 'terhapus');
      const valSum = desaAsets.reduce((sum, a) => sum + (a.nilaiPerolehan || 0), 0);
      const rawName = d?.name || 'Desa';
      return {
        id: d.id,
        label: rawName.replace(/^DESA\s+/i, ''),
        subLabel: rawName,
        value: desaAsets.length,
        secondaryValue: valSum,
        badge: `${desaAsets.length} Unit`,
      };
    });
  }, [desas, asets]);

  // 2. Data Aset Per Kategori (Untuk Pie Chart Admin & Column Chart Desa)
  const asetPerKategoriData: ColumnChartItem[] = useMemo(() => {
    const map: Record<string, { count: number; totalNilai: number }> = {};
    activeAsets.forEach((a) => {
      const cat = (a.klasifikasi || 'Lainnya').replace(/^[I|V|X]+\.\s*/, '');
      if (!map[cat]) {
        map[cat] = { count: 0, totalNilai: 0 };
      }
      map[cat].count += 1;
      map[cat].totalNilai += a.nilaiPerolehan || 0;
    });

    return Object.entries(map).map(([kategori, val], idx) => ({
      id: `cat-${idx}`,
      label: kategori,
      value: val.count,
      secondaryValue: val.totalNilai,
      badge: `${val.count} Unit`,
    }));
  }, [activeAsets]);

  // Data Pie Chart Kategori
  const pieKategoriData: PieChartItem[] = useMemo(() => {
    return asetPerKategoriData.map((d) => ({
      id: d.id,
      label: d.label,
      value: d.value,
      secondaryValue: d.secondaryValue,
    }));
  }, [asetPerKategoriData]);

  // 3. Data Kondisi Barang (Untuk Pie Chart Desa & Admin)
  const countBaik = useMemo(() => activeAsets.filter((a) => a.kondisi === 'Baik').length, [activeAsets]);
  const countRingan = useMemo(() => activeAsets.filter((a) => a.kondisi === 'Rusak Ringan').length, [activeAsets]);
  const countBerat = useMemo(() => activeAsets.filter((a) => a.kondisi === 'Rusak Berat').length, [activeAsets]);

  const pieKondisiData: PieChartItem[] = useMemo(() => {
    const baik = activeAsets.filter((a) => a.kondisi === 'Baik');
    const ringan = activeAsets.filter((a) => a.kondisi === 'Rusak Ringan');
    const berat = activeAsets.filter((a) => a.kondisi === 'Rusak Berat');

    return [
      {
        id: 'kondisi-baik',
        label: 'Baik',
        value: baik.length,
        secondaryValue: baik.reduce((s, a) => s + (a.nilaiPerolehan || 0), 0),
        color: '#059669',
        description: 'Siap pakai dan terpelihara',
      },
      {
        id: 'kondisi-ringan',
        label: 'Rusak Ringan',
        value: ringan.length,
        secondaryValue: ringan.reduce((s, a) => s + (a.nilaiPerolehan || 0), 0),
        color: '#d97706',
        description: 'Perlu servis & pemeliharaan ringan',
      },
      {
        id: 'kondisi-berat',
        label: 'Rusak Berat',
        value: berat.length,
        secondaryValue: berat.reduce((s, a) => s + (a.nilaiPerolehan || 0), 0),
        color: '#e11d48',
        description: 'Dapat diajukan mutasi/penghapusan',
      },
    ].filter((k) => k.value > 0 || totalUnit === 0);
  }, [activeAsets, totalUnit]);

  const keteranganKondisi = `Baik ${countBaik} Unit, Rusak Ringan ${countRingan} Unit, Rusak Berat ${countBerat} Unit`;

  return (
    <div className="space-y-6">
      {/* Top Header Section as in screenshot */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1">
            DASHBOARD INVENTARIS
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {effectiveDesaId === 'all'
              ? 'Kecamatan Sirombu'
              : currentDesa?.name || 'Kecamatan Sirombu'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Halo {currentUser?.name || 'Administrator'}
          </p>
        </div>

        {/* Filter Wilayah (Desa Selector for Kecamatan / Super Admin) */}
        {!isDesaUser && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500 font-medium">Filter Wilayah:</span>
            <select
              value={selectedDesaFilter}
              onChange={(e) => setSelectedDesaFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Desa (25 Desa)</option>
              {desas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Jenis Aset */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-emerald-700">
              <Boxes className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            JENIS ASET
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {distinctCategories}
          </div>
        </div>

        {/* Card 2: Total Unit */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-emerald-700">
              <Layers className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            TOTAL UNIT
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {totalUnit}
          </div>
        </div>

        {/* Card 3: Nilai Perolehan */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-emerald-700">
              <Coins className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            NILAI PEROLEHAN
          </div>
          <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight truncate">
            {formatRupiah(totalNilai)}
          </div>
        </div>

        {/* Card 4: Wilayah */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="text-emerald-700">
              <Building className="w-6 h-6 stroke-[1.75]" />
            </div>
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            WILAYAH
          </div>
          <div className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight truncate">
            {effectiveDesaId === 'all'
              ? 'Kec. Sirombu'
              : (currentDesa?.name || '').replace('DESA ', '') || 'Kec. Sirombu'}
          </div>
        </div>
      </div>

      {/* DASHBOARD CHARTS SECTION */}
      {!isDesaUser ? (
        /* ================= ADMIN / SUPER ADMIN VIEW ================= */
        /* Kiri: Total Aset semua desa menurut Kategori/klasifikasi aset (Grafik 3-D Column) */
        /* Kanan: Rekap Total Aset Sesuai Kondisi (Grafik 3-D Pie) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sisi Kiri: Total Aset semua desa menurut Kategori/klasifikasi aset dalam Grafik 3-D Column */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Total Aset Menurut Kategori</span>
                </h2>
              </div>

              <ThreeDColumnChart
                data={asetPerKategoriData}
                isDesaComparison={false}
                valueLabel="Total Unit Aset"
                secondaryValueLabel="Total Nilai Aset"
                height={340}
              />
            </div>
          </div>

          {/* Sisi Kanan: Rekap Total Aset Sesuai Kondisi dalam Grafik 3-D Pie */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Rekap Total Aset Sesuai Kondisi
                </h2>
              </div>

              <ThreeDPieChart
                data={pieKondisiData}
                unitLabel="Unit"
                emptyMessage="Belum ada data kondisi aset"
                footerNote={
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-bold">Keterangan:</span>
                    <div className="flex flex-wrap items-center gap-3 font-semibold">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Baik {countBaik} Unit
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-amber-700">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Rusak Ringan {countRingan} Unit
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-rose-700">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Rusak Berat {countBerat} Unit
                      </span>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      ) : (
        /* ================= DESA VIEW ================= */
        /* Kiri: Aset Per Kategori (Grafik 3-D Column) */
        /* Kanan: Kondisi Barang (Grafik 3-D Pie) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sisi Kiri: Aset Per Kategori dalam Grafik 3-D Column */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Aset Per Kategori</span>
                  <span className="text-xs font-normal text-emerald-700 font-bold">
                    • {currentDesa?.name || 'Desa'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grafik 3-D Column rincian aset berdasarkan jenis klasifikasi barang desa.
                </p>
              </div>

              <ThreeDColumnChart
                data={asetPerKategoriData}
                isDesaComparison={false}
                valueLabel="Jumlah Unit"
                secondaryValueLabel="Nilai Perolehan"
                height={340}
                emptyMessage="Belum ada data aset untuk desa ini"
              />
            </div>
          </div>

          {/* Sisi Kanan: Kondisi Barang dalam Grafik 3-D Pie */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Kondisi Barang
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Grafik 3-D Pie persentase kondisi fisik aset desa (Baik, Rusak Ringan, Rusak Berat).
                </p>
              </div>

              <ThreeDPieChart
                data={pieKondisiData}
                unitLabel="Unit"
                emptyMessage="Belum ada data kondisi aset"
                footerNote={
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 font-bold">Keterangan:</span>
                    <div className="flex flex-wrap items-center gap-3 font-semibold">
                      <span className="inline-flex items-center gap-1.5 text-emerald-700">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Baik {countBaik} Unit
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-amber-700">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Rusak Ringan {countRingan} Unit
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-rose-700">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Rusak Berat {countBerat} Unit
                      </span>
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
