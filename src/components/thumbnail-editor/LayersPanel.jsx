import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Layers, Type, Square, Eye, EyeOff, Lock, Unlock, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react';

const LayerItem = ({ layer, isSelected, onSelect, onUpdate, onDelete }) => {
  let Icon;
  let content;

  switch (layer.get('type')) {
    case 'i-text':
    case 'textbox':
      Icon = Type;
      content = layer.text;
      break;
    case 'rect':
      Icon = Square;
      content = 'Rectángulo';
      break;
    case 'circle':
      Icon = () => <div className="w-4 h-4 rounded-full border-2 border-current" />;
      content = 'Círculo';
      break;
    case 'image':
      Icon = ImageIcon;
      content = 'Imagen';
      break;
    default:
      Icon = Layers;
      content = 'Objeto';
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`p-2 rounded-lg border flex items-center transition-all cursor-pointer ${
        isSelected
          ? 'border-purple-500 bg-purple-500/20'
          : 'border-purple-500/20 glass-effect hover:border-purple-500/40'
      }`}
      onClick={() => onSelect(layer)}
    >
      <GripVertical className="w-5 h-5 text-gray-500 cursor-grab mr-2" />
      <div className="flex items-center space-x-2 overflow-hidden flex-1">
        <Icon className="w-4 h-4 text-purple-400 flex-shrink-0" />
        <span className="text-sm text-white truncate">{content}</span>
      </div>
      <div className="flex items-center space-x-1 flex-shrink-0">
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onUpdate(layer, { visible: !layer.visible }); }} className="h-7 w-7 p-0 hover:bg-white/10">
          {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 opacity-50" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onDelete(layer); }} className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-400">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const LayersPanel = ({ canvas, activeObject, onSelectObject }) => {
  const layers = canvas ? canvas.getObjects() : [];

  const updateObject = (object, properties) => {
    if (!canvas || !object) return;
    object.set(properties);
    canvas.renderAll();
  };

  const deleteObject = (object) => {
    if (!canvas || !object) return;
    canvas.remove(object);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  return (
    <div className="w-72 glass-effect border-l border-purple-500/20 p-4 overflow-y-auto scrollbar-hide">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-white">Capas</h3>
        <div className="space-y-2">
          {layers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay capas</p>
              <p className="text-xs">Añade elementos para comenzar</p>
            </div>
          ) : (
            <AnimatePresence>
              {[...layers].reverse().map((layer) => (
                <LayerItem
                  key={layer.id}
                  layer={layer}
                  isSelected={activeObject && activeObject.id === layer.id}
                  onSelect={onSelectObject}
                  onUpdate={updateObject}
                  onDelete={deleteObject}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;