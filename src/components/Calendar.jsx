import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Tiktok,
  Edit2,
  Trash2,
  Copy,
  Download,
  Search,
  Sparkles,
  BarChart3,
  AlertCircle,
  Zap,
  Target,
  TrendingUp,
  Share2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  // Estado del formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    platforms: ['youtube'],
    status: 'draft',
    category: 'content',
    campaign: '',
    primaryGoal: 'awareness',
    contentType: 'video'
  });

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Categorías con colores
  const categories = {
    content: { name: 'Contenido', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    promotion: { name: 'Promoción', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
    engagement: { name: 'Engagement', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    announcement: { name: 'Anuncio', badge: 'bg-green-500/20 text-green-300 border-green-500/30' },
  };

  const platformConfig = {
    youtube: {
      id: 'youtube',
      label: 'YouTube',
      icon: Youtube,
      accent: 'text-red-500',
      chip: 'bg-red-500/10 border-red-500/30 text-red-200',
      peakTimes: ['Martes 18:00', 'Jueves 16:00'],
      contentPlays: ['Videos evergreen', 'Transmisiones en directo'],
      boost: 'Optimiza SEO con keywords de alto score (VidIQ) y programa estrenos con recordatorios cruzados.'
    },
    instagram: {
      id: 'instagram',
      label: 'Instagram',
      icon: Instagram,
      accent: 'text-pink-500',
      chip: 'bg-pink-500/10 border-pink-500/30 text-pink-200',
      peakTimes: ['Mi�rcoles 13:00', 'Domingo 19:00'],
      contentPlays: ['Reels educativos', 'Carruseles narrativa'],
      boost: 'Activa historias teaser autom�ticas antes y despu�s del post principal.'
    },
    twitter: {
      id: 'twitter',
      label: 'X (Twitter)',
      icon: Twitter,
      accent: 'text-blue-400',
      chip: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
      peakTimes: ['Martes 09:00', 'Jueves 11:00'],
      contentPlays: ['Hilos expertos', 'Alertas en tiempo real'],
      boost: 'Despliega secuencias programadas de 3 tweets con CTA fijado siguiendo flujos de Hootsuite.'
    },
    facebook: {
      id: 'facebook',
      label: 'Facebook',
      icon: Facebook,
      accent: 'text-blue-600',
      chip: 'bg-blue-600/10 border-blue-600/30 text-blue-100',
      peakTimes: ['Mi�rcoles 18:00', 'S�bado 11:00'],
      contentPlays: ['Lives cortos', 'Publicaciones de comunidad'],
      boost: 'Segmenta audiencias lookalike y duplica autom�ticamente en grupos clave.'
    },
    linkedin: {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      accent: 'text-sky-500',
      chip: 'bg-sky-500/10 border-sky-500/30 text-sky-200',
      peakTimes: ['Martes 08:30', 'Jueves 09:00'],
      contentPlays: ['Art�culos largos', 'Posts de liderazgo'],
      boost: 'Convierte el video en documento carrusel + lead form para captar contactos.'
    },
    tiktok: {
      id: 'tiktok',
      label: 'TikTok',
      icon: Tiktok,
      accent: 'text-emerald-400',
      chip: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
      peakTimes: ['Jueves 19:00', 'S�bado 21:00'],
      contentPlays: ['Trends con hook', 'Clips ultra cortos'],
      boost: 'Automatiza republicaci�n vertical y añade CTA interactivo en los primeros 3 segundos.'
    }
  };

  const platformKeys = Object.keys(platformConfig);

  const computeAiScore = (title = '', description = '', platforms = []) => {
    const baseScore = Math.min(45, title.length * 1.2 + description.length * 0.4);
    const platformBonus = platforms.length * 4;
    return Math.min(99, Math.max(62, Math.round(65 + baseScore / 2 + platformBonus)));
  };

  const generateHashtags = (title = '', description = '') => {
    const keywords = `${title} ${description}`
      .toLowerCase()
      .match(/[a-z\u00e1\u00e9\u00ed\u00f3\u00fa\u00f10-9]{4,}/g);
    if (!keywords) return [];
    return Array.from(new Set(keywords.slice(0, 6))).map(word =>
      `#${word.normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`
    );
  };

  const getOptimalTimeForPlatforms = (platforms = []) => {
    if (!platforms.length) return null;
    const slots = platforms
      .map(platform => platformConfig[platform]?.peakTimes?.[0])
      .filter(Boolean);
    return slots.length ? slots[0] : null;
  };

  // Eventos de ejemplo (ahora con estado)
  const [events, setEvents] = useState([
    {
      id: 1,
      date: new Date(2025, 0, 15),
      title: 'Video YouTube: Tutorial IA',
      description: 'Tutorial completo sobre cómo usar IA para crear contenido viral',
      platforms: ['youtube', 'instagram'],
      time: '10:00',
      status: 'scheduled',
      category: 'content',
      campaign: 'IA Launch Sprint',
      primaryGoal: 'awareness',
      contentType: 'video',
      aiScore: 88,
      hashtags: ['#IA', '#Productividad', '#ContentLab']
    },
    {
      id: 2,
      date: new Date(2025, 0, 18),
      title: 'Post Instagram: Tips Productividad',
      description: '10 tips para aumentar tu productividad como creador',
      platforms: ['instagram', 'tiktok'],
      time: '14:30',
      status: 'scheduled',
      category: 'content',
      campaign: 'Rutinas Productivas',
      primaryGoal: 'engagement',
      contentType: 'reel',
      aiScore: 92,
      hashtags: ['#Productividad', '#Creador', '#Rutina']
    },
    {
      id: 3,
      date: new Date(2025, 0, 22),
      title: 'Thread Twitter: Tendencias',
      description: 'Análisis de las tendencias más importantes del mes',
      platforms: ['twitter', 'linkedin'],
      time: '09:15',
      status: 'draft',
      category: 'engagement',
      campaign: 'Radar Tendencias',
      primaryGoal: 'thought_leadership',
      contentType: 'thread',
      aiScore: 76,
      hashtags: ['#Tendencias', '#IA', '#ContentLab']
    },
    {
      id: 4,
      date: new Date(2025, 0, 25),
      title: 'Live Instagram: Q&A',
      description: 'Sesión de preguntas y respuestas con la comunidad',
      platforms: ['instagram', 'facebook'],
      time: '19:00',
      status: 'scheduled',
      category: 'engagement',
      campaign: 'Community Love',
      primaryGoal: 'community',
      contentType: 'live',
      aiScore: 81,
      hashtags: ['#Live', '#Preguntas', '#Comunidad']
    },
    {
      id: 5,
      date: new Date(2025, 0, 20),
      title: 'Promoción Producto Nuevo',
      description: 'Lanzamiento oficial del nuevo curso',
      platforms: ['facebook', 'youtube', 'linkedin'],
      time: '12:00',
      status: 'scheduled',
      category: 'promotion',
      campaign: 'Lanzamiento Elite',
      primaryGoal: 'conversion',
      contentType: 'promo',
      aiScore: 90,
      hashtags: ['#Lanzamiento', '#Marketing', '#Conversiones']
    },
  ]);

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const haystack = [
      event.title,
      event.description,
      event.campaign,
      event.hashtags?.join(' ')
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesSearch = haystack.includes(searchTerm.toLowerCase());
    const matchesPlatform =
      filterPlatform === 'all' || event.platforms?.includes(filterPlatform);
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesPlatform && matchesStatus;
  });

  // Funciones CRUD
  const handleCreateEvent = useCallback(() => {
    if (!formData.title || !formData.date || !formData.time) {
      toast({
        title: '⚠️ Campos requeridos',
        description: 'Por favor completa título, fecha y hora',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.platforms.length) {
      toast({
        title: '🌐 Selecciona plataformas',
        description: 'Elige al menos una red para programar la publicación.',
        variant: 'destructive'
      });
      return;
    }

    const aiScore = computeAiScore(formData.title, formData.description, formData.platforms);
    const hashtags = generateHashtags(formData.title, formData.description);
    const optimalTime = getOptimalTimeForPlatforms(formData.platforms) || formData.time;

    const newEvent = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date),
      time: formData.time,
      platforms: [...formData.platforms],
      status: formData.status,
      category: formData.category,
      campaign: formData.campaign?.trim() || 'Campaña sin nombre',
      primaryGoal: formData.primaryGoal,
      contentType: formData.contentType,
      aiScore,
      hashtags: hashtags.length ? hashtags : ['#ContentLab'],
      optimalTime
    };

    setEvents(prev => [...prev, newEvent]);
    setIsModalOpen(false);
    resetForm();
    toast({
      title: '🚀 Evento creado',
      description: `${newEvent.title} programado en ${newEvent.platforms.length} plataformas.`,
    });
  }, [computeAiScore, formData, generateHashtags, getOptimalTimeForPlatforms, toast]);

  const handleUpdateEvent = useCallback(() => {
    if (!editingEvent) return;

    const aiScore = computeAiScore(formData.title, formData.description, formData.platforms);
    const hashtags = generateHashtags(formData.title, formData.description);
    const optimalTime = getOptimalTimeForPlatforms(formData.platforms) || formData.time;

    setEvents(prev => prev.map(event =>
      event.id === editingEvent.id
        ? {
            ...event,
            title: formData.title,
            description: formData.description,
            date: new Date(formData.date),
            time: formData.time,
            platforms: [...formData.platforms],
            status: formData.status,
            category: formData.category,
            campaign: formData.campaign?.trim() || 'Campaña sin nombre',
            primaryGoal: formData.primaryGoal,
            contentType: formData.contentType,
            aiScore,
            hashtags: hashtags.length ? hashtags : event.hashtags,
            optimalTime
          }
        : event
    ));
    setIsModalOpen(false);
    setEditingEvent(null);
    resetForm();
    toast({
      title: '✅ Evento actualizado',
      description: 'Los cambios se han guardado correctamente',
    });
  }, [computeAiScore, editingEvent, formData, generateHashtags, getOptimalTimeForPlatforms, toast]);

  const handleDeleteEvent = useCallback((eventId) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: '🗑️ Evento eliminado',
      description: 'El evento ha sido eliminado del calendario',
    });
  }, [toast]);

  const handleDuplicateEvent = useCallback((event) => {
    const duplicated = {
      ...event,
      id: Date.now(),
      title: `${event.title} (Copia)`,
      status: 'draft',
      date: new Date(event.date),
      platforms: [...(event.platforms || [])],
      hashtags: [...(event.hashtags || [])]
    };
    setEvents(prev => [...prev, duplicated]);
    toast({
      title: '📋 Evento duplicado',
      description: 'El evento ha sido duplicado como borrador',
    });
  }, [toast]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      platforms: ['youtube'],
      status: 'draft',
      category: 'content',
      campaign: '',
      primaryGoal: 'awareness',
      contentType: 'video'
    });
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date.toISOString().split('T')[0],
      time: event.time,
      platforms: [...(event.platforms || [])],
      status: event.status,
      category: event.category,
      campaign: event.campaign || '',
      primaryGoal: event.primaryGoal || 'awareness',
      contentType: event.contentType || 'video'
    });
    setIsModalOpen(true);
  };

  // Exportar a iCal
  const exportToICal = useCallback(() => {
    let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ContentLab//Calendar//ES\n';

    filteredEvents.forEach(event => {
      const dateTime = new Date(`${event.date.toISOString().split('T')[0]}T${event.time}`);
      const dtStart = dateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icalContent += `BEGIN:VEVENT\n`;
      icalContent += `DTSTART:${dtStart}\n`;
      icalContent += `SUMMARY:${event.title}\n`;
      icalContent += `DESCRIPTION:${event.description || ''}\n`;
      icalContent += `LOCATION:${event.platform}\n`;
      icalContent += `STATUS:${event.status.toUpperCase()}\n`;
      icalContent += `END:VEVENT\n`;
    });

    icalContent += 'END:VCALENDAR';

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contentlab-calendar.ics';
    link.click();

    toast({
      title: '📥 Calendario exportado',
      description: 'El archivo .ics ha sido descargado. Puedes importarlo en Google Calendar o iCal.',
    });
  }, [filteredEvents, toast]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    // Días del mes siguiente para completar la grilla
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return filteredEvents.filter(event =>
      event.date.toDateString() === date.toDateString()
    );
  };

  const getPlatformIcon = (platform, size = 'w-4 h-4') => {
    switch (platform) {
      case 'youtube':
        return <Youtube className={`${size} text-red-500`} />;
      case 'instagram':
        return <Instagram className={`${size} text-pink-500`} />;
      case 'twitter':
        return <Twitter className={`${size} text-blue-400`} />;
      case 'facebook':
        return <Facebook className={`${size} text-blue-600`} />;
      default:
        return <CalendarIcon className={`${size}`} />;
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Calendario de Publicaciones</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Planifica y programa tu contenido en todas las plataformas sociales
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendario Principal */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-2xl">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(-1)}
                      className="border-purple-500/20 hover:bg-purple-500/10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(1)}
                      className="border-purple-500/20 hover:bg-purple-500/10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dayNames.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isToday = day.date.toDateString() === today.toDateString();
                    const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();

                    return (
                      <motion.div
                        key={index}
                        className={`
                          relative p-2 min-h-[80px] border border-purple-500/10 rounded-lg cursor-pointer
                          transition-all duration-200 hover:border-purple-500/30
                          ${day.isCurrentMonth ? 'bg-transparent' : 'bg-gray-800/30'}
                          ${isToday ? 'ring-2 ring-purple-500' : ''}
                          ${isSelected ? 'bg-purple-500/20' : ''}
                        `}
                        onClick={() => setSelectedDate(day.date)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`text-sm font-medium ${
                          day.isCurrentMonth ? 'text-white' : 'text-gray-500'
                        }`}>
                          {day.date.getDate()}
                        </div>
                        
                        {/* Eventos del día */}
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded bg-purple-500/20 text-purple-200 truncate flex items-center space-x-1"
                            >
                              {getPlatformIcon(event.platform)}
                              <span className="truncate">{event.title}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-400">
                              +{dayEvents.length - 2} más
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Botón Agregar Evento */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => {
                setEditingEvent(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="w-full gradient-primary hover:opacity-90 h-12"
            >
              <Plus className="w-5 h-5 mr-2" />
              Programar Publicación
            </Button>
          </motion.div>

          {/* Búsqueda y Filtros */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Buscar y Filtrar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800/50 border-purple-500/20 text-white"
                />
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                    <SelectValue placeholder="Plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las plataformas</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="draft">Borradores</SelectItem>
                    <SelectItem value="scheduled">Programados</SelectItem>
                    <SelectItem value="published">Publicados</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={exportToICal}
                  variant="outline"
                  className="w-full border-purple-500/20 hover:bg-purple-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar a iCal
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Eventos del día seleccionado */}
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    {selectedDate.toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getEventsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getEventsForDate(selectedDate).map((event) => (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg glass-effect border border-purple-500/10 group hover:border-purple-500/30 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              {getPlatformIcon(event.platform)}
                              <span className="text-sm font-medium text-white truncate">
                                {event.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-2 py-1 rounded ${
                                event.status === 'scheduled'
                                  ? 'bg-green-500/20 text-green-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {event.status === 'scheduled' ? 'Programado' : 'Borrador'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(event)}
                                className="h-6 w-6 p-0 hover:bg-purple-500/20"
                              >
                                <Edit2 className="w-3 h-3 text-purple-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicateEvent(event)}
                                className="h-6 w-6 p-0 hover:bg-blue-500/20"
                              >
                                <Copy className="w-3 h-3 text-blue-400" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEvent(event.id)}
                                className="h-6 w-6 p-0 hover:bg-red-500/20"
                              >
                                <Trash2 className="w-3 h-3 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay eventos programados</p>
                      <p className="text-xs">Haz clic en "Programar Publicación" para añadir uno</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Próximos Eventos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Próximos Eventos</CardTitle>
                <CardDescription>
                  {filteredEvents.length > 0 ? 'Tus próximas publicaciones programadas' : 'No hay eventos programados'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredEvents.length > 0 ? (
                  <div className="space-y-3">
                    {filteredEvents
                      .sort((a, b) => a.date - b.date)
                      .slice(0, 3)
                      .map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-3 rounded-lg glass-effect border border-purple-500/10 group hover:border-purple-500/30 transition-all"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {getPlatformIcon(event.platform)}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white truncate">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-400">
                                {event.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {event.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(event)}
                              className="h-7 w-7 p-0 hover:bg-purple-500/20"
                            >
                              <Edit2 className="w-3 h-3 text-purple-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No hay eventos que mostrar</p>
                    <p className="text-xs mt-1">Crea tu primer evento para comenzar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Estadísticas e Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Insights del Calendario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-gray-300">Total Eventos</span>
                    </div>
                    <span className="text-xl font-bold text-white">{filteredEvents.length}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">Programados</span>
                    </div>
                    <span className="text-xl font-bold text-green-400">
                      {filteredEvents.filter(e => e.status === 'scheduled').length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">Borradores</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-400">
                      {filteredEvents.filter(e => e.status === 'draft').length}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-purple-500/20">
                    <p className="text-xs text-gray-400 mb-2">Plataformas más usadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {['youtube', 'instagram', 'twitter', 'facebook'].map(platform => {
                        const count = filteredEvents.filter(e => e.platform === platform).length;
                        if (count === 0) return null;
                        return (
                          <div key={platform} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-800/50 border border-purple-500/10">
                            {getPlatformIcon(platform, 'w-3 h-3')}
                            <span className="text-xs text-gray-300">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modal Crear/Editar Evento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingEvent ? 'Actualiza los detalles de tu publicación' : 'Programa una nueva publicación en tu calendario'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Título *</Label>
              <Input
                id="title"
                placeholder="Ej: Tutorial de IA en YouTube"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-gray-800/50 border-purple-500/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu contenido..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-800/50 border-purple-500/20 text-white min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-gray-800/50 border-purple-500/20 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="text-white">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="bg-gray-800/50 border-purple-500/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="platform" className="text-white">Plataforma</Label>
                <Select value={formData.platform} onValueChange={(value) => setFormData({ ...formData, platform: value })}>
                  <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-500" />
                        YouTube
                      </div>
                    </SelectItem>
                    <SelectItem value="instagram">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        Instagram
                      </div>
                    </SelectItem>
                    <SelectItem value="twitter">
                      <div className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-blue-400" />
                        Twitter
                      </div>
                    </SelectItem>
                    <SelectItem value="facebook">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-600" />
                        Facebook
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="scheduled">Programado</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-white">Categoría</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded text-xs ${category.badge}`}>
                          {category.name}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingEvent(null);
                resetForm();
              }}
              className="border-purple-500/20 hover:bg-purple-500/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={editingEvent ? handleUpdateEvent : handleCreateEvent}
              className="gradient-primary hover:opacity-90"
            >
              {editingEvent ? 'Actualizar' : 'Crear'} Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
