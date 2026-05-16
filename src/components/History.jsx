import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  History as HistoryIcon,
  Image,
  Lightbulb,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import {
  deleteGeneratedContentHistoryItem,
  getGeneratedContentHistory,
  saveGeneratedContentHistory
} from '@/services/generatedContentHistoryService';
import { generateViralScript } from '@/services/geminiService';

const STORY_FEEDBACK_KEY_PREFIX = 'creovision_story_feedback_learning_v1';

const feedbackReasonsByGenre = {
  terror: [
    { id: 'not_scary', label: 'No es tan terrorifica', instruction: 'Aumenta el miedo con situaciones mas concretas, riesgo inmediato y sensacion de amenaza real.' },
    { id: 'more_suspense', label: 'Mas suspenso', instruction: 'Reduce explicaciones y aumenta anticipacion, esperas incomodas y revelaciones parciales.' },
    { id: 'weak_hook', label: 'Nuevo gancho inicial', instruction: 'Reescribe el primer enunciado para detener el scroll en 2 a 5 segundos.' },
    { id: 'no_microtension', label: 'Falta microtension', instruction: 'Agrega pequenas tensiones cada 60 a 90 segundos sin hacerlo mecanico.' },
    { id: 'soft_terror', label: 'Terror muy suave', instruction: 'Sube el peligro percibido, la cercania de la amenaza y la perdida de control sin usar gore.' },
    { id: 'weak_final_loop', label: 'Final sin loop mental', instruction: 'Cierra con una frase, numero, objeto, sonido o imagen concreta que quede en la mente del espectador.' },
    { id: 'bad_cta', label: 'CTA rompe inmersion', instruction: 'Reescribe el cierre con CTA atmosferico de narrador, no con orden directa de suscripcion.' },
    { id: 'too_predictable', label: 'Muy predecible', instruction: 'Rompe patrones esperados y evita un final demasiado limpio.' },
    { id: 'too_artificial', label: 'Suena artificial', instruction: 'Humaniza dialogos, agrega memoria imperfecta y detalles cotidianos irrelevantes.' }
  ],
  true_crime: [
    { id: 'weak_hook', label: 'Hook debil', instruction: 'Abre con una contradiccion, pregunta o dato concreto sin sensacionalismo.' },
    { id: 'needs_context', label: 'Falta contexto', instruction: 'Agrega contexto humano, lugar, fecha y consecuencias sin morbo.' },
    { id: 'too_cold', label: 'Muy frio', instruction: 'Hazlo mas empatico y respetuoso con las personas involucradas.' },
    { id: 'low_retention', label: 'Baja retencion', instruction: 'Introduce preguntas abiertas y pistas dosificadas cada 60 a 90 segundos.' }
  ],
  default: [
    { id: 'weak_hook', label: 'Hook debil', instruction: 'Mejora el primer enunciado para captar atencion inmediata.' },
    { id: 'low_retention', label: 'Poca retencion', instruction: 'Agrega progresion, preguntas abiertas y mini giros.' },
    { id: 'too_generic', label: 'Muy generico', instruction: 'Hazlo mas especifico, humano y concreto.' }
  ]
};

const stopwords = new Set([
  'para', 'pero', 'como', 'cuando', 'donde', 'desde', 'esta', 'este', 'esto', 'todo', 'toda', 'todos', 'todas',
  'porque', 'aunque', 'sobre', 'entre', 'habia', 'habian', 'tenia', 'tenian', 'dijo', 'solo', 'luego', 'noche',
  'casa', 'puerta', 'algo', 'cada', 'esas', 'esos', 'ella', 'ellos', 'nosotros', 'ustedes', 'quien', 'mismo'
]);

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const getTypeLabel = (type) => {
  const labels = {
    prompt: 'Prompt',
    'prompt-yaml': 'Prompt',
    script: 'Guion',
    'viral-script': 'Guion',
    viral_script: 'Guion',
    shorts_script: 'Short',
    youtube_creative_research: 'Investigacion YouTube',
    hashtags: 'Hashtags',
    keywords: 'Keywords',
    analysis: 'Analisis',
    'trending-analysis': 'Tendencias',
    other: 'Contenido'
  };
  return labels[type] || type || 'Contenido';
};

const isPromptLikeText = (value) => {
  const text = String(value || '').trim().toLowerCase();
  return text.startsWith('prompt_creovision:') ||
    text.startsWith('quiero un relato') ||
    (text.includes('prompt_creovision:') && text.includes('prompt_final:')) ||
    (text.includes('objetivo:') && text.includes('parametros:') && text.includes('instrucciones:')) ||
    (text.includes('reglas narrativas:') && text.includes('objetivo:'));
};

const isPromptItem = (item) => {
  const type = String(item?.content_type || '').toLowerCase();
  return ['prompt', 'prompt-yaml', 'advanced-prompt'].includes(type) ||
    (isPromptLikeText(item?.content) && !String(item?.content || '').includes('Bienvenidos'));
};

const isGeneratedStoryItem = (item) => !isPromptItem(item);

const getHistoryType = (item) => String(item?.content_type || '').toLowerCase();

const isShortsItem = (item) => ['shorts_script', 'shorts-script', 'shorts_package', 'shorts-package'].includes(getHistoryType(item));

const isYouTubeResearchItem = (item) => {
  const type = getHistoryType(item);
  return ['youtube_creative_research', 'youtube-creative-research', 'youtube_research', 'creative_research'].includes(type) ||
    (item?.theme === 'research' && item?.style === 'youtube_strategy');
};

const isLongScriptItem = (item) => isGeneratedStoryItem(item) && !isShortsItem(item) && !isYouTubeResearchItem(item);

const historySectionConfig = {
  long_scripts: {
    label: 'Guiones largos',
    emptyTitle: 'Aun no hay guiones largos',
    emptyDescription: 'Los guiones virales largos que generes apareceran en esta area.'
  },
  shorts: {
    label: 'Shorts',
    emptyTitle: 'Aun no hay shorts',
    emptyDescription: 'Los guiones cortos para Shorts, TikTok o Reels apareceran separados aqui.'
  },
  youtube_research: {
    label: 'Investigaciones YouTube',
    emptyTitle: 'Aun no hay investigaciones de YouTube',
    emptyDescription: 'Cuando uses el investigador creativo de YouTube, sus resultados quedaran en esta area.'
  },
  prompts: {
    label: 'Prompts / guiones base',
    emptyTitle: 'Aun no hay prompts guardados',
    emptyDescription: 'Los prompts y bases de guion apareceran aqui automaticamente.'
  }
};

const getItemsByHistorySection = (items, section) => {
  if (section === 'prompts') return items.filter(isPromptItem);
  if (section === 'shorts') return items.filter(isShortsItem);
  if (section === 'youtube_research') return items.filter(isYouTubeResearchItem);
  return items.filter(isLongScriptItem);
};

const extractStoryStartFromMixedText = (text) => {
  const value = String(text || '').trim();
  if (!value || value.length < 700) return value;

  const lower = value.toLowerCase();
  const looksMixedPrompt = lower.startsWith('quiero un relato') ||
    lower.startsWith('prompt_creovision:') ||
    lower.includes('reglas narrativas:') ||
    lower.includes('prompt_final:');

  if (!looksMixedPrompt) return value;

  const welcomeIndex = lower.indexOf('bienvenidos a');
  if (welcomeIndex > 250) {
    const beforeWelcome = value.slice(Math.max(0, welcomeIndex - 340), welcomeIndex).trim();
    const sentenceMatches = beforeWelcome.match(/(?:^|[\n.!?]\s+)([^.!?\n]{25,220}[.!?])/g);
    const hook = sentenceMatches?.[sentenceMatches.length - 1]?.replace(/^[\n.!?\s]+/, '').trim();
    return `${hook ? `${hook}\n\n` : ''}${value.slice(welcomeIndex).trim()}`;
  }

  const marker = value.slice(500).search(/\b(Nunca|Jamas|Jamás|No debi|No debí|Me llamo|Fue en|Eran las|La primera noche)\b/);
  if (marker >= 0) {
    return value.slice(500 + marker).trim();
  }

  return value;
};

const getContentTitleCandidate = (item) => {
  const clean = cleanScriptForVoice(item?.content || '');
  return clean
    .split(/\n+/)
    .map((line) => line.trim())
    .find((line) => line && !isPromptLikeText(line) && line.length > 18);
};

const getDisplayTitle = (item) => {
  const topic = String(item?.topic || '').trim();
  const topicLooksInternal = isPromptLikeText(topic) || topic.length > 140;

  if (isGeneratedStoryItem(item)) {
    const contentTitle = getContentTitleCandidate(item);
    if (contentTitle) return contentTitle.replace(/\s+/g, ' ').slice(0, 110);
    if (topic && !topicLooksInternal) return topic;
    return 'Historia generada';
  }

  if (topic && !topicLooksInternal) return topic;

  const firstLine = getContentTitleCandidate(item);
  if (firstLine) {
    return firstLine.replace(/\s+/g, ' ').slice(0, 92);
  }

  return isPromptItem(item) ? 'Prompt avanzado CreoVision' : 'Historia generada';
};

const getItemPreview = (item) => {
  if (!item?.content) return 'Sin contenido disponible';
  return getReadableContent(item).replace(/\s+/g, ' ').trim().slice(0, 220);
};

const cleanScriptForVoice = (content) => {
  const text = String(content || '').trim();
  const yamlMatch = text.match(/^voice_script:\s*\|\s*\n([\s\S]*)$/i);
  return extractStoryStartFromMixedText(yamlMatch ? yamlMatch[1] : text)
    .replace(/^\s{2}/gm, '')
    .replace(/\[(?:pausa breve|pausa|pausa larga)\]/gi, '...')
    .replace(/\.{4,}/g, '...')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
};

const tryParseHistoryJson = (content) => {
  if (!content || typeof content !== 'string') return null;
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (error) {
    return null;
  }
};

const formatBullets = (items) => (Array.isArray(items) && items.length
  ? items.map((item) => `- ${typeof item === 'string' ? item : JSON.stringify(item)}`).join('\n')
  : '');

const formatYouTubeResearchForDisplay = (item) => {
  const parsed = tryParseHistoryJson(item?.content);
  if (!parsed) return cleanScriptForVoice(item?.content);

  const analysis = parsed.analysis || parsed;
  const newIdeas = Array.isArray(analysis.newIdeas) ? analysis.newIdeas : [];
  const breakdowns = Array.isArray(analysis.videoBreakdowns) ? analysis.videoBreakdowns : [];
  const videos = Array.isArray(parsed.videos) ? parsed.videos : [];
  const recommended = analysis.recommendedNextVideo || {};

  return [
    `Tematica: ${parsed.topic || item?.topic || 'Sin titulo'}`,
    analysis.executiveSummary ? `Resumen ejecutivo:\n${analysis.executiveSummary}` : '',
    formatBullets(analysis.viralPatterns) ? `Patrones virales:\n${formatBullets(analysis.viralPatterns)}` : '',
    formatBullets(analysis.nonViralPatterns) ? `Patrones buenos no virales:\n${formatBullets(analysis.nonViralPatterns)}` : '',
    formatBullets(analysis.avoidMistakes) ? `Errores a evitar:\n${formatBullets(analysis.avoidMistakes)}` : '',
    formatBullets(analysis.copyStrategically) ? `Copiar estrategicamente sin clonar:\n${formatBullets(analysis.copyStrategically)}` : '',
    newIdeas.length ? `Ideas nuevas:\n${newIdeas.map((idea) => `- ${idea.title || 'Idea'}: ${idea.hook || idea.angle || idea.whyItCanWork || ''}`).join('\n')}` : '',
    recommended.title ? `Proximo video recomendado:\n${recommended.title}\n${recommended.openingHook || ''}` : '',
    formatBullets(recommended.retentionRules) ? `Reglas de retencion:\n${formatBullets(recommended.retentionRules)}` : '',
    breakdowns.length ? `Lectura por video:\n${breakdowns.slice(0, 10).map((video) => `- ${video.bestHook || video.promise || video.videoId}: ${video.whyItPerformed || video.audienceReaction || ''}`).join('\n')}` : '',
    videos.length ? `Videos analizados:\n${videos.slice(0, 10).map((video) => `- ${video.title} (${video.group || 'sin grupo'})`).join('\n')}` : ''
  ].filter(Boolean).join('\n\n');
};

const getReadableContent = (item) => isYouTubeResearchItem(item)
  ? formatYouTubeResearchForDisplay(item)
  : cleanScriptForVoice(item?.content);

const getFeedbackKey = (userId) => `${STORY_FEEDBACK_KEY_PREFIX}:${userId || 'anon'}`;

const getStoredStoryFeedback = (userId) => {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(getFeedbackKey(userId)) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const saveStoryFeedback = (userId, feedback) => {
  if (typeof window === 'undefined') return;
  const current = getStoredStoryFeedback(userId);
  localStorage.setItem(getFeedbackKey(userId), JSON.stringify([feedback, ...current].slice(0, 40)));
};

const getFeedbackOptions = (item) => {
  const genre = String(item?.theme || item?.metadata?.theme || '').toLowerCase();
  if (genre.includes('terror')) return feedbackReasonsByGenre.terror;
  if (genre.includes('true')) return feedbackReasonsByGenre.true_crime;
  return feedbackReasonsByGenre.default;
};

const extractKeywords = (content, limit = 10) => {
  const counts = new Map();
  String(content || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/[a-z0-9ñ]{4,}/g)
    ?.forEach((word) => {
      if (!stopwords.has(word)) {
        counts.set(word, (counts.get(word) || 0) + 1);
      }
    });
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
};

const buildSeoSuggestions = (item) => {
  const content = cleanScriptForVoice(item?.content);
  const topic = getDisplayTitle(item);
  const year = item?.narrative_year || item?.metadata?.narrativeYear || '';
  const keywords = extractKeywords(content, 10);
  const hasHouse = /casa|habitacion|puerta|pasillo|espejo/i.test(content);
  const hasForest = /bosque|arbol|sendero|camino/i.test(content);
  const anchor = hasHouse ? 'la casa' : hasForest ? 'el bosque' : topic;
  const yearSuffix = year ? ` (${year})` : '';
  const descriptionOpening = year
    ? `En ${year}, una decision familiar termino abriendo una historia que nadie quiso contar completa.`
    : 'Una decision aparentemente normal termino abriendo una historia que nadie quiso contar completa.';
  const descriptionKeywords = keywords.slice(0, 6).join(', ');

  return {
    titles: [
      `Nunca debi entrar a ${anchor}${yearSuffix}`,
      `La llamada que cambio todo en ${anchor}${yearSuffix}`,
      `Nos mudamos sin saber lo que habia dentro${yearSuffix}`,
      `El relato que un oyente nos pidio no contar de noche`,
      `La ultima noche en ${anchor}: una historia que no cierra`,
      `Algo quedo esperando en ${anchor}${yearSuffix}`
    ],
    description: `${descriptionOpening} Este relato llega como testimonio de una mudanza, un pueblo pequeno y una presencia que parecia conocer a la familia antes de que cruzaran la puerta. Escuchalo hasta el final y deja tu teoria: ¿fue una advertencia, una trampa o algo que ya estaba esperando?${descriptionKeywords ? `\n\nTemas: ${descriptionKeywords}.` : ''}`,
    keywords
  };
};

const buildThumbnailSuggestions = (item) => {
  const content = cleanScriptForVoice(item?.content);
  const hasPhone = /telefono|llamada|auricular/i.test(content);
  const hasMirror = /espejo/i.test(content);
  const hasHouse = /casa|puerta|pasillo/i.test(content);
  const focus = hasMirror ? 'un espejo empañado con una figura apenas visible' : hasPhone ? 'un telefono antiguo descolgado' : hasHouse ? 'una puerta entreabierta en una casa oscura' : 'un objeto inquietante del relato';

  return [
    {
      title: 'Anomalia central',
      prompt: `Miniatura 16:9 realista. Enfoque principal: ${focus}. Fondo oscuro con un solo punto de luz fria. Contraste alto, rostro o mano parcialmente visible, sin gore. Texto maximo 3 palabras: "NO ENTRES".`
    },
    {
      title: 'Detalle imposible',
      prompt: `Miniatura para terror de YouTube. Mostrar un detalle pequeno marcado por luz: ${focus}. Colores negro, azul frio y un acento rojo muy sutil. Composicion limpia, mucha oscuridad alrededor, flecha o circulo discreto hacia la anomalia.`
    },
    {
      title: 'Misterio humano',
      prompt: `Miniatura emocional. Persona de espaldas mirando ${focus}. Sensacion de testimonio real, baja saturacion, textura de camara antigua, texto corto: "VOLVIO". Evitar sangre y elementos morbosos.`
    }
  ];
};

const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [historySection, setHistorySection] = useState('long_scripts');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState([]);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [thumbnailSuggestions, setThumbnailSuggestions] = useState(null);

  const loadHistory = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const history = await getGeneratedContentHistory(user.id);
      setItems(history);
    } catch (error) {
      console.error('Error cargando historial:', error);
      toast({
        title: 'No se pudo cargar el historial',
        description: 'Intenta nuevamente en unos segundos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  const availableTypes = useMemo(() => {
    const sourceItems = getItemsByHistorySection(items, historySection);
    const types = Array.from(new Set(sourceItems.map((item) => item.content_type).filter(Boolean)));
    return ['all', ...types];
  }, [items, historySection]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const sourceItems = getItemsByHistorySection(items, historySection);

    return sourceItems.filter((item) => {
      const matchesType = filterType === 'all' || item.content_type === filterType;
      const haystack = [
        getDisplayTitle(item),
        item.topic,
        item.theme,
        item.style,
        item.narrative_year,
        item.content
      ].join(' ').toLowerCase();
      return matchesType && (!query || haystack.includes(query));
    });
  }, [items, filterType, searchTerm, historySection]);

  const selectedSeo = useMemo(() => (
    selectedItem ? buildSeoSuggestions(selectedItem) : null
  ), [selectedItem]);

  const selectedCleanContent = useMemo(() => (
    selectedItem ? getReadableContent(selectedItem) : ''
  ), [selectedItem]);

  const selectedFeedbackOptions = useMemo(() => (
    selectedItem ? getFeedbackOptions(selectedItem) : []
  ), [selectedItem]);

  const longScriptItemsCount = useMemo(() => items.filter(isLongScriptItem).length, [items]);
  const shortsItemsCount = useMemo(() => items.filter(isShortsItem).length, [items]);
  const youtubeResearchItemsCount = useMemo(() => items.filter(isYouTubeResearchItem).length, [items]);
  const promptItemsCount = useMemo(() => items.filter(isPromptItem).length, [items]);
  const activeSectionConfig = historySectionConfig[historySection] || historySectionConfig.long_scripts;
  const selectedIsLongScript = selectedItem ? isLongScriptItem(selectedItem) : false;

  useEffect(() => {
    if (!selectedItem || typeof document === 'undefined') return undefined;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousHtmlOverscroll = documentElement.style.overscrollBehavior;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : previousBodyPaddingRight;
    documentElement.style.overscrollBehavior = 'contain';

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
      documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, [selectedItem]);

  const openItem = (item) => {
    setSelectedItem(item);
    setShowRegeneratePanel(false);
    setSelectedFeedback([]);
    setFeedbackNote('');
    setThumbnailSuggestions(null);
  };

  const copyContent = async (item) => {
    await navigator.clipboard.writeText(getReadableContent(item));
    toast({ title: 'Copiado', description: 'Contenido copiado al portapapeles.' });
  };

  const downloadContent = (item) => {
    const extension = 'txt';
    const blob = new Blob([getReadableContent(item)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `creovision-${item.topic || 'historial'}-${Date.now()}.${extension}`.replace(/[\\/:*?"<>|]/g, '-');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Descargado', description: 'Archivo generado correctamente.' });
  };

  const toggleFeedbackReason = (reasonId) => {
    setSelectedFeedback((current) => (
      current.includes(reasonId)
        ? current.filter((id) => id !== reasonId)
        : [...current, reasonId]
    ));
  };

  const regenerateFromFeedback = async () => {
    if (!selectedItem || !user?.id || selectedFeedback.length === 0) {
      toast({
        title: 'Selecciona una razon',
        description: 'Marca al menos un motivo para que Creo aprenda que mejorar.',
        variant: 'destructive'
      });
      return;
    }

    const options = getFeedbackOptions(selectedItem);
    const selectedReasons = options.filter((option) => selectedFeedback.includes(option.id));
    const storedFeedback = getStoredStoryFeedback(user.id).slice(0, 6);
    const learningBlock = storedFeedback
      .map((entry) => `- Evitar patron anterior: ${entry.reasons?.join(', ')}. Nota: ${entry.note || 'sin nota'}`)
      .join('\n');

    const feedbackRecord = {
      itemId: selectedItem.id || selectedItem.local_id,
      topic: selectedItem.topic,
      theme: selectedItem.theme,
      reasons: selectedReasons.map((reason) => reason.label),
      instructions: selectedReasons.map((reason) => reason.instruction),
      note: feedbackNote.trim(),
      createdAt: new Date().toISOString()
    };

    setRegenerating(true);
    try {
      saveStoryFeedback(user.id, feedbackRecord);

      const enhancedTopic = `${selectedItem.topic}

VERSION NUEVA BASADA EN FEEDBACK DEL USUARIO:
${selectedReasons.map((reason) => `- ${reason.instruction}`).join('\n')}
${feedbackNote.trim() ? `- Nota directa del usuario: ${feedbackNote.trim()}` : ''}

APRENDIZAJE DE INTENTOS ANTERIORES:
${learningBlock || '- No repetir estructura demasiado perfecta ni pausas entre corchetes.'}

GUION ANTERIOR COMO REFERENCIA A MEJORAR, NO COPIAR:
${cleanScriptForVoice(selectedItem.content).slice(0, 3500)}`;

      const newContent = await generateViralScript(
        selectedItem.theme || 'terror',
        selectedItem.style || 'testimonio realista',
        selectedItem.duration || selectedItem.metadata?.duration || 'ten_min',
        enhancedTopic,
        null,
        {
          narrativeYear: selectedItem.narrative_year || selectedItem.metadata?.narrativeYear || '',
          channelName: selectedItem.metadata?.channelName || ''
        }
      );

      const saved = await saveGeneratedContentHistory({
        userId: user.id,
        contentType: 'script',
        topic: `${selectedItem.topic} - version mejorada`,
        theme: selectedItem.theme || 'terror',
        style: selectedItem.style || 'feedback_mejorado',
        duration: selectedItem.duration || selectedItem.metadata?.duration || 'ten_min',
        narrativeYear: selectedItem.narrative_year || selectedItem.metadata?.narrativeYear || '',
        platform: selectedItem.platform || 'youtube',
        content: newContent,
        metadata: {
          ...(selectedItem.metadata || {}),
          regeneratedFrom: selectedItem.id || selectedItem.local_id,
          feedback: feedbackRecord
        }
      });

      const newItem = saved.item || saved.localItem || {
        ...selectedItem,
        id: `regen_${Date.now()}`,
        local_id: `regen_${Date.now()}`,
        topic: `${selectedItem.topic} - version mejorada`,
        content: newContent,
        created_at: new Date().toISOString(),
        metadata: {
          ...(selectedItem.metadata || {}),
          feedback: feedbackRecord
        }
      };

      setItems((current) => [newItem, ...current]);
      setSelectedItem(newItem);
      setShowRegeneratePanel(false);
      setSelectedFeedback([]);
      setFeedbackNote('');
      setThumbnailSuggestions(null);
      toast({ title: 'Nueva historia generada', description: 'Creo uso tu feedback para mejorar el guion.' });
    } catch (error) {
      console.error('Error regenerando historia:', error);
      toast({
        title: 'No se pudo regenerar',
        description: error.message || 'Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setRegenerating(false);
    }
  };

  const deleteItem = async (item) => {
    try {
      await deleteGeneratedContentHistoryItem(user.id, item);
      setItems((current) => current.filter((entry) => entry.id !== item.id && entry.local_id !== item.local_id));
      if (selectedItem?.id === item.id) setSelectedItem(null);
      toast({ title: 'Eliminado', description: 'El elemento fue quitado de tu historial.' });
    } catch (error) {
      console.error('Error eliminando historial:', error);
      toast({
        title: 'No se pudo eliminar',
        description: error.message || 'Intenta nuevamente.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <SEOHead page="history" />
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h1 className="text-4xl font-bold text-gradient">Mi Historial</h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Todo lo que generas queda guardado para que puedas volver a copiarlo, leerlo, descargarlo o reutilizarlo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-effect border-purple-500/20">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Elementos guardados</p>
                <p className="text-3xl font-bold text-white">{items.length}</p>
              </div>
              <HistoryIcon className="w-10 h-10 text-purple-400" />
            </CardContent>
          </Card>
          <Card className="glass-effect border-purple-500/20">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Guiones largos</p>
                <p className="text-3xl font-bold text-white">
                  {longScriptItemsCount}
                </p>
              </div>
              <FileText className="w-10 h-10 text-green-400" />
            </CardContent>
          </Card>
          <Card className="glass-effect border-purple-500/20">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Shorts</p>
                <p className="text-3xl font-bold text-white">
                  {shortsItemsCount}
                </p>
              </div>
              <Sparkles className="w-10 h-10 text-fuchsia-400" />
            </CardContent>
          </Card>
          <Card className="glass-effect border-purple-500/20">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Investigaciones YouTube</p>
                <p className="text-3xl font-bold text-white">
                  {youtubeResearchItemsCount}
                </p>
              </div>
              <Search className="w-10 h-10 text-cyan-400" />
            </CardContent>
          </Card>
        </div>

        <Card className="glass-effect border-purple-500/20">
          <CardContent className="p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant={historySection === 'long_scripts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setHistorySection('long_scripts');
                  setFilterType('all');
                }}
                className={historySection === 'long_scripts' ? 'gradient-primary' : 'border-purple-500/20 hover:bg-purple-500/10'}
              >
                Guiones largos ({longScriptItemsCount})
              </Button>
              <Button
                type="button"
                variant={historySection === 'shorts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setHistorySection('shorts');
                  setFilterType('all');
                }}
                className={historySection === 'shorts' ? 'gradient-primary' : 'border-purple-500/20 hover:bg-purple-500/10'}
              >
                Shorts ({shortsItemsCount})
              </Button>
              <Button
                type="button"
                variant={historySection === 'youtube_research' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setHistorySection('youtube_research');
                  setFilterType('all');
                }}
                className={historySection === 'youtube_research' ? 'gradient-primary' : 'border-purple-500/20 hover:bg-purple-500/10'}
              >
                Investigaciones YouTube ({youtubeResearchItemsCount})
              </Button>
              <Button
                type="button"
                variant={historySection === 'prompts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setHistorySection('prompts');
                  setFilterType('all');
                }}
                className={historySection === 'prompts' ? 'gradient-primary' : 'border-purple-500/20 hover:bg-purple-500/10'}
              >
                Prompts / guiones base ({promptItemsCount})
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <div className="flex items-center gap-2 flex-1 bg-black/20 border border-purple-500/20 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar por tema, genero, año o contenido..."
                  className="w-full bg-transparent text-white outline-none placeholder:text-gray-500"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-purple-400" />
                {availableTypes.map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterType(type)}
                    className={filterType === type ? 'gradient-primary' : 'border-purple-500/20 hover:bg-purple-500/10'}
                  >
                    {type === 'all' ? 'Todo' : getTypeLabel(type)}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadHistory}
                  className="border-purple-500/20 hover:bg-purple-500/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="min-h-[260px] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="glass-effect border-purple-500/20">
            <CardContent className="p-10 text-center">
              <HistoryIcon className="w-14 h-14 text-purple-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">{activeSectionConfig.emptyTitle}</h2>
              <p className="text-gray-400">
                {activeSectionConfig.emptyDescription}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={`${item.source}-${item.id}-${item.local_id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <Card className="glass-effect border-purple-500/20 hover:shadow-glow transition-all">
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row gap-4 lg:items-start lg:justify-between">
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300">
                            {isPromptItem(item) ? 'Prompt' : getTypeLabel(item.content_type)}
                          </span>
                          {item.theme && (
                            <span className="px-2.5 py-1 rounded-full text-xs bg-gray-800 text-gray-300">
                              {item.theme}
                            </span>
                          )}
                          {item.narrative_year && (
                            <span className="px-2.5 py-1 rounded-full text-xs bg-gray-800 text-gray-300">
                              Año {item.narrative_year}
                            </span>
                          )}
                          {item.source === 'local' && !item.synced && (
                            <span className="px-2.5 py-1 rounded-full text-xs bg-blue-500/15 text-blue-300">
                              Respaldo local
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-white line-clamp-2 break-words">{getDisplayTitle(item)}</h3>
                          <p className="text-sm text-gray-400">{formatDate(item.created_at)}</p>
                        </div>

                        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3 break-words">
                          {getItemPreview(item)}
                          {item.content?.length > 220 ? '...' : ''}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-wrap lg:justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openItem(item)}
                          className="border-purple-500/20 hover:bg-purple-500/10"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyContent(item)}
                          className="border-purple-500/20 hover:bg-purple-500/10"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copiar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadContent(item)}
                          className="border-purple-500/20 hover:bg-purple-500/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Descargar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteItem(item)}
                          className="border-red-500/20 hover:bg-red-500/10 text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {selectedItem && (
          <div className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4 overscroll-contain">
            <Card className="creo-paint-isolated w-full max-w-5xl h-[88vh] max-h-[88vh] overflow-hidden bg-gray-950 border-purple-500/30 flex flex-col shadow-xl">
              <CardHeader className="max-h-[128px] shrink-0 overflow-hidden border-b border-purple-500/20 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="line-clamp-2 text-lg leading-tight text-white break-words">
                      {getDisplayTitle(selectedItem)}
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {isPromptItem(selectedItem) ? 'Prompt' : getTypeLabel(selectedItem.content_type)} - {formatDate(selectedItem.created_at)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedItem(null);
                      setShowRegeneratePanel(false);
                      setThumbnailSuggestions(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
                <div className="shrink-0 p-3 flex gap-2 flex-wrap border-b border-purple-500/20">
                  <Button size="sm" onClick={() => copyContent(selectedItem)} className="gradient-primary">
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar completo
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadContent(selectedItem)}>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                  {selectedIsLongScript && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRegeneratePanel((current) => !current)}
                      className="border-purple-500/30 hover:bg-purple-500/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Nueva historia
                    </Button>
                  )}
                </div>
                <div className="creo-fast-scroll flex-1 min-h-0 overflow-y-auto bg-black/30">
                  {showRegeneratePanel && (
                    <div className="m-4 rounded-xl border border-purple-500/30 bg-gray-900/80 p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="mt-1 h-5 w-5 text-yellow-300" />
                        <div>
                          <h3 className="text-sm font-semibold text-white">¿Por qué quieres cambiar esta historia?</h3>
                          <p className="mt-1 text-xs text-gray-400">
                            Creo guardara esta evaluacion para intentar no repetir el mismo patron en futuras versiones.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedFeedbackOptions.map((option) => {
                          const active = selectedFeedback.includes(option.id);
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => toggleFeedbackReason(option.id)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                active
                                  ? 'border-purple-400 bg-purple-600 text-white'
                                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-purple-500'
                              }`}
                            >
                              {active && <Check className="mr-1 inline h-3 w-3" />}
                              {option.label}
                            </button>
                          );
                        })}
                      </div>

                      <textarea
                        value={feedbackNote}
                        onChange={(event) => setFeedbackNote(event.target.value.slice(0, 700))}
                        placeholder="Ej: el gancho no detiene el scroll, falta sensacion de peligro real, el final se entiende demasiado..."
                        className="mt-4 min-h-[86px] w-full rounded-lg border border-purple-500/20 bg-black/30 p-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-purple-400"
                      />

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={regenerateFromFeedback}
                          disabled={regenerating || selectedFeedback.length === 0}
                          className="gradient-primary"
                        >
                          {regenerating ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Generar nueva version
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowRegeneratePanel(false);
                            setSelectedFeedback([]);
                            setFeedbackNote('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="creo-readable-text p-6 text-[15px] leading-8 text-gray-100">
                    {selectedCleanContent
                      ? selectedCleanContent
                        .split(/\n{2,}/)
                        .map((paragraph, index) => (
                          <p key={`${index}-${paragraph.slice(0, 24)}`} className="mb-6 whitespace-pre-wrap break-words font-mono">
                            {paragraph.trim()}
                          </p>
                        ))
                      : (
                        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                          No se encontro relato limpio en este registro. Prueba copiar o generar una nueva version.
                        </p>
                      )}
                  </div>

                  {selectedSeo && selectedIsLongScript && (
                    <div className="border-t border-purple-500/20 bg-gray-950/80 p-6 space-y-5">
                      <section>
                        <h3 className="text-lg font-bold text-white">Sugerencias de titulos SEO</h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Basadas en retencion, curiosidad y claridad del relato.
                        </p>
                        <div className="mt-3 grid gap-2">
                          {selectedSeo.titles.map((title) => (
                            <div key={title} className="rounded-lg border border-purple-500/20 bg-black/20 p-3 text-sm text-gray-100">
                              {title}
                            </div>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-lg font-bold text-white">Descripcion sugerida</h3>
                        <p className="mt-2 rounded-lg border border-purple-500/20 bg-black/20 p-3 text-sm text-gray-200">
                          {selectedSeo.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedSeo.keywords.map((keyword) => (
                            <span key={keyword} className="rounded-full bg-purple-500/15 px-2.5 py-1 text-xs text-purple-200">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </section>

                      <section>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-bold text-white">Sugerencias de portada</h3>
                            <p className="mt-1 text-sm text-gray-400">
                              Opcional. Se generan solo cuando lo pides.
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setThumbnailSuggestions(buildThumbnailSuggestions(selectedItem))}
                            className="border-purple-500/30 hover:bg-purple-500/10"
                          >
                            <Image className="w-4 h-4 mr-2" />
                            Crear sugerencias de portada
                          </Button>
                        </div>

                        {thumbnailSuggestions && (
                          <div className="mt-4 grid gap-3">
                            {thumbnailSuggestions.map((suggestion) => (
                              <div key={suggestion.title} className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                                <p className="text-sm font-semibold text-blue-200">{suggestion.title}</p>
                                <p className="mt-1 text-sm text-gray-200">{suggestion.prompt}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default History;
