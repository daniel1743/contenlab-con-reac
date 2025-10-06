import React, { useState, useEffect } from 'react';
import { fabric } from 'fabric';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const UnsplashLibrary = ({ canvas }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // API Key de Unsplash (gratis - 50 requests/hora)
  const UNSPLASH_ACCESS_KEY = 'FjW5lZF8W3usjwKT9-jEj3GvdBLy39EkUKFGmCvJHuA';

  const searchImages = async (query = 'business') => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const data = await response.json();
      setImages(data.results || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las imágenes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar imágenes populares al inicio
    searchImages('business marketing');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchImages(searchQuery);
    }
  };

  const addImageToCanvas = (imageUrl) => {
    if (!canvas) return;

    fabric.Image.fromURL(imageUrl, (img) => {
      // Escalar imagen para que quepa en el canvas
      const maxWidth = canvas.width * 0.5;
      const maxHeight = canvas.height * 0.5;

      if (img.width > maxWidth) {
        img.scaleToWidth(maxWidth);
      }
      if (img.height > maxHeight) {
        img.scaleToHeight(maxHeight);
      }

      // Centrar imagen
      img.set({
        left: canvas.width / 2,
        top: canvas.height / 2,
        originX: 'center',
        originY: 'center',
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();

      toast({
        title: '¡Imagen añadida!',
        description: 'Puedes moverla y redimensionarla.',
      });
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Buscar imágenes gratis..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="glass-effect border-purple-500/20"
        />
        <Button
          type="submit"
          size="icon"
          className="glass-effect border-purple-500/20"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </form>

      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto scrollbar-hide">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative cursor-pointer group aspect-video overflow-hidden rounded-lg border border-purple-500/20 hover:border-purple-500 transition-all"
            onClick={() => addImageToCanvas(image.urls.regular)}
          >
            <img
              src={image.urls.thumb}
              alt={image.alt_description || 'Unsplash image'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold">Añadir</span>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && !loading && (
        <p className="text-center text-gray-400 text-sm py-8">
          Busca imágenes profesionales gratis
        </p>
      )}

      <p className="text-xs text-gray-500 text-center">
        Powered by{' '}
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:underline"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
};

export default UnsplashLibrary;
