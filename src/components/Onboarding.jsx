import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Sparkles,
  User,
  Target,
  Users,
  MessageSquare,
  Link as LinkIcon,
  Youtube,
  Instagram,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Rocket,
  TrendingUp,
  Brain,
  Zap,
  Crown
} from 'lucide-react';
import { getChannelInfo } from '@/services/youtubeService';

/**
 * 🚀 ONBOARDING PROFESIONAL - 3 FASES
 *
 * Fase 1: Personalidad del Creador (estilo único, tono, eslogan, estructura)
 * Fase 2: Conexión con Datos Reales (YouTube, TikTok, Instagram APIs)
 * Fase 3: Flujo de Trabajo Automatizado (template único del usuario)
 *
 * Objetivo: Diferenciación total vs ChatGPT mediante datos propietarios + personalización
 */

const Onboarding = ({ onComplete, onSkip }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const modalScrollRef = useRef(null);

  // 📊 FASE 1: PERSONALIDAD DEL CREADOR
  const [creatorProfile, setCreatorProfile] = useState({
    // Identidad básica
    name: '',
    channelName: '',

    // Personalidad narrativa (CRÍTICO - esto es lo que ChatGPT NO puede hacer)
    role: '', // Ej: Educador, Comediante, Analista, Storyteller
    toneStyle: '', // Ej: Casual y cercano, Profesional y serio, Irónico y sarcástico
    uniqueSlogan: '', // Frase característica del creador
    narrativeStructure: '', // Ej: Problema-Solución, Historia personal, Top 10, Análisis profundo

    // Audiencia
    targetAudience: '', // Ej: Jóvenes 18-25, Emprendedores LATAM, Padres primerizos
    audienceInterests: '', // Palabras clave de intereses

    // Objetivos
    primaryGoal: '', // Ej: Monetización, Crecimiento, Educar, Entretenimiento
    contentFrequency: '', // Ej: Diario, 3x semana, Semanal
  });

  // 📡 FASE 2: CONEXIÓN CON DATOS REALES
  const [connections, setConnections] = useState({
    youtubeChannelId: '',
    youtubeConnected: false,
    tiktokUsername: '',
    tiktokConnected: false,
    instagramUsername: '',
    instagramConnected: false,
  });

  // ⚙️ FASE 3: FLUJO AUTOMATIZADO
  const [workflow, setWorkflow] = useState({
    enableAutoResearch: true, // Investigación automática de trending topics
    enableAutoSEO: true, // Optimización automática de títulos y descripciones
    enableAutoHashtags: true, // Generación automática de hashtags
    enableCalendarSync: false, // Sincronización con calendario
    preferredPublishTime: '18:00', // Hora preferida de publicación
  });

  const totalSteps = 3;

  // 🎯 GUARDAR PERSONALIDAD EN LOCALSTORAGE Y BACKEND
  const handleSaveProfile = useCallback(async () => {
    const completeProfile = {
      ...creatorProfile,
      connections,
      workflow,
      createdAt: new Date().toISOString(),
      version: '1.0'
    };

    try {
      // Guardar en localStorage
      localStorage.setItem('creatorProfile', JSON.stringify(completeProfile));

      // TODO: Guardar en Supabase cuando esté disponible
      // await supabase.from('creator_profiles').upsert({
      //   user_id: user.id,
      //   profile_data: completeProfile
      // });

      toast({
        title: '✅ Perfil de Creador Guardado',
        description: 'Tu personalidad única ya está lista para generar contenido increíble.',
      });

      if (onComplete) {
        onComplete(completeProfile);
      }
    } catch (error) {
      console.error('Error guardando perfil:', error);
      toast({
        title: 'Error al guardar',
        description: 'Hubo un problema, pero tus datos están seguros localmente.',
        variant: 'destructive'
      });
    }
  }, [creatorProfile, connections, workflow, toast, onComplete]);

  // 🔄 NAVEGACIÓN ENTRE PASOS
  const handleNext = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSaveProfile();
    }
  }, [currentStep, totalSteps, handleSaveProfile]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // 🎨 RENDERIZAR CADA FASE
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Phase1PersonalityCapture profile={creatorProfile} setProfile={setCreatorProfile} />;
      case 2:
        return <Phase2DataConnections connections={connections} setConnections={setConnections} />;
      case 3:
        return <Phase3AutomatedWorkflow workflow={workflow} setWorkflow={setWorkflow} />;
      default:
        return null;
    }
  };

  // ✅ VALIDACIÓN DEL PASO ACTUAL
  const isStepValid = useCallback(() => {
    switch (currentStep) {
      case 1:
        return creatorProfile.name && creatorProfile.role && creatorProfile.toneStyle && creatorProfile.targetAudience;
      case 2:
        return true; // Fase 2 es opcional (conexiones)
      case 3:
        return true; // Fase 3 usa valores por defecto
      default:
        return false;
    }
  }, [currentStep, creatorProfile]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  useEffect(() => {
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTo({ top: 0 });
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center items-start p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
      style={{ overscrollBehavior: 'contain' }}
    >
      <div
        ref={modalScrollRef}
        className="w-full max-w-4xl my-8 relative z-[101]"
      >
        <Card className="glass-effect border-purple-500/30 shadow-2xl bg-gray-900/95">
          {/* 🎯 HEADER CON PROGRESO */}
          <CardHeader className="border-b border-purple-500/20 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  {currentStep === 1 && <Brain className="w-7 h-7 text-white" />}
                  {currentStep === 2 && <LinkIcon className="w-7 h-7 text-white" />}
                  {currentStep === 3 && <Zap className="w-7 h-7 text-white" />}
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">
                    {currentStep === 1 && 'Define tu Personalidad'}
                    {currentStep === 2 && 'Conecta tus Datos Reales'}
                    {currentStep === 3 && 'Automatiza tu Flujo'}
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Paso {currentStep} de {totalSteps}
                  </CardDescription>
                </div>
              </div>
              {onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="text-gray-400 hover:text-white"
                >
                  Saltar por ahora
                </Button>
              )}
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </CardHeader>

          {/* 📝 CONTENIDO DE LA FASE ACTUAL */}
          <CardContent className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="min-h-[400px]">
              {renderStep()}
            </div>

            {/* 🎮 BOTONES DE NAVEGACIÓN */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-purple-500/20">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-purple-500/30 hover:bg-purple-500/10"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>

              <div className="flex gap-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      step === currentStep
                        ? 'bg-purple-500'
                        : step < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="gradient-primary hover:opacity-90"
              >
                {currentStep === totalSteps ? (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Finalizar Setup
                  </>
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 💡 VENTAJA COMPETITIVA */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white text-sm font-semibold mb-1">
                ⚡ Por qué esto te hace único vs ChatGPT
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                ChatGPT no puede aprender tu estilo narrativo, acceder a tus métricas reales de YouTube/TikTok,
                ni automatizar tu flujo completo. CreoVision sí. Estás creando tu asistente IA personalizado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎭 FASE 1: CAPTURA PROFUNDA DE PERSONALIDAD
const Phase1PersonalityCapture = ({ profile, setProfile }) => {
  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const narrativeStructures = [
    { value: 'problem-solution', label: 'Problema → Solución', description: 'Identificas un problema y lo resuelves' },
    { value: 'personal-story', label: 'Historia Personal', description: 'Compartes experiencias y aprendizajes' },
    { value: 'top-list', label: 'Top 10 / Listas', description: 'Rankings y recopilaciones' },
    { value: 'deep-analysis', label: 'Análisis Profundo', description: 'Investigación y explicación detallada' },
    { value: 'tutorial', label: 'Tutorial Paso a Paso', description: 'Instrucciones prácticas' },
    { value: 'entertainment', label: 'Puro Entretenimiento', description: 'Comedia, sketches, reacciones' },
  ];

  const toneStyles = [
    { value: 'casual', label: '😎 Casual y Cercano', emoji: '👋' },
    { value: 'professional', label: '💼 Profesional y Serio', emoji: '🎓' },
    { value: 'ironic', label: '😏 Irónico y Sarcástico', emoji: '🤨' },
    { value: 'motivational', label: '🔥 Motivacional e Inspirador', emoji: '💪' },
    { value: 'educational', label: '📚 Educativo y Didáctico', emoji: '🧠' },
    { value: 'entertaining', label: '🎉 Divertido y Energético', emoji: '⚡' },
  ];

  return (
    <div className="space-y-6">
      {/* Mensaje motivacional */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold text-sm mb-1">Tu Estilo Único es tu Ventaja</h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              Estas respuestas entrenarán a la IA para que hable, escriba y estructure contenido
              <strong className="text-purple-400"> exactamente como tú lo harías</strong>.
              Algo que ChatGPT genérico nunca podrá replicar.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Tu Nombre *</Label>
          <Input
            id="name"
            placeholder="Ej: Juan Pérez"
            value={profile.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="glass-effect border-purple-500/20"
          />
        </div>

        {/* Canal */}
        <div className="space-y-2">
          <Label htmlFor="channelName" className="text-white">Nombre del Canal</Label>
          <Input
            id="channelName"
            placeholder="Ej: TechReview LATAM"
            value={profile.channelName}
            onChange={(e) => updateField('channelName', e.target.value)}
            className="glass-effect border-purple-500/20"
          />
        </div>
      </div>

      {/* Rol del Creador */}
      <div className="space-y-2">
        <Label htmlFor="role" className="text-white flex items-center gap-2">
          <User className="w-4 h-4" />
          ¿Cuál es tu rol como creador? *
        </Label>
        <Input
          id="role"
          placeholder="Ej: Educador tecnológico, Comediante de internet, Analista financiero..."
          value={profile.role}
          onChange={(e) => updateField('role', e.target.value)}
          className="glass-effect border-purple-500/20"
        />
        <p className="text-gray-400 text-xs">
          Define cómo te presentas ante tu audiencia
        </p>
      </div>

      {/* Tono y Estilo */}
      <div className="space-y-2">
        <Label className="text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Tono y Estilo de Comunicación *
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {toneStyles.map((tone) => (
            <button
              key={tone.value}
              onClick={() => updateField('toneStyle', tone.value)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                profile.toneStyle === tone.value
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
            >
              <div className="text-2xl mb-1">{tone.emoji}</div>
              <div className="text-white text-sm font-medium">{tone.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Frase o Eslogan Característico */}
      <div className="space-y-2">
        <Label htmlFor="uniqueSlogan" className="text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Frase o Eslogan Característico
        </Label>
        <Input
          id="uniqueSlogan"
          placeholder='Ej: "¡Vamos a romperla!", "Como siempre digo...", "Bienvenidos de vuelta familia"'
          value={profile.uniqueSlogan}
          onChange={(e) => updateField('uniqueSlogan', e.target.value)}
          className="glass-effect border-purple-500/20"
        />
        <p className="text-gray-400 text-xs">
          Palabras o frases que repites en tus videos (opcional pero poderoso)
        </p>
      </div>

      {/* Estructura Narrativa */}
      <div className="space-y-2">
        <Label className="text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Estructura Narrativa Preferida
        </Label>
        <select
          value={profile.narrativeStructure}
          onChange={(e) => updateField('narrativeStructure', e.target.value)}
          className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Selecciona tu estructura típica...</option>
          {narrativeStructures.map((structure) => (
            <option key={structure.value} value={structure.value}>
              {structure.label} - {structure.description}
            </option>
          ))}
        </select>
      </div>

      {/* Audiencia Objetivo */}
      <div className="space-y-2">
        <Label htmlFor="targetAudience" className="text-white flex items-center gap-2">
          <Users className="w-4 h-4" />
          ¿Quién es tu audiencia? *
        </Label>
        <Input
          id="targetAudience"
          placeholder="Ej: Jóvenes 18-25, Emprendedores LATAM, Padres primerizos, Gamers casuales..."
          value={profile.targetAudience}
          onChange={(e) => updateField('targetAudience', e.target.value)}
          className="glass-effect border-purple-500/20"
        />
      </div>

      {/* Intereses de la Audiencia */}
      <div className="space-y-2">
        <Label htmlFor="audienceInterests" className="text-white">
          Intereses de tu Audiencia
        </Label>
        <Textarea
          id="audienceInterests"
          placeholder="Ej: tecnología, emprendimiento, productividad, finanzas personales, gaming, fitness..."
          value={profile.audienceInterests}
          onChange={(e) => updateField('audienceInterests', e.target.value)}
          className="glass-effect border-purple-500/20 min-h-[80px]"
        />
      </div>

      {/* Objetivo Principal */}
      <div className="space-y-2">
        <Label htmlFor="primaryGoal" className="text-white flex items-center gap-2">
          <Target className="w-4 h-4" />
          Objetivo Principal con este Contenido
        </Label>
        <select
          value={profile.primaryGoal}
          onChange={(e) => updateField('primaryGoal', e.target.value)}
          className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Selecciona tu objetivo...</option>
          <option value="monetization">💰 Monetización (AdSense, sponsors, membresías)</option>
          <option value="growth">📈 Crecimiento de Audiencia</option>
          <option value="education">🎓 Educar y Aportar Valor</option>
          <option value="entertainment">🎭 Entretener</option>
          <option value="personal-brand">🌟 Construir Marca Personal</option>
          <option value="sales">💼 Vender Productos/Servicios</option>
        </select>
      </div>

      {/* Frecuencia de Contenido */}
      <div className="space-y-2">
        <Label htmlFor="contentFrequency" className="text-white">
          Frecuencia de Publicación
        </Label>
        <select
          value={profile.contentFrequency}
          onChange={(e) => updateField('contentFrequency', e.target.value)}
          className="w-full p-3 bg-gray-800 border border-purple-500/20 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
        >
          <option value="">¿Con qué frecuencia publicas?</option>
          <option value="daily">📅 Diario</option>
          <option value="3x-week">📆 3 veces por semana</option>
          <option value="2x-week">📆 2 veces por semana</option>
          <option value="weekly">📅 Semanal</option>
          <option value="biweekly">📅 Quincenal</option>
        </select>
      </div>
    </div>
  );
};

// 📡 FASE 2: CONEXIÓN CON DATOS REALES (APIs)
const Phase2DataConnections = ({ connections, setConnections }) => {
  const { toast } = useToast();

  const handleConnect = useCallback(async (platform) => {
    if (platform === 'youtube') {
      // ✅ YOUTUBE API REAL INTEGRADA
      const channelIdentifier = connections.youtubeChannelId;

      if (!channelIdentifier) {
        toast({
          title: 'Campo vacío',
          description: 'Por favor ingresa tu ID de canal o @username',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: `🔗 Conectando con YouTube...`,
        description: 'Verificando tu canal...',
      });

      try {
        // Llamar a la API real de YouTube
        const channelData = await getChannelInfo(channelIdentifier);

        // Guardar información del canal
        setConnections(prev => ({
          ...prev,
          youtubeConnected: true,
          youtubeChannelData: channelData
        }));

        toast({
          title: `✅ Canal Conectado: ${channelData.title}`,
          description: `${channelData.subscriberCount.toLocaleString()} suscriptores • ${channelData.videoCount} videos`,
        });

      } catch (error) {
        console.error('Error conectando YouTube:', error);
        toast({
          title: '❌ Error al conectar',
          description: error.message || 'Verifica que el canal exista y sea público',
          variant: 'destructive'
        });
      }

    } else if (platform === 'tiktok' || platform === 'instagram') {
      // TikTok e Instagram: Simulados por ahora (requieren OAuth)
      toast({
        title: `🔗 Conectando con ${platform}...`,
        description: 'Redirigiendo a la autenticación...',
      });

      // TODO: Implementar OAuth flows
      // TikTok Business API: https://developers.tiktok.com/
      // Instagram Basic Display API: https://developers.facebook.com/docs/instagram-basic-display-api

      setTimeout(() => {
        setConnections(prev => ({
          ...prev,
          [`${platform}Connected`]: true
        }));
        toast({
          title: `✅ ${platform} Conectado`,
          description: 'Ya podemos acceder a tus métricas reales',
        });
      }, 2000);
    }
  }, [connections, toast, setConnections]);

  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'from-red-500 to-red-600',
      description: 'Accede a Analytics, trending topics y métricas de engagement',
      benefits: ['Datos de visualizaciones reales', 'Palabras clave que funcionan en TU nicho', 'Duración óptima de videos'],
      fieldKey: 'youtubeChannelId',
      placeholder: 'ID del Canal o @username',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: TrendingUp,
      color: 'from-pink-500 to-purple-600',
      description: 'Analiza qué contenido está viralizando en tu nicho',
      benefits: ['Tendencias en tiempo real', 'Hashtags con mejor rendimiento', 'Horarios óptimos de publicación'],
      fieldKey: 'tiktokUsername',
      placeholder: '@username',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'from-purple-500 to-pink-500',
      description: 'Insights de Reels y engagement de tu audiencia',
      benefits: ['Métricas de Reels', 'Mejor formato de contenido', 'Datos demográficos de audiencia'],
      fieldKey: 'instagramUsername',
      placeholder: '@username',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Mensaje explicativo */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <LinkIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold text-sm mb-1">
              🎯 Datos Reales = Ventaja Competitiva
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              Conecta tus cuentas para que la IA acceda a <strong>métricas reales</strong> de tus videos.
              Esto nos permite generar contenido basado en <strong>qué funciona específicamente en TU audiencia</strong>,
              no en suposiciones genéricas como ChatGPT.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de plataformas */}
      <div className="space-y-4">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const isConnected = connections[`${platform.id}Connected`];

          return (
            <Card key={platform.id} className="glass-effect border-purple-500/20">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${platform.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold text-lg">{platform.name}</h4>
                      {isConnected && (
                        <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-xs font-medium">Conectado</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{platform.description}</p>

                    {/* Beneficios */}
                    <div className="space-y-1.5 mb-4">
                      {platform.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300 text-xs">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* Input o botón de conexión */}
                    {!isConnected ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder={platform.placeholder}
                          value={connections[platform.fieldKey]}
                          onChange={(e) => setConnections(prev => ({
                            ...prev,
                            [platform.fieldKey]: e.target.value
                          }))}
                          className="glass-effect border-purple-500/20 flex-1"
                        />
                        <Button
                          onClick={() => handleConnect(platform.id)}
                          disabled={!connections[platform.fieldKey]}
                          className="gradient-primary hover:opacity-90"
                        >
                          Conectar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setConnections(prev => ({
                          ...prev,
                          [`${platform.id}Connected`]: false
                        }))}
                        className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                      >
                        Desconectar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Nota sobre conexiones opcionales */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <p className="text-gray-400 text-sm">
          <strong className="text-white">Nota:</strong> Las conexiones son opcionales pero muy recomendadas.
          Sin ellas, la IA usará datos públicos generales. Con ellas, obtienes insights personalizados
          basados en tu audiencia real.
        </p>
      </div>
    </div>
  );
};

// ⚙️ FASE 3: FLUJO DE TRABAJO AUTOMATIZADO
const Phase3AutomatedWorkflow = ({ workflow, setWorkflow }) => {
  const toggleFeature = (feature) => {
    setWorkflow(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const automationFeatures = [
    {
      id: 'enableAutoResearch',
      title: 'Investigación Automática',
      description: 'Analiza trending topics diariamente y sugiere ideas de contenido',
      icon: TrendingUp,
      color: 'text-blue-400',
      recommended: true,
    },
    {
      id: 'enableAutoSEO',
      title: 'Optimización SEO Automática',
      description: 'Genera títulos, descripciones y tags optimizados para cada plataforma',
      icon: Sparkles,
      color: 'text-purple-400',
      recommended: true,
    },
    {
      id: 'enableAutoHashtags',
      title: 'Hashtags Inteligentes',
      description: 'Selecciona hashtags trending basados en tus métricas reales',
      icon: CheckCircle2,
      color: 'text-green-400',
      recommended: true,
    },
    {
      id: 'enableCalendarSync',
      title: 'Sincronización de Calendario',
      description: 'Programa publicaciones y recibe recordatorios',
      icon: Target,
      color: 'text-orange-400',
      recommended: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Mensaje explicativo */}
      <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold text-sm mb-1">
              ⚡ Automatización = Más Tiempo para Crear
            </h4>
            <p className="text-gray-300 text-xs leading-relaxed">
              Activa las funciones que quieras automatizar. CreoVision se encargará del trabajo pesado
              (investigación, SEO, hashtags) mientras tú te enfocas en grabar contenido de calidad.
            </p>
          </div>
        </div>
      </div>

      {/* Features de automatización */}
      <div className="space-y-3">
        {automationFeatures.map((feature) => {
          const Icon = feature.icon;
          const isEnabled = workflow[feature.id];

          return (
            <Card key={feature.id} className="glass-effect border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                        {feature.recommended && (
                          <span className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            RECOMENDADO
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs">{feature.description}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleFeature(feature.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-3 ${
                      isEnabled ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hora preferida de publicación */}
      <Card className="glass-effect border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Hora Preferida de Publicación</h4>
              <p className="text-gray-400 text-xs">
                ¿A qué hora sueles publicar tus videos?
              </p>
            </div>
          </div>
          <Input
            type="time"
            value={workflow.preferredPublishTime}
            onChange={(e) => setWorkflow(prev => ({ ...prev, preferredPublishTime: e.target.value }))}
            className="glass-effect border-purple-500/20"
          />
        </CardContent>
      </Card>

      {/* Resumen del flujo */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-lg p-4">
        <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Rocket className="w-4 h-4 text-purple-400" />
          Tu Flujo Automatizado
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-300 text-xs">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>CreoVision analiza trending topics {workflow.enableAutoResearch && '✓'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-xs">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>Generas tu script personalizado con IA</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-xs">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>SEO y hashtags se optimizan automáticamente {workflow.enableAutoSEO && '✓'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300 text-xs">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            <span>Calendario te recuerda cuándo publicar {workflow.enableCalendarSync && '✓'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
