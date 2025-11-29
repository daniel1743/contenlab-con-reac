/**
 * 📊 TENDENCIAS DE LA SEMANA
 * Muestra 5 tarjetas de cada fuente (YouTube, Twitter, News)
 * Muestra 6 tarjetas de Reddit
 * Primera tarjeta desbloqueada, las demás requieren 20 créditos cada una
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Lock,
  Unlock,
  TrendingUp,
  Youtube,
  Twitter,
  Newspaper,
  Sparkles,
  Eye,
  ThumbsUp,
  ExternalLink,
  RefreshCw,
  Crown,
  MessageCircle,
  Zap,
  MessageSquare
} from 'lucide-react';
import { getWeeklyTrends, unlockTrendCard, getUnlockedTrends } from '@/services/weeklyTrendsService';
import { consumeCredits, checkSufficientCredits } from '@/services/creditService';
import AIFeedbackWidget from '@/components/AIFeedbackWidget';
import { CREO_SYSTEM_PROMPT, CREO_CONTEXT_BUILDER, buildTrendAnalysisPrompts } from '@/config/creoPersonality';
import { getMemories, saveMemory, buildMemoryContext } from '@/services/memoryService';
import { getCachedAnalysis, saveAnalysisCache, extractAnalysisMetadata } from '@/services/analysisCacheService';
import TrendAnalysisLoader from './TrendAnalysisLoader';

const UNLOCK_COST = 20; // Créditos para desbloquear una tarjeta individual
const UNLOCK_ALL_COST_STANDARD = 80; // 4 tarjetas × 20 créditos (YouTube, Twitter, News)
const UNLOCK_ALL_COST_REDDIT = 100; // 5 tarjetas × 20 créditos (Reddit)

const WeeklyTrends = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [trends, setTrends] = useState({ youtube: [], twitter: [], news: [], reddit: [] });
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('youtube');
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [analysisType, setAnalysisType] = useState('full'); // 'full' o 'personalize'
  const [interactionId, setInteractionId] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [persistentMemories, setPersistentMemories] = useState([]);
  const [profileData, setProfileData] = useState(null);

  const displayName = useMemo(() => {
    const fullName = user?.user_metadata?.full_name?.trim();
    if (fullName) {
      return fullName.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'creador';
  }, [user]);

  // Cargar tendencias al montar el componente
  useEffect(() => {
    loadTrends();
  }, []);

  // Cargar tendencias desbloqueadas del usuario
  useEffect(() => {
    if (user) {
      loadUnlockedTrends();
      loadUserProfile();
      loadPersistentMemories();
    }
  }, [user]);

  // Cargar perfil del creador desde localStorage
  const loadUserProfile = () => {
    try {
      const raw = localStorage.getItem('creatorProfile');
      if (raw) {
        setProfileData(JSON.parse(raw));
      }
    } catch (error) {
      console.warn('[WeeklyTrends] Error loading creator profile', error);
    }
  };

  // Cargar memorias persistentes
  const loadPersistentMemories = async () => {
    try {
      // Verificar que tengamos un token válido
      if (!session?.access_token) {
        console.log('[WeeklyTrends] No hay token de sesión, saltando carga de memorias');
        setPersistentMemories([]);
        return;
      }

      const memories = await getMemories({
        limit: 8,
        authToken: session.access_token
      });

      // Validar que memories sea un array
      if (Array.isArray(memories)) {
        setPersistentMemories(memories);
        console.log(`[WeeklyTrends] 🧠 Cargadas ${memories.length} memorias`);
      } else {
        console.warn('[WeeklyTrends] Respuesta de memorias no es un array:', memories);
        setPersistentMemories([]);
      }
    } catch (error) {
      // Silenciar error si es de JSON parsing (API no disponible)
      if (error.message && error.message.includes('JSON')) {
        console.log('[WeeklyTrends] 💡 API de memorias no disponible, usando modo sin memorias');
      } else {
        console.warn('[WeeklyTrends] No se pudieron cargar memorias:', error.message);
      }
      // En caso de error, simplemente usar array vacío
      setPersistentMemories([]);
    }
  };

  const loadTrends = async (forceRefresh = false) => {
    try {
      setLoading(true);
      const data = await getWeeklyTrends(forceRefresh);
      setTrends(data);
      // Si se forzó la actualización, limpiar desbloqueos locales (solo quedarán los de la semana actual)
      if (forceRefresh && user) {
        await loadUnlockedTrends();
      }
    } catch (error) {
      console.error('Error loading trends:', error);
      toast({
        title: 'Error al cargar tendencias',
        description: 'No se pudieron cargar las tendencias. Intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const loadUnlockedTrends = async () => {
    try {
      const unlocked = await getUnlockedTrends(user.id);
      const ids = unlocked.map(u => u.trend_id);
      setUnlockedIds(ids);
    } catch (error) {
      console.error('Error loading unlocked trends:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Forzar actualización de tendencias (esto limpiará desbloqueos antiguos automáticamente)
      await loadTrends(true);
      // Recargar desbloqueos (solo los de la semana actual)
      if (user) {
        await loadUnlockedTrends();
      }
      toast({
        title: '✅ Tendencias actualizadas',
        description: 'Se cargaron las últimas tendencias de la semana. Solo la primera tarjeta queda desbloqueada.'
      });
    } catch (error) {
      console.error('Error refreshing trends:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar las tendencias.',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleAnalyzeWithAI = async (trend) => {
    console.log('🤖 handleAnalyzeWithAI called with trend:', trend);

    if (!user) {
      console.warn('❌ No user authenticated');
      toast({
        title: '🔒 Inicia sesión',
        description: 'Necesitas una cuenta para obtener análisis de Creo.',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ User authenticated, opening modal...');
    setSelectedTrend(trend);
    setAiModalOpen(true);
    setIsAiThinking(true);
    setAnalysisType('full'); // Indicar que es análisis completo por defecto
    setAiResponse('');

    // Determinar plataforma y nicho del usuario
    const userPlatform = profileData?.platform || 'YouTube';
    const userNiche = profileData?.niche || 'creación de contenido';
    const userStyle = profileData?.style || 'educativo';

    // 📦 PASO 1: Verificar si existe análisis cacheado
    const cachedAnalysis = await getCachedAnalysis(trend.id, selectedCategory, user.id);

    if (cachedAnalysis && cachedAnalysis.found) {
      console.log('📦 Usando análisis desde caché');

      if (cachedAnalysis.personalized) {
        // Análisis personalizado ya existe para este usuario
        console.log('✅ Análisis personalizado encontrado en caché');
        const personalizedData = cachedAnalysis.analysis;

        setAiResponse(personalizedData.analysis);
        setIsAiThinking(false);

        toast({
          title: '⚡ Análisis instantáneo',
          description: 'Cargado desde tu historial personal',
          duration: 2000
        });

        return; // No llamar a IA
      } else {
        // 🚀 OPTIMIZACIÓN: Existe análisis base → personalizar rápido (3s en lugar de 2min)
        console.log('⚡ Análisis base encontrado, personalizando SUPER RÁPIDO...');

        setAnalysisType('personalize'); // Indicar que es personalización rápida
        setIsAiThinking(true);

        toast({
          title: '⚡ Personalización rápida',
          description: 'Adaptando análisis a tu perfil en segundos...',
          duration: 3000
        });

        try {
          const authToken = session?.access_token || null;
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
            ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
            : '';

          const personalizationResponse = await fetch(`${apiBaseUrl}/api/ai/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken && { 'Authorization': `Bearer ${authToken}` })
            },
            body: JSON.stringify({
              action: 'personalize',
              baseAnalysis: cachedAnalysis.analysis?.analysis || cachedAnalysis.analysis,
              userName: displayName,
              channelName: userPlatform === 'YouTube' ? profileData?.youtubeChannel : null,
              userNiche,
              userPlatform,
              provider: 'qwen',
              messages: [] // Requerido pero no usado en modo personalize
            })
          });

          if (!personalizationResponse.ok) {
            throw new Error('Personalización falló, usando análisis completo...');
          }

          const personalizedData = await personalizationResponse.json();

          if (personalizedData.content) {
            console.log('✅ Personalización rápida completada en ~3 segundos');
            setAiResponse(personalizedData.content);
            setIsAiThinking(false);

            toast({
              title: '✅ Análisis personalizado',
              description: 'Adaptado a tu canal en tiempo récord',
              duration: 2000
            });

            // Guardar versión personalizada en cache para futuras consultas
            await saveAnalysisCache(
              trend.id,
              selectedCategory,
              user.id,
              personalizedData.content,
              true // personalized = true
            );

            return; // ¡Listo! No necesita análisis completo
          }
        } catch (personalizationError) {
          console.warn('⚠️ Personalización rápida falló, usando análisis completo:', personalizationError);
          // Si falla la personalización rápida, continuar con análisis completo abajo
        }
      }
    }

    // Si VITE_API_BASE_URL está definida, úsala; si no, usa URL relativa (funcionará en Vercel)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
      : '';
    const endpoint = `${apiBaseUrl}/api/ai/chat`;

    try {
      console.log('📡 CallingCreoVision GP-4 API via backend...');

      // Obtener token de autenticación si está disponible
      const authToken = session?.access_token || null;

      // 🚀 NUEVO SISTEMA: Construir prompts con el builder especializado
      const { systemPrompt: fullSystemPrompt, userPrompt } = buildTrendAnalysisPrompts({
        displayName,
        platform: userPlatform,
        niche: userNiche,
        style: userStyle,
        trend,
        category: selectedCategory,
        profileData,
        memories: persistentMemories,
        cachedAnalysis: cachedAnalysis && !cachedAnalysis.personalized ? cachedAnalysis : null
      });

      // Sistema de fallback: Qwen → DeepSeek
      let response;
      let provider = 'qwen';
      let model = 'qwen-plus';

      try {
        console.log('🚀 Generando análisis con CreoVision IA...');
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
          body: JSON.stringify({
            provider: 'qwen',
            model: 'qwen-turbo', // ← Modelo más rápido
            systemPrompt: fullSystemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            temperature: 0.7,
            maxTokens: 1200, // ← REDUCIDO: ~900 palabras (suficiente y 2x más rápido)
            feature_slug: 'weekly_trends_analysis',
            session_id: sessionId,
            capture_interaction: true
          })
        });

        if (!response.ok) throw new Error('Primera opción falló');
      } catch (firstError) {
        console.warn('⚠️ Reintentando con motor alternativo...', firstError);
        provider = 'deepseek';
        model = 'deepseek-chat';

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
          },
          body: JSON.stringify({
            provider: 'deepseek',
            model: 'deepseek-chat',
            systemPrompt: fullSystemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
            temperature: 0.7,
            maxTokens: 1200, // ← REDUCIDO para fallback también
            feature_slug: 'weekly_trends_analysis',
            session_id: sessionId,
            capture_interaction: true
          })
        });
      }

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response received:', data);
      console.log('🔍 Estructura completa de la respuesta:', JSON.stringify(data, null, 2));

      if (data.content) {
        console.log(`✅ Análisis recibido de ${provider.toUpperCase()}`);
        setAiResponse(data.content);

        // Mostrar toast de éxito indicando qué IA respondió
        toast({
          title: `✅ Análisis completado`,
          description: `Inteligencia estratégica generada por el Motor CreoVision GP-4`,
          duration: 3000
        });

        // Guardar interaction_id para el sistema de feedback
        console.log('🔍 Buscando interaction_id en respuesta...');
        if (data.interaction_id) {
          console.log('💾 Interaction ID guardado:', data.interaction_id);
          setInteractionId(data.interaction_id);
        } else {
          console.warn('⚠️ No se recibió interaction_id del servidor');
        }

        // 📦 PASO 2: Extraer metadata y guardar en caché
        const metadata = extractAnalysisMetadata(data.content);

        // Determinar si es análisis base (nuevo) o personalizado (adaptación)
        const isNewBaseAnalysis = !cachedAnalysis || !cachedAnalysis.found;

        try {
          await saveAnalysisCache({
            trendId: trend.id,
            trendType: selectedCategory,
            trendTitle: trend.title,
            trendUrl: trend.url || '#',
            baseAnalysis: isNewBaseAnalysis ? {
              content: data.content,
              provider: provider,
              model: model,
              timestamp: Date.now()
            } : cachedAnalysis.base_analysis,
            keywords: metadata.keywords.length > 0 ? metadata.keywords : null,
            hashtags: metadata.hashtags.length > 0 ? metadata.hashtags : null,
            viralityScore: metadata.viralityScore,
            saturationLevel: metadata.saturationLevel,
            userId: user.id,
            platform: userPlatform,
            niche: userNiche,
            style: userStyle,
            personalizedAnalysis: data.content
          });
          console.log('[WeeklyTrends] 📦 Análisis guardado en caché');
        } catch (cacheError) {
          console.warn('[WeeklyTrends] No se pudo guardar en caché:', cacheError);
        }

        // 💾 Guardar análisis como memoria contextual con más detalles
        try {
          await saveMemory({
            type: 'context',
            content: `Analicé la tendencia "${trend.title}" de ${selectedCategory.toUpperCase()}. Recibí un análisis SEO y estrategia personalizada para ${userPlatform} en el nicho de ${userNiche} con estilo ${userStyle}.`,
            metadata: {
              source: 'weekly_trends_analysis',
              trend_id: trend.id,
              trend_title: trend.title,
              category: selectedCategory,
              provider: provider,
              model: model,
              platform: userPlatform,
              niche: userNiche,
              style: userStyle,
              timestamp: Date.now(),
              has_url: !!trend.url && trend.url !== '#',
              cached: true,
              virality_score: metadata.viralityScore,
              saturation_level: metadata.saturationLevel
            },
            authToken
          });
          console.log('[WeeklyTrends] 💾 Análisis guardado en memoria con detalles completos');

          // Recargar memorias para futuras interacciones
          await loadPersistentMemories();
        } catch (memError) {
          console.warn('[WeeklyTrends] No se pudo guardar en memoria:', memError);
        }
      } else {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid response fromCreoVision GP-4');
      }
    } catch (error) {
      console.error('❌ Error calling DeepSeek:', error);
      console.log('🔄 Using fallback response');

      // Mostrar toast de advertencia
      toast({
        title: '⚠️ Usando análisis offline',
        description: 'No se pudo conectar con Creo. Mostrando análisis de respaldo.',
        variant: 'default'
      });

      // 🚀 Fallback response instructivo según nuevo formato
      const safeTitle = typeof trend?.title === 'string' && trend.title.trim().length > 0
        ? trend.title
        : 'Tendencia seleccionada';
      const titleWords = safeTitle.split(' ').filter(Boolean);

      setAiResponse(`---
## 📌 TENDENCIA DESBLOQUEADA

**"${safeTitle}"** (Fuente: ${selectedCategory.toUpperCase()})

Desbloqueaste esta tendencia específica de ${selectedCategory.toUpperCase()}. Es relevante para tu nicho de **${userNiche}** en **${userPlatform}** porque está captando atención AHORA y aún no está saturada en tu tipo de contenido.

---
## 🎯 ANÁLISIS PARA ${displayName} (${userPlatform} • ${userNiche} • ${userStyle})

**Por qué funciona AHORA:**
Esta tendencia aprovecha un momento de alta búsqueda en ${selectedCategory.toUpperCase()}. El algoritmo de ${userPlatform} está priorizando contenido relacionado con este tema. Ventana de oportunidad: 48-72h antes de saturación.

**Nivel de saturación:** Media-baja en ${userPlatform} para ${userNiche}
**Ventana de acción:** 48-72h antes de que se masifique
**Potencial viral:** 7/10 - Alto engagement en ${selectedCategory.toUpperCase()}, adaptable a ${userPlatform}

---
## 🔍 ANÁLISIS SEO Y KEYWORDS

**Keywords principales:**
- ${titleWords.slice(0, 3).join(' ') || safeTitle} - Alta prioridad
- ${userNiche} ${titleWords[0] || safeTitle} - Media prioridad
- ${userPlatform} ${titleWords[1] || titleWords[0] || safeTitle} - Complementaria

**Hashtags estratégicos:**
${trend?.tag || `#${userNiche.replace(/\s+/g, '')} #${selectedCategory} #ContenidoViral #${userPlatform}`}

**Long-tail keywords:**
"cómo ${safeTitle.toLowerCase()}", "${safeTitle.toLowerCase()} tutorial", "${safeTitle.toLowerCase()} para ${userNiche}"

---
## 🎬 ADAPTACIÓN A TU ESTILO "${userStyle}"

**ELIMINA de la tendencia original:**
• Elementos genéricos que no reflejan tu tono ${userStyle}
• Información superficial que tu audiencia de ${userNiche} ya conoce

**AGREGA tu perspectiva única:**
• Tu experiencia específica en ${userNiche}
• Datos, ejemplos o casos reales de tu trabajo
• Un ángulo inesperado que conecte con los intereses de tu audiencia en ${userPlatform}

**Formato óptimo para ${userPlatform}:**
- Duración: ${userPlatform === 'YouTube' ? '8-12 minutos (long-form)' : userPlatform === 'TikTok' ? '45-60 segundos (short-form)' : '60-90 segundos (short-medium)'}
- Estructura: Hook (3s) → Desarrollo con valor → CTA claro
- Hook perfecto: Abre con una pregunta o cifra impactante relacionada con "${safeTitle}"

---
## 📈 PLAN DE EJECUCIÓN (PRÓXIMAS 72H)

**Paso 1 (Hoy):**
Graba tu versión en las próximas 24h. Usa el formato ${userPlatform === 'YouTube' ? '8-12 min' : '45-60s'}. Aplica el hook sugerido. Incluye las keywords principales en título y descripción.

**Paso 2 (24-48h):**
Publica entre 7-9 PM (horario óptimo para ${userPlatform}). Mide: ${userPlatform === 'TikTok' ? 'views y shares' : userPlatform === 'YouTube' ? 'CTR y retención' : 'engagement rate'} en primeras 48h. Objetivo: superar tu promedio en 20-25%.

**Paso 3 (72h):**
Si engagement supera objetivo → Crear 2-3 variaciones la próxima semana
Si no alcanza objetivo → Ajustar hook y thumbnail, reintentar con nuevo ángulo

---
## 🛠️ SIGUIENTE PASO: USA "GENERA TU GUIÓN"

Para convertir esta estrategia en guión listo para grabar:

1. Ve a **"Genera tu Guión"** en el menú principal
2. Selecciona plataforma: **${userPlatform}**
3. Ingresa tema: **"${safeTitle}"** (o variante adaptada a tu nicho)
4. CreoVision armará el script completo con tu tono **${userStyle}**, estructura optimizada, y las keywords SEO integradas

**Otras herramientas útiles:**
• **Calendario:** Programa la publicación para el horario óptimo (7-9 PM)
• **Historial de Contenido:** Guarda este análisis como referencia para futuras tendencias

---
## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Grabar contenido en próximas 24h
- [ ] Aplicar keywords en título, descripción, y tags
- [ ] Publicar en horario óptimo: 7-9 PM
- [ ] Medir métrica clave en 48h: ${userPlatform === 'TikTok' ? 'shares y guardados' : userPlatform === 'YouTube' ? 'CTR y retención promedio' : 'engagement rate'}
- [ ] Ajustar según datos y crear variaciones si funciona

---

💡 **Nota**: Este es un análisis de respaldo. Para insights más profundos con análisis de competencia y estrategia avanzada, intenta nuevamente cuando el sistema esté disponible.`);
    } finally {
      console.log('🏁 FinishedCreoVision GP-4 analysis');
      setIsAiThinking(false);
    }
  };

  const handleUnlock = async (trendType, trendId, trendTitle) => {
    if (!user) {
      toast({
        title: '🔒 Inicia sesión',
        description: 'Necesitas una cuenta para desbloquear tendencias.',
        variant: 'destructive'
      });
      return;
    }

    // Verificar créditos suficientes
    const creditCheck = await checkSufficientCredits(user.id, UNLOCK_COST);

    if (!creditCheck.sufficient) {
      toast({
        title: '💎 Créditos insuficientes',
        description: `Necesitas ${UNLOCK_COST} créditos para desbloquear. Te faltan ${creditCheck.missing} créditos.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      // Consumir créditos
      const creditResult = await consumeCredits(user.id, UNLOCK_COST, 'unlock_trend', `Desbloquear: ${trendTitle}`);

      if (!creditResult.success) {
        throw new Error('No se pudieron consumir los créditos');
      }

      // Registrar desbloqueo
      const unlockResult = await unlockTrendCard(user.id, trendType, trendId);

      if (!unlockResult.success) {
        throw new Error('No se pudo desbloquear la tendencia');
      }

      // Actualizar lista de desbloqueados
      setUnlockedIds(prev => [...prev, trendId]);

      toast({
        title: '✅ Tendencia desbloqueada',
        description: `Se consumieron ${UNLOCK_COST} créditos. Restantes: ${creditResult.remaining}`
      });
    } catch (error) {
      console.error('Error unlocking trend:', error);
      toast({
        title: 'Error',
        description: 'No se pudo desbloquear la tendencia. Intenta de nuevo.',
        variant: 'destructive'
      });
    }
  };

  // Función para desbloquear todas las tarjetas de una categoría
  const handleUnlockAll = async () => {
    if (!user) {
      toast({
        title: '🔒 Inicia sesión',
        description: 'Necesitas una cuenta para desbloquear tendencias.',
        variant: 'destructive'
      });
      return;
    }

    const currentTrends = trends[selectedCategory];
    const lockedTrends = currentTrends.slice(1); // Excluir la primera que ya está desbloqueada

    // Calcular el costo según la categoría
    const UNLOCK_ALL_COST = selectedCategory === 'reddit' ? UNLOCK_ALL_COST_REDDIT : UNLOCK_ALL_COST_STANDARD;

    // Verificar créditos suficientes
    const creditCheck = await checkSufficientCredits(user.id, UNLOCK_ALL_COST);

    if (!creditCheck.sufficient) {
      toast({
        title: '💎 Créditos insuficientes',
        description: `Necesitas ${UNLOCK_ALL_COST} créditos para desbloquear todas. Te faltan ${creditCheck.missing} créditos.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      // Consumir créditos
      const creditResult = await consumeCredits(
        user.id,
        UNLOCK_ALL_COST,
        'unlock_all_trends',
        `Desbloquear todas (${selectedCategory})`
      );

      if (!creditResult.success) {
        throw new Error('No se pudieron consumir los créditos');
      }

      // Desbloquear todas las tendencias de esta categoría
      const unlockPromises = lockedTrends.map(trend =>
        unlockTrendCard(user.id, selectedCategory, trend.id)
      );

      await Promise.all(unlockPromises);

      // Actualizar lista de desbloqueados
      const newUnlockedIds = lockedTrends.map(t => t.id);
      setUnlockedIds(prev => [...prev, ...newUnlockedIds]);

      toast({
        title: '✨ ¡Todas desbloqueadas!',
        description: `Se consumieron ${UNLOCK_ALL_COST} créditos. Restantes: ${creditResult.remaining}. Ahorraste ${(UNLOCK_COST * lockedTrends.length) - UNLOCK_ALL_COST} créditos.`,
        duration: 5000
      });
    } catch (error) {
      console.error('Error unlocking all trends:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron desbloquear todas las tendencias. Intenta de nuevo.',
        variant: 'destructive'
      });
    }
  };

  const isUnlocked = (trendId, index) => {
    // Primera tarjeta siempre desbloqueada
    if (index === 0) return true;
    // Verificar si el usuario la desbloqueó
    return unlockedIds.includes(trendId);
  };

  const categories = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: Twitter,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      id: 'news',
      name: 'Noticias',
      icon: Newspaper,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30'
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: MessageSquare,
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    }
  ];

  const currentCategory = categories.find(c => c.id === selectedCategory);
  const currentTrends = trends[selectedCategory] || [];
  const currentUnlockAllCost = selectedCategory === 'reddit' ? UNLOCK_ALL_COST_REDDIT : UNLOCK_ALL_COST_STANDARD;
  const currentLockedCount = currentTrends.length - 1; // -1 porque la primera es gratis

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-2 text-gray-400">Cargando tendencias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
              📊 Tendencias de la Semana
            </h1>
            <p className="text-gray-400">
              Descubre las tendencias más virales de YouTube, Twitter, Reddit y Noticias
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>

        {/* Info de desbloqueo */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">¿Cómo funciona?</p>
                  <p className="text-gray-300 text-sm mt-1">
                    La <strong>primera tarjeta</strong> de cada categoría es <strong className="text-green-400">GRATIS</strong>.
                    Las demás requieren <strong className="text-purple-400">{UNLOCK_COST} créditos</strong> cada una.
                    Las tendencias se actualizan automáticamente cada <strong>semana</strong>. Al renovarse, solo la primera tarjeta queda desbloqueada.
                  </p>
                  <p className="text-sm mt-2 text-purple-300">
                    💡 <strong>Ahorra {(UNLOCK_COST * currentLockedCount) - currentUnlockAllCost} créditos</strong> desbloqueando las {currentLockedCount} restantes por solo <strong>{currentUnlockAllCost} créditos</strong>
                  </p>
                </div>
              </div>
              <div className="w-full lg:w-auto">
                <Button
                  onClick={handleUnlockAll}
                  className="w-full justify-center bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 flex items-center gap-2 whitespace-nowrap"
                >
                  <Crown className="w-4 h-4" />
                  Desbloquear Todas ({currentUnlockAllCost} 💎)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Categorías */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          const categoryTrends = trends[category.id] || [];
          const unlockedCount = categoryTrends.filter((t, i) => isUnlocked(t.id, i)).length;

          return (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all
                ${isActive
                  ? `${category.bgColor} ${category.borderColor}`
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? `text-${category.color.split('-')[1]}-500` : 'text-gray-400'}`} />
              <div className="text-left">
                <p className={`font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                  {category.name}
                </p>
                <p className="text-xs text-gray-500">
                  {unlockedCount}/{categoryTrends.length} desbloqueadas
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Grid de tarjetas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {currentTrends.map((trend, index) => {
            const unlocked = isUnlocked(trend.id, index);
            const Icon = currentCategory.icon;

            return (
              <TrendCard
                key={trend.id}
                trend={trend}
                index={index}
                unlocked={unlocked}
                category={currentCategory}
                Icon={Icon}
                onUnlock={() => handleUnlock(selectedCategory, trend.id, trend.title)}
                onTalk={handleAnalyzeWithAI}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Modal de IA */}
      <AnimatePresence>
        {aiModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setAiModalOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
            >
              <Card className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-purple-500/30 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardHeader className="border-b border-purple-500/20 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <CardTitle className="text-white">
                          Análisis Estratégico de Creo
                        </CardTitle>
                      </div>
                      {selectedTrend && (
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {selectedTrend.title}
                        </p>
                      )}
                      <p className="text-xs text-purple-400 mt-1">
                        ⚡ Análisis SEO y Estrategia Personalizada • Motor CreoVision GP-4
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAiModalOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <ExternalLink className="w-5 h-5 rotate-45" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {isAiThinking ? (
                    <TrendAnalysisLoader
                      isVisible={isAiThinking}
                      analysisType={analysisType}
                    />
                  ) : (
                    <>
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 leading-relaxed">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                            h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-purple-400 mt-8 mb-4 first:mt-0" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-bold text-indigo-400 mt-6 mb-3" {...props} />,
                            h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-cyan-400 mt-4 mb-2" {...props} />,
                            p: ({node, ...props}) => <p className="mb-4 text-gray-300 leading-relaxed" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                            em: ({node, ...props}) => <em className="italic text-purple-300" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300" {...props} />,
                            li: ({node, ...props}) => <li className="ml-4 mb-1" {...props} />,
                            code: ({node, inline, ...props}) => 
                              inline ? (
                                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-300 text-sm" {...props} />
                              ) : (
                                <code className="block bg-gray-800 p-3 rounded text-purple-300 text-sm overflow-x-auto" {...props} />
                              ),
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-400 my-4" {...props} />,
                          }}
                        >
                          {aiResponse}
                        </ReactMarkdown>
                        </div>

                        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-purple-300">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium">
                              Análisis Estratégico Personalizado
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            SEO + Estrategia adaptada a tu nicho y estilo • Sistema con memoria
                          </p>
                        </div>
                      </div>

                      {/* Widget de Feedback FUERA de prose para evitar conflictos de CSS */}
                      {aiResponse && (
                        <AIFeedbackWidget
                          interactionId={interactionId}
                          sessionId={sessionId}
                          onFeedbackSubmitted={(interaction) => {
                            console.log('✅ Feedback recibido:', interaction);
                            toast({
                              title: 'Gracias por tu feedback',
                              description: 'Tu opinión nos ayuda a mejorar',
                            });
                          }}
                        />
                      )}

                      <div className="mt-4 flex gap-2">
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(aiResponse);
                            toast({
                              title: '✅ Copiado',
                              description: 'Análisis copiado al portapapeles'
                            });
                          }}
                          variant="outline"
                          className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
                        >
                          Copiar Análisis
                        </Button>
                        <Button
                          onClick={() => setAiModalOpen(false)}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                        >
                          Cerrar
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente de tarjeta individual
const TrendCard = ({ trend, index, unlocked, category, Icon, onUnlock, onTalk }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: unlocked ? 1.02 : 1 }}
      className="relative"
    >
      <Card className={`
        ${unlocked ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-900/50 border-gray-800'}
        hover:border-gray-600 transition-all h-full flex flex-col
      `}>
        {/* Badge de posición */}
        {index === 0 && (
          <div className="absolute -top-2 -right-2 z-10">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" />
              GRATIS
            </div>
          </div>
        )}

        {/* Overlay de bloqueado */}
        {!unlocked && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
            <div className="text-center p-6">
              <Lock className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <p className="text-white font-bold mb-2">Contenido Bloqueado</p>
              <p className="text-gray-400 text-sm mb-4">
                Desbloquea esta tendencia por {UNLOCK_COST} créditos
              </p>
              <Button
                onClick={onUnlock}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Desbloquear ({UNLOCK_COST} 💎)
              </Button>
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${category.bgColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <CardTitle className={`text-lg line-clamp-2 ${unlocked ? 'text-white' : 'text-gray-600'}`}>
                {unlocked ? trend.title : '█████ ██████ ████'}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col flex-grow">
          {unlocked ? (
            <>
              <CardDescription className="text-gray-400 line-clamp-3 mb-4">
                {trend.description}
              </CardDescription>

              {/* Estadísticas */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                {trend.views && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{typeof trend.views === 'number' ? trend.views.toLocaleString() : trend.views}</span>
                  </div>
                )}
                {trend.engagement && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{typeof trend.engagement === 'number' ? trend.engagement.toLocaleString() : trend.engagement}</span>
                  </div>
                )}
                {trend.volume && (
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{trend.volume}</span>
                  </div>
                )}
                {trend.score && (
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{typeof trend.score === 'number' ? trend.score.toLocaleString() : trend.score}</span>
                  </div>
                )}
                {trend.numComments && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{typeof trend.numComments === 'number' ? trend.numComments.toLocaleString() : trend.numComments}</span>
                  </div>
                )}
              </div>

              {/* Botones de acción - siempre alineados al final */}
              <div className="flex gap-2 mt-auto">
                {/* Botón Análisis de Creo */}
                <Button
                  onClick={() => onTalk?.(trend)}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Análisis de Creo
                </Button>

                {/* Botón Ver más */}
                {trend.url && trend.url !== '#' && (
                  <Button
                    as="a"
                    href={trend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    className="flex-1 border-purple-500/30 hover:bg-purple-500/10"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver más
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WeeklyTrends;

