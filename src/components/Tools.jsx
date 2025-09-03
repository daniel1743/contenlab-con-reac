import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
import { 
  Sparkles, 
  Image, 
  Hash, 
  Wand2, 
  TrendingUp, 
  Zap, 
  Clipboard, 
  Trash2, 
  Copy, 
  BarChart2, 
  Youtube, 
  Facebook, 
  Instagram as InstagramIcon,
  RotateCw
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 🚀 IMPORT DE SERVICIOS GEMINI
import { 
  generateViralScript, 
  generateSEOTitles, 
  generateKeywords, 
  generatePlatformSuggestions, 
  generateTrends 
} from '@/services/geminiService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Temas expandidos con estilos específicos por categoría
const contentOptions = [
  {
    value: 'tech',
    label: '💻 Tecnología',
    styles: [
      { value: 'tutorial', label: '📖 Tutorial' },
      { value: 'review', label: '⭐ Review' },
      { value: 'news', label: '📰 Noticias Tech' }
    ]
  },
  {
    value: 'lifestyle',
    label: '🌟 Lifestyle',
    styles: [
      { value: 'vlog', label: '🎥 Vlog' },
      { value: 'tutorial', label: '📖 Tutorial' },
      { value: 'comedy', label: '😂 Comedia' }
    ]
  },
  {
    value: 'business',
    label: '💼 Negocios',
    styles: [
      { value: 'educational', label: '📚 Educativo' },
      { value: 'documentary', label: '🎬 Documental' }
    ]
  },
  {
    value: 'true_crime',
    label: '🔍 True Crime',
    styles: [
      { value: 'fiel_al_caso', label: '📋 Fiel al Caso' },
      { value: 'fidedigno', label: '✅ Fidedigno' },
      { value: 'amarillista', label: '📰 Amarillista' },
      { value: 'grafico', label: '⚠️ Gráfico' }
    ]
  },
  {
    value: 'terror',
    label: '👻 Terror',
    styles: [
      { value: 'sobrenatural', label: '🔮 Sobrenatural' },
      { value: 'psicologico', label: '🧠 Psicológico' },
      { value: 'clasico', label: '🎭 Clásico' },
      { value: 'slasher', label: '🔪 Slasher' }
    ]
  },
  {
    value: 'ciencia_ficcion',
    label: '🚀 Ciencia Ficción',
    styles: [
      { value: 'futurista', label: '🌟 Futurista' },
      { value: 'post_apocaliptico', label: '💥 Post-Apocalíptico' },
      { value: 'espacial', label: '🛸 Espacial' },
      { value: 'cyberpunk', label: '🤖 Cyberpunk' }
    ]
  },
  {
    value: 'cocina',
    label: '👨‍🍳 Cocina',
    styles: [
      { value: 'nacional', label: '🇲🇽 Nacional' },
      { value: 'internacional', label: '🌍 Internacional' },
      { value: 'postres', label: '🧁 Postres' },
      { value: 'vieja_escuela', label: '👴 Vieja Escuela' },
      { value: 'nueva_escuela', label: '✨ Nueva Escuela' },
      { value: 'fusion', label: '🔄 Fusión' }
    ]
  },
  {
    value: 'viaje',
    label: '✈️ Viaje',
    styles: [
      { value: 'aventura', label: '🏔️ Aventura' },
      { value: 'cultural', label: '🏛️ Cultural' },
      { value: 'lujo', label: '💎 Lujo' },
      { value: 'mochilero', label: '🎒 Mochilero' },
      { value: 'gastronomico', label: '🍽️ Gastronómico' }
    ]
  },
  {
    value: 'noticias',
    label: '📺 Noticias',
    styles: [
      { value: 'actualidad', label: '📊 Actualidad' },
      { value: 'politica', label: '🏛️ Política' },
      { value: 'deportes', label: '⚽ Deportes' },
      { value: 'economia', label: '📈 Economía' },
      { value: 'internacional', label: '🌍 Internacional' }
    ]
  },
  {
    value: 'entertainment',
    label: '🎭 Entretenimiento',
    styles: [
      { value: 'comedy', label: '😂 Comedia' },
      { value: 'review', label: '⭐ Review' },
      { value: 'celebrity', label: '🌟 Celebridades' }
    ]
  }
];

const contentDurations = [
  { value: 'short', label: '⚡ Corto (1-3min)' },
  { value: 'medium', label: '⏱️ Medio (5-10min)' },
  { value: 'long', label: '🎞️ Largo (15min+)' }
];

const Tools = ({ onSectionChange, onGenerate, onCopyDownload }) => {
  // 🔍 DEBUG TEMPORAL - Variables de entorno
  console.log('🔍 Todas las variables:', import.meta.env);
  console.log('🔍 API Key específica:', import.meta.env.VITE_GOOGLE_API_KEY);
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [contentTopic, setContentTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 🆕 NUEVOS ESTADOS PARA DATOS REALES DE GEMINI
  const [realTitles, setRealTitles] = useState([]);
  const [realKeywords, setRealKeywords] = useState([]);
  const [realTrendData, setRealTrendData] = useState(null);
  const [platformSuggestions, setPlatformSuggestions] = useState({});
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleThemeChange = useCallback((value) => {
    setSelectedTheme(value);
    setSelectedStyle(''); // Reset style when theme changes
  }, []);

  // 🆕 FUNCIÓN PARA GENERAR TODOS LOS DATOS SUPLEMENTARIOS
// 🆕 FUNCIÓN MEJORADA PARA GENERAR DATOS SUPLEMENTARIOS
const generateAllSupplementaryData = async () => {
  console.log('🚀 Generando datos suplementarios...');
  
  try {
    // 1. Generar títulos SEO
    try {
      console.log('📝 Generando títulos SEO...');
      const titlesResponse = await generateSEOTitles(contentTopic);
      console.log('📝 Respuesta títulos:', titlesResponse);
      
      // Intentar parsear como JSON, si falla, usar como string
      try {
        const titlesArray = JSON.parse(titlesResponse);
        setRealTitles(Array.isArray(titlesArray) ? titlesArray : [titlesResponse]);
      } catch (parseError) {
        console.log('⚠️ Títulos no son JSON válido, usando como texto');
        setRealTitles([titlesResponse]);
      }
    } catch (error) {
      console.error('❌ Error generando títulos:', error);
      setRealTitles([]); // Usar array vacío como fallback
    }

    // 2. Generar palabras clave
    try {
      console.log('🔑 Generando keywords...');
      const keywordsResponse = await generateKeywords(contentTopic);
      console.log('🔑 Respuesta keywords:', keywordsResponse);
      
      try {
        const keywordsArray = JSON.parse(keywordsResponse);
        setRealKeywords(Array.isArray(keywordsArray) ? keywordsArray : []);
      } catch (parseError) {
        console.log('⚠️ Keywords no son JSON válido, usando fallback');
        setRealKeywords([{keyword: keywordsResponse, trend: 85}]);
      }
    } catch (error) {
      console.error('❌ Error generando keywords:', error);
      setRealKeywords([]);
    }

    // 3. Generar datos de tendencias
    try {
      console.log('📊 Generando tendencias...');
      const trendsResponse = await generateTrends(contentTopic);
      console.log('📊 Respuesta tendencias:', trendsResponse);
      
      try {
        const trendsData = JSON.parse(trendsResponse);
        setRealTrendData(trendsData);
      } catch (parseError) {
        console.log('⚠️ Tendencias no son JSON válido, usando fallback');
        setRealTrendData({
          popularity: [65, 59, 80, 81, 56, 95],
          months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
        });
      }
    } catch (error) {
      console.error('❌ Error generando tendencias:', error);
      setRealTrendData(null);
    }

    // 4. Generar sugerencias por plataforma
    try {
      console.log('💡 Generando sugerencias...');
      const platforms = ['youtube', 'tiktok', 'instagram', 'facebook'];
      const suggestions = {};
      
      for (const platform of platforms) {
        try {
          const suggestion = await generatePlatformSuggestions(contentTopic, platform);
          suggestions[platform] = suggestion;
          console.log(`💡 ${platform}:`, suggestion);
        } catch (error) {
          console.error(`❌ Error generando sugerencia para ${platform}:`, error);
          suggestions[platform] = `Sugerencias para ${platform} no disponibles`;
        }
      }
      
      setPlatformSuggestions(suggestions);
    } catch (error) {
      console.error('❌ Error generando sugerencias:', error);
      setPlatformSuggestions({});
    }

    console.log('✅ Datos suplementarios completados');

  } catch (error) {
    console.error('💥 Error general en generateAllSupplementaryData:', error);
    // Los estados mantienen sus valores por defecto o previos
  }
};


  // 🚀 FUNCIÓN PRINCIPAL CON GEMINI REAL
// 🚀 FUNCIÓN PRINCIPAL MEJORADA
const handleGenerateContent = useCallback(async () => {
  if (!contentTopic.trim() || !selectedTheme || !selectedStyle || !selectedDuration) {
    toast({
      title: 'Error',
      description: 'Por favor completa todos los campos para generar contenido.',
      variant: 'destructive',
    });
    return;
  }
  
  setIsGenerating(true);
  setGeneratedContent('');
  console.log('🎯 Iniciando generación de contenido...');

  try {
    // 🎯 LLAMADA REAL A GEMINI API
    console.log('🤖 Llamando a Gemini API para script principal...');
    const generatedScript = await generateViralScript(
      selectedTheme, 
      selectedStyle, 
      selectedDuration, 
      contentTopic
    );
    
    console.log('✅ Script generado:', generatedScript);
    setGeneratedContent(generatedScript);
    
    toast({
      title: '🤖 ¡Contenido generado con Gemini AI!',
      description: 'Generando datos adicionales...',
    });

    // 🚀 GENERAR DATOS ADICIONALES CON GEMINI (sin bloquear la UI)
    try {
      await generateAllSupplementaryData();
    } catch (supplementaryError) {
      console.error('⚠️ Error en datos suplementarios (no crítico):', supplementaryError);
      // No mostrar error al usuario, el contenido principal ya se generó
    }

    // Guardar en Supabase
    if (user) {
      try {
        const { error } = await supabase
          .from('generated_content')
          .insert({
            user_id: user.id,
            theme: selectedTheme,
            style: selectedStyle,
            topic: contentTopic,
            content: generatedScript,
          });
        
        if (!error) {
          toast({
            title: '¡También guardado!',
            description: 'Contenido guardado en tu historial.',
          });
        }
      } catch (error) {
        console.error("Error saving generated content:", error);
      }
    }

  } catch (error) {
    console.error('💥 Error generating content:', error);
    
    toast({
      title: 'Error al generar contenido',
      description: 'Error con Gemini AI. Usando contenido de ejemplo.',
      variant: 'destructive'
    });
    
    // Fallback al contenido mock
    const fallbackContent = `## Error - Contenido de ejemplo para: ${contentTopic}

**Nota**: Error al conectar con Gemini AI.

### 🎯 Hook Inicial:
¿Sabías que ${contentTopic} puede cambiar tu perspectiva?

### 📝 Desarrollo:
Exploramos ${contentTopic} con enfoque ${selectedStyle}.

### #️⃣ Hashtags:
#${contentTopic.replace(/\s+/g, '')} #${selectedTheme} #Viral`;
    
    setGeneratedContent(fallbackContent);
    
  } finally {
    setIsGenerating(false);
    console.log('🏁 Generación de contenido finalizada');
  }
}, [contentTopic, selectedTheme, selectedStyle, selectedDuration, toast, user]);


  // CORREGIDO: Limpiar script requiere suscripción
  const cleanScript = useCallback(() => {
    if (!generatedContent) return;

    // Verificar suscripción AQUÍ
    if (!onCopyDownload || !onCopyDownload()) return;

    let cleaned = generatedContent
      .replace(/\[HOOK INICIAL\]/g, '')
      .replace(/\[DESARROLLO\]/g, '')
      .replace(/### (.*)\n/g, '')
      .replace(/\*\*/g, '')
      .replace(/#️⃣ Hashtags:/g, '')
      .replace(/#\w+/g, '')
      .trim();
    setGeneratedContent(cleaned);
    toast({ title: 'Guión Limpiado', description: 'Se han eliminado las etiquetas y hashtags.' });
  }, [generatedContent, onCopyDownload, toast]);

  // CORREGIDO: Copiar requiere suscripción
  const handleCopy = useCallback(() => {
    if (!generatedContent) {
      toast({
        title: 'No hay contenido',
        description: 'Primero genera contenido para poder copiarlo.',
        variant: 'destructive'
      });
      return;
    }

    // Verificar suscripción AQUÍ
    if (!onCopyDownload || !onCopyDownload()) return;

    navigator.clipboard.writeText(generatedContent);
    toast({ title: '¡Copiado!', description: 'Contenido copiado al portapapeles' });
  }, [generatedContent, onCopyDownload, toast]);

  // CORREGIDO: Reproducir requiere suscripción
  const handleReplayScript = useCallback(() => {
    if (!generatedContent) {
      toast({
        title: 'No hay contenido',
        description: 'Primero genera contenido para poder reproducirlo.',
        variant: 'destructive'
      });
      return;
    }

    // Verificar suscripción AQUÍ
    if (!onCopyDownload || !onCopyDownload()) return;

    toast({ 
      title: '🎬 Reproduciendo Guión', 
      description: 'Mostrando el guión generado sin necesidad de regenerarlo.' 
    });

    // Scroll suave al área del contenido generado
    const contentArea = document.querySelector('textarea');
    if (contentArea) {
      contentArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      contentArea.focus();
    }
  }, [generatedContent, onCopyDownload, toast]);

  const handleNotImplemented = useCallback(() => {
    toast({
      title: '🚧 Esta función no está implementada aún',
      description: '¡No te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
    });
  }, [toast]);

  const tools = [
    { 
      id: 'ai-content', 
      title: 'Generador de Contenido IA', 
      description: 'Crea contenido viral optimizado para cada plataforma', 
      icon: Sparkles, 
      color: 'from-purple-500 to-pink-500', 
      action: () => {} 
    },
    { 
      id: 'thumbnail-editor', 
      title: 'Editor de Miniaturas', 
      description: 'Diseña miniaturas impactantes con herramientas avanzadas', 
      icon: Image, 
      color: 'from-blue-500 to-purple-500', 
      action: () => onSectionChange && onSectionChange('thumbnail-editor') 
    },
    { 
      id: 'hashtag-generator', 
      title: 'Generador de Hashtags', 
      description: 'Encuentra hashtags trending para maximizar alcance', 
      icon: Hash, 
      color: 'from-green-500 to-blue-500', 
      action: handleNotImplemented
    },
    { 
      id: 'trend-analyzer', 
      title: 'Analizador de Tendencias', 
      description: 'Descubre qué contenido está funcionando en tu nicho', 
      icon: TrendingUp, 
      color: 'from-orange-500 to-red-500', 
      action: handleNotImplemented
    },
  ];
  
  const currentStyles = contentOptions.find(option => option.value === selectedTheme)?.styles || [];

  // 🆕 DATOS DE GRÁFICO CON GEMINI O FALLBACK
  const trendChartData = {
    labels: realTrendData?.months || ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Popularidad del Tema',
      data: realTrendData?.popularity || [65, 59, 80, 81, 56, 95],
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
      borderColor: '#8B5CF6',
      borderWidth: 1,
    }],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false, }, },
    scales: { x: { ticks: { color: '#ffffff' } }, y: { ticks: { color: '#ffffff' } } },
  };

  // Fallback para títulos y keywords
  const mockTitles = [
    "10 Secretos de {tema} que Nadie te Contó",
    "La Verdad INCÓMODA sobre {tema}",
    "Así es como {tema} Cambiará tu Vida en 2025",
    "El ERROR #1 que Cometes con {tema}",
    "Expertos Analizan: ¿Es {tema} una Estafa?"
  ];

  const mockKeywords = [
    {keyword: "tendencias {tema}", trend: 88},
    {keyword: "cómo funciona {tema}", trend: 85},
    {keyword: "{tema} 2025", trend: 92},
    {keyword: "mejor {tema} para principiantes", trend: 78},
    {keyword: "{tema} vs competidor", trend: 75}
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Herramientas Profesionales</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Suite completa de herramientas impulsadas por IA para crear contenido viral
        </p>
      </div>

      {/* Grid de herramientas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.id}>
              <Card 
                className="glass-effect border-purple-500/20 hover:shadow-glow transition-all duration-300 cursor-pointer h-full"
                onClick={tool.action}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">{tool.title}</CardTitle>
                  <CardDescription className="text-gray-400">{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Generador de contenido principal */}
      <Card className="glass-effect border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-purple-400" />
            Generador de Contenido IA
          </CardTitle>
          <CardDescription>
            Define la temática y el estilo para crear contenido optimizado para viralidad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulario con selects nativos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme-select">1. Elige una temática</Label>
              <select
                id="theme-select"
                name="theme"
                value={selectedTheme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecciona una temática</option>
                {contentOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style-select">2. Elige un estilo</Label>
              <select
                id="style-select"
                name="style"
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                disabled={!selectedTheme}
                className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              >
                <option value="">
                  {selectedTheme ? 'Selecciona un estilo' : 'Primero elige una temática'}
                </option>
                {currentStyles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration-select">3. Elige duración</Label>
              <select
                id="duration-select"
                name="duration"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecciona duración</option>
                {contentDurations.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic-input">4. Describe tu idea o tema</Label>
            <Input 
              id="topic-input"
              name="topic"
              placeholder="Ej: El caso de la mansión embrujada, Los mejores destinos de playa, etc." 
              value={contentTopic} 
              onChange={(e) => setContentTopic(e.target.value)} 
              className="glass-effect border-purple-500/20" 
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
          <Button 
  onClick={handleGenerateContent} 
  disabled={isGenerating || !selectedTheme || !selectedStyle || !contentTopic} 
  className="flex-1 gradient-primary hover:opacity-90 transition-opacity flex items-center justify-center"
>
  {isGenerating ? (
    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
  ) : (
    <Zap className="w-4 h-4 mr-2" />
  )}
  <span>
    {isGenerating ? 'Generando con Gemini AI...' : 'Generar Contenido IA'}
  </span>
</Button>

            {/* Botón Reproducir Guión */}
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={handleReplayScript}
              disabled={!generatedContent}
              className="border-purple-500/20 hover:bg-purple-500/10 px-4"
              title="Reproducir guión sin regenerar"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Reproducir
            </Button>
          </div>

          {/* Mensaje CTA para usuarios no logueados */}
          {generatedContent && !user && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-300 text-center">
                💡 <strong>¿Te gusta el resultado?</strong> Inicia sesión para copiar, limpiar y guardar tu contenido.
              </p>
            </div>
          )}
          
          {/* Área de contenido generado */}
          {generatedContent && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-white">Contenido generado con Gemini AI:</Label>
                <div className="flex gap-2">
                  <Button 
                    onClick={cleanScript} 
                    variant="outline" 
                    size="sm" 
                    className="border-purple-500/20 hover:bg-purple-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpiar Guión
                  </Button>
                  <Button 
                    onClick={handleCopy} 
                    variant="outline" 
                    size="sm" 
                    className="border-purple-500/20 hover:bg-purple-500/10"
                  >
                    <Clipboard className="w-4 h-4 mr-2" />
                    Copiar Todo
                  </Button>
                </div>
              </div>
              <Textarea 
                value={generatedContent} 
                onChange={(e) => setGeneratedContent(e.target.value)} 
                className="glass-effect border-purple-500/20 rounded-lg p-4 h-64 whitespace-pre-wrap font-mono" 
                readOnly={!user}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 🆕 TARJETAS CON DATOS REALES DE GEMINI */}
      {generatedContent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-effect border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-blue-400"/>
                📈 Tendencias del Tema (Gemini AI)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <Bar data={trendChartData} options={trendChartOptions}/>
              </div>
              {realTrendData?.trend_percentage && (
                <p className="text-sm text-gray-300 mt-2">
                  Tendencia actual: {realTrendData.trend_percentage}% ↗️
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-effect border-pink-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Wand2 className="w-5 h-5 mr-2 text-pink-400"/>
                💡 Sugerencias IA Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="youtube">
                <TabsList className="grid w-full grid-cols-4 glass-effect">
                  <TabsTrigger value="youtube"><Youtube className="w-5 h-5"/></TabsTrigger>
                  <TabsTrigger value="tiktok">TT</TabsTrigger>
                  <TabsTrigger value="instagram"><InstagramIcon className="w-5 h-5"/></TabsTrigger>
                  <TabsTrigger value="facebook"><Facebook className="w-5 h-5"/></TabsTrigger>
                </TabsList>
                
                {/* 🚀 CONTENIDO REAL DE GEMINI */}
                <TabsContent value="youtube" className="pt-2 text-sm text-gray-300">
                  {platformSuggestions.youtube || 'Usa un hook fuerte en los primeros 5 segundos. Títulos con números o preguntas funcionan bien. Miniaturas con caras expresivas. Duración ideal: 8-12 minutos.'}
                </TabsContent>
                <TabsContent value="tiktok" className="pt-2 text-sm text-gray-300">
                  {platformSuggestions.tiktok || '¡Ve al grano! Los primeros 3 segundos son cruciales. Usa texto en pantalla y sonidos de tendencia. El contenido debe ser corto y con un loop satisfactorio.'}
                </TabsContent>
                <TabsContent value="instagram" className="pt-2 text-sm text-gray-300">
                  {platformSuggestions.instagram || 'Reels: sigue tendencias de audio. Stories: usa stickers interactivos. Feed: imágenes de alta calidad con una paleta de colores coherente.'}
                </TabsContent>
                <TabsContent value="facebook" className="pt-2 text-sm text-gray-300">
                  {platformSuggestions.facebook || 'Videos más largos (3-5 min) funcionan bien. Comparte en grupos relevantes. Preguntas en la descripción para fomentar comentarios.'}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="glass-effect border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Copy className="w-5 h-5 mr-2 text-green-400"/>
                🎯 Títulos SEO (Gemini AI)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* 🚀 TÍTULOS REALES DE GEMINI */}
              {(realTitles.length > 0 ? realTitles : mockTitles).slice(0, 5).map((title, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-md">
                  <span className="text-sm">{typeof title === 'string' ? title.replace('{tema}', contentTopic || 'tu tema') : title}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      if (!onCopyDownload || !onCopyDownload()) return;
                      const titleText = typeof title === 'string' ? title.replace('{tema}', contentTopic || 'tu tema') : title;
                      navigator.clipboard.writeText(titleText); 
                      toast({title:'¡Copiado!'});
                    }}
                  >
                    <Clipboard className="w-4 h-4"/>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-effect border-yellow-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-yellow-400"/>
                🔑 Palabras Clave (Gemini AI)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* 🚀 KEYWORDS REALES DE GEMINI */}
              {(realKeywords.length > 0 ? realKeywords : mockKeywords).slice(0, 5).map((kw, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-md">
                  <span className="text-sm">{(kw.keyword || kw.kw || '').replace('{tema}', contentTopic || 'tema')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-400">{kw.trend}%</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{width: `${kw.trend}%`}}></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Tools;
