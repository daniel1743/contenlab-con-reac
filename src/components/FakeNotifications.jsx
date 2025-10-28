import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const GoogleIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.96l3.66 2.84c.87-2.6 3.3-4.42 6.16-4.42z" />
    </svg>
);

const FakeNotifications = () => {
  const [notification, setNotification] = useState(null);
  const userNotifications = [
    // México 🇲🇽
    { name: 'Ricardo Hernández', action: 'acaba de viralizar un reel', initials: 'RH', color: '#8b5cf6' },
    { name: 'Lupita Morales', action: 'está armando un video bien chido', initials: 'LM', color: '#ec4899' },
    { name: 'Javier el Chido', action: 'generó 3 thumbnails con IA', initials: 'JC', color: '#f59e0b' },
    { name: 'Paty González', action: 'mejoró un guion para TikTok', initials: 'PG', color: '#10b981' },
    { name: 'Miguel Ángel R.', action: 'exportó contenido pa\' Instagram', initials: 'MA', color: '#3b82f6' },
    { name: 'Karla Sánchez', action: 'está analizando qué pega ahorita', initials: 'KS', color: '#ef4444' },

    // Chile 🇨🇱
    { name: 'Cristian Valenzuela', action: 'sacó terrible thumbnail bacán', initials: 'CV', color: '#8b5cf6' },
    { name: 'Camila Fuentes', action: 'cachó una tendencia que pega caleta', initials: 'CF', color: '#ec4899' },
    { name: 'Matías po weon', action: 'hizo un video pulento pa\' YouTube', initials: 'MW', color: '#f59e0b' },
    { name: 'Javiera Rojas', action: 'generó ideas brigidas con IA', initials: 'JR', color: '#10b981' },
    { name: 'Gonzalo Torres', action: 'subió 5 shorts al tiro', initials: 'GT', color: '#3b82f6' },
    { name: 'Constanza Lagos', action: 'está viendo qué está de moda', initials: 'CL', color: '#ef4444' },

    // Venezuela 🇻🇪
    { name: 'José Ramírez', action: 'echó un video arrecho pa\' las redes', initials: 'JR', color: '#8b5cf6' },
    { name: 'Andreina Silva', action: 'creó un thumbnail que quedó brutal', initials: 'AS', color: '#ec4899' },
    { name: 'Carlos el Pana', action: 'analizó qué contenido está sonando', initials: 'CP', color: '#f59e0b' },
    { name: 'Mariangel Díaz', action: 'generó 10 ideas con la IA chévere', initials: 'MD', color: '#10b981' },
    { name: 'Luis Pérez', action: 'exportó un carrusel que está de pelos', initials: 'LP', color: '#3b82f6' },
    { name: 'Gabriela Méndez', action: 'mejoró el copy pa\' que pegue más', initials: 'GM', color: '#ef4444' },

    // Variedad general
    { name: 'Daniel Ortega', action: 'descubrió un nicho sin explotar', initials: 'DO', color: '#06b6d4' },
    { name: 'Sofía Martínez', action: 'optimizó su estrategia de contenido', initials: 'SM', color: '#a855f7' },
    { name: 'Fernando López', action: 'programó posts para toda la semana', initials: 'FL', color: '#84cc16' },
    { name: 'Valentina Ruiz', action: 'está probando un formato nuevo', initials: 'VR', color: '#f97316' },
    { name: 'Diego Vargas', action: 'analizó competencia y sacó ideas', initials: 'DV', color: '#14b8a6' },
    { name: 'Isabella Castro', action: 'creó 7 variaciones de un post', initials: 'IC', color: '#6366f1' },
    { name: 'Alejandro Reyes', action: 'encontró keywords con alto tráfico', initials: 'AR', color: '#ec4899' },
    { name: 'Daniela Flores', action: 'adaptó tendencia para su nicho', initials: 'DF', color: '#f59e0b' }
  ];

  useEffect(() => {
    const timeouts = [];

    const showNotification = () => {
      const randomNotification = userNotifications[Math.floor(Math.random() * userNotifications.length)];
      setNotification(randomNotification);

      const hideTimeout = setTimeout(() => {
        setNotification(null);
        scheduleNext();
      }, 5000);
      timeouts.push(hideTimeout);
    };

    const scheduleNext = () => {
      const randomInterval = Math.random() * (120000 - 20000) + 20000;
      const nextTimeout = setTimeout(showNotification, randomInterval);
      timeouts.push(nextTimeout);
    };

    // Show first notification faster
    const firstTimeout = setTimeout(showNotification, 5000);
    timeouts.push(firstTimeout);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="fixed bottom-5 left-5 z-[110]">
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.95 }} 
            transition={{ duration: 0.4, ease: "easeOut" }} 
            className="bg-[#1e293b] p-4 rounded-xl flex items-start space-x-4 border border-slate-700 shadow-2xl max-w-sm w-full"
          >
            <Avatar className="h-10 w-10 border-2 border-slate-600">
              <AvatarFallback style={{ backgroundColor: notification.color }} className="text-white font-semibold">
                {notification.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="text-sm text-slate-100">
                    <span className="font-bold">{notification.name}</span> {notification.action}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                    <GoogleIcon />
                    <span className="text-xs text-slate-400">hace un momento</span>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FakeNotifications;