import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Smile, Image, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * ThreadComposer - Componente tipo Twitter para crear hilos
 * Incluye emojis, GIF y escritura
 */
export default function ThreadComposer({ 
  onPost, 
  onClose, 
  isOpen = false,
  placeholder = "¿Qué está pasando?",
  maxLength = 280
}) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);

  // Cerrar pickers al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(event.target)) {
        setShowGifPicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus en textarea al abrir
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleEmojiClick = (emojiData) => {
    setContent(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleGifSelect = (gifUrl) => {
    setSelectedGif(gifUrl);
    setShowGifPicker(false);
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedGif) return;

    setIsPosting(true);
    try {
      await onPost({
        content: content.trim(),
        gif: selectedGif
      });
      
      // Reset
      setContent('');
      setSelectedGif(null);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Error posting thread:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter para publicar
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handlePost();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Crear Hilo
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {/* Textarea */}
        <div className="relative">
          <TextareaAutosize
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setContent(e.target.value);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-lg"
            minRows={3}
            maxRows={10}
          />
          
          {/* GIF Preview */}
          {selectedGif && (
            <div className="relative mt-4 rounded-xl overflow-hidden">
              <img 
                src={selectedGif} 
                alt="GIF seleccionado" 
                className="w-full max-h-64 object-cover"
              />
              <button
                onClick={() => setSelectedGif(null)}
                className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Character Counter */}
        <div className="flex justify-end text-sm text-gray-400">
          <span className={content.length > maxLength * 0.9 ? 'text-yellow-400' : ''}>
            {content.length}/{maxLength}
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            {/* Emoji Picker */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowGifPicker(false);
                }}
                className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700/50 rounded-full transition-colors"
                title="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 z-50"
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme="dark"
                      width={350}
                      height={400}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* GIF Picker */}
            <div className="relative" ref={gifPickerRef}>
              <button
                onClick={() => {
                  setShowGifPicker(!showGifPicker);
                  setShowEmojiPicker(false);
                }}
                className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700/50 rounded-full transition-colors"
                title="GIF"
              >
                <Image className="w-5 h-5" />
              </button>
              
              <AnimatePresence>
                {showGifPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-2 z-50 bg-gray-800 border border-purple-500/30 rounded-xl p-4 w-80 max-h-96 overflow-y-auto"
                  >
                    <GifPicker onSelect={handleGifSelect} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Post Button */}
          <Button
            onClick={handlePost}
            disabled={(!content.trim() && !selectedGif) || isPosting || content.length > maxLength}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-40"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Publicar
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * GIF Picker Component - Usa Giphy API
 */
function GifPicker({ onSelect }) {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('trending');

  useEffect(() => {
    fetchGifs('trending');
  }, []);

  const fetchGifs = async (query = 'trending') => {
    setLoading(true);
    try {
      // Usar Giphy API (puedes usar tu propia API key o un proxy)
      const apiKey = import.meta.env.VITE_GIPHY_API_KEY || 'demo'; // Cambiar por tu API key
      const url = query === 'trending'
        ? `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20`
        : `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=20`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.data) {
        setGifs(data.data.map(gif => ({
          id: gif.id,
          url: gif.images.fixed_height.url,
          title: gif.title
        })));
      }
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      // Fallback: GIFs de ejemplo
      setGifs([
        { id: '1', url: 'https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif', title: 'Celebration' },
        { id: '2', url: 'https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif', title: 'Thumbs Up' },
        { id: '3', url: 'https://media.giphy.com/media/26u4lOMA8JKSnL9Uk/giphy.gif', title: 'Fire' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchGifs(searchTerm);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar GIFs..."
          className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
        />
        <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700">
          Buscar
        </Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => onSelect(gif.url)}
              className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 ring-purple-500 transition-all"
            >
              <img
                src={gif.url}
                alt={gif.title}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

