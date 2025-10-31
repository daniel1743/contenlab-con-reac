/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🧩 PUZZLE C - Circular Content Types Visualization            ║
 * ║  8-piece puzzle chart showing content distribution              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * @typedef {Object} PuzzleItem
 * @property {string} label - Item label
 * @property {number} value - Item value/weight
 * @property {string} [color] - Custom color (HSL format)
 */

/**
 * PuzzleC Component - 8-piece circular puzzle visualization
 * @param {Object} props
 * @param {'distribution'|'parity'} props.mode - Display mode
 * @param {PuzzleItem[]} props.items - Items to display (max 8)
 * @param {string} [props.centerTitle] - Center text
 * @param {number} [props.size] - SVG size in pixels
 */
export default function PuzzleC({
  mode = 'distribution',
  items = [],
  centerTitle = "Tipos",
  size = 420
}) {
  // Limit to 8 items maximum
  const displayItems = items.slice(0, 8);
  const n = displayItems.length;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.33; // 140px for default 420px size

  const total = displayItems.reduce((s, i) => s + i.value, 0);

  // Calculate sectors
  let cursor = -Math.PI / 2; // Start at top
  const sectors = displayItems.map((it, i) => {
    const span = mode === 'distribution'
      ? (it.value / total) * 2 * Math.PI
      : (2 * Math.PI) / n;

    const a0 = cursor;
    const a1 = cursor + span;
    cursor = a1;

    // Generate color if not provided
    const color = it.color || `hsl(${i * (360 / n)}, 70%, 55%)`;

    return { it, a0, a1, color };
  });

  return (
    <figure
      role="img"
      aria-label={`${centerTitle}: ${displayItems.map(i => i.label).join(', ')}`}
      className="w-full"
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
      >
        {/* Puzzle pieces */}
        {sectors.map(({ it, a0, a1, color }, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: i * 0.08,
              ease: [0.34, 1.56, 0.64, 1]
            }}
          >
            {/* Sector path */}
            <path
              d={sectorPath(cx, cy, r, a0, a1)}
              fill={color}
              stroke="white"
              strokeWidth={3}
              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
            />

            {/* Number label */}
            <text
              {...labelPolar(cx, cy, r + 24, (a0 + a1) / 2)}
              className="fill-white font-bold text-sm pointer-events-none"
              style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.5)', strokeWidth: 3 }}
            >
              {String(i + 1).padStart(2, '0')}
            </text>
          </motion.g>
        ))}

        {/* Center circle */}
        <circle
          cx={cx}
          cy={cy}
          r={56}
          className="fill-black/40 backdrop-blur"
        />

        {/* Center title */}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          className="fill-white text-sm font-semibold pointer-events-none"
        >
          {centerTitle}
        </text>
      </svg>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {displayItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: sectors[i].color }}
            />
            <span className="text-gray-300 truncate">
              {String(i + 1).padStart(2, '0')}. {item.label}
            </span>
            {mode === 'distribution' && (
              <span className="text-gray-500 ml-auto">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </figure>
  );
}

/**
 * Generate SVG path for a circular sector (pie slice)
 */
function sectorPath(cx, cy, r, a0, a1) {
  const large = (a1 - a0) > Math.PI ? 1 : 0;

  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);

  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

/**
 * Calculate polar label position
 */
function labelPolar(cx, cy, r, angle) {
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const textAnchor = Math.cos(angle) >= 0 ? 'start' : 'end';

  return { x, y, textAnchor };
}
