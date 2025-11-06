import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * VideoCarousel - Carousel de videos con scroll infinito alternado
 * Máximo 5 tarjetas, scroll de derecha a izquierda y viceversa alternando
 */
export default function VideoCarousel({ 
  videos = [], 
  platform = 'youtube',
  onAddVideo,
  onUpdateVideoUrl,
  maxVideos = 5
}) {
  const [editingId, setEditingId] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const scrollContainerRef = useRef(null);
  const [scrollDirection, setScrollDirection] = useState(1); // 1 = right to left, -1 = left to right

  // Calcular videos a mostrar (mover antes del useEffect)
  const displayVideos = videos.slice(0, maxVideos);

  // Auto-scroll infinito alternado
  useEffect(() => {
    if (displayVideos.length === 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.3; // Velocidad de scroll
    let direction = 1; // 1 = right to left, -1 = left to right

    const scroll = () => {
      scrollPosition += scrollSpeed * direction;
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // Cambiar dirección cuando llega a los extremos
      if (scrollPosition >= maxScroll) {
        direction = -1; // Cambiar a izquierda a derecha
        setScrollDirection(-1);
      } else if (scrollPosition <= 0) {
        direction = 1; // Cambiar a derecha a izquierda
        setScrollDirection(1);
      }

      container.scrollLeft = scrollPosition;
      requestAnimationFrame(scroll);
    };

    const animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [displayVideos.length]);

  const handleAddClick = () => {
    if (videos.length >= maxVideos) {
      alert(`Máximo ${maxVideos} videos permitidos`);
      return;
    }
    setEditingId('new');
    setUrlInput('');
  };

  const handleSaveUrl = async () => {
    if (!urlInput.trim()) {
      setEditingId(null);
      return;
    }

    setIsAdding(true);
    try {
      if (editingId === 'new') {
        await onAddVideo(platform);
        // El URL se actualizará después de crear el video
      } else {
        await onUpdateVideoUrl(editingId, urlInput, platform);
      }
      setUrlInput('');
      setEditingId(null);
    } catch (error) {
      console.error('Error saving video URL:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    
    if (platform === 'youtube') {
      const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } else if (platform === 'tiktok') {
      // TikTok no permite embed directo, usar preview
      return null;
    } else if (platform === 'instagram') {
      // Instagram requiere token especial para embed
      return null;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Carousel Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{
          scrollBehavior: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {displayVideos.map((video, index) => {
          const embedUrl = getVideoEmbedUrl(video.content_url);
          const isEditing = editingId === video.id;

          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-80"
            >
              <Card className="bg-gray-800/80 border-purple-500/30 hover:border-purple-500 transition-all overflow-hidden h-full">
                {/* Video Preview */}
                <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-500 relative">
                  {embedUrl ? (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : video.content_url ? (
                    <div className="w-full h-full flex items-center justify-center relative cursor-pointer group">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform z-10">
                        <Play className="w-8 h-8 text-purple-600" fill="currentColor" />
                      </div>
                      <a
                        href={video.content_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-20"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Plus className="w-12 h-12 text-purple-500" />
                    </div>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* URL Input */}
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        value={urlInput || video.content_url || ''}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder={`Pegar URL de ${platform}`}
                        className="bg-gray-900/60 border-purple-500/30 text-sm text-white"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveUrl}
                          size="sm"
                          disabled={isAdding}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          {isAdding ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Guardar'
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingId(null);
                            setUrlInput('');
                          }}
                          size="sm"
                          variant="outline"
                          className="border-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(video.id);
                        setUrlInput(video.content_url || '');
                      }}
                      className="w-full text-left text-sm text-gray-400 hover:text-purple-400 transition-colors truncate"
                    >
                      {video.content_url || `Click para agregar URL de ${platform}`}
                    </button>
                  )}

                  {/* Video Info */}
                  <div className="text-sm text-gray-300 font-semibold">
                    {video.title || `Video ${index + 1}`}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Add New Video Button */}
        {displayVideos.length < maxVideos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-shrink-0 w-80"
          >
            <Card 
              className="bg-gray-800/40 border-2 border-dashed border-purple-500/30 hover:border-purple-500 transition-all h-full cursor-pointer"
              onClick={handleAddClick}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[300px]">
                <Plus className="w-12 h-12 text-purple-500 mb-4" />
                <p className="text-gray-400 text-center">
                  Agregar video de {platform}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Add Button (if no videos) */}
      {displayVideos.length === 0 && (
        <div className="flex justify-center">
          <Button
            onClick={handleAddClick}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Primer Video de {platform}
          </Button>
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        Scroll infinito • Máximo {maxVideos} videos • {displayVideos.length}/{maxVideos} agregados
      </p>
    </div>
  );
}

