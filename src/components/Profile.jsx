import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCog, Mail, User, Globe, Youtube, Instagram, Twitter, Upload, Save, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Cargar datos desde localStorage al inicio
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('creovision_profile_image') || user?.user_metadata?.avatar_url || '';
  });
  const [coverImage, setCoverImage] = useState(() => {
    return localStorage.getItem('creovision_cover_image') || '';
  });

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('creovision_profile_data');
    if (savedData) {
      return JSON.parse(savedData);
    }
    return {
      fullName: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      bio: 'Creador de contenido apasionado por la tecnología y el marketing digital. Ayudo a otros creadores a crecer en redes sociales.',
      website: 'https://miportfolio.com',
      youtube: '@micanal',
      instagram: '@miusuario',
      twitter: '@miusuario'
    };
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateImageFile = (file) => {
    if (!file) return false;
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'La imagen no puede superar los 2MB.',
        variant: 'destructive',
      });
      return false;
    }
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Solo se permiten archivos de imagen.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  // Manejar la carga de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!validateImageFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      setProfileImage(base64Image);
      localStorage.setItem('creovision_profile_image', base64Image);
      toast({
        title: 'Imagen actualizada',
        description: 'Tu foto de perfil se ha actualizado correctamente.',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (!validateImageFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      setCoverImage(base64Image);
      localStorage.setItem('creovision_cover_image', base64Image);
      toast({
        title: 'Portada actualizada',
        description: 'Tu foto de portada se ha actualizado correctamente.',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Guardar datos en localStorage
    localStorage.setItem('creovision_profile_data', JSON.stringify(formData));

    // Disparar evento personalizado para que Navbar se actualice
    window.dispatchEvent(new CustomEvent('profileUpdated', {
      detail: {
        fullName: formData.fullName,
        profileImage: profileImage,
        coverImage: coverImage
      }
    }));

    toast({
      title: 'Perfil actualizado',
      description: 'Tus cambios se han guardado correctamente.',
    });
  };

  const handleCancel = () => {
    // Recargar datos desde localStorage
    const savedData = localStorage.getItem('creovision_profile_data');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
    const savedImage = localStorage.getItem('creovision_profile_image');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    const savedCover = localStorage.getItem('creovision_cover_image');
    if (savedCover) {
      setCoverImage(savedCover);
    } else {
      setCoverImage('');
    }
    toast({
      title: 'Cambios descartados',
      description: 'Se han restaurado los valores guardados.',
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
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Configurar Perfil</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Personaliza tu perfil y configura tu identidad de creador
        </p>
      </motion.div>

      {/* Cover Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Foto de Portada</CardTitle>
            <CardDescription>Personaliza el fondo de tu perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-48 rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Portada del perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 text-sm">
                  No has cargado una portada
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="border-purple-500/20 hover:bg-purple-500/10"
                onClick={() => coverInputRef.current?.click()}
                type="button"
              >
                <Upload className="w-4 h-4 mr-2" />
                Subir portada
              </Button>
              {coverImage && (
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white"
                  onClick={() => {
                    setCoverImage('');
                    localStorage.removeItem('creovision_cover_image');
                  }}
                  type="button"
                >
                  Quitar portada
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Recomendado 1200x400px. Formatos JPG o PNG (máximo 2MB).
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Foto de Perfil</CardTitle>
            <CardDescription>Actualiza tu imagen de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage alt={formData.fullName} src={profileImage} />
                <AvatarFallback className="bg-purple-600 text-2xl">
                  {getAvatarFallback(formData.fullName, formData.email)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="border-purple-500/20 hover:bg-purple-500/10"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir nueva foto
                </Button>
                <p className="text-xs text-gray-400">
                  JPG, PNG o GIF. Tamaño máximo: 2MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-400" />
              Información Personal
            </CardTitle>
            <CardDescription>Actualiza tu información básica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">Nombre Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="glass-effect border-purple-500/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="glass-effect border-purple-500/20 text-gray-400"
              />
              <p className="text-xs text-gray-500">
                El email no puede ser modificado. Contacta soporte si necesitas cambiarlo.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-300">Biografía</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="glass-effect border-purple-500/20 text-white resize-none"
              />
              <p className="text-xs text-gray-400">
                Cuéntanos sobre ti. Máximo 200 caracteres.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Globe className="w-5 h-5 mr-2 text-green-400" />
              Redes Sociales
            </CardTitle>
            <CardDescription>Conecta tus plataformas de contenido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-gray-300 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sitio Web
              </Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://tusitio.com"
                className="glass-effect border-purple-500/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube" className="text-gray-300 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube
              </Label>
              <Input
                id="youtube"
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="@tucanal"
                className="glass-effect border-purple-500/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-gray-300 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram
              </Label>
              <Input
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@tuusuario"
                className="glass-effect border-purple-500/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter" className="text-gray-300 flex items-center gap-2">
                <Twitter className="w-4 h-4 text-blue-400" />
                Twitter / X
              </Label>
              <Input
                id="twitter"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="@tuusuario"
                className="glass-effect border-purple-500/20 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Shield className="w-5 h-5 mr-2 text-yellow-400" />
              Seguridad
            </CardTitle>
            <CardDescription>Gestiona la seguridad de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="border-purple-500/20 hover:bg-purple-500/10">
              Cambiar Contraseña
            </Button>
            <Button variant="outline" className="border-red-500/20 hover:bg-red-500/10 text-red-400 ml-2">
              Eliminar Cuenta
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end gap-4"
      >
        <Button
          variant="outline"
          className="border-purple-500/20 hover:bg-purple-500/10"
          onClick={handleCancel}
          type="button"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          className="gradient-primary hover:opacity-90"
          type="button"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
      </motion.div>
    </div>
  );
};

export default Profile;
