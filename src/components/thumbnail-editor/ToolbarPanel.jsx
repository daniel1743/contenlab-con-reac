import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type, Square, Image as ImageIcon, Upload, Shapes, Palette, Circle, Scissors } from 'lucide-react';
import UnsplashLibrary from './UnsplashLibrary';
import FiltersPanel from './FiltersPanel';
import BackgroundRemover from './BackgroundRemover';

// Recibimos las funciones y el estado del componente padre (ThumbnailEditor)
const ToolbarPanel = ({
  canvas,
  addLayer,
  applyTemplate,
  templates,
  backgroundColor,
  setBackgroundColor,
  handleImageUpload,
}) => {
  const fileInputRef = React.useRef(null);
  const [showUnsplash, setShowUnsplash] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="w-80 glass-effect border-r border-purple-500/20 p-4 overflow-y-auto scrollbar-hide">
      <Tabs defaultValue="elements" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-effect mb-4">
          <TabsTrigger value="elements">Elementos</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="canvas">Canvas</TabsTrigger>
        </TabsList>

        <TabsContent value="elements" className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Añadir Elementos</h3>
            <div className="space-y-2">
              {/* Ahora llamamos a la función addLayer que viene del padre */}
              <Button onClick={() => addLayer('text')} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline">
                <Type className="w-4 h-4 mr-2" />Añadir Texto
              </Button>
              <Button onClick={() => addLayer('rectangle')} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline">
                <Square className="w-4 h-4 mr-2" />Añadir Rectángulo
              </Button>
              <Button onClick={() => addLayer('circle')} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline">
                <Circle className="w-4 h-4 mr-2" />Añadir Círculo
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Biblioteca</h3>
            <div className="space-y-2">
              <Button
                onClick={() => setShowUnsplash(!showUnsplash)}
                className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10"
                variant={showUnsplash ? "default" : "outline"}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Imágenes Gratis
              </Button>
              <Button disabled className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline"><Shapes className="w-4 h-4 mr-2" />Iconos y Formas</Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10"
                variant={showFilters ? "default" : "outline"}
              >
                <Palette className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Mostrar biblioteca de Unsplash */}
            {showUnsplash && (
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <UnsplashLibrary canvas={canvas} />
              </div>
            )}

            {/* Mostrar panel de filtros */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <FiltersPanel canvas={canvas} />
              </div>
            )}
          </div>

          {/* Sección de herramientas avanzadas */}
          <div className="space-y-3 pt-4 border-t border-purple-500/20">
            <h3 className="text-sm font-semibold text-white">Herramientas IA</h3>
            <BackgroundRemover canvas={canvas} />
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Tamaños Predefinidos</h3>
          <div className="space-y-2">
            {templates.map((template) => (
              <Button
                key={template.name}
                onClick={() => applyTemplate(template)}
                className="w-full justify-between glass-effect border-purple-500/20 hover:bg-purple-500/10 text-left"
                variant="outline"
              >
                <span>{template.name}</span>
                <span className="text-xs text-gray-400">{template.width}×{template.height}</span>
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="canvas">
           <h3 className="text-sm font-semibold text-white mb-4">Ajustes del Canvas</h3>
           {/* ¡AÑADIMOS EL SELECTOR DE COLOR DE FONDO! */}
           <div className="space-y-4">
              <div>
                <Label className="text-white text-xs">Color de fondo</Label>
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="glass-effect border-purple-500/20 mt-1 h-10 w-full"
                />
              </div>
              <div>
                <Label className="text-white text-xs mb-2 block">Subir Imagen de Fondo</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline">
                  <Upload className="w-4 h-4 mr-2" /> Subir Imagen
                </Button>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ToolbarPanel;