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
  AlertCircle,
  Lock,
  Crown,
  Star,
  CheckCircle2
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

// 💎 IMPORT DE SERVICIOS PREMIUM
import {
  generateSEOOptimizerCard,
  generateProStrategyCard
} from '@/services/premiumCardsService';

// 📋 IMPORT DE CONSTANTES
import {
  contentOptions,
  contentDurations,
  creatorRoles,
  presentationStyles,
  audienceTypes,
  contentGoals
} from '@/constants/toolsConstants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Tools = ({ onSectionChange, onAuthClick, onSubscriptionClick }) => {
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
  const [premiumCards, setPremiumCards] = useState([]);
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

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

  // 💎 FUNCIÓN FALLBACK PARA TARJETAS PREMIUM
  const getFallbackPremiumCards = useCallback((topic) => [
    {
      type: 'creation_kit',
      headline: `Kit Completo: Recursos de Producción para ${topic}`,
      value_proposition: 'Ahorra 2-3 horas de búsqueda. Todo listo para producir.',
      resources: [
        `Plantilla de título optimizada CTR para ${topic}`,
        'Paleta de colores profesional para miniaturas',
        '3 tracks de música libres de derechos seleccionados',
        'Timing perfecto de edición (hook, desarrollo, CTA)'
      ],
      premium_unlock: 'Descarga instantánea de plantillas editables + biblioteca de assets',
      isLocked: false,
      icon: '🎁'
    },
    {
      type: 'competitive_intelligence',
      headline: `Análisis de Ganchos Virales: ${topic}`,
      value_proposition: 'Basado en análisis de top 10 videos virales del nicho',
      insights: [
        'Patrón de hook que genera +50% retención',
        'Momento crítico donde el 80% abandona (evítalo)',
        'CTA que convierte 3x más que el promedio',
        'Error que cometen el 90% de creadores del nicho'
      ],
      premium_unlock: 'Informe completo con 15 insights + guion optimizado ready-to-use',
      isLocked: true,
      icon: '🧠'
    },
    {
      type: 'seo_optimizer',
      headline: `Optimizador SEO Premium: ${topic}`,
      value_proposition: '3 títulos de alto CTR + hashtags de nicho comprobados',
      optimized_titles: [
        `El SECRETO de ${topic} que NADIE te cuenta`,
        `${topic}: La VERDAD que cambiará tu perspectiva`,
        `Cómo ${topic} puede transformar tu contenido en 2025`
      ],
      niche_hashtags: ['#viralcontent', '#contentcreator', '#trending2025', `#${topic.replace(/\s+/g, '')}`],
      ctr_boost: '+25-40% más clics que títulos genéricos',
      premium_unlock: 'Análisis completo de 50 videos + generador de títulos IA personalizado',
      isLocked: true,
      icon: '🎯'
    },
    {
      type: 'pro_strategy',
      headline: `Estrategia Pro: Monetización ${topic}`,
      value_proposition: 'Protege tus ingresos + plan de acción para máximo ROI',
      financial_warnings: ['✅ Tema seguro para monetización estándar'],
      action_plan: [
        'Publica martes/miércoles 2-4 PM para máximo alcance',
        'Coloca CTA de suscripción en minuto 1:30',
        'Fija comentario con link a contenido exclusivo',
        'Diversifica ingresos con Patreon/membresías'
      ],
      revenue_protection: 'Consultoría valorada en $300 - evita pérdidas de $500+/mes',
      premium_unlock: 'Calendario completo de publicación + estrategia de diversificación de ingresos',
      isLocked: true,
      icon: '💰'
    }
  ], []);

  // 🆕 EFECTO PARA CARGAR 4 TARJETAS PREMIUM (SOLO 1ª LLAMA API, resto genérico)
  useEffect(() => {
    const loadPremiumCards = async () => {
      if (!contentTopic || !selectedTheme) return;

      setLoadingPremium(true);
      try {
        console.log('💎 Cargando tarjetas premium para:', contentTopic, selectedTheme);

        // Obtener el label del tema seleccionado
        const selectedThemeOption = contentOptions.find(opt => opt.value === selectedTheme);
        const themeLabel = selectedThemeOption?.label || selectedTheme;

        const fallbackCards = getFallbackPremiumCards(contentTopic);
        const cards = [];

        // ✅ TARJETA 1: Kit de Creación (Gemini) - DESBLOQUEADA - LLAMA API
        try {
          const geminiResponse = await generateThemeSEOSuggestions({
            themeValue: selectedTheme,
            themeLabel: themeLabel,
            topic: contentTopic
          });

          console.log('🎁 Respuesta Gemini (GRATIS):', geminiResponse);
          const geminiCards = JSON.parse(geminiResponse);

          if (Array.isArray(geminiCards) && geminiCards.length > 0) {
            cards.push({
              ...geminiCards[0],
              isLocked: false,
              icon: '🎁'
            });
          } else {
            cards.push(fallbackCards[0]);
          }
        } catch (error) {
          console.error('❌ Error cargando tarjeta gratis:', error);
          cards.push(fallbackCards[0]);
        }

        // 🔒 TARJETAS 2, 3, 4: BLOQUEADAS - SOLO FALLBACK (AHORRO DE TOKENS)
        console.log('🔒 Tarjetas bloqueadas: usando contenido genérico para ahorrar tokens');
        cards.push(fallbackCards[1]); // Inteligencia Competitiva
        cards.push(fallbackCards[2]); // Optimizador SEO
        cards.push(fallbackCards[3]); // Estrategia Pro

        console.log('✅ Total de tarjetas cargadas:', cards.length, '(1 API + 3 genéricas)');
        setPremiumCards(cards);

      } catch (error) {
        console.error('❌ Error general cargando tarjetas premium:', error);
        setPremiumCards(getFallbackPremiumCards(contentTopic));
      } finally {
        setLoadingPremium(false);
      }
    };

    // Debounce: esperar 1.5 segundos después de que el usuario deje de escribir
    const timeoutId = setTimeout(loadPremiumCards, 1500);
    return () => clearTimeout(timeoutId);
  }, [contentTopic, selectedTheme, youtubeEngagement]);

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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerateContent();
                }
              }}
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

      {/* 💎 TARJETAS PREMIUM CON SCROLL INFINITO - RECURSOS DE ALTO VALOR */}
      {premiumCards.length > 0 && (
        <div className="mt-12">
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30 mb-4">
              <span className="text-2xl">💎</span>
              <span className="text-sm font-semibold text-yellow-400">PREMIUM</span>
            </div>
            <h2 className="text-4xl font-bold text-gradient">
              Recursos Estratégicos de Alto Valor
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              Herramientas profesionales y análisis experto para <span className="text-white font-semibold">"{contentTopic}"</span>
            </p>
            <p className="text-sm text-gray-500">
              1 recurso desbloqueado | 3 recursos premium disponibles con suscripción
            </p>
          </div>

          <div className="relative overflow-hidden">
            {/* Contenedor con scroll horizontal automático infinito */}
            <div className="flex gap-6 pb-6 animate-scroll-infinite">
              {/* Triplicar tarjetas premium para efecto infinito suave */}
              {[...premiumCards, ...premiumCards, ...premiumCards].map((card, index) => (
                <div
                  key={`${card.type}-${index}`}
                  className="flex-shrink-0 w-[420px] snap-start"
                  onClick={() => card.isLocked && setShowPremiumModal(true)}
                >
                  <Card className={`glass-effect border-purple-500/20 h-full transition-all duration-300 relative overflow-hidden ${
                    card.isLocked
                      ? 'hover:scale-105 cursor-pointer hover:border-yellow-500/50'
                      : 'hover:scale-105 hover:border-purple-500/40'
                  }`}>

                    {/* 🔒 Overlay de bloqueo para tarjetas premium - 100% OSCURO */}
                    {card.isLocked && (
                      <div className="absolute inset-0 bg-black z-10 flex items-center justify-center">
                        <div className="text-center space-y-3">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-glow-pink animate-pulse-glow">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                          <div className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30">
                            <span className="text-sm font-bold text-yellow-400">🔓 CONTENIDO PREMIUM</span>
                          </div>
                          <p className="text-xs text-gray-300 px-4">
                            Haz clic para desbloquear
                          </p>
                        </div>
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-2xl">
                            {card.icon || '💎'}
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg leading-tight">
                              {card.headline}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1 text-yellow-400">
                              {card.value_proposition}
                            </CardDescription>
                          </div>
                        </div>
                        {!card.isLocked && (
                          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                            ✓ GRATIS
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* TARJETA 1: Kit de Creación */}
                      {card.type === 'creation_kit' && card.resources && (
                        <div className="space-y-3">
                          {card.resources.map((resource, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-5 h-5 bg-purple-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs text-purple-400">✓</span>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">{resource}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TARJETA 2: Inteligencia Competitiva */}
                      {card.type === 'competitive_intelligence' && card.insights && (
                        <div className="space-y-3">
                          {card.insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className="w-5 h-5 bg-yellow-500/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs text-yellow-400">💡</span>
                              </div>
                              <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* TARJETA 3: Optimizador SEO */}
                      {card.type === 'seo_optimizer' && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-semibold text-purple-400 mb-2">📝 Títulos Optimizados:</h4>
                            {card.optimized_titles && card.optimized_titles.map((title, idx) => (
                              <p key={idx} className="text-gray-300 text-sm mb-1.5 pl-3 border-l-2 border-purple-500/30">
                                {title}
                              </p>
                            ))}
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-purple-400 mb-2">#️⃣ Hashtags de Nicho:</h4>
                            <div className="flex flex-wrap gap-2">
                              {card.niche_hashtags && card.niche_hashtags.slice(0, 5).map((tag, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          {card.ctr_boost && (
                            <div className="flex items-center gap-2 text-xs text-green-400 pt-2 border-t border-purple-500/20">
                              <TrendingUp className="w-4 h-4" />
                              <span>{card.ctr_boost}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* TARJETA 4: Estrategia Pro */}
                      {card.type === 'pro_strategy' && (
                        <div className="space-y-4">
                          {card.financial_warnings && card.financial_warnings.length > 0 && (
                            <div className="space-y-2">
                              {card.financial_warnings.map((warning, idx) => (
                                <div key={idx} className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                                  {warning}
                                </div>
                              ))}
                            </div>
                          )}
                          <div>
                            <h4 className="text-xs font-semibold text-purple-400 mb-2">🎯 Plan de Acción:</h4>
                            {card.action_plan && card.action_plan.map((action, idx) => (
                              <div key={idx} className="flex items-start gap-2 mb-2">
                                <span className="text-xs text-green-400 mt-0.5">►</span>
                                <p className="text-gray-300 text-sm">{action}</p>
                              </div>
                            ))}
                          </div>
                          {card.revenue_protection && (
                            <div className="flex items-center gap-2 text-xs text-green-400 pt-2 border-t border-purple-500/20">
                              <span className="font-semibold">💰 {card.revenue_protection}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Premium Unlock Badge */}
                      {card.premium_unlock && (
                        <div className="pt-4 border-t border-purple-500/20">
                          <div className="flex items-start gap-2">
                            <Lock className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-400 leading-relaxed">
                              <span className="text-yellow-400 font-semibold">Premium:</span> {card.premium_unlock}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Gradientes laterales para efecto fade */}
            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-[#0a0a0f] to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#0a0a0f] to-transparent pointer-events-none"></div>
          </div>

          {/* Indicador de carga */}
          {loadingPremium && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full border border-purple-500/20">
                <RotateCw className="w-4 h-4 animate-spin text-purple-400" />
                <span className="text-sm text-purple-400">Generando recursos premium para "{contentTopic}"...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 💎 MODAL PREMIUM - Pequeño y Sutil */}
      {showPremiumModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowPremiumModal(false)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-xl max-w-md w-full max-h-[90vh] border border-yellow-500/30 shadow-xl overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header compacto */}
            <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">
                  Desbloquea Premium
                </h2>
              </div>
              <p className="text-white/90 text-xs">
                Acceso completo a todas las herramientas profesionales
              </p>

              {/* Botón cerrar */}
              <button
                onClick={() => setShowPremiumModal(false)}
                className="absolute top-2 right-2 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Contenido compacto */}
            <div className="p-5 space-y-4">
              {/* Beneficios resumidos */}
              <div className="space-y-2">
                {[
                  { text: 'Generador de contenido viral', detail: '20 peticiones/día' },
                  { text: 'Personalización de narración/guion', detail: '✨ NUEVO' },
                  { text: 'Auditoría de contenido', detail: null },
                  { text: 'Dashboard interactivo', detail: '20 consultas/día' },
                  { text: 'Alertas de tendencias', detail: null },
                  { text: '10 palabras clave por petición', detail: null },
                  { text: 'Mapa de oportunidades virales', detail: null },
                  { text: 'Evaluación de tono narrativo', detail: null },
                  { text: 'Indicadores de seguridad narrativa', detail: null },
                  { text: 'Sugerencia de disclaimers éticos', detail: null }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{benefit.text}</span>
                    </div>
                    {benefit.detail && (
                      <span className={`text-[10px] font-semibold whitespace-nowrap ${
                        benefit.detail === '✨ NUEVO' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {benefit.detail}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Pricing compacto */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-xs line-through">$20.00/mes</div>
                <div className="text-3xl font-bold text-gradient">$10.00</div>
                <div className="text-gray-300 text-xs mt-1">por mes</div>
                <div className="flex items-center justify-center gap-1 text-green-400 text-xs mt-2">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-semibold">Ahorra 50%</span>
                </div>
              </div>

              {/* CTA Buttons compactos */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 text-sm shadow-lg transition-all hover:scale-105"
                  onClick={() => {
                    toast({
                      title: "🚀 ¡Próximamente!",
                      description: "El sistema de suscripciones estará disponible muy pronto.",
                    });
                    setShowPremiumModal(false);
                  }}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Activar Premium
                </Button>

                <button
                  className="w-full text-xs text-gray-400 hover:text-gray-300 py-2 transition-colors"
                  onClick={() => setShowPremiumModal(false)}
                >
                  Continuar con plan gratuito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Tools;
