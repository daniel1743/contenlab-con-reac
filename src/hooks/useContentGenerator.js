// hooks/useContentGenerator.js
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useContentGenerator = () => {
  const [formData, setFormData] = useState({
    topic: '',
    category: '',
    style: '',
    duration: '',
    platform: 'youtube'
  });
  
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const generateContent = useCallback(async () => {
    const { topic, category, style, duration } = formData;
    
    // Validación simple
    if (!topic.trim()) {
      toast({
        title: 'Campo requerido',
        description: 'Por favor describe tu idea o tema',
        variant: 'destructive'
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      // Simula generación de contenido
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const content = {
        id: Date.now(),
        topic,
        category,
        style,
        duration,
        createdAt: new Date(),
        content: generateMockContent(formData)
      };
      
      setGeneratedContent(content);
      
      toast({
        title: '¡Contenido generado!',
        description: 'Tu contenido está listo para usar'
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el contenido. Intenta de nuevo.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, toast]);

  const resetForm = useCallback(() => {
    setFormData({
      topic: '',
      category: '',
      style: '',
      duration: '',
      platform: 'youtube'
    });
    setGeneratedContent(null);
  }, []);

  return {
    formData,
    generatedContent,
    isLoading,
    updateField,
    generateContent,
    resetForm
  };
};

// Función auxiliar para generar contenido mock
const generateMockContent = ({ topic, category, style, duration }) => {
  const templates = {
    title: [
      `${topic}: La Guía Definitiva`,
      `Todo sobre ${topic} en ${duration}`,
      `${topic}: Lo que Necesitas Saber`,
      `Descubre ${topic} como un Experto`
    ],
    script: `
🎬 GUIÓN PARA: ${topic}

📋 INFORMACIÓN:
• Categoría: ${category}
• Estilo: ${style}  
• Duración: ${duration}

🎯 ESTRUCTURA:

[0:00 - 0:15] HOOK INICIAL
"¿Sabías que ${topic} puede cambiar completamente tu perspectiva? 
En los próximos ${duration}, te voy a mostrar exactamente cómo."

[0:15 - 1:00] PRESENTACIÓN DEL PROBLEMA
"La mayoría de las personas no entienden realmente ${topic}..."

[1:00 - 3:00] DESARROLLO PRINCIPAL
• Punto clave 1: El fundamento de ${topic}
• Punto clave 2: Los errores más comunes
• Punto clave 3: La estrategia que funciona

[3:00 - Final] CALL TO ACTION
"Si este contenido sobre ${topic} te resultó útil, 
no olvides suscribirte para más contenido como este."

💡 NOTAS DE PRODUCCIÓN:
- Usar transiciones suaves entre secciones
- Incluir ejemplos visuales
- Mantener energía durante todo el video
`,
    hashtags: [
      `#${topic.replace(/\s+/g, '')}`,
      `#${category}`,
      `#${style}`,
      '#ContentCreator',
      '#Viral',
      '#Tutorial'
    ]
  };

  return {
    titles: templates.title,
    script: templates.script,
    hashtags: templates.hashtags
  };
};
