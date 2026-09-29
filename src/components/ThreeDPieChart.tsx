import React, { useState } from 'react';
import { formatRupiah } from '../utils/reportGenerator';

export interface PieChartItem {
  id: string;
  label: string;
  value: number;
  secondaryValue?: number;
  color?: string;
  description?: string;
}

interface ThreeDPieChartProps {
  data: PieChartItem[];
  title?: string;
  emptyMessage?: string;
  unitLabel?: string;
  showLegend?: boolean;
  footerNote?: string | React.ReactNode;
}

export const ThreeDPieChart: React.FC<ThreeDPieChartProps> = ({
  data,
  title,
  emptyMessage = 'Belum ada data untuk ditampilkan',
  unitLabel = 'Unit',
  showLegend = true,
  footerNote,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Default vibrant palette for categories / conditions
  const defaultColors = [
    { base: '#059669', top: '#10b981', side: '#047857', dark: '#065f46' }, // Emerald
    { base: '#0284c7', top: '#38bdf8', side: '#0369a1', dark: '#075985' }, // Blue
    { base: '#d97706', top: '#f59e0b', side: '#b45309', dark: '#92400e' }, // Amber
    { base: '#7c3aed', top: '#a78bfa', side: '#6d28d9', dark: '#5b21b6' }, // Purple
    { base: '#e11d48', top: '#fb7185', side: '#be123c', dark: '#9f1239' }, // Rose
    { base: '#0d9488', top: '#2dd4bf', side: '#0f766e', dark: '#115e59' }, // Teal
    { base: '#ea580c', top: '#fb923c', side: '#c2410c', dark: '#9a3412' }, // Orange
  ];

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  if (totalValue === 0 || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[260px] border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
          🥧
        </div>
        <span className="text-sm font-semibold text-slate-500">{emptyMessage}</span>
      </div>
    );
  }

  // Calculate slice angles in radians
  // Start from -PI/2 (top) and go clockwise
  let currentAngle = -Math.PI / 2;
  const slices = data.map((item, index) => {
    const angleSpan = (item.value / totalValue) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angleSpan;
    const midAngle = startAngle + angleSpan / 2;
    currentAngle = endAngle;

    const colors = defaultColors[index % defaultColors.length];

    return {
      ...item,
      index,
      startAngle,
      endAngle,
      midAngle,
      percent: Math.round((item.value / totalValue) * 100),
      colors,
    };
  });

  // SVG Geometry Settings
  const svgWidth = 460;
  const svgHeight = 270;
  const cx = 230;
  const cy = 115;
  const rx = 145; // Horizontal radius
  const ry = 80;  // Vertical radius (tilted 3D perspective)
  const depth = 28; // Extruded height of 3D cylinder

  // Helper to convert ellipse angle to Cartesian coordinates
  const getPoint = (angle: number, rX: number, rY: number, centerX: number, centerY: number) => {
    return {
      x: centerX + rX * Math.cos(angle),
      y: centerY + rY * Math.sin(angle),
    };
  };

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-bold text-blue-700">
            3-D Pie Perspective
          </span>
        </div>
      )}

      {/* 3D Pie Chart Graphic Container */}
      <div className="relative flex justify-center items-center py-2 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/80 rounded-2xl border border-slate-200/80 p-2 shadow-inner">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[440px] h-auto overflow-visible select-none"
        >
          <defs>
            {/* Realistic floor shadow for the 3D pie */}
            <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="6" />
              <feOffset dx="0" dy="16" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.25" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Specular light overlay on the 3D top surface */}
            <linearGradient id="pieSpecular" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* 1. Floor Drop Shadow */}
          <ellipse
            cx={cx}
            cy={cy + depth + 14}
            rx={rx + 8}
            ry={ry + 4}
            fill="#0f172a"
            opacity="0.16"
            filter="blur(8px)"
          />

          {/* 2. Side Walls of 3D Cylinder Slices (Render bottom & sides) */}
          <g>
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;
              // Explode displacement if hovered
              const explodeDist = isHovered ? 10 : 0;
              const expX = Math.cos(slice.midAngle) * explodeDist;
              const expY = Math.sin(slice.midAngle) * (explodeDist * 0.55);

              // We need to render side walls for the front-facing rim of the pie
              // Specifically from max(0, startAngle) to min(PI, endAngle) or adjusted segments
              // Sample points along the arc between startAngle and endAngle
              const numSteps = 24;
              const arcPoints: { x: number; y: number }[] = [];
              const arcPointsBottom: { x: number; y: number }[] = [];

              for (let i = 0; i <= numSteps; i++) {
                const angle = slice.startAngle + (i / numSteps) * (slice.endAngle - slice.startAngle);
                // Only render side walls that face the viewer (sin(angle) >= -0.05)
                const ptTop = getPoint(angle, rx, ry, cx + expX, cy + expY);
                const ptBottom = getPoint(angle, rx, ry, cx + expX, cy + expY + depth);
                arcPoints.push(ptTop);
                arcPointsBottom.push(ptBottom);
              }

              // Also calculate the cut radial faces if visible to viewer
              // Start cut face: from center to startPoint
              const pStart = getPoint(slice.startAngle, rx, ry, cx + expX, cy + expY);
              const pStartBottom = getPoint(slice.startAngle, rx, ry, cx + expX, cy + expY + depth);
              // End cut face: from center to endPoint
              const pEnd = getPoint(slice.endAngle, rx, ry, cx + expX, cy + expY);
              const pEndBottom = getPoint(slice.endAngle, rx, ry, cx + expX, cy + expY + depth);

              // Render curved front wall
              const frontWallPath = [
                `M ${arcPoints[0].x},${arcPoints[0].y}`,
                ...arcPoints.map((p) => `L ${p.x},${p.y}`),
                `L ${arcPointsBottom[numSteps].x},${arcPointsBottom[numSteps].y}`,
                ...arcPointsBottom.reverse().map((p) => `L ${p.x},${p.y}`),
                'Z',
              ].join(' ');

              return (
                <g key={`side-${slice.id}`} className="transition-all duration-300">
                  {/* Outer Rim Wall */}
                  <path
                    d={frontWallPath}
                    fill={slice.colors.side}
                    stroke={slice.colors.dark}
                    strokeWidth="0.5"
                    filter={isHovered ? 'brightness(1.15)' : 'none'}
                    opacity={isHovered ? 1 : 0.95}
                  />

                  {/* Cut Surface 1: Start Radial Face (if pointing downwards/towards viewer) */}
                  {Math.cos(slice.startAngle) <= 0.2 && Math.sin(slice.startAngle) >= -0.1 && (
                    <polygon
                      points={`${cx + expX},${cy + expY} ${pStart.x},${pStart.y} ${pStartBottom.x},${pStartBottom.y} ${cx + expX},${cy + expY + depth}`}
                      fill={slice.colors.dark}
                      stroke={slice.colors.dark}
                      strokeWidth="0.5"
                    />
                  )}

                  {/* Cut Surface 2: End Radial Face (if pointing downwards/towards viewer) */}
                  {Math.cos(slice.endAngle) >= -0.2 && Math.sin(slice.endAngle) >= -0.1 && (
                    <polygon
                      points={`${cx + expX},${cy + expY} ${pEnd.x},${pEnd.y} ${pEndBottom.x},${pEndBottom.y} ${cx + expX},${cy + expY + depth}`}
                      fill={slice.colors.dark}
                      stroke={slice.colors.dark}
                      strokeWidth="0.5"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* 3. Top Face Slices of 3D Pie */}
          <g>
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;
              const explodeDist = isHovered ? 10 : 0;
              const expX = Math.cos(slice.midAngle) * explodeDist;
              const expY = Math.sin(slice.midAngle) * (explodeDist * 0.55);

              const pStart = getPoint(slice.startAngle, rx, ry, cx + expX, cy + expY);
              const pEnd = getPoint(slice.endAngle, rx, ry, cx + expX, cy + expY);

              const largeArcFlag = slice.endAngle - slice.startAngle > Math.PI ? 1 : 0;

              const topSlicePath = [
                `M ${cx + expX},${cy + expY}`,
                `L ${pStart.x},${pStart.y}`,
                `A ${rx} ${ry} 0 ${largeArcFlag} 1 ${pEnd.x},${pEnd.y}`,
                'Z',
              ].join(' ');

              // Label Position
              const labelPos = getPoint(
                slice.midAngle,
                rx * 0.68,
                ry * 0.68,
                cx + expX,
                cy + expY
              );

              return (
                <g
                  key={`top-${slice.id}`}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <path
                    d={topSlicePath}
                    fill={slice.colors.top}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? '2' : '1'}
                    filter={isHovered ? 'brightness(1.2) drop-shadow(0 4px 6px rgba(0,0,0,0.3))' : 'none'}
                  />

                  {/* Highlight Specular Glare */}
                  <path
                    d={topSlicePath}
                    fill="url(#pieSpecular)"
                    opacity={isHovered ? 0.4 : 0.25}
                    pointerEvents="none"
                  />

                  {/* Percentage label on large slices */}
                  {slice.percent >= 8 && (
                    <text
                      x={labelPos.x}
                      y={labelPos.y + 3}
                      textAnchor="middle"
                      fontSize={isHovered ? '12' : '11'}
                      fontWeight="900"
                      fill="#ffffff"
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                      pointerEvents="none"
                    >
                      {slice.percent}%
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover Floating Details Card */}
        {hoveredIndex !== null && slices[hoveredIndex] && (
          <div className="absolute bottom-2 bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md flex items-center gap-3 animate-fadeIn pointer-events-none z-20">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: slices[hoveredIndex].colors.top }}
            />
            <div>
              <div className="font-bold text-white text-xs leading-tight">
                {slices[hoveredIndex].label}
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="font-bold text-emerald-400 font-mono">
                  {slices[hoveredIndex].value} {unitLabel}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-bold text-amber-300">
                  {slices[hoveredIndex].percent}% dari total
                </span>
                {slices[hoveredIndex].secondaryValue && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-cyan-300">
                      {formatRupiah(slices[hoveredIndex].secondaryValue)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Legend Below */}
      {showLegend && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                  isHovered
                    ? 'bg-slate-100 border-slate-400 shadow-sm scale-[1.01]'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-white"
                    style={{ backgroundColor: slice.colors.top }}
                  />
                  <span className="font-semibold text-slate-800 truncate" title={slice.label}>
                    {slice.label}
                  </span>
                </div>
                <div className="text-right shrink-0 flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">
                    {slice.value} <span className="text-[10px] text-slate-500 font-normal">{unitLabel}</span>
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-black text-white"
                    style={{ backgroundColor: slice.colors.side }}
                  >
                    {slice.percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer / Keterangan Tambahan di Bawahnya */}
      {footerNote && (
        <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 font-medium">
          {footerNote}
        </div>
      )}
    </div>
  );
};
