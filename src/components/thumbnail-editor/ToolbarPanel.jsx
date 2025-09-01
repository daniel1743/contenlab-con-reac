import React from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Type, Square, Image as ImageIcon, Upload, Shapes, Palette } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ToolbarPanel = ({ canvas, applyTemplate, templates }) => {
  const { toast } = useToast();

  const addObject = (obj) => {
    if (!canvas) return;
    obj.id = Date.now();
    canvas.add(obj);
    canvas.centerObject(obj);
    canvas.setActiveObject(obj);
    canvas.renderAll();
  };

  const addText = () => {
    const text = new fabric.Textbox('Texto Editable', {
      fontSize: 80,
      fill: '#fff',
      fontFamily: 'Impact',
      textAlign: 'center',
      width: 400,
    });
    addObject(text);
  };

  const addShape = (shapeType) => {
    let shape;
    if (shapeType === 'rect') {
      shape = new fabric.Rect({ width: 200, height: 150, fill: '#8B5CF6' });
    } else if (shapeType === 'circle') {
      shape = new fabric.Circle({ radius: 100, fill: '#EC4899' });
    }
    if (shape) addObject(shape);
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      fabric.Image.fromURL(f.target.result, (img) => {
        img.scaleToWidth(canvas.width / 2);
        addObject(img);
      });
    };
    reader.readAsDataURL(file);
  };

  const handleNotImplemented = () => {
    toast({
      title: '🚧 Función en desarrollo',
      description: '¡Próximamente podrás usar esta función!',
    });
  };

  return (
    <div className="w-72 glass-effect border-r border-purple-500/20 p-4 overflow-y-auto scrollbar-hide flex flex-col">
      <Tabs defaultValue="templates" className="w-full flex flex-col flex-grow">
        <TabsList className="grid w-full grid-cols-3 glass-effect mb-4">
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="elements">Elementos</TabsTrigger>
          <TabsTrigger value="uploads">Subir</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Tamaños Predefinidos</h3>
          <div className="space-y-2">
            {templates.map((template) => (
              <Button
                key={template.name}
                onClick={() => applyTemplate(template)}
                className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10"
                variant="outline"
              >
                {template.name}
                <span className="ml-auto text-xs text-gray-400">{template.width}x{template.height}</span>
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="elements" className="space-y-6 flex-grow">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Añadir Elementos</h3>
            <div className="space-y-2">
              <Button onClick={addText} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline">
                <Type className="w-4 h-4 mr-2" />Añadir Texto
              </Button>
              <Button onClick={() => addShape('rect')} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline">
                <Square className="w-4 h-4 mr-2" />Añadir Rectángulo
              </Button>
              <Button onClick={() => addShape('circle')} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline">
                <div className="w-4 h-4 mr-2 rounded-full border-2 border-current"></div>Añadir Círculo
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Biblioteca</h3>
             <div className="space-y-2">
                <Button onClick={handleNotImplemented} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline"><ImageIcon className="w-4 h-4 mr-2" />Imágenes</Button>
                <Button onClick={handleNotImplemented} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline"><Shapes className="w-4 h-4 mr-2" />Iconos y Formas</Button>
                <Button onClick={handleNotImplemented} className="w-full justify-start glass-effect border-purple-500/20 hover:bg-purple-500/10" variant="outline"><Palette className="w-4 h-4 mr-2" />Filtros</Button>
             </div>
          </div>
        </TabsContent>

        <TabsContent value="uploads">
            <h3 className="text-sm font-semibold text-white mb-4">Subir Imagen</h3>
            <div className="relative border-2 border-dashed border-purple-500/30 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-purple-400 hover:text-purple-300">
                    <span>Sube un archivo</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                </label>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 10MB</p>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ToolbarPanel;