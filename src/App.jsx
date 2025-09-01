
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import Dashboard from '@/components/Dashboard';
import Tools from '@/components/Tools';
import Calendar from '@/components/Calendar';
import Chat from '@/components/Chat';
import Footer from '@/components/Footer';
import LandingPage from '@/components/LandingPage';
import FakeNotifications from '@/components/FakeNotifications';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import ThumbnailEditor from '@/components/thumbnail-editor/ThumbnailEditor';
import SubscriptionModal from '@/components/SubscriptionModal';

function App() {
  const { session, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [activeSection, setActiveSection] = useState('landing');
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const isAuthenticated = !!session;

  useEffect(() => {
    if (isAuthenticated) {
      setActiveSection('dashboard');
    } else {
      setActiveSection('landing');
    }
  }, [isAuthenticated]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleGenerateContent = () => {
    if (!isAuthenticated && freeUsageCount >= 1) {
      setShowSubscriptionModal(true);
      return false;
    }
    if (!isAuthenticated) {
      setFreeUsageCount(prev => prev + 1);
    }
    return true;
  };

  const handleCopyDownload = () => {
    if (!isAuthenticated) {
      setShowSubscriptionModal(true);
      return false;
    }
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

    switch (activeSection) {
      case 'landing':
        return <LandingPage onAuthClick={() => setShowAuthModal(true)} />;
      case 'dashboard':
        return <Dashboard onSectionChange={handleSectionChange} />;
      case 'tools':
        return <Tools onSectionChange={handleSectionChange} onGenerate={handleGenerateContent} onCopyDownload={handleCopyDownload} />;
      case 'calendar':
        return <Calendar />;
      case 'chat':
        return <Chat />;
      case 'thumbnail-editor':
        return <ThumbnailEditor onBack={() => setActiveSection('tools')} onCopyDownload={handleCopyDownload} />;
      default:
        return isAuthenticated ? <Dashboard onSectionChange={handleSectionChange} /> : <LandingPage onAuthClick={() => setShowAuthModal(true)} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>ContentLab Premium - Suite Profesional de Creación de Contenido</title>
        <meta name="description" content="Plataforma todo-en-uno para creadores de contenido digital. Herramientas profesionales de IA, análisis de tendencias y editor de miniaturas avanzado." />
        <meta property="og:title" content="ContentLab Premium - Suite Profesional de Creación de Contenido" />
        <meta property="og:description" content="Transforma tu presencia digital con herramientas profesionales de IA, analytics avanzados y un editor de miniaturas de nivel profesional." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-900 text-white">
        {activeSection !== 'thumbnail-editor' && (
          <Navbar
            isAuthenticated={isAuthenticated}
            onAuthClick={() => setShowAuthModal(true)}
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            freeUsageCount={freeUsageCount}
          />
        )}

        <main className={`flex-grow ${activeSection !== 'landing' && activeSection !== 'thumbnail-editor' ? 'pt-20' : 'pt-0'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={activeSection !== 'landing' && activeSection !== 'thumbnail-editor' ? 'container mx-auto px-4 py-8' : ''}
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

        {activeSection !== 'thumbnail-editor' && <FakeNotifications />}
      </div>
    </>
  );
}

export default App;
