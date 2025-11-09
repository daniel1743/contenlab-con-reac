import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LandingPage from '@/components/LandingPage';
import PWALoadingScreen from '@/components/PWALoadingScreen';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SEOHead from '@/components/SEOHead';
import { COOKIE_STORAGE_KEY } from '@/components/CookieConsentBanner';
// import AIConciergeBubble from '@/components/AIConciergeBubble';
import CreoFloatingAssistant from '@/components/CreoFloatingAssistant';

// Lazy load de componentes pesados
const AuthModal = lazy(() => import('@/components/AuthModal'));
const Dashboard = lazy(() => import('@/components/DashboardDynamic'));
const Tools = lazy(() => import('@/components/Tools'));
const Calendar = lazy(() => import('@/components/Calendar'));
const ContentLibrary = lazy(() => import('@/components/ContentLibrary'));
const Settings = lazy(() => import('@/components/Settings'));
// const FakeNotifications = lazy(() => import('@/components/FakeNotifications'));
const SubscriptionModal = lazy(() => import('@/components/SubscriptionModal'));
const Badges = lazy(() => import('@/components/Badges'));
const History = lazy(() => import('@/components/History'));
const Profile = lazy(() => import('@/components/Profile'));
const Notifications = lazy(() => import('@/components/Notifications'));
const Onboarding = lazy(() => import('@/components/Onboarding'));
const TermsModal = lazy(() => import('@/components/legal/TermsModal'));
const CookieConsentBanner = lazy(() => import('@/components/CookieConsentBanner'));
const ResetPassword = lazy(() => import('@/components/ResetPassword'));
const ChannelAnalysisPage = lazy(() => import('@/components/ChannelAnalysisPage'));
const WeeklyTrends = lazy(() => import('@/components/WeeklyTrends'));
const CreatorProfile = lazy(() => import('@/components/CreatorProfile'));

function App() {
  const { session, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [hasDemoAccess, setHasDemoAccess] = useState(false);
  const isAuthenticated = !!session;
  const termsStorageKey = user ? `creovision_terms_accept_v1_${user.id}` : null;

  // Obtener la sección actual desde la URL
  const activeSection = location.pathname === '/' ? 'landing' : location.pathname.slice(1);

  // 🆕 Verificar si el usuario ya completó el onboarding
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consent = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      setCookiesAccepted(consent === 'accepted');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      const creatorProfile = localStorage.getItem('creatorProfile');
      const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');

      // 🚀 REDIRECT AUTOMÁTICO: Si está autenticado y en landing, redirigir SIEMPRE
      if (location.pathname === '/') {
        // Limpiar cache de landing para usuarios autenticados
        if (typeof window !== 'undefined' && 'caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              if (name.includes('landing') || name.includes('home')) {
                caches.delete(name);
              }
            });
          });
        }

        // Si no ha completado onboarding, mostrar onboarding primero
        if (!creatorProfile && !hasCompletedOnboarding) {
          const timer = setTimeout(() => {
            setShowOnboarding(true);
          }, 1000);
          return () => clearTimeout(timer);
        }

        // Si ya completó onboarding, ir directamente a mi-perfil
        navigate('/mi-perfil', { replace: true });
      }
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);
  
  useEffect(() => {
    if (!loading && user && cookiesAccepted && typeof window !== 'undefined' && termsStorageKey) {
      const hasAccepted = window.localStorage.getItem(termsStorageKey);
      setShowTermsModal(!hasAccepted);
    }

    if (!user) {
      setShowTermsModal(false);
    }
  }, [user, loading, termsStorageKey, cookiesAccepted]);
  
  // Secciones que requieren autenticación obligatoria
  const protectedSections = useMemo(() =>
    ['dashboard', 'calendar', /* 'chat', */ 'inbox', 'library', 'settings', 'badges', 'history', 'profile', 'notifications'], // chat comentado temporalmente
    []
  );

  // Redirigir a '/' solo si el usuario cierra sesión en una sección protegida
  useEffect(() => {
    if (!isAuthenticated && protectedSections.includes(activeSection)) {
      navigate('/');
    }
  }, [isAuthenticated, activeSection, protectedSections, navigate]);

  useEffect(() => {
    if (isAuthenticated && hasDemoAccess) {
      setHasDemoAccess(false);
    }
  }, [isAuthenticated, hasDemoAccess]);

  const startDemoExperience = () => {
    setHasDemoAccess(true);
    navigate('/tools');
  };

  const handleSectionChange = (section) => {
    if (section === 'landing') {
      navigate('/');
    } else {
      navigate(`/${section}`);
    }
  };

  const handleGenerateContent = () => {
    // padding
    // padding
    // padding
    // padding
    // padding
    // padding
    // padding
    // padding
    return true;
  };

  const handleCopyDownload = () => {
    if (!isAuthenticated) {
      setShowSubscriptionModal(true);
      return false;
    }
    return true;
  };

  // Componente para proteger rutas que requieren autenticación
  const ProtectedRoute = ({ children }) => {
    // ⚡ OPTIMIZACIÓN: Mostrar contenido parcial mientras carga (mejor UX)
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando...</p>
          </div>
        </div>
      );
    }
    if (!isAuthenticated) return <Navigate to="/" replace />;
    return children;
  };

  // Componente para rutas que permiten demo mode
  const ToolsRoute = ({ children }) => {
    // ⚡ OPTIMIZACIÓN: Mostrar contenido parcial mientras carga
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando...</p>
          </div>
        </div>
      );
    }
    if (!isAuthenticated && !hasDemoAccess) return <Navigate to="/" replace />;
    return children;
  };

  // Determinar qué schemas de structured data incluir según la sección
  const getSchemas = () => {
    const baseSchemas = ['organization', 'website'];

    switch (activeSection) {
      case 'landing':
        return [...baseSchemas, 'webApplication', 'faqPage', 'softwareApplication'];
      case 'tools':
      // case 'thumbnail-editor': // COMENTADO TEMPORALMENTE
        return [...baseSchemas, 'webApplication'];
      case 'pricing':
        return [...baseSchemas, 'webApplication', 'softwareApplication'];
      default:
        return baseSchemas;
    }
  };

  return (
    <>
      {/* SEO Head dinámico según la sección activa */}
      <SEOHead page={activeSection} schemas={getSchemas()} />

      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        {/* activeSection !== 'thumbnail-editor' && */ (
          <Navbar
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setShowAuthModal(true)}
            hasDemoAccess={hasDemoAccess}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            onSubscriptionClick={() => setShowSubscriptionModal(true)}
            // padding
          />
        )}

        <main className={`flex-grow ${activeSection !== 'landing' /* && activeSection !== 'thumbnail-editor' */ ? 'pt-20' : 'pt-0'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={activeSection !== 'landing' /* && activeSection !== 'thumbnail-editor' */ ? 'container mx-auto px-4 py-8' : ''}
            >
              <Suspense fallback={<PWALoadingScreen />}>
                <Routes>
                  {/* Ruta principal - Landing Page */}
                  <Route
                    path="/"
                    element={
                      <LandingPage
                        onAuthClick={() => setShowAuthModal(true)}
                        onSectionChange={handleSectionChange}
                        onStartDemo={startDemoExperience}
                      />
                    }
                  />

                  {/* Rutas protegidas - Requieren autenticación */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard onSectionChange={handleSectionChange} />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/calendar"
                    element={
                      <ProtectedRoute>
                        <Calendar />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/library"
                    element={
                      <ProtectedRoute>
                        <ContentLibrary onSubscriptionClick={() => setShowSubscriptionModal(true)} />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/badges"
                    element={
                      <ProtectedRoute>
                        <Badges />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <History />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />

                  {/* Tools - Permite demo mode o autenticación */}
                  <Route
                    path="/tools"
                    element={
                      <ToolsRoute>
                        <Tools
                          onSectionChange={handleSectionChange}
                          onGenerate={handleGenerateContent}
                          onCopyDownload={handleCopyDownload}
                          onAuthClick={() => setShowAuthModal(true)}
                          onSubscriptionClick={() => setShowSubscriptionModal(true)}
                          isDemoUser={!isAuthenticated}
                        />
                      </ToolsRoute>
                    }
                  />

                  {/* Ruta pública de reset password */}
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Ruta de análisis de canal de YouTube */}
                  <Route path="/channel-analysis" element={<ChannelAnalysisPage />} />

                  {/* Ruta de Tendencias de la Semana */}
                  <Route path="/tendencias" element={<WeeklyTrends />} />

                  {/* Ruta de Perfil de Creador */}
                  <Route
                    path="/mi-perfil"
                    element={
                      <ProtectedRoute>
                        <CreatorProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rutas comentadas/eliminadas - Redirect a home para evitar 404 */}
                  <Route path="/chat" element={<Navigate to="/" replace />} />
                  <Route path="/inbox" element={<Navigate to="/" replace />} />
                  <Route path="/thumbnail-editor" element={<Navigate to="/" replace />} />

                  {/* Ruta 404 - Redirigir a home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
        
        {activeSection === 'landing' && !loading && <Footer />}

        <Suspense fallback={null}>
          {showAuthModal && (
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
            />
          )}

          {showSubscriptionModal && (
            <SubscriptionModal
              isOpen={showSubscriptionModal}
              onClose={() => setShowSubscriptionModal(false)}
              onAuthClick={() => {
                setShowSubscriptionModal(false);
                setShowAuthModal(true);
              }}
            />
          )}

          {/* 🚀 ONBOARDING PROFESIONAL - 3 FASES */}
          {showOnboarding && (
            <Onboarding
              onComplete={(profile) => {
                console.log('✅ Perfil de creador guardado:', profile);
                localStorage.setItem('onboardingCompleted', 'true');
                setShowOnboarding(false);
                // 🎯 CAMBIO: Redirigir a perfil en lugar de tools
                navigate('/mi-perfil');
              }}
              onSkip={() => {
                localStorage.setItem('onboardingCompleted', 'true');
                setShowOnboarding(false);
              }}
            />
          )}

          {/* FakeNotifications - Solo mostrar si no hay errores de carga */}
          {/* <Suspense fallback={null}>
            <FakeNotifications />
          </Suspense> */}
          {!cookiesAccepted && !showTermsModal && (
            <CookieConsentBanner onAccept={() => setCookiesAccepted(true)} />
          )}
          {showTermsModal && isAuthenticated && (
            <TermsModal
              open={showTermsModal && isAuthenticated}
              onAccept={() => {
                if (typeof window !== 'undefined' && termsStorageKey) {
                  window.localStorage.setItem(termsStorageKey, new Date().toISOString());
                }
                setShowTermsModal(false);
              }}
            />
          )}
        </Suspense>

        {/* AI Concierge Bubble (Asistente original) */}
        {/* <AIConciergeBubble /> */}

        {/* Coach Creo - Solo para usuarios autenticados */}
        {isAuthenticated && user && (
          <CreoFloatingAssistant
            userContext={{
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Creador',
              plan: user.user_metadata?.plan || 'FREE',
              topic: null // Puedes agregar lógica para detectar el último tema buscado
            }}
          />
        )}
      </div>
    </>
  );
}

export default App;
