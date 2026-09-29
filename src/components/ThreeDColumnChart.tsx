import React, { useState } from 'react';
import { formatRupiah } from '../utils/reportGenerator';

export interface ColumnChartItem {
  id: string;
  label: string;
  subLabel?: string;
  value: number;
  secondaryValue?: number; // Nilai Rupiah
  color?: string;
  badge?: string;
}

interface ThreeDColumnChartProps {
  data: ColumnChartItem[];
  title?: string;
  valueLabel?: string;
  secondaryValueLabel?: string;
  height?: number;
  emptyMessage?: string;
  isDesaComparison?: boolean;
  tiltXAxisLabels?: boolean;
}

export const ThreeDColumnChart: React.FC<ThreeDColumnChartProps> = ({
  data,
  title,
  valueLabel = 'Unit Aset',
  secondaryValueLabel = 'Nilai Perolehan',
  height = 320,
  emptyMessage = 'Belum ada data untuk ditampilkan',
  isDesaComparison = false,
  tiltXAxisLabels = true,
}) => {
  const [metricType, setMetricType] = useState<'unit' | 'nilai'>('unit');
  const [hoveredItem, setHoveredItem] = useState<ColumnChartItem | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [sortOrder, setSortOrder] = useState<'default' | 'desc'>('default');

  const processedData = React.useMemo(() => {
    let list = [...data];
    if (sortOrder === 'desc') {
      list.sort((a, b) => {
        const valA = metricType === 'unit' ? a.value : (a.secondaryValue || 0);
        const valB = metricType === 'unit' ? b.value : (b.secondaryValue || 0);
        return valB - valA;
      });
    }
    return list;
  }, [data, metricType, sortOrder]);

  const maxValue = React.useMemo(() => {
    if (processedData.length === 0) return 1;
    const values = processedData.map((d) => (metricType === 'unit' ? d.value : (d.secondaryValue || 0)));
    const max = Math.max(...values, 0);
    return max > 0 ? max * 1.15 : 10;
  }, [processedData, metricType]);

  const totalSum = React.useMemo(() => {
    return processedData.reduce(
      (sum, d) => sum + (metricType === 'unit' ? d.value : (d.secondaryValue || 0)),
      0
    );
  }, [processedData, metricType]);

  // Color palette for 3D Columns
  const colorPalette = [
    { base: '#059669', side: '#047857', top: '#10b981', light: '#34d399' }, // Emerald
    { base: '#0284c7', side: '#0369a1', top: '#38bdf8', light: '#7dd3fc' }, // Sky Blue
    { base: '#d97706', side: '#b45309', top: '#f59e0b', light: '#fcd34d' }, // Amber
    { base: '#7c3aed', side: '#6d28d9', top: '#8b5cf6', light: '#c4b5fd' }, // Violet
    { base: '#e11d48', side: '#be123c', top: '#f43f5e', light: '#fda4af' }, // Rose
    { base: '#0d9488', side: '#0f766e', top: '#14b8a6', light: '#5eead4' }, // Teal
    { base: '#ea580c', side: '#c2410c', top: '#f97316', light: '#fdba74' }, // Orange
    { base: '#4f46e5', side: '#4338ca', top: '#6366f1', light: '#a5b4fc' }, // Indigo
  ];

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[260px] border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          📊
        </div>
        <span className="text-sm font-semibold text-slate-500">{emptyMessage}</span>
      </div>
    );
  }

  // Dimension calculations for SVG
  const chartHeight = height - 80;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const shouldTilt = tiltXAxisLabels || isDesaComparison;
  const paddingBottom = shouldTilt ? (isDesaComparison ? 75 : 68) : 55;

  const colCount = processedData.length;
  // Dynamic width for scrollable multi-desa or auto width
  const minColumnWidth = isDesaComparison ? 48 : 72;
  const dynamicSvgWidth = Math.max(760, paddingLeft + paddingRight + colCount * minColumnWidth);

  const availableWidth = dynamicSvgWidth - paddingLeft - paddingRight;
  const colSlot = availableWidth / colCount;
  const colWidth = Math.min(isDesaComparison ? 30 : 44, colSlot * 0.65);
  const dx = Math.min(10, colWidth * 0.35); // 3D depth X
  const dy = -Math.min(7, colWidth * 0.25); // 3D depth Y

  const usableHeight = chartHeight - paddingTop - paddingBottom;
  const zeroY = chartHeight - paddingBottom;

  // Grid lines
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => {
    return Math.round((maxValue / gridSteps) * i);
  });

  return (
    <div className="space-y-3">
      {/* Chart Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
        {title && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700">
              3-D Isometric
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Toggle Unit vs Rupiah */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setMetricType('unit')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                metricType === 'unit'
                  ? 'bg-white text-emerald-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jumlah Unit
            </button>
            <button
              type="button"
              onClick={() => setMetricType('nilai')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                metricType === 'nilai'
                  ? 'bg-white text-emerald-800 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nilai Rupiah
            </button>
          </div>

          {/* Sort Button */}
          {isDesaComparison && (
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'default' ? 'desc' : 'default'))}
              className={`px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
                sortOrder === 'desc'
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Urutkan dari yang terbesar"
            >
              {sortOrder === 'desc' ? '⬇ Urut Tertinggi' : '↕ Sesuai Urutan'}
            </button>
          )}
        </div>
      </div>

      {/* Visual Chart Container */}
      <div className="relative overflow-x-auto rounded-xl bg-gradient-to-b from-slate-50/70 via-white to-slate-50/90 border border-slate-200/80 p-2 shadow-inner">
        <svg
          viewBox={`0 0 ${dynamicSvgWidth} ${chartHeight}`}
          className="w-full h-auto min-h-[250px] overflow-visible select-none"
          style={{ minWidth: isDesaComparison ? '700px' : '100%' }}
        >
          <defs>
            {/* Ambient Lighting Gradients */}
            {colorPalette.map((c, i) => (
              <React.Fragment key={i}>
                <linearGradient id={`frontGrad-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={c.top} />
                  <stop offset="60%" stopColor={c.base} />
                  <stop offset="100%" stopColor={c.side} />
                </linearGradient>
                <linearGradient id={`sideGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={c.side} />
                  <stop offset="100%" stopColor={c.base} stopOpacity="0.85" />
                </linearGradient>
              </React.Fragment>
            ))}

            {/* Base Grid 3D Shadow Filter */}
            <filter id="shadow3d" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* 3D Floor Background Plane */}
          <polygon
            points={`${paddingLeft - 10},${zeroY} ${paddingLeft + availableWidth + 15},${zeroY} ${
              paddingLeft + availableWidth + 15 + dx * 2
            },${zeroY + dy * 2} ${paddingLeft - 10 + dx * 2},${zeroY + dy * 2}`}
            fill="#f1f5f9"
            opacity="0.8"
          />

          {/* Grid lines & Y-axis labels */}
          {gridValues.map((val, idx) => {
            const ratio = val / maxValue;
            const yPos = zeroY - ratio * usableHeight;
            return (
              <g key={idx}>
                {/* 3D grid line with perspective depth */}
                <line
                  x1={paddingLeft}
                  y1={yPos}
                  x2={paddingLeft + availableWidth}
                  y2={yPos}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <line
                  x1={paddingLeft + availableWidth}
                  y1={yPos}
                  x2={paddingLeft + availableWidth + dx}
                  y2={yPos + dy}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingLeft - 8}
                  y={yPos + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#64748b"
                  fontFamily="monospace"
                >
                  {metricType === 'unit'
                    ? val.toLocaleString('id-ID')
                    : val >= 1_000_000_000
                    ? `${(val / 1_000_000_000).toFixed(1)}M`
                    : val >= 1_000_000
                    ? `${(val / 1_000_000).toFixed(0)}Jt`
                    : val.toLocaleString('id-ID')}
                </text>
              </g>
            );
          })}

          {/* Render 3D Columns */}
          {processedData.map((item, index) => {
            const rawValue = metricType === 'unit' ? item.value : (item.secondaryValue || 0);
            const ratio = Math.min(1, Math.max(0.015, rawValue / maxValue));
            const colHeight = ratio * usableHeight;

            const slotCenter = paddingLeft + index * colSlot + colSlot / 2;
            const x = slotCenter - colWidth / 2;
            const yTop = zeroY - colHeight;

            const pal = colorPalette[index % colorPalette.length];
            const isHovered = hoveredItem?.id === item.id;

            return (
              <g
                key={item.id}
                className="transition-all duration-200 cursor-pointer group"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem(item);
                  setHoverPos({ x: rect.left + rect.width / 2, y: rect.top });
                }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {/* 1. Base Drop Shadow on Floor */}
                <polygon
                  points={`${x},${zeroY} ${x + colWidth},${zeroY} ${x + colWidth + dx},${zeroY + dy} ${
                    x + dx
                  },${zeroY + dy}`}
                  fill="#000000"
                  opacity={isHovered ? '0.22' : '0.12'}
                  filter="url(#shadow3d)"
                />

                {/* 2. Sisi Depan (Front Face) */}
                <polygon
                  points={`${x},${zeroY} ${x + colWidth},${zeroY} ${x + colWidth},${yTop} ${x},${yTop}`}
                  fill={`url(#frontGrad-${index % colorPalette.length})`}
                  stroke={isHovered ? '#ffffff' : pal.side}
                  strokeWidth={isHovered ? '1.5' : '0.5'}
                  filter={isHovered ? 'brightness(1.15)' : 'none'}
                />

                {/* 3. Sisi Samping Kanan (Side Face 3D Depth) */}
                <polygon
                  points={`${x + colWidth},${zeroY} ${x + colWidth + dx},${zeroY + dy} ${
                    x + colWidth + dx
                  },${yTop + dy} ${x + colWidth},${yTop}`}
                  fill={pal.side}
                  stroke={isHovered ? '#ffffff' : pal.side}
                  strokeWidth="0.5"
                  opacity={isHovered ? '1' : '0.92'}
                />

                {/* 4. Sisi Atas (Top Cap 3D) */}
                <polygon
                  points={`${x},${yTop} ${x + colWidth},${yTop} ${x + colWidth + dx},${yTop + dy} ${
                    x + dx
                  },${yTop + dy}`}
                  fill={pal.top}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? '1.5' : '0.75'}
                  filter="brightness(1.1)"
                />

                {/* Value on Top of Column */}
                <text
                  x={x + colWidth / 2 + dx / 2}
                  y={yTop + dy - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={isHovered ? '#0f172a' : '#475569'}
                  className="transition-colors"
                >
                  {metricType === 'unit'
                    ? item.value
                    : item.secondaryValue && item.secondaryValue >= 1_000_000
                    ? `${(item.secondaryValue / 1_000_000).toFixed(0)}Jt`
                    : ''}
                </text>

                {/* X-axis Label */}
                <g transform={`translate(${slotCenter}, ${zeroY + 14})`}>
                  <text
                    x="0"
                    y="0"
                    textAnchor={shouldTilt ? 'end' : 'middle'}
                    transform={shouldTilt ? 'rotate(-42)' : 'none'}
                    fontSize={isDesaComparison ? '9.5' : '10'}
                    fontWeight={isHovered ? '800' : '600'}
                    fill={isHovered ? '#047857' : '#334155'}
                    className="transition-colors"
                  >
                    {(item?.label || '').replace(/^DESA\s+/i, '')}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredItem && (
          <div className="absolute top-2 right-4 bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md pointer-events-none z-20 min-w-[210px] animate-fadeIn">
            <div className="font-black text-amber-300 text-sm border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between">
              <span>{hoveredItem.label}</span>
              {hoveredItem.badge && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {hoveredItem.badge}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span>{valueLabel}:</span>
                <span className="font-bold text-white font-mono">{hoveredItem.value} Unit</span>
              </div>
              {hoveredItem.secondaryValue !== undefined && (
                <div className="flex items-center justify-between text-slate-300">
                  <span>{secondaryValueLabel}:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {formatRupiah(hoveredItem.secondaryValue)}
                  </span>
                </div>
              )}
              <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                <span>Porsi terhadap total:</span>
                <span className="font-bold text-amber-400">
                  {totalSum > 0
                    ? Math.round(
                        ((metricType === 'unit' ? hoveredItem.value : (hoveredItem.secondaryValue || 0)) /
                          totalSum) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info / Summary */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Menampilkan <strong>{processedData.length}</strong> entitas data aset
        </span>
        <span className="font-medium">
          Total Akumulasi:{' '}
          <strong className="text-slate-900 font-mono">
            {metricType === 'unit' ? `${totalSum} Unit` : formatRupiah(totalSum)}
          </strong>
        </span>
      </div>
    </div>
  );
};
