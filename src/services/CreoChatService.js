/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🧠 CREO CHAT SERVICE - Coach Conversacional Inteligente        ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Gestiona sesiones de chat con control de mensajes, créditos    ║
 * ║  y redirección inteligente según la etapa de conversación        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * @version 1.0.0
 * @author CreoVision Team
 */

import { supabase } from '@/lib/supabaseClient';
import { CREO_SYSTEM_PROMPT, getStagePrompt } from '@/config/creoPersonality';
import { buildCreoPrompt } from '@/utils/creoPromptBuilder';
import {
  trackUsage,
  checkUserBlock
} from '@/services/abuseDetectionService';

// ===== CONSTANTES DE CONFIGURACIÓN =====
const CONFIG = {
  FREE_MESSAGES_LIMIT: 8,           // Mensajes gratuitos
  EXTENSION_COST: 2,                // Créditos por extensión
  EXTENSION_MESSAGES: 2,            // Mensajes adicionales por extensión
  MAX_TOTAL_MESSAGES: 12,           // Máximo total de mensajes
  SESSION_TIMEOUT_MINUTES: 30,      // Tiempo de inactividad para cerrar sesión
  DEEPSEEK_API_KEY: import.meta.env.VITE_DEEPSEEK_API_KEY,
  DEEPSEEK_API_URL: 'https://api.deepseek.com/chat/completions' // URL correcta sin /v1
};

// ===== CLASE PRINCIPAL DEL SERVICIO =====
class CreoChatService {
  constructor() {
    this.currentSession = null;
    this.userPreferences = null;
    this.userContext = null;
  }

  /**
   * Inicializar o recuperar sesión activa
   * @param {string} userId - ID del usuario autenticado
   * @returns {Promise<Object>} - Sesión activa o nueva
   */
  async initSession(userId) {
    try {
      // 1. Buscar sesión activa existente
      const { data: existingSession, error: sessionError } = await supabase
        .from('creo_chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        throw sessionError;
      }

      // 2. Si existe sesión activa y no ha expirado, usarla
      if (existingSession) {
        const lastActivity = new Date(existingSession.last_activity_at);
        const now = new Date();
        const minutesSinceActivity = (now - lastActivity) / 1000 / 60;

        if (minutesSinceActivity < CONFIG.SESSION_TIMEOUT_MINUTES) {
          this.currentSession = existingSession;
          console.log('✅ Sesión activa recuperada:', existingSession.id);
          return existingSession;
        } else {
          // Sesión expirada, marcar como abandonada
          await this._closeSession(existingSession.id, 'abandoned');
        }
      }

      // 3. Crear nueva sesión
      const newSession = await this._createNewSession(userId);
      this.currentSession = newSession;

      // 4. Cargar preferencias del usuario
      await this._loadUserPreferences(userId);

      // 5. Cargar contexto del usuario
      await this._loadUserContext(userId);

      console.log('✅ Nueva sesión creada:', newSession.id);
      return newSession;

    } catch (error) {
      console.error('❌ Error inicializando sesión:', error);
      throw new Error('No se pudo inicializar la sesión de chat');
    }
  }

  /**
   * Enviar mensaje y obtener respuesta de Creo
   * @param {string} userId - ID del usuario
   * @param {string} userMessage - Mensaje del usuario
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} - Respuesta del asistente
   */
  async sendMessage(userId, userMessage, options = {}) {
    try {
      // 1. Validar sesión activa
      if (!this.currentSession) {
        await this.initSession(userId);
      }

      // 2. ✅ ANTI-ABUSO: Verificar si usuario está bloqueado
      const blockCheck = await checkUserBlock(userId, 'ai_chat');
      console.log('🔍 DEBUG - Block check:', blockCheck);

      if (blockCheck.isBlocked) {
        return {
          content: `Lo siento, tu cuenta está temporalmente bloqueada. ${blockCheck.reason}`,
          isBlocked: true,
          blockedUntil: blockCheck.blockedUntil,
          error: true
        };
      }

      // 3. Verificar límite de mensajes del Coach Creo (8 mensajes gratuitos + 2 pagados)
      const canContinue = await this._checkMessageLimit(userId);
      console.log('🔍 DEBUG - Message limit check:', canContinue);

      if (!canContinue.allowed) {
        return this._generateLimitResponse(canContinue);
      }

      // 4. Guardar mensaje del usuario
      await this._saveMessage({
        session_id: this.currentSession.id,
        role: 'user',
        content: userMessage,
        message_number: this.currentSession.message_count + 1,
        is_free: canContinue.isFree
      });

      // 5. Obtener historial de conversación
      const conversationHistory = await this._getConversationHistory();

      // 6. Determinar etapa de conversación
      const stage = this._determineConversationStage();

      // 7. Construir prompt contextualizado
      const prompt = buildCreoPrompt({
        userMessage,
        conversationHistory,
        stage,
        userPreferences: this.userPreferences,
        userContext: this.userContext,
        messageCount: this.currentSession.message_count
      });

      // 8. Generar respuesta con DeepSeek
      const assistantResponse = await this._generateAIResponse(prompt, stage);

      // 9. ✅ ANTI-ABUSO: Registrar uso y calcular costos automáticamente (solo tracking, no validación)
      await trackUsage({
        userId: userId,
        featureSlug: 'ai_chat',
        actionType: 'chat_message',
        aiProvider: 'deepseek',
        modelUsed: 'deepseek-chat',
        tokensInput: assistantResponse.tokensInput || 0,
        tokensOutput: assistantResponse.tokensOutput || 0,
        status: 'success',
        ipAddress: options.ipAddress || null,
        userAgent: options.userAgent || null,
        metadata: {
          sessionId: this.currentSession.id,
          conversationStage: stage,
          messageCount: this.currentSession.message_count + 2,
          isFree: canContinue.isFree
        }
      });

      // 10. Analizar sentimiento de la interacción
      await this._analyzeSentiment(userMessage, assistantResponse);

      // 11. Guardar respuesta del asistente
      await this._saveMessage({
        session_id: this.currentSession.id,
        role: 'assistant',
        content: assistantResponse.content,
        message_number: this.currentSession.message_count + 2,
        is_free: canContinue.isFree,
        ai_provider: 'deepseek',
        tokens_input: assistantResponse.tokensInput,
        tokens_output: assistantResponse.tokensOutput,
        response_time_ms: assistantResponse.responseTime
      });

      // 12. Actualizar sesión
      await this._updateSession({
        conversation_stage: stage,
        main_topic: assistantResponse.detectedTopic || this.currentSession.main_topic
      });

      // 13. Verificar si debe redirigir
      const shouldRedirect = this._shouldRedirect();

      return {
        content: assistantResponse.content,
        stage,
        messageCount: this.currentSession.message_count + 2,
        freeMessagesRemaining: Math.max(0, CONFIG.FREE_MESSAGES_LIMIT - (this.currentSession.free_messages_used + 1)),
        shouldRedirect,
        redirectUrl: shouldRedirect ? '/crear-guion' : null,
        canExtend: canContinue.canExtend,
        extensionCost: CONFIG.EXTENSION_COST
      };

    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);

      // ✅ ANTI-ABUSO: Registrar error también para detectar patrones
      try {
        await trackUsage({
          userId: userId,
          featureSlug: 'ai_chat',
          actionType: 'chat_message',
          aiProvider: 'deepseek',
          modelUsed: 'deepseek-chat',
          tokensInput: 0,
          tokensOutput: 0,
          status: 'error',
          metadata: {
            error: error.message,
            sessionId: this.currentSession?.id
          }
        });
      } catch (trackError) {
        console.error('❌ Error registrando fallo:', trackError);
      }

      throw new Error('No se pudo procesar el mensaje');
    }
  }

  /**
   * Extender sesión con créditos
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} - Resultado de la extensión
   */
  async extendSession(userId) {
    try {
      // 1. Verificar créditos del usuario
      const { data: userData, error: userError } = await supabase
        .from('user_credits')
        .select('total_credits')
        .eq('user_id', userId)
        .single();

      if (userError) throw userError;

      if (userData.total_credits < CONFIG.EXTENSION_COST) {
        return {
          success: false,
          message: 'No tienes suficientes créditos para extender la sesión',
          creditsNeeded: CONFIG.EXTENSION_COST,
          creditsAvailable: userData.total_credits
        };
      }

      // 2. Deducir créditos
      const { error: deductError } = await supabase
        .from('user_credits')
        .update({ total_credits: userData.total_credits - CONFIG.EXTENSION_COST })
        .eq('user_id', userId);

      if (deductError) throw deductError;

      // 3. Actualizar sesión
      await this._updateSession({
        status: 'extended',
        credits_spent: this.currentSession.credits_spent + CONFIG.EXTENSION_COST,
        conversation_stage: 'extension'
      });

      // 4. Recargar sesión
      await this.initSession(userId);

      console.log(`✅ Sesión extendida. Créditos deducidos: ${CONFIG.EXTENSION_COST}`);

      return {
        success: true,
        message: `Sesión extendida. Tienes ${CONFIG.EXTENSION_MESSAGES} mensajes adicionales.`,
        creditsDeducted: CONFIG.EXTENSION_COST,
        creditsRemaining: userData.credits - CONFIG.EXTENSION_COST,
        messagesAdded: CONFIG.EXTENSION_MESSAGES
      };

    } catch (error) {
      console.error('❌ Error extendiendo sesión:', error);
      throw new Error('No se pudo extender la sesión');
    }
  }

  /**
   * Cerrar sesión manualmente
   * @param {string} outcome - Resultado de la sesión
   * @returns {Promise<void>}
   */
  async closeSession(outcome = 'completed') {
    try {
      if (!this.currentSession) return;

      await this._closeSession(this.currentSession.id, outcome);

      // Registrar efectividad
      await this._recordEffectiveness(outcome);

      this.currentSession = null;
      console.log('✅ Sesión cerrada:', outcome);

    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    }
  }

  /**
   * Obtener estadísticas de la sesión actual
   * @returns {Object} - Estadísticas
   */
  getSessionStats() {
    if (!this.currentSession) {
      return null;
    }

    const stats = {
      messageCount: this.currentSession.message_count,
      freeMessagesUsed: this.currentSession.free_messages_used,
      paidMessagesUsed: this.currentSession.paid_messages_used,
      creditsSpent: this.currentSession.credits_spent,
      stage: this.currentSession.conversation_stage,
      freeMessagesRemaining: Math.max(0, CONFIG.FREE_MESSAGES_LIMIT - this.currentSession.free_messages_used),
      canExtend: this.currentSession.free_messages_used >= CONFIG.FREE_MESSAGES_LIMIT &&
                 this.currentSession.message_count < CONFIG.MAX_TOTAL_MESSAGES
    };

    console.log('📊 Session Stats:', {
      free_messages_used: this.currentSession.free_messages_used,
      FREE_MESSAGES_LIMIT: CONFIG.FREE_MESSAGES_LIMIT,
      freeMessagesRemaining: stats.freeMessagesRemaining
    });

    return stats;
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Crear nueva sesión
   * @private
   */
  async _createNewSession(userId) {
    const { data, error } = await supabase
      .from('creo_chat_sessions')
      .insert({
        user_id: userId,
        session_id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'active',
        conversation_stage: 'intro',
        message_count: 0,
        free_messages_used: 0,
        paid_messages_used: 0,
        credits_spent: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cargar preferencias del usuario
   * @private
   */
  async _loadUserPreferences(userId) {
    const { data, error } = await supabase
      .from('ai_personality_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ No se encontraron preferencias, usando defaults');
    }

    // Si no existen preferencias, crear defaults
    if (!data) {
      const { data: newPrefs } = await supabase
        .from('ai_personality_preferences')
        .insert({
          user_id: userId,
          tone: 'motivational',
          emoji_frequency: 'medium',
          response_length: 'concise',
          use_markdown: false,
          proactivity_level: 7
        })
        .select()
        .single();

      this.userPreferences = newPrefs;
    } else {
      this.userPreferences = data;
    }
  }

  /**
   * Cargar contexto del usuario
   * @private
   */
  async _loadUserContext(userId) {
    const { data, error } = await supabase
      .from('user_behavior_context')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️ No se encontró contexto de usuario');
    }

    if (!data) {
      // Crear contexto inicial
      const { data: newContext } = await supabase
        .from('user_behavior_context')
        .insert({
          user_id: userId,
          expertise_level: 5,
          preferred_topics: [],
          main_goals: []
        })
        .select()
        .single();

      this.userContext = newContext;
    } else {
      this.userContext = data;
    }
  }

  /**
   * Obtener plan del usuario desde localStorage o user_metadata
   * @private
   */
  async _getUserPlan(userId) {
    try {
      // Intentar obtener desde localStorage primero
      const savedProfileData = localStorage.getItem('creovision_profile_data');
      if (savedProfileData) {
        const data = JSON.parse(savedProfileData);
        if (data.plan) {
          return data.plan.toUpperCase();
        }
      }

      // Fallback: obtener desde user metadata de Supabase auth
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user?.user_metadata?.plan) {
        return user.user_metadata.plan.toUpperCase();
      }

      // Default: FREE
      return 'FREE';
    } catch (error) {
      console.warn('⚠️ Error obteniendo plan del usuario:', error);
      return 'FREE';
    }
  }

  /**
   * Verificar límite de mensajes
   * @private
   */
  async _checkMessageLimit(userId) {
    const freeUsed = this.currentSession.free_messages_used;
    const totalMessages = this.currentSession.message_count;

    // Dentro del límite gratuito
    if (freeUsed < CONFIG.FREE_MESSAGES_LIMIT) {
      return {
        allowed: true,
        isFree: true,
        canExtend: false
      };
    }

    // Alcanzó el límite gratuito pero puede extender
    if (totalMessages < CONFIG.MAX_TOTAL_MESSAGES) {
      // Verificar si ya pagó por extensión
      if (this.currentSession.status === 'extended') {
        return {
          allowed: true,
          isFree: false,
          canExtend: false
        };
      }

      return {
        allowed: false,
        isFree: false,
        canExtend: true,
        reason: 'free_limit_reached'
      };
    }

    // Alcanzó el límite máximo total
    return {
      allowed: false,
      isFree: false,
      canExtend: false,
      reason: 'max_limit_reached'
    };
  }

  /**
   * Generar respuesta cuando se alcanza el límite
   * @private
   */
  _generateLimitResponse(limitInfo) {
    if (limitInfo.reason === 'free_limit_reached') {
      return {
        content: "Has alcanzado el límite de mensajes gratuitos. Para seguir conversando, puedes extender la sesión por 2 créditos (2 mensajes adicionales) o usar la sección 'Genera tu Guion' para crear contenido profesional.",
        stage: 'cta',
        shouldRedirect: true,
        redirectUrl: '/crear-guion',
        canExtend: true,
        extensionCost: CONFIG.EXTENSION_COST,
        isLimitReached: true
      };
    }

    if (limitInfo.reason === 'max_limit_reached') {
      return {
        content: "Para seguir desarrollando tus ideas a fondo, te invito a usar la sección 'Genera tu Guion' de CreoVision. Allí podrás crear guiones profesionales con asistencia completa.",
        stage: 'redirect',
        shouldRedirect: true,
        redirectUrl: '/crear-guion',
        canExtend: false,
        isLimitReached: true
      };
    }

    return {
      content: "Ocurrió un error al verificar el límite de mensajes.",
      isError: true
    };
  }

  /**
   * Guardar mensaje en el log
   * @private
   */
  async _saveMessage(messageData) {
    const { error } = await supabase
      .from('creo_message_log')
      .insert(messageData);

    if (error) {
      console.error('❌ Error guardando mensaje:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de conversación
   * @private
   */
  async _getConversationHistory() {
    const { data, error } = await supabase
      .from('creo_message_log')
      .select('role, content')
      .eq('session_id', this.currentSession.id)
      .order('created_at', { ascending: true })
      .limit(20); // Últimos 20 mensajes

    if (error) throw error;
    return data || [];
  }

  /**
   * Determinar etapa de conversación
   * @private
   */
  _determineConversationStage() {
    const messageCount = this.currentSession.message_count;
    const freeUsed = this.currentSession.free_messages_used;

    if (messageCount <= 2) return 'intro';
    if (messageCount <= 6) return 'explore';
    if (messageCount <= 8) return 'cta';
    if (freeUsed >= CONFIG.FREE_MESSAGES_LIMIT && this.currentSession.status === 'extended') {
      return 'extension';
    }
    return 'redirect';
  }

  /**
   * Generar respuesta de IA
   * @private
   */
  async _generateAIResponse(prompt, stage) {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(CONFIG.DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: prompt.messages,
          temperature: 0.8,
          max_tokens: 150, // Respuestas cortas
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      // Limpiar markdown si está deshabilitado
      const cleanContent = this.userPreferences?.use_markdown === false
        ? content.replace(/\*\*/g, '').replace(/\*/g, '')
        : content;

      return {
        content: cleanContent,
        tokensInput: data.usage?.prompt_tokens || 0,
        tokensOutput: data.usage?.completion_tokens || 0,
        responseTime: Date.now() - startTime,
        detectedTopic: this._extractTopic(cleanContent)
      };

    } catch (error) {
      console.error('❌ Error generando respuesta IA:', error);

      // Fallback response
      return {
        content: this._getFallbackResponse(stage),
        tokensInput: 0,
        tokensOutput: 0,
        responseTime: Date.now() - startTime,
        detectedTopic: null
      };
    }
  }

  /**
   * Obtener respuesta de fallback
   * @private
   */
  _getFallbackResponse(stage) {
    const fallbacks = {
      intro: "¡Hola! ¿En qué puedo ayudarte hoy?",
      explore: "Cuéntame más sobre lo que quieres crear.",
      cta: "¿Te gustaría usar la herramienta 'Genera tu Guion' para desarrollar esto?",
      extension: "Sigamos desarrollando tu idea.",
      redirect: "Para seguir, te recomiendo usar el Centro Creativo."
    };

    return fallbacks[stage] || "¿Cómo puedo ayudarte?";
  }

  /**
   * Extraer tema principal del contenido
   * @private
   */
  _extractTopic(content) {
    // Análisis simple de palabras clave
    const keywords = content.toLowerCase().match(/\b(guion|video|tiktok|youtube|instagram|contenido|viral|script)\b/g);
    return keywords ? keywords[0] : null;
  }

  /**
   * Analizar sentimiento de la interacción
   * @private
   */
  async _analyzeSentiment(userMessage, aiResponse) {
    try {
      // Análisis simple de sentimiento basado en palabras clave
      const positiveWords = ['gracias', 'excelente', 'genial', 'perfecto', 'bueno', 'sí', 'claro'];
      const negativeWords = ['no', 'mal', 'error', 'problema', 'frustrado', 'confundido'];
      const excitedWords = ['wow', 'increíble', 'asombroso', 'quiero', 'vamos'];

      const messageLower = userMessage.toLowerCase();

      let sentiment = 'neutral';
      let detectedEmotions = [];

      if (positiveWords.some(word => messageLower.includes(word))) {
        sentiment = 'positive';
        detectedEmotions.push('satisfaction');
      }
      if (negativeWords.some(word => messageLower.includes(word))) {
        sentiment = 'negative';
        detectedEmotions.push('frustration');
      }
      if (excitedWords.some(word => messageLower.includes(word))) {
        sentiment = 'excited';
        detectedEmotions.push('excitement', 'curiosity');
      }

      // Guardar análisis (no bloqueante)
      await supabase.from('ai_sentiment_analysis').insert({
        interaction_id: null, // Conectar con ai_interactions si existe
        sentiment,
        confidence: 70.0,
        detected_emotions: detectedEmotions,
        intensity: detectedEmotions.length > 0 ? 7 : 5
      });

    } catch (error) {
      console.warn('⚠️ Error analizando sentimiento:', error);
    }
  }

  /**
   * Actualizar sesión
   * @private
   */
  async _updateSession(updates) {
    const { error } = await supabase
      .from('creo_chat_sessions')
      .update({
        ...updates,
        last_activity_at: new Date().toISOString()
      })
      .eq('id', this.currentSession.id);

    if (error) {
      console.error('❌ Error actualizando sesión:', error);
    } else {
      // Actualizar sesión local
      this.currentSession = { ...this.currentSession, ...updates };
    }
  }

  /**
   * Cerrar sesión
   * @private
   */
  async _closeSession(sessionId, outcome) {
    await supabase
      .from('creo_chat_sessions')
      .update({
        status: outcome,
        ended_at: new Date().toISOString()
      })
      .eq('id', sessionId);
  }

  /**
   * Verificar si debe redirigir
   * @private
   */
  _shouldRedirect() {
    return (
      this.currentSession.conversation_stage === 'redirect' ||
      (this.currentSession.conversation_stage === 'cta' &&
       this.currentSession.free_messages_used >= CONFIG.FREE_MESSAGES_LIMIT)
    );
  }

  /**
   * Registrar efectividad de la sesión
   * @private
   */
  async _recordEffectiveness(outcome) {
    try {
      const outcomeMap = {
        'completed': 'satisfied_free',
        'redirected': 'tool_explored',
        'extended': 'session_extended',
        'abandoned': 'abandoned'
      };

      await supabase.from('ai_coaching_effectiveness').insert({
        session_id: this.currentSession.id,
        outcome: outcomeMap[outcome] || 'abandoned',
        led_to_script_generation: false, // Actualizar según lógica real
        led_to_upgrade: false,
        led_to_tool_usage: outcome === 'redirected'
      });

    } catch (error) {
      console.warn('⚠️ Error registrando efectividad:', error);
    }
  }
}

// ===== EXPORTAR INSTANCIA SINGLETON =====
const creoChatService = new CreoChatService();
export default creoChatService;

// ===== EXPORTAR CONFIGURACIÓN =====
export { CONFIG as CREO_CONFIG };
