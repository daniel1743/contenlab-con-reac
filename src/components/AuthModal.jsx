import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.96l3.66 2.84c.87-2.6 3.3-4.42 6.16-4.42z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89H8.207v-2.89H10.44V9.54c0-2.21 1.31-3.424 3.33-3.424.95 0 1.9.172 1.9.172v2.47h-1.26c-1.1 0-1.48.658-1.48 1.4v1.64h2.77l-.444 2.89h-2.326v7.028C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const AuthModal = ({ isOpen, onClose }) => {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  const handleAuthAttempt = async (authFunction) => {
    setIsLoading(true);
    await authFunction();
    setIsLoading(false);
  };

  const handleEmailAuth = async (type) => {
    if (type === 'register' && password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error de Registro",
        description: "Las contraseñas no coinciden. Por favor, inténtalo de nuevo.",
      });
      return;
    }

    let error;
    if (type === 'register') {
      ({ error } = await signUp(email, password, {
        data: { full_name: name }
      }));
       if (!error) {
        toast({
          title: "¡Cuenta creada!",
          description: "Revisa tu email para verificar tu cuenta.",
        });
        onClose();
      }
    } else {
      ({ error } = await signIn(email, password));
      if (!error) {
        toast({
          title: "¡Bienvenido de vuelta!",
          description: "Has iniciado sesión correctamente.",
        });
        onClose();
      }
    }
  };

  const handleSocialAuth = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (!error) {
      onClose();
    } else {
      toast({
        variant: "destructive",
        title: 'Error de Autenticación Social',
        description: error.error_description || error.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl lg:max-w-4xl md:max-w-3xl sm:max-w-md w-full max-h-[90vh] sm:max-h-[95vh] p-0 overflow-hidden rounded-2xl bg-white text-gray-900 flex flex-col">
        
        {/* Grid principal con altura controlada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0">
          
          {/* Panel Izquierdo - Imagen (oculto en móvil) */}
          <div className="hidden lg:flex flex-col justify-center items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
            >
              <img className="w-full max-w-xs" alt="Ilustración de una persona analizando el crecimiento en redes sociales" src="https://images.unsplash.com/photo-1675023112817-52b789fd2ef0" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-center mt-6 space-y-2">
              <h2 className="text-2xl font-bold text-gray-800">Desbloquea tu Potencial Creador</h2>
              <p className="text-gray-600 text-sm max-w-xs">Únete a la élite de creadores que usan IA para dominar las redes sociales.</p>
            </motion.div>
          </div>

          {/* Panel Derecho - Formulario con estructura de 3 secciones */}
          <div className="flex flex-col bg-white min-h-0">
            
            {/* Header - fijo arriba */}
            <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-100">
              <DialogHeader className="text-center lg:text-left">
                <DialogTitle className="text-2xl font-bold text-gradient">Accede a ContentLab Premium</DialogTitle>
              </DialogHeader>
            </div>

            {/* Contenido scrolleable - crece para llenar espacio */}
            <div className="flex-1 overflow-y-auto p-6 pt-4 pb-4">
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 rounded-lg">
                  <TabsTrigger value="login" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">Crear Cuenta</TabsTrigger>
                </TabsList>

                <motion.div key="social-buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50 text-gray-700" onClick={() => handleAuthAttempt(() => handleSocialAuth('google'))}>
                      <GoogleIcon />
                      <span className="ml-2">Google</span>
                    </Button>
                    <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50 text-gray-700" onClick={() => handleAuthAttempt(() => handleSocialAuth('facebook'))}>
                      <FacebookIcon />
                      <span className="ml-2">Facebook</span>
                    </Button>
                  </div>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">O continúa con</span></div>
                  </div>
                </motion.div>

                <AnimatePresence mode="wait">
                  <TabsContent key="login" value="login" asChild>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="email" type="email" placeholder="tu@email.com" className="pl-10 bg-gray-50 border-gray-300 text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button onClick={() => handleAuthAttempt(() => handleEmailAuth('login'))} disabled={isLoading} className="w-full gradient-primary text-white hover:opacity-90 transition-opacity">
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                      </Button>
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent key="register" value="register" asChild>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">Nombre completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="name" type="text" placeholder="Tu nombre" className="pl-10 bg-gray-50 border-gray-300 text-gray-900" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-register" className="text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="email-register" type="email" placeholder="tu@email.com" className="pl-10 bg-gray-50 border-gray-300 text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-register" className="text-gray-700">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="password-register" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password-register" className="text-gray-700">Confirmar Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="confirm-password-register" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-900" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button onClick={() => handleAuthAttempt(() => handleEmailAuth('register'))} disabled={isLoading} className="w-full gradient-primary text-white hover:opacity-90 transition-opacity">
                        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta Premium'}
                      </Button>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </div>
            
            {/* Footer - fijo abajo, SIEMPRE VISIBLE */}
            <div className="flex-shrink-0 p-6 pt-4 bg-white border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                Al continuar, aceptas nuestros{' '}
                <a href="#" className="underline hover:text-purple-600 font-medium">términos</a>
                {' '}y{' '}
                <a href="#" className="underline hover:text-purple-600 font-medium">política de privacidad</a>.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
