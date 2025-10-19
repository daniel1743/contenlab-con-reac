import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FolderOpen,
  Upload,
  Search,
  Grid3x3,
  List,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Trash2,
  Edit2,
  Copy,
  Share2,
  Star,
  Filter,
  Plus,
  FolderPlus,
  MoreVertical,
  Eye,
  Calendar
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ContentLibrary = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState('image');

  // Datos de ejemplo de carpetas
  const folders = [
    { id: 'all', name: 'Todos los archivos', count: 24, icon: FolderOpen },
    { id: 'images', name: 'Imágenes', count: 12, icon: ImageIcon },
    { id: 'videos', name: 'Videos', count: 6, icon: Video },
    { id: 'documents', name: 'Documentos', count: 6, icon: FileText },
    { id: 'favorites', name: 'Favoritos', count: 8, icon: Star },
  ];

  // Datos de ejemplo de contenido
  const [content, setContent] = useState([
    {
      id: 1,
      name: 'thumbnail-tutorial-ia.jpg',
      type: 'image',
      size: '2.4 MB',
      folder: 'images',
      url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
      uploadDate: '2025-01-10',
      favorite: true,
      usedIn: ['YouTube', 'Instagram']
    },
    {
      id: 2,
      name: 'video-intro-2025.mp4',
      type: 'video',
      size: '45.2 MB',
      folder: 'videos',
      url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
      uploadDate: '2025-01-09',
      favorite: false,
      usedIn: ['YouTube']
    },
    {
      id: 3,
      name: 'guion-video-tendencias.docx',
      type: 'document',
      size: '124 KB',
      folder: 'documents',
      url: null,
      uploadDate: '2025-01-08',
      favorite: true,
      usedIn: []
    },
    {
      id: 4,
      name: 'banner-promocion.png',
      type: 'image',
      size: '1.8 MB',
      folder: 'images',
      url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      uploadDate: '2025-01-07',
      favorite: false,
      usedIn: ['Facebook', 'Twitter']
    },
    {
      id: 5,
      name: 'logo-contentlab.svg',
      type: 'image',
      size: '45 KB',
      folder: 'images',
      url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400',
      uploadDate: '2025-01-06',
      favorite: true,
      usedIn: ['Instagram', 'YouTube', 'Twitter']
    },
    {
      id: 6,
      name: 'tutorial-completo.mp4',
      type: 'video',
      size: '120.5 MB',
      folder: 'videos',
      url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400',
      uploadDate: '2025-01-05',
      favorite: false,
      usedIn: ['YouTube']
    },
  ]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5 text-blue-400" />;
      case 'video': return <Video className="w-5 h-5 text-pink-400" />;
      case 'document': return <FileText className="w-5 h-5 text-green-400" />;
      default: return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder === 'all' ||
                         (selectedFolder === 'favorites' && item.favorite) ||
                         item.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleToggleFavorite = useCallback((id) => {
    setContent(prev => prev.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ));
  }, []);

  const handleDelete = useCallback((id) => {
    setContent(prev => prev.filter(item => item.id !== id));
    toast({
      title: '🗑️ Archivo eliminado',
      description: 'El archivo ha sido eliminado de tu biblioteca',
    });
  }, [toast]);

  const handleUpload = useCallback(() => {
    setIsUploadModalOpen(false);
    toast({
      title: '✅ Archivo subido',
      description: 'El archivo se ha agregado a tu biblioteca',
    });
  }, [toast]);

  const handleDownload = useCallback((item) => {
    toast({
      title: '📥 Descargando...',
      description: `Descargando ${item.name}`,
    });
  }, [toast]);

  const handleCopy = useCallback((item) => {
    navigator.clipboard.writeText(item.url || item.name);
    toast({
      title: '📋 Copiado',
      description: 'Enlace copiado al portapapeles',
    });
  }, [toast]);

  const stats = {
    totalFiles: content.length,
    images: content.filter(c => c.type === 'image').length,
    videos: content.filter(c => c.type === 'video').length,
    documents: content.filter(c => c.type === 'document').length,
    totalSize: content.reduce((acc, item) => {
      const size = parseFloat(item.size);
      return acc + (item.size.includes('MB') ? size : size / 1024);
    }, 0).toFixed(1)
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Biblioteca de Contenido</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Gestiona todos tus archivos, imágenes, videos y documentos en un solo lugar
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        <Card className="glass-effect border-purple-500/20">
          <CardContent className="p-4 text-center">
            <FolderOpen className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold text-white">{stats.totalFiles}</p>
            <p className="text-xs text-gray-400">Total</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-blue-500/20">
          <CardContent className="p-4 text-center">
            <ImageIcon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-blue-400">{stats.images}</p>
            <p className="text-xs text-gray-400">Imágenes</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-pink-500/20">
          <CardContent className="p-4 text-center">
            <Video className="w-6 h-6 mx-auto mb-2 text-pink-400" />
            <p className="text-2xl font-bold text-pink-400">{stats.videos}</p>
            <p className="text-xs text-gray-400">Videos</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-green-500/20">
          <CardContent className="p-4 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-green-400">{stats.documents}</p>
            <p className="text-xs text-gray-400">Documentos</p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Download className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-bold text-yellow-400">{stats.totalSize} MB</p>
            <p className="text-xs text-gray-400">Espacio usado</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4 justify-between items-center glass-effect p-4 rounded-xl border border-purple-500/20"
      >
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="gradient-primary hover:opacity-90"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir Archivo
          </Button>
          <Button
            onClick={() => setIsFolderModalOpen(true)}
            variant="outline"
            className="border-purple-500/20 hover:bg-purple-500/10"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Nueva Carpeta
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-gray-800/50 border-purple-500/20 text-white"
            />
          </div>

          <div className="flex gap-1 border border-purple-500/20 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-purple-600' : ''}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-purple-600' : ''}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Carpetas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {folders.map((folder) => {
                    const Icon = folder.icon;
                    return (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`w-full flex items-center justify-between p-3 text-left transition-all hover:bg-purple-500/10 ${
                          selectedFolder === folder.id ? 'bg-purple-500/20 border-r-2 border-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${selectedFolder === folder.id ? 'text-purple-400' : 'text-gray-400'}`} />
                          <span className={`text-sm ${selectedFolder === folder.id ? 'text-white font-medium' : 'text-gray-300'}`}>
                            {folder.name}
                          </span>
                        </div>
                        <span className={`text-xs ${selectedFolder === folder.id ? 'text-purple-400' : 'text-gray-500'}`}>
                          {folder.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Content Grid/List */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {filteredContent.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContent.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className="group"
                    >
                      <Card className="glass-effect border-purple-500/20 hover:border-purple-500/40 transition-all overflow-hidden">
                        <div className="relative aspect-video bg-gray-800/50 overflow-hidden">
                          {item.url ? (
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {getFileIcon(item.type)}
                            </div>
                          )}

                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(item)}
                              className="bg-white/10 hover:bg-white/20"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(item)}
                              className="bg-white/10 hover:bg-white/20"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              className="bg-red-500/20 hover:bg-red-500/40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Favorite Star */}
                          <button
                            onClick={() => handleToggleFavorite(item.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                          >
                            <Star className={`w-4 h-4 ${item.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
                          </button>
                        </div>

                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white truncate">{item.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400">{item.size}</span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-400">{item.uploadDate}</span>
                              </div>
                              {item.usedIn.length > 0 && (
                                <div className="flex gap-1 mt-2 flex-wrap">
                                  {item.usedIn.map((platform, idx) => (
                                    <span key={idx} className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                      {platform}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {getFileIcon(item.type)}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContent.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ x: 4 }}
                    >
                      <Card className="glass-effect border-purple-500/20 hover:border-purple-500/40 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded bg-gray-800/50 flex items-center justify-center flex-shrink-0">
                                {getFileIcon(item.type)}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">{item.name}</p>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-xs text-gray-400">{item.size}</span>
                                  <span className="text-xs text-gray-400">{item.uploadDate}</span>
                                  {item.usedIn.length > 0 && (
                                    <div className="flex gap-1">
                                      {item.usedIn.map((platform, idx) => (
                                        <span key={idx} className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                                          {platform}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFavorite(item.id)}
                                className="hover:bg-purple-500/20"
                              >
                                <Star className={`w-4 h-4 ${item.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(item)}
                                className="hover:bg-purple-500/20"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(item)}
                                className="hover:bg-purple-500/20"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <Card className="glass-effect border-purple-500/20 min-h-[400px] flex items-center justify-center">
                <CardContent className="text-center">
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-30" />
                  <h3 className="text-xl font-semibold text-white mb-2">No hay archivos</h3>
                  <p className="text-gray-400 mb-4">Sube tu primer archivo para comenzar</p>
                  <Button onClick={() => setIsUploadModalOpen(true)} className="gradient-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Archivo
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-gray-900 border-purple-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Subir Archivo</DialogTitle>
            <DialogDescription>Sube imágenes, videos o documentos a tu biblioteca</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de archivo</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger className="bg-gray-800/50 border-purple-500/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Imagen</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <p className="text-sm text-gray-300 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
              <p className="text-xs text-gray-500">Tamaño máximo: 100MB</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} className="border-purple-500/20">
              Cancelar
            </Button>
            <Button onClick={handleUpload} className="gradient-primary">
              Subir Archivo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentLibrary;
