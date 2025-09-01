import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fabric } from 'fabric';
import { useToast } from '@/components/ui/use-toast';
import EditorHeader from '@/components/thumbnail-editor/EditorHeader';
import ToolbarPanel from '@/components/thumbnail-editor/ToolbarPanel';
import CanvasArea from '@/components/thumbnail-editor/CanvasArea';
import LayersPanel from '@/components/thumbnail-editor/LayersPanel';
import PropertiesPanel from '@/components/thumbnail-editor/PropertiesPanel';
import { templates } from '@/components/thumbnail-editor/constants';

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

  const exportCanvas = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 1,
      });
      const link = document.createElement('a');
      link.download = 'miniatura-contentlab.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: '¡Miniatura exportada!',
        description: 'Tu diseño se ha descargado en alta calidad.',
      });
    }
  };

  const applyTemplate = (template) => {
    setCanvasSize({ width: template.width, height: template.height });
    toast({
      title: 'Plantilla aplicada',
      description: `Lienzo configurado para ${template.name}`,
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      <EditorHeader 
        onBack={onBack} 
        onExport={exportCanvas}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
      />
      <div className="flex flex-grow overflow-hidden">
        <ToolbarPanel canvas={canvas} applyTemplate={applyTemplate} templates={templates} />
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