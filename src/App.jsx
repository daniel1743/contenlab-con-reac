import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LandingPage from '@/components/LandingPage';
import PWALoadingScreen from '@/components/PWALoadingScreen';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SEOHead from '@/components/SEOHead';
import { COOKIE_STORAGE_KEY } from '@/components/CookieConsentBanner';

// Lazy load de componentes pesados
const AuthModal = lazy(() => import('@/components/AuthModal'));
const Dashboard = lazy(() => import('@/components/DashboardDynamic'));
const Tools = lazy(() => import('@/components/Tools'));
const Calendar = lazy(() => import('@/components/Calendar'));
const ContentLibrary = lazy(() => import('@/components/ContentLibrary'));
const Settings = lazy(() => import('@/components/Settings'));
const FakeNotifications = lazy(() => import('@/components/FakeNotifications'));
const SubscriptionModal = lazy(() => import('@/components/SubscriptionModal'));
const Badges = lazy(() => import('@/components/Badges'));
const History = lazy(() => import('@/components/History'));
const Profile = lazy(() => import('@/components/Profile'));
const Notifications = lazy(() => import('@/components/Notifications'));
const Onboarding = lazy(() => import('@/components/Onboarding'));
const TermsModal = lazy(() => import('@/components/legal/TermsModal'));
const CookieConsentBanner = lazy(() => import('@/components/CookieConsentBanner'));

function App() {
  const { session, loading, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [hasDemoAccess, setHasDemoAccess] = useState(false);
  const isAuthenticated = !!session;
  const termsStorageKey = user ? `creovision_terms_accept_v1_${user.id}` : null;

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

      // Si no tiene perfil y no ha completado onboarding, mostrarlo
      if (!creatorProfile && !hasCompletedOnboarding) {
        // Esperar 1 segundo después de autenticarse para mostrar onboarding
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, loading]);
  
  useEffect(() => {
    if (!loading && user && cookiesAccepted && typeof window !== 'undefined' && termsStorageKey) {
      const hasAccepted = window.localStorage.getItem(termsStorageKey);
      setShowTermsModal(!hasAccepted);
    }

    if (!user) {
      setShowTermsModal(false);
    }
  }, [user, loading, termsStorageKey, cookiesAccepted]);
  
  // El estado inicial de la sección activa siempre será 'landing'.
  const [activeSection, setActiveSection] = useState('landing');
  // padding

  // Secciones que requieren autenticación obligatoria
  const protectedSections = useMemo(() =>
    ['dashboard', 'tools', 'calendar', /* 'chat', */ 'inbox', 'library', 'settings', 'badges', 'history', 'profile', 'notifications'], // chat comentado temporalmente
    []
  );

  // Redirigir a 'landing' solo si el usuario cierra sesión en una sección protegida
  useEffect(() => {
    if (!isAuthenticated && protectedSections.includes(activeSection)) {
      if (activeSection === 'tools' && hasDemoAccess) {
        return;
      }
      setActiveSection('landing');
    }
  }, [isAuthenticated, activeSection, protectedSections, hasDemoAccess]);

  useEffect(() => {
    if (isAuthenticated && hasDemoAccess) {
      setHasDemoAccess(false);
    }
  }, [isAuthenticated, hasDemoAccess]);

  const startDemoExperience = () => {
    setHasDemoAccess(true);
    setActiveSection('tools');
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
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

  const renderLanding = () => (
    <LandingPage
      onAuthClick={() => setShowAuthModal(true)}
      onSectionChange={handleSectionChange}
      onStartDemo={startDemoExperience}
    />
  );

  const renderContent = () => {
    if (loading) {
      return <PWALoadingScreen />;
    }

    // Aseguramos que las secciones protegidas solo se muestren si el usuario está autenticado.
    switch (activeSection) {
      case 'landing':
        return renderLanding();
      case 'dashboard':
        return isAuthenticated
          ? <Dashboard onSectionChange={handleSectionChange} />
          : renderLanding();
      // COMENTADO TEMPORALMENTE - Inbox sin sistema de mensajería backend
      // case 'inbox':
      //   return isAuthenticated ? <Inbox /> : <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
      case 'calendar':
        return isAuthenticated ? <Calendar /> : renderLanding();
      case 'library':
        return isAuthenticated
          ? <ContentLibrary onSubscriptionClick={() => setShowSubscriptionModal(true)} />
          : renderLanding();
      case 'tools':
        return (isAuthenticated || hasDemoAccess)
          ? (
            <Tools
              onSectionChange={handleSectionChange}
              onGenerate={handleGenerateContent}
              onCopyDownload={handleCopyDownload}
              onAuthClick={() => setShowAuthModal(true)}
              onSubscriptionClick={() => setShowSubscriptionModal(true)}
              isDemoUser={!isAuthenticated}
            />
          )
          : renderLanding();
      // COMENTADO TEMPORALMENTE - Chat sin backend funcional (mensajes hardcoded, no hay persistencia)
      // case 'chat':
      //   return isAuthenticated ? <Chat /> : <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
      case 'settings':
        return isAuthenticated ? <Settings /> : renderLanding();
      case 'badges':
        return isAuthenticated ? <Badges /> : renderLanding();
      case 'history':
        return isAuthenticated ? <History /> : renderLanding();
      case 'profile':
        return isAuthenticated ? <Profile /> : renderLanding();
      case 'notifications':
        return isAuthenticated ? <Notifications /> : renderLanding();
      // COMENTADO TEMPORALMENTE - ThumbnailEditor solo 5% implementado vs Canva (no usable en producción)
      // case 'thumbnail-editor':
      //   return <ThumbnailEditor onBack={() => setActiveSection('tools')} onCopyDownload={handleCopyDownload} onAuthClick={() => setShowAuthModal(true)} />;
      default:
        return renderLanding();
    }
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
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={activeSection !== 'landing' /* && activeSection !== 'thumbnail-editor' */ ? 'container mx-auto px-4 py-8' : ''}
            >
              <Suspense fallback={<PWALoadingScreen />}>
                {renderContent()}
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
                // Redirigir a Tools para comenzar a usar el generador
                setActiveSection('tools');
              }}
              onSkip={() => {
                localStorage.setItem('onboardingCompleted', 'true');
                setShowOnboarding(false);
              }}
            />
          )}

          {/* activeSection !== 'thumbnail-editor' && */ <FakeNotifications />}
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
      </div>
    </>
  );
}

export default App;
