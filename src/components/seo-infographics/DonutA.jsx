/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🍩 DONUT A - Multi-Ring SEO Infographic                        ║
 * ║  Inner ring: Topic clusters by traffic                          ║
 * ║  Outer ring: 8 KPI mini-gauges                                  ║
 * ║  Center: Health Score                                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { motion } from 'framer-motion';
import { formatPercent, formatNumber } from '@/utils/seoDataAdapter';

const COLORS = {
  clusters: [
    'hsl(270, 70%, 55%)', // Purple
    'hsl(225, 70%, 55%)', // Blue
    'hsl(180, 70%, 55%)', // Cyan
    'hsl(135, 70%, 55%)', // Green
    'hsl(90, 70%, 55%)', // Lime
    'hsl(45, 70%, 55%)', // Yellow
    'hsl(0, 70%, 55%)', // Red
    'hsl(315, 70%, 55%)' // Pink
  ],
  kpis: [
    'hsl(270, 80%, 60%)',
    'hsl(240, 80%, 60%)',
    'hsl(210, 80%, 60%)',
    'hsl(180, 80%, 60%)',
    'hsl(150, 80%, 60%)',
    'hsl(120, 80%, 60%)',
    'hsl(60, 80%, 60%)',
    'hsl(30, 80%, 60%)'
  ]
};

export default function DonutA({ data, size = 600 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r0 = size * 0.17; // Inner radius
  const r1 = size * 0.30; // Middle radius
  const r2 = size * 0.40; // Outer radius
  const labelR = size * 0.48; // Label radius

  const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
    return {
      x: centerX + radius * Math.cos(angleInRadians - Math.PI / 2),
      y: centerY + radius * Math.sin(angleInRadians - Math.PI / 2)
    };
  };

  const describeDonut = (cx, cy, innerR, outerR, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, outerR, startAngle);
    const end = polarToCartesian(cx, cy, outerR, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
    const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `
      M ${start.x} ${start.y}
      A ${outerR} ${outerR} 0 ${largeArc} 1 ${end.x} ${end.y}
      L ${innerEnd.x} ${innerEnd.y}
      A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}
      Z
    `;
  };

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
        {/* Inner Ring - Topic Clusters */}
        {data.clusters.map((cluster, i) => (
          <motion.path
            key={`cluster-${i}`}
            d={describeDonut(cx, cy, r0, r1, cluster.angleStart, cluster.angleEnd)}
            fill={COLORS.clusters[i]}
            stroke="white"
            strokeWidth={2}
            opacity={0.9}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.6, delay: i * 0.05 }}
            className="cursor-pointer hover:opacity-100 transition-opacity"
          >
            <title>{`${cluster.name}: ${cluster.share}% (${formatNumber(cluster.traffic)} visitas)`}</title>
          </motion.path>
        ))}

        {/* Outer Ring - KPI Gauges */}
        {data.kpis.map((kpi, i) => {
          const sectorAngle = (2 * Math.PI) / data.kpis.length;
          const startAngle = i * sectorAngle;
          const endAngle = startAngle + sectorAngle;
          const progressAngle = startAngle + (sectorAngle * kpi.percent / 100);
          const midAngle = (startAngle + endAngle) / 2;

          return (
            <g key={`kpi-${kpi.id}`}>
              {/* Background */}
              <path
                d={describeDonut(cx, cy, r1 + 10, r2, startAngle, endAngle)}
                fill="rgba(255, 255, 255, 0.1)"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth={1}
              />
              {/* Progress */}
              <motion.path
                d={describeDonut(cx, cy, r1 + 10, r2, startAngle, progressAngle)}
                fill={COLORS.kpis[i]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
              >
                <title>{`${kpi.label}: ${kpi.value}${kpi.unit || ''} (${kpi.percent}%)`}</title>
              </motion.path>

              {/* Label */}
              <LabelPolar
                cx={cx}
                cy={cy}
                r={labelR}
                angle={midAngle}
                kpi={kpi}
              />
            </g>
          );
        })}

        {/* Center Circle Background */}
        <circle cx={cx} cy={cy} r={r0 - 10} fill="rgba(0, 0, 0, 0.5)" />

        {/* Center Text - Site Name */}
        <text
          x={cx}
          y={cy - 15}
          textAnchor="middle"
          className="fill-white text-sm font-semibold"
        >
          {data.site}
        </text>

        {/* Center Text - Period */}
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          className="fill-white/70 text-xs"
        >
          {data.period.from} → {data.period.to}
        </text>
      </svg>

      {/* Health Score - Below Chart */}
      <div className="text-center mt-4">
        <div className="text-5xl font-black text-white">
          {data.health.toFixed(1)}%
        </div>
        <div className="text-sm text-gray-400 mt-1">Health Score</div>
      </div>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
        {data.clusters.map((cluster, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS.clusters[i] }}
            />
            <span className="text-gray-300 truncate">{cluster.name}</span>
            <span className="text-gray-500 ml-auto">{cluster.share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LabelPolar({ cx, cy, r, angle, kpi }) {
  const pos = {
    x: cx + r * Math.cos(angle - Math.PI / 2),
    y: cy + r * Math.sin(angle - Math.PI / 2)
  };

  const anchor = Math.cos(angle - Math.PI / 2) >= 0 ? 'start' : 'end';
  const arrow = kpi.change == null ? '' : kpi.change > 0 ? '↑' : kpi.change < 0 ? '↓' : '•';
  const changeColor = kpi.isPositive ? '#10b981' : kpi.change === 0 ? '#9ca3af' : '#ef4444';

  return (
    <g>
      {/* Connection line */}
      <line
        x1={cx}
        y1={cy}
        x2={pos.x}
        y2={pos.y}
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth={1}
      />

      {/* Label text */}
      <text
        x={pos.x}
        y={pos.y}
        textAnchor={anchor}
        className="fill-white text-[10px] font-semibold"
        style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.8)', strokeWidth: 3 }}
      >
        <tspan>{kpi.label}</tspan>
        <tspan> · {kpi.value}{kpi.unit || ''}</tspan>
        {kpi.change != null && (
          <tspan fill={changeColor}>
            {' '}· {arrow} {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
          </tspan>
        )}
      </text>
    </g>
  );
}
