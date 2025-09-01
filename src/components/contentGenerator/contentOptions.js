import React from "react";
export const contentOptions = [
  {
    value: "true-crime",
    label: "True Crime",
    styles: [
      { value: "fiel-al-caso", label: "Fiel al caso" },
      { value: "amarillista", label: "Amarillista" },
      { value: "dramatico", label: "Con drama" },
      { value: "narracion-grafica", label: "Narración gráfica" },
    ],
  },
  {
    value: "terror",
    label: "Terror",
    styles: [
      { value: "psicologico", label: "Psicológico" },
      { value: "paranormal", label: "Paranormal" },
      { value: "slasher", label: "Slasher" },
      { value: "cosmico", label: "Cósmico" },
    ],
  },
  {
    value: "noticias",
    label: "Noticias",
    styles: [
      { value: "objetivo", label: "Objetivo" },
      { value: "investigacion", label: "De investigación" },
      { value: "opinion", label: "De opinión" },
      { value: "urgente", label: "Urgente" },
    ],
  },
  {
    value: "viajes",
    label: "Viajes",
    styles: [
      { value: "playas", label: "Playas y relax" },
      { value: "aventura", label: "Aventura y naturaleza" },
      { value: "urbano", label: "Urbano y cultural" },
      { value: "lujoso", label: "Lujoso" },
    ],
  },
  {
    value: "comedia",
    label: "Comedia",
    styles: [
      { value: "stand-up", label: "Stand-up" },
      { value: "sketch", label: "Sketch" },
      { value: "parodia", label: "Parodia" },
      { value: "absurdo", label: "Humor absurdo" },
    ],
  },
  {
    value: "videojuegos",
    label: "Videojuegos",
    styles: [
      { value: "gameplay", label: "Gameplay comentado" },
      { value: "analisis", label: "Análisis y reseña" },
      { value: "speedrun", label: "Speedrun" },
      { value: "lore", label: "Historia / Lore" },
    ],
  },
  {
    value: "tecnologia",
    label: "Tecnología",
    styles: [
      { value: "reviews", label: "Reviews de productos" },
      { value: "tutoriales", label: "Tutoriales" },
      { value: "noticias-tech", label: "Noticias del sector" },
      { value: "explicativo", label: "Explicativo" },
    ],
  },
  {
    value: "cocina",
    label: "Cocina",
    styles: [
      { value: "recetas-rapidas", label: "Recetas rápidas" },
      { value: "gourmet", label: "Gourmet" },
      { value: "postres", label: "Postres" },
      { value: "tradicional", label: "Cocina tradicional" },
    ],
  },
  {
    value: "fitness",
    label: "Fitness",
    styles: [
      { value: "rutinas", label: "Rutinas de ejercicio" },
      { value: "nutricion", label: "Nutrición y dietas" },
      { value: "yoga-meditacion", label: "Yoga y meditación" },
      { value: "crossfit", label: "Crossfit" },
    ],
  },
  {
    value: "finanzas",
    label: "Finanzas Personales",
    styles: [
      { value: "inversion", label: "Inversión para principiantes" },
      { value: "ahorro", label: "Consejos de ahorro" },
      { value: "criptomonedas", label: "Criptomonedas" },
      { value: "mercado-bursatil", label: "Análisis de mercado" },
    ],
  },
];

export const contentDurations = [
    { value: "corto", label: "< 1 min (Short/Reel)"},
    { value: "medio", label: "3-5 min"},
    { value: "largo", label: "8-12 min"},
    { value: "extendido", label: "15+ min"},
];