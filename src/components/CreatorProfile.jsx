import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import ThreadComposer from '@/components/ThreadComposer';
import ThreadCard from '@/components/ThreadCard';
import VideoCarousel from '@/components/VideoCarousel';
import {
  Heart,
  Eye,
  Share2,
  Play,
  Twitter,
  Instagram,
  Youtube as YouTubeIcon,
  Plus,
  Edit2,
  Save,
  Loader2
} from 'lucide-react';

// Icono de TikTok personalizado
const TikTokIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"></path>
  </svg>
);

export default function CreatorProfile() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    display_name: '',
    username: '',
    bio: '',
    mission: '',
    vision: '',
    followers: 0,
    engagement: 0,
    total_views: 0,
    twitter_handle: '',
    instagram_handle: '',
    youtube_channel: '',
    tiktok_handle: ''
  });

  const [threads, setThreads] = useState([]);
  const [threadLikes, setThreadLikes] = useState({}); // { threadId: boolean }
  const [threadReplies, setThreadReplies] = useState({}); // { threadId: [replies] }
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [tiktokVideos, setTiktokVideos] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);

  const [showThreadComposer, setShowThreadComposer] = useState(false);
  const [profileVisuals, setProfileVisuals] = useState({
    profileImage: '',
    coverImage: ''
  });

  // Cargar datos al montar
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadVisuals = () => {
      setProfileVisuals({
        profileImage: localStorage.getItem('creovision_profile_image') || user.user_metadata?.avatar_url || '',
        coverImage: localStorage.getItem('creovision_cover_image') || ''
      });
    };

    loadVisuals();

    const handleProfileUpdate = (event) => {
      const { profileImage, coverImage } = event.detail || {};
      setProfileVisuals((prev) => ({
        profileImage: profileImage ?? prev.profileImage,
        coverImage: coverImage ?? prev.coverImage
      }));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // ⚡ OPTIMIZACIÓN: Cargar perfil primero (necesario para crear si no existe)
      const { data: profile, error: profileError } = await supabase
        .from('creator_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profile) {
        setProfileData(profile);
      } else {
        // Crear perfil inicial
        await createInitialProfile();
      }

      // ⚡ OPTIMIZACIÓN: Cargar todo en paralelo con Promise.all
      const [
        threadsResult,
        contentResult
      ] = await Promise.all([
        // Cargar threads
        supabase
          .from('creator_threads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        
        // Cargar contenido por plataforma
        supabase
          .from('creator_content')
          .select('*')
          .eq('user_id', user.id)
          .order('display_order', { ascending: true })
      ]);

      // Procesar threads
      if (threadsResult.error) throw threadsResult.error;
      const threadsList = threadsResult.data || [];
      setThreads(threadsList);

      // Procesar contenido
      if (contentResult.error) throw contentResult.error;
      if (contentResult.data) {
        setYoutubeVideos(contentResult.data.filter(c => c.platform === 'youtube'));
        setTiktokVideos(contentResult.data.filter(c => c.platform === 'tiktok'));
        setInstagramPosts(contentResult.data.filter(c => c.platform === 'instagram'));
      }

      // ⚡ OPTIMIZACIÓN: Cargar likes y replies en paralelo (solo si hay threads)
      const threadIds = threadsList.map(t => t.id);
      if (threadIds.length > 0) {
        // Cargar likes
        const likesPromise = supabase
          .from('thread_likes')
          .select('thread_id')
          .eq('user_id', user.id)
          .in('thread_id', threadIds);
        
        // Cargar respuestas (con manejo de error silencioso)
        const repliesPromise = supabase
          .from('thread_replies')
          .select('*')
          .in('thread_id', threadIds)
          .order('created_at', { ascending: true })
          .then(result => {
            // Si hay error de tabla no encontrada, retornar vacío silenciosamente
            if (result.error && result.error.code === 'PGRST205') {
              return { data: null, error: null };
            }
            return result;
          })
          .catch((error) => {
            // Manejar errores silenciosamente (tabla no existe o error de conexión)
            if (error.code === 'PGRST205' || error.message?.includes('Failed to fetch')) {
              return { data: null, error: null };
            }
            // Para otros errores, loguear pero no fallar
            console.warn('Error cargando replies (no crítico):', error.message);
            return { data: null, error: null };
          });
        
        const [
          likesResult,
          repliesResult
        ] = await Promise.all([
          likesPromise,
          repliesPromise
        ]);

        // Procesar likes
        const likesMap = {};
        likesResult.data?.forEach(like => {
          likesMap[like.thread_id] = true;
        });
        setThreadLikes(likesMap);

        // Procesar replies
        if (repliesResult.data) {
          const repliesMap = {};
          repliesResult.data.forEach(reply => {
            if (!repliesMap[reply.thread_id]) {
              repliesMap[reply.thread_id] = [];
            }
            repliesMap[reply.thread_id].push(reply);
          });
          setThreadReplies(repliesMap);
        } else {
          setThreadReplies({});
        }
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo cargar el perfil',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createInitialProfile = async () => {
    const { data, error } = await supabase
      .from('creator_profiles')
      .insert({
        user_id: user.id,
        display_name: user.user_metadata?.full_name || 'Tu Nombre',
        username: `@${user.email?.split('@')[0] || 'usuario'}`,
        bio: 'Creador de contenido',
        mission: 'Crear contenido viral de calidad que inspire y conecte con la audiencia',
        vision: 'Ser la plataforma número 1 para creadores de contenido en toda Latinoamérica'
      })
      .select()
      .single();

    if (error) throw error;
    setProfileData(data);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('creator_profiles')
        .update({
          display_name: profileData.display_name,
          username: profileData.username,
          bio: profileData.bio,
          mission: profileData.mission,
          vision: profileData.vision,
          twitter_handle: profileData.twitter_handle,
          instagram_handle: profileData.instagram_handle,
          youtube_channel: profileData.youtube_channel,
          tiktok_handle: profileData.tiktok_handle
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: '✅ Guardado',
        description: 'Perfil actualizado correctamente'
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo guardar el perfil',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleThreadLike = async (threadId) => {
    try {
      const isLiked = threadLikes[threadId];
      
      if (isLiked) {
        // Unlike
        await supabase
          .from('thread_likes')
          .delete()
          .eq('thread_id', threadId)
          .eq('user_id', user.id);
        
        // Actualizar contador
        const thread = threads.find(t => t.id === threadId);
        await supabase
          .from('creator_threads')
          .update({ likes: Math.max(0, (thread.likes || 0) - 1) })
          .eq('id', threadId);
      } else {
        // Like
        await supabase
          .from('thread_likes')
          .insert({
            thread_id: threadId,
            user_id: user.id
          });
        
        // Actualizar contador
        const thread = threads.find(t => t.id === threadId);
        await supabase
          .from('creator_threads')
          .update({ likes: (thread.likes || 0) + 1 })
          .eq('id', threadId);
      }

      // Actualizar estado local
      setThreadLikes(prev => ({
        ...prev,
        [threadId]: !isLiked
      }));

      // Actualizar contador en threads
      setThreads(prev => prev.map(t => 
        t.id === threadId 
          ? { ...t, likes: isLiked ? Math.max(0, (t.likes || 0) - 1) : (t.likes || 0) + 1 }
          : t
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo actualizar el like',
        variant: 'destructive'
      });
    }
  };

  const handleThreadReply = async (threadId, content) => {
    try {
      // Verificar si la tabla existe antes de insertar
      const { data, error } = await supabase
        .from('thread_replies')
        .insert({
          thread_id: threadId,
          user_id: user.id,
          content: content,
          user_name: profileData.display_name || user.email?.split('@')[0] || 'Usuario'
        })
        .select()
        .single();

      if (error) {
        // Si la tabla no existe, mostrar mensaje informativo
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          toast({
            title: '⚠️ Tabla no encontrada',
            description: 'Por favor ejecuta el SQL de migración: supabase/thread_replies_table.sql',
            variant: 'destructive',
            duration: 6000
          });
          return;
        }
        throw error;
      }

      // Actualizar estado local
      setThreadReplies(prev => ({
        ...prev,
        [threadId]: [...(prev[threadId] || []), data]
      }));

      toast({
        title: '✅ Respuesta enviada',
        description: 'Tu respuesta se publicó correctamente'
      });
    } catch (error) {
      console.error('Error replying to thread:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo enviar la respuesta',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const handleThreadShare = async (threadId) => {
    try {
      const thread = threads.find(t => t.id === threadId);
      await supabase
        .from('creator_threads')
        .update({ shares: (thread.shares || 0) + 1 })
        .eq('id', threadId);

      setThreads(prev => prev.map(t => 
        t.id === threadId 
          ? { ...t, shares: (t.shares || 0) + 1 }
          : t
      ));

      // Copiar URL al portapapeles
      const url = `${window.location.origin}/mi-perfil?thread=${threadId}`;
      await navigator.clipboard.writeText(url);
      
      toast({
        title: '✅ Enlace copiado',
        description: 'El enlace del hilo se copió al portapapeles'
      });
    } catch (error) {
      console.error('Error sharing thread:', error);
    }
  };

  const handleAddVideo = async (platform) => {
    try {
      const { data, error } = await supabase
        .from('creator_content')
        .insert({
          user_id: user.id,
          platform,
          content_url: '',
          title: `Video de ${platform}`,
          display_order: platform === 'youtube' ? youtubeVideos.length :
                         platform === 'tiktok' ? tiktokVideos.length :
                         instagramPosts.length
        })
        .select()
        .single();

      if (error) throw error;

      if (platform === 'youtube') {
        setYoutubeVideos([...youtubeVideos, data]);
      } else if (platform === 'tiktok') {
        setTiktokVideos([...tiktokVideos, data]);
      } else {
        setInstagramPosts([...instagramPosts, data]);
      }

      toast({
        title: '✅ Agregado',
        description: `Espacio para video de ${platform} creado`
      });
    } catch (error) {
      console.error('Error adding video:', error);
    }
  };

  const handleUpdateVideoUrl = async (id, url, platform) => {
    try {
      const { error } = await supabase
        .from('creator_content')
        .update({ content_url: url })
        .eq('id', id);

      if (error) throw error;

      // Actualizar estado local
      if (platform === 'youtube') {
        setYoutubeVideos(prev => prev.map(v => v.id === id ? { ...v, content_url: url } : v));
      } else if (platform === 'tiktok') {
        setTiktokVideos(prev => prev.map(v => v.id === id ? { ...v, content_url: url } : v));
      } else {
        setInstagramPosts(prev => prev.map(v => v.id === id ? { ...v, content_url: url } : v));
      }
    } catch (error) {
      console.error('Error updating video URL:', error);
    }
  };

  const handleCreateThread = async ({ content, gif }) => {
    if (!content.trim() && !gif) return;

    try {
      // Preparar datos del hilo
      const threadData = {
        user_id: user.id,
        content: content || ''
      };

      // Agregar GIF solo si existe y la columna está disponible
      if (gif) {
        threadData.gif = gif;
      }

      const { data, error } = await supabase
        .from('creator_threads')
        .insert(threadData)
        .select()
        .single();

      if (error) {
        // Si el error es porque la columna gif no existe, intentar sin ella
        if (error.code === 'PGRST204' && error.message?.includes('gif')) {
          console.warn('[CreatorProfile] Columna gif no encontrada, intentando sin GIF');
          const { data: retryData, error: retryError } = await supabase
            .from('creator_threads')
            .insert({
              user_id: user.id,
              content: content || ''
            })
            .select()
            .single();
          
          if (retryError) throw retryError;
          
          toast({
            title: '⚠️ Hilo creado sin GIF',
            description: 'Ejecuta el SQL: supabase/add_gif_column_to_threads.sql para habilitar GIFs',
            duration: 5000
          });
          
          setThreads([retryData, ...threads.slice(0, 9)]);
          setShowThreadComposer(false);
          return;
        }
        throw error;
      }

      setThreads([data, ...threads.slice(0, 9)]); // Mantener máximo 10
      setShowThreadComposer(false);

      toast({
        title: '✅ Hilo creado',
        description: 'Tu hilo se publicó correctamente'
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({
        title: '❌ Error',
        description: 'No se pudo crear el hilo',
        variant: 'destructive'
      });
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Banner */}
      <motion.div
        className="h-[300px] md:h-[400px] lg:h-[600px] relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {profileVisuals.coverImage ? (
          <img
            src={profileVisuals.coverImage}
            alt="Portada del perfil"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10" />
        <div className="absolute inset-0 opacity-30">
          {/* Decorative circles */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-40 right-40 w-48 h-48 bg-white/10 rounded-full blur-xl" />
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        </div>
      </motion.div>

      {/* Profile Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <motion.div
          className="flex flex-col md:flex-row gap-6 items-start mb-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Profile Photo */}
          <motion.div
            className="rounded-full border-4 border-gray-900 shadow-xl hover:rotate-3 transition-transform cursor-pointer"
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {profileVisuals.profileImage ? (
              <div className="w-32 h-32 rounded-full overflow-hidden">
                <img
                  src={profileVisuals.profileImage}
                  alt={profileData.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-6xl font-bold text-white">
                {profileData.display_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1">
            <Button
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              disabled={saving}
              className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar Perfil
                </>
              )}
            </Button>

            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={profileData.display_name}
                  onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                  placeholder="Nombre"
                  className="bg-gray-800/60 border-purple-500/30"
                />
                <Input
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  placeholder="@usuario"
                  className="bg-gray-800/60 border-purple-500/30"
                />
                <Textarea
                  value={profileData.mission}
                  onChange={(e) => setProfileData({ ...profileData, mission: e.target.value })}
                  placeholder="Misión"
                  className="bg-gray-800/60 border-purple-500/30 min-h-[80px]"
                />
                <Textarea
                  value={profileData.vision}
                  onChange={(e) => setProfileData({ ...profileData, vision: e.target.value })}
                  placeholder="Visión"
                  className="bg-gray-800/60 border-purple-500/30 min-h-[80px]"
                />
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {profileData.display_name}
                </h1>
                <p className="text-lg text-purple-300 mb-4">{profileData.username}</p>
                <p className="text-gray-300 mb-3">
                  <strong>Misión:</strong> {profileData.mission}
                </p>
                <p className="text-gray-300">
                  <strong>Visión:</strong> {profileData.vision}
                </p>
              </>
            )}

            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              <motion.div
                whileHover={{ y: -4, scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center cursor-pointer"
              >
                <Twitter className="w-5 h-5" />
              </motion.div>
              <motion.div
                whileHover={{ y: -4, scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center cursor-pointer"
              >
                <Instagram className="w-5 h-5" />
              </motion.div>
              <motion.div
                whileHover={{ y: -4, scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center cursor-pointer"
              >
                <YouTubeIcon className="w-5 h-5" />
              </motion.div>
              <motion.div
                whileHover={{ y: -4, scale: 1.1 }}
                className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center cursor-pointer"
              >
                <TikTokIcon />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 mb-16"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-gray-800/60 border-purple-500/30 hover:border-purple-500 transition-all hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {profileData.followers?.toLocaleString()}
              </div>
              <div className="text-sm text-purple-300 mt-2">Seguidores</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/60 border-purple-500/30 hover:border-purple-500 transition-all hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {profileData.engagement}%
              </div>
              <div className="text-sm text-purple-300 mt-2">Engagement</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800/60 border-purple-500/30 hover:border-purple-500 transition-all hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {profileData.total_views?.toLocaleString()}
              </div>
              <div className="text-sm text-purple-300 mt-2">Visualizaciones</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Threads Section */}
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          📝 Hilos
        </h2>

        {/* Thread Composer */}
        <AnimatePresence>
          {showThreadComposer && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <ThreadComposer
                onPost={handleCreateThread}
                onClose={() => setShowThreadComposer(false)}
                isOpen={showThreadComposer}
                placeholder="¿Qué está pasando?"
                maxLength={280}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Threads List - Máximo 10 */}
        <div className="space-y-4 mb-8">
          {threads.length > 0 ? (
            threads.slice(0, 10).map((thread, index) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                user={profileData}
                onLike={toggleThreadLike}
                onReply={handleThreadReply}
                onShare={handleThreadShare}
                isLiked={threadLikes[thread.id] || false}
                likeCount={thread.likes || 0}
                viewCount={thread.views || 0}
                shareCount={thread.shares || 0}
                replies={threadReplies[thread.id] || []}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-gray-800/40 rounded-xl border border-purple-500/20">
              <p className="text-gray-400 mb-4">Aún no has creado hilos. ¡Comparte tu primera idea!</p>
              <Button
                onClick={() => setShowThreadComposer(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Hilo
              </Button>
            </div>
          )}
        </div>

        {/* Create Thread Button */}
        {!showThreadComposer && (
          <div className="flex justify-center mb-16">
            <Button
              onClick={() => setShowThreadComposer(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Nuevo Hilo
            </Button>
          </div>
        )}

        {/* YouTube Section */}
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
          🎥 Videos de YouTube
        </h2>
        <VideoCarousel
          videos={youtubeVideos}
          platform="youtube"
          onAddVideo={handleAddVideo}
          onUpdateVideoUrl={handleUpdateVideoUrl}
          maxVideos={5}
        />

        {/* TikTok Section */}
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 mt-16">
          ⚡ Videos de TikTok
        </h2>
        <VideoCarousel
          videos={tiktokVideos}
          platform="tiktok"
          onAddVideo={handleAddVideo}
          onUpdateVideoUrl={handleUpdateVideoUrl}
          maxVideos={5}
        />

        {/* Instagram Section */}
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8 mt-16">
          📸 Posts de Instagram
        </h2>
        <VideoCarousel
          videos={instagramPosts}
          platform="instagram"
          onAddVideo={handleAddVideo}
          onUpdateVideoUrl={handleUpdateVideoUrl}
          maxVideos={5}
        />

      </div>
    </div>
  );
}
