import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  RotateCw,
  Download,
  User,
  X,
  ArrowUp,
  Minus,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler // ✅ IMPORTANTE
} from 'chart.js';

// ✅ REGISTRO COMPLETO
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// 🚀 IMPORT DE SERVICIOS GEMINI
import {
  generateViralScript,
  generateSEOTitles,
  generateKeywords,
  generatePlatformSuggestions,
  generateTrends,
  generateThemeSEOSuggestions
} from '@/services/geminiService';

// 📊 IMPORT DE SERVICIOS YOUTUBE
import {
  getEngagementData,
  getWeeklyTrends
} from '@/services/youtubeService';

// 🐦 IMPORT DE SERVICIOS TWITTER/X
import {
  getTrendingHashtags
} from '@/services/twitterService';

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

// 🆕 OPCIONES DE PERSONALIDAD DEL CREADOR
const creatorRoles = [
  { value: 'actor', label: '🎭 Actor/Actriz' },
  { value: 'terror_master', label: '👻 Maestro del Terror' },
  { value: 'news_anchor', label: '📰 Presentador de Noticias' },
  { value: 'storyteller', label: '📖 Contador de Historias' },
  { value: 'educator', label: '👨‍🏫 Educador/Profesor' },
  { value: 'comedian', label: '😂 Comediante' },
  { value: 'tech_reviewer', label: '💻 Revisor de Tecnología' },
  { value: 'lifestyle_vlogger', label: '🌟 Vlogger de Estilo de Vida' },
  { value: 'gaming_streamer', label: '🎮 Streamer de Gaming' },
  { value: 'fitness_coach', label: '💪 Coach de Fitness' },
  { value: 'food_creator', label: '👨‍🍳 Creador Gastronómico' },
  { value: 'travel_explorer', label: '✈️ Explorador de Viajes' }
];

const presentationStyles = [
  { value: 'energetic', label: '⚡ Enérgico y Dinámico' },
  { value: 'calm', label: '😌 Calmado y Relajado' },
  { value: 'professional', label: '💼 Profesional y Serio' },
  { value: 'funny', label: '😄 Divertido y Humorístico' },
  { value: 'dramatic', label: '🎭 Dramático e Intenso' },
  { value: 'mysterious', label: '🔮 Misterioso y Enigmático' },
  { value: 'motivational', label: '🔥 Motivacional e Inspirador' },
  { value: 'casual', label: '👕 Casual y Cercano' },
  { value: 'technical', label: '🔧 Técnico y Detallado' }
];

const audienceTypes = [
  { value: 'teens', label: '👦 Adolescentes (13-17 años)' },
  { value: 'young_adults', label: '👨 Adultos Jóvenes (18-25 años)' },
  { value: 'adults', label: '👔 Adultos (26-40 años)' },
  { value: 'mature', label: '👴 Adultos Maduros (40+ años)' },
  { value: 'professionals', label: '💼 Profesionales' },
  { value: 'students', label: '🎓 Estudiantes' },
  { value: 'parents', label: '👨‍👩‍👧 Padres de Familia' },
  { value: 'gamers', label: '🎮 Gamers' },
  { value: 'general', label: '🌍 Público General' }
];

const contentGoals = [
  { value: 'educate', label: '📚 Educar e Informar' },
  { value: 'entertain', label: '🎉 Entretener y Divertir' },
  { value: 'inspire', label: '✨ Inspirar y Motivar' },
  { value: 'sell', label: '💰 Vender Producto/Servicio' },
  { value: 'grow', label: '📈 Crecer Audiencia' },
  { value: 'engage', label: '💬 Generar Engagement' },
  { value: 'viral', label: '🔥 Volverse Viral' },
  { value: 'brand', label: '🏆 Construir Marca Personal' }
];

const Tools = ({ onSectionChange, onAuthClick, onSubscriptionClick }) => {
  // 🔍 DEBUG TEMPORAL - Variables de entorno
  console.log('🔍 Todas las variables:', import.meta.env);
  console.log('🔍 API Key específica:', import.meta.env.VITE_GOOGLE_API_KEY);

  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [contentTopic, setContentTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 🆕 ESTADOS PARA LAS 3 VERSIONES DEL CONTENIDO
  const [contentAnalisis, setContentAnalisis] = useState('');
  const [contentLimpio, setContentLimpio] = useState('');
  const [contentSugerencias, setContentSugerencias] = useState('');
  const [activeTab, setActiveTab] = useState('limpio');

  // 🆕 NUEVOS ESTADOS PARA DATOS REALES DE GEMINI
  const [realTitles, setRealTitles] = useState([]);
  const [realKeywords, setRealKeywords] = useState([]);
  const [realTrendData, setRealTrendData] = useState(null);
  const [platformSuggestions, setPlatformSuggestions] = useState({});
  const [youtubeEngagement, setYoutubeEngagement] = useState(null);

  // 🆕 ESTADOS PARA PERSONALIDAD DEL CREADOR
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [creatorPersonality, setCreatorPersonality] = useState(() => {
    // Cargar desde localStorage si existe
    const saved = localStorage.getItem('creatorPersonality');
    return saved ? JSON.parse(saved) : {
      role: '',
      style: '',
      audience: '',
      goals: ''
    };
  });

  // 🆕 ESTADOS PARA GENERADOR DE HASHTAGS
  const [showHashtagModal, setShowHashtagModal] = useState(false);
  const [hashtagTopic, setHashtagTopic] = useState('');
  const [hashtagPlatform, setHashtagPlatform] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState([]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);

  // 🆕 ESTADOS PARA ANALIZADOR DE TENDENCIAS
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [trendNiche, setTrendNiche] = useState('');
  const [trendPlatform, setTrendPlatform] = useState('');
  const [trendResults, setTrendResults] = useState(null);
  const [isAnalyzingTrends, setIsAnalyzingTrends] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const handleThemeChange = useCallback((value) => {
    setSelectedTheme(value);
    setSelectedStyle(''); // Reset style when theme changes
  }, []);

  // 🆕 FUNCIÓN PARA GENERAR DATOS SUPLEMENTARIOS
  const generateAllSupplementaryData = async () => {
    console.log('🚀 Generando datos suplementarios...');
    
    try {
      // 1. Generar títulos SEO
      try {
        console.log('📝 Generando títulos SEO...');
        const titlesResponse = await generateSEOTitles(contentTopic);
        console.log('📝 Respuesta títulos:', titlesResponse);
        
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

      // 3. Obtener datos REALES de tendencias semanales de YouTube
      try {
        console.log('📊 Obteniendo tendencias semanales de YouTube API...');
        const weeklyData = await getWeeklyTrends(contentTopic);
        setRealTrendData({
          days: weeklyData.days,
          views: weeklyData.views,
          isSimulated: weeklyData.isSimulated
        });
        console.log('📊 Tendencias semanales:', weeklyData.isSimulated ? 'Simulado' : 'Real', weeklyData);
      } catch (error) {
        console.error('❌ Error obteniendo tendencias:', error);
        setRealTrendData({
          days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          views: [4200, 5800, 7300, 6100, 8900, 5400, 3800],
          isSimulated: true
        });
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

      // 5. Obtener datos REALES de engagement de YouTube
      try {
        console.log('📊 Obteniendo datos de engagement de YouTube API...');
        const engagementData = await getEngagementData(contentTopic);
        setYoutubeEngagement(engagementData);
        console.log('📊 Engagement de YouTube:', engagementData.isSimulated ? 'Simulado' : 'Real', engagementData);
      } catch (error) {
        console.error('❌ Error obteniendo engagement:', error);
        setYoutubeEngagement({
          likes: 2500,
          comments: 250,
          shares: 150,
          saves: 80,
          isSimulated: true
        });
      }

      console.log('✅ Datos suplementarios completados');

    } catch (error) {
      console.error('💥 Error general en generateAllSupplementaryData:', error);
    }
  };

  // ✅ FUNCIONES AHORA LIBRES - Se eliminó la restricción de usuario
 // Quedará así
const handleCopy = useCallback(() => {
  if (!generatedContent) {
    toast({
      title: 'No hay contenido',
      description: 'Primero genera contenido para poder copiarlo.',
      variant: 'destructive'
    });
    return;
  }

  if (!user) {
    // 👉 Si no hay usuario logueado, mostramos modal de suscripción
    onSubscriptionClick?.();
    return;
  }

  // ✅ Solo usuarios logueados pueden copiar
  navigator.clipboard.writeText(generatedContent);
  toast({ title: '¡Copiado!', description: 'Contenido copiado al portapapeles' });
}, [generatedContent, user, toast, onSubscriptionClick]);


  const cleanScript = useCallback(() => {
    if (!generatedContent) return;
    
    // padding
    // padding
    // padding
    // padding
    // padding
    // padding
    // padding
    // padding
    // padding
    // padding
    // ✅ Acción para todos los usuarios
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
  }, [generatedContent, user, toast, onAuthClick]);

  const handleDownload = useCallback(() => {
    if (!generatedContent) {
      toast({
        title: 'No hay contenido',
        description: 'Primero genera contenido para descargar.',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      // 👉 Si no hay usuario logueado, mostramos modal de suscripción
      onSubscriptionClick?.();
      return;
    }

    // ✅ Solo usuarios logueados pueden descargar
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `viralcraft-script-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({ title: '¡Descargado!', description: 'Contenido descargado correctamente.' });
  }, [generatedContent, user, toast, onSubscriptionClick]);

  // ✅ FUNCIÓN LIBRE - Sin restricciones de usuario
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

    // 🆕 MENSAJES DE CARGA PROFESIONALES
    toast({
      title: '🚀 ViralCraft está trabajando para ti',
      description: 'Espera un momento... Nuestro editor senior está analizando tu temática y creando el mejor ángulo narrativo posible.',
      duration: 4000,
    });

    try {
      // 🎯 LLAMADA REAL A GEMINI API CON PERSONALIDAD DEL CREADOR
      console.log('🤖 Llamando a Gemini API para script principal...');
      console.log('🎭 Personalidad del creador:', creatorPersonality.role ? 'Configurada' : 'No configurada');

      const generatedScript = await generateViralScript(
        selectedTheme,
        selectedStyle,
        selectedDuration,
        contentTopic,
        creatorPersonality.role ? creatorPersonality : null
      );

      console.log('✅ Script generado:', generatedScript);

      // 🆕 PARSEAR LAS 3 VERSIONES DEL CONTENIDO
      const analisisMatch = generatedScript.match(/---INICIO_ANALISIS---([\s\S]*?)---FIN_ANALISIS---/);
      const limpioMatch = generatedScript.match(/---INICIO_LIMPIO---([\s\S]*?)---FIN_LIMPIO---/);
      const sugerenciasMatch = generatedScript.match(/---INICIO_SUGERENCIAS---([\s\S]*?)---FIN_SUGERENCIAS---/);

      if (analisisMatch) setContentAnalisis(analisisMatch[1].trim());
      if (limpioMatch) setContentLimpio(limpioMatch[1].trim());
      if (sugerenciasMatch) setContentSugerencias(sugerenciasMatch[1].trim());

      // Mantener el contenido completo para compatibilidad
      setGeneratedContent(generatedScript);

      toast({
        title: '✨ ViralCraft está creando tu guión profesional',
        description: creatorPersonality.role
          ? 'Adaptando el contenido a tu estilo único y audiencia. En breve recibirás un análisis estratégico completo...'
          : 'Nuestro motor de IA está diseñando tu contenido viral. Prepárate para recibir algo grandioso...',
        duration: 5000,
      });

      // 🚀 GENERAR DATOS ADICIONALES CON GEMINI (sin bloquear la UI)
      try {
        toast({
          title: '🎯 Optimizando tu contenido',
          description: 'Generando títulos SEO, keywords y análisis de tendencias. Esto tomará solo unos segundos más...',
          duration: 3000,
        });
        await generateAllSupplementaryData();

        toast({
          title: '✅ ¡Tu contenido viral está listo!',
          description: 'ViralCraft ha terminado. Revisa los 3 paneles profesionales y continúa a tu Craft Viral cuando estés listo.',
          duration: 6000,
        });
      } catch (supplementaryError) {
        console.error('⚠️ Error en datos suplementarios (no crítico):', supplementaryError);
      }

      // Guardar en Supabase solo si el usuario está autenticado
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
        title: '⚠️ Ups, algo no salió bien',
        description: 'ViralCraft encontró un problema al generar tu contenido. Estamos usando un ejemplo mientras lo solucionamos.',
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
  }, [contentTopic, selectedTheme, selectedStyle, selectedDuration, creatorPersonality, toast, user]);

  // Reproducir (libre para todos)
  const handleReplayScript = useCallback(() => {
    if (!generatedContent) {
      toast({
        title: 'No hay contenido',
        description: 'Primero genera contenido para poder reproducirlo.',
        variant: 'destructive'
      });
      return;
    }

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
  }, [generatedContent, toast]);

  // 🆕 GENERADOR DE HASHTAGS CON TWITTER/X API
  const handleGenerateHashtags = useCallback(async () => {
    if (!hashtagTopic.trim() || !hashtagPlatform) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa el tema y la plataforma.',
        variant: 'destructive'
      });
      return;
    }

    setIsGeneratingHashtags(true);
    try {
      console.log('🐦 Obteniendo hashtags de Twitter/X API...');

      // Obtener hashtags reales de Twitter/X
      const twitterHashtags = await getTrendingHashtags(hashtagTopic, hashtagPlatform);

      // Formatear para la UI
      const formattedHashtags = twitterHashtags.map(h => ({
        tag: h.tag,
        volume: h.volume >= 1000000
          ? `${(h.volume / 1000000).toFixed(1)}M`
          : h.volume >= 1000
          ? `${Math.floor(h.volume / 1000)}K`
          : h.volume.toString(),
        trend: h.trend === 'rising' ? 'up' : h.trend === 'falling' ? 'down' : 'stable',
        score: h.engagement || Math.floor(Math.random() * 30) + 70
      }));

      setGeneratedHashtags(formattedHashtags);
      toast({
        title: '✅ Hashtags obtenidos de Twitter/X',
        description: `${formattedHashtags.length} hashtags optimizados para ${hashtagPlatform}`
      });

      console.log('🐦 Hashtags generados:', formattedHashtags);
    } catch (error) {
      console.error('❌ Error obteniendo hashtags:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron generar los hashtags. Usando datos alternativos.',
        variant: 'destructive'
      });

      // Fallback con datos simulados
      const fallbackHashtags = [
        { tag: `#${hashtagTopic.replace(/\s+/g, '')}`, volume: '2.5M', trend: 'up', score: 95 },
        { tag: `#${hashtagTopic.split(' ')[0]}2025`, volume: '890K', trend: 'up', score: 88 },
        { tag: `#Viral${hashtagTopic.split(' ')[0]}`, volume: '1.2M', trend: 'stable', score: 82 },
        { tag: `#${hashtagPlatform}${hashtagTopic.split(' ')[0]}`, volume: '650K', trend: 'up', score: 78 },
        { tag: `#${hashtagTopic.split(' ')[0]}Tips`, volume: '420K', trend: 'stable', score: 75 }
      ];
      setGeneratedHashtags(fallbackHashtags);
    } finally {
      setIsGeneratingHashtags(false);
    }
  }, [hashtagTopic, hashtagPlatform, toast]);

  // 🆕 ANALIZADOR DE TENDENCIAS
  const handleAnalyzeTrends = useCallback(async () => {
    if (!trendNiche.trim() || !trendPlatform) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa el nicho y la plataforma.',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzingTrends(true);
    try {
      // TODO: Conectar con API real
      // const trends = await analyzeTrendsAPI(trendNiche, trendPlatform);

      // Simulación temporal
      await new Promise(resolve => setTimeout(resolve, 2500));
      const mockTrends = {
        topTopics: [
          { topic: `${trendNiche} Tutorial`, growth: '+245%', engagement: '8.2%' },
          { topic: `${trendNiche} 2025`, growth: '+189%', engagement: '7.5%' },
          { topic: `${trendNiche} Tips`, growth: '+156%', engagement: '6.8%' }
        ],
        bestTimes: ['8:00 PM - 9:00 PM', '12:00 PM - 1:00 PM', '6:00 PM - 7:00 PM'],
        audienceInsight: `La audiencia de ${trendNiche} en ${trendPlatform} está más activa los fines de semana`,
        competitorCount: Math.floor(Math.random() * 5000) + 1000
      };

      setTrendResults(mockTrends);
      toast({
        title: '📊 Análisis completado',
        description: `Tendencias actualizadas para ${trendNiche}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo analizar las tendencias',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzingTrends(false);
    }
  }, [trendNiche, trendPlatform, toast]);

  // 🆕 FUNCIÓN PARA GUARDAR PERSONALIDAD
  const handleSavePersonality = useCallback(() => {
    if (!creatorPersonality.role || !creatorPersonality.style || !creatorPersonality.audience || !creatorPersonality.goals) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa todos los campos de tu personalidad.',
        variant: 'destructive'
      });
      return;
    }

    // Guardar en localStorage
    localStorage.setItem('creatorPersonality', JSON.stringify(creatorPersonality));

    toast({
      title: '✅ Personalidad Guardada',
      description: 'Tu perfil se aplicará automáticamente en la generación de contenido.',
    });

    setShowPersonalityModal(false);
  }, [creatorPersonality, toast]);

  const tools = [
    {
      id: 'ai-content',
      title: 'Generador de Contenido IA',
      description: 'Crea contenido viral optimizado para cada plataforma',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      action: () => {}
    },
    // COMENTADO TEMPORALMENTE - ThumbnailEditor solo 5% implementado, reemplazar con Canva SDK
    // {
    //   id: 'thumbnail-editor',
    //   title: 'Editor de Miniaturas',
    //   description: 'Diseña miniaturas impactantes con herramientas avanzadas',
    //   icon: Image,
    //   color: 'from-blue-500 to-purple-500',
    //   action: () => onSectionChange && onSectionChange('thumbnail-editor')
    // },
    {
      id: 'personality-setup',
      title: 'Define tu Personalidad',
      description: 'Configura tu rol, estilo, audiencia y objetivos para contenido personalizado',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
      action: () => setShowPersonalityModal(true)
    },
    {
      id: 'hashtag-generator',
      title: 'Generador de Hashtags',
      description: 'Encuentra hashtags trending para maximizar alcance',
      icon: Hash,
      color: 'from-green-500 to-blue-500',
      action: () => setShowHashtagModal(true)
    },
    {
      id: 'trend-analyzer',
      title: 'Analizador de Tendencias',
      description: 'Descubre qué contenido está funcionando en tu nicho',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      action: () => setShowTrendModal(true)
    },
  ];
  
  const currentStyles = contentOptions.find(option => option.value === selectedTheme)?.styles || [];

  // 🆕 DATOS DE GRÁFICO CON YOUTUBE API (Tendencias por día)
  const views = realTrendData?.views || [4200, 5800, 7300, 6100, 8900, 5400, 3800];
  const minView = Math.min(...views);
  const maxView = Math.max(...views);

  // Generar colores graduales: rojo (bajo) → naranja → amarillo → verde (alto)
  const barColors = views.map(view => {
    const normalized = (view - minView) / (maxView - minView); // 0 a 1

    if (normalized < 0.33) {
      // Rojo a Naranja
      const intensity = normalized / 0.33;
      return `rgba(${255}, ${Math.floor(69 + intensity * 96)}, ${Math.floor(58 * intensity)}, 0.8)`;
    } else if (normalized < 0.66) {
      // Naranja a Amarillo
      const intensity = (normalized - 0.33) / 0.33;
      return `rgba(${255}, ${Math.floor(165 + intensity * 90)}, ${Math.floor(58 + intensity * 52)}, 0.8)`;
    } else {
      // Amarillo a Verde
      const intensity = (normalized - 0.66) / 0.34;
      return `rgba(${Math.floor(255 - intensity * 221)}, ${Math.floor(255 - intensity * 58)}, ${Math.floor(110 - intensity * 16)}, 0.8)`;
    }
  });

  const trendChartData = {
    labels: realTrendData?.days || ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Visualizaciones Promedio',
      data: views,
      backgroundColor: barColors,
      borderColor: barColors.map(color => color.replace('0.8', '1')),
      borderWidth: 2,
    }],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y.toLocaleString()} visualizaciones`;
          }
        }
      }
    },
    scales: {
      x: { ticks: { color: '#ffffff', font: { size: 12 } } },
      y: { ticks: { color: '#ffffff', callback: (value) => value.toLocaleString() } }
    },
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
        <h1 className="text-4xl font-bold text-gradient">Centro Creativo</h1>
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
              <Label htmlFor="theme-select">1. Elige la Categoría (O Nicho de Mercado)</Label>
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
              <Label htmlFor="style-select">2. Define el Tono (O Estilo)</Label>
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
              <Label htmlFor="duration-select">3. Define el Formato (O Duración)</Label>
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
            <Label htmlFor="topic-input">4. Describe tu Idea o Prompt</Label>
            <Input 
              id="topic-input"
              name="topic"
              placeholder="Ej: El caso de la mansión embrujada, Los mejores destinos de playa..." 
              value={contentTopic} 
              onChange={(e) => setContentTopic(e.target.value)} 
              className="glass-effect border-purple-500/20" 
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            {/* ✅ GENERADOR: Libre para todos */}
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
                {isGenerating ? 'ViralCraft está creando tu guión...' : 'Generar Contenido Viral'}
              </span>
            </Button>

            {/* ✅ REPRODUCIR: Libre para todos */}
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

          {/* 🆕 ÁREA DE CONTENIDO GENERADO - 3 PANELES PROFESIONALES */}
          {generatedContent && (
            <div className="space-y-6 pt-4">
              {/* Tabs para las 3 versiones - REORDENADAS */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" id="content-tabs">
                <TabsList className="grid w-full grid-cols-3 glass-effect">
                  <TabsTrigger value="limpio">📝 Guión Limpio (Text-to-Speech)</TabsTrigger>
                  <TabsTrigger value="sugerencias">💡 Sugerencias Prácticas</TabsTrigger>
                  <TabsTrigger value="analisis">📊 Análisis Estratégico</TabsTrigger>
                </TabsList>

                {/* PANEL 1: GUIÓN LIMPIO PARA TEXT-TO-SPEECH (AHORA PRIMERO) */}
                <TabsContent value="limpio" className="mt-4">
                  <Card className="glass-effect border-green-500/20">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white flex items-center">
                          📝 Guión Listo para Narración
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(contentLimpio);
                              toast({title: '✅ Guión copiado', description: 'Listo para pegar en tu app de text-to-speech'});
                            }}
                            variant="outline"
                            size="sm"
                            className="border-green-500/20 hover:bg-green-500/10"
                          >
                            <Clipboard className="w-4 h-4 mr-2" />
                            Copiar
                          </Button>
                          <Button
                            onClick={() => {
                              const element = document.createElement('a');
                              const file = new Blob([contentLimpio], { type: 'text/plain' });
                              element.href = URL.createObjectURL(file);
                              element.download = `guion-limpio-${Date.now()}.txt`;
                              document.body.appendChild(element);
                              element.click();
                              document.body.removeChild(element);
                              toast({title: '✅ Descargado'});
                            }}
                            variant="outline"
                            size="sm"
                            className="border-green-500/20 hover:bg-green-500/10"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Narración fluida sin formato - Lista para copiar y pegar en apps de voz
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black/30 rounded-lg p-6 max-h-[600px] overflow-y-auto">
                        <p className="text-base text-gray-100 leading-relaxed font-sans">
                          {contentLimpio || 'Generando versión limpia...'}
                        </p>
                      </div>

                      {/* BOTÓN CONTINUAR A SUGERENCIAS */}
                      <div className="flex justify-center mt-6">
                        <Button
                          onClick={() => setActiveTab('sugerencias')}
                          className="gradient-primary hover:opacity-90"
                          size="lg"
                        >
                          Continuar a Sugerencias Prácticas
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* PANEL 2: SUGERENCIAS PRÁCTICAS (AHORA SEGUNDO) */}
                <TabsContent value="sugerencias" className="mt-4">
                  <Card className="glass-effect border-blue-500/20">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white flex items-center">
                          💡 Sugerencias y Recursos Prácticos
                        </CardTitle>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(contentSugerencias);
                            toast({title: '✅ Sugerencias copiadas'});
                          }}
                          variant="outline"
                          size="sm"
                          className="border-blue-500/20 hover:bg-blue-500/10"
                        >
                          <Clipboard className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <CardDescription>
                        Recursos gratuitos, editores, música y alertas importantes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black/30 rounded-lg p-6 max-h-[600px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans">
                          {contentSugerencias || 'Generando sugerencias...'}
                        </pre>
                      </div>

                      {/* BOTÓN CONTINUAR A ANÁLISIS */}
                      <div className="flex justify-center mt-6">
                        <Button
                          onClick={() => setActiveTab('analisis')}
                          className="gradient-primary hover:opacity-90"
                          size="lg"
                        >
                          Ver Análisis Estratégico Completo
                          <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* PANEL 3: ANÁLISIS ESTRATÉGICO (AHORA TERCERO) */}
                <TabsContent value="analisis" className="mt-4">
                  <Card className="glass-effect border-purple-500/20">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white flex items-center">
                          📊 Análisis Estratégico Completo
                        </CardTitle>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(contentAnalisis || generatedContent);
                            toast({title: '✅ Análisis copiado'});
                          }}
                          variant="outline"
                          size="sm"
                          className="border-purple-500/20 hover:bg-purple-500/10"
                        >
                          <Clipboard className="w-4 h-4 mr-2" />
                          Copiar
                        </Button>
                      </div>
                      <CardDescription>
                        Incluye análisis inicial, variantes de títulos, justificaciones y KPIs
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-black/30 rounded-lg p-6 max-h-[600px] overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans">
                          {contentAnalisis || generatedContent}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* 🔄 BOTÓN MOVIDO - Ahora está después de Tendencias y Engagement */}
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
                📈 Tendencias del Tema (ViralCraft IA)
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
                <TrendingUp className="w-5 h-5 mr-2 text-pink-400"/>
                📊 Análisis de Engagement: {contentTopic || 'Tu Tema'}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Cómo está interactuando tu audiencia con este contenido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {youtubeEngagement ? (
                  <Doughnut
                    data={{
                      labels: ['Me Gusta', 'Comentarios', 'Compartidos', 'Guardados'],
                      datasets: [{
                        data: [
                          youtubeEngagement.likes || 0,
                          youtubeEngagement.comments || 0,
                          youtubeEngagement.shares || 0,
                          youtubeEngagement.saves || 0
                        ],
                        backgroundColor: [
                          'rgba(59, 130, 246, 0.8)', // Azul
                          'rgba(236, 72, 153, 0.8)', // Rosa
                          'rgba(34, 197, 94, 0.8)',  // Verde
                          'rgba(251, 146, 60, 0.8)'  // Naranja
                        ],
                        borderColor: [
                          'rgba(59, 130, 246, 1)',
                          'rgba(236, 72, 153, 1)',
                          'rgba(34, 197, 94, 1)',
                          'rgba(251, 146, 60, 1)'
                        ],
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '85%',
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#fff', padding: 15, font: { size: 11 } }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              return `${label}: ${value.toLocaleString()}`;
                            }
                          }
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <Youtube className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Analizando engagement de YouTube...</p>
                    <p className="text-xs mt-2">Datos simulados basados en tendencias del tema</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* 🆕 BOTÓN CONTINUAR A TU CRAFT VIRAL */}
      {generatedContent && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={() => {
              // Guardar datos en sessionStorage para el Dashboard
              sessionStorage.setItem('craftViralData', JSON.stringify({
                titles: realTitles,
                keywords: realKeywords,
                topic: contentTopic,
                theme: selectedTheme,
                style: selectedStyle,
                duration: selectedDuration,
                generatedContent: generatedContent
              }));
              // Navegar al Dashboard (Craft Viral)
              if (onSectionChange) {
                onSectionChange('dashboard');
              }
            }}
            className="gradient-primary hover:opacity-90 text-lg px-8 py-6"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Continuar a tu Craft Viral
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {/* 🆕 MODAL DE CONFIGURACIÓN DE PERSONALIDAD */}
      {showPersonalityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="glass-effect border-purple-500/20 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">Define tu Personalidad</CardTitle>
                    <CardDescription>Configura tu perfil para contenido personalizado con IA</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPersonalityModal(false)}
                  className="hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rol del Creador */}
              <div className="space-y-2">
                <Label htmlFor="creator-role" className="text-white text-lg font-semibold">
                  1. ¿Quién eres como creador?
                </Label>
                <select
                  id="creator-role"
                  value={creatorPersonality.role}
                  onChange={(e) => setCreatorPersonality({...creatorPersonality, role: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecciona tu rol...</option>
                  {creatorRoles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estilo de Presentación */}
              <div className="space-y-2">
                <Label htmlFor="presentation-style" className="text-white text-lg font-semibold">
                  2. ¿Cuál es tu estilo de presentación?
                </Label>
                <select
                  id="presentation-style"
                  value={creatorPersonality.style}
                  onChange={(e) => setCreatorPersonality({...creatorPersonality, style: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecciona tu estilo...</option>
                  {presentationStyles.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Audiencia */}
              <div className="space-y-2">
                <Label htmlFor="audience-type" className="text-white text-lg font-semibold">
                  3. ¿Cuál es tu público objetivo?
                </Label>
                <select
                  id="audience-type"
                  value={creatorPersonality.audience}
                  onChange={(e) => setCreatorPersonality({...creatorPersonality, audience: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecciona tu audiencia...</option>
                  {audienceTypes.map((audience) => (
                    <option key={audience.value} value={audience.value}>
                      {audience.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Objetivos del Contenido */}
              <div className="space-y-2">
                <Label htmlFor="content-goals" className="text-white text-lg font-semibold">
                  4. ¿Qué esperas lograr con tu contenido?
                </Label>
                <select
                  id="content-goals"
                  value={creatorPersonality.goals}
                  onChange={(e) => setCreatorPersonality({...creatorPersonality, goals: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecciona tu objetivo...</option>
                  {contentGoals.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resumen de Personalidad */}
              {creatorPersonality.role && creatorPersonality.style && creatorPersonality.audience && creatorPersonality.goals && (
                <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
                  <h4 className="text-white font-semibold mb-2 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                    Vista Previa de tu Perfil
                  </h4>
                  <p className="text-gray-300 text-sm">
                    Eres un <strong>{creatorRoles.find(r => r.value === creatorPersonality.role)?.label}</strong> con
                    estilo <strong>{presentationStyles.find(s => s.value === creatorPersonality.style)?.label.toLowerCase()}</strong>,
                    enfocado en <strong>{audienceTypes.find(a => a.value === creatorPersonality.audience)?.label}</strong>.
                    Tu objetivo principal es <strong>{contentGoals.find(g => g.value === creatorPersonality.goals)?.label.toLowerCase()}</strong>.
                  </p>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSavePersonality}
                  className="flex-1 gradient-primary hover:opacity-90"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Guardar Personalidad
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPersonalityModal(false)}
                  className="border-purple-500/20 hover:bg-purple-500/10"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🆕 MODAL GENERADOR DE HASHTAGS */}
      {showHashtagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="glass-effect border-green-500/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Hash className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">Generador de Hashtags</CardTitle>
                    <CardDescription>Encuentra hashtags optimizados para maximizar tu alcance</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHashtagModal(false)}
                  className="hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hashtag-topic">Tema o palabra clave</Label>
                  <Input
                    id="hashtag-topic"
                    placeholder="Ej: Marketing Digital, Fitness, Gaming..."
                    value={hashtagTopic}
                    onChange={(e) => setHashtagTopic(e.target.value)}
                    className="glass-effect border-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hashtag-platform">Plataforma</Label>
                  <select
                    id="hashtag-platform"
                    value={hashtagPlatform}
                    onChange={(e) => setHashtagPlatform(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-green-500/20 rounded-lg text-white focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Selecciona plataforma...</option>
                    <option value="Instagram">Instagram</option>
                    <option value="TikTok">TikTok</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Twitter">Twitter/X</option>
                    <option value="LinkedIn">LinkedIn</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerateHashtags}
                disabled={isGeneratingHashtags}
                className="w-full gradient-primary hover:opacity-90"
              >
                {isGeneratingHashtags ? (
                  <>
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando hashtags...
                  </>
                ) : (
                  <>
                    <Hash className="w-4 h-4 mr-2" />
                    Generar Hashtags
                  </>
                )}
              </Button>

              {generatedHashtags.length > 0 && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-white font-semibold text-lg">Hashtags Recomendados</h3>
                  <div className="space-y-2">
                    {generatedHashtags.map((hashtag, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-green-500/10 hover:border-green-500/30 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-green-400 font-bold">{index + 1}</span>
                          <span className="text-white font-medium">{hashtag.tag}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Volumen</div>
                            <div className="text-sm font-semibold text-white">{hashtag.volume}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">Score</div>
                            <div className="text-sm font-semibold text-green-400">{hashtag.score}</div>
                          </div>
                          {hashtag.trend === 'up' ? (
                            <ArrowUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <Minus className="w-4 h-4 text-gray-400" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              navigator.clipboard.writeText(hashtag.tag);
                              toast({ title: '✅ Hashtag copiado!' });
                            }}
                          >
                            <Clipboard className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-green-500/20 hover:bg-green-500/10"
                    onClick={() => {
                      const allTags = generatedHashtags.map(h => h.tag).join(' ');
                      navigator.clipboard.writeText(allTags);
                      toast({ title: '✅ Todos los hashtags copiados!' });
                    }}
                  >
                    <Clipboard className="w-4 h-4 mr-2" />
                    Copiar todos los hashtags
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🆕 MODAL ANALIZADOR DE TENDENCIAS */}
      {showTrendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <Card className="glass-effect border-orange-500/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">Analizador de Tendencias</CardTitle>
                    <CardDescription>Descubre qué contenido está funcionando en tu nicho</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTrendModal(false)}
                  className="hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trend-niche">Nicho o temática</Label>
                  <Input
                    id="trend-niche"
                    placeholder="Ej: Tecnología, Cocina, Viajes..."
                    value={trendNiche}
                    onChange={(e) => setTrendNiche(e.target.value)}
                    className="glass-effect border-orange-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trend-platform">Plataforma</Label>
                  <select
                    id="trend-platform"
                    value={trendPlatform}
                    onChange={(e) => setTrendPlatform(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-orange-500/20 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Selecciona plataforma...</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Twitter">Twitter/X</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleAnalyzeTrends}
                disabled={isAnalyzingTrends}
                className="w-full gradient-primary hover:opacity-90"
              >
                {isAnalyzingTrends ? (
                  <>
                    <BarChart2 className="w-4 h-4 mr-2 animate-spin" />
                    Analizando tendencias...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Analizar Tendencias
                  </>
                )}
              </Button>

              {trendResults && (
                <div className="space-y-6 pt-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-3 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-orange-400" />
                      Temas Más Populares
                    </h3>
                    <div className="space-y-2">
                      {trendResults.topTopics.map((topic, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                              <span className="text-orange-400 font-bold">{index + 1}</span>
                            </div>
                            <span className="text-white font-medium">{topic.topic}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-xs text-gray-400">Crecimiento</div>
                              <div className="text-sm font-semibold text-green-400">{topic.growth}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-400">Engagement</div>
                              <div className="text-sm font-semibold text-orange-400">{topic.engagement}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="glass-effect border-orange-500/10">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Mejores Horarios</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {trendResults.bestTimes.map((time, index) => (
                            <div key={index} className="flex items-center gap-2 text-gray-300">
                              <ChevronRight className="w-4 h-4 text-orange-400" />
                              <span className="text-sm">{time}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-effect border-orange-500/10">
                      <CardHeader>
                        <CardTitle className="text-white text-sm">Insight de Audiencia</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm">{trendResults.audienceInsight}</p>
                        <div className="mt-4 pt-4 border-t border-orange-500/10">
                          <div className="text-xs text-gray-400">Competidores activos</div>
                          <div className="text-2xl font-bold text-orange-400">{trendResults.competitorCount.toLocaleString()}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Tools;
