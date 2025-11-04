import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2 } from 'lucide-react';
import { generateLandingConciergeMessage } from '@/services/qwenConciergeService';

const STORAGE_KEY = 'creovision_last_channel_analysis';

const parseStoredContext = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to parse concierge context', error);
    return null;
  }
};

const AIConciergeBubble = () => {
  const [context, setContext] = useState(() => parseStoredContext());
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const shouldTrigger = useMemo(() => {
    if (!context) {
      return false;
    }
    const ONE_DAY = 24 * 60 * 60 * 1000;
    return Date.now() - (context.timestamp || 0) < ONE_DAY;
  }, [context]);

  useEffect(() => {
    if (!shouldTrigger) {
      return;
    }

    const fetchMessage = async () => {
      setIsOpen(true);
      setLoading(true);
      setError('');

      try {
        const conciergeMessage = await generateLandingConciergeMessage(context);
        setMessage(conciergeMessage);
      } catch (err) {
        console.error('AI concierge failed:', err);
        setError('Hola, estoy trabajando en tu resumen pero hubo un pequeño tropiezo. Mientras tanto, explora la landing y vuelve en un momento ❤️');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [context, shouldTrigger]);

  const handleDismiss = () => {
    setIsOpen(false);
    setTimeout(() => {
      setContext(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }, 300);
  };

  if (!context || !shouldTrigger) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-[70] w-full max-w-xs sm:max-w-sm"
        >
          <div className="relative rounded-3xl border border-purple-400/30 bg-gradient-to-br from-[#191433] via-[#221a3d] to-[#130f27] shadow-2xl shadow-purple-900/40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 blur-3xl" />
            <div className="relative p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-purple-500/20 p-2 text-purple-200">
                  <Sparkles className="h-5 w-5 animate-pulse" />
                </div>
                <div className="flex-1 text-sm text-slate-200 leading-relaxed">
                  <p className="text-xs uppercase tracking-widest text-purple-300/80 mb-1">
                    Aurora · Tu anfitriona IA
                  </p>
                  {loading && (
                    <div className="flex items-center gap-2 text-purple-200">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparando ideas frescas a partir de tu análisis...
                    </div>
                  )}
                  {!loading && (
                    <div className="space-y-2">
                      {(error || message)
                        .split('\n')
                        .filter(Boolean)
                        .map((line, idx) => (
                          <p key={idx}>{line.trim()}</p>
                        ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="rounded-full p-1 text-purple-200/70 transition hover:bg-purple-500/20 hover:text-purple-50"
                  aria-label="Cerrar mensaje de Aurora"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {!loading && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDismiss}
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-700/40 transition hover:shadow-purple-500/60"
                >
                  Seguir explorando la landing
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIConciergeBubble;

