import React, { useState, useCallback, useEffect } from 'react';
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
  Music2,
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
  Share2,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Calendar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
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
      peakTimes: ['Miércoles 13:00', 'Domingo 19:00'],
      contentPlays: ['Reels educativos', 'Carruseles narrativa'],
      boost: 'Activa historias teaser automáticas antes y después del post principal.'
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
      peakTimes: ['Miércoles 18:00', 'Sábado 11:00'],
      contentPlays: ['Lives cortos', 'Publicaciones de comunidad'],
      boost: 'Segmenta audiencias lookalike y duplica automáticamente en grupos clave.'
    },
    linkedin: {
      id: 'linkedin',
      label: 'LinkedIn',
      icon: Linkedin,
      accent: 'text-sky-500',
      chip: 'bg-sky-500/10 border-sky-500/30 text-sky-200',
      peakTimes: ['Martes 08:30', 'Jueves 09:00'],
      contentPlays: ['Artículos largos', 'Posts de liderazgo'],
      boost: 'Convierte el video en documento carrusel + lead form para captar contactos.'
    },
    tiktok: {
      id: 'tiktok',
      label: 'TikTok',
      icon: Music2,
      accent: 'text-emerald-400',
      chip: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
      peakTimes: ['Jueves 19:00', 'Sábado 21:00'],
      contentPlays: ['Trends con hook', 'Clips ultra cortos'],
      boost: 'Automatiza republicación vertical y añade CTA interactivo en los primeros 3 segundos.'
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

  const goalOptions = [
    { value: 'awareness', label: 'Awareness · Alcance' },
    { value: 'engagement', label: 'Engagement · Comunidad' },
    { value: 'conversion', label: 'Conversiones' },
    { value: 'thought_leadership', label: 'Autoridad' },
    { value: 'community', label: 'Fidelización' }
  ];

  const contentTypeOptions = [
    { value: 'video', label: 'Video largo' },
    { value: 'reel', label: 'Reel / Short' },
    { value: 'thread', label: 'Hilo / Microblog' },
    { value: 'live', label: 'Live / Streaming' },
    { value: 'promo', label: 'Campaña / Promo' },
    { value: 'blog', label: 'Blog / Newsletter' }
  ];

  const automationBlueprints = [
    {
      title: 'Sprint lanzamiento 360°',
      description: 'Teaser + live + retargeting inspirado en flujos de Hootsuite.',
      cadence: '7 días · 5 toques',
      platforms: ['instagram', 'tiktok', 'youtube', 'linkedin']
    },
    {
      title: 'Calendario evergreen',
      description: 'Recircula pilares top mediante colas inteligentes y repost optimizado.',
      cadence: '30 días · 12 activos',
      platforms: ['youtube', 'facebook', 'twitter']
    },
    {
      title: 'Autoridad express',
      description: 'Hilos + carruseles + newsletter con insights potenciados por VidIQ.',
      cadence: '14 días · 6 piezas',
      platforms: ['linkedin', 'twitter', 'blog']
    }
  ];

  const togglePlatformSelection = (platform) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(platform);
      const platforms = exists
        ? prev.platforms.filter(item => item !== platform)
        : [...prev.platforms, platform];
      return {
        ...prev,
        platforms
      };
    });
  };

  // Eventos cargados desde Supabase
  const [events, setEvents] = useState([]);

  // Cargar eventos desde Supabase
  const loadEvents = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_datetime', { ascending: true });

      if (error) throw error;

      // Convertir datos de Supabase al formato del componente
      const formattedEvents = (data || []).map(post => ({
        id: post.id,
        date: new Date(post.scheduled_date),
        title: post.title,
        description: post.description || '',
        platforms: post.platforms || [],
        time: post.scheduled_time,
        status: post.status || 'draft',
        category: post.category || 'content',
        campaign: post.campaign || '',
        primaryGoal: post.primary_goal || 'awareness',
        contentType: post.content_type || 'video',
        aiScore: post.ai_score || 0,
        hashtags: post.hashtags || [],
        optimalTime: post.optimal_time || null,
        scheduled_datetime: post.scheduled_datetime,
        media_files: post.media_files || [],
        content_data: post.content_data || {},
        published_urls: post.published_urls || {},
        is_recurring: post.is_recurring || false,
        recurrence_pattern: post.recurrence_pattern || null
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudieron cargar los eventos. Usando datos locales.',
        variant: 'destructive'
      });
      // Fallback: usar eventos de ejemplo si hay error
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Cargar eventos al montar o cuando cambie el usuario
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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
  const handleCreateEvent = useCallback(async () => {
    if (!user) {
      toast({
        title: '🔒 Autenticación requerida',
        description: 'Debes iniciar sesión para crear eventos',
        variant: 'destructive'
      });
      return;
    }

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

    try {
      const aiScore = computeAiScore(formData.title, formData.description, formData.platforms);
      const hashtags = generateHashtags(formData.title, formData.description);
      const optimalTime = getOptimalTimeForPlatforms(formData.platforms) || formData.time;

      // Crear scheduled_datetime combinando fecha y hora
      const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description || null,
          scheduled_date: formData.date,
          scheduled_time: formData.time,
          scheduled_datetime: scheduledDateTime.toISOString(),
          platforms: formData.platforms,
          status: formData.status,
          category: formData.category,
          content_type: formData.contentType,
          campaign: formData.campaign?.trim() || null,
          primary_goal: formData.primaryGoal,
          ai_score: aiScore,
          hashtags: hashtags.length ? hashtags : ['#CreoVision'],
          optimal_time: optimalTime
        })
        .select()
        .single();

      if (error) throw error;

      // Convertir a formato del componente y agregar al estado
      const newEvent = {
        id: data.id,
        date: new Date(data.scheduled_date),
        title: data.title,
        description: data.description || '',
        platforms: data.platforms || [],
        time: data.scheduled_time,
        status: data.status,
        category: data.category,
        campaign: data.campaign || '',
        primaryGoal: data.primary_goal,
        contentType: data.content_type,
        aiScore: data.ai_score,
        hashtags: data.hashtags || [],
        optimalTime: data.optimal_time,
        scheduled_datetime: data.scheduled_datetime
      };

      setEvents(prev => [...prev, newEvent]);
      setIsModalOpen(false);
      resetForm();
      toast({
        title: '🚀 Evento creado',
        description: `${newEvent.title} programado en ${newEvent.platforms.length} plataformas.`,
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo crear el evento. Intenta nuevamente.',
        variant: 'destructive'
      });
    }
  }, [user, formData, computeAiScore, generateHashtags, getOptimalTimeForPlatforms, toast]);

  const handleUpdateEvent = useCallback(async () => {
    if (!editingEvent || !user) return;

    if (!formData.platforms.length) {
      toast({
        title: '🌐 Selecciona plataformas',
        description: 'Necesitas al menos una red para actualizar la publicación.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const aiScore = computeAiScore(formData.title, formData.description, formData.platforms);
      const hashtags = generateHashtags(formData.title, formData.description);
      const optimalTime = getOptimalTimeForPlatforms(formData.platforms) || formData.time;

      // Crear scheduled_datetime combinando fecha y hora
      const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);

      // Actualizar en Supabase
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update({
          title: formData.title,
          description: formData.description || null,
          scheduled_date: formData.date,
          scheduled_time: formData.time,
          scheduled_datetime: scheduledDateTime.toISOString(),
          platforms: formData.platforms,
          status: formData.status,
          category: formData.category,
          content_type: formData.contentType,
          campaign: formData.campaign?.trim() || null,
          primary_goal: formData.primaryGoal,
          ai_score: aiScore,
          hashtags: hashtags.length ? hashtags : editingEvent.hashtags,
          optimal_time: optimalTime
        })
        .eq('id', editingEvent.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      setEvents(prev => prev.map(event =>
        event.id === editingEvent.id
          ? {
              ...event,
              title: data.title,
              description: data.description || '',
              date: new Date(data.scheduled_date),
              time: data.scheduled_time,
              platforms: data.platforms || [],
              status: data.status,
              category: data.category,
              campaign: data.campaign || '',
              primaryGoal: data.primary_goal,
              contentType: data.content_type,
              aiScore: data.ai_score,
              hashtags: data.hashtags || [],
              optimalTime: data.optimal_time,
              scheduled_datetime: data.scheduled_datetime
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
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo actualizar el evento. Intenta nuevamente.',
        variant: 'destructive'
      });
    }
  }, [user, editingEvent, formData, computeAiScore, generateHashtags, getOptimalTimeForPlatforms, toast]);

  const handleDeleteEvent = useCallback(async (eventId) => {
    if (!user) {
      toast({
        title: '🔒 Autenticación requerida',
        description: 'Debes iniciar sesión para eliminar eventos',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Eliminar de Supabase
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Actualizar estado local
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: '🗑️ Evento eliminado',
        description: 'El evento ha sido eliminado del calendario',
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo eliminar el evento. Intenta nuevamente.',
        variant: 'destructive'
      });
    }
  }, [user, toast]);

  const handleDuplicateEvent = useCallback(async (event) => {
    if (!user) {
      toast({
        title: '🔒 Autenticación requerida',
        description: 'Debes iniciar sesión para duplicar eventos',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Crear scheduled_datetime (usar la fecha/hora del evento original o actual)
      const scheduledDateTime = event.scheduled_datetime 
        ? new Date(event.scheduled_datetime)
        : new Date(`${event.date.toISOString().split('T')[0]}T${event.time}`);

      // Insertar en Supabase
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          title: `${event.title} (Copia)`,
          description: event.description || null,
          scheduled_date: event.date.toISOString().split('T')[0],
          scheduled_time: event.time,
          scheduled_datetime: scheduledDateTime.toISOString(),
          platforms: event.platforms || [],
          status: 'draft',
          category: event.category || 'content',
          content_type: event.contentType || 'video',
          campaign: event.campaign || null,
          primary_goal: event.primaryGoal || 'awareness',
          ai_score: event.aiScore || null,
          hashtags: event.hashtags || [],
          optimal_time: event.optimalTime || null
        })
        .select()
        .single();

      if (error) throw error;

      // Convertir y agregar al estado
      const duplicated = {
        id: data.id,
        date: new Date(data.scheduled_date),
        title: data.title,
        description: data.description || '',
        platforms: data.platforms || [],
        time: data.scheduled_time,
        status: data.status,
        category: data.category,
        campaign: data.campaign || '',
        primaryGoal: data.primary_goal,
        contentType: data.content_type,
        aiScore: data.ai_score,
        hashtags: data.hashtags || [],
        optimalTime: data.optimal_time,
        scheduled_datetime: data.scheduled_datetime
      };

      setEvents(prev => [...prev, duplicated]);
      toast({
        title: '📋 Evento duplicado',
        description: 'El evento ha sido duplicado como borrador',
      });
    } catch (error) {
      console.error('Error duplicating event:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo duplicar el evento. Intenta nuevamente.',
        variant: 'destructive'
      });
    }
  }, [user, toast]);

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
    let icalContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CreoVision//Calendar//ES\n';

    filteredEvents.forEach(event => {
      const dateTime = new Date(`${event.date.toISOString().split('T')[0]}T${event.time}`);
      const dtStart = dateTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

      icalContent += `BEGIN:VEVENT\n`;
      icalContent += `DTSTART:${dtStart}\n`;
      icalContent += `SUMMARY:${event.title}\n`;
      icalContent += `DESCRIPTION:${event.description || ''}\n`;
      icalContent += `LOCATION:${(event.platforms || []).join(', ')}\n`;
      icalContent += `CATEGORIES:${event.campaign || ''}\n`;
      icalContent += `STATUS:${event.status.toUpperCase()}\n`;
      icalContent += `END:VEVENT\n`;
    });

    icalContent += 'END:VCALENDAR';

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'creovision-calendar.ics';
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
    const config = platformConfig[platform];
    if (config?.icon) {
      const Icon = config.icon;
      return <Icon className={`${size} ${config.accent}`} />;
    }
    return <CalendarIcon className={`${size}`} />;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const previewAiScore = computeAiScore(formData.title, formData.description, formData.platforms);
  const previewOptimalTime = getOptimalTimeForPlatforms(formData.platforms);
  const previewHashtags = generateHashtags(formData.title, formData.description).slice(0, 3);
  const scheduledCount = filteredEvents.filter(event => event.status === 'scheduled').length;
  const draftCount = filteredEvents.filter(event => event.status === 'draft').length;
  const averageAiScore = filteredEvents.length
    ? Math.round(
        filteredEvents.reduce((acc, event) => acc + (event.aiScore || previewAiScore), 0) /
          filteredEvents.length
      )
    : previewAiScore;
  const platformUsage = platformKeys
    .map((platform) => ({
      platform,
      label: platformConfig[platform]?.label || platform,
      count: filteredEvents.reduce(
        (acc, event) => acc + ((event.platforms || []).includes(platform) ? 1 : 0),
        0
      )
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
  const peakMoments = filteredEvents
    .filter(event => event.optimalTime)
    .slice(0, 3)
    .map(event => ({
      id: event.id,
      title: event.title,
      optimalTime: event.optimalTime,
      platforms: event.platforms
    }));
  const hashtagFrequency = filteredEvents.reduce((acc, event) => {
    (event.hashtags || []).forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});
  const topHashtags = Object.entries(hashtagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // Mostrar loading mientras se cargan los eventos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></Loader2>
          <p className="text-gray-400">Cargando calendario...</p>
        </div>
      </div>
    );
  }

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
        {!user && (
          <p className="text-sm text-yellow-400">
            ⚠️ Inicia sesión para guardar tus eventos permanentemente
          </p>
        )}
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
                              className="text-xs p-1 rounded bg-purple-500/20 text-purple-200 truncate flex items-center gap-1"
                            >
                              <div className="flex items-center gap-1">
                                {(event.platforms || []).slice(0, 2).map((platform, idx) => (
                                  <div
                                    key={`${event.id}-${platform}-mini-${idx}`}
                                    className="w-4 h-4 rounded-full bg-gray-900/50 flex items-center justify-center"
                                  >
                                    {getPlatformIcon(platform, 'w-3 h-3')}
                                  </div>
                                ))}
                              </div>
                              <span className="truncate flex-1">{event.title}</span>
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
                  <SelectContent className="bg-gray-900/95 border border-purple-500/30 text-white backdrop-blur">
                    <SelectItem value="all">Todas las plataformas</SelectItem>
                    {platformKeys.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(platform, 'w-3 h-3')}
                          {platformConfig[platform]?.label || platform}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border border-purple-500/30 text-white backdrop-blur">
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
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex -space-x-1">
                                {(event.platforms || []).slice(0, 3).map((platform, idx) => (
                                  <div
                                    key={`${event.id}-${platform}-${idx}`}
                                    className="w-6 h-6 rounded-full border border-gray-900 flex items-center justify-center bg-gray-800/80"
                                  >
                                    {getPlatformIcon(platform, 'w-3 h-3')}
                                  </div>
                                ))}
                              </div>
                              <div className="min-w-0">
                                <span className="text-sm font-medium text-white truncate block">
                                  {event.title}
                                </span>
                                {event.campaign && (
                                  <span className="text-xs text-gray-400 truncate block">
                                    {event.campaign}
                                  </span>
                                )}
                              </div>
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
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {event.time}
                              </span>
                              {event.optimalTime && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
                                  Peak: {event.optimalTime}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {event.aiScore && (
                                <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                                  IQ {event.aiScore}
                                </span>
                              )}
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
                          {event.hashtags?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {event.hashtags.slice(0, 4).map((tag) => (
                                <span
                                  key={`${event.id}-${tag}`}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800/60 text-purple-200 border border-purple-500/20"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
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
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex -space-x-1">
                              {(event.platforms || []).slice(0, 3).map((platform, idx) => (
                                <div
                                  key={`${event.id}-${platform}-upcoming-${idx}`}
                                  className="w-7 h-7 rounded-full border border-purple-500/30 flex items-center justify-center bg-gray-900/60"
                                >
                                  {getPlatformIcon(platform, 'w-3 h-3')}
                                </div>
                              ))}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white truncate">
                                {event.title}
                              </p>
                              <p className="text-xs text-gray-400 flex items-center gap-2">
                                <span>
                                  {event.date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} · {event.time}
                                </span>
                                {event.aiScore && (
                                  <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                                    IQ {event.aiScore}
                                  </span>
                                )}
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

        </div>
      </div>

      {/* Insights del Calendario - Tarjeta larga */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Insights del Calendario
            </CardTitle>
            <CardDescription className="text-gray-400">
              Análisis completo de tu actividad y rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="flex flex-col justify-between p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-300">Total eventos</span>
                </div>
                <span className="text-3xl font-bold text-white">{filteredEvents.length}</span>
              </div>

              <div className="flex flex-col justify-between p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-300">Programados</span>
                </div>
                <span className="text-3xl font-bold text-green-400">
                  {scheduledCount}
                </span>
              </div>

              <div className="flex flex-col justify-between p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-300">Borradores</span>
                </div>
                <span className="text-3xl font-bold text-yellow-400">
                  {draftCount}
                </span>
              </div>

              <div className="flex flex-col justify-between p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-300" />
                  <span className="text-sm text-gray-300">IQ promedio</span>
                </div>
                <span className="text-3xl font-bold text-blue-300">{averageAiScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-gray-800/30 border border-purple-500/10">
                <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Plataformas con mayor actividad
                </p>
                <div className="flex flex-wrap gap-2">
                  {platformUsage.length > 0 ? (
                    platformUsage.map(({ platform, label, count }) => (
                      <div
                        key={platform}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                      >
                        {getPlatformIcon(platform, 'w-4 h-4')}
                        <span className="text-sm text-gray-300">{label}</span>
                        <span className="text-sm font-bold text-purple-300">({count})</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Sin datos suficientes todavía.</span>
                  )}
                </div>
              </div>

              {peakMoments.length > 0 && (
                <div className="p-4 rounded-lg bg-gray-800/30 border border-purple-500/10">
                  <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400" />
                    Próximos picos recomendados
                  </p>
                  <div className="space-y-2">
                    {peakMoments.map((moment) => (
                      <div
                        key={moment.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 border border-purple-500/10 hover:border-purple-500/30 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{moment.title}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{moment.optimalTime}</span>
                            <div className="flex -space-x-1 ml-2">
                              {(moment.platforms || []).slice(0, 3).map((platform, idx) => (
                                <div
                                  key={`${moment.id}-${platform}-peak-${idx}`}
                                  className="w-5 h-5 rounded-full bg-gray-900/60 border border-purple-500/30 flex items-center justify-center"
                                >
                                  {getPlatformIcon(platform, 'w-3 h-3')}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Target className="w-4 h-4 text-purple-300 flex-shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="glass-effect border-purple-500/20 h-full">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Share2 className="w-5 h-5 text-purple-400" />
                Playbooks omnicanal
              </CardTitle>
              <CardDescription>
                Secuencias inspiradas en los flujos de Hootsuite con boost CreoVision.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationBlueprints.map((playbook, index) => (
                  <div
                    key={playbook.title}
                    className="p-3 rounded-lg border border-purple-500/20 bg-gray-800/40"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">
                        {index + 1}. {playbook.title}
                      </h4>
                      <span className="text-xs text-purple-300">{playbook.cadence}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{playbook.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {playbook.platforms.map((platform) => (
                        <span
                          key={`${playbook.title}-${platform}`}
                          className="text-xs px-2 py-1 rounded-full bg-gray-900/70 border border-purple-500/20 text-gray-200 flex items-center gap-1"
                        >
                          {getPlatformIcon(platform, 'w-3 h-3')}
                          {platformConfig[platform]?.label || platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35 }}
        >
          <Card className="glass-effect border-purple-500/20 h-full">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-400" />
                Radar IA (VidIQ++)
              </CardTitle>
              <CardDescription>
                Pulso de keywords, ventanas y momentum listo para accionar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-2">Palabras clave dominantes</p>
                <div className="flex flex-wrap gap-2">
                  {topHashtags.length > 0 ? (
                    topHashtags.map(([tag, count]) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200"
                      >
                        {tag} · {count}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">
                      Aún no hay suficientes hashtags para analizar.
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-300">Mejor ventana actual</p>
                  <p className="text-sm text-white font-semibold">
                    {previewOptimalTime || 'Selecciona plataformas para una recomendación'}
                  </p>
                </div>
                <Sparkles className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="p-3 rounded-lg border border-blue-500/20 bg-blue-500/10">
                <p className="text-xs text-gray-300 mb-1">Siguiente movimiento</p>
                <p className="text-sm text-white">
                  Duplica el contenido ganador en {platformUsage[0]?.label ?? 'la red principal'} con un recorte
                  rápido y protege el IQ {averageAiScore} reutilizando los hashtags sugeridos.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal Crear/Editar Evento */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl">
              {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingEvent ? 'Actualiza los detalles de tu publicación' : 'Programa una nueva publicación en tu calendario'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 overflow-y-auto flex-1">
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
                <Label className="text-white">Plataformas objetivo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {platformKeys.map((platform) => {
                    const selected = formData.platforms.includes(platform);
                    const config = platformConfig[platform];
                    return (
                      <Button
                        key={platform}
                        type="button"
                        variant="outline"
                        onClick={() => togglePlatformSelection(platform)}
                        className={`justify-start gap-2 h-10 border transition ${
                          selected
                            ? 'bg-purple-500/20 border-purple-400/60 text-white'
                            : 'bg-gray-800/50 border-purple-500/20 text-gray-200'
                        }`}
                      >
                        {getPlatformIcon(platform, 'w-4 h-4')}
                        <span className="text-sm">{config?.label || platform}</span>
                      </Button>
                    );
                  })}
                </div>
                {previewOptimalTime && (
                  <p className="text-xs text-emerald-300">
                    Mejor horario recomendado: {previewOptimalTime}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Estado</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border border-purple-500/30 text-white backdrop-blur">
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="scheduled">Programado</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign" className="text-white">Campaña / Sprint</Label>
              <Input
                id="campaign"
                placeholder="Ej: Lanzamiento Elite Q1"
                value={formData.campaign}
                onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                className="bg-gray-800/50 border-purple-500/20 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Objetivo principal</Label>
                <Select value={formData.primaryGoal} onValueChange={(value) => setFormData({ ...formData, primaryGoal: value })}>
                  <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                    <SelectValue placeholder="Selecciona objetivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border border-purple-500/30 text-white backdrop-blur">
                    {goalOptions.map((goal) => (
                      <SelectItem key={goal.value} value={goal.value}>
                        {goal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Tipo de contenido</Label>
                <Select value={formData.contentType} onValueChange={(value) => setFormData({ ...formData, contentType: value })}>
                  <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                    <SelectValue placeholder="Formato" />
                  </SelectTrigger>
                <SelectContent className="bg-gray-900/95 border border-purple-500/30 text-white backdrop-blur">
                  {contentTypeOptions.map((content) => (
                    <SelectItem key={content.value} value={content.value}>
                      {content.label}
                    </SelectItem>
                  ))}
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
                <SelectContent className="bg-gray-900/95 border border-purple-500/30 text-white backdrop-blur">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-purple-500/20 bg-purple-500/10">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-green-300" />
                    IQ estimado
                  </span>
                  <span className="text-[10px] text-gray-400">Motor estilo VidIQ</span>
                </div>
                <p className="text-2xl font-semibold text-white mt-1">
                  {previewAiScore}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Ajusta título y descripción para potenciar este score.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-purple-500/20 bg-gray-800/50">
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <Share2 className="w-3 h-3 text-sky-300" />
                  Hashtags sugeridos
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewHashtags.length > 0 ? (
                    previewHashtags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">Añade más contexto para recomendaciones.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0">
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
