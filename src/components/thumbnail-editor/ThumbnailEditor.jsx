import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useToast } from '@/components/ui/use-toast';
import EditorHeader from '@/components/thumbnail-editor/EditorHeader';
import ToolbarPanel from '@/components/thumbnail-editor/ToolbarPanel';
import CanvasArea from '@/components/thumbnail-editor/CanvasArea';
import LayersPanel from '@/components/thumbnail-editor/LayersPanel';
import PropertiesPanel from '@/components/thumbnail-editor/PropertiesPanel';
import { platformSizes, templateCategories, exportSettings } from '@/components/thumbnail-editor/constants';

const ThumbnailEditor = ({ onBack }) => {
  const [canvas, setCanvas] = useState(null);
  const [activeObject, setActiveObject] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1280, height: 720 });
  const [zoom, setZoom] = useState(0.6);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isRedoing = useRef(false);

  const { toast } = useToast();

  const initCanvas = () => {
    const fabricCanvas = new fabric.Canvas('fabric-canvas', {
      width: canvasSize.width,
      height: canvasSize.height,
      backgroundColor: '#1a1a2e',
      preserveObjectStacking: true,
    });

    fabric.Object.prototype.toObject = (function (toObject) {
        return function () {
            return fabric.util.object.extend(toObject.call(this), {
                id: this.id,
            });
        };
    })(fabric.Object.prototype.toObject);

    fabricCanvas.on('object:modified', updateHistory);
    fabricCanvas.on('object:added', updateHistory);
    fabricCanvas.on('object:removed', updateHistory);

    fabricCanvas.on('selection:created', (e) => setActiveObject(e.selected[0]));
    fabricCanvas.on('selection:updated', (e) => setActiveObject(e.selected[0]));
    fabricCanvas.on('selection:cleared', () => setActiveObject(null));

    setCanvas(fabricCanvas);
    updateHistory({ state: fabricCanvas.toDatalessJSON(['id']) });
    return () => {
      fabricCanvas.dispose();
    };
  };

  const updateHistory = useCallback(() => {
    if (isRedoing.current || !canvas) return;
    const newHistory = history.slice(0, historyIndex + 1);
    const currentState = canvas.toDatalessJSON(['id']);
    setHistory([...newHistory, currentState]);
    setHistoryIndex(newHistory.length);
  }, [canvas, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      isRedoing.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        isRedoing.current = false;
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      isRedoing.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      canvas.loadFromJSON(history[newIndex], () => {
        canvas.renderAll();
        isRedoing.current = false;
      });
    }
  };

  useEffect(() => {
    const cleanup = initCanvas();
    return cleanup;
  }, []);

  useEffect(() => {
    if (canvas) {
      canvas.setWidth(canvasSize.width);
      canvas.setHeight(canvasSize.height);
      canvas.renderAll();
      updateHistory();
    }
  }, [canvasSize]);

  // Exportación optimizada por plataforma
  const exportCanvas = (platform = 'youtube') => {
    if (!canvas) return;
    
    const settings = exportSettings[platform] || exportSettings.youtube;
    
    // Deseleccionar objetos antes de exportar
    canvas.discardActiveObject();
    canvas.renderAll();
    
    // Calcular multiplicador para mantener calidad
    const multiplier = Math.max(1, settings.width / canvas.width);
    
    const dataURL = canvas.toDataURL({
      format: settings.format,
      quality: settings.quality,
      multiplier: multiplier,
    });
    
    // Comprimir si es necesario
    const img = new Image();
    img.onload = () => {
      const canvas2 = document.createElement('canvas');
      canvas2.width = settings.width;
      canvas2.height = settings.height;
      const ctx = canvas2.getContext('2d');
      ctx.drawImage(img, 0, 0, settings.width, settings.height);
      
      let finalDataURL = canvas2.toDataURL(`image/${settings.format}`, settings.quality);
      
      // Verificar tamaño y comprimir más si es necesario
      const sizeInBytes = (finalDataURL.length * 3) / 4;
      if (sizeInBytes > settings.maxSize) {
        let quality = settings.quality;
        while (sizeInBytes > settings.maxSize && quality > 0.5) {
          quality -= 0.05;
          finalDataURL = canvas2.toDataURL(`image/${settings.format}`, quality);
        }
      }
      
      const link = document.createElement('a');
      link.download = `miniatura-creovision-${platform}.${settings.format}`;
      link.href = finalDataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: '¡Miniatura exportada!',
        description: `Tu diseño se ha descargado optimizado para ${platform} (${settings.width}×${settings.height}px).`,
      });
    };
    img.src = dataURL;
  };

  // Aplicar plantilla de tamaño
  const applyTemplate = (template) => {
    if (!canvas) return;
    setCanvasSize({ width: template.width, height: template.height });
    toast({
      title: 'Plantilla aplicada',
      description: `Lienzo configurado para ${template.name}`,
    });
  };

  // Aplicar plantilla completa con elementos
  const applyFullTemplate = (template) => {
    if (!canvas) return;
    
    // Limpiar canvas
    canvas.clear();
    canvas.backgroundColor = '#1a1a2e';
    
    // Configurar tamaño
    setCanvasSize({ width: template.width, height: template.height });
    
    // Agregar elementos de la plantilla
    if (template.elements && template.elements.length > 0) {
      template.elements.forEach((element, index) => {
        if (element.type === 'text') {
          const text = new fabric.IText(element.text || 'Texto', {
            left: element.x || 100,
            top: element.y || 100,
            fontSize: element.fontSize || 40,
            fontFamily: element.fontFamily || 'Anton',
            fill: element.fill || '#FFFFFF',
            id: `template-${index}-${Date.now()}`,
          });
          canvas.add(text);
        }
      });
      canvas.renderAll();
    }
    
    toast({
      title: 'Plantilla aplicada',
      description: `Plantilla "${template.name}" cargada con éxito.`,
    });
  };

  // Añadir capas
  const addLayer = (type) => {
    if (!canvas) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    let newObject;
    
    switch (type) {
      case 'text':
        newObject = new fabric.IText('Nuevo texto', {
          left: centerX - 100,
          top: centerY - 20,
          fontSize: 60,
          fontFamily: 'Anton',
          fill: '#FFFFFF',
          id: `text-${Date.now()}`,
        });
        break;
      case 'rectangle':
        newObject = new fabric.Rect({
          left: centerX - 100,
          top: centerY - 50,
          width: 200,
          height: 100,
          fill: '#FF0000',
          id: `rect-${Date.now()}`,
        });
        break;
      case 'circle':
        newObject = new fabric.Circle({
          left: centerX - 50,
          top: centerY - 50,
          radius: 50,
          fill: '#00FF00',
          id: `circle-${Date.now()}`,
        });
        break;
      default:
        return;
    }
    
    canvas.add(newObject);
    canvas.setActiveObject(newObject);
    canvas.renderAll();
    updateHistory();
  };

  // Manejar subida de imagen
  const handleImageUpload = (e) => {
    if (!canvas) return;
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result;
      fabric.Image.fromURL(imgUrl, (img) => {
        // Escalar si es muy grande
        const maxWidth = canvas.width * 0.8;
        const maxHeight = canvas.height * 0.8;
        
        if (img.width > maxWidth) {
          img.scaleToWidth(maxWidth);
        }
        if (img.height > maxHeight) {
          img.scaleToHeight(maxHeight);
        }
        
        img.set({
          left: (canvas.width - img.width * img.scaleX) / 2,
          top: (canvas.height - img.height * img.scaleY) / 2,
          id: `image-${Date.now()}`,
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        updateHistory();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Cambiar color de fondo
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  
  useEffect(() => {
    if (canvas) {
      canvas.backgroundColor = backgroundColor;
      canvas.renderAll();
    }
  }, [backgroundColor, canvas]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <EditorHeader 
        onBack={onBack} 
        onExport={() => exportCanvas('youtube')}
        onExportTikTok={() => exportCanvas('tiktok')}
        onExportInstagram={() => exportCanvas('instagram')}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
      />
      <div className="flex flex-grow overflow-hidden">
        <ToolbarPanel 
          canvas={canvas} 
          addLayer={addLayer}
          applyTemplate={applyTemplate}
          applyFullTemplate={applyFullTemplate}
          templates={platformSizes}
          templateCategories={templateCategories}
          backgroundColor={backgroundColor}
          setBackgroundColor={setBackgroundColor}
          handleImageUpload={handleImageUpload}
        />
        <CanvasArea zoom={zoom} setZoom={setZoom} />
        <div className="flex flex-col w-72">
          <PropertiesPanel canvas={canvas} activeObject={activeObject} />
          <LayersPanel canvas={canvas} activeObject={activeObject} onSelectObject={(obj) => canvas.setActiveObject(obj).renderAll()} />
        </div>
      </div>
    </div>
  );
};

export default ThumbnailEditor;