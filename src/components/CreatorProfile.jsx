import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
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
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [tiktokVideos, setTiktokVideos] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);

  const [newThreadContent, setNewThreadContent] = useState('');
  const [showNewThreadInput, setShowNewThreadInput] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Cargar perfil
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

      // Cargar threads
      const { data: threadsData, error: threadsError } = await supabase
        .from('creator_threads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (threadsError) throw threadsError;
      setThreads(threadsData || []);

      // Cargar contenido por plataforma
      const { data: contentData, error: contentError } = await supabase
        .from('creator_content')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (contentError) throw contentError;

      if (contentData) {
        setYoutubeVideos(contentData.filter(c => c.platform === 'youtube'));
        setTiktokVideos(contentData.filter(c => c.platform === 'tiktok'));
        setInstagramPosts(contentData.filter(c => c.platform === 'instagram'));
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
      const thread = threads.find(t => t.id === threadId);
      const { data: existingLike } = await supabase
        .from('thread_likes')
        .select('*')
        .eq('thread_id', threadId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('thread_likes')
          .delete()
          .eq('thread_id', threadId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('thread_likes')
          .insert({
            thread_id: threadId,
            user_id: user.id
          });
      }

      // Recargar threads
      loadProfileData();
    } catch (error) {
      console.error('Error toggling like:', error);
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

  const handleCreateThread = async () => {
    if (!newThreadContent.trim()) return;

    try {
      const { data, error } = await supabase
        .from('creator_threads')
        .insert({
          user_id: user.id,
          content: newThreadContent
        })
        .select()
        .single();

      if (error) throw error;

      setThreads([data, ...threads]);
      setNewThreadContent('');
      setShowNewThreadInput(false);

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
        className="h-[300px] md:h-[400px] lg:h-[600px] bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
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
            className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-6xl font-bold text-white border-4 border-gray-900 shadow-xl hover:rotate-6 transition-transform cursor-pointer"
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {profileData.display_name?.charAt(0)?.toUpperCase() || 'U'}
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
        {threads.length > 0 && (
          <>
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
              📝 Hilos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {threads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card className="bg-gray-800/80 border-purple-500/30 hover:border-purple-500 hover:-translate-y-1 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold">
                          {profileData.display_name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">{profileData.display_name}</div>
                          <div className="text-xs text-purple-300">
                            {new Date(thread.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4 line-clamp-3">{thread.content}</p>
                      <div className="flex gap-4 text-sm">
                        <button
                          onClick={() => toggleThreadLike(thread.id)}
                          className="flex items-center gap-1 text-purple-400 hover:text-pink-400 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          {thread.likes}
                        </button>
                        <div className="flex items-center gap-1 text-purple-300">
                          <Eye className="w-4 h-4" />
                          {thread.views}
                        </div>
                        <div className="flex items-center gap-1 text-purple-300">
                          <Share2 className="w-4 h-4" />
                          {thread.shares}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Videos sections similar structure... */}
        {/* YouTube, TikTok, Instagram sections would follow similar pattern */}

      </div>
    </div>
  );
}
