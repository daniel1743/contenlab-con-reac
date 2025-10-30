import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

// --- Iconos para Redes Sociales ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48" fill="currentColor">
    <path d="M44.5,20H24v8.5h11.8C34.7,33.9,30.1,37,24,37c-7.2,0-13-5.8-13-13s5.8-13,13-13c3.1,0,5.9,1.1,8.1,2.9l6.4-6.4C34.6,4.1,29.6,2,24,2C11.8,2,2,11.8,2,24s9.8,22,22,22c11,0,21-8,21-22.5C45,22.5,44.5,21.2,44.5,20z"></path>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89H8.207v-2.89H10.44V9.54c0-2.21 1.31-3.424 3.33-3.424.95 0 1.9.172 1.9.172v2.47h-1.26c-1.1 0-1.48.658-1.48 1.4v1.64h2.77l-.444 2.89h-2.326v7.028C18.343 21.128 22 16.991 22 12z" />
  </svg>
);
// --- Fin de Iconos ---

const AuthModal = ({ isOpen, onClose }) => {
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (type) => {
    setIsLoading(true);
    if (type === 'register') {
      if (password.length < 8) {
        toast({ variant: "destructive", title: "Contraseña Insegura", description: "La contraseña debe tener al menos 8 caracteres." });
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast({ variant: "destructive", title: "Error de Registro", description: "Las contraseñas no coinciden." });
        setIsLoading(false);
        return;
      }
      const { error } = await signUp(email, password, { data: { full_name: name } });
      if (error) {
        console.error('Error de registro:', error);
        toast({ 
          variant: "destructive", 
          title: "Error de Registro", 
          description: error.message || 'No se pudo crear la cuenta. Verifica tus datos e intenta nuevamente.' 
        });
      } else {
        toast({ 
          title: "¡Cuenta creada!", 
          description: "Revisa tu email para verificar tu cuenta. Si no lo ves, revisa tu carpeta de spam." 
        });
        onClose();
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ variant: "destructive", title: "Error de Inicio de Sesión", description: "Email o contraseña incorrectos." });
      } else {
        toast({ title: "¡Bienvenido de vuelta!", description: "Has iniciado sesión correctamente." });
        onClose();
      }
    }
    setIsLoading(false);
  };

  const handleSocialAuth = async (provider) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      toast({ variant: "destructive", title: 'Error de Autenticación', description: error.message });
    }
    setIsLoading(false);
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setShowPassword(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl lg:max-w-4xl md:max-w-3xl sm:max-w-md w-full max-h-[90vh] p-0 overflow-hidden rounded-2xl bg-white text-gray-900 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0">
          
          {/* Panel Izquierdo con imagen y animación dinámica */}
          <div className="hidden lg:flex flex-col justify-center items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 relative">
            <AnimatePresence>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center space-y-4 absolute"
              >
                <img 
                  className="w-full max-w-xs" 
                  alt="Ilustración representativa" 
                  src={activeTab === 'login' ? '/imagen-modal-login.png' : '/imagen-modal-registro.png'} 
                />
                <h2 className="text-2xl font-bold text-gray-800">
                  {activeTab === 'login' ? '¡Bienvenido de Vuelta!' : 'Desbloquea tu Potencial'}
                </h2>
                <p className="text-gray-600 text-sm max-w-xs">
                  {activeTab === 'login' ? 'Accede para continuar creando contenido increíble.' : 'Únete a la élite de creadores que usan IA.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Panel Derecho con formularios */}
          <div className="flex flex-col bg-white min-h-0">
            <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-100">
              <DialogHeader className="text-center lg:text-left">
                <DialogTitle className="text-2xl font-bold text-gradient">Accede a CreoVision Premium</DialogTitle>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-y-auto p-6 pt-4 pb-4">
              <Tabs defaultValue="login" value={activeTab} className="w-full" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 rounded-lg">
                  <TabsTrigger value="login" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md">Crear Cuenta</TabsTrigger>
                </TabsList>

                <motion.div key="social-buttons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-white hover:text-purple-600 hover:border-purple-500 transition-colors duration-200" onClick={() => handleSocialAuth('google')}>
                      <GoogleIcon />
                      <span className="ml-2">Google</span>
                    </Button>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-white hover:text-purple-600 hover:border-purple-500 transition-colors duration-200" onClick={() => handleSocialAuth('facebook')}>
                      <FacebookIcon />
                      <span className="ml-2">Facebook</span>
                    </Button>
                  </div>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">O continúa con</span></div>
                  </div>
                </motion.div>
                
                <AnimatePresence>
                  <TabsContent key="login" value="login" asChild>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="space-y-4">
                      {/* Formulario de Iniciar Sesión */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                          <Input id="email" type="email" placeholder="tu@email.com" className="pl-10 bg-gray-50 border-gray-300 text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                          <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button onClick={() => handleEmailAuth('login')} disabled={isLoading} className="w-full gradient-primary text-white hover:opacity-90 transition-opacity">
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                      </Button>
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent key="register" value="register" asChild>
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="space-y-4">
                      {/* Formulario de Crear Cuenta */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">Nombre completo</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                          <Input id="name" type="text" placeholder="Tu nombre" className="pl-10 bg-gray-50 border-gray-300 text-gray-900" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-register" className="text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                          <Input id="email-register" type="email" placeholder="tu@email.com" className="pl-10 bg-gray-50 border-gray-300 text-gray-900" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-register" className="text-gray-700">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                          <Input id="password-register" type={showPassword ? "text" : "password"} placeholder="Mínimo 8 caracteres" className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-900" value={password} onChange={(e) => setPassword(e.target.value)} />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password-register" className="text-gray-700">Confirmar Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                          <Input id="confirm-password-register" type={showPassword ? "text" : "password"} placeholder="Repite la contraseña" className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-900" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                      </div>
                      <Button onClick={() => handleEmailAuth('register')} disabled={isLoading} className="w-full gradient-primary text-white hover:opacity-90 transition-opacity">
                        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta Premium'}
                      </Button>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </Tabs>
            </div>
            
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