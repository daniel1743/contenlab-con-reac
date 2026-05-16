import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Check, Copy, Download, ExternalLink, Loader2, Search, Sparkles, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { runYouTubeCreativeResearch } from '@/services/ai/youtubeCreativeResearchService';
import { saveGeneratedContentHistory } from '@/services/generatedContentHistoryService';

const regionOptions = [
  { value: 'US', label: 'US' },
  { value: 'MX', label: 'MX' },
  { value: 'ES', label: 'ES' },
  { value: 'AR', label: 'AR' },
  { value: 'CL', label: 'CL' },
  { value: 'CO', label: 'CO' }
];

const languageOptions = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Ingles' },
  { value: 'pt', label: 'Portugues' }
];

const formatNumber = (value) => Number(value || 0).toLocaleString('es-ES');

const formatResearchForCopy = (result) => {
  if (!result) return '';
  const analysis = result.analysis || {};

  return [
    `Tematica: ${result.topic}`,
    `Resumen:\n${analysis.executiveSummary || ''}`,
    `Patrones virales:\n${(analysis.viralPatterns || []).map((item) => `- ${item}`).join('\n')}`,
    `Patrones no tan virales:\n${(analysis.nonViralPatterns || []).map((item) => `- ${item}`).join('\n')}`,
    `Errores a evitar:\n${(analysis.avoidMistakes || []).map((item) => `- ${item}`).join('\n')}`,
    `Ideas nuevas:\n${(analysis.newIdeas || []).map((item) => `- ${item.title}: ${item.hook}`).join('\n')}`,
    `Proximo video recomendado:\n${analysis.recommendedNextVideo?.title || ''}\n${analysis.recommendedNextVideo?.openingHook || ''}`
  ].filter(Boolean).join('\n\n');
};

const InsightList = ({ title, items, tone = 'purple' }) => {
  if (!items?.length) return null;

  const toneClass = {
    purple: 'border-purple-500/25 text-purple-100',
    green: 'border-emerald-500/25 text-emerald-100',
    amber: 'border-amber-500/25 text-amber-100',
    cyan: 'border-cyan-500/25 text-cyan-100'
  }[tone] || 'border-purple-500/25 text-purple-100';

  return (
    <div className={`rounded-xl border ${toneClass} bg-gray-950/60 p-4`}>
      <p className="text-sm font-bold text-white">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <p key={`${item}-${index}`} className="text-sm leading-relaxed text-gray-300">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
};

const VideoCard = ({ video }) => (
  <div className="rounded-xl border border-gray-700 bg-gray-950/70 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${
          video.group === 'viral' ? 'bg-emerald-500/15 text-emerald-100' : 'bg-amber-500/15 text-amber-100'
        }`}>
          {video.group === 'viral' ? 'Viral' : 'Bueno no viral'}
        </span>
        <h4 className="mt-2 text-sm font-bold leading-snug text-white">{video.title}</h4>
        <p className="mt-1 text-xs text-gray-500">{video.channelTitle}</p>
      </div>
      <a
        href={video.url}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-lg border border-gray-700 p-2 text-gray-300 hover:bg-gray-800 hover:text-white"
        title="Abrir en YouTube"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-300 sm:grid-cols-4">
      <div className="rounded-lg bg-gray-900 px-2 py-1">{formatNumber(video.views)} vistas</div>
      <div className="rounded-lg bg-gray-900 px-2 py-1">{formatNumber(video.likes)} likes</div>
      <div className="rounded-lg bg-gray-900 px-2 py-1">{formatNumber(video.comments)} comentarios</div>
      <div className="rounded-lg bg-gray-900 px-2 py-1">{video.engagementRate}% eng.</div>
    </div>
  </div>
);

const YouTubeCreativeResearchModal = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [regionCode, setRegionCode] = useState('US');
  const [language, setLanguage] = useState('es');
  const [commentsPerVideo, setCommentsPerVideo] = useState(20);
  const [isResearching, setIsResearching] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyText = useMemo(() => formatResearchForCopy(result), [result]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast({ title: 'Copiado', description: 'Investigacion copiada al portapapeles' });
    } catch (error) {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar el contenido',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([copyText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investigacion-creativa-youtube.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Descargado', description: 'Archivo guardado exitosamente' });
  };

  const handleResearch = async () => {
    if (!topic.trim()) {
      toast({
        title: 'Falta la tematica',
        description: 'Escribe una tematica para buscar y analizar videos.',
        variant: 'destructive'
      });
      return;
    }

    setIsResearching(true);

    try {
      const research = await runYouTubeCreativeResearch({
        topic,
        regionCode,
        language,
        commentsPerVideo
      });

      setResult(research);

      if (user?.id) {
        await saveGeneratedContentHistory({
          userId: user.id,
          contentType: 'youtube_creative_research',
          topic,
          theme: 'research',
          style: 'youtube_strategy',
          duration: '10_videos',
          platform: 'youtube',
          content: research,
          metadata: {
            regionCode,
            language,
            commentsPerVideo,
            meta: research.meta || null
          }
        });
      }

      toast({
        title: 'Investigacion completada',
        description: 'Se analizaron videos virales y buenos no virales para tu tematica.'
      });
    } catch (error) {
      console.error('No se pudo completar la investigacion creativa:', error);
      toast({
        title: 'No se pudo investigar',
        description: error.message || 'Intenta con otra tematica.',
        variant: 'destructive'
      });
    } finally {
      setIsResearching(false);
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
          className="creo-paint-isolated relative max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0d1220] shadow-xl"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cyan-500/30 bg-[#111827] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-cyan-600 to-blue-600 p-2 shadow-lg shadow-cyan-900/40">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Investigador Creativo YouTube</h2>
                <p className="text-sm text-gray-400">Compara 5 virales contra 5 buenos no virales</p>
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
            <div className="rounded-xl border border-cyan-500/25 bg-gray-900/70 p-4">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_120px_140px_160px]">
                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-300">Tematica de busqueda</span>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="Ej: historias de terror reales de llamadas telefonicas"
                      className="w-full rounded-lg border border-gray-700 bg-gray-950/70 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-cyan-400"
                    />
                  </div>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-300">Region</span>
                  <select
                    value={regionCode}
                    onChange={(event) => setRegionCode(event.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-cyan-400"
                  >
                    {regionOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-300">Idioma</span>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-cyan-400"
                  >
                    {languageOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-semibold text-gray-300">Comentarios/video</span>
                  <select
                    value={commentsPerVideo}
                    onChange={(event) => setCommentsPerVideo(Number(event.target.value))}
                    className="w-full rounded-lg border border-gray-700 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-cyan-400"
                  >
                    {[0, 10, 20, 40].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-relaxed text-gray-500">
                  YouTube API entrega metadatos y comentarios. Transcripts/subtitulos no estan garantizados con API key publica.
                </p>
                <button
                  type="button"
                  onClick={handleResearch}
                  disabled={isResearching || !topic.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Investigar 10 videos
                </button>
              </div>
            </div>

            {!result ? (
              <div className="mt-6 rounded-xl border border-dashed border-gray-700 bg-gray-950/50 p-6 text-sm text-gray-400">
                El reporte mostrara videos analizados, patrones virales, errores de los no virales, ideas nuevas y una estructura recomendada para tu proximo video.
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-cyan-200/80">Resumen ejecutivo</p>
                      <h3 className="mt-1 text-xl font-bold text-white">{result.topic}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-300">{result.analysis.executiveSummary}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="rounded-lg border border-cyan-400/30 p-2 text-cyan-100 hover:bg-cyan-500/10"
                        title="Copiar reporte"
                      >
                        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="rounded-lg border border-cyan-400/30 p-2 text-cyan-100 hover:bg-cyan-500/10"
                        title="Descargar reporte"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {result.meta?.layers?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {result.meta.layers.map((layer) => (
                        <span key={layer} className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-100">
                          {layer.replaceAll('_', ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <InsightList title="Lo que tienen en comun los virales" items={result.analysis.viralPatterns} tone="green" />
                  <InsightList title="Lo que debilita a los buenos no virales" items={result.analysis.nonViralPatterns} tone="amber" />
                  <InsightList title="Errores a evitar" items={result.analysis.avoidMistakes} tone="amber" />
                  <InsightList title="Patrones para copiar estrategicamente" items={result.analysis.copyStrategically} tone="cyan" />
                </div>

                <InsightList title="Señales de audiencia" items={result.analysis.audienceSignals} tone="purple" />

                {result.analysis.recommendedNextVideo?.title && (
                  <div className="rounded-xl border border-emerald-500/30 bg-gray-900/70 p-5">
                    <p className="text-xs font-semibold uppercase text-emerald-200/80">Proximo video recomendado</p>
                    <h3 className="mt-2 text-lg font-bold text-white">{result.analysis.recommendedNextVideo.title}</h3>
                    <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-100">
                      {result.analysis.recommendedNextVideo.openingHook}
                    </p>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-lg bg-gray-950/70 p-3">
                        <p className="text-xs font-semibold text-gray-200">Estructura</p>
                        <div className="mt-2 space-y-1 text-xs text-gray-400">
                          {result.analysis.recommendedNextVideo.structure?.map((item, index) => (
                            <p key={`${item}-${index}`}>{item}</p>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-lg bg-gray-950/70 p-3">
                        <p className="text-xs font-semibold text-gray-200">Miniatura y retencion</p>
                        <p className="mt-2 text-xs text-gray-400">{result.analysis.recommendedNextVideo.thumbnailConcept}</p>
                        <div className="mt-2 space-y-1 text-xs text-gray-400">
                          {result.analysis.recommendedNextVideo.retentionRules?.map((item, index) => (
                            <p key={`${item}-${index}`}>{item}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.analysis.newIdeas?.length > 0 && (
                  <div className="rounded-xl border border-purple-500/25 bg-gray-900/70 p-5">
                    <p className="text-sm font-bold text-white">Ideas nuevas para tus videos</p>
                    <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {result.analysis.newIdeas.map((idea, index) => (
                        <div key={`${idea.title}-${index}`} className="rounded-xl border border-gray-700 bg-gray-950/70 p-4">
                          <p className="text-xs font-semibold uppercase text-purple-200/80">Idea {index + 1}</p>
                          <h4 className="mt-1 text-base font-bold text-white">{idea.title}</h4>
                          {idea.hook && <p className="mt-3 rounded-lg bg-purple-500/10 px-3 py-2 text-sm text-purple-100">{idea.hook}</p>}
                          <p className="mt-3 text-xs text-gray-400">{idea.angle}</p>
                          <p className="mt-2 text-xs text-gray-500">{idea.whyItCanWork}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-gray-700 bg-gray-900/70 p-5">
                  <p className="text-sm font-bold text-white">Videos seleccionados</p>
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {result.videos.map((video) => (
                      <VideoCard key={video.videoId} video={video} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default YouTubeCreativeResearchModal;
