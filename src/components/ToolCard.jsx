/**
 * 🎴 TOOL CARD - Componente profesional para herramientas
 *
 * Features:
 * - Iconografía Heroicons consistente
 * - Badges dinámicos (NUEVO, POPULAR, PREMIUM, HOT)
 * - Tooltips informativos con hover
 * - Gradientes por categoría
 * - Estados locked/unlocked
 * - Animaciones suaves
 *
 * @version 1.0.0
 * @date 2025-11-11
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockClosedIcon, ClockIcon, CreditCardIcon, StarIcon } from '@heroicons/react/24/outline';

export default function ToolCard({
  tool,
  categoryColor,
  isLocked = false,
  onAction,
  usageCount = null,
  rating = null,
  ratingCount = null
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const Icon = tool.icon;

  // Colores de badges
  const badgeColors = {
    'NUEVO': 'bg-green-500/20 text-green-400 border-green-500/30',
    'POPULAR': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'PREMIUM': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'HOT': 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="relative">
      {/* Tooltip con información detallada */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72"
        >
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-2xl">
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${categoryColor}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-sm">{tool.title}</h4>
                <p className="text-gray-400 text-xs mt-1">{tool.description}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <CreditCardIcon className="w-4 h-4 text-blue-400" />
                <span>Costo: <strong className="text-white">{tool.creditCost} créditos</strong></span>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <ClockIcon className="w-4 h-4 text-green-400" />
                <span>Tiempo estimado: <strong className="text-white">{tool.estimatedTime}</strong></span>
              </div>

              {usageCount !== null && (
                <div className="flex items-center gap-2 text-gray-300">
                  <StarIcon className="w-4 h-4 text-yellow-400" />
                  <span>Usado <strong className="text-white">{usageCount.toLocaleString()}</strong> veces esta semana</span>
                </div>
              )}

              {rating !== null && ratingCount !== null && (
                <div className="flex items-center gap-2 text-gray-300">
                  <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>Rating: <strong className="text-white">{rating}/5</strong> ({ratingCount} votos)</span>
                </div>
              )}
            </div>

            {/* Flecha del tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-8 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Card principal */}
      <motion.div
        whileHover={{ scale: isLocked ? 1 : 1.02, y: isLocked ? 0 : -4 }}
        whileTap={{ scale: isLocked ? 1 : 0.98 }}
        onClick={() => !isLocked && onAction && onAction()}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          relative overflow-hidden rounded-xl border transition-all duration-300 h-full
          ${isLocked
            ? 'bg-gray-900/50 border-gray-700 cursor-not-allowed opacity-60'
            : 'bg-gray-900/80 border-gray-700 hover:border-gray-600 cursor-pointer hover:shadow-xl'
          }
        `}
      >
        {/* Gradiente de fondo sutil */}
        <div className={`absolute inset-0 bg-gradient-to-br ${categoryColor} opacity-5`}></div>

        {/* Contenido */}
        <div className="relative p-5 space-y-4 h-full flex flex-col">
          {/* Header con icono y badges */}
          <div className="flex items-start justify-between gap-3">
            {/* Icono */}
            <div className={`
              p-3 rounded-lg bg-gradient-to-r ${categoryColor}
              ${isLocked ? 'opacity-50' : 'shadow-lg'}
            `}>
              <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1 justify-end flex-1">
              {tool.badges && tool.badges.map((badge, index) => (
                <span
                  key={index}
                  className={`
                    px-2 py-0.5 text-[10px] font-bold rounded-full border
                    ${badgeColors[badge] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}
                  `}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Título y descripción */}
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base mb-1 leading-tight">
              {tool.title}
            </h3>
            <p className="text-gray-400 text-sm leading-snug line-clamp-2">
              {tool.description}
            </p>
          </div>

          {/* Footer con créditos y tiempo */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-700/50 mt-auto w-full">
            <div className="flex items-center gap-1.5 text-blue-400">
              <CreditCardIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">{tool.creditCost}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-400">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs">{tool.estimatedTime}</span>
            </div>
          </div>

          {/* Lock overlay */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <div className="text-center space-y-2">
                <LockClosedIcon className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-300 font-medium px-4">
                  Define tu personalidad primero
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Efecto de brillo al hover */}
        {!isLocked && (
          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className={`absolute inset-0 bg-gradient-to-r ${categoryColor} opacity-10`}></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
