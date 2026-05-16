import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Download, Film, Loader2, Sparkles, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { generateStandaloneShortsPackage } from '@/services/ai/shortsPackageService';
import { saveGeneratedContentHistory } from '@/services/generatedContentHistoryService';

const contentOptions = [
  { value: 'terror', label: 'Terror' },
  { value: 'suspenso', label: 'Suspenso' },
  { value: 'true_crime', label: 'True Crime' },
  { value: 'ciencia_ficcion', label: 'Ciencia Ficcion' },
  { value: 'religion', label: 'Religion' }
];

const styleOptions = [
  { value: 'historia_real', label: 'Historia real' },
  { value: 'testimonio_oyente', label: 'Testimonio de oyente' },
  { value: 'expediente_narrado', label: 'Expediente narrado' },
  { value: 'analog_horror', label: 'Analog horror' },
  { value: 'creepypasta', label: 'Creepypasta' }
];
const religionStyleOptions = [
  { value: 'critica_acida', label: 'Critica acida' },
  { value: 'denuncia_moral', label: 'Denuncia moral' },
  { value: 'profecia_bajo_juicio', label: 'Profecia bajo juicio' },
  { value: 'raciocinio_humano', label: 'Raciocinio humano' },
  { value: 'justicia_contra_dogma', label: 'Justicia contra dogma' }
];

const quantityOptions = [5, 10, 15, 20];
const platformOptions = [
  { value: 'mixto', label: 'Mixto' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'reels', label: 'Reels' }
];
const modeOptions = [
  { value: 'terror_psicologico', label: 'Terror psicologico' },
  { value: 'viral_agresivo', label: 'Viral agresivo' },
  { value: 'analog_horror', label: 'Analog horror' },
  { value: 'testimonio_real', label: 'Testimonio real' },
  { value: 'misterio_lento', label: 'Misterio lento' }
];
const religionModeOptions = [
  { value: 'auto_religion_duration', label: 'Auto critico (20-150s segun tema)' },
  { value: 'micro_short', label: 'Micro short (20-35s)' },
  { value: 'short_estandar', label: 'Short estandar (45-70s)' },
  { value: 'deep_short', label: 'Deep short (80-150s)' }
];
const generationModeOptions = [
  { value: 'rapido', label: 'Rapido' },
  { value: 'pro', label: 'Pro' },
  { value: 'obsesivo', label: 'Obsesivo' }
];

const formatShortForCopy = (short) => [
  short.title,
  short.emotion ? `Emocion: ${short.emotion}` : '',
  short.durationSeconds ? `Duracion: ${short.durationSeconds}s` : '',
  short.substyle ? `Subestilo: ${short.substyle}` : '',
  short.hook ? `Hook: ${short.hook}` : '',
  short.moralConflict ? `Conflicto moral: ${short.moralConflict}` : '',
  short.script,
  short.memorablePhrase ? `Frase memorable: ${short.memorablePhrase}` : '',
  short.mentalEcho ? `Eco mental: ${short.mentalEcho}` : '',
  short.cutLine ? `Corte: ${short.cutLine}` : '',
  short.finalQuestion ? `Pregunta final: ${short.finalQuestion}` : '',
  short.hiddenQuestion ? `Pregunta abierta: ${short.hiddenQuestion}` : '',
  short.scores?.overall ? `Score premium: ${short.scores.overall}/100` : '',
  short.visualDirection ? `Visual: ${short.visualDirection}` : '',
  short.onScreenText?.length ? `Texto en pantalla: ${short.onScreenText.join(' / ')}` : '',
  short.hashtags?.length ? short.hashtags.join(' ') : ''
].filter(Boolean).join('\n\n');

const ShortsScriptGeneratorModal = ({ open, onOpenChange, userPersonality = null }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [theme, setTheme] = useState('terror');
  const [style, setStyle] = useState('historia_real');
  const [topic, setTopic] = useState('');
  const [detailsExtra, setDetailsExtra] = useState('');
  const [channelName, setChannelName] = useState(userPersonality?.channelName || 'Expedientes Hades');
  const [narrativeYear, setNarrativeYear] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [platform, setPlatform] = useState('mixto');
  const [mode, setMode] = useState('terror_psicologico');
  const [generationMode, setGenerationMode] = useState('pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [shortsPackage, setShortsPackage] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const currentStyleOptions = theme === 'religion' ? religionStyleOptions : styleOptions;
  const currentModeOptions = theme === 'religion' ? religionModeOptions : modeOptions;
  const currentDurationLabel = theme === 'religion'
    ? '20-150 segundos segun modo religioso'
    : '45-70 segundos';
  const currentDurationStorage = theme === 'religion'
    ? 'religion_shorts_20_150s'
    : 'shorts_45_70s';

  const fullOutput = useMemo(() => {
    if (!shortsPackage?.shorts?.length) return '';
    return shortsPackage.shorts.map(formatShortForCopy).join('\n\n---\n\n');
  }, [shortsPackage]);

  useEffect(() => {
    if (theme === 'religion') {
      if (!religionStyleOptions.some((option) => option.value === style)) {
        setStyle('critica_acida');
      }
      if (!religionModeOptions.some((option) => option.value === mode)) {
        setMode('auto_religion_duration');
      }
      return;
    }

    if (!styleOptions.some((option) => option.value === style)) {
      setStyle('historia_real');
    }
    if (!modeOptions.some((option) => option.value === mode)) {
      setMode('terror_psicologico');
    }
  }, [theme, style, mode]);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
      toast({ title: 'Copiado', description: 'Contenido copiado al portapapeles' });
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
    toast({ title: 'Descargado', description: 'Archivo guardado exitosamente' });
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Falta el tema',
        description: 'Escribe una idea base para generar el lote de Shorts.',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Debes iniciar sesion',
        description: 'Necesitas una cuenta para generar guiones Short.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateStandaloneShortsPackage({
        topic,
        theme,
        style,
        detailsExtra,
        channelName,
        narrativeYear,
        quantity,
        platform,
        mode,
        generationMode
      });

      setShortsPackage(result);

      await saveGeneratedContentHistory({
        userId: user.id,
        contentType: 'shorts_script',
        topic,
        theme,
        style,
        duration: currentDurationStorage,
        narrativeYear,
        platform,
        content: result,
        metadata: {
          channelName,
          detailsExtra,
          quantity,
          mode,
          generationMode,
          packageMeta: result.meta || null
        }
      });

      toast({
        title: 'Guiones Short generados',
        description: `Tienes ${result.shorts?.length || quantity} piezas independientes listas para voz.`
      });
    } catch (error) {
      console.error('No se pudo generar el lote independiente de Shorts:', error);
      toast({
        title: 'No se pudieron generar los Shorts',
        description: error.message || 'Intenta nuevamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="creo-paint-isolated relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-fuchsia-500/30 bg-[#0d1220] shadow-xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-fuchsia-500/30 bg-[#111827] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-fuchsia-600 to-rose-600 p-2 shadow-lg shadow-fuchsia-900/40">
                <Film className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Generador de Guiones Short</h2>
                <p className="text-sm text-gray-400">Lotes independientes para Shorts, TikTok y Reels</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="creo-fast-scroll max-h-[calc(90vh-88px)] overflow-y-auto bg-slate-950/35 p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
              <div className="space-y-4">
                <div className="rounded-xl border border-fuchsia-500/25 bg-gray-900/70 p-4">
                  <p className="text-sm font-semibold text-white">Configurar lote</p>
                  <p className="mt-1 text-xs text-gray-400">
                    No necesita guion largo. Crea piezas nuevas desde el tema.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Tematica</span>
                      <select
                        value={theme}
                        onChange={(event) => setTheme(event.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400"
                      >
                        {contentOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Estilo</span>
                      <select
                        value={style}
                        onChange={(event) => setStyle(event.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400"
                      >
                        {currentStyleOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Cantidad</span>
                      <select
                        value={quantity}
                        onChange={(event) => {
                          setQuantity(Number(event.target.value));
                          setShortsPackage(null);
                        }}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400"
                      >
                        {quantityOptions.map((item) => (
                          <option key={item} value={item}>{item} piezas</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Plataforma</span>
                      <select
                        value={platform}
                        onChange={(event) => {
                          setPlatform(event.target.value);
                          setShortsPackage(null);
                        }}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400"
                      >
                        {platformOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Modo</span>
                      <select
                        value={mode}
                        onChange={(event) => {
                          setMode(event.target.value);
                          setShortsPackage(null);
                        }}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400"
                      >
                        {currentModeOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-xs font-semibold text-gray-300">Pipeline</span>
                      <select
                        value={generationMode}
                        onChange={(event) => setGenerationMode(event.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400"
                      >
                        {generationModeOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block space-y-1.5">
                    <span className="text-xs font-semibold text-gray-300">Canal</span>
                    <input
                      value={channelName}
                      onChange={(event) => setChannelName(event.target.value.slice(0, 80))}
                      className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400"
                    />
                  </label>

                  <label className="mt-4 block space-y-1.5">
                    <span className="text-xs font-semibold text-gray-300">Ano narrativo</span>
                    <input
                      inputMode="numeric"
                      value={narrativeYear}
                      onChange={(event) => setNarrativeYear(event.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                      placeholder="Ej: 1989"
                      className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-fuchsia-400"
                    />
                  </label>

                  <label className="mt-4 block space-y-1.5">
                    <span className="text-xs font-semibold text-gray-300">Tema base *</span>
                    <textarea
                      value={topic}
                      onChange={(event) => setTopic(event.target.value.slice(0, 900))}
                      rows={4}
                      placeholder="Ej: objetos malditos encontrados en casas abandonadas, cintas viejas, carreteras vacias, llamadas desde radios sin corriente..."
                      className="w-full resize-none rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-fuchsia-400"
                    />
                  </label>

                  <label className="mt-4 block space-y-1.5">
                    <span className="text-xs font-semibold text-gray-300">Detalles extra</span>
                    <textarea
                      value={detailsExtra}
                      onChange={(event) => setDetailsExtra(event.target.value.slice(0, 1200))}
                      rows={4}
                      placeholder="Ej: Que todos tengan sensacion de archivo real, sin monstruos explicitos, con finales abiertos y objetos cotidianos."
                      className="w-full resize-none rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-fuchsia-400"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {shortsPackage ? 'Regenerar lote Short' : 'Generar lote Short'}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Resultado</h3>
                      <p className="text-sm text-gray-400">
                        Guiones limpios de {currentDurationLabel}, listos para voz y edicion vertical.
                      </p>
                    </div>
                    {shortsPackage?.shorts?.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(fullOutput, 'all')}
                          className="rounded-lg border border-fuchsia-400/30 p-2 text-fuchsia-100 hover:bg-fuchsia-500/10"
                          title="Copiar todo"
                        >
                          {copiedKey === 'all' ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(fullOutput, 'guiones-short-creovision.txt')}
                          className="rounded-lg border border-fuchsia-400/30 p-2 text-fuchsia-100 hover:bg-fuchsia-500/10"
                          title="Descargar todo"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!shortsPackage && (
                    <div className="mt-5 rounded-lg border border-dashed border-gray-700 bg-gray-950/50 p-6 text-sm text-gray-400">
                      Completa el tema y genera un lote. Este flujo no usa guion largo ni el paquete de YouTube.
                    </div>
                  )}

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
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {shortsPackage.strategy.positioning && (
                        <div className="rounded-lg border border-gray-700 bg-gray-950/60 p-3">
                          <p className="text-xs font-semibold uppercase text-fuchsia-200/80">Posicionamiento</p>
                          <p className="mt-2 text-xs leading-relaxed text-gray-300">{shortsPackage.strategy.positioning}</p>
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
                </div>

                {shortsPackage?.shorts?.map((short, index) => (
                  <div key={short.id || `${short.title}-${index}`} className="rounded-xl border border-gray-700 bg-gray-950/70 p-4">
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
                        {copiedKey === `short-${index}` ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    {short.hook && (
                      <p className="mt-4 rounded-lg bg-fuchsia-500/10 px-3 py-2 text-sm font-semibold text-fuchsia-100">
                        {short.hook}
                      </p>
                    )}

                    <div className="creo-readable-text mt-3 whitespace-pre-wrap rounded-lg bg-gray-900/80 p-3 font-mono text-sm leading-relaxed text-gray-200">
                      {short.script}
                    </div>

                    {short.scores && Object.values(short.scores).some((score) => score !== null && score !== undefined) && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-300 sm:grid-cols-5">
                        {short.scores.hook !== null && short.scores.hook !== undefined && <div className="rounded-lg bg-gray-900/80 px-2 py-1">Hook {short.scores.hook}</div>}
                        {short.scores.retention !== null && short.scores.retention !== undefined && <div className="rounded-lg bg-gray-900/80 px-2 py-1">Retencion {short.scores.retention}</div>}
                        {short.scores.curiosityGap !== null && short.scores.curiosityGap !== undefined && <div className="rounded-lg bg-gray-900/80 px-2 py-1">Curiosidad {short.scores.curiosityGap}</div>}
                        {short.scores.noSpoiler !== null && short.scores.noSpoiler !== undefined && <div className="rounded-lg bg-gray-900/80 px-2 py-1">No spoiler {short.scores.noSpoiler}</div>}
                        {short.scores.verticalClarity !== null && short.scores.verticalClarity !== undefined && <div className="rounded-lg bg-gray-900/80 px-2 py-1">Vertical {short.scores.verticalClarity}</div>}
                        {short.scores.moralConflict !== null && short.scores.moralConflict !== undefined && <div className="rounded-lg bg-gray-900/80 px-2 py-1">Moral {short.scores.moralConflict}</div>}
                        {short.scores.viral !== null && short.scores.viral !== undefined && <div className="rounded-lg bg-gray-900/80 px-2 py-1">Viral {short.scores.viral}</div>}
                        {short.scores.emotionalDamage !== null && short.scores.emotionalDamage !== undefined && <div className="rounded-lg bg-gray-900/80 px-2 py-1">Impacto {short.scores.emotionalDamage}</div>}
                      </div>
                    )}

                    <div className="mt-3 space-y-2 text-xs text-gray-400">
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
                  </div>
                ))}

                {shortsPackage?.meta && (
                  <p className="text-xs text-gray-500">
                    Pipeline: DeepSeek {shortsPackage.meta.deepseek}; OpenAI {shortsPackage.meta.openai}; fuente {shortsPackage.meta.source}; plataforma {shortsPackage.meta.platform}.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShortsScriptGeneratorModal;
