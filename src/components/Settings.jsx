import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Link as LinkIcon,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Youtube,
  Instagram,
  Twitter,
  Facebook,
  Check,
  X,
  AlertCircle,
  Key,
  Mail,
  Crown,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import SEOHead from '@/components/SEOHead';

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Estados de configuración
  const [profile, setProfile] = useState({
    fullName: user?.user_metadata?.full_name || 'Usuario',
    email: user?.email || '',
    bio: 'Creador de contenido digital',
    website: 'https://creovision.com',
    profileImage: user?.user_metadata?.avatar_url || '',
    coverImage: user?.user_metadata?.cover_url || ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    newComments: true,
    newFollowers: true,
    mentionsOnly: false
  });

  const [connectedAccounts, setConnectedAccounts] = useState([
    { platform: 'youtube', name: 'YouTube', icon: Youtube, connected: true, username: '@MiCanal', color: 'text-red-500' },
    { platform: 'instagram', name: 'Instagram', icon: Instagram, connected: true, username: '@usuario', color: 'text-pink-500' },
    { platform: 'twitter', name: 'Twitter', icon: Twitter, connected: false, username: null, color: 'text-blue-400' },
    { platform: 'facebook', name: 'Facebook', icon: Facebook, connected: false, username: null, color: 'text-blue-600' },
  ]);

  const handleProfileImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profileImage: reader.result }));
        localStorage.setItem('creovision_profile_image', reader.result);

        // Disparar evento para actualizar navbar
        window.dispatchEvent(new CustomEvent('profileUpdated', {
          detail: { profileImage: reader.result, fullName: profile.fullName }
        }));

        toast({
          title: '✅ Foto de perfil actualizada',
          description: 'Tu foto de perfil ha sido cambiada correctamente',
        });
      };
      reader.readAsDataURL(file);
    }
  }, [profile.fullName, toast]);

  const handleCoverImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, coverImage: reader.result }));
        localStorage.setItem('creovision_cover_image', reader.result);

        toast({
          title: '✅ Foto de portada actualizada',
          description: 'Tu foto de portada ha sido cambiada correctamente',
        });
      };
      reader.readAsDataURL(file);
    }
  }, [toast]);

  const handleSaveProfile = useCallback(() => {
    // Guardar datos en localStorage
    localStorage.setItem('creovision_profile_data', JSON.stringify({
      fullName: profile.fullName,
      bio: profile.bio,
      website: profile.website
    }));

    // Disparar evento para actualizar navbar
    window.dispatchEvent(new CustomEvent('profileUpdated', {
      detail: { profileImage: profile.profileImage, fullName: profile.fullName }
    }));

    toast({
      title: '✅ Perfil actualizado',
      description: 'Tus cambios han sido guardados correctamente',
    });
  }, [profile, toast]);

  const handleToggleNotification = useCallback((key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleConnectAccount = useCallback((platform) => {
    setConnectedAccounts(prev => prev.map(acc =>
      acc.platform === platform
        ? { ...acc, connected: !acc.connected, username: acc.connected ? null : `@${platform}_user` }
        : acc
    ));

    const account = connectedAccounts.find(a => a.platform === platform);
    toast({
      title: account?.connected ? `❌ ${account.name} desconectado` : `✅ ${account?.name} conectado`,
      description: account?.connected
        ? 'La cuenta ha sido desconectada'
        : 'La cuenta ha sido conectada exitosamente',
    });
  }, [connectedAccounts, toast]);

  // Cargar imágenes guardadas al montar el componente
  useEffect(() => {
    const savedProfileImage = localStorage.getItem('creovision_profile_image');
    const savedCoverImage = localStorage.getItem('creovision_cover_image');
    const savedProfileData = localStorage.getItem('creovision_profile_data');

    if (savedProfileImage) {
      setProfile(prev => ({ ...prev, profileImage: savedProfileImage }));
    }

    if (savedCoverImage) {
      setProfile(prev => ({ ...prev, coverImage: savedCoverImage }));
    }

    if (savedProfileData) {
      const data = JSON.parse(savedProfileData);
      setProfile(prev => ({ ...prev, ...data }));
    }
  }, []);

  return (
    <>
      <SEOHead page="settings" />
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Configuración</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Personaliza tu experiencia y conecta tus redes sociales
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-gray-800/50 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Cuentas</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Suscripción</span>
            </TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Imágenes de Perfil</CardTitle>
                  <CardDescription>Personaliza tu perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Foto de Perfil */}
                  <div className="flex flex-col items-center gap-4">
                    <Label className="text-white text-sm font-semibold">Foto de Perfil</Label>
                    <Avatar className="w-32 h-32 ring-2 ring-purple-500/50">
                      <AvatarImage src={profile.profileImage} alt="Avatar" />
                      <AvatarFallback className="bg-purple-600 text-2xl">
                        {profile.fullName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <label htmlFor="profile-image-upload" className="w-full">
                      <input
                        id="profile-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="w-full border-purple-500/20 hover:bg-purple-500/10"
                        onClick={() => document.getElementById('profile-image-upload').click()}
                        type="button"
                      >
                        Cambiar Foto de Perfil
                      </Button>
                    </label>
                  </div>

                  {/* Foto de Portada */}
                  <div className="flex flex-col gap-4">
                    <Label className="text-white text-sm font-semibold">Foto de Portada</Label>
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-500/30 flex items-center justify-center">
                      {profile.coverImage ? (
                        <img src={profile.coverImage} alt="Portada" className="w-full h-full object-cover" />
                      ) : (
                        <p className="text-gray-400 text-sm">Sin portada</p>
                      )}
                    </div>
                    <label htmlFor="cover-image-upload" className="w-full">
                      <input
                        id="cover-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        className="w-full border-purple-500/20 hover:bg-purple-500/10"
                        onClick={() => document.getElementById('cover-image-upload').click()}
                        type="button"
                      >
                        Cambiar Portada
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-purple-500/20 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Información Personal</CardTitle>
                  <CardDescription>Actualiza tus datos de perfil</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-white">Nombre completo</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        className="bg-gray-800/50 border-purple-500/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-800/30 border-purple-500/20 text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-white">Biografía</Label>
                    <Input
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="bg-gray-800/50 border-purple-500/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-white">Sitio web</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="bg-gray-800/50 border-purple-500/20 text-white"
                    />
                  </div>

                  <Button onClick={handleSaveProfile} className="gradient-primary hover:opacity-90">
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ACCOUNTS TAB */}
          <TabsContent value="accounts">
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Cuentas Conectadas</CardTitle>
                <CardDescription>
                  Conecta tus redes sociales para publicar y gestionar contenido desde CreoVision
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectedAccounts.map((account) => {
                    const Icon = account.icon;
                    return (
                      <motion.div
                        key={account.platform}
                        className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-gray-800/50 flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${account.color}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{account.name}</h3>
                            {account.connected ? (
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-green-400">Conectado</span>
                                {account.username && (
                                  <span className="text-sm text-gray-400">• {account.username}</span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <X className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-500">No conectado</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant={account.connected ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleConnectAccount(account.platform)}
                          className={account.connected
                            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                            : 'gradient-primary hover:opacity-90'
                          }
                        >
                          {account.connected ? 'Desconectar' : 'Conectar'}
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-1">Permisos requeridos</h4>
                      <p className="text-sm text-blue-200">
                        Al conectar tus cuentas, CreoVision podrá publicar contenido, leer comentarios y
                        analizar métricas en tu nombre. Tus credenciales están protegidas y nunca son almacenadas.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications">
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Preferencias de Notificaciones</CardTitle>
                <CardDescription>Gestiona cómo y cuándo quieres recibir notificaciones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10">
                    <div className="space-y-0.5">
                      <Label className="text-white font-medium">Notificaciones por Email</Label>
                      <p className="text-sm text-gray-400">Recibe actualizaciones importantes por correo</p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={() => handleToggleNotification('emailNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10">
                    <div className="space-y-0.5">
                      <Label className="text-white font-medium">Notificaciones Push</Label>
                      <p className="text-sm text-gray-400">Recibe notificaciones en tiempo real</p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={() => handleToggleNotification('pushNotifications')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10">
                    <div className="space-y-0.5">
                      <Label className="text-white font-medium">Reporte Semanal</Label>
                      <p className="text-sm text-gray-400">Resumen de tu actividad cada semana</p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={() => handleToggleNotification('weeklyReport')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10">
                    <div className="space-y-0.5">
                      <Label className="text-white font-medium">Nuevos Comentarios</Label>
                      <p className="text-sm text-gray-400">Notificar cuando alguien comente tu contenido</p>
                    </div>
                    <Switch
                      checked={notifications.newComments}
                      onCheckedChange={() => handleToggleNotification('newComments')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10">
                    <div className="space-y-0.5">
                      <Label className="text-white font-medium">Nuevos Seguidores</Label>
                      <p className="text-sm text-gray-400">Notificar cuando ganes nuevos seguidores</p>
                    </div>
                    <Switch
                      checked={notifications.newFollowers}
                      onCheckedChange={() => handleToggleNotification('newFollowers')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10">
                    <div className="space-y-0.5">
                      <Label className="text-white font-medium">Solo Menciones</Label>
                      <p className="text-sm text-gray-400">Notificar solo cuando te mencionen</p>
                    </div>
                    <Switch
                      checked={notifications.mentionsOnly}
                      onCheckedChange={() => handleToggleNotification('mentionsOnly')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Cambiar Contraseña</CardTitle>
                  <CardDescription>Actualiza tu contraseña regularmente para mayor seguridad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-white">Contraseña actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-gray-800/50 border-purple-500/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white">Nueva contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-gray-800/50 border-purple-500/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">Confirmar nueva contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="bg-gray-800/50 border-purple-500/20 text-white"
                    />
                  </div>

                  <Button className="gradient-primary hover:opacity-90">
                    <Key className="w-4 h-4 mr-2" />
                    Actualizar Contraseña
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Autenticación de Dos Factores</CardTitle>
                  <CardDescription>Agrega una capa extra de seguridad a tu cuenta</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10">
                    <div className="space-y-0.5">
                      <Label className="text-white font-medium">2FA Habilitado</Label>
                      <p className="text-sm text-gray-400">Protege tu cuenta con autenticación de dos factores</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BILLING TAB */}
          <TabsContent value="billing">
            <div className="space-y-6">
              <Card className="glass-effect border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        Plan Premium
                      </CardTitle>
                      <CardDescription>Tu suscripción actual</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">$29.99</p>
                      <p className="text-sm text-gray-400">/mes</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-sm text-gray-400">Próximo pago</p>
                      <p className="text-lg font-semibold text-white">15 Feb 2025</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <p className="text-sm text-gray-400">Estado</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <p className="text-lg font-semibold text-green-400">Activo</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-300">Incluye:</p>
                    <ul className="space-y-2">
                      {[
                        'Publicaciones ilimitadas en todas las plataformas',
                        'IA generativa sin límites',
                        'Analytics avanzados',
                        'Biblioteca de contenido ilimitada',
                        'Soporte prioritario 24/7'
                      ].map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="border-purple-500/20 hover:bg-purple-500/10 flex-1">
                      Cambiar Plan
                    </Button>
                    <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 flex-1">
                      Cancelar Suscripción
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Método de Pago</CardTitle>
                  <CardDescription>Gestiona tu forma de pago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-lg glass-effect border border-purple-500/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 rounded bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">•••• •••• •••• 4242</p>
                        <p className="text-sm text-gray-400">Vence 12/26</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10">
                      Actualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
      </div>
    </>
  );
};

export default Settings;
