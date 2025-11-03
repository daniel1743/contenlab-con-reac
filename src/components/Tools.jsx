import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/components/ui/use-toast';
// Heroicons imports for professional iconography
import {
  SparklesIcon,
  PhotoIcon,
  HashtagIcon,
  HashtagIcon as Hash,
  BoltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingUpIcon as TrendingUp,
  ClipboardDocumentIcon,
  ClipboardDocumentIcon as Clipboard,
  TrashIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  ChartBarIcon as BarChart2,
  ArrowPathIcon,
  ArrowPathIcon as RotateCw,
  ArrowDownTrayIcon,
  UserIcon,
  UserIcon as User,
  XMarkIcon,
  XMarkIcon as X,
  ArrowUpIcon,
  ArrowUpIcon as ArrowUp,
  MinusIcon,
  MinusIcon as Minus,
  ChevronRightIcon,
  ChevronRightIcon as ChevronRight,
  ExclamationCircleIcon,
  LockClosedIcon,
  LockClosedIcon as Lock,
  TrophyIcon,
  TrophyIcon as Crown,
  StarIcon,
  CheckCircleIcon,
  CheckCircleIcon as CheckCircle2,
  Cog6ToothIcon,
  Cog6ToothIcon as Wand2,
  InformationCircleIcon,
  ChevronDownIcon,
  VideoCameraIcon,
  PlayCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleBottomCenterTextIcon as MessageCircle,
  PaperAirplaneIcon,
  PaperAirplaneIcon as Send,
  AcademicCapIcon,
  AcademicCapIcon as GraduationCap
} from '@heroicons/react/24/outline';

import {
  SparklesIcon as SparklesSolidIcon,
  SparklesIcon as Sparkles,
  BoltIcon as BoltSolidIcon
} from '@heroicons/react/24/solid';
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

// 🚀 IMPORT DE SERVICIOS CREOVISION AI GP-5
import {
  generateViralScript,
  generateSEOTitles,
  generateKeywords,
  generatePlatformSuggestions,
  generateTrends,
  generateThemeSEOSuggestions,
  analyzeTrendingTopic
} from '@/services/geminiService';

// 📊 IMPORT DE SERVICIOS YOUTUBE
import {
  getEngagementData,
  getWeeklyTrends,
  getWeeklyViralTrends
} from '@/services/youtubeService';

// 🎓 IMPORT DE ASESOR DE CONTENIDO
import { createContentAdvisor } from '@/services/contentAdvisorService';

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

const Tools = ({ onSectionChange, onAuthClick, onSubscriptionClick, isDemoUser = false }) => {
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

  // 🆕 PERSONALIZACIÓN AVANZADA - Estados
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [advancedSettings, setAdvancedSettings] = useState(() => {
    // Smart defaults desde creatorProfile
    const profile = localStorage.getItem('creatorProfile');
    if (profile) {
      const data = JSON.parse(profile);
      return {
        emotionalObjective: data.primaryGoal === 'Educar' ? 'Confianza' :
                           data.primaryGoal === 'Inspirar' ? 'Inspiración' :
                           data.primaryGoal === 'Entretener' ? 'Humor' : '',
        depthLevel: data.contentFrequency === 'Diario' ? 'Superficial (Viral)' : 'Profundo',
        audienceType: data.targetAudience || '',
        narrativeStyle: data.narrativeStructure || data.toneStyle || '',
        brandValues: data.uniqueSlogan || '',
        usageContext: 'Redes sociales'
      };
    }
    return {
      emotionalObjective: '',
      depthLevel: '',
      audienceType: '',
      narrativeStyle: '',
      brandValues: '',
      usageContext: ''
    };
  });
  const [isUsingProfile, setIsUsingProfile] = useState(() => {
    return !!localStorage.getItem('creatorProfile');
  });

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
    // Prioridad 1: Cargar perfil completo del onboarding
    const fullProfile = localStorage.getItem('creatorProfile');
    if (fullProfile) {
      try {
        const profile = JSON.parse(fullProfile);
        return {
          role: profile.role || '',
          style: profile.toneStyle || profile.style || '',
          audience: profile.targetAudience || profile.audience || '',
          goals: profile.primaryGoal || profile.goals || '',
          // Campos adicionales del onboarding completo
          name: profile.name || '',
          channelName: profile.channelName || '',
          uniqueSlogan: profile.uniqueSlogan || '',
          narrativeStructure: profile.narrativeStructure || '',
          audienceInterests: profile.audienceInterests || '',
          contentFrequency: profile.contentFrequency || ''
        };
      } catch (error) {
        console.error('Error parsing creatorProfile:', error);
      }
    }

    // Prioridad 2: Cargar perfil simple (legacy)
    const saved = localStorage.getItem('creatorPersonality');
    if (saved) {
      return JSON.parse(saved);
    }

    // Default vacío
    return {
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
  const [trendResults, setTrendResults] = useState(null);
  const [isAnalyzingTrends, setIsAnalyzingTrends] = useState(false);

  // 🎓 ESTADOS PARA ASESOR DE CONTENIDO
  const [activeAdvisor, setActiveAdvisor] = useState(null); // Índice del video activo
  const [advisorInstance, setAdvisorInstance] = useState(null); // Instancia del asesor
  const [advisorMessages, setAdvisorMessages] = useState([]); // Historial de mensajes
  const [isAdvisorThinking, setIsAdvisorThinking] = useState(false);
  const [userInput, setUserInput] = useState('');

  const { toast } = useToast();
  const { user } = useAuth();
  const isFreePlan = isDemoUser;
  const guardCooldownRef = useRef(0);

  const guardProtectedAction = useCallback((context = 'esta acción') => {
    if (user) {
      return false;
    }
    const now = Date.now();
    if (now - guardCooldownRef.current > 1500) {
      toast({
        title: 'Función disponible en planes Pro',
        description: 'Suscríbete para copiar, descargar o exportar tus recursos ilimitados.',
        variant: 'destructive'
      });
      guardCooldownRef.current = now;
    }
    onSubscriptionClick?.();
    return true;
  }, [user, onSubscriptionClick, toast]);

  useEffect(() => {
    if (!isDemoUser || user) {
      return;
    }

    const handleCopyEvent = (event) => {
      event.preventDefault();
      guardProtectedAction('copiar contenido');
    };

    const handleKeyDown = (event) => {
      const key = event.key?.toLowerCase();
      if (event.key === 'PrintScreen' || (event.ctrlKey && ['c', 's', 'p'].includes(key))) {
        event.preventDefault();
        guardProtectedAction('acciones premium');
      }
    };

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        guardProtectedAction('seleccionar contenido');
      }
    };

    document.addEventListener('copy', handleCopyEvent);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('copy', handleCopyEvent);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDemoUser, user, guardProtectedAction]);

  const handleThemeChange = useCallback((value) => {
    setSelectedTheme(value);
    setSelectedStyle(''); // Reset style when theme changes
  }, []);

  const handleDurationChange = useCallback(
    (value) => {
      const durationOption = contentDurations.find((duration) => duration.value === value);
      if (isFreePlan && durationOption?.requiresPro) {
        guardProtectedAction('formatos premium');
        return;
      }
      setSelectedDuration(value);
    },
    [isFreePlan, guardProtectedAction, contentDurations]
  );

  const handleToggleAdvancedSettings = useCallback(() => {
    if (isFreePlan) {
      guardProtectedAction('personalizacion avanzada');
      return;
    }
    setShowAdvancedSettings((prev) => !prev);
  }, [isFreePlan, guardProtectedAction]);

  useEffect(() => {
    if (!isFreePlan) {
      return;
    }
    const durationOption = contentDurations.find((duration) => duration.value === selectedDuration);
    if (durationOption?.requiresPro) {
      setSelectedDuration('');
    }
  }, [isFreePlan, selectedDuration, contentDurations]);

  useEffect(() => {
    if (isFreePlan && showAdvancedSettings) {
      setShowAdvancedSettings(false);
    }
  }, [isFreePlan, showAdvancedSettings]);

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

        // ✅ TARJETA 1: Kit de Creación (CreoVision AI GP-5) - DESBLOQUEADA - LLAMA API
        try {
          const aiResponse = await generateThemeSEOSuggestions({
            themeValue: selectedTheme,
            themeLabel: themeLabel,
            topic: contentTopic
          });

          console.log('🎁 CreoVision AI GP-5 generó tu contenido:', aiResponse);
          const aiCards = JSON.parse(aiResponse);

          if (Array.isArray(aiCards) && aiCards.length > 0) {
            cards.push({
              ...aiCards[0],
              isLocked: false,
              icon: '🎁'
            });
          } else {
            cards.push(fallbackCards[0]);
          }
        } catch (error) {
          console.error('❌ Error generando contenido:', error);
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

  if (guardProtectedAction('copiar contenido')) {
    return;
  }

  navigator.clipboard.writeText(generatedContent);
  toast({ title: '¡Copiado!', description: 'Contenido copiado al portapapeles' });
}, [generatedContent, toast, guardProtectedAction]);


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

  if (guardProtectedAction('descargar contenido')) {
    return;
  }

  const element = document.createElement('a');
  const file = new Blob([generatedContent], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = `creovision-script-${Date.now()}.txt`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  toast({ title: '¡Descargado!', description: 'Contenido descargado correctamente.' });
}, [generatedContent, toast, guardProtectedAction]);

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
      title: '🚀 CreoVision está trabajando para ti',
      description: 'Espera un momento... Nuestro editor senior está analizando tu temática y creando el mejor ángulo narrativo posible.',
      duration: 4000,
    });

    try {
      // 🎯 LLAMADA A CREOVISION AI GP-5 CON PERSONALIDAD DEL CREADOR
      console.log('🤖 CreoVision AI GP-5 está trabajando para ti...');
      console.log('🎭 Personalidad del creador:', creatorPersonality.role ? 'Configurada' : 'No configurada');

      // 🆕 Construir perfil enriquecido con settings avanzados
      const enrichedProfile = creatorPersonality.role ? {
        ...creatorPersonality,
        // Smart defaults aplicados automáticamente
        emotionalObjective: advancedSettings.emotionalObjective,
        depthLevel: advancedSettings.depthLevel,
        specificAudience: advancedSettings.audienceType || creatorPersonality.audience,
        narrativePreference: advancedSettings.narrativeStyle || creatorPersonality.style,
        coreValues: advancedSettings.brandValues,
        contentContext: advancedSettings.usageContext
      } : null;

      const generatedScript = await generateViralScript(
        selectedTheme,
        selectedStyle,
        selectedDuration,
        contentTopic,
        enrichedProfile
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
        title: '✨ CreoVision está creando tu guión profesional',
        description: creatorPersonality.role
          ? 'Adaptando el contenido a tu estilo único y audiencia. En breve recibirás un análisis estratégico completo...'
          : 'Nuestro motor de IA está diseñando tu contenido premium. Prepárate para recibir algo grandioso...',
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
          title: '✅ ¡Tu contenido premium está listo!',
          description: 'CreoVision ha terminado. Revisa los 3 paneles profesionales y continúa al Panel CreoVision cuando estés listo.',
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
        description: 'CreoVision encontró un problema al generar tu contenido. Estamos usando un ejemplo mientras lo solucionamos.',
        variant: 'destructive'
      });
      
      // Fallback al contenido mock
      const fallbackContent = `## Error - Contenido de ejemplo para: ${contentTopic}

**Nota**: Nuestros agentes de IA están sobrecargados. Intenta nuevamente.

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
  }, [contentTopic, selectedTheme, selectedStyle, selectedDuration, creatorPersonality, advancedSettings, toast, user]);

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

  // 🆕 ANALIZADOR DE TENDENCIAS - Powered by CreoVision AI GP-5
  const handleAnalyzeTrends = useCallback(async () => {
    setIsAnalyzingTrends(true);
    try {
      // 🎯 Obtener los 5 videos más virales de la última semana desde YouTube
      const viralVideos = await getWeeklyViralTrends();

      if (!viralVideos || viralVideos.length === 0) {
        toast({
          title: '⚠️ Sin tendencias',
          description: 'No se encontraron tendencias virales esta semana.',
          variant: 'destructive'
        });
        return;
      }

      // 🤖 Analizar cada video con CreoVision AI GP-5 en paralelo
      const analysisPromises = viralVideos.map(video => analyzeTrendingTopic(video));
      const analyses = await Promise.all(analysisPromises);

      // 📊 Formatear resultados para el UI
      const formattedTrends = {
        videos: viralVideos.map((video, index) => ({
          ...video,
          aiAnalysis: analyses[index]
        })),
        summary: `Se encontraron ${viralVideos.length} tendencias virales de los últimos 7 días`,
        totalViews: viralVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0),
        avgEngagement: (viralVideos.reduce((sum, v) => sum + (v.engagementRate || 0), 0) / viralVideos.length).toFixed(2)
      };

      setTrendResults(formattedTrends);
      toast({
        title: '🎯 Análisis completado',
        description: `${viralVideos.length} tendencias analizadas con CreoVision AI GP-5`
      });
    } catch (error) {
      console.error('Error analyzing trends:', error);
      toast({
        title: '❌ Error',
        description: error.message || 'No se pudo analizar las tendencias',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzingTrends(false);
    }
  }, [toast]);

  // 🎓 FUNCIONES PARA EL ASESOR DE CONTENIDO
  const handleOpenAdvisor = useCallback(async (videoIndex, video) => {
    setActiveAdvisor(videoIndex);
    setIsAdvisorThinking(true);
    setAdvisorMessages([]);

    try {
      // Crear nueva instancia del asesor
      const advisor = createContentAdvisor(video);
      setAdvisorInstance(advisor);

      // Obtener el primer mensaje del asesor
      const response = await advisor.startConversation();

      setAdvisorMessages([{
        role: 'advisor',
        content: response.message,
        timestamp: new Date(),
        progress: response.interactionCount
      }]);

    } catch (error) {
      console.error('Error iniciando asesor:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo iniciar el asesor de contenido',
        variant: 'destructive'
      });
      setActiveAdvisor(null);
    } finally {
      setIsAdvisorThinking(false);
    }
  }, [toast]);

  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim() || !advisorInstance) return;

    const messageText = userInput.trim();
    setUserInput('');

    // Agregar mensaje del usuario
    setAdvisorMessages(prev => [...prev, {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    }]);

    setIsAdvisorThinking(true);

    try {
      const response = await advisorInstance.sendMessage(messageText);

      setAdvisorMessages(prev => [...prev, {
        role: 'advisor',
        content: response.message,
        timestamp: new Date(),
        progress: response.interactionCount,
        isComplete: response.isComplete
      }]);

      if (response.isComplete) {
        toast({
          title: '✅ Sesión completada',
          description: 'Has recibido un plan de acción completo'
        });
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive'
      });
    } finally {
      setIsAdvisorThinking(false);
    }
  }, [userInput, advisorInstance, toast]);

  const handleCloseAdvisor = useCallback(() => {
    setActiveAdvisor(null);
    setAdvisorInstance(null);
    setAdvisorMessages([]);
    setUserInput('');
  }, []);

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

  // 🔒 Estado para verificar si la personalidad está completa
  const [showLockedModal, setShowLockedModal] = useState(false);
  const isPersonalityComplete = creatorPersonality.role && creatorPersonality.style && creatorPersonality.audience && creatorPersonality.goals;

  // 🔒 Función para manejar click en herramientas bloqueadas
  const handleLockedToolClick = useCallback(() => {
    setShowLockedModal(true);
  }, []);

  const tools = [
    {
      id: 'personality-setup',
      title: 'Define tu Personalidad',
      description: 'Configura tu rol, estilo, audiencia y objetivos para contenido personalizado',
      icon: UserIcon,
      color: 'from-blue-500 to-cyan-500',
      action: () => setShowPersonalityModal(true),
      requiresPersonality: false
    },
    {
      id: 'ai-content',
      title: 'Generador de Contenido IA',
      description: 'Crea contenido premium optimizado para cada plataforma',
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-500',
      action: () => {},
      requiresPersonality: true
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
      id: 'hashtag-generator',
      title: 'Generador de Hashtags',
      description: 'Encuentra hashtags trending para maximizar alcance',
      icon: HashtagIcon,
      color: 'from-green-500 to-blue-500',
      action: () => setShowHashtagModal(true),
      requiresPersonality: true
    },
    {
      id: 'trend-analyzer',
      title: 'Analizador de Tendencias',
      description: 'Descubre qué contenido está funcionando en tu nicho',
      icon: ArrowTrendingUpIcon,
      color: 'from-orange-500 to-red-500',
      action: () => setShowTrendModal(true),
      requiresPersonality: true
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
          Suite completa de herramientas impulsadas por IA para crear contenido premium
        </p>
      </div>

      {/* Grid de herramientas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isLocked = tool.requiresPersonality && !isPersonalityComplete;

          return (
            <div key={tool.id} className="relative">
              <Card
                className={`glass-effect border-purple-500/20 hover:shadow-glow transition-all duration-300 cursor-pointer h-full ${
                  isLocked ? 'opacity-40 blur-[2px] pointer-events-none' : ''
                }`}
                onClick={isLocked ? undefined : tool.action}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white text-lg">{tool.title}</CardTitle>
                  <CardDescription className="text-gray-400">{tool.description}</CardDescription>
                </CardHeader>
              </Card>

              {/* Overlay de bloqueo */}
              {isLocked && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                  onClick={handleLockedToolClick}
                >
                  <div className="bg-gradient-to-br from-purple-600/90 to-blue-600/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/20 transform hover:scale-105 transition-transform">
                    <Lock className="w-8 h-8 text-white mx-auto mb-2" />
                    <p className="text-white text-sm font-semibold">Bloqueado</p>
                  </div>
                </div>
              )}
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
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecciona duracion</option>
                {contentDurations.map((duration) => (
                  <option
                    key={duration.value}
                    value={duration.value}
                    disabled={isFreePlan && duration.requiresPro}
                  >
                    {isFreePlan && duration.requiresPro ? `${duration.label} (Solo Pro)` : duration.label}
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

          {/* 🆕 BADGE: PERFIL ACTIVO O BOTÓN DE PERSONALIZACIÓN */}
          {isUsingProfile ? (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">
                  Usando tu perfil de creador
                </span>
                <span className="text-xs text-gray-400">
                  (Estilo, audiencia y valores aplicados automáticamente)
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleToggleAdvancedSettings}
                aria-disabled={isFreePlan}
                className={`text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 ${isFreePlan ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Cog6ToothIcon className="w-4 h-4 mr-2 stroke-[2]" />
                {showAdvancedSettings ? 'Ocultar' : isFreePlan ? 'Personalizar (Solo Pro)' : 'Personalizar'}
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleAdvancedSettings}
                aria-disabled={isFreePlan}
                className={`border-purple-500/30 text-purple-400 hover:bg-purple-500/10 ${isFreePlan ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Cog6ToothIcon className="w-4 h-4 mr-2 stroke-[2]" />
                {showAdvancedSettings ? 'Ocultar Ajustes Avanzados' : isFreePlan ? 'Personalizacion Avanzada (Solo Pro)' : 'Personalizacion Avanzada (Opcional)'}
              </Button>
            </div>
          )}

          {/* 🆕 PANEL COLAPSABLE: PERSONALIZACIÓN AVANZADA */}
          {showAdvancedSettings && (
            <div className="space-y-4 p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <SparklesSolidIcon className="w-5 h-5 text-purple-400" />
                  Personalización Avanzada
                </h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Ajusta estos parámetros para afinar el contenido. Los valores están pre-llenados desde tu perfil.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Objetivo Emocional */}
                <div className="space-y-2">
                  <Label htmlFor="emotional-objective" className="text-sm text-gray-300">
                    💡 Objetivo Emocional
                  </Label>
                  <select
                    id="emotional-objective"
                    value={advancedSettings.emotionalObjective}
                    onChange={(e) => setAdvancedSettings({...advancedSettings, emotionalObjective: e.target.value})}
                    className="w-full p-2.5 bg-gray-800/50 border border-purple-500/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Empatía">Empatía (Conectar emocionalmente)</option>
                    <option value="Inspiración">Inspiración (Motivar a la acción)</option>
                    <option value="Urgencia">Urgencia (FOMO, actuar ahora)</option>
                    <option value="Confianza">Confianza (Autoridad y credibilidad)</option>
                    <option value="Humor">Humor (Entretenimiento ligero)</option>
                    <option value="Curiosidad">Curiosidad (Intriga y misterio)</option>
                  </select>
                </div>

                {/* 2. Nivel de Profundidad */}
                <div className="space-y-2">
                  <Label htmlFor="depth-level" className="text-sm text-gray-300">
                    📊 Nivel de Profundidad
                  </Label>
                  <select
                    id="depth-level"
                    value={advancedSettings.depthLevel}
                    onChange={(e) => setAdvancedSettings({...advancedSettings, depthLevel: e.target.value})}
                    className="w-full p-2.5 bg-gray-800/50 border border-purple-500/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Superficial (Viral)">Superficial (Rápido, viral, TikTok)</option>
                    <option value="Moderado">Moderado (Equilibrado, Instagram/YouTube)</option>
                    <option value="Profundo">Profundo (Reflexivo, largo formato)</option>
                    <option value="Experto">Experto (Técnico, nicho específico)</option>
                  </select>
                </div>

                {/* 3. Tipo de Audiencia */}
                <div className="space-y-2">
                  <Label htmlFor="audience-type" className="text-sm text-gray-300">
                    👥 Tipo de Audiencia
                  </Label>
                  <Input
                    id="audience-type"
                    placeholder="Ej: Profesionales 25-35, Madres emprendedoras..."
                    value={advancedSettings.audienceType}
                    onChange={(e) => setAdvancedSettings({...advancedSettings, audienceType: e.target.value})}
                    className="bg-gray-800/50 border-purple-500/20 text-sm"
                  />
                </div>

                {/* 4. Estilo Narrativo */}
                <div className="space-y-2">
                  <Label htmlFor="narrative-style" className="text-sm text-gray-300">
                    📖 Estilo Narrativo
                  </Label>
                  <select
                    id="narrative-style"
                    value={advancedSettings.narrativeStyle}
                    onChange={(e) => setAdvancedSettings({...advancedSettings, narrativeStyle: e.target.value})}
                    className="w-full p-2.5 bg-gray-800/50 border border-purple-500/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Directo">Directo (Al grano, sin rodeos)</option>
                    <option value="Storytelling">Storytelling (Narrativa envolvente)</option>
                    <option value="Conversacional">Conversacional (Como hablar con amigo)</option>
                    <option value="Educativo">Educativo (Paso a paso, didáctico)</option>
                    <option value="Poético">Poético (Metáforas, lenguaje elevado)</option>
                  </select>
                </div>

                {/* 5. Valores de Marca */}
                <div className="space-y-2">
                  <Label htmlFor="brand-values" className="text-sm text-gray-300">
                    ⭐ Valores / Mensaje Central
                  </Label>
                  <Input
                    id="brand-values"
                    placeholder="Ej: Autenticidad, disciplina, libertad..."
                    value={advancedSettings.brandValues}
                    onChange={(e) => setAdvancedSettings({...advancedSettings, brandValues: e.target.value})}
                    className="bg-gray-800/50 border-purple-500/20 text-sm"
                  />
                </div>

                {/* 6. Contexto de Uso */}
                <div className="space-y-2">
                  <Label htmlFor="usage-context" className="text-sm text-gray-300">
                    📱 Contexto de Uso
                  </Label>
                  <select
                    id="usage-context"
                    value={advancedSettings.usageContext}
                    onChange={(e) => setAdvancedSettings({...advancedSettings, usageContext: e.target.value})}
                    className="w-full p-2.5 bg-gray-800/50 border border-purple-500/20 rounded-lg text-white text-sm focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Redes sociales">Redes sociales (Viral, corto)</option>
                    <option value="Blog/Artículo">Blog/Artículo (Largo formato, SEO)</option>
                    <option value="Email marketing">Email marketing (Persuasivo, CTA)</option>
                    <option value="Presentación">Presentación (Formal, estructurado)</option>
                    <option value="Podcast/Video">Podcast/Video (Conversacional, natural)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs text-gray-400">
                <InformationCircleIcon className="w-4 h-4 stroke-[2]" />
                <span>
                  Estos ajustes se combinan con tu perfil de creador para generar contenido ultra-personalizado
                </span>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3">
            {/* ✅ GENERADOR: Libre para todos */}
            <Button
              onClick={handleGenerateContent}
              disabled={isGenerating || !selectedTheme || !selectedStyle || !contentTopic}
              className="flex-1 gradient-primary hover:opacity-90 transition-opacity flex items-center justify-center text-sm sm:text-base px-3"
            >
              {isGenerating ? (
                <SparklesSolidIcon className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0 animate-spin" />
              ) : (
                <BoltSolidIcon className="w-4 h-4 mr-1 sm:mr-2 flex-shrink-0" />
              )}
              <span className="truncate">
                {isGenerating ? 'Creando guión...' : 'Generar Contenido'}
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
              <ArrowPathIcon className="w-4 h-4 mr-2 stroke-[2]" />
              Reproducir
            </Button>
          </div>

          {/* 🆕 ÁREA DE CONTENIDO GENERADO - 3 PANELES PROFESIONALES */}
          {generatedContent && (
            <div className="space-y-6 pt-4">
              {/* Tabs para las 3 versiones - REORDENADAS */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" id="content-tabs">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 glass-effect h-auto p-2">
                  <TabsTrigger value="limpio" className="text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap">
                    📝 <span className="hidden sm:inline">Guión Limpio (Text-to-Speech)</span><span className="sm:hidden">Guión Limpio</span>
                  </TabsTrigger>
                  <TabsTrigger value="sugerencias" className="text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap">
                    💡 <span className="hidden sm:inline">Sugerencias Prácticas</span><span className="sm:hidden">Sugerencias</span>
                  </TabsTrigger>
                  <TabsTrigger value="analisis" className="text-xs sm:text-sm whitespace-normal sm:whitespace-nowrap">
                    📊 <span className="hidden sm:inline">Análisis Estratégico</span><span className="sm:hidden">Análisis</span>
                  </TabsTrigger>
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
                              if (guardProtectedAction('copiar guión limpio')) {
                                return;
                              }
                              navigator.clipboard.writeText(contentLimpio);
                              toast({title: '✅ Guión copiado', description: 'Listo para pegar en tu app de text-to-speech'});
                            }}
                            variant="outline"
                            size="sm"
                            className="border-green-500/20 hover:bg-green-500/10"
                          >
                            <ClipboardDocumentIcon className="w-4 h-4 mr-2 stroke-[2]" />
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
                            <ArrowDownTrayIcon className="w-4 h-4 mr-2 stroke-[2]" />
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
                          <ChevronRightIcon className="w-5 h-5 ml-2 stroke-[2]" />
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
                            if (guardProtectedAction('copiar sugerencias prácticas')) {
                              return;
                            }
                            navigator.clipboard.writeText(contentSugerencias);
                            toast({title: '✅ Sugerencias copiadas'});
                          }}
                          variant="outline"
                          size="sm"
                          className="border-blue-500/20 hover:bg-blue-500/10"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4 mr-2 stroke-[2]" />
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
                          <ChevronRightIcon className="w-5 h-5 ml-2 stroke-[2]" />
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
                            if (guardProtectedAction('copiar análisis estratégico')) {
                              return;
                            }
                            navigator.clipboard.writeText(contentAnalisis || generatedContent);
                            toast({title: '✅ Análisis copiado'});
                          }}
                          variant="outline"
                          size="sm"
                          className="border-purple-500/20 hover:bg-purple-500/10"
                        >
                          <ClipboardDocumentIcon className="w-4 h-4 mr-2 stroke-[2]" />
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
                <ChartBarIcon className="w-5 h-5 mr-2 text-blue-400 stroke-[2]"/>
                📈 Tendencias del Tema (CreoVision IA)
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
                <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-pink-400 stroke-[2]"/>
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
                    <PlayCircleIcon className="w-16 h-16 mx-auto mb-4 opacity-50 stroke-[1.5]" />
                    <p className="text-sm">Analizando engagement de YouTube...</p>
                    <p className="text-xs mt-2">Datos simulados basados en tendencias del tema</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* 🆕 BOTÓN CONTINUAR AL PANEL CREOVISION */}
      {generatedContent && (
        <div className="flex justify-center pt-8">
          <Button
            onClick={() => {
              // Guardar datos en sessionStorage para el Dashboard
              sessionStorage.setItem('creovisionPanelData', JSON.stringify({
                titles: realTitles,
                keywords: realKeywords,
                topic: contentTopic,
                theme: selectedTheme,
                style: selectedStyle,
                duration: selectedDuration,
                generatedContent: generatedContent
              }));
              // Navegar al Dashboard (Panel CreoVision)
              if (onSectionChange) {
                onSectionChange('dashboard');
              }
            }}
            className="gradient-primary hover:opacity-90 text-lg px-8 py-6"
            size="lg"
          >
            <BoltSolidIcon className="w-5 h-5 mr-2" />
            Continuar a tu Panel CreoVision
            <ChevronRightIcon className="w-5 h-5 ml-2 stroke-[2]" />
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
                    <UserIcon className="w-6 h-6 text-white stroke-[2]" />
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
                              if (guardProtectedAction('copiar hashtag')) {
                                return;
                              }
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
                      if (guardProtectedAction('copiar lista de hashtags')) {
                        return;
                      }
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
                    <CardTitle className="text-white text-2xl">Analizador de Tendencias Viral</CardTitle>
                    <CardDescription className="text-gray-300 mt-2">
                      Powered by CreoVision AI
                    </CardDescription>
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
              {/* DESCRIPCIÓN MOTIVADORA */}
              <div className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-pink-500/10 rounded-lg border border-orange-500/20 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-white font-semibold text-lg">
                      Adelántate a las Tendencias del Momento
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Aquí aparecerán las <span className="text-orange-400 font-semibold">tendencias más recientes del boom</span>,
                      analizadas en tiempo real por la <span className="text-purple-400 font-semibold">potente IA de CreoVision</span>.
                    </p>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Nuestra tecnología de vanguardia te dará las herramientas para <span className="text-green-400 font-semibold">desplegar
                      y entender</span> estas nuevas tendencias, ayudándote a crear contenido que <span className="text-orange-400 font-semibold">destaque
                      antes que la competencia</span>.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400 font-medium">IA Avanzada</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        <span className="text-xs text-orange-400 font-medium">Análisis en Tiempo Real</span>
                      </div>
                      <span className="text-gray-600">•</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <span className="text-xs text-purple-400 font-medium">Asesoría Premium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAnalyzeTrends}
                disabled={isAnalyzingTrends}
                className="w-full gradient-primary hover:opacity-90 text-lg h-14"
              >
                {isAnalyzingTrends ? (
                  <>
                    <BarChart2 className="w-5 h-5 mr-3 animate-spin" />
                    Analizando tendencias con CreoVision AI...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-3" />
                    Descubrir Tendencias Virales Ahora
                  </>
                )}
              </Button>

              {trendResults && trendResults.videos && (
                <div className="space-y-6 pt-6">
                  {/* 📊 RESUMEN GENERAL */}
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                        <span className="text-white font-medium">{trendResults.summary}</span>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Vistas Totales</div>
                          <div className="text-lg font-bold text-orange-400">{trendResults.totalViews.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Engagement Promedio</div>
                          <div className="text-lg font-bold text-green-400">{trendResults.avgEngagement}%</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 🎯 TARJETAS DE VIDEOS VIRALES */}
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-orange-400" />
                      Tendencias Virales Analizadas por IA
                    </h3>
                    <div className="space-y-4">
                      {trendResults.videos.map((video, index) => (
                        <Card key={video.videoId || index} className="glass-effect border-orange-500/10 overflow-hidden">
                          <CardContent className="p-0">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                              {/* THUMBNAIL + STATS */}
                              <div className="lg:col-span-3 relative bg-black/40">
                                <img
                                  src={video.thumbnail}
                                  alt={video.title}
                                  className="w-full h-full object-cover min-h-[200px]"
                                />
                                <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                                  #{index + 1}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                      <div className="text-gray-400">Vistas</div>
                                      <div className="text-white font-semibold">{(video.viewCount || 0).toLocaleString()}</div>
                                    </div>
                                    <div>
                                      <div className="text-gray-400">Engagement</div>
                                      <div className="text-green-400 font-semibold">{video.engagementRate}%</div>
                                    </div>
                                    <div>
                                      <div className="text-gray-400">Virality</div>
                                      <div className="text-orange-400 font-semibold">{video.viralityScore?.toFixed(1) || 'N/A'}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* VIDEO INFO + AI ANALYSIS */}
                              <div className={`${activeAdvisor === index ? 'lg:col-span-5' : 'lg:col-span-9'} p-4 space-y-3 transition-all duration-300`}>
                                <div>
                                  <h4 className="text-white font-semibold text-base line-clamp-2 mb-2">{video.title}</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <VideoCameraIcon className="w-4 h-4" />
                                    <span>{video.channelTitle}</span>
                                    <span className="text-gray-600">•</span>
                                    <span>{new Date(video.publishedAt).toLocaleDateString('es-ES')}</span>
                                  </div>
                                </div>

                                {/* AI ANALYSIS BY CREOVISION */}
                                {video.aiAnalysis && (
                                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-purple-500/20">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        <span className="text-purple-300 font-medium text-sm">Análisis CreoVision AI</span>
                                      </div>
                                      <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                                        IA Avanzada
                                      </span>
                                    </div>
                                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                      {video.aiAnalysis}
                                    </p>
                                  </div>
                                )}

                                {/* ACTIONS */}
                                <div className="flex gap-2 pt-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs border-orange-500/20 hover:bg-orange-500/10"
                                    onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                                  >
                                    <PlayCircleIcon className="w-4 h-4 mr-1" />
                                    Ver Video
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs border-blue-500/20 hover:bg-blue-500/10"
                                    onClick={() => {
                                      navigator.clipboard.writeText(video.title);
                                      toast({ title: '📋 Copiado', description: 'Título copiado al portapapeles' });
                                    }}
                                  >
                                    <Clipboard className="w-4 h-4 mr-1" />
                                    Copiar Título
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                                    onClick={() => handleOpenAdvisor(index, video)}
                                    disabled={activeAdvisor === index}
                                  >
                                    <GraduationCap className="w-4 h-4 mr-1" />
                                    {activeAdvisor === index ? 'Chat Activo' : 'Consejos del Asesor'}
                                  </Button>
                                </div>
                              </div>

                              {/* 🎓 PANEL DE CHAT DEL ASESOR */}
                              {activeAdvisor === index && (
                                <div className="lg:col-span-4 border-l border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-pink-900/10 p-4 flex flex-col max-h-[600px]">
                                  {/* HEADER DEL CHAT */}
                                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-500/20">
                                    <div className="flex items-center gap-2">
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                        <div className="text-white font-semibold text-sm">CreoVision Advisor</div>
                                        <div className="text-xs text-purple-400">
                                          IA Premium • {advisorInstance?.getProgress().remaining || 0} mensajes restantes
                                        </div>
                                      </div>
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="hover:bg-white/10"
                                      onClick={handleCloseAdvisor}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>

                                  {/* MENSAJES DEL CHAT */}
                                  <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                                    {advisorMessages.map((msg, msgIndex) => (
                                      <div
                                        key={msgIndex}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                      >
                                        <div
                                          className={`max-w-[85%] rounded-lg p-3 ${
                                            msg.role === 'user'
                                              ? 'bg-blue-500/20 border border-blue-500/30'
                                              : 'bg-purple-500/20 border border-purple-500/30'
                                          }`}
                                        >
                                          <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                          </p>
                                          {msg.progress && (
                                            <div className="mt-2 pt-2 border-t border-purple-500/20">
                                              <div className="flex items-center justify-between text-xs text-gray-400">
                                                <span>Interacción {msg.progress}/6</span>
                                                <div className="flex gap-1">
                                                  {Array.from({ length: 6 }).map((_, i) => (
                                                    <div
                                                      key={i}
                                                      className={`w-2 h-2 rounded-full ${
                                                        i < msg.progress ? 'bg-purple-400' : 'bg-gray-600'
                                                      }`}
                                                    />
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}

                                    {isAdvisorThinking && (
                                      <div className="flex justify-start">
                                        <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3">
                                          <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-gray-400 text-xs">El asesor está pensando...</span>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* INPUT DEL CHAT */}
                                  <div className="border-t border-purple-500/20 pt-3">
                                    <div className="flex gap-2">
                                      <Input
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                          }
                                        }}
                                        placeholder="Escribe tu respuesta..."
                                        className="flex-1 bg-black/30 border-purple-500/20 text-white placeholder:text-gray-500"
                                        disabled={isAdvisorThinking || advisorMessages[advisorMessages.length - 1]?.isComplete}
                                      />
                                      <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={!userInput.trim() || isAdvisorThinking || advisorMessages[advisorMessages.length - 1]?.isComplete}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                                      >
                                        <Send className="w-4 h-4" />
                                      </Button>
                                    </div>
                                    {advisorMessages[advisorMessages.length - 1]?.isComplete && (
                                      <p className="text-xs text-gray-400 mt-2 text-center">
                                        ✅ Sesión completada. Cierra el chat para iniciar una nueva consulta.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
                  { text: 'Generador de contenido premium', detail: '20 peticiones/día' },
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

      {/* 🔒 MODAL DE HERRAMIENTA BLOQUEADA */}
      {showLockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="glass-effect border-purple-500/30 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50 animate-pulse">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-white text-2xl mb-2">
                Herramienta Bloqueada
              </CardTitle>
              <CardDescription className="text-gray-300 text-base leading-relaxed">
                Para acceder a esta herramienta, primero debes completar tu perfil de creador en{' '}
                <span className="text-blue-400 font-semibold">"Define tu Personalidad"</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-1">¿Por qué necesito definir mi personalidad?</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      Al conocer tu estilo, audiencia y objetivos, nuestras herramientas de IA generarán contenido 100% personalizado y más efectivo para tu marca.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  onClick={() => {
                    setShowLockedModal(false);
                    setShowPersonalityModal(true);
                  }}
                  className="w-full gradient-primary hover:opacity-90 text-base py-6 shadow-lg shadow-purple-500/30"
                >
                  <User className="w-5 h-5 mr-2" />
                  Definir mi Personalidad
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowLockedModal(false)}
                  className="w-full border-purple-500/30 hover:bg-purple-500/10 text-gray-300"
                >
                  Entendido, lo haré después
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Tools;
