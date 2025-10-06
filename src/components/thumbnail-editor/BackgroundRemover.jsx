import React, { useState } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Scissors, Loader2, AlertCircle } from 'lucide-react';

const BackgroundRemover = ({ canvas }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  // API Key de remove.bg (gratis - 50 requests/mes)
  // Puedes obtener tu propia key en https://remove.bg/api
  const REMOVE_BG_API_KEY = 'demo'; // Cambiar por tu API key real

  const removeBackground = async () => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (!activeObject || activeObject.type !== 'image') {
      toast({
        title: 'Selecciona una imagen',
        description: 'Debes seleccionar una imagen primero.',
        variant: 'destructive',
      });
      return;
    }

    setIsRemoving(true);

    try {
      // Convertir la imagen del canvas a blob
      const dataURL = activeObject.toDataURL({
        format: 'png',
        quality: 1,
      });

      // Convertir dataURL a blob
      const blob = await (await fetch(dataURL)).blob();

      // Crear FormData para enviar a remove.bg
      const formData = new FormData();
      formData.append('image_file', blob);
      formData.append('size', 'auto');

      // Llamar a la API de remove.bg
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.title || 'Error al remover fondo');
      }

      // Obtener la imagen sin fondo
      const resultBlob = await response.blob();
      const resultURL = URL.createObjectURL(resultBlob);

      // Reemplazar la imagen en el canvas
      fabric.Image.fromURL(resultURL, (img) => {
        img.set({
          left: activeObject.left,
          top: activeObject.top,
          scaleX: activeObject.scaleX,
          scaleY: activeObject.scaleY,
          angle: activeObject.angle,
        });

        canvas.remove(activeObject);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();

        toast({
          title: '¡Fondo removido!',
          description: 'El fondo se ha eliminado correctamente.',
        });
      });
    } catch (error) {
      console.error('Error removing background:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo remover el fondo. Verifica tu API key.',
        variant: 'destructive',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white flex items-center">
        <Scissors className="w-4 h-4 mr-2 text-purple-400" />
        Remover Fondo
      </h3>

      <div className="space-y-2">
        <Button
          onClick={removeBackground}
          disabled={isRemoving}
          className="w-full gradient-primary hover:opacity-90 transition-opacity"
        >
          {isRemoving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Scissors className="w-4 h-4 mr-2" />
              Remover Fondo
            </>
          )}
        </Button>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-200">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          <strong>Nota:</strong> Esta función requiere una API key de{' '}
          <a
            href="https://remove.bg/api"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-yellow-100"
          >
            remove.bg
          </a>
          . Plan gratuito: 50 imágenes/mes.
        </div>

        <p className="text-xs text-gray-400">
          Selecciona una imagen y haz clic para remover el fondo automáticamente usando IA.
        </p>
      </div>
    </div>
  );
};

export default BackgroundRemover;
