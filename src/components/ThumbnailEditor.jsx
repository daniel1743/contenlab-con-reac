import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Type, 
  Square, 
  Image as ImageIcon, 
  Palette, 
  Layers, 
  Download, 
  Undo, 
  Redo,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Plus,
  MousePointer
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ThumbnailEditor = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [selectedTool, setSelectedTool] = useState('select');
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 450 });
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [zoom, setZoom] = useState(1);
  const { toast } = useToast();

  const tools = [
    { id: 'select', name: 'Seleccionar', icon: MousePointer },
    { id: 'text', name: 'Texto', icon: Type },
    { id: 'shape', name: 'Formas', icon: Square },
    { id: 'image', name: 'Imagen', icon: ImageIcon },
  ];

  const templates = [
    { name: 'YouTube 16:9', width: 1280, height: 720 },
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'TikTok Vertical', width: 1080, height: 1920 },
    { name: 'LinkedIn', width: 1200, height: 627 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Renderizar capas
      layers.forEach(layer => {
        if (layer.visible) {
          renderLayer(ctx, layer);
        }
      });
    }
  }, [layers, backgroundColor, canvasSize]);

  const renderLayer = (ctx, layer) => {
    ctx.save();
    ctx.globalAlpha = layer.opacity || 1;
    
    switch (layer.type) {
      case 'text':
        ctx.font = `${layer.fontSize || 24}px ${layer.fontFamily || 'Arial'}`;
        ctx.fillStyle = layer.color || '#ffffff';
        ctx.fillText(layer.content, layer.x || 50, layer.y || 50);
        break;
      case 'shape':
        ctx.fillStyle = layer.color || '#8B5CF6';
        if (layer.shape === 'rectangle') {
          ctx.fillRect(layer.x || 50, layer.y || 50, layer.width || 100, layer.height || 100);
        } else if (layer.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(layer.x || 100, layer.y || 100, layer.radius || 50, 0, 2 * Math.PI);
          ctx.fill();
        }
        break;
      default:
        break;
    }
    
    ctx.restore();
  };

  const addTextLayer = () => {
    const newLayer = {
      id: Date.now(),
      type: 'text',
      content: 'Texto nuevo',
      x: 100,
      y: 100,
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#ffffff',
      visible: true,
      locked: false,
      opacity: 1,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(newLayer.id);
    toast({
      title: 'Capa de texto añadida',
      description: 'Nueva capa de texto creada exitosamente',
    });
  };

  const addShapeLayer = (shape) => {
    const newLayer = {
      id: Date.now(),
      type: 'shape',
      shape: shape,
      x: 150,
      y: 150,
      width: 120,
      height: 120,
      radius: 60,
      color: '#8B5CF6',
      visible: true,
      locked: false,
      opacity: 1,
    };
    setLayers([...layers, newLayer]);
    setSelectedLayer(newLayer.id);
    toast({
      title: 'Forma añadida',
      description: `Nueva ${shape} creada exitosamente`,
    });
  };

  const updateLayer = (layerId, updates) => {
    setLayers(layers.map(layer => 
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  };

  const deleteLayer = (layerId) => {
    setLayers(layers.filter(layer => layer.id !== layerId));
    if (selectedLayer === layerId) {
      setSelectedLayer(null);
    }
    toast({
      title: 'Capa eliminada',
      description: 'La capa ha sido eliminada exitosamente',
    });
  };

  const toggleLayerVisibility = (layerId) => {
    const layer = layers.find(l => l.id === layerId);
    updateLayer(layerId, { visible: !layer.visible });
  };

  const toggleLayerLock = (layerId) => {
    const layer = layers.find(l => l.id === layerId);
    updateLayer(layerId, { locked: !layer.locked });
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'miniatura-contentlab.png';
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    
    toast({
      title: '¡Miniatura exportada!',
      description: 'Tu diseño se ha descargado en alta calidad',
    });
  };

  const selectedLayerData = layers.find(l => l.id === selectedLayer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="glass-effect border-b border-purple-500/20 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-xl font-bold text-gradient">Editor de Miniaturas Profesional</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => toast({
                title: '🚧 Esta función no está implementada aún',
                description: '¡No te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
              })}
              className="border-purple-500/20"
            >
              <Undo className="w-4 h-4 mr-2" />
              Deshacer
            </Button>
            <Button
              variant="outline"
              onClick={() => toast({
                title: '🚧 Esta función no está implementada aún',
                description: '¡No te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
              })}
              className="border-purple-500/20"
            >
              <Redo className="w-4 h-4 mr-2" />
              Rehacer
            </Button>
            <Button
              onClick={exportCanvas}
              className="gradient-primary hover:opacity-90"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar HD
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Panel Izquierdo - Herramientas */}
        <div className="w-80 glass-effect border-r border-purple-500/20 p-4 overflow-y-auto scrollbar-hide">
          <Tabs defaultValue="tools" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-effect mb-4">
              <TabsTrigger value="tools">Herramientas</TabsTrigger>
              <TabsTrigger value="templates">Plantillas</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" className="space-y-6">
              {/* Herramientas */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Herramientas</h3>
                <div className="grid grid-cols-2 gap-2">
                  {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Button
                        key={tool.id}
                        variant={selectedTool === tool.id ? "default" : "outline"}
                        onClick={() => setSelectedTool(tool.id)}
                        className={`h-16 flex flex-col items-center justify-center space-y-1 ${
                          selectedTool === tool.id 
                            ? 'gradient-primary' 
                            : 'border-purple-500/20 hover:bg-purple-500/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{tool.name}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Acciones rápidas */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Añadir Elementos</h3>
                <div className="space-y-2">
                  <Button
                    onClick={addTextLayer}
                    className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10"
                    variant="outline"
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Añadir Texto
                  </Button>
                  <Button
                    onClick={() => addShapeLayer('rectangle')}
                    className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10"
                    variant="outline"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Añadir Rectángulo
                  </Button>
                  <Button
                    onClick={() => addShapeLayer('circle')}
                    className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10"
                    variant="outline"
                  >
                    <div className="w-4 h-4 mr-2 rounded-full border-2 border-current"></div>
                    Añadir Círculo
                  </Button>
                  <Button
                    onClick={() => toast({
                      title: '🚧 Esta función no está implementada aún',
                      description: '¡No te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
                    })}
                    className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10"
                    variant="outline"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Subir Imagen
                  </Button>
                </div>
              </div>

              {/* Propiedades del elemento seleccionado */}
              {selectedLayerData && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-white">Propiedades</h3>
                  <div className="space-y-3">
                    {selectedLayerData.type === 'text' && (
                      <>
                        <div>
                          <Label className="text-white text-xs">Contenido</Label>
                          <Input
                            value={selectedLayerData.content}
                            onChange={(e) => updateLayer(selectedLayer, { content: e.target.value })}
                            className="glass-effect border-purple-500/20 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-xs">Tamaño de fuente</Label>
                          <Input
                            type="number"
                            value={selectedLayerData.fontSize}
                            onChange={(e) => updateLayer(selectedLayer, { fontSize: parseInt(e.target.value) })}
                            className="glass-effect border-purple-500/20 mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white text-xs">Color</Label>
                          <Input
                            type="color"
                            value={selectedLayerData.color}
                            onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })}
                            className="glass-effect border-purple-500/20 mt-1 h-10"
                          />
                        </div>
                      </>
                    )}
                    
                    {selectedLayerData.type === 'shape' && (
                      <>
                        <div>
                          <Label className="text-white text-xs">Color</Label>
                          <Input
                            type="color"
                            value={selectedLayerData.color}
                            onChange={(e) => updateLayer(selectedLayer, { color: e.target.value })}
                            className="glass-effect border-purple-500/20 mt-1 h-10"
                          />
                        </div>
                        {selectedLayerData.shape === 'rectangle' && (
                          <>
                            <div>
                              <Label className="text-white text-xs">Ancho</Label>
                              <Input
                                type="number"
                                value={selectedLayerData.width}
                                onChange={(e) => updateLayer(selectedLayer, { width: parseInt(e.target.value) })}
                                className="glass-effect border-purple-500/20 mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-xs">Alto</Label>
                              <Input
                                type="number"
                                value={selectedLayerData.height}
                                onChange={(e) => updateLayer(selectedLayer, { height: parseInt(e.target.value) })}
                                className="glass-effect border-purple-500/20 mt-1"
                              />
                            </div>
                          </>
                        )}
                        {selectedLayerData.shape === 'circle' && (
                          <div>
                            <Label className="text-white text-xs">Radio</Label>
                            <Input
                              type="number"
                              value={selectedLayerData.radius}
                              onChange={(e) => updateLayer(selectedLayer, { radius: parseInt(e.target.value) })}
                              className="glass-effect border-purple-500/20 mt-1"
                            />
                          </div>
                        )}
                      </>
                    )}
                    
                    <div>
                      <Label className="text-white text-xs">Opacidad</Label>
                      <Input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedLayerData.opacity}
                        onChange={(e) => updateLayer(selectedLayer, { opacity: parseFloat(e.target.value) })}
                        className="glass-effect border-purple-500/20 mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Configuración del lienzo */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Lienzo</h3>
                <div>
                  <Label className="text-white text-xs">Color de fondo</Label>
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="glass-effect border-purple-500/20 mt-1 h-10"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Plantillas Predefinidas</h3>
              <div className="space-y-2">
                {templates.map((template) => (
                  <Button
                    key={template.name}
                    onClick={() => {
                      setCanvasSize({ width: template.width, height: template.height });
                      toast({
                        title: 'Plantilla aplicada',
                        description: `Lienzo configurado para ${template.name}`,
                      });
                    }}
                    className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10"
                    variant="outline"
                  >
                    {template.name}
                    <span className="ml-auto text-xs text-gray-400">
                      {template.width}x{template.height}
                    </span>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas Central */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-800/50">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="border border-purple-500/20 shadow-2xl rounded-lg"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                transform: `scale(${zoom})`,
              }}
            />
            
            {/* Controles de zoom */}
            <div className="absolute bottom-4 right-4 flex items-center space-x-2 glass-effect rounded-lg p-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                className="border-purple-500/20"
              >
                -
              </Button>
              <span className="text-white text-sm px-2">{Math.round(zoom * 100)}%</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                className="border-purple-500/20"
              >
                +
              </Button>
            </div>
          </div>
        </div>

        {/* Panel Derecho - Capas */}
        <div className="w-80 glass-effect border-l border-purple-500/20 p-4 overflow-y-auto scrollbar-hide">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Capas</h3>
              <Button
                size="sm"
                onClick={addTextLayer}
                className="gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {layers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay capas</p>
                  <p className="text-xs">Añade texto o formas para comenzar</p>
                </div>
              ) : (
                layers.map((layer) => (
                  <motion.div
                    key={layer.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedLayer === layer.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-purple-500/20 glass-effect hover:border-purple-500/40'
                    }`}
                    onClick={() => setSelectedLayer(layer.id)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {layer.type === 'text' && <Type className="w-4 h-4 text-purple-400" />}
                        {layer.type === 'shape' && <Square className="w-4 h-4 text-blue-400" />}
                        {layer.type === 'image' && <ImageIcon className="w-4 h-4 text-green-400" />}
                        <span className="text-sm text-white truncate">
                          {layer.type === 'text' ? layer.content : `${layer.type} ${layer.shape || ''}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerVisibility(layer.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-white/10"
                        >
                          {layer.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3 opacity-50" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerLock(layer.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-white/10"
                        >
                          {layer.locked ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Unlock className="w-3 h-3 opacity-50" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-red-500/20 text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailEditor;