import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@/App';
import '@/index.css';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import { initErrorTracking } from '@/lib/errorTracking';

// Inicializar error tracking global
initErrorTracking();

// ⚡ OPTIMIZACIÓN: Preload de rutas comunes después de carga inicial
if (typeof window !== 'undefined') {
  // Esperar a que la página cargue completamente
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Preload de componentes más usados en background
      Promise.all([
        import('@/components/DashboardDynamic'),
        import('@/components/Tools'),
        import('@/components/Calendar')
      ]).catch(() => {
        // Ignorar errores silenciosamente
      });
    }, 2000); // Esperar 2 segundos después de la carga
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
