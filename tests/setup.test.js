/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ⚙️ CONFIGURACIÓN DE TESTS                                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// Configurar variables de entorno para tests
const defaultSupabaseUrl = 'https://bouqpierlyeukedpxugk.supabase.co';
const defaultAnonKey = 'tu-anon-key-aqui';
const defaultServiceRole = 'service-role-test-key';
const defaultAiKey = 'sk-test-key';

process.env.SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || defaultServiceRole;
process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

process.env.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || defaultAiKey;
process.env.VITE_DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;

process.env.QWEN_API_KEY = process.env.QWEN_API_KEY || process.env.VITE_QWEN_API_KEY || defaultAiKey;
process.env.VITE_QWEN_API_KEY = process.env.VITE_QWEN_API_KEY || process.env.QWEN_API_KEY;

// Mock de fetch para tests
global.fetch = jest.fn();

// Configurar timeout global para tests
jest.setTimeout(30000); // 30 segundos

console.log('✅ Setup de tests completado');
