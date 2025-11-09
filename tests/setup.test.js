/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ⚙️ CONFIGURACIÓN DE TESTS                                      ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// Configurar variables de entorno para tests
process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://bouqpierlyeukedpxugk.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key-aqui';
process.env.VITE_DEEPSEEK_API_KEY = process.env.VITE_DEEPSEEK_API_KEY || 'sk-test-key';

// Mock de fetch para tests
global.fetch = jest.fn();

// Configurar timeout global para tests
jest.setTimeout(30000); // 30 segundos

console.log('✅ Setup de tests completado');
