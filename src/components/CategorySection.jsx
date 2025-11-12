/**
 * 📂 CATEGORY SECTION - Sección de categoría de herramientas
 *
 * Componente accordion para agrupar herramientas por categoría
 * con animaciones y estados expandido/colapsado
 *
 * @version 1.0.0
 * @date 2025-11-11
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import ToolCard from './ToolCard';

export default function CategorySection({
  category,
  tools,
  hasDefinedPersonality,
  onToolAction,
  defaultExpanded = true
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const Icon = category.icon;

  const activeTools = tools.filter(tool => tool.isActive);
  const toolCount = activeTools.length;

  return (
    <div className="space-y-4">
      {/* Header de categoría (clickeable para expand/collapse) */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-xl cursor-pointer hover:border-gray-600 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Icono de categoría con gradiente */}
          <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Título y descripción */}
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {category.name}
              <span className="text-sm font-normal text-gray-400">
                ({toolCount} {toolCount === 1 ? 'herramienta' : 'herramientas'})
              </span>
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">{category.description}</p>
          </div>
        </div>

        {/* Indicador expand/collapse */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDownIcon className="w-6 h-6 text-gray-400" />
        </motion.div>
      </motion.div>

      {/* Grid de herramientas (con animación) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {activeTools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ToolCard
                    tool={tool}
                    categoryColor={category.color}
                    isLocked={tool.requiresPersonality && !hasDefinedPersonality}
                    onAction={() => onToolAction(tool)}
                    usageCount={Math.floor(Math.random() * 5000) + 500} // Mock data
                    rating={4.5 + Math.random() * 0.5} // Mock data
                    ratingCount={Math.floor(Math.random() * 200) + 50} // Mock data
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
