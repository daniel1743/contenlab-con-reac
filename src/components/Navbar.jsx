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
  RocketLaunchIcon,
  TicketIcon,
  LightBulbIcon,
  ChevronDownIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';

import {
  SparklesIcon as SparklesSolidIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/solid';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import CreditBalance, { useCreditBalance } from '@/components/CreditBalance';
import PromoCodeModal from '@/components/PromoCodeModal';

const Navbar = ({ isAuthenticated, onAuthClick, activeSection, onSectionChange, freeUsageCount, onSubscriptionClick, hasDemoAccess }) => {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPromoCodeModal, setShowPromoCodeModal] = useState(false);
  const [showIntelligenceHint, setShowIntelligenceHint] = useState(false);
  const intelligenceHintTimeout = React.useRef(null);
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
    { id: 'tendencias', label: 'Tendencias', icon: FireIcon, authRequired: false },
    { id: 'calendar', label: 'Planificador', icon: CalendarIcon, authRequired: true },
    { id: 'library', label: 'Historial de Contenido', icon: FolderOpenIcon, authRequired: true },
  ];

  // Items del menú desplegable "Centro Creo"
  const centroCreoItems = [
    { id: 'dashboard', label: 'CreoVision Intelligence', icon: ChartBarIcon, authRequired: true },
    { id: 'tools', label: 'Centro Creativo', icon: WrenchScrewdriverIcon, authRequired: true },
    { id: 'creo-strategy', label: 'Creo Strategy', icon: LightBulbIcon, authRequired: true, badge: 'NEW' },
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

  const triggerIntelligenceHint = React.useCallback(() => {
    if (intelligenceHintTimeout.current) {
      clearTimeout(intelligenceHintTimeout.current);
    }
    setShowIntelligenceHint(true);
    intelligenceHintTimeout.current = setTimeout(() => {
      setShowIntelligenceHint(false);
    }, 3200);
  }, []);

  React.useEffect(() => {
    triggerIntelligenceHint();
    return () => {
      if (intelligenceHintTimeout.current) {
        clearTimeout(intelligenceHintTimeout.current);
      }
    };
  }, [triggerIntelligenceHint]);

  // ⚡ OPTIMIZACIÓN: Preload de rutas al hacer hover
  const handleNavHover = (item) => {
    if (item.id === 'dashboard') {
      triggerIntelligenceHint();
      import('@/components/DashboardDynamic');
    } else if (item.id === 'tools') {
      import('@/components/Tools');
    } else if (item.id === 'creo-strategy') {
      import('@/components/strategy/CreoStrategy');
    } else if (item.id === 'calendar') {
      import('@/components/ContentPlanner');
    } else if (item.id === 'library') {
      import('@/components/ContentLibrary');
    }
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14">
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onSectionChange('landing')}
            whileHover={{ scale: 1.03 }}
          >
            <img src="/robot.png" alt="CreoVision" className="w-8 h-8 rounded-full object-cover" />
            <div className="relative">
              <span className="text-lg font-bold text-gradient">CreoVision</span>
              {/* BETA badge comentado temporalmente */}
              {/* <span className="absolute -top-3 -right-6 px-1 py-0.5 text-[7px] font-bold tracking-wide bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400/50 rounded text-yellow-300 backdrop-blur-sm animate-pulse-soft shadow-lg shadow-yellow-500/20">
                BETA
              </span> */}
            </div>
          </motion.div>

          <div className="hidden md:flex items-center space-x-1 lg:space-x-3 ml-8">
            {/* Botón Inicio */}
            {navigationItems.slice(0, 1).map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  onMouseEnter={() => handleNavHover(item)}
                  className={`flex items-center space-x-1.5 px-2 lg:px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2]" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              );
            })}

            {/* Menú desplegable "Centro Creo" - SEGUNDA POSICIÓN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  type="button"
                  className={`flex items-center space-x-1.5 px-2 lg:px-3 py-1.5 rounded-lg transition-all ${
                    centroCreoItems.some(item => item.id === activeSection)
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <CubeTransparentIcon className="w-3.5 h-3.5 stroke-[2]" />
                  <span className="text-xs font-medium">Centro Creo</span>
                  <ChevronDownIcon className="w-3 h-3 stroke-[2]" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 glass-effect border-purple-500/20" align="start">
                {centroCreoItems.map((item, index) => {
                  const Icon = item.icon;
                  const highlightIntelligence = item.id === 'dashboard' && showIntelligenceHint;

                  // Colores neón para cada opción
                  const hoverColors = [
                    'hover:text-purple-400',  // CreoVision Intelligence (morado)
                    'hover:text-green-400',   // Centro Creativo (verde)
                    'hover:text-yellow-400'   // Creo Strategy (amarillo)
                  ];

                  return (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      onMouseEnter={() => handleNavHover(item)}
                      className={`cursor-pointer py-2 group ${
                        activeSection === item.id ? 'bg-purple-600/10' : ''
                      }`}
                    >
                      <div className="flex items-center w-full">
                        <span className={`relative flex ${highlightIntelligence ? 'intelligence-glow-icon' : ''}`}>
                          <Icon className={`w-4 h-4 mr-2 stroke-[2] transition-colors duration-200 ${hoverColors[index]}`} />
                          {highlightIntelligence && (
                            <span className="intelligence-hint">
                              Nuestra herramienta más potente: busca tendencias, analiza videos relacionados con tu tema en tiempo real con nuestro motor GP-5, accede a bases de datos SEO y genera prompts estratégicos para ejecutar tu plan completo
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-medium flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resto de navegación (Tendencias, Planificador, Historial) */}
            {navigationItems.slice(1).map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  onMouseEnter={() => handleNavHover(item)}
                  className={`flex items-center space-x-1.5 px-2 lg:px-3 py-1.5 rounded-lg transition-all ${
                    activeSection === item.id
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Icon className="w-3.5 h-3.5 stroke-[2]" />
                  <span className="text-xs font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
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
                    <Button variant="ghost" className="h-9 w-9 rounded-full cursor-pointer hover:opacity-80 transition-opacity p-0" type="button">
                      <Avatar className="h-9 w-9 cursor-pointer">
                        <AvatarImage alt={profileData.fullName || user.user_metadata?.full_name || 'Avatar de usuario'} src={profileData.profileImage || user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-purple-600 text-xs">{getAvatarFallback(profileData.fullName || user.user_metadata?.full_name, user.email)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-effect border-purple-500/20" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal py-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs font-semibold leading-none truncate">{profileData.fullName || user.user_metadata?.full_name || 'Usuario'}</p>
                        <p className="text-[10px] leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    {/* Plan/Poderes */}
                    <DropdownMenuItem className="cursor-default hover:bg-transparent focus:bg-transparent py-1.5">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <BoltIcon className="mr-1.5 h-3.5 w-3.5 text-yellow-400 stroke-[2]" />
                          <span className="text-[11px] font-semibold">Plan</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          userPlan === 'premium'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {userPlan}
                        </span>
                      </div>
                    </DropdownMenuItem>

                    {/* Créditos */}
                    <DropdownMenuItem className="cursor-default hover:bg-transparent focus:bg-transparent py-1.5">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <BanknotesIcon className="mr-1.5 h-3.5 w-3.5 text-purple-400 stroke-[2]" />
                          <span className="text-[11px] font-semibold">Créditos</span>
                        </div>
                        <span className="text-[11px] font-bold text-purple-400">
                          {userCredits.toLocaleString()}
                        </span>
                      </div>
                    </DropdownMenuItem>

                    {/* Canjear Código Promocional */}
                    <DropdownMenuItem
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowPromoCodeModal(true);
                      }}
                      className="dropdown-menu-item cursor-pointer bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 py-1.5"
                    >
                      <TicketIcon className="mr-1.5 h-3.5 w-3.5 text-purple-400 stroke-[2]" />
                      <span className="text-[11px] font-bold text-purple-400">Canjear Código</span>
                      <SparklesSolidIcon className="ml-auto h-3 w-3 text-purple-400" />
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Actualizar Plan - Solo si NO es premium */}
                    {userPlan !== 'premium' && (
                      <DropdownMenuItem
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onSubscriptionClick?.();
                        }}
                        className="dropdown-menu-item cursor-pointer bg-gradient-to-r from-yellow-500/10 to-amber-500/10 hover:from-yellow-500/20 hover:to-amber-500/20 border border-yellow-500/30 py-1.5"
                      >
                        <TrophyIcon className="mr-1.5 h-3.5 w-3.5 text-yellow-400 stroke-[2]" />
                        <span className="text-[11px] font-bold text-yellow-400">Actualizar Plan</span>
                        <SparklesSolidIcon className="ml-auto h-3 w-3 text-yellow-400 animate-pulse" />
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    {/* Insignias */}
                    <DropdownMenuItem onClick={() => onSectionChange('badges')} className="dropdown-menu-item cursor-pointer py-1.5">
                      <TrophyIcon className="mr-1.5 h-3.5 w-3.5 text-purple-400 stroke-[2]" />
                      <span className="text-[11px]">Insignias</span>
                      <span className="ml-auto text-[10px] text-gray-400">{userBadges}/10</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Mis Investigaciones (Historial) */}
                    <DropdownMenuItem onClick={() => onSectionChange('history')} className="dropdown-menu-item cursor-pointer py-1.5">
                      <ClockIcon className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
                      <span className="text-[11px]">Mis Investigaciones</span>
                    </DropdownMenuItem>

                    {/* Mi Perfil de Creador */}
                    <DropdownMenuItem onClick={() => onSectionChange('mi-perfil')} className="dropdown-menu-item cursor-pointer py-1.5">
                      <SparklesSolidIcon className="mr-1.5 h-3.5 w-3.5" />
                      <span className="text-[11px]">Mi Perfil de Creador</span>
                    </DropdownMenuItem>

                    {/* Configurar Perfil */}
                    <DropdownMenuItem onClick={() => onSectionChange('profile')} className="dropdown-menu-item cursor-pointer py-1.5">
                      <UserCircleIcon className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
                      <span className="text-[11px]">Configurar Perfil</span>
                    </DropdownMenuItem>

                    {/* Mis Notificaciones */}
                    <DropdownMenuItem onClick={() => onSectionChange('notifications')} className="dropdown-menu-item cursor-pointer py-1.5">
                      <BellIcon className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
                      <span className="text-[11px]">Mis Notificaciones</span>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    {/* Cerrar Portal (Cerrar Sesión) */}
                    <DropdownMenuItem onClick={handleLogout} className="dropdown-menu-item text-red-400 focus:text-red-400 cursor-pointer py-1.5">
                      <ArrowRightOnRectangleIcon className="mr-1.5 h-3.5 w-3.5 stroke-[2]" />
                      <span className="text-[11px] font-semibold">Cerrar Portal</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={onAuthClick}
                type="button"
                size="sm"
                className="gradient-primary hover:opacity-90 transition-opacity hidden sm:inline-flex relative text-xs font-semibold px-4 py-2 h-9"
              >
                {freeUsageCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[10px] font-bold text-white bg-pink-500 rounded-full shadow-lg">
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
            <div className="py-3 space-y-1.5 px-3">
              {/* Botón Inicio (primero) */}
              {navigationItems.slice(0, 1).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                      activeSection === item.id
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 stroke-[2]" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}

              {/* Sección "Centro Creo" (segundo) */}
              <div className="pt-2 pb-1">
                <div className="flex items-center space-x-2 px-3 py-1.5">
                  <CubeTransparentIcon className="w-3.5 h-3.5 text-purple-400 stroke-[2]" />
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Centro Creo</span>
                </div>
              </div>

              {/* Items del Centro Creo */}
              {centroCreoItems.map((item, index) => {
                const Icon = item.icon;

                // Colores neón para cada opción (mismo orden que desktop)
                const hoverIconColors = [
                  'group-hover:text-purple-400',  // CreoVision Intelligence (morado)
                  'group-hover:text-green-400',   // Centro Creativo (verde)
                  'group-hover:text-yellow-400'   // Creo Strategy (amarillo)
                ];

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 pl-6 rounded-lg transition-all group ${
                      activeSection === item.id
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 stroke-[2] transition-colors duration-200 ${hoverIconColors[index]}`} />
                    <span className="text-xs font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Resto de navegación (Tendencias, Planificador, Historial) */}
              {navigationItems.slice(1).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition-all ${
                      activeSection === item.id
                        ? 'bg-purple-600/20 text-purple-300'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 stroke-[2]" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}

              {!isAuthenticated && (
                 <Button
                   onClick={() => {
                     onAuthClick();
                     setIsMobileMenuOpen(false);
                   }}
                   type="button"
                   size="sm"
                   className="w-full gradient-primary hover:opacity-90 transition-opacity text-xs font-semibold mt-2"
                 >
                   Iniciar Sesión
                 </Button>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Modal de Código Promocional */}
      <PromoCodeModal
        isOpen={showPromoCodeModal}
        onClose={() => setShowPromoCodeModal(false)}
        userId={user?.id}
        onSuccess={(creditsGranted) => {
          // Refrescar balance de créditos
          if (window.refreshCredits) {
            window.refreshCredits();
          }

          toast({
            title: '¡Créditos agregados! 🎉',
            description: `Se han agregado ${creditsGranted} créditos a tu cuenta`,
            duration: 5000,
          });
        }}
      />
    </motion.nav>
  );
};

export default Navbar;
