import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// Heroicons imports for professional iconography
import {
  SparklesIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  InboxIcon,
  FolderOpenIcon,
  BanknotesIcon,
  TrophyIcon,
  ClockIcon,
  UserCircleIcon,
  BellIcon,
  ArrowRightStartOnRectangleIcon,
  BoltIcon,
  FireIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

import {
  SparklesIcon as SparklesSolidIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import CreditBalance, { useCreditBalance } from '@/components/CreditBalance';

const Navbar = ({ isAuthenticated, onAuthClick, activeSection, onSectionChange, freeUsageCount, onSubscriptionClick, hasDemoAccess }) => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  // Hook de créditos real
  const { credits: userCreditsData, plan: userPlanData } = useCreditBalance();

  // Estado para foto y nombre de perfil desde localStorage
  const [profileData, setProfileData] = useState({
    fullName: '',
    profileImage: ''
  });

  // Cargar datos de perfil desde localStorage
  React.useEffect(() => {
    const loadProfileData = () => {
      const savedData = localStorage.getItem('creovision_profile_data');
      const savedImage = localStorage.getItem('creovision_profile_image');

      if (savedData) {
        const data = JSON.parse(savedData);
        setProfileData({
          fullName: data.fullName || user?.user_metadata?.full_name || '',
          profileImage: savedImage || user?.user_metadata?.avatar_url || ''
        });
      } else {
        setProfileData({
          fullName: user?.user_metadata?.full_name || '',
          profileImage: savedImage || user?.user_metadata?.avatar_url || ''
        });
      }
    };

    loadProfileData();

    // Escuchar evento de actualización de perfil
    const handleProfileUpdate = (event) => {
      setProfileData({
        fullName: event.detail.fullName,
        profileImage: event.detail.profileImage
      });
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  // Usar datos reales si están disponibles, sino fallback hardcodeado
  const userPlan = userPlanData || 'free';
  const userCredits = userCreditsData?.total || 0;
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

  // Navegación actualizada con nuevas secciones
  const navigationItems = [
    { id: 'landing', label: 'Inicio', icon: HomeIcon },
    { id: 'dashboard', label: 'CreoVision Intelligence', icon: ChartBarIcon, authRequired: true },
    { id: 'growth-dashboard', label: 'Growth Dashboard', icon: RocketLaunchIcon, authRequired: true, badge: '380', premium: true }, // 🆕 GROWTH DASHBOARD
    { id: 'tools', label: 'Centro Creativo', icon: WrenchScrewdriverIcon, authRequired: true },
    { id: 'tendencias', label: 'Tendencias', icon: FireIcon, authRequired: false }, // 🆕 TENDENCIAS
    // COMENTADO TEMPORALMENTE - Inbox/Mensajes sin sistema de mensajería backend
    // { id: 'inbox', label: 'Mensajes', icon: InboxIcon, authRequired: true },
    { id: 'calendar', label: 'Calendario', icon: CalendarIcon, authRequired: true },
    { id: 'library', label: 'Biblioteca', icon: FolderOpenIcon, authRequired: true },
    // COMENTADO TEMPORALMENTE - Chat sin backend funcional
    // { id: 'chat', label: 'Chat IA', icon: ChatBubbleLeftRightIcon, authRequired: true },
  ];

  // Lógica de navegación modificada
  const handleNavClick = (item) => {
    setIsMobileMenuOpen(false);
    const requiresAuth = item.authRequired && !isAuthenticated && !(item.id === 'tools' && hasDemoAccess);
    if (requiresAuth) {
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

  // ⚡ OPTIMIZACIÓN: Preload de rutas al hacer hover
  const handleNavHover = (item) => {
    if (item.id === 'dashboard') {
      import('@/components/DashboardDynamic');
    } else if (item.id === 'growth-dashboard') {
      import('@/components/GrowthDashboard');
    } else if (item.id === 'tools') {
      import('@/components/Tools');
    } else if (item.id === 'calendar') {
      import('@/components/Calendar');
    } else if (item.id === 'library') {
      import('@/components/ContentLibrary');
    }
    // Preload de otros componentes según necesidad
  };

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'No se pudo cerrar sesión',
        description: error.message || 'Intenta nuevamente en unos segundos.',
      });
      return;
    }

    setIsMobileMenuOpen(false);

    try {
      localStorage.removeItem('creatorProfile');
      localStorage.removeItem('onboardingCompleted');
    } catch (_) {
      // ignore storage errors
    }

    onSectionChange('landing');

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
            <img src="/robot.png" alt="CreoVision" className="w-10 h-10 rounded-full object-cover" />
            <div className="relative">
              <span className="text-xl font-bold text-gradient">CreoVision</span>
              {/* BETA badge comentado temporalmente */}
              {/* <span className="absolute -top-3 -right-6 px-1 py-0.5 text-[7px] font-bold tracking-wide bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/50 rounded text-yellow-300 backdrop-blur-sm animate-pulse-soft shadow-lg shadow-yellow-500/20">
                BETA
              </span> */}
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
                  onMouseEnter={() => handleNavHover(item)} // ⚡ Preload al hover
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
            {isAuthenticated && user && (
              <CreditBalance
                onBuyCredits={() => onSectionChange('packages')}
                onUpgradePlan={() => onSubscriptionClick?.()}
              />
            )}

            {isAuthenticated && user ? (
              <div className={`avatar-ring-wrapper ${getAvatarRingClass(userPlan)}`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity" type="button">
                      <Avatar className="h-8 w-8 cursor-pointer">
                        <AvatarImage alt={profileData.fullName || user.user_metadata?.full_name || 'Avatar de usuario'} src={profileData.profileImage || user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-purple-600">{getAvatarFallback(profileData.fullName || user.user_metadata?.full_name, user.email)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 glass-effect border-purple-500/20" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2">
                        <p className="text-sm font-medium leading-none">{profileData.fullName || user.user_metadata?.full_name || 'Usuario'}</p>
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
                          <BoltIcon className="mr-2 h-4 w-4 text-yellow-400 stroke-[2]" />
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
                          <BanknotesIcon className="mr-2 h-4 w-4 text-purple-400 stroke-[2]" />
                          <span className="text-xs font-semibold">Créditos</span>
                        </div>
                        <span className="text-xs font-bold text-purple-400">
                          {userCredits.toLocaleString()}
                        </span>
                      </div>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Actualizar Plan - Solo si NO es premium */}
                    {userPlan !== 'premium' && (
                      <DropdownMenuItem
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onSubscriptionClick?.();
                        }}
                        className="cursor-pointer bg-gradient-to-r from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 hover:to-amber-500/20 border border-yellow-500/30"
                      >
                        <TrophyIcon className="mr-2 h-4 w-4 text-yellow-400 stroke-[2]" />
                        <span className="text-xs font-bold text-yellow-400">Actualizar Plan</span>
                        <SparklesSolidIcon className="ml-auto h-3 w-3 text-yellow-400 animate-pulse" />
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* Insignias */}
                    <DropdownMenuItem onClick={() => onSectionChange('badges')} className="cursor-pointer">
                      <TrophyIcon className="mr-2 h-4 w-4 text-purple-400 stroke-[2]" />
                      <span className="text-xs">Insignias</span>
                      <span className="ml-auto text-xs text-gray-400">{userBadges}/10</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Mis Investigaciones (Historial) */}
                    <DropdownMenuItem onClick={() => onSectionChange('history')} className="cursor-pointer">
                      <ClockIcon className="mr-2 h-4 w-4 stroke-[2]" />
                      <span className="text-xs">Mis Investigaciones</span>
                    </DropdownMenuItem>

                    {/* Mi Perfil de Creador */}
                    <DropdownMenuItem onClick={() => onSectionChange('mi-perfil')} className="cursor-pointer">
                      <SparklesSolidIcon className="mr-2 h-4 w-4" />
                      <span className="text-xs">Mi Perfil de Creador</span>
                    </DropdownMenuItem>

                    {/* Configurar Perfil */}
                    <DropdownMenuItem onClick={() => onSectionChange('profile')} className="cursor-pointer">
                      <UserCircleIcon className="mr-2 h-4 w-4 stroke-[2]" />
                      <span className="text-xs">Configurar Perfil</span>
                    </DropdownMenuItem>

                    {/* Mis Notificaciones */}
                    <DropdownMenuItem onClick={() => onSectionChange('notifications')} className="cursor-pointer">
                      <BellIcon className="mr-2 h-4 w-4 stroke-[2]" />
                      <span className="text-xs">Mis Notificaciones</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Cerrar Portal (Cerrar Sesión) */}
                    <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 cursor-pointer">
                      <ArrowRightOnRectangleIcon className="mr-2 h-4 w-4 stroke-[2]" />
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
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-5 w-5 stroke-[2]" /> : <Bars3Icon className="h-5 w-5 stroke-[2]" />}
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
