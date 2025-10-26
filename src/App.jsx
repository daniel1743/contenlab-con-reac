import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import Dashboard from '@/components/Dashboard';
import Tools from '@/components/Tools';
import Calendar from '@/components/Calendar';
// COMENTADO TEMPORALMENTE - Chat sin backend funcional (solo UI mock)
// import Chat from '@/components/Chat';
import Inbox from '@/components/Inbox';
import ContentLibrary from '@/components/ContentLibrary';
import Settings from '@/components/Settings';
import Footer from '@/components/Footer';
import LandingPage from '@/components/LandingPage';
import FakeNotifications from '@/components/FakeNotifications';
import { useAuth } from '@/contexts/SupabaseAuthContext';
// COMENTADO TEMPORALMENTE - ThumbnailEditor solo 5% implementado (reemplazar con Canva SDK)
// import ThumbnailEditor from '@/components/thumbnail-editor/ThumbnailEditor';
import SubscriptionModal from '@/components/SubscriptionModal';
import SEOHead from '@/components/SEOHead';

function App() {
  const { session, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const isAuthenticated = !!session;
  
  // El estado inicial de la sección activa siempre será 'landing'.
  const [activeSection, setActiveSection] = useState('landing');
  // padding

  // Secciones que requieren autenticación obligatoria
  const protectedSections = useMemo(() =>
    ['dashboard', 'calendar', /* 'chat', */ 'inbox', 'library', 'settings'], // chat comentado temporalmente
    []
  );

  // Redirigir a 'landing' solo si el usuario cierra sesión en una sección protegida
  useEffect(() => {
    if (!isAuthenticated && protectedSections.includes(activeSection)) {
      setActiveSection('landing');
    }
  }, [isAuthenticated, activeSection, protectedSections]);

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
    // padding
    // padding
    // padding
    // padding
    // padding
    return true;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    // Aseguramos que las secciones protegidas solo se muestren si el usuario está autenticado.
    switch (activeSection) {
      case 'landing':
        return <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
      case 'dashboard':
        return isAuthenticated ? <Dashboard onSectionChange={handleSectionChange} /> : <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
      case 'inbox':
        return isAuthenticated ? <Inbox /> : <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
      case 'calendar':
        return isAuthenticated ? <Calendar /> : <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
      case 'library':
        return isAuthenticated ? <ContentLibrary /> : <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
      case 'tools':
        return <Tools onSectionChange={handleSectionChange} onGenerate={handleGenerateContent} onCopyDownload={handleCopyDownload} onAuthClick={() => setShowAuthModal(true)} onSubscriptionClick={() => setShowSubscriptionModal(true)} />;
      // COMENTADO TEMPORALMENTE - Chat sin backend funcional (mensajes hardcoded, no hay persistencia)
      // case 'chat':
      //   return isAuthenticated ? <Chat /> : <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
      case 'settings':
        return isAuthenticated ? <Settings /> : <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
      // COMENTADO TEMPORALMENTE - ThumbnailEditor solo 5% implementado vs Canva (no usable en producción)
      // case 'thumbnail-editor':
      //   return <ThumbnailEditor onBack={() => setActiveSection('tools')} onCopyDownload={handleCopyDownload} onAuthClick={() => setShowAuthModal(true)} />;
      default:
        return <LandingPage onAuthClick={() => setShowAuthModal(true)} onSectionChange={handleSectionChange} />;
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
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
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
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
        
        {activeSection === 'landing' && !loading && <Footer />}
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
        
        <SubscriptionModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          onAuthClick={() => {
            setShowSubscriptionModal(false);
            setShowAuthModal(true);
          }}
        />

        {/* activeSection !== 'thumbnail-editor' && */ <FakeNotifications />}
      </div>
    </>
  );
}

export default App;
