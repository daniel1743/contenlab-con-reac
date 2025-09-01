import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fonts } from './constants';

const PropertyInput = ({ label, type = "text", value, onChange, ...props }) => (
  <div className="grid grid-cols-3 items-center gap-4">
    <Label className="text-white text-xs col-span-1">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="glass-effect border-purple-500/20 h-8 col-span-2"
      {...props}
    />
  </div>
);

const PropertySlider = ({ label, value, onChange, ...props }) => (
  <div className="grid grid-cols-3 items-center gap-4">
    <Label className="text-white text-xs col-span-1">{label}</Label>
    <div className="col-span-2 flex items-center gap-2">
      <Slider
        value={[value]}
        onValueChange={(val) => onChange(val[0])}
        className="w-full"
        {...props}
      />
      <span className="text-xs w-8 text-center">{Math.round(value * 100) || Math.round(value)}</span>
    </div>
  </div>
);

const PropertiesPanel = ({ canvas, activeObject }) => {
  const [properties, setProperties] = useState({});

  useEffect(() => {
    if (activeObject) {
      setProperties({
        fill: activeObject.get('fill') || '#ffffff',
        opacity: activeObject.get('opacity') || 1,
        text: activeObject.get('text') || '',
        fontSize: activeObject.get('fontSize') || 40,
        fontFamily: activeObject.get('fontFamily') || 'Impact',
      });
    }
  }, [activeObject]);

  const updateProperty = (prop, value) => {
    if (!canvas || !activeObject) return;
    activeObject.set(prop, value);
    canvas.renderAll();
    setProperties(prev => ({ ...prev, [prop]: value }));
  };

  if (!activeObject) {
    return (
      <div className="flex-grow p-4 glass-effect border-b border-purple-500/20 flex items-center justify-center text-center">
        <p className="text-sm text-gray-400">Selecciona un objeto para ver sus propiedades</p>
      </div>
    );
  }

  const isText = activeObject.type === 'i-text' || activeObject.type === 'textbox';

  return (
    <div className="flex-grow p-4 glass-effect border-b border-purple-500/20 overflow-y-auto scrollbar-hide">
      <h3 className="text-sm font-semibold text-white mb-4">Propiedades</h3>
      <div className="space-y-4">
        <PropertyInput label="Color" type="color" value={properties.fill} onChange={(v) => updateProperty('fill', v)} />
        <PropertySlider label="Opacidad" min={0} max={1} step={0.01} value={properties.opacity} onChange={(v) => updateProperty('opacity', v)} />
        
        {isText && (
          <>
            <div className="my-4 border-t border-purple-500/20"></div>
            <h4 className="text-xs font-semibold text-purple-300">Texto</h4>
            <PropertyInput label="Tamaño" type="number" value={properties.fontSize} onChange={(v) => updateProperty('fontSize', parseInt(v, 10))} />
            <div>
              <Label className="text-white text-xs">Fuente</Label>
              <Select value={properties.fontFamily} onValueChange={(v) => updateProperty('fontFamily', v)}>
                <SelectTrigger className="w-full glass-effect border-purple-500/20 mt-1 h-8">
                  <SelectValue placeholder="Selecciona..." />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map(font => <SelectItem key={font} value={font} style={{fontFamily: font}}>{font}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;