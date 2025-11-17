import React from 'react';

// Tamaños de canvas por plataforma
export const platformSizes = [
  { name: 'YouTube 16:9', width: 1280, height: 720, platform: 'youtube' },
  { name: 'YouTube Shorts', width: 1080, height: 1920, platform: 'youtube' },
  { name: 'TikTok Vertical', width: 1080, height: 1920, platform: 'tiktok' },
  { name: 'Instagram Post', width: 1080, height: 1080, platform: 'instagram' },
  { name: 'Instagram Reels', width: 1080, height: 1920, platform: 'instagram' },
  { name: 'LinkedIn', width: 1200, height: 627, platform: 'linkedin' },
  { name: 'Twitter/X', width: 1200, height: 675, platform: 'twitter' },
];

// Plantillas pre-hechas con categorías
export const templateCategories = {
  gaming: [
    {
      name: 'Gaming - Título Grande',
      category: 'gaming',
      width: 1280,
      height: 720,
      preview: '/templates/gaming-title.jpg',
      elements: [
        { type: 'text', text: 'TÍTULO DEL VIDEO', fontSize: 80, fontFamily: 'Anton', fill: '#FFD700', x: 640, y: 200 },
        { type: 'text', text: 'Subtítulo aquí', fontSize: 40, fontFamily: 'Bebas Neue', fill: '#FFFFFF', x: 640, y: 320 },
      ]
    },
    {
      name: 'Gaming - Acción',
      category: 'gaming',
      width: 1280,
      height: 720,
      preview: '/templates/gaming-action.jpg',
      elements: []
    }
  ],
  finanzas: [
    {
      name: 'Finanzas - Gráfico',
      category: 'finanzas',
      width: 1280,
      height: 720,
      preview: '/templates/finance-chart.jpg',
      elements: [
        { type: 'text', text: '$10,000', fontSize: 100, fontFamily: 'Impact', fill: '#00FF00', x: 640, y: 300 },
        { type: 'text', text: 'GANADOS EN 30 DÍAS', fontSize: 50, fontFamily: 'Bebas Neue', fill: '#FFFFFF', x: 640, y: 450 },
      ]
    }
  ],
  trueCrime: [
    {
      name: 'True Crime - Misterio',
      category: 'trueCrime',
      width: 1280,
      height: 720,
      preview: '/templates/truecrime-mystery.jpg',
      elements: [
        { type: 'text', text: 'EL CASO QUE', fontSize: 70, fontFamily: 'Anton', fill: '#FF0000', x: 640, y: 250 },
        { type: 'text', text: 'CONMOCIONÓ AL MUNDO', fontSize: 70, fontFamily: 'Anton', fill: '#FF0000', x: 640, y: 350 },
      ]
    }
  ],
  reacciones: [
    {
      name: 'Reacciones - Cara Grande',
      category: 'reacciones',
      width: 1280,
      height: 720,
      preview: '/templates/reaction-face.jpg',
      elements: [
        { type: 'text', text: 'MI REACCIÓN A...', fontSize: 60, fontFamily: 'Bebas Neue', fill: '#FFFF00', x: 640, y: 600 },
      ]
    }
  ],
  viral: [
    {
      name: 'Viral - Scroll Stopper',
      category: 'viral',
      width: 1280,
      height: 720,
      preview: '/templates/viral-scroll.jpg',
      elements: [
        { type: 'text', text: 'ESTO CAMBIARÁ', fontSize: 90, fontFamily: 'Impact', fill: '#FF00FF', x: 640, y: 300 },
        { type: 'text', text: 'TU VIDA', fontSize: 90, fontFamily: 'Impact', fill: '#FF00FF', x: 640, y: 420 },
      ]
    }
  ],
  antesDespues: [
    {
      name: 'Antes/Después',
      category: 'antesDespues',
      width: 1280,
      height: 720,
      preview: '/templates/before-after.jpg',
      elements: [
        { type: 'text', text: 'ANTES', fontSize: 70, fontFamily: 'Anton', fill: '#FF0000', x: 320, y: 600 },
        { type: 'text', text: 'DESPUÉS', fontSize: 70, fontFamily: 'Anton', fill: '#00FF00', x: 960, y: 600 },
      ]
    }
  ]
};

// Fuentes profesionales para miniaturas (las más usadas en YouTube)
export const fonts = [
  'Anton',           // Muy popular para títulos grandes
  'Bebas Neue',      // Impactante y legible
  'Impact',          // Clásica para miniaturas
  'League Spartan',  // Moderna y profesional
  'Oswald',          // Versátil
  'Montserrat',      // Elegante
  'Poppins',         // Moderna
  'Roboto',          // Limpia
  'Russo One',       // Bold y llamativa
  'Bangers',         // Divertida
  'Righteous',       // Estilo cómic
  'Permanent Marker', // Handwritten
  'Arial Black',     // Clásica
  'Helvetica',       // Minimalista
];

// Paletas de colores populares para miniaturas
export const colorPalettes = {
  highContrast: ['#FF0000', '#FFFF00', '#FFFFFF', '#000000'],
  gaming: ['#FFD700', '#FF0000', '#00FF00', '#0000FF'],
  professional: ['#1E3A8A', '#FFFFFF', '#F59E0B', '#000000'],
  vibrant: ['#FF00FF', '#00FFFF', '#FFFF00', '#FF0000'],
  dark: ['#000000', '#FFFFFF', '#FFD700', '#FF0000'],
  pastel: ['#FFB6C1', '#87CEEB', '#98FB98', '#DDA0DD'],
};

// Exportación optimizada por plataforma
export const exportSettings = {
  youtube: {
    width: 1280,
    height: 720,
    quality: 0.95,
    maxSize: 2 * 1024 * 1024, // 2MB
    format: 'png'
  },
  tiktok: {
    width: 1080,
    height: 1920,
    quality: 0.9,
    maxSize: 2 * 1024 * 1024,
    format: 'png'
  },
  instagram: {
    width: 1080,
    height: 1080,
    quality: 0.92,
    maxSize: 2 * 1024 * 1024,
    format: 'png'
  }
};