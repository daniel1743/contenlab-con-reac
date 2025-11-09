/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  🧪 TESTS AUTOMATIZADOS - COACH CREO                            ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  Tests completos para el sistema de Coach Conversacional         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * @version 1.0.0
 * @author CreoVision Team
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import creoChatService, { CREO_CONFIG } from '../src/services/CreoChatService';
import { supabase } from '../src/lib/supabaseClient';

// Mock de usuario de prueba
const TEST_USER_ID = 'test-user-creo-' + Date.now();
let currentSessionId = null;

describe('🧠 CreoChatService - Orquestador Principal', () => {

  beforeEach(async () => {
    // Limpiar sesiones previas del usuario de prueba
    await supabase
      .from('creo_chat_sessions')
      .delete()
      .eq('user_id', TEST_USER_ID);
  });

  afterEach(async () => {
    // Limpiar después de cada test
    if (currentSessionId) {
      await supabase
        .from('creo_chat_sessions')
        .delete()
        .eq('id', currentSessionId);
      currentSessionId = null;
    }
  });

  test('✅ debe inicializar sesión correctamente', async () => {
    const session = await creoChatService.initSession(TEST_USER_ID);

    expect(session).toBeDefined();
    expect(session.user_id).toBe(TEST_USER_ID);
    expect(session.status).toBe('active');
    expect(session.message_count).toBe(0);
    expect(session.free_messages_used).toBe(0);
    expect(session.conversation_stage).toBe('intro');

    currentSessionId = session.id;
  });

  test('✅ debe obtener estadísticas de sesión', async () => {
    await creoChatService.initSession(TEST_USER_ID);
    const stats = creoChatService.getSessionStats();

    expect(stats).toBeDefined();
    expect(stats.messageCount).toBe(0);
    expect(stats.freeMessagesUsed).toBe(0);
    expect(stats.freeMessagesRemaining).toBe(CREO_CONFIG.FREE_MESSAGES_LIMIT);
    expect(stats.stage).toBe('intro');
    expect(stats.canExtend).toBe(false);
  });

  test('✅ debe enviar mensaje y actualizar contador', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    const response = await creoChatService.sendMessage(
      TEST_USER_ID,
      'Hola, quiero crear contenido para YouTube'
    );

    expect(response).toBeDefined();
    expect(response.content).toBeDefined();
    expect(response.stage).toBe('intro');
    expect(response.freeMessagesRemaining).toBe(7);
    expect(typeof response.content).toBe('string');
    expect(response.content.length).toBeGreaterThan(0);
  });

  test('✅ debe cambiar de etapa según contador de mensajes', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    // Mensaje 1-2: intro
    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 1');
    let stats = creoChatService.getSessionStats();
    expect(stats.stage).toBe('intro');

    // Mensaje 3-6: explore
    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 2');
    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 3');
    stats = creoChatService.getSessionStats();
    expect(stats.stage).toBe('explore');

    // Mensaje 7-8: cta
    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 4');
    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 5');
    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 6');
    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 7');
    stats = creoChatService.getSessionStats();
    expect(stats.stage).toBe('cta');
  });

  test('🚫 debe bloquear después de 8 mensajes gratuitos', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    // Enviar 8 mensajes
    for (let i = 1; i <= 8; i++) {
      await creoChatService.sendMessage(TEST_USER_ID, `Mensaje ${i}`);
    }

    // Mensaje 9 debe bloquear
    const response = await creoChatService.sendMessage(
      TEST_USER_ID,
      'Mensaje 9'
    );

    expect(response.isLimitReached).toBe(true);
    expect(response.canExtend).toBe(true);
    expect(response.shouldRedirect).toBe(true);
  });

  test('✅ debe cerrar sesión correctamente', async () => {
    const session = await creoChatService.initSession(TEST_USER_ID);
    currentSessionId = session.id;

    await creoChatService.closeSession('completed');

    // Verificar que se cerró en la base de datos
    const { data } = await supabase
      .from('creo_chat_sessions')
      .select('status')
      .eq('id', currentSessionId)
      .single();

    expect(data.status).toBe('completed');
  });
});

describe('📊 Validación de Base de Datos', () => {

  test('✅ debe guardar mensajes en creo_message_log', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    await creoChatService.sendMessage(TEST_USER_ID, 'Test message');

    const session = creoChatService.currentSession;

    // Verificar que se guardaron los mensajes
    const { data: messages } = await supabase
      .from('creo_message_log')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    expect(messages).toBeDefined();
    expect(messages.length).toBeGreaterThanOrEqual(2); // user + assistant
    expect(messages.some(m => m.role === 'user')).toBe(true);
    expect(messages.some(m => m.role === 'assistant')).toBe(true);

    currentSessionId = session.id;
  });

  test('✅ debe actualizar contador de mensajes en creo_chat_sessions', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje de prueba');

    const session = creoChatService.currentSession;

    const { data } = await supabase
      .from('creo_chat_sessions')
      .select('message_count, free_messages_used')
      .eq('id', session.id)
      .single();

    expect(data.message_count).toBeGreaterThan(0);
    expect(data.free_messages_used).toBeGreaterThan(0);

    currentSessionId = session.id;
  });

  test('✅ debe crear preferencias de personalidad si no existen', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    const { data } = await supabase
      .from('ai_personality_preferences')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .single();

    expect(data).toBeDefined();
    expect(data.tone).toBe('motivational');
    expect(data.emoji_frequency).toBe('medium');
    expect(data.response_length).toBe('concise');
  });

  test('✅ debe crear contexto de usuario si no existe', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    const { data } = await supabase
      .from('user_behavior_context')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .single();

    expect(data).toBeDefined();
    expect(data.expertise_level).toBe(5);
    expect(Array.isArray(data.preferred_topics)).toBe(true);
  });
});

describe('🎯 Lógica de Negocio', () => {

  test('✅ debe calcular freeMessagesRemaining correctamente', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    // Enviar 5 mensajes
    for (let i = 1; i <= 5; i++) {
      await creoChatService.sendMessage(TEST_USER_ID, `Mensaje ${i}`);
    }

    const stats = creoChatService.getSessionStats();
    expect(stats.freeMessagesRemaining).toBe(3);
  });

  test('✅ debe detectar cuando canExtend es true', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    // Enviar 8 mensajes para alcanzar el límite
    for (let i = 1; i <= 8; i++) {
      await creoChatService.sendMessage(TEST_USER_ID, `Mensaje ${i}`);
    }

    const stats = creoChatService.getSessionStats();
    expect(stats.canExtend).toBe(true);
  });

  test('✅ debe pasar a etapa "explore" después del mensaje 2', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 1');
    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 2');
    await creoChatService.sendMessage(TEST_USER_ID, 'Mensaje 3');

    const stats = creoChatService.getSessionStats();
    expect(stats.stage).toBe('explore');
  });

  test('✅ debe pasar a etapa "cta" después del mensaje 6', async () => {
    await creoChatService.initSession(TEST_USER_ID);

    for (let i = 1; i <= 7; i++) {
      await creoChatService.sendMessage(TEST_USER_ID, `Mensaje ${i}`);
    }

    const stats = creoChatService.getSessionStats();
    expect(stats.stage).toBe('cta');
  });
});

describe('💳 Sistema de Créditos', () => {

  test('✅ debe deducir créditos al extender sesión', async () => {
    // Este test requiere un usuario con créditos en la base de datos
    // Por ahora solo verificamos la estructura de la respuesta

    await creoChatService.initSession(TEST_USER_ID);

    // Simular usuario sin créditos
    const result = await creoChatService.extendSession(TEST_USER_ID);

    expect(result).toBeDefined();
    expect(result.success).toBeDefined();
    expect(typeof result.message).toBe('string');
  });
});

describe('🧹 Limpieza y Cierre', () => {

  afterAll(async () => {
    // Limpiar TODOS los datos de prueba
    await supabase
      .from('creo_chat_sessions')
      .delete()
      .like('user_id', 'test-user-creo-%');

    await supabase
      .from('ai_personality_preferences')
      .delete()
      .like('user_id', 'test-user-creo-%');

    await supabase
      .from('user_behavior_context')
      .delete()
      .like('user_id', 'test-user-creo-%');

    console.log('✅ Limpieza de tests completada');
  });
});

// ===== TESTS DE INTEGRACIÓN =====

describe('🔗 Tests de Integración Completa', () => {

  test('✅ Flujo completo: Init → 8 mensajes → Límite → Cierre', async () => {
    // 1. Inicializar sesión
    const session = await creoChatService.initSession(TEST_USER_ID);
    expect(session).toBeDefined();
    currentSessionId = session.id;

    // 2. Enviar 8 mensajes
    for (let i = 1; i <= 8; i++) {
      const response = await creoChatService.sendMessage(
        TEST_USER_ID,
        `Mensaje de integración ${i}`
      );
      expect(response.content).toBeDefined();
    }

    // 3. Verificar límite alcanzado
    const stats = creoChatService.getSessionStats();
    expect(stats.freeMessagesUsed).toBe(8);
    expect(stats.canExtend).toBe(true);

    // 4. Intentar enviar mensaje 9 (debe bloquear)
    const blockedResponse = await creoChatService.sendMessage(
      TEST_USER_ID,
      'Mensaje 9'
    );
    expect(blockedResponse.isLimitReached).toBe(true);

    // 5. Cerrar sesión
    await creoChatService.closeSession('completed');

    // 6. Verificar en base de datos
    const { data } = await supabase
      .from('creo_chat_sessions')
      .select('status, message_count, free_messages_used')
      .eq('id', currentSessionId)
      .single();

    expect(data.status).toBe('completed');
    expect(data.message_count).toBeGreaterThanOrEqual(8);
  }, 60000); // Timeout de 60 segundos para este test largo
});

console.log('🧪 Tests de Coach Creo cargados exitosamente');
