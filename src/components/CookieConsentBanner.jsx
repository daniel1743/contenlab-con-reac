import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'creovision_cookie_consent_v1';

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasConsented = window.localStorage.getItem(STORAGE_KEY);
      if (!hasConsented) {
        setVisible(true);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, 'accepted');
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-6 z-[70] md:inset-x-auto md:right-6 md:max-w-xl bg-gray-900/95 border border-purple-500/30 backdrop-blur-lg rounded-2xl shadow-lg p-6 text-sm text-gray-200">
      <div className="space-y-3">
        <p className="font-semibold text-white">Usamos cookies para mejorar tu experiencia</p>
        <p className="text-gray-300 leading-relaxed">
          CreoVision emplea cookies esenciales y analíticas para garantizar el funcionamiento seguro de la plataforma,
          recordar tus preferencias y analizar el rendimiento. Al aceptar, nos ayudas a ofrecerte una experiencia más
          personalizada. Puedes revisar cómo tratamos tus datos en los Términos y la Política de Privacidad.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleAccept} className="bg-purple-600 hover:bg-purple-500 text-white">
            Aceptar cookies
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-purple-300 hover:text-purple-200 underline-offset-4 hover:underline px-0"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Ver Términos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
