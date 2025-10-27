import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart3, Wrench, Calendar, Menu, X, Home, FolderOpen, Coins, Award, History, UserCog, Bell, DoorOpen, Zap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Navbar = ({ isAuthenticated, onAuthClick, activeSection, onSectionChange, freeUsageCount }) => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const { toast } = useToast();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  const userPlan = 'free'; // Cambia a 'standard', 'premium' o 'free' para probar
  const userCredits = userPlan === 'free' ? 5 : userPlan === 'premium' ? 200 : 100;
  const userBadges = 3; // De 10 desbloqueables por niveles de uso

  const getAvatarRingClass = (plan) => {
    switch (plan) {
      case 'premium': return 'avatar-ring-premium';
      case 'standard': return 'avatar-ring-standard';
      default: return 'avatar-ring-free';
    }
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  });

  // Cierra el menú móvil al hacer clic fuera o con Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (event) => {
      const clickedOutsideMenu = mobileMenuRef.current && !mobileMenuRef.current.contains(event.target);
      const clickedOutsideButton = menuButtonRef.current && !menuButtonRef.current.contains(event.target);
      if (clickedOutsideMenu && clickedOutsideButton) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  // Navegación actualizada con nuevas secciones
  const navigationItems = [
    { id: 'landing', label: 'Inicio', icon: Home },
    { id: 'dashboard', label: 'Mi Craft Viral', icon: BarChart3, authRequired: true },
    { id: 'tools', label: 'Centro Creativo', icon: Wrench },
    // COMENTADO TEMPORALMENTE - Inbox/Mensajes sin sistema de mensajería backend
    // { id: 'inbox', label: 'Mensajes', icon: Inbox, authRequired: true },
    { id: 'calendar', label: 'Calendario', icon: Calendar, authRequired: true },
    { id: 'library', label: 'Biblioteca', icon: FolderOpen, authRequired: true },
    // COMENTADO TEMPORALMENTE - Chat sin backend funcional
    // { id: 'chat', label: 'Chat IA', icon: MessageSquare, authRequired: true },
  ];

  // Lógica de navegación modificada
  const handleNavClick = (item) => {
    setIsMobileMenuOpen(false);
    if (item.authRequired && !isAuthenticated) {
      toast({
        title: "Acceso restringido",
        description: "Debes iniciar sesión para acceder a esta función.",
        variant: "destructive"
      });
      onAuthClick();
    } else {
      onSectionChange(item.id);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
  };

  const getAvatarFallback = (name, email) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  }

  return (
    <motion.nav
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-purple-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onSectionChange('landing')}
            whileHover={{ scale: 1.05 }}
          >
            <img src="/ico-viral.svg" alt="ViralCraft" className="w-8 h-8" />
            <div className="relative">
              <span className="text-xl font-bold text-gradient">ViralCraft</span>
              <span className="absolute -top-3 -right-6 px-1 py-0.5 text-[7px] font-bold tracking-wide bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/50 rounded text-yellow-300 backdrop-blur-sm animate-pulse-soft shadow-lg shadow-yellow-500/20">
                BETA
              </span>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8 ml-16">
            {navigationItems.map((item) => { // Renderiza todos los items
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  type="button" // ✅ evita reload inesperado
                  onClick={() => handleNavClick(item)} // Pasa el ítem completo
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    activeSection === item.id 
                      ? 'bg-purple-600/20 text-purple-300' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className={`avatar-ring-wrapper ${getAvatarRingClass(userPlan)}`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 rounded-full" type="button"> 
                      <Avatar className="h-8 w-8">
                        <AvatarImage alt={user.user_metadata?.full_name || 'Avatar de usuario'} src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-purple-600">{getAvatarFallback(user.user_metadata?.full_name, user.email)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 glass-effect border-purple-500/20" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'Usuario'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {/* Plan/Poderes */}
                    <DropdownMenuItem className="cursor-default hover:bg-transparent focus:bg-transparent">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Zap className="mr-2 h-4 w-4 text-yellow-400" />
                          <span className="text-xs font-semibold">Plan/Poderes</span>
                        </div>
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                          userPlan === 'premium'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {userPlan}
                        </span>
                      </div>
                    </DropdownMenuItem>

                    {/* Créditos */}
                    <DropdownMenuItem className="cursor-default hover:bg-transparent focus:bg-transparent">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Coins className="mr-2 h-4 w-4 text-green-400" />
                          <span className="text-xs font-semibold">Créditos</span>
                        </div>
                        <span className="text-xs font-bold text-green-400">
                          {userCredits}
                        </span>
                      </div>
                    </DropdownMenuItem>

                    {/* Insignias */}
                    <DropdownMenuItem onSelect={() => onSectionChange('badges')}>
                      <Award className="mr-2 h-4 w-4 text-purple-400" />
                      <span className="text-xs">Insignias</span>
                      <span className="ml-auto text-xs text-gray-400">{userBadges}/10</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Mis Forjados (Historial) */}
                    <DropdownMenuItem onSelect={() => onSectionChange('history')}>
                      <History className="mr-2 h-4 w-4" />
                      <span className="text-xs">Mis Forjados</span>
                    </DropdownMenuItem>

                    {/* Cambiar Identidad (Perfil) */}
                    <DropdownMenuItem onSelect={() => onSectionChange('profile')}>
                      <UserCog className="mr-2 h-4 w-4" />
                      <span className="text-xs">Cambiar Identidad</span>
                    </DropdownMenuItem>

                    {/* Notificaciones */}
                    <DropdownMenuItem onSelect={() => onSectionChange('notifications')}>
                      <Bell className="mr-2 h-4 w-4" />
                      <span className="text-xs">Notificaciones</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Cerrar Portal (Cerrar Sesión) */}
                    <DropdownMenuItem onSelect={handleLogout} className="text-red-400 focus:text-red-400">
                      <DoorOpen className="mr-2 h-4 w-4" />
                      <span className="text-xs font-semibold">Cerrar Portal</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={onAuthClick}
                type="button" // ✅ importante
                className="gradient-primary hover:opacity-90 transition-opacity hidden sm:inline-flex relative"
              >
                {freeUsageCount > 0 && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold text-white bg-pink-500 rounded-full">
                      GRATIS
                  </span>
                )}
                Iniciar Sesión
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              type="button" // ✅ importante
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              ref={menuButtonRef}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-nav-menu"
            className="md:hidden border-t border-purple-500/20 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            ref={mobileMenuRef}
          >
            <div className="py-4 space-y-2 px-4">
              {navigationItems.map((item) => { // Renderiza todos los items en el menú móvil
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button" // ✅ importante
                      onClick={() => handleNavClick(item)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                        activeSection === item.id 
                          ? 'bg-purple-600/20 text-purple-300' 
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              {!isAuthenticated && (
                 <Button
                   onClick={() => {
                     onAuthClick();
                     setIsMobileMenuOpen(false);
                   }}
                   type="button" // ✅ importante
                   className="w-full gradient-primary hover:opacity-90 transition-opacity"
                 >
                   Iniciar Sesión
                 </Button>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
