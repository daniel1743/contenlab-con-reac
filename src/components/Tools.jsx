
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Image, Hash, Wand2, TrendingUp, Zap, Clipboard, Trash2, Copy, BarChart2, Youtube, Facebook, Instagram as InstagramIcon, Twitter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contentOptions, contentDurations } from '@/components/contentGenerator/contentOptions';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const Tools = ({ onSectionChange, onGenerate, onCopyDownload }) => {
  const [selectedTheme, setSelectedTheme] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [contentTopic, setContentTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleThemeChange = (value) => {
    setSelectedTheme(value);
    setSelectedStyle('');
  };

  const cleanScript = () => {
    if (!generatedContent) return;
    let cleaned = generatedContent
      .replace(/\[HOOK INICIAL\]/g, '')
      .replace(/\[DESARROLLO\]/g, '')
      .replace(/### (.*)\n/g, '')
      .replace(/\*\*/g, '')
      .replace(/#️⃣ Hashtags:/g, '')
      .replace(/#\w+/g, '')
      .trim();
    setGeneratedContent(cleaned);
    toast({ title: 'Guión Limpiado', description: 'Se han eliminado las etiquetas y hashtags.' });
  }

  const handleGenerateContent = async () => {
    if (!onGenerate()) return;

    if (!contentTopic.trim() || !selectedTheme || !selectedStyle || !selectedDuration) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos para generar contenido.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedContent('');

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockContent = `## Contenido para: ${contentTopic}\n\n**Temática**: ${selectedTheme}\n**Estilo**: ${selectedStyle}\n**Duración**: ${selectedDuration}\n\n### 💡 Ideas de Títulos:\n- ${contentTopic}: El Misterio que ${selectedStyle} Desvela\n- La Verdad ${selectedStyle} sobre ${contentTopic}\n- ¿Es ${contentTopic} el nuevo Fenómeno Viral?\n\n### 📝 Script borrador:\n[HOOK INICIAL] ¿Sabías que ${contentTopic} tiene un lado oscuro?...\n\n[DESARROLLO] Analizamos los 3 puntos clave que nadie te cuenta, con un enfoque ${selectedStyle}.\n\n### #️⃣ Hashtags:\n#${contentTopic.replace(/\s+/g, '')} #${selectedTheme} #${selectedStyle} #Viral`;
    
    setGeneratedContent(mockContent);
    setIsGenerating(false);

    if (user) {
      try {
          const { error } = await supabase
              .from('generated_content')
              .insert({
                  user_id: user.id,
                  theme: selectedTheme,
                  style: selectedStyle,
                  topic: contentTopic,
                  content: mockContent,
              });
          
          if (error) throw error;
          
          toast({
              title: '¡Contenido generado y guardado!',
              description: 'Tu contenido optimizado para viralidad está listo y guardado en tu historial.',
          });

      } catch (error) {
          console.error("Error saving generated content:", error);
          toast({
              title: 'Error al guardar contenido',
              description: 'El contenido fue generado pero no se pudo guardar. Intenta de nuevo.',
              variant: 'destructive',
          });
      }
    } else {
        toast({
            title: '¡Contenido generado!',
            description: 'Inicia sesión para guardar tu historial de contenido.',
        });
    }
  };

  const handleCopy = () => {
    if (!onCopyDownload()) return;
    navigator.clipboard.writeText(generatedContent);
    toast({ title: '¡Copiado!', description: 'Contenido copiado al portapapeles' });
  }

  const tools = [
    { id: 'ai-content', title: 'Generador de Contenido IA', description: 'Crea contenido viral optimizado para cada plataforma', icon: Sparkles, color: 'from-purple-500 to-pink-500', action: () => {} },
    { id: 'thumbnail-editor', title: 'Editor de Miniaturas', description: 'Diseña miniaturas impactantes con herramientas avanzadas', icon: Image, color: 'from-blue-500 to-purple-500', action: () => onSectionChange('thumbnail-editor') },
    { id: 'hashtag-generator', title: 'Generador de Hashtags', description: 'Encuentra hashtags trending para maximizar alcance', icon: Hash, color: 'from-green-500 to-blue-500', action: () => handleNotImplemented() },
    { id: 'trend-analyzer', title: 'Analizador de Tendencias', description: 'Descubre qué contenido está funcionando en tu nicho', icon: TrendingUp, color: 'from-orange-500 to-red-500', action: () => handleNotImplemented() },
  ];
  
  const handleNotImplemented = () => {
    toast({
      title: '🚧 Esta función no está implementada aún',
      description: '¡No te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
    });
  };
  
  const currentStyles = contentOptions.find(option => option.value === selectedTheme)?.styles || [];

  const trendChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      label: 'Popularidad del Tema',
      data: [65, 59, 80, 81, 56, 95],
      backgroundColor: 'rgba(139, 92, 246, 0.5)',
      borderColor: '#8B5CF6',
      borderWidth: 1,
    }],
  };
  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false, }, },
    scales: { x: { ticks: { color: '#ffffff' } }, y: { ticks: { color: '#ffffff' } } },
  };

  const mockTitles = [ "10 Secretos de {tema} que Nadie te Contó", "La Verdad INCÓMODA sobre {tema}", "Así es como {tema} Cambiará tu Vida en 2025", "El ERROR #1 que Cometes con {tema}", "Expertos Analizan: ¿Es {tema} una Estafa?", "{tema}: De Cero a Héroe en 30 Días", "Lo que los Gurús NO te Dicen de {tema}", "Mi Experiencia con {tema}: Lo Bueno, lo Malo y lo FEO", "El Futuro es AHORA: {tema} y la Próxima Revolución", "Hackea {tema} con este Simple Truco" ];
  const mockKeywords = [ {kw: "tendencias {tema}", trend: 88}, {kw: "cómo funciona {tema}", trend: 85}, {kw: "{tema} 2025", trend: 92}, {kw: "mejor {tema} para principiantes", trend: 78}, {kw: "{tema} vs competidor", trend: 75}, ];

 return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gradient">Herramientas Profesionales</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">Suite completa de herramientas impulsadas por IA para crear contenido viral</p>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.div key={tool.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card className="glass-effect border-purple-500/20 hover:shadow-glow transition-all duration-300 cursor-pointer h-full" onClick={tool.action}>
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}><Icon className="w-8 h-8 text-white" /></div>
                  <CardTitle className="text-white text-lg">{tool.title}</CardTitle>
                  <CardDescription className="text-gray-400">{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center"><Sparkles className="w-6 h-6 mr-3 text-purple-400" />Generador de Contenido IA</CardTitle>
            <CardDescription>Define la temática y el estilo para crear contenido optimizado para viralidad.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="space-y-2">
                   <Label htmlFor="theme">1. Elige una temática</Label>
                   <Select value={selectedTheme} onValueChange={handleThemeChange}>
                       <SelectTrigger className="w-full glass-effect border-purple-500/20"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                       <SelectContent>{contentOptions.map((o) => (<SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>))}</SelectContent>
                   </Select>
               </div>
             <div className="space-y-2">
    <Label htmlFor="style">2. Elige un estilo</Label>
    {/* Simplemente renderiza el Select si hay una temática, sin animaciones */}
    {selectedTheme && (
        <Select value={selectedStyle} onValueChange={setSelectedStyle} disabled={!selectedTheme}>
            <SelectTrigger className="w-full glass-effect border-purple-500/20"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
            <SelectContent>{currentStyles.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
        </Select>
    )}
</div>
               <div className="space-y-2">
                   <Label htmlFor="duration">3. Elige una duración</Label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                       <SelectTrigger className="w-full glass-effect border-purple-500/20"><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                       <SelectContent>{contentDurations.map((d) => (<SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>))}</SelectContent>
                   </Select>
               </div>
             </div>
             <div className="space-y-2">
               <Label htmlFor="topic">4. Describe tu idea o tema</Label>
               <Input id="topic" placeholder="Ej: El caso de la mansión embrujada, Los mejores destinos de playa, etc." value={contentTopic} onChange={(e) => setContentTopic(e.target.value)} className="glass-effect border-purple-500/20" />
             </div>

            <Button onClick={handleGenerateContent} disabled={isGenerating || !selectedTheme || !selectedStyle || !contentTopic} className="w-full gradient-primary hover:opacity-90 transition-opacity">
              {isGenerating ? <><Wand2 className="w-4 h-4 mr-2 animate-spin" />Generando...</> : <><Zap className="w-4 h-4 mr-2" />Generar Contenido IA</>}
            </Button>
            
            {/* INICIO DE LA CORRECCIÓN */}
            {generatedContent && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-white">Contenido generado:</Label>
                  <div className="flex gap-2">
                    <Button onClick={cleanScript} variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10"><Trash2 className="w-4 h-4 mr-2" />Limpiar Guión</Button>
                    <Button onClick={handleCopy} variant="outline" size="sm" className="border-purple-500/20 hover:bg-purple-500/10"><Clipboard className="w-4 h-4 mr-2" />Copiar Todo</Button>
                  </div>
                </div>
                <Textarea value={generatedContent} onChange={(e) => setGeneratedContent(e.target.value)} className="glass-effect border-purple-500/20 rounded-lg p-4 h-64 whitespace-pre-wrap font-mono" />
              </motion.div>
            )}
            {/* FIN DE LA CORRECCIÓN */}
          </CardContent>
        </Card>
      </motion.div>

      {/* INICIO DE LA CORRECCIÓN */}
      {generatedContent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <Card className="glass-effect border-purple-500/20">
            <CardHeader><CardTitle className="text-white flex items-center"><BarChart2 className="w-5 h-5 mr-2 text-blue-400"/>📈 Tendencias del Tema</CardTitle></CardHeader>
            <CardContent><div className="h-60"><Bar data={trendChartData} options={trendChartOptions}/></div></CardContent>
          </Card>

          <Card className="glass-effect border-pink-500/20">
            <CardHeader><CardTitle className="text-white flex items-center"><Wand2 className="w-5 h-5 mr-2 text-pink-400"/>💡 Sugerencias Personalizadas</CardTitle></CardHeader>
            <CardContent>
              <Tabs defaultValue="youtube">
                <TabsList className="grid w-full grid-cols-4 glass-effect">
                  <TabsTrigger value="youtube"><Youtube className="w-5 h-5"/></TabsTrigger>
                  <TabsTrigger value="tiktok"><svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 0 .17.02.25.05.33.11.62.28.88.5.33.28.58.62.77 1.02.19.4.3.84.35 1.3.05.46.06.92.06 1.38 0 .11 0 .22-.01.33-.02.43-.07.86-.16 1.28-.18.82-.52 1.58-1.02 2.25-.52.68-1.2 1.25-1.98 1.62-1.57.74-3.37.94-5.1.55-1.1-.25-2.14-.7-3.08-1.35-.47-.32-.9-.7-1.26-1.15-.22-.28-.4-.58-.55-.9-.23-.52-.37-1.1-.43-1.72-.03-.32-.04-.64-.04-.97 0-.05.01-.1.01-.15.02-.2.05-.4.1-.6.18-.8.58-1.5,1.2-2.04.5-.42 1.08-.75 1.72-.98.3-.11.6-.2.92-.26.2-.04.4-.06.6-.08.06-.01.12-.01.18-.01.32 0 .63.01.95.02zM10.9 5.68c-.12.02-.24.04-.35.07-.3.08-.58.2-.82.37-.25.18-.47.4-.63.66-.17.28-.28.6-.32.95-.03.22-.04.45-.04.68 0 .12.01.23.02.35.05.42.17.82.37 1.18.2.36.47.68.8.92.32.25.7.44 1.1.55.33.09.67.14 1.02.15.2.01.4.01.6.01.27 0 .54-.02.8-.05.28-.04.55-.1.82-.2.53-.2.98-.52 1.35-1.02.16-.22.28-.47.36-.72.08-.25.13-.5.15-.77.02-.2.02-.4.02-.6 0-.3-.02-.6-.05-.9-.1-.82-.4-1.55-.9-2.1-.3-.32-.65-.58-.02-.6-.02-.2-.02-.4-.02-.6 0-.3-.02-.6-.05-.9-.1-.82-.4-1.55-.9-2.1-.3-.32-.65-.58-1.05-.75-.3-.12-.6-.2-1-.25-.23-.05-.46-.07-.7-.08-.1 0-.2-.01-.3-.01z"/></svg></TabsTrigger>
                  <TabsTrigger value="instagram"><InstagramIcon className="w-5 h-5"/></TabsTrigger>
                  <TabsTrigger value="facebook"><Facebook className="w-5 h-5"/></TabsTrigger>
                </TabsList>
                <TabsContent value="youtube" className="pt-2 text-sm text-gray-300">Usa un hook fuerte en los primeros 5 segundos. Títulos con números o preguntas funcionan bien. Miniaturas con caras expresivas. Duración ideal: 8-12 minutos.</TabsContent>
                <TabsContent value="tiktok" className="pt-2 text-sm text-gray-300">¡Ve al grano! Los primeros 3 segundos son cruciales. Usa texto en pantalla y sonidos de tendencia. El contenido debe ser corto y con un loop satisfactorio.</TabsContent>
                <TabsContent value="instagram" className="pt-2 text-sm text-gray-300">Reels: sigue tendencias de audio. Stories: usa stickers interactivos. Feed: imágenes de alta calidad con una paleta de colores coherente.</TabsContent>
                <TabsContent value="facebook" className="pt-2 text-sm text-gray-300">Videos más largos (3-5 min) funcionan bien. Comparte en grupos relevantes. Preguntas en la descripción para fomentar comentarios.</TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="glass-effect border-green-500/20">
            <CardHeader><CardTitle className="text-white flex items-center"><Copy className="w-5 h-5 mr-2 text-green-400"/>🎯 Títulos SEO Optimizados</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mockTitles.slice(0,5).map((title, i) => (
                <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-md">
                  <span className="text-sm">{title.replace('{tema}', contentTopic || 'tu tema')}</span>
                  <Button variant="ghost" size="icon" onClick={() => {navigator.clipboard.writeText(title.replace('{tema}', contentTopic || 'tu tema')); toast({title:'Copiado!'})}}><Clipboard className="w-4 h-4"/></Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-effect border-yellow-500/20">
            <CardHeader><CardTitle className="text-white flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-yellow-400"/>🔑 Palabras Clave</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mockKeywords.map((kw, i) => (
                  <div key={i} className="flex items-center justify-between bg-black/20 p-2 rounded-md">
                   <span className="text-sm">{kw.kw.replace('{tema}', contentTopic || 'tema')}</span>
                   <div className="flex items-center gap-2">
                       <span className="text-xs text-green-400">{kw.trend}%</span>
                       <div className="w-16 h-2 bg-gray-700 rounded-full"><div className="h-2 bg-green-500 rounded-full" style={{width: `${kw.trend}%`}}></div></div>
                   </div>
                 </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        )}
    

    </div>
  );
};

export default Tools;
