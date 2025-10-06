import React, { useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { RotateCcw, Sparkles } from 'lucide-react';

const FiltersPanel = ({ canvas }) => {
  const [filters, setFilters] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
  });

  const { toast } = useToast();

  const applyFilter = (filterType, value) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
      toast({
        title: 'Selecciona una imagen',
        description: 'Los filtros solo se aplican a imágenes.',
        variant: 'destructive',
      });
      return;
    }

    setFilters((prev) => ({ ...prev, [filterType]: value }));

    // Aplicar filtros de Fabric.js
    const fabricFilters = [];

    // Brightness
    if (filters.brightness !== 0 || filterType === 'brightness') {
      fabricFilters.push(
        new fabric.Image.filters.Brightness({
          brightness: filterType === 'brightness' ? value : filters.brightness,
        })
      );
    }

    // Contrast
    if (filters.contrast !== 0 || filterType === 'contrast') {
      fabricFilters.push(
        new fabric.Image.filters.Contrast({
          contrast: filterType === 'contrast' ? value : filters.contrast,
        })
      );
    }

    // Saturation
    if (filters.saturation !== 0 || filterType === 'saturation') {
      fabricFilters.push(
        new fabric.Image.filters.Saturation({
          saturation: filterType === 'saturation' ? value : filters.saturation,
        })
      );
    }

    // Blur
    if (filters.blur !== 0 || filterType === 'blur') {
      fabricFilters.push(
        new fabric.Image.filters.Blur({
          blur: filterType === 'blur' ? value / 100 : filters.blur / 100,
        })
      );
    }

    activeObject.filters = fabricFilters;
    activeObject.applyFilters();
    canvas.renderAll();
  };

  const resetFilters = () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') return;

    setFilters({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      blur: 0,
    });

    activeObject.filters = [];
    activeObject.applyFilters();
    canvas.renderAll();

    toast({
      title: 'Filtros restablecidos',
      description: 'Se han eliminado todos los filtros.',
    });
  };

  const applyPreset = (presetName) => {
    const presets = {
      vintage: { brightness: -0.1, contrast: 0.2, saturation: -0.3, blur: 0 },
      vivid: { brightness: 0.1, contrast: 0.3, saturation: 0.4, blur: 0 },
      blackWhite: { brightness: 0, contrast: 0.2, saturation: -1, blur: 0 },
      soft: { brightness: 0.1, contrast: -0.1, saturation: -0.1, blur: 10 },
    };

    const preset = presets[presetName];
    if (!preset) return;

    setFilters(preset);

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
      toast({
        title: 'Selecciona una imagen',
        description: 'Los filtros solo se aplican a imágenes.',
        variant: 'destructive',
      });
      return;
    }

    activeObject.filters = [
      new fabric.Image.filters.Brightness({ brightness: preset.brightness }),
      new fabric.Image.filters.Contrast({ contrast: preset.contrast }),
      new fabric.Image.filters.Saturation({ saturation: preset.saturation }),
      new fabric.Image.filters.Blur({ blur: preset.blur / 100 }),
    ];

    activeObject.applyFilters();
    canvas.renderAll();

    toast({
      title: `Preset "${presetName}" aplicado`,
      description: 'Puedes ajustar los valores manualmente.',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Filtros de Imagen</h3>
        <Button
          onClick={resetFilters}
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Presets rápidos */}
      <div className="space-y-2">
        <Label className="text-white text-xs">Presets Rápidos</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => applyPreset('vintage')}
            size="sm"
            variant="outline"
            className="glass-effect border-purple-500/20 hover:bg-purple-500/10 text-xs"
          >
            📸 Vintage
          </Button>
          <Button
            onClick={() => applyPreset('vivid')}
            size="sm"
            variant="outline"
            className="glass-effect border-purple-500/20 hover:bg-purple-500/10 text-xs"
          >
            🌈 Vívido
          </Button>
          <Button
            onClick={() => applyPreset('blackWhite')}
            size="sm"
            variant="outline"
            className="glass-effect border-purple-500/20 hover:bg-purple-500/10 text-xs"
          >
            ⚫ B&N
          </Button>
          <Button
            onClick={() => applyPreset('soft')}
            size="sm"
            variant="outline"
            className="glass-effect border-purple-500/20 hover:bg-purple-500/10 text-xs"
          >
            ✨ Suave
          </Button>
        </div>
      </div>

      {/* Controles manuales */}
      <div className="space-y-3">
        <div>
          <Label className="text-white text-xs">Brillo</Label>
          <Slider
            value={[filters.brightness * 100]}
            onValueChange={(val) => applyFilter('brightness', val[0] / 100)}
            min={-100}
            max={100}
            step={1}
            className="mt-2"
          />
          <span className="text-xs text-gray-400">{Math.round(filters.brightness * 100)}</span>
        </div>

        <div>
          <Label className="text-white text-xs">Contraste</Label>
          <Slider
            value={[filters.contrast * 100]}
            onValueChange={(val) => applyFilter('contrast', val[0] / 100)}
            min={-100}
            max={100}
            step={1}
            className="mt-2"
          />
          <span className="text-xs text-gray-400">{Math.round(filters.contrast * 100)}</span>
        </div>

        <div>
          <Label className="text-white text-xs">Saturación</Label>
          <Slider
            value={[filters.saturation * 100]}
            onValueChange={(val) => applyFilter('saturation', val[0] / 100)}
            min={-100}
            max={100}
            step={1}
            className="mt-2"
          />
          <span className="text-xs text-gray-400">{Math.round(filters.saturation * 100)}</span>
        </div>

        <div>
          <Label className="text-white text-xs">Desenfoque</Label>
          <Slider
            value={[filters.blur]}
            onValueChange={(val) => applyFilter('blur', val[0])}
            min={0}
            max={100}
            step={1}
            className="mt-2"
          />
          <span className="text-xs text-gray-400">{Math.round(filters.blur)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        <Sparkles className="w-3 h-3 inline mr-1" />
        Selecciona una imagen para aplicar filtros
      </p>
    </div>
  );
};

export default FiltersPanel;
