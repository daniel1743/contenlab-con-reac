/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ⚙️ WHEEL B - 8 Steps Pipeline Wheel                            ║
 * ║  Circular workflow visualization for SEO pipeline                ║
 * ║  8 numbered petals with progress arcs                            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { motion } from 'framer-motion';

const STEP_COLORS = [
  '#7c3aed', // Indigo
  '#6366f1', // Indigo bright
  '#3b82f6', // Blue
  '#22d3ee', // Cyan
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#fb7185', // Rose
  '#facc15'  // Amber
];

const SURFACE = {
  background: ['#080a1d', '#111531', '#1c1945'],
  grid: 'rgba(255, 255, 255, 0.05)',
  halo: ['rgba(129, 140, 248, 0.22)', 'rgba(236, 233, 255, 0.08)'],
  arcBase: 'rgba(148, 163, 255, 0.18)',
  center: 'rgba(17, 24, 39, 0.88)',
  centerBorder: 'rgba(165, 180, 252, 0.35)',
  labelStroke: 'rgba(7, 11, 25, 0.85)'
};

export default function WheelB({ data, title = "8 Steps - Programmatic SEO", size = 420 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.33; // 140px for default 420px
  const sectorAngle = (2 * Math.PI) / 8;

  const polarToCartesian = (centerX, centerY, radius, angleInRadians) => {
    return {
      x: centerX + radius * Math.cos(angleInRadians - Math.PI / 2),
      y: centerY + radius * Math.sin(angleInRadians - Math.PI / 2)
    };
  };

  const describeSector = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `
      M ${cx} ${cy}
      L ${start.x} ${start.y}
      A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}
      Z
    `;
  };

  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
        <defs>
          <radialGradient id="wheelB-glow" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor={SURFACE.background[0]} />
            <stop offset="55%" stopColor={SURFACE.background[1]} />
            <stop offset="100%" stopColor={SURFACE.background[2]} />
          </radialGradient>
          <linearGradient id="wheelB-grid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={SURFACE.grid} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <rect width={size} height={size} rx={32} fill="url(#wheelB-glow)" />
        <rect width={size} height={size} rx={32} fill="url(#wheelB-grid)" />

        {[r + 32, r + 58].map((radius, idx) => (
          <circle
            key={`halo-${radius}`}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={idx === 0 ? SURFACE.halo[0] : SURFACE.halo[1]}
            strokeWidth={idx === 0 ? 1.6 : 1}
          />
        ))}

        {/* 8 Petals */}
        {data.pipeline.map((step, i) => {
          const startAngle = i * sectorAngle;
          const endAngle = startAngle + sectorAngle;
          const midAngle = (startAngle + endAngle) / 2;
          const progressAngle = startAngle + (sectorAngle * step.status);
          const labelR = r + 24;

          return (
            <g key={step.step}>
              {/* Petal background */}
              <motion.path
                d={describeSector(cx, cy, r, startAngle, endAngle)}
                fill={STEP_COLORS[i]}
                opacity={0.9}
                stroke="rgba(248, 250, 255, 0.25)"
                strokeWidth={1.6}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 0.9, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.34, 1.56, 0.64, 1]
                }}
                className="cursor-pointer hover:opacity-100 transition-opacity"
              >
                <title>{`${step.name}: ${(step.status * 100).toFixed(1)}% - ${step.notes}`}</title>
              </motion.path>

              {/* Progress arc */}
              <circle
                cx={cx}
                cy={cy}
                r={r - 16}
                fill="none"
                stroke={SURFACE.arcBase}
                strokeWidth={6}
              />
              <motion.path
                d={describeArc(cx, cy, r - 16, startAngle, progressAngle)}
                fill="none"
                stroke="rgba(250, 250, 255, 0.85)"
                strokeWidth={6}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
              />

              {/* Step number */}
              <text
                x={polarToCartesian(cx, cy, labelR, midAngle).x}
                y={polarToCartesian(cx, cy, labelR, midAngle).y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white text-sm font-bold"
                style={{ paintOrder: 'stroke', stroke: SURFACE.labelStroke, strokeWidth: 3 }}
              >
                {String(step.step).padStart(2, '0')}
              </text>
            </g>
          );
        })}

        {/* Center circle */}
        <circle
          cx={cx}
          cy={cy}
          r={60}
          fill={SURFACE.center}
          stroke={SURFACE.centerBorder}
          strokeWidth={1.4}
        />

        {/* Center title */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          className="fill-white text-sm font-semibold"
        >
          {title}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          className="fill-white/80 text-xs"
        >
          Research → Iteración
        </text>
      </svg>

      {/* Steps List */}
      <div className="mt-6 space-y-2">
        {data.pipeline.map((step, i) => (
          <motion.div
            key={step.step}
            className="rounded-2xl p-3 bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: STEP_COLORS[i] }}
                >
                  {step.step}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{step.name}</div>
                  {step.notes && (
                    <div className="text-xs text-gray-400">{step.notes}</div>
                  )}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-300">
                {(step.status * 100).toFixed(0)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
