import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

// Lista de Google Fonts populares para miniaturas
const GOOGLE_FONTS = [
  { name: 'Anton', weight: '400', category: 'display' },
  { name: 'Bebas Neue', weight: '400', category: 'display' },
  { name: 'Montserrat', weight: '700', category: 'sans-serif' },
  { name: 'Oswald', weight: '700', category: 'sans-serif' },
  { name: 'Poppins', weight: '700', category: 'sans-serif' },
  { name: 'Roboto', weight: '900', category: 'sans-serif' },
  { name: 'Inter', weight: '800', category: 'sans-serif' },
  { name: 'Raleway', weight: '800', category: 'sans-serif' },
  { name: 'Russo One', weight: '400', category: 'display' },
  { name: 'Bangers', weight: '400', category: 'display' },
  { name: 'Righteous', weight: '400', category: 'display' },
  { name: 'Permanent Marker', weight: '400', category: 'handwriting' },
];

const FontSelector = ({ currentFont, onFontChange }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // Cargar todas las fuentes de Google Fonts
    const loadFonts = async () => {
      const fontFaces = GOOGLE_FONTS.map((font) => {
        return new FontFace(
          font.name,
          `url(https://fonts.googleapis.com/css2?family=${font.name.replace(' ', '+')}:wght@${font.weight}&display=swap)`
        );
      });

      try {
        await Promise.all(
          fontFaces.map(async (fontFace) => {
            await fontFace.load();
            document.fonts.add(fontFace);
          })
        );
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };

    loadFonts();
  }, []);

  return (
    <div className="space-y-2">
      <Label className="text-white text-xs">Tipografía</Label>
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto scrollbar-hide">
        {GOOGLE_FONTS.map((font) => (
          <button
            key={font.name}
            onClick={() => onFontChange(font.name)}
            className={`
              text-left px-3 py-2 rounded-lg border transition-all
              ${currentFont === font.name
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-purple-500/20 hover:border-purple-500/50 bg-black/20'
              }
            `}
            style={{ fontFamily: font.name }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">{font.name}</span>
              {currentFont === font.name && (
                <Check className="w-4 h-4 text-purple-400" />
              )}
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {fontsLoaded ? '✓ Fuentes cargadas' : 'Cargando fuentes...'}
      </p>
    </div>
  );
};

export default FontSelector;
