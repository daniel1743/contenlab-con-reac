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
import { CREO_SYSTEM_PROMPT, CREO_CONTEXT_BUILDER } from '@/config/creoPersonality';
import { getMemories, saveMemory, buildMemoryContext } from '@/services/memoryService';

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
      console.warn('[WeeklyTrends] No se pudieron cargar memorias:', error);
      // En caso de error, simplemente usar array vacío
      setPersistentMemories([]);
    }
  };

  const loadTrends = async () => {
    try {
      setLoading(true);
      const data = await getWeeklyTrends();
      setTrends(data);
    } catch (error) {
      console.error('Error loading trends:', error);
      toast({
        title: 'Error al cargar tendencias',
        description: 'No se pudieron cargar las tendencias. Intenta de nuevo.',
        variant: 'destructive'
      });
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
    await loadTrends();
    setRefreshing(false);
    toast({
      title: '✅ Tendencias actualizadas',
      description: 'Se cargaron las últimas tendencias de la semana.'
    });
  };

  const handleTalkWithAI = async (trend) => {
    console.log('🤖 handleTalkWithAI called with trend:', trend);

    if (!user) {
      console.warn('❌ No user authenticated');
      toast({
        title: '🔒 Inicia sesión',
        description: 'Necesitas una cuenta para hablar con Creo.',
        variant: 'destructive'
      });
      return;
    }

    console.log('✅ User authenticated, opening modal...');
    setSelectedTrend(trend);
    setAiModalOpen(true);
    setIsAiThinking(true);
    setAiResponse('');

    // Si VITE_API_BASE_URL está definida, úsala; si no, usa URL relativa (funcionará en Vercel)
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
      : '';
    const endpoint = `${apiBaseUrl}/api/ai/chat`;

    try {
      console.log('📡 Calling AI API via backend...');
      
      // Obtener token de autenticación si está disponible
      const authToken = session?.access_token || null;

      // Construir contexto personalizado con perfil y memorias
      const profileContext = CREO_CONTEXT_BUILDER(profileData);
      const memoryContext = buildMemoryContext(persistentMemories, 800);

      // Construir prompt
      const userPrompt = `Te habla ${displayName}. Necesito que actúes como "Creo", mi analista creativo personal.
Analiza esta tendencia y dame recomendaciones accionables ajustadas a mi voz:

📌 **Título:** ${trend.title}
📝 **Descripción:** ${trend.description || 'Sin descripción'}
📊 **Engagement:** ${trend.engagement || trend.views || 'N/A'}
${trend.tag ? `🏷️ **Tag/Hashtag:** ${trend.tag}` : ''}

Quiero un análisis que cubra:
1. **¿Por qué está funcionando ahora?** Factores clave y señales de saturación.
2. **Oportunidad específica para ${displayName}.** Ángulo narrativo y diferenciadores.
3. **Plan en 3 pasos** (hook, estructura, CTA) para producir contenido competitivo.
4. **Hashtags y keywords** priorizadas (máx. 6) que puedan posicionarme.
5. **Timing óptimo** (día, hora, formato) para publicar.
6. **Consejo motivacional Creo** que me recuerde mi progreso y próximo paso.

Sé empático, práctico y enfocado en resultados medibles.`;

      // Construir system prompt completo con contexto
      const fullSystemPrompt = `${CREO_SYSTEM_PROMPT}

📋 INFORMACIÓN DEL USUARIO:
- Nombre preferido: ${displayName}${profileContext}${memoryContext}`;

      // Llamar a nuestro backend con sistema de aprendizaje integrado
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({
          provider: 'qwen',
          model: 'qwen-plus',
          systemPrompt: fullSystemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7,
          maxTokens: 1500,
          feature_slug: 'weekly_trends_analysis',
          session_id: sessionId,
          capture_interaction: true
        })
      });

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
        console.log('✅ Setting AI response');
        setAiResponse(data.content);

        // Guardar interaction_id para el sistema de feedback
        console.log('🔍 Buscando interaction_id en respuesta...');
        console.log('data.interaction_id:', data.interaction_id);
        console.log('typeof data.interaction_id:', typeof data.interaction_id);

        if (data.interaction_id) {
          console.log('💾 Interaction ID guardado:', data.interaction_id);
          setInteractionId(data.interaction_id);
        } else {
          console.warn('⚠️ No se recibió interaction_id del servidor');
          console.warn('⚠️ Keys disponibles en data:', Object.keys(data));
        }

        // 💾 Guardar análisis como memoria contextual
        try {
          await saveMemory({
            type: 'context',
            content: `Analicé la tendencia "${trend.title}" - ${trend.description || 'Tendencia de ' + selectedCategory}`,
            metadata: {
              source: 'weekly_trends_analysis',
              trend_id: trend.id,
              category: selectedCategory,
              timestamp: Date.now()
            },
            authToken
          });
          console.log('[WeeklyTrends] 💾 Análisis guardado en memoria');
        } catch (memError) {
          console.warn('[WeeklyTrends] No se pudo guardar en memoria:', memError);
        }
      } else {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid response from AI');
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

      // Fallback response mejorado
      setAiResponse(`### 📊 Análisis rápido para "${trend.title}"

🔥 **¿Por qué destaca?**
• Tema altamente comentado esta semana.
• Contenido emocional y fácil de compartir.
• Formato adaptable a short + long form.
• Aprovecha referencias culturales recientes.

🎯 **Tu oportunidad, ${displayName}:**
1. Refuerza tu ángulo experto (datos, storytelling o humor inteligente).
2. Explica la tendencia en tus palabras y conecta con la experiencia de tu audiencia.
3. Cierra con un CTA que invite a comentar o compartir.

🛠️ **Plan express (3 pasos)**
1. **Hook**: abre con una pregunta disruptiva o cifra inesperada.
2. **Desarrollo**: resume en 3 bullets qué implica la tendencia y cómo aprovecharla.
3. **Cierre**: comparte tu postura personal y da una acción concreta al espectador.

🏷️ **Hashtags sugeridos:**
${trend.tag ? trend.tag : '#CreoVision #ContenidoViral'}
#TendenciasDigitales #IdeaDelDía #SoyCreo

⏰ **Timing recomendado:** publica antes de 48h, ideal 11:00 AM o 8:00 PM (hora de tu audiencia). Prepara 2 variaciones para los próximos días.

💬 **Mensaje de Creo:** Sigamos iterando, ${displayName}. Cada versión te acerca a tu tono ideal. Observa métricas, aprende y vuelve a intentarlo.`);
    } finally {
      console.log('🏁 Finished AI analysis');
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-medium">¿Cómo funciona?</p>
                  <p className="text-gray-300 text-sm mt-1">
                    La <strong>primera tarjeta</strong> de cada categoría es <strong className="text-green-400">GRATIS</strong>.
                    Las demás requieren <strong className="text-purple-400">{UNLOCK_COST} créditos</strong> cada una.
                    Las tendencias se actualizan automáticamente cada 3 días.
                  </p>
                  <p className="text-sm mt-2 text-purple-300">
                    💡 <strong>Ahorra {(UNLOCK_COST * currentLockedCount) - currentUnlockAllCost} créditos</strong> desbloqueando las {currentLockedCount} restantes por solo <strong>{currentUnlockAllCost} créditos</strong>
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUnlockAll}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:opacity-90 flex items-center gap-2 whitespace-nowrap"
              >
                <Crown className="w-4 h-4" />
                Desbloquear Todas ({currentUnlockAllCost} 💎)
              </Button>
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
                onTalk={handleTalkWithAI}
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
                          Análisis de Tendencia con IA
                        </CardTitle>
                      </div>
                      {selectedTrend && (
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {selectedTrend.title}
                        </p>
                      )}
                      <p className="text-xs text-purple-400 mt-1">
                        ⚡ Impulsado por CreoVision AI GP-4
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
                    <div className="flex flex-col items-center justify-center py-12">
                      <RefreshCw className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                      <p className="text-gray-400 text-center">
                        CreoVision AI está analizando la tendencia...
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Generando insights estratégicos
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                          {aiResponse}
                        </div>

                        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <div className="flex items-center gap-2 text-sm text-purple-300">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-medium">
                              Análisis generado por CreoVision AI GP-4
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Motor de análisis avanzado impulsado por CreoVision IA
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
        hover:border-gray-600 transition-all h-full
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

        <CardContent>
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

              {/* Botones de acción */}
              <div className="flex gap-2">
                {/* Botón Hablar con Creo */}
                <Button
                  onClick={() => onTalk?.(trend)}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Hablar con Creo
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
