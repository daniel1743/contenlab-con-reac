/**
 * 🎬 GENERADOR DE GUIONES VIRALES
 * Modal para generar guiones completos con análisis estratégico
 * Usa geminiService.generateViralScript() con 3 campos:
 * - Análisis estratégico (con explicaciones)
 * - Guion limpio (listo para TTS)
 * - Sugerencias prácticas (recursos y herramientas)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Check, Download, Film, Loader2, Clock, CalendarDays, ThumbsUp, ThumbsDown, Meh, MessageSquare, Send } from 'lucide-react';
import { generateViralScript } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { saveGeneratedContentHistory } from '@/services/generatedContentHistoryService';
import { saveHorrorNarrativeFeedback, saveHorrorNarrativeMemory } from '@/ai/memory/horrorNarrativeMemory';
import { buildCreoCreativeIntent, creoCreativeDirections, creoScenarioOptions, creoIntensityOptions, creoEndingOptions, creoOriginOptions } from '@/ai/intent/creoCreativeIntent';
import { generateVideoPublishingPackage } from '@/services/ai/videoPublishingPackageService';
import { generateShortsPackage } from '@/services/ai/shortsPackageService';
import { contentDurations } from '@/constants/toolsConstants';

const creoContentOptions = [
  {
    value: 'terror',
    label: 'Terror',
    styles: [
      { value: 'historia_suburbana', label: 'Historia suburbana' },
      { value: 'historia_real', label: 'Historia real' },
      { value: 'testimonio_oyente', label: 'Testimonio de oyente' },
      { value: 'expediente_narrado', label: 'Expediente narrado' },
      { value: 'creepypasta', label: 'Creepypasta' }
    ]
  },
  {
    value: 'true_crime',
    label: 'True Crime',
    styles: [
      { value: 'relato_documental', label: 'Relato documental' },
      { value: 'expediente_narrado', label: 'Expediente narrado' },
      { value: 'testimonio_oyente', label: 'Testimonio de oyente' },
      { value: 'historia_real', label: 'Historia real' }
    ]
  },
  {
    value: 'ciencia_ficcion',
    label: 'Ciencia Ficcion',
    styles: [
      { value: 'relato_documental', label: 'Relato documental' },
      { value: 'expediente_narrado', label: 'Expediente narrado' },
      { value: 'historia_real', label: 'Historia real' },
      { value: 'creepypasta', label: 'Creepypasta' }
    ]
  },
  {
    value: 'suspenso',
    label: 'Suspenso',
    styles: [
      { value: 'historia_suburbana', label: 'Historia suburbana' },
      { value: 'historia_real', label: 'Historia real' },
      { value: 'testimonio_oyente', label: 'Testimonio de oyente' },
      { value: 'relato_documental', label: 'Relato documental' }
    ]
  },
  {
    value: 'religion',
    label: 'Religion',
    styles: [
      { value: 'critica_acida', label: 'Critica acida' },
      { value: 'denuncia_moral', label: 'Denuncia moral' },
      { value: 'profecia_bajo_juicio', label: 'Profecia bajo juicio' },
      { value: 'raciocinio_humano', label: 'Raciocinio humano' },
      { value: 'justicia_contra_dogma', label: 'Justicia contra dogma' }
    ]
  }
];

const MAX_DISPLAY_CHUNK_CHARACTERS = 2900;
const MAX_VOICE_TEXT_CHUNK_CHARACTERS = 2700;
const generationModeOptions = [
  {
    value: 'rapido',
    label: 'Rapido',
    description: 'Menos capas para borradores y pruebas.'
  },
  {
    value: 'pro',
    label: 'Pro',
    description: 'Pipeline editorial completo para produccion.'
  },
  {
    value: 'obsesivo',
    label: 'Obsesivo',
    description: 'Mayor exigencia de cumplimiento para guiones importantes.'
  }
];

const shortsQuantityOptions = [5, 10, 15, 20];
const shortsPlatformOptions = [
  { value: 'mixto', label: 'Mixto' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'reels', label: 'Reels' }
];
const shortsModeOptions = [
  { value: 'terror_psicologico', label: 'Terror psicologico' },
  { value: 'viral_agresivo', label: 'Viral agresivo' },
  { value: 'analog_horror', label: 'Analog horror' },
  { value: 'testimonio_real', label: 'Testimonio real' },
  { value: 'misterio_lento', label: 'Misterio lento' }
];
const religionShortsModeOptions = [
  { value: 'auto_religion_duration', label: 'Auto critico (20-150s segun tema)' },
  { value: 'micro_short', label: 'Micro short (20-35s)' },
  { value: 'short_estandar', label: 'Short estandar (45-70s)' },
  { value: 'deep_short', label: 'Deep short (80-150s)' }
];
const allShortsModeOptions = [...shortsModeOptions, ...religionShortsModeOptions];

const splitTextIntoVoiceChunks = (text, maxCharacters = MAX_VOICE_TEXT_CHUNK_CHARACTERS) => {
  const clean = String(text || '').trim();
  if (!clean) return [];

  const paragraphs = clean.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = '';

  const pushCurrent = () => {
    if (current.trim()) chunks.push(current.trim());
    current = '';
  };

  paragraphs.forEach((paragraph) => {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length <= maxCharacters) {
      current = next;
      return;
    }

    pushCurrent();

    if (paragraph.length <= maxCharacters) {
      current = paragraph;
      return;
    }

    const sentences = paragraph.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [paragraph];
    sentences.forEach((sentence) => {
      const trimmed = sentence.trim();
      if (!trimmed) return;
      const sentenceNext = current ? `${current} ${trimmed}` : trimmed;
      if (sentenceNext.length <= maxCharacters) {
        current = sentenceNext;
      } else {
        pushCurrent();
        let remaining = trimmed;
        while (remaining.length > maxCharacters) {
          chunks.push(remaining.slice(0, maxCharacters).trim());
          remaining = remaining.slice(maxCharacters).trim();
        }
        current = remaining;
      }
    });
  });

  pushCurrent();

  return chunks;
};

const VIRAL_SCRIPT_DRAFT_VERSION = 'v1';
const DEFAULT_HORROR_CHANNEL_NAME = 'Expedientes Hades';
const legacyFocusMap = {
  horror: 'paranormal',
  universo_hades: 'universo_serial'
};

const normalizeSavedCreativeDirections = (items) => {
  const validIds = new Set(creoCreativeDirections.map((item) => item.id));
  const normalized = Array.from(new Set((Array.isArray(items) ? items : [])
    .map((id) => legacyFocusMap[id] || id)
    .filter((id) => validIds.has(id))));

  return normalized.length ? normalized.slice(0, 3) : ['historia_real'];
};

const getDraftStorageKey = (userId) => `creovision_viral_script_draft_${VIRAL_SCRIPT_DRAFT_VERSION}_${userId || 'guest'}`;

const readStoredDraft = (storageKey) => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('No se pudo restaurar el borrador del generador viral:', error);
    return null;
  }
};

const writeStoredDraft = (storageKey, draft) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify({
      ...draft,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.warn('No se pudo guardar el borrador del generador viral:', error);
  }
};

const formatShortForCopy = (short) => [
  short.title,
  short.emotion ? `Emocion: ${short.emotion}` : '',
  short.durationSeconds ? `Duracion: ${short.durationSeconds}s` : '',
  short.substyle ? `Subestilo: ${short.substyle}` : '',
  short.hook ? `Hook: ${short.hook}` : '',
  short.biblicalReference?.book ? `Referencia biblica: ${short.biblicalReference.book} ${short.biblicalReference.chapter}:${short.biblicalReference.verse}` : '',
  short.biblicalQuote ? `Cita biblica: ${short.biblicalQuote}` : '',
  short.theologicalContext ? `Contexto teologico: ${short.theologicalContext}` : '',
  short.moralConflict ? `Conflicto moral: ${short.moralConflict}` : '',
  short.script,
  short.memorablePhrase ? `Frase memorable: ${short.memorablePhrase}` : '',
  short.mentalEcho ? `Eco mental: ${short.mentalEcho}` : '',
  short.cutLine ? `Corte: ${short.cutLine}` : '',
  short.finalQuestion ? `Pregunta final: ${short.finalQuestion}` : '',
  short.hiddenQuestion ? `Pregunta abierta: ${short.hiddenQuestion}` : '',
  short.scores?.overall ? `Score premium: ${short.scores.overall}/100` : '',
  short.onScreenText?.length ? `Texto en pantalla: ${short.onScreenText.join(' / ')}` : '',
  short.hashtags?.length ? short.hashtags.join(' ') : ''
].filter(Boolean).join('\n\n');

const ViralScriptGeneratorModal = ({ open, onOpenChange, userPersonality = null }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const draftStorageKey = useMemo(() => getDraftStorageKey(user?.id), [user?.id]);
  const draftRestoredRef = useRef(false);
  const restoredDraftKeyRef = useRef(null);
  const skipNextDraftWriteRef = useRef(false);
  const generationLockRef = useRef(false);

  // Form states
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('');
  const [duration, setDuration] = useState('one_min');
  const [narrativeYear, setNarrativeYear] = useState('');
  const [channelName, setChannelName] = useState(DEFAULT_HORROR_CHANNEL_NAME);
  const [topic, setTopic] = useState('');
  const [scenario, setScenario] = useState('carretera');
  const [intensity, setIntensity] = useState('inquietante');
  const [endingType, setEndingType] = useState('eco_emocional');
  const [originPreference, setOriginPreference] = useState('auto');
  const [detailsExtra, setDetailsExtra] = useState('');
  const [generationMode, setGenerationMode] = useState('pro');
  const [activeFocus, setActiveFocus] = useState(['historia_real']);
  const [focusSelections, setFocusSelections] = useState({
    historia_real: 'sensacion de autenticidad'
  });
  const currentStyles = creoContentOptions.find((option) => option.value === theme)?.styles || [];
  const currentShortsModeOptions = theme === 'religion' ? religionShortsModeOptions : shortsModeOptions;
  const currentShortsDurationLabel = theme === 'religion'
    ? '20-150 segundos segun modo religioso'
    : '45-70 segundos';

  // Generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [qualityReport, setQualityReport] = useState(null);
  const [impactReport, setImpactReport] = useState(null);
  const [finalScoreReport, setFinalScoreReport] = useState(null);
  const [generationMeta, setGenerationMeta] = useState(null);
  const [ctaCierre, setCtaCierre] = useState('');
  const [scriptFeedback, setScriptFeedback] = useState(null);
  const [scriptFeedbackNote, setScriptFeedbackNote] = useState('');
  const [isSavingScriptFeedback, setIsSavingScriptFeedback] = useState(false);
  const [publishingPackage, setPublishingPackage] = useState(null);
  const [isGeneratingPublishingPackage, setIsGeneratingPublishingPackage] = useState(false);
  const [shortsPackage, setShortsPackage] = useState(null);
  const [isGeneratingShortsPackage, setIsGeneratingShortsPackage] = useState(false);
  const [shortsQuantity, setShortsQuantity] = useState(5);
  const [shortsPlatform, setShortsPlatform] = useState('mixto');
  const [shortsMode, setShortsMode] = useState('terror_psicologico');
  const [shortsSource, setShortsSource] = useState('winner');

  // Copy states
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedChunk, setCopiedChunk] = useState(null);
  const [showAlternativeVersion, setShowAlternativeVersion] = useState(false);

  const creoIntent = useMemo(() => buildCreoCreativeIntent({
    theme,
    style,
    scenario,
    intensity,
    endingType,
    directions: activeFocus,
    detailsExtra,
    narrativeYear,
    channelName,
    originPreference
  }), [theme, style, scenario, intensity, endingType, activeFocus, detailsExtra, narrativeYear, channelName, originPreference]);

  const selectedFocusSummary = creoIntent.promptDirectives;

  const voiceChunks = useMemo(() => {
    if (!generatedContent) return [];
    return splitTextIntoVoiceChunks(generatedContent);
  }, [generatedContent]);

  const fullVoiceOutput = useMemo(() => voiceChunks.join('\n\n'), [voiceChunks]);

  // Restaurar una sola vez por usuario. No rehidratar al cambiar de ventana o reabrir.
  useEffect(() => {
    if (restoredDraftKeyRef.current === draftStorageKey) return;

    draftRestoredRef.current = false;
    skipNextDraftWriteRef.current = true;

    const savedDraft = readStoredDraft(draftStorageKey);
    if (savedDraft) {
      setTheme(savedDraft.theme || '');
      setStyle(savedDraft.style || '');
      setDuration(savedDraft.duration || 'one_min');
      setNarrativeYear(savedDraft.narrativeYear || '');
      setChannelName(savedDraft.channelName ?? userPersonality?.channelName ?? DEFAULT_HORROR_CHANNEL_NAME);
      setTopic(savedDraft.topic || '');
      setScenario(savedDraft.scenario || 'carretera');
      setIntensity(savedDraft.intensity || 'inquietante');
      setEndingType(savedDraft.endingType || 'eco_emocional');
      setOriginPreference(savedDraft.originPreference || 'auto');
      setDetailsExtra(savedDraft.detailsExtra || savedDraft.transmediaBrief || '');
      setGenerationMode(savedDraft.generationMode || 'pro');
      setActiveFocus(normalizeSavedCreativeDirections(savedDraft.activeFocus));
      setFocusSelections(savedDraft.focusSelections && typeof savedDraft.focusSelections === 'object'
        ? savedDraft.focusSelections
        : { historia_real: 'sensacion de autenticidad' });
      setGeneratedContent(savedDraft.generatedContent || null);
      setQualityReport(savedDraft.qualityReport || null);
      setImpactReport(savedDraft.impactReport || null);
      setFinalScoreReport(savedDraft.finalScoreReport || null);
      setGenerationMeta(savedDraft.generationMeta || null);
      setCtaCierre(savedDraft.ctaCierre || '');
      setScriptFeedback(savedDraft.scriptFeedback || null);
      setScriptFeedbackNote(savedDraft.scriptFeedbackNote || '');
      setPublishingPackage(savedDraft.publishingPackage || null);
      setShortsPackage(savedDraft.shortsPackage || null);
      setShortsQuantity(shortsQuantityOptions.includes(Number(savedDraft.shortsQuantity)) ? Number(savedDraft.shortsQuantity) : 5);
      setShortsPlatform(shortsPlatformOptions.some((option) => option.value === savedDraft.shortsPlatform) ? savedDraft.shortsPlatform : 'mixto');
      setShortsMode(allShortsModeOptions.some((option) => option.value === savedDraft.shortsMode) ? savedDraft.shortsMode : 'terror_psicologico');
      setShortsSource(savedDraft.shortsSource === 'alternative' ? 'alternative' : 'winner');
    } else {
      setChannelName((current) => current || userPersonality?.channelName || DEFAULT_HORROR_CHANNEL_NAME);
    }

    setCopiedChunk(null);
    setShowAlternativeVersion(false);
    restoredDraftKeyRef.current = draftStorageKey;
    draftRestoredRef.current = true;
  }, [draftStorageKey, userPersonality?.channelName]);

  useEffect(() => {
    if (!draftRestoredRef.current) return;

    if (skipNextDraftWriteRef.current) {
      skipNextDraftWriteRef.current = false;
      return;
    }

    writeStoredDraft(draftStorageKey, {
      theme,
      style,
      duration,
      narrativeYear,
      channelName,
      topic,
      scenario,
      intensity,
      endingType,
      originPreference,
      detailsExtra,
      transmediaBrief: detailsExtra,
      generationMode,
      activeFocus,
      focusSelections,
      generatedContent,
      qualityReport,
      impactReport,
      finalScoreReport,
      generationMeta,
      ctaCierre,
      scriptFeedback,
      scriptFeedbackNote,
      publishingPackage,
      shortsPackage,
      shortsQuantity,
      shortsPlatform,
      shortsMode,
      shortsSource
    });
  }, [
    draftStorageKey,
    theme,
    style,
    duration,
    narrativeYear,
    channelName,
    topic,
    scenario,
    intensity,
    endingType,
    originPreference,
    detailsExtra,
    generationMode,
    activeFocus,
    focusSelections,
    generatedContent,
    qualityReport,
    impactReport,
    finalScoreReport,
    generationMeta,
    ctaCierre,
    scriptFeedback,
    scriptFeedbackNote,
    publishingPackage,
    shortsPackage,
    shortsQuantity,
    shortsPlatform,
    shortsMode,
    shortsSource
  ]);

  useEffect(() => {
    if (theme !== 'religion') return;
    if (!religionShortsModeOptions.some((option) => option.value === shortsMode)) {
      setShortsMode('auto_religion_duration');
    }
  }, [theme, shortsMode]);

  const handleGenerate = async () => {
    // Validación
    if (!theme || !style || !topic) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive'
      });
      return;
    }

    await executeGeneration();
  };

  const toggleFocusCategory = (id) => {
    setActiveFocus((prev) => {
      const exists = prev.includes(id);
      if (exists) return prev.filter((item) => item !== id);

      if (prev.length >= 3) {
        toast({
          title: 'Direccion creativa completa',
          description: 'Elige hasta 3 enfoques para mantener instrucciones claras.'
        });
        return prev;
      }

      const category = creoCreativeDirections.find((item) => item.id === id);
      setFocusSelections((current) => ({
        ...current,
        [id]: current[id] || category?.label || ''
      }));
      return [...prev, id];
    });
  };

  const executeGeneration = async () => {
    if (generationLockRef.current) return;

    if (!user) {
      toast({
        title: 'Debes iniciar sesión',
        description: 'Necesitas una cuenta para generar guiones',
        variant: 'destructive'
      });
      return;
    }

    generationLockRef.current = true;
    setIsGenerating(true);

    try {
      const enrichedTopic = topic;

      // Generar guion con el motor configurado
      const result = await generateViralScript(theme, style, duration, enrichedTopic, userPersonality, {
        narrativeYear,
        channelName,
        creativeDirectives: selectedFocusSummary,
        creoIntent,
        scenario,
        intensity,
        endingType,
        originPreference,
        detailsExtra,
        generationMode,
        userId: user.id
      });

      setGeneratedContent(result);
      setQualityReport(generateViralScript.lastQualityReport || null);
      setImpactReport(generateViralScript.lastImpactReport || null);
      setFinalScoreReport(generateViralScript.lastFinalScore || generateViralScript.lastGenerationMeta?.finalScore || null);
      setGenerationMeta(generateViralScript.lastGenerationMeta || null);
      setCtaCierre(generateViralScript.lastGenerationMeta?.ctaCierre || '');
      setScriptFeedback(null);
      setScriptFeedbackNote('');
      setPublishingPackage(null);
      setShortsPackage(null);
      setShowAlternativeVersion(false);

      writeStoredDraft(draftStorageKey, {
        theme,
        style,
        duration,
        narrativeYear,
        channelName,
        topic,
        scenario,
        intensity,
        endingType,
        originPreference,
        detailsExtra,
        transmediaBrief: detailsExtra,
        generationMode,
        activeFocus,
        focusSelections,
        generatedContent: result,
        qualityReport: generateViralScript.lastQualityReport || null,
        impactReport: generateViralScript.lastImpactReport || null,
        finalScoreReport: generateViralScript.lastFinalScore || generateViralScript.lastGenerationMeta?.finalScore || null,
        generationMeta: generateViralScript.lastGenerationMeta || null,
        ctaCierre: generateViralScript.lastGenerationMeta?.ctaCierre || '',
        scriptFeedback: null,
        scriptFeedbackNote: '',
        publishingPackage: null,
        shortsPackage: null,
        shortsQuantity,
        shortsPlatform,
        shortsMode,
        shortsSource
      });

      if (theme === 'terror') {
        await saveHorrorNarrativeMemory({
          userId: user.id,
          topic,
          style,
          script: result,
          quality: generateViralScript.lastQualityReport || null,
          impact: generateViralScript.lastImpactReport || null,
          metadata: {
            channelName,
            focus: selectedFocusSummary,
            creoIntent,
            scenario,
            intensity,
            endingType,
            originPreference,
            originEngine: creoIntent.originEngine || null,
            detailsExtra,
            duration,
            narrativeYear,
            generationMode,
            finalScore: generateViralScript.lastFinalScore || null,
            ctaCierre: generateViralScript.lastGenerationMeta?.ctaCierre || null,
            narrativeBlueprint: generateViralScript.lastGenerationMeta?.narrativeBlueprint || null
          }
        });
      }

      await saveGeneratedContentHistory({
        userId: user.id,
        contentType: 'script',
        topic,
        theme,
        style,
        duration,
        narrativeYear,
        platform: 'youtube',
        content: result,
        metadata: {
          channelName,
          focus: selectedFocusSummary,
          creoIntent,
          scenario,
          intensity,
          endingType,
          originPreference,
          originEngine: creoIntent.originEngine || null,
          detailsExtra,
          generationMode,
          voiceChunkMaxCharacters: MAX_VOICE_TEXT_CHUNK_CHARACTERS,
          qualityReport: generateViralScript.lastQualityReport || null,
          impactReport: generateViralScript.lastImpactReport || null,
          finalScoreReport: generateViralScript.lastFinalScore || null,
          ctaCierre: generateViralScript.lastGenerationMeta?.ctaCierre || null,
          narrativeBlueprint: generateViralScript.lastGenerationMeta?.narrativeBlueprint || null,
          generationMeta: generateViralScript.lastGenerationMeta || null
        }
      });

      // 🎁 FASE 2: Otorgar bonus por primer contenido
      try {
        const { grantFirstContentBonus } = await import('@/services/bonusService');
        const bonusResult = await grantFirstContentBonus(user.id, 'viral_script');
        if (bonusResult.success && !bonusResult.alreadyGranted) {
          toast({
            title: '🎉 ¡Primer contenido creado!',
            description: `Has recibido ${bonusResult.credits} créditos adicionales`,
            duration: 5000
          });
        }
      } catch (error) {
        console.warn('Error granting first content bonus:', error);
        // No es crítico, continuar
      }

      toast({
        title: '¡Guion generado!',
        description: 'Tu guion viral está listo para usar 🎬'
      });
    } catch (error) {
      console.error('Error generando guion:', error);
      toast({
        title: 'Error al generar',
        description: 'No se pudo generar el guion. Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      generationLockRef.current = false;
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === 'script') {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      } else if (type?.startsWith('chunk-')) {
        setCopiedChunk(type);
        setTimeout(() => setCopiedChunk(null), 2000);
      }

      toast({
        title: 'Copiado',
        description: 'Contenido copiado al portapapeles'
      });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el contenido',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = (text, filename) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Descargado',
      description: 'Archivo guardado exitosamente'
    });
  };

  const handleGeneratePublishingPackage = async () => {
    if (!generatedContent) return;

    setIsGeneratingPublishingPackage(true);

    try {
      const result = await generateVideoPublishingPackage({
        script: generatedContent,
        topic,
        theme,
        style,
        duration,
        narrativeYear,
        channelName,
        creoIntent,
        qualityReport,
        impactReport,
        finalScoreReport,
        generationMode
      });

      setPublishingPackage(result);
      writeStoredDraft(draftStorageKey, {
        theme,
        style,
        duration,
        narrativeYear,
        channelName,
        topic,
        scenario,
        intensity,
        endingType,
        originPreference,
        detailsExtra,
        transmediaBrief: detailsExtra,
        generationMode,
        activeFocus,
        focusSelections,
        generatedContent,
        qualityReport,
        impactReport,
        finalScoreReport,
        generationMeta,
        ctaCierre,
        scriptFeedback,
        scriptFeedbackNote,
        publishingPackage: result,
        shortsPackage,
        shortsQuantity,
        shortsPlatform,
        shortsMode,
        shortsSource
      });

      toast({
        title: 'Datos completos generados',
        description: 'Ya tienes descripcion SEO, titulos y guia de miniatura para YouTube.'
      });
    } catch (error) {
      console.error('No se pudo generar el paquete de publicacion:', error);
      toast({
        title: 'No se pudieron generar los datos',
        description: error.message || 'Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingPublishingPackage(false);
    }
  };

  const handleGenerateShortsPackage = async () => {
    if (!generatedContent) return;

    setIsGeneratingShortsPackage(true);

    try {
      const useAlternativeSource = shortsSource === 'alternative' && alternativeVersion?.script;
      const selectedShortsScript = useAlternativeSource ? alternativeVersion.script : generatedContent;
      const selectedShortsSource = useAlternativeSource ? 'alternative' : 'winner';
      if (!useAlternativeSource && shortsSource === 'alternative') {
        setShortsSource('winner');
      }
      const result = await generateShortsPackage({
        script: selectedShortsScript,
        topic,
        theme,
        style,
        duration,
        narrativeYear,
        channelName,
        creoIntent,
        qualityReport,
        impactReport,
        finalScoreReport,
        generationMode,
        quantity: shortsQuantity,
        platform: shortsPlatform,
        mode: shortsMode,
        source: selectedShortsSource
      });

      setShortsPackage(result);
      writeStoredDraft(draftStorageKey, {
        theme,
        style,
        duration,
        narrativeYear,
        channelName,
        topic,
        scenario,
        intensity,
        endingType,
        originPreference,
        detailsExtra,
        transmediaBrief: detailsExtra,
        generationMode,
        activeFocus,
        focusSelections,
        generatedContent,
        qualityReport,
        impactReport,
        finalScoreReport,
        generationMeta,
        ctaCierre,
        scriptFeedback,
        scriptFeedbackNote,
        publishingPackage,
        shortsPackage: result,
        shortsQuantity,
        shortsPlatform,
        shortsMode,
        shortsSource: selectedShortsSource
      });

      toast({
        title: 'Shorts/TikTok generados',
        description: `Tienes ${result.shorts?.length || shortsQuantity} piezas premium sin revelar el final.`
      });
    } catch (error) {
      console.error('No se pudo generar el paquete de Shorts/TikTok:', error);
      toast({
        title: 'No se pudieron generar los Shorts',
        description: error.message || 'Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingShortsPackage(false);
    }
  };

  const handleScriptFeedback = async (feedback) => {
    if (!generatedContent) return;

    setScriptFeedback(feedback);
    setIsSavingScriptFeedback(true);

    try {
      if (theme === 'terror') {
        await saveHorrorNarrativeFeedback({
          userId: user?.id,
          topic,
          style,
          script: generatedContent,
          quality: qualityReport,
          impact: impactReport,
          feedback,
          metadata: {
            channelName,
            focus: selectedFocusSummary,
            creoIntent,
            scenario,
            intensity,
            endingType,
            originPreference,
            originEngine: creoIntent.originEngine || null,
            detailsExtra,
            duration,
            narrativeYear,
            generationMode,
            feedbackNote: scriptFeedbackNote.trim(),
            feedbackSource: 'viral_script_result'
          }
        });
      }

      const labels = {
        liked: 'Lo usare como referencia positiva.',
        neutral: 'Conservare la idea, pero pedire mas fuerza y claridad.',
        disliked: 'Evitaremos patrones parecidos en proximos guiones.'
      };

      toast({
        title: 'Feedback enviado',
        description: labels[feedback] || 'La senal fue registrada para mejorar proximos guiones.'
      });
    } catch (error) {
      console.error('No se pudo guardar el feedback narrativo:', error);
      toast({
        title: 'No se pudo enviar',
        description: 'Tu nota sigue escrita. Intenta enviarla otra vez.',
        variant: 'destructive'
      });
    } finally {
      setIsSavingScriptFeedback(false);
    }
  };

  const handleSubmitScriptFeedback = () => {
    const fallbackFeedback = scriptFeedback || 'neutral';
    return handleScriptFeedback(fallbackFeedback);
  };

  const premiumPolishMeta = generationMeta?.premiumPolish || null;
  const recommendedVersion = premiumPolishMeta?.recommended || null;
  const recommendedScore = recommendedVersion?.score ?? finalScoreReport?.score_final ?? qualityReport?.score ?? null;
  const recommendedModel = recommendedVersion?.model || generationMeta?.selectedVersion || 'Pipeline CreoVision';
  const alternativeVersion = premiumPolishMeta?.alternative || null;
  const alternativeVoiceChunks = useMemo(() => {
    if (!alternativeVersion?.script) return [];
    return splitTextIntoVoiceChunks(alternativeVersion.script);
  }, [alternativeVersion?.script]);
  const fullAlternativeVoiceOutput = useMemo(() => alternativeVoiceChunks.join('\n\n'), [alternativeVoiceChunks]);
  const fullShortsPackageOutput = useMemo(() => {
    if (!shortsPackage?.shorts?.length) return '';
    return shortsPackage.shorts.map(formatShortForCopy).join('\n\n---\n\n');
  }, [shortsPackage]);
  const deepSeekWorked = Boolean(generatedContent);
  const openAiAccepted = Boolean(premiumPolishMeta?.accepted);
  const openAiAttempted = Boolean(premiumPolishMeta?.attempted);
  const openAiFailed = Boolean(premiumPolishMeta?.error || premiumPolishMeta?.openaiError);
  const openAiStatus = openAiAccepted
    ? 'Refinamiento aceptado'
    : openAiFailed
      ? 'Intento fallido'
      : openAiAttempted
        ? 'Intentado, no aceptado por control de calidad'
        : premiumPolishMeta?.reason === 'openai_no_configurado'
          ? 'No configurado'
          : 'No ejecutado';

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="creo-paint-isolated relative w-full max-w-6xl max-h-[90vh] overflow-hidden bg-[#0d1220] border border-purple-500/30 rounded-2xl shadow-xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-[#111827]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-lg shadow-purple-900/40">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generador de Guiones Virales</h2>
                <p className="text-sm text-gray-400">Texto limpio, listo para IA de voz</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-800 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="creo-fast-scroll p-6 overflow-y-auto max-h-[calc(90vh-88px)] bg-slate-950/35">
            {!generatedContent ? (
              /* FORM */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-purple-500/20 bg-slate-950/45 p-4">
                    <p className="text-xs uppercase text-purple-200/80">Salida</p>
                    <p className="mt-1 text-sm text-white">Solo guion limpio</p>
                  </div>
                  <div className="rounded-lg border border-cyan-500/20 bg-slate-950/45 p-4">
                    <p className="text-xs uppercase text-cyan-200/80">Maximo</p>
                    <p className="mt-1 text-sm text-white">10 minutos / 10000 caracteres</p>
                  </div>
                  <div className="rounded-lg border border-emerald-500/20 bg-slate-950/45 p-4">
                    <p className="text-xs uppercase text-emerald-200/80">Voz</p>
                    <p className="mt-1 text-sm text-white">Pausas con puntuacion</p>
                  </div>
                </div>

                {/* Temática */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Temática del contenido *
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => {
                      setTheme(e.target.value);
                      setStyle('');
                    }}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="">Selecciona una temática</option>
                    {creoContentOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Estilo */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Estilo de presentación *
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    disabled={!theme}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 disabled:opacity-60"
                  >
                    <option value="">{theme ? 'Selecciona un estilo' : 'Primero elige una tematica'}</option>
                    {currentStyles.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-slate-950/35 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-white">Dirección creativa</p>
                    <p className="text-xs text-gray-400">
                      Elige hasta 3 enfoques. Creo los fusiona en una sola direccion interna.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {creoCreativeDirections.map((category) => {
                      const checked = activeFocus.includes(category.id);
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleFocusCategory(category.id)}
                          className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-all ${
                            checked
                              ? 'border-purple-400 bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                              : 'border-gray-700 bg-gray-800/80 text-gray-300 hover:border-purple-500'
                          }`}
                        >
                          <span className="mr-2">{checked ? 'x' : '-'}</span>
                          {category.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-slate-950/35 p-4">
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-white">Controles narrativos</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Define el lugar, la fuerza emocional y la sensacion del cierre.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Escenario</span>
                      <select
                        value={scenario}
                        onChange={(e) => setScenario(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                      >
                        {creoScenarioOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Intensidad</span>
                      <select
                        value={intensity}
                        onChange={(e) => setIntensity(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                      >
                        {creoIntensityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Tipo de final</span>
                      <select
                        value={endingType}
                        onChange={(e) => setEndingType(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                      >
                        {creoEndingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Origen</span>
                      <select
                        value={originPreference}
                        onChange={(e) => setOriginPreference(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                      >
                        {creoOriginOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block space-y-2">
                    <span className="text-xs font-semibold text-gray-300">Detalles extra</span>
                    <textarea
                      value={detailsExtra}
                      onChange={(e) => setDetailsExtra(e.target.value.slice(0, 1200))}
                      placeholder="Ej: Quiero que ocurra en 1989, que el narrador recuerde una cinta vieja y que el final deje una pista sin resolver."
                      rows={4}
                      className="w-full px-4 py-3 text-sm text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/40"
                    />
                  </label>
                </div>

                {/* Duración */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                    <Clock className="w-4 h-4 text-purple-300" />
                    Duración del video *
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {contentDurations.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDuration(opt.value)}
                        className={`p-4 text-center border rounded-lg transition-all ${
                          duration === opt.value
                            ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/40'
                            : 'bg-gray-800/90 border-gray-700 text-gray-300 hover:border-purple-500 hover:bg-gray-800'
                        }`}
                      >
                        <div className="text-lg font-bold">{opt.minutes}</div>
                        <div className="text-xs font-medium">{opt.minutes === 1 ? 'minuto' : 'minutos'}</div>
                        <div className="mt-1 text-[11px] text-gray-300">{opt.targetCharacters} caracteres</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium text-gray-300">
                    Modo de generación
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {generationModeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGenerationMode(option.value)}
                        className={`rounded-lg border p-4 text-left transition-all ${
                          generationMode === option.value
                            ? 'border-purple-400 bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                            : 'border-gray-700 bg-gray-800/90 text-gray-300 hover:border-purple-500'
                        }`}
                      >
                        <span className="block text-sm font-semibold">{option.label}</span>
                        <span className="mt-1 block text-xs text-gray-300">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[180px_minmax(0,1fr)] gap-4">
                  {/* Año de la narración */}
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                      <CalendarDays className="w-4 h-4 text-purple-300" />
                      Año
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={narrativeYear}
                      onChange={(e) => setNarrativeYear(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                      placeholder="Ej: 1998"
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Nombre del canal
                    </label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value.slice(0, 80))}
                      placeholder="Ej: Relatos del Abismo"
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>

                {/* Tema específico */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tema específico del video *
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ej: Una familia se muda cerca de una carretera donde cada noche aparece el mismo auto sin conductor"
                    rows={3}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                {/* Botón generar */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !theme || !style || !topic}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generando tu guion...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generar Guion Viral
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-6">
                <div className="p-6 border border-green-500/30 rounded-xl bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold text-white">Guion limpio por partes</h3>
                        {recommendedScore !== null && recommendedScore !== undefined && (
                          <span className="rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-100">
                            Ganador: {recommendedScore}/100
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        Cada bloque copia solo narracion limpia y queda por debajo de {MAX_DISPLAY_CHUNK_CHARACTERS} caracteres.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-300">
                          Modelo: {recommendedModel}
                        </span>
                        {recommendedVersion?.decision && (
                          <span className="rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-300">
                            {recommendedVersion.decision}
                          </span>
                        )}
                        {recommendedVersion?.labels?.map((label) => (
                          <span key={label} className="rounded-full bg-gray-950/70 px-2 py-1 text-xs text-gray-300">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(fullVoiceOutput, 'script')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                        title="Copiar todo el guion limpio"
                      >
                        {copiedScript ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDownload(fullVoiceOutput, 'guion-creovision-limpio.txt')}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-700 hover:text-white"
                        title="Descargar guion limpio"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {theme === 'terror' && (
                    <div className="mb-5 rounded-xl border border-gray-700 bg-gray-950/60 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="flex items-center gap-2 text-sm font-semibold text-white">
                            <MessageSquare className="h-4 w-4 text-purple-200" />
                            Feedback para proximos guiones
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Escribe que no encajo o que quieres potenciar. Ej: "en 1989 no uses celular" o "quiero mas sensacion fisica con el agua negra".
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleScriptFeedback('liked')}
                            disabled={isSavingScriptFeedback}
                            className={`rounded-lg border p-3 transition-colors ${
                              scriptFeedback === 'liked'
                                ? 'border-green-400 bg-green-500/20 text-green-100'
                                : 'border-gray-700 text-gray-300 hover:border-green-500 hover:bg-green-500/10'
                            }`}
                            title="Me gusto"
                          >
                            <ThumbsUp className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScriptFeedback('neutral')}
                            disabled={isSavingScriptFeedback}
                            className={`rounded-lg border p-3 transition-colors ${
                              scriptFeedback === 'neutral'
                                ? 'border-amber-400 bg-amber-500/20 text-amber-100'
                                : 'border-gray-700 text-gray-300 hover:border-amber-500 hover:bg-amber-500/10'
                            }`}
                            title="Puede mejorar"
                          >
                            <Meh className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScriptFeedback('disliked')}
                            disabled={isSavingScriptFeedback}
                            className={`rounded-lg border p-3 transition-colors ${
                              scriptFeedback === 'disliked'
                                ? 'border-red-400 bg-red-500/20 text-red-100'
                                : 'border-gray-700 text-gray-300 hover:border-red-500 hover:bg-red-500/10'
                            }`}
                            title="No me gusto"
                          >
                            <ThumbsDown className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={scriptFeedbackNote}
                        onChange={(event) => setScriptFeedbackNote(event.target.value.slice(0, 700))}
                        className="mt-3 min-h-[88px] w-full resize-none rounded-lg border border-gray-700 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 outline-none transition-colors placeholder:text-gray-500 focus:border-purple-400"
                        placeholder="Ej: El final no me gusto. El celular rompe el año 1989. Quiero mas abandono emocional y detalles sensoriales como el olor fetido del agua."
                      />
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-500">
                          Puedes enviar solo la nota; si no eliges calificacion, se guarda como mejora sugerida.
                        </p>
                        <button
                          type="button"
                          onClick={handleSubmitScriptFeedback}
                          disabled={isSavingScriptFeedback || (!scriptFeedback && !scriptFeedbackNote.trim())}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-purple-500/40 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-100 transition-colors hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSavingScriptFeedback ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          {scriptFeedback ? 'Actualizar feedback' : 'Enviar feedback'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {voiceChunks.map((chunk, index) => {
                      const copyKey = `chunk-${index}`;
                      return (
                        <div key={copyKey} className="rounded-xl border border-gray-700 bg-gray-950/70">
                          <div className="flex items-center justify-between gap-3 border-b border-gray-800 px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                Parte {index + 1} de {voiceChunks.length}
                              </p>
                              <p className="text-xs text-gray-500">{chunk.length} caracteres aprox.</p>
                            </div>
                            <button
                              onClick={() => handleCopy(chunk, copyKey)}
                              className="rounded-lg border border-purple-500/30 p-2 text-purple-100 hover:bg-purple-500/10"
                              title={`Copiar parte ${index + 1}`}
                            >
                              {copiedChunk === copyKey ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                          <div className="creo-readable-text whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-gray-200">
                            {chunk}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">F12 IA</h3>
                      <p className="text-xs text-gray-400">Diagnostico del motor usado para este guion.</p>
                    </div>
                    {generationMeta?.selectedVersion && (
                      <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-300">
                        Version: {generationMeta.selectedVersion}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className={`rounded-lg border p-4 ${
                      deepSeekWorked
                        ? 'border-green-500/30 bg-green-500/10'
                        : 'border-gray-700 bg-gray-950/50'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">DeepSeek guion</p>
                          <p className="mt-1 text-xs text-gray-400">
                            Pipeline principal, arquitectura, escritura y reescrituras.
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                          deepSeekWorked ? 'bg-green-500/20 text-green-200' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {deepSeekWorked ? 'CHECK' : 'OFF'}
                        </span>
                      </div>
                      {generationMeta?.layers?.length > 0 && (
                        <p className="mt-3 text-xs leading-relaxed text-gray-500">
                          Capas: {generationMeta.layers.slice(0, 8).join(' / ')}
                        </p>
                      )}
                    </div>

                    <div className={`rounded-lg border p-4 ${
                      openAiAccepted
                        ? 'border-green-500/30 bg-green-500/10'
                        : openAiAttempted || openAiFailed
                          ? 'border-amber-500/30 bg-amber-500/10'
                          : 'border-gray-700 bg-gray-950/50'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">OpenAI refinamiento</p>
                          <p className="mt-1 text-xs text-gray-400">
                            Pulido premium posterior al guion base.
                          </p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                          openAiAccepted
                            ? 'bg-green-500/20 text-green-200'
                            : openAiAttempted || openAiFailed
                              ? 'bg-amber-500/20 text-amber-200'
                              : 'bg-gray-800 text-gray-400'
                        }`}>
                          {openAiAccepted ? 'CHECK' : openAiAttempted || openAiFailed ? 'REV' : 'OFF'}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-gray-400">{openAiStatus}</p>
                      {premiumPolishMeta?.model && (
                        <p className="mt-1 text-xs text-gray-500">Modelo: {premiumPolishMeta.model}</p>
                      )}
                      {(premiumPolishMeta?.previousScore || premiumPolishMeta?.polishedScore) && (
                        <p className="mt-1 text-xs text-gray-500">
                          Score: {premiumPolishMeta.previousScore ?? 'N/D'} -> {premiumPolishMeta.polishedScore ?? 'N/D'}
                        </p>
                      )}
                      {premiumPolishMeta?.error && (
                        <p className="mt-2 text-xs text-red-300">{premiumPolishMeta.error}</p>
                      )}
                      {alternativeVersion?.script && (
                        <button
                          type="button"
                          onClick={() => setShowAlternativeVersion((current) => !current)}
                          className="mt-4 inline-flex w-full items-center justify-center rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100 transition-colors hover:bg-amber-500/20"
                        >
                          {showAlternativeVersion ? 'Ocultar variante alternativa' : `Mostrar variante alternativa (${alternativeVersion.score ?? 'N/D'}/100)`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {showAlternativeVersion && alternativeVersion?.script && (
                  <div className="rounded-xl border border-amber-500/30 bg-gray-900/70 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-amber-200/80">
                          Variante alternativa disponible
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-white">
                          {alternativeVersion.name || 'Version alternativa'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          No reemplaza el ganador. Queda disponible porque puede ser mas limpia, rapida o cinematografica aunque el juez haya preferido la otra version.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-amber-400/30 px-2 py-1 text-xs text-amber-100">
                            Score: {alternativeVersion.score ?? 'N/D'}/100
                          </span>
                          <span className="rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-300">
                            Modelo: {alternativeVersion.model || 'OpenAI premium polish'}
                          </span>
                          {alternativeVersion.decision && (
                            <span className="rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-300">
                              {alternativeVersion.decision}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(fullAlternativeVoiceOutput, 'alternative-script')}
                          className="rounded-lg border border-amber-400/30 p-2 text-amber-100 hover:bg-amber-500/10"
                          title="Copiar variante alternativa"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(fullAlternativeVoiceOutput, 'guion-creovision-variante-alternativa.txt')}
                          className="rounded-lg border border-amber-400/30 p-2 text-amber-100 hover:bg-amber-500/10"
                          title="Descargar variante alternativa"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {alternativeVersion.labels?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {alternativeVersion.labels.map((label) => (
                          <span key={label} className="rounded-full bg-gray-950/70 px-2 py-1 text-xs text-gray-300">
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    {alternativeVersion.observations?.length > 0 && (
                      <div className="mt-4 rounded-lg bg-gray-950/60 p-3 text-xs leading-relaxed text-gray-400">
                        {alternativeVersion.observations.slice(0, 3).join(' ')}
                      </div>
                    )}

                    <div className="mt-4 space-y-4">
                      {alternativeVoiceChunks.map((chunk, index) => {
                        const copyKey = `alternative-chunk-${index}`;
                        return (
                          <div key={copyKey} className="rounded-xl border border-gray-700 bg-gray-950/70">
                            <div className="flex items-center justify-between gap-3 border-b border-gray-800 px-4 py-3">
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  Variante parte {index + 1} de {alternativeVoiceChunks.length}
                                </p>
                                <p className="text-xs text-gray-500">{chunk.length} caracteres aprox.</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(chunk, copyKey)}
                                className="rounded-lg border border-amber-400/30 p-2 text-amber-100 hover:bg-amber-500/10"
                                title={`Copiar variante parte ${index + 1}`}
                              >
                                {copiedChunk === copyKey ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                            <div className="creo-readable-text whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed text-gray-200">
                              {chunk}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-fuchsia-500/30 bg-gray-900/70 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Shorts/TikTok de descubrimiento</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {shortsQuantity} piezas verticales de {currentShortsDurationLabel}. Pipeline separado por capas, sin tocar los datos de YouTube.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {shortsPackage?.shorts?.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleDownload(fullShortsPackageOutput, 'shorts-tiktok-creovision.txt')}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-fuchsia-400/30 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition-colors hover:bg-fuchsia-500/10"
                        >
                          <Download className="h-4 w-4" />
                          Descargar todo
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleGenerateShortsPackage}
                        disabled={isGeneratingShortsPackage}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isGeneratingShortsPackage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {shortsPackage ? 'Regenerar Shorts/TikTok' : 'Generar Shorts/TikTok'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Fuente</span>
                      <select
                        value={shortsSource}
                        onChange={(event) => {
                          setShortsSource(event.target.value);
                          setShortsPackage(null);
                        }}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30"
                      >
                        <option value="winner">Guion ganador</option>
                        <option value="alternative" disabled={!alternativeVersion?.script}>Variante alternativa</option>
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Cantidad</span>
                      <select
                        value={shortsQuantity}
                        onChange={(event) => {
                          setShortsQuantity(Number(event.target.value));
                          setShortsPackage(null);
                        }}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30"
                      >
                        {shortsQuantityOptions.map((quantity) => (
                          <option key={quantity} value={quantity}>
                            {quantity} piezas
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Plataforma</span>
                      <select
                        value={shortsPlatform}
                        onChange={(event) => {
                          setShortsPlatform(event.target.value);
                          setShortsPackage(null);
                        }}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30"
                      >
                        {shortsPlatformOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Modo</span>
                      <select
                        value={shortsMode}
                        onChange={(event) => {
                          setShortsMode(event.target.value);
                          setShortsPackage(null);
                        }}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30"
                      >
                    {currentShortsModeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {shortsPackage?.meta?.layers?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {shortsPackage.meta.durationProfile?.label && (
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-100">
                          {shortsPackage.meta.durationProfile.label} ({shortsPackage.meta.durationProfile.range})
                        </span>
                      )}
                      {shortsPackage.meta.layers.map((layer) => (
                        <span key={layer} className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-1 text-xs text-fuchsia-100">
                          {layer.replaceAll('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}

                  {shortsPackage?.strategy && (
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                      {shortsPackage.strategy.positioning && (
                        <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-3">
                          <p className="text-xs font-semibold uppercase text-fuchsia-200/80">Posicionamiento</p>
                          <p className="mt-2 text-xs leading-relaxed text-gray-300">{shortsPackage.strategy.positioning}</p>
                        </div>
                      )}
                      {shortsPackage.strategy.conversionBridge && (
                        <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-3">
                          <p className="text-xs font-semibold uppercase text-fuchsia-200/80">CTA implicito</p>
                          <p className="mt-2 text-xs leading-relaxed text-gray-300">{shortsPackage.strategy.conversionBridge}</p>
                        </div>
                      )}
                      {shortsPackage.strategy.usageOrder?.length > 0 && (
                        <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-3">
                          <p className="text-xs font-semibold uppercase text-fuchsia-200/80">Orden sugerido</p>
                          <p className="mt-2 text-xs leading-relaxed text-gray-300">{shortsPackage.strategy.usageOrder.join(' / ')}</p>
                        </div>
                      )}
                      {shortsPackage.strategy.batchPlan && (
                        <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-3">
                          <p className="text-xs font-semibold uppercase text-fuchsia-200/80">Plan del lote</p>
                          <p className="mt-2 text-xs leading-relaxed text-gray-300">{shortsPackage.strategy.batchPlan}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {shortsPackage?.shorts?.length > 0 && (
                    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {shortsPackage.shorts.map((short, index) => (
                        <div key={short.id || `${short.title}-${index}`} className="rounded-xl border border-gray-700 bg-gray-950/65 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase text-fuchsia-200/80">
                                Pieza {index + 1} / {short.durationSeconds}s
                              </p>
                              <h4 className="mt-1 text-base font-bold text-white">{short.title}</h4>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {short.emotion && (
                                  <span className="rounded-full border border-fuchsia-400/30 px-2 py-1 text-xs text-fuchsia-100">
                                    {short.emotion}
                                  </span>
                                )}
                                {short.substyle && (
                                  <span className="rounded-full border border-cyan-400/30 px-2 py-1 text-xs text-cyan-100">
                                    {short.substyle.replaceAll('_', ' ')}
                                  </span>
                                )}
                                <span className="rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-300">
                                  {short.platformFit || 'Shorts/TikTok/Reels'}
                                </span>
                                {short.scores?.overall !== null && short.scores?.overall !== undefined && (
                                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-100">
                                    Premium {short.scores.overall}/100
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(formatShortForCopy(short), `short-${index}`)}
                              className="shrink-0 rounded-lg border border-fuchsia-400/30 p-2 text-fuchsia-100 hover:bg-fuchsia-500/10"
                              title={`Copiar short ${index + 1}`}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>

                          {short.hook && (
                            <p className="mt-4 rounded-lg bg-fuchsia-500/10 px-3 py-2 text-sm font-semibold text-fuchsia-100">
                              {short.hook}
                            </p>
                          )}

                          {short.scores && Object.values(short.scores).some((score) => score !== null && score !== undefined) && (
                            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-300 sm:grid-cols-5">
                              {short.scores.hook !== null && short.scores.hook !== undefined && (
                                <div className="rounded-lg bg-gray-900/80 px-2 py-1">Hook {short.scores.hook}</div>
                              )}
                              {short.scores.retention !== null && short.scores.retention !== undefined && (
                                <div className="rounded-lg bg-gray-900/80 px-2 py-1">Retencion {short.scores.retention}</div>
                              )}
                              {short.scores.curiosityGap !== null && short.scores.curiosityGap !== undefined && (
                                <div className="rounded-lg bg-gray-900/80 px-2 py-1">Curiosidad {short.scores.curiosityGap}</div>
                              )}
                              {short.scores.noSpoiler !== null && short.scores.noSpoiler !== undefined && (
                                <div className="rounded-lg bg-gray-900/80 px-2 py-1">No spoiler {short.scores.noSpoiler}</div>
                              )}
                              {short.scores.verticalClarity !== null && short.scores.verticalClarity !== undefined && (
                                <div className="rounded-lg bg-gray-900/80 px-2 py-1">Vertical {short.scores.verticalClarity}</div>
                              )}
                              {short.scores.moralConflict !== null && short.scores.moralConflict !== undefined && (
                                <div className="rounded-lg bg-gray-900/80 px-2 py-1">Moral {short.scores.moralConflict}</div>
                              )}
                              {short.scores.viral !== null && short.scores.viral !== undefined && (
                                <div className="rounded-lg bg-gray-900/80 px-2 py-1">Viral {short.scores.viral}</div>
                              )}
                              {short.scores.emotionalDamage !== null && short.scores.emotionalDamage !== undefined && (
                                <div className="rounded-lg bg-gray-900/80 px-2 py-1">Impacto {short.scores.emotionalDamage}</div>
                              )}
                            </div>
                          )}

                          {short.script && (
                            <div className="creo-readable-text mt-3 whitespace-pre-wrap rounded-lg bg-gray-900/80 p-3 font-mono text-sm leading-relaxed text-gray-200">
                              {short.script}
                            </div>
                          )}

                          <div className="mt-3 space-y-2 text-xs text-gray-400">
                            {short.biblicalReference?.book && (
                              <p>
                                <span className="text-gray-200">Referencia biblica:</span> {short.biblicalReference.book} {short.biblicalReference.chapter}:{short.biblicalReference.verse}
                              </p>
                            )}
                            {short.biblicalQuote && <p><span className="text-gray-200">Cita biblica:</span> {short.biblicalQuote}</p>}
                            {short.theologicalContext && <p><span className="text-gray-200">Contexto teologico:</span> {short.theologicalContext}</p>}
                            {short.moralConflict && <p><span className="text-gray-200">Conflicto moral:</span> {short.moralConflict}</p>}
                            {short.anomaly && <p><span className="text-gray-200">Anomalia:</span> {short.anomaly}</p>}
                            {short.escalation && <p><span className="text-gray-200">Escalada:</span> {short.escalation}</p>}
                            {short.memorablePhrase && <p><span className="text-gray-200">Frase memorable:</span> {short.memorablePhrase}</p>}
                            {short.mentalEcho && <p><span className="text-gray-200">Eco mental:</span> {short.mentalEcho}</p>}
                            {short.cutLine && <p><span className="text-gray-200">Corte:</span> {short.cutLine}</p>}
                            {short.finalQuestion && <p><span className="text-gray-200">Pregunta final:</span> {short.finalQuestion}</p>}
                            {short.hiddenQuestion && <p><span className="text-gray-200">Pregunta abierta:</span> {short.hiddenQuestion}</p>}
                            {short.visualDirection && <p><span className="text-gray-200">Visual:</span> {short.visualDirection}</p>}
                          </div>

                          {short.onScreenText?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {short.onScreenText.map((text, textIndex) => (
                                <span key={`${text}-${textIndex}`} className="rounded-full bg-gray-900 px-2 py-1 text-xs text-gray-300">
                                  {text}
                                </span>
                              ))}
                            </div>
                          )}

                          {short.hashtags?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {short.hashtags.map((tag) => (
                                <span key={tag} className="rounded-full border border-fuchsia-500/20 px-2 py-1 text-xs text-fuchsia-100">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {(short.whyItWorks || short.riskToAvoid) && (
                            <div className="mt-3 rounded-lg border border-gray-800 bg-gray-950/80 p-3 text-xs leading-relaxed text-gray-400">
                              {short.whyItWorks && <p><span className="text-gray-200">Por que funciona:</span> {short.whyItWorks}</p>}
                              {short.riskToAvoid && <p className="mt-1"><span className="text-gray-200">No revelar:</span> {short.riskToAvoid}</p>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {shortsPackage?.meta && (
                    <p className="mt-4 text-xs text-gray-500">
                      Pipeline: DeepSeek {shortsPackage.meta.deepseek}; OpenAI {shortsPackage.meta.openai}; {shortsPackage.meta.quantity || shortsPackage.shorts?.length || shortsQuantity} piezas; fuente {shortsPackage.meta.source || shortsSource}; plataforma {shortsPackage.meta.platform || shortsPlatform}.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-cyan-500/30 bg-gray-900/70 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Datos completos para YouTube</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        DeepSeek planifica SEO, titulos y miniatura; OpenAI lo refina si esta configurado.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePublishingPackage}
                      disabled={isGeneratingPublishingPackage}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isGeneratingPublishingPackage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      {publishingPackage ? 'Regenerar datos completos' : 'Generar datos completos'}
                    </button>
                  </div>

                  {publishingPackage && (
                    <div className="mt-5 space-y-4">
                      <div className="rounded-lg border border-cyan-500/20 bg-gray-950/60 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase text-cyan-200/80">Titulo recomendado</p>
                            <p className="mt-2 text-lg font-bold text-white">{publishingPackage.mainTitle}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(publishingPackage.mainTitle, 'publishing-title')}
                            className="rounded-lg border border-cyan-500/30 p-2 text-cyan-100 hover:bg-cyan-500/10"
                            title="Copiar titulo recomendado"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {publishingPackage.titleOptions?.length > 0 && (
                        <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-4">
                          <p className="mb-3 text-sm font-semibold text-white">Titulos virales con intencion</p>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            {publishingPackage.titleOptions.map((option, index) => (
                              <div key={`${option.title}-${index}`} className="rounded-lg bg-gray-900/80 p-3">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold text-gray-100">{option.title}</p>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(option.title, `publishing-title-${index}`)}
                                    className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                                    title={`Copiar titulo ${index + 1}`}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <p className="mt-2 text-xs text-cyan-200">Intencion: {option.intent || 'CTR + SEO'}</p>
                                {option.why && <p className="mt-1 text-xs text-gray-400">{option.why}</p>}
                                {option.seoKeyword && <p className="mt-1 text-xs text-gray-500">Keyword: {option.seoKeyword}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">Descripcion optimizada con SEO</p>
                            {publishingPackage.youtubeDescription?.shortHook && (
                              <p className="mt-1 text-xs text-cyan-200">{publishingPackage.youtubeDescription.shortHook}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(publishingPackage.youtubeDescription?.description || '', 'publishing-description')}
                            className="rounded-lg border border-cyan-500/30 p-2 text-cyan-100 hover:bg-cyan-500/10"
                            title="Copiar descripcion"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-900/80 p-3 text-sm leading-relaxed text-gray-200">
                          {publishingPackage.youtubeDescription?.description}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {publishingPackage.youtubeDescription?.hashtags?.map((tag) => (
                            <span key={tag} className="rounded-full border border-cyan-500/20 px-2 py-1 text-xs text-cyan-100">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-lg border border-pink-500/25 bg-gray-950/60 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">Miniatura e imagen</p>
                            <button
                              type="button"
                              onClick={() => handleCopy(publishingPackage.thumbnail?.imagePrompt || '', 'publishing-thumbnail-prompt')}
                              className="rounded-lg border border-pink-500/30 p-2 text-pink-100 hover:bg-pink-500/10"
                              title="Copiar prompt de miniatura"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-3 text-sm text-gray-200">{publishingPackage.thumbnail?.concept}</p>
                          <p className="mt-3 rounded-lg bg-gray-900/80 p-3 text-xs leading-relaxed text-gray-300">
                            {publishingPackage.thumbnail?.imagePrompt}
                          </p>
                          <div className="mt-3 space-y-2 text-xs text-gray-400">
                            <p><span className="text-gray-200">Composicion:</span> {publishingPackage.thumbnail?.composition}</p>
                            <p><span className="text-gray-200">Texto:</span> {publishingPackage.thumbnail?.textOverlay}</p>
                            <p><span className="text-gray-200">Fuente:</span> {publishingPackage.thumbnail?.fontStyle}</p>
                          </div>
                          {publishingPackage.thumbnail?.colorPalette?.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {publishingPackage.thumbnail.colorPalette.map((color, index) => (
                                <div key={`${color.hex}-${index}`} className="flex items-center gap-2 rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300">
                                  <span
                                    className="h-4 w-4 rounded border border-white/20"
                                    style={{ backgroundColor: color.hex || '#111827' }}
                                  />
                                  <span>{color.name || color.hex}</span>
                                  <span className="text-gray-500">{color.hex}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="rounded-lg border border-purple-500/25 bg-gray-950/60 p-4">
                          <p className="text-sm font-semibold text-white">Estrategia de publicacion</p>
                          <div className="mt-3 space-y-3 text-sm text-gray-300">
                            {publishingPackage.publishingStrategy?.retentionAngle && (
                              <p><span className="text-purple-200">Retencion:</span> {publishingPackage.publishingStrategy.retentionAngle}</p>
                            )}
                            {publishingPackage.publishingStrategy?.audiencePromise && (
                              <p><span className="text-purple-200">Promesa:</span> {publishingPackage.publishingStrategy.audiencePromise}</p>
                            )}
                            {publishingPackage.publishingStrategy?.pinnedComment && (
                              <div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-purple-200">Comentario fijado</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(publishingPackage.publishingStrategy.pinnedComment, 'publishing-pinned-comment')}
                                    className="rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
                                    title="Copiar comentario fijado"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                                <p className="mt-1 rounded-lg bg-gray-900/80 p-3 text-xs leading-relaxed text-gray-300">
                                  {publishingPackage.publishingStrategy.pinnedComment}
                                </p>
                              </div>
                            )}
                            {publishingPackage.publishingStrategy?.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {publishingPackage.publishingStrategy.tags.map((tag) => (
                                  <span key={tag} className="rounded-full border border-purple-500/20 px-2 py-1 text-xs text-purple-100">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {publishingPackage.meta && (
                        <p className="text-xs text-gray-500">
                          Pipeline: DeepSeek {publishingPackage.meta.deepseek}; OpenAI {publishingPackage.meta.openai}.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {ctaCierre && (
                  <div className="rounded-xl border border-red-500/30 bg-gray-900/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white">CTA cierre separado</h3>
                        <p className="mt-1 text-xs text-gray-400">
                          Este cierre no se mezcla con el relato limpio. Copialo solo si quieres usarlo como epilogo del canal.
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(ctaCierre, 'cta-cierre')}
                        className="rounded-lg border border-red-500/30 p-2 text-red-100 hover:bg-red-500/10"
                        title="Copiar CTA cierre"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-950/70 p-4 font-mono text-sm leading-relaxed text-gray-200">
                      {ctaCierre}
                    </div>
                  </div>
                )}

                {qualityReport && (
                  <div className="rounded-xl border border-purple-500/30 bg-gray-900/70 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-bold text-white">Control de calidad interno</h3>
                      <span className={`text-sm font-semibold ${qualityReport.score >= 85 ? 'text-green-300' : 'text-amber-300'}`}>
                        {qualityReport.score}/100
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {qualityReport.checklist?.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 rounded-lg bg-gray-950/50 px-3 py-2 text-xs text-gray-300">
                          <span className={item.passed ? 'text-green-300' : 'text-amber-300'}>
                            {item.passed ? 'OK' : 'REV'}
                          </span>
                          <span>{item.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {impactReport && (
                  <div className="rounded-xl border border-pink-500/30 bg-gray-900/70 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-bold text-white">Impacto narrativo</h3>
                      <span className={`text-sm font-semibold ${impactReport.score >= 80 ? 'text-green-300' : 'text-amber-300'}`}>
                        {impactReport.score}/100
                      </span>
                    </div>
                    {impactReport.memorableLine && (
                      <p className="mt-3 rounded-lg bg-gray-950/50 px-3 py-2 text-xs text-gray-300">
                        Frase memorable: {impactReport.memorableLine}
                      </p>
                    )}
                    {impactReport.clipMoment && (
                      <p className="mt-2 rounded-lg bg-gray-950/50 px-3 py-2 text-xs text-gray-300">
                        Momento recortable: {impactReport.clipMoment}
                      </p>
                    )}
                  </div>
                )}

                {finalScoreReport && (
                  <div className="rounded-xl border border-emerald-500/30 bg-gray-900/70 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-lg font-bold text-white">Decisión editorial final</h3>
                      <span className={`text-sm font-semibold ${
                        finalScoreReport.decision === 'usable'
                          ? 'text-green-300'
                          : finalScoreReport.decision === 'necesita_pulido'
                            ? 'text-amber-300'
                            : 'text-red-300'
                      }`}>
                        {finalScoreReport.decision} - {finalScoreReport.score_final}/100
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-300">
                      <div className="rounded-lg bg-gray-950/50 px-3 py-2">Cumplimiento: {finalScoreReport.cumplimiento_parametros}/100</div>
                      <div className="rounded-lg bg-gray-950/50 px-3 py-2">Retencion: {finalScoreReport.retencion_youtube}/100</div>
                      <div className="rounded-lg bg-gray-950/50 px-3 py-2">Inmersion: {finalScoreReport.inmersion_humana ?? 'N/D'}/100</div>
                      <div className="rounded-lg bg-gray-950/50 px-3 py-2">Competitividad: {finalScoreReport.competitividad_youtube ?? 'N/D'}/100</div>
                      <div className="rounded-lg bg-gray-950/50 px-3 py-2">Originalidad: {finalScoreReport.originalidad}/100</div>
                      <div className="rounded-lg bg-gray-950/50 px-3 py-2">Riesgo: {finalScoreReport.riesgo_de_fallo}/100</div>
                    </div>
                    {finalScoreReport.observaciones?.length > 0 && (
                      <div className="mt-3 rounded-lg bg-gray-950/50 px-3 py-2 text-xs text-gray-300">
                        {finalScoreReport.observaciones.slice(0, 3).join(' ')}
                      </div>
                    )}
                  </div>
                )}

                {/* Botón para generar otro */}
                <button
                  onClick={() => {
                    setGeneratedContent(null);
                    setQualityReport(null);
                    setImpactReport(null);
                    setFinalScoreReport(null);
                    setGenerationMeta(null);
                    setCtaCierre('');
                    setScriptFeedback(null);
                    setScriptFeedbackNote('');
                    setPublishingPackage(null);
                    setShortsPackage(null);
                    setCopiedScript(false);
                    setCopiedChunk(null);
                    setShowAlternativeVersion(false);
                  }}
                  className="w-full px-6 py-3 text-white transition-all border border-purple-500 rounded-lg hover:bg-purple-500/10"
                >
                  Generar otro guion
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ViralScriptGeneratorModal;
