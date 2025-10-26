import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sparkles, BarChart3, Wrench, Calendar, Settings, User, LogOut, Menu, X, MessageSquare, Home, Crown, Inbox, FolderOpen } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Navbar = ({ isAuthenticated, onAuthClick, activeSection, onSectionChange, freeUsageCount }) => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  const userPlan = 'premium'; // Cambia a 'standard' o 'free' para probar

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

  // Navegación actualizada con nuevas secciones
  const navigationItems = [
    { id: 'landing', label: 'Inicio', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, authRequired: true },
    { id: 'tools', label: 'Centro Creativo', icon: Wrench },
    { id: 'inbox', label: 'Mensajes', icon: Inbox, authRequired: true },
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
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="relative">
              <span className="text-xl font-bold text-gradient">ViralCraft</span>
              <span className="absolute -top-3 -right-6 px-1 py-0.5 text-[7px] font-bold tracking-wide bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/50 rounded text-yellow-300 backdrop-blur-sm animate-pulse-soft shadow-lg shadow-yellow-500/20">
                BETA
              </span>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
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
                  <DropdownMenuContent className="w-56 glass-effect border-purple-500/20" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'Usuario'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <div className="flex items-center pt-2">
                          <Crown className="mr-2 h-4 w-4 text-yellow-400" />
                          <p className="text-xs font-semibold uppercase text-gray-400">
                            Plan {userPlan}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onSectionChange('profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSectionChange('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar sesión</span>
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
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-purple-500/20 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
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
