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
    { name: 'Juan Pérez', action: 'está creando contenido', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'María G.', action: 'dejó un comentario', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Carlos R.', action: 'analizó una tendencia', avatar: 'https://randomuser.me/api/portraits/men/46.jpg' },
    { name: 'Ana López', action: 'exportó una miniatura', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { name: 'Luis Fer', action: 'mejoró un guion con IA', avatar: 'https://randomuser.me/api/portraits/men/75.jpg' }
  ];

  useEffect(() => {
    let timeoutId;

    const showNotification = () => {
      const randomNotification = userNotifications[Math.floor(Math.random() * userNotifications.length)];
      setNotification(randomNotification);

      setTimeout(() => {
        setNotification(null);
        scheduleNext();
      }, 5000);
    };

    const scheduleNext = () => {
      const randomInterval = Math.random() * (120000 - 20000) + 20000; // Shorter interval for demo
      timeoutId = setTimeout(showNotification, randomInterval);
    };

    // Show first notification faster
    const firstTimeout = setTimeout(showNotification, 5000);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(firstTimeout);
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
              <AvatarImage src={notification.avatar} alt={notification.name} />
              <AvatarFallback>{notification.name.charAt(0)}</AvatarFallback>
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