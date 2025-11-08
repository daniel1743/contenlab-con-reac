import express from 'express';
import { generateContent as generateGemini } from '../services/gemini.service.js';
import { generateContent as generateDeepSeek } from '../services/deepseek.service.js';
import { generateContent as generateQwen } from '../services/qwen.service.js';

const router = express.Router();

// ============================================
// POST /api/ai/chat
// Endpoint principal para el chatbot Creo
// ============================================
router.post('/chat', async (req, res) => {
  try {
    const { messages, personaPrompt, provider, model, sessionId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'messages array is required'
      });
    }

    // Construir el prompt completo
    const systemMessage = personaPrompt || 'Eres Creo, un asistente creativo para creadores de contenido.';
    const userMessage = messages[messages.length - 1]?.content || '';

    const fullPrompt = `${systemMessage}\n\nConversación:\n${messages.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nassistant:`;

    let response;
    let usedProvider = provider || 'gemini'; // Default a Gemini

    // Intentar con el provider solicitado
    try {
      if (provider === 'deepseek') {
        response = await generateDeepSeek(fullPrompt);
        usedProvider = 'deepseek';
      } else if (provider === 'qwen') {
        response = await generateQwen(fullPrompt);
        usedProvider = 'qwen';
      } else {
        response = await generateGemini(fullPrompt);
        usedProvider = 'gemini';
      }
    } catch (error) {
      console.error(`❌ Error con ${provider}:`, error.message);

      // Fallback a Gemini si falla el provider solicitado
      if (provider !== 'gemini') {
        console.log('🔄 Intentando fallback a Gemini...');
        response = await generateGemini(fullPrompt);
        usedProvider = 'gemini';
      } else {
        throw error;
      }
    }

    res.json({
      success: true,
      message: response,
      provider: usedProvider,
      model: model || 'default',
      sessionId: sessionId,
      metadata: {
        timestamp: new Date().toISOString(),
        messagesProcessed: messages.length
      }
    });

  } catch (error) {
    console.error('❌ Error in /api/ai/chat:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error generating AI response',
      provider: req.body.provider
    });
  }
});

// ============================================
// POST /api/ai/generate
// Endpoint genérico para generación de contenido
// ============================================
router.post('/generate', async (req, res) => {
  try {
    const { prompt, provider = 'gemini', options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'prompt is required'
      });
    }

    let response;

    switch (provider) {
      case 'deepseek':
        response = await generateDeepSeek(prompt, options);
        break;
      case 'qwen':
        response = await generateQwen(prompt, options);
        break;
      case 'gemini':
      default:
        response = await generateGemini(prompt, options);
        break;
    }

    res.json({
      success: true,
      content: response,
      provider,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in /api/ai/generate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// GET /api/ai/health
// Verificar estado de las APIs
// ============================================
router.get('/health', async (req, res) => {
  const health = {
    gemini: { status: 'unknown' },
    deepseek: { status: 'unknown' },
    qwen: { status: 'unknown' }
  };

  // Verificar cada servicio
  try {
    await generateGemini('test');
    health.gemini = { status: 'healthy' };
  } catch (error) {
    health.gemini = { status: 'error', message: error.message };
  }

  try {
    await generateDeepSeek('test');
    health.deepseek = { status: 'healthy' };
  } catch (error) {
    health.deepseek = { status: 'error', message: error.message };
  }

  try {
    await generateQwen('test');
    health.qwen = { status: 'healthy' };
  } catch (error) {
    health.qwen = { status: 'error', message: error.message };
  }

  res.json({
    timestamp: new Date().toISOString(),
    services: health
  });
});

export default router;
