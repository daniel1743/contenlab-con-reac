import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaperAirplaneIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { generateSeoCoachMessage } from '@/services/geminiService';
import { useToast } from '@/components/ui/use-toast';

const MAX_ASSISTANT_REPLIES = 10;

const formatMessageHtml = (content) => {
  if (!content) return '';
  const escaped = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.*)$/gm, '• $1')
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
};

const CoachMessage = ({ role, content }) => {
  const isAssistant = role === 'assistant';
  return (
    <div
      className={`max-w-[92%] sm:max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border ${
        isAssistant
          ? 'bg-purple-600/25 border-purple-400/40 text-purple-50'
          : 'bg-cyan-500/25 border-cyan-300/30 text-cyan-50 sm:ml-auto'
      }`}
    >
      <div
        className="prose prose-invert text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatMessageHtml(content) }}
      />
    </div>
  );
};

const SEOCoachModal = ({ open, onOpenChange, context }) => {
  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [error, setError] = useState(null);
  const [sessionEnded, setSessionEnded] = useState(false);
  const scrollRef = useRef(null);
  const { toast } = useToast();

  const tags = useMemo(() => {
    if (!context?.tags) return [];
    return Array.from(
      new Set(
        context.tags
          .filter(Boolean)
          .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
          .filter(Boolean)
      )
    ).slice(0, 6);
  }, [context]);

  useEffect(() => {
    if (open && context) {
      setMessages([]);
      setUserMessage('');
      setError(null);
      setSessionEnded(false);
      setIsBootstrapping(true);

      generateSeoCoachMessage(context, [])
        .then((response) => {
          const initialMessages = [{ role: 'assistant', content: response }];
          setMessages(initialMessages);
          if (1 >= MAX_ASSISTANT_REPLIES) {
            setSessionEnded(true);
          }
        })
        .catch((err) => {
          console.error('Error inicializando SEO Coach:', err);
          setError('No pudimos iniciar la sesión con el coach. Intenta nuevamente.');
        })
        .finally(() => setIsBootstrapping(false));
    } else if (!open) {
      setMessages([]);
      setUserMessage('');
      setError(null);
      setIsBootstrapping(false);
      setIsLoading(false);
      setSessionEnded(false);
    }
  }, [open, context]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isBootstrapping]);

  const sendMessage = async () => {
    const trimmed = userMessage.trim();
    if (!trimmed || !context) return;

    if (sessionEnded) {
      toast({
        title: 'Sesión finalizada',
        description: 'El coach ya cerró esta conversación. Inicia una nueva sesión para continuar.',
      });
      return;
    }

    const updatedMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(updatedMessages);
    setUserMessage('');
    setError(null);
    setIsLoading(true);

    try {
      const assistantReply = await generateSeoCoachMessage(context, updatedMessages);
      const finalMessages = [...updatedMessages, { role: 'assistant', content: assistantReply }];
      setMessages(finalMessages);

      const assistantResponseCount = finalMessages.filter((message) => message.role === 'assistant').length;
      if (assistantResponseCount >= MAX_ASSISTANT_REPLIES) {
        setSessionEnded(true);
        toast({
          title: 'Sesión concluida',
          description: 'El Creovision Coach cerró con un mensaje final. Gracias por conversar.',
        });
      }
    } catch (err) {
      console.error('Error conversando con SEO Coach:', err);
      setError('Ocurrió un problema generando la respuesta. Intenta nuevamente.');
      toast({
        title: 'No pudimos contactar al SEO Coach',
        description: 'Verifica tu conexión o inténtalo otra vez en unos segundos.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isLoading) {
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] border border-purple-500/40 bg-gradient-to-b from-[#241149]/95 via-[#1b0d33]/95 to-[#120824]/95 p-0 text-gray-100 shadow-[0_0_60px_rgba(155,105,255,0.35)] !left-1/2 !top-1/2 !translate-x-[-50%] !translate-y-[-50%] !z-[120] max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="flex items-start justify-between px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-purple-600/50 via-indigo-600/40 to-fuchsia-500/40 border-b border-purple-500/40 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-black/40 ring-2 ring-purple-500/40">
              <img src="/mascota.png" alt="Agente Experto CreoVision" className="h-9 w-9 object-contain drop-shadow-lg" />
              <span className="absolute -bottom-1 right-0 h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-200/80">Agente Experto de CreoVision</p>
              <h2 className="mt-1 text-xl font-bold text-white">SEO Coach Conversacional</h2>
              <p className="text-sm text-purple-100/70">
                Mentor premium conectado a tus tarjetas dinámicas. Analiza, guía y crea rutas SEO accionables.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-purple-200 transition hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {context && (
          <div className="border-b border-purple-500/20 bg-black/35 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 overflow-y-auto max-h-[30vh]">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-purple-300/70">{context.type || 'Tarjeta'}</p>
                <h3 className="text-lg font-semibold text-white">{context.title}</h3>
              </div>
              {context.topic && (
                <div className="rounded-full border border-purple-400/40 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-100 shadow-sm shadow-purple-500/20">
                  Nicho: {context.topic}
                </div>
              )}
              {context.trendScore && (
                <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100 shadow-sm shadow-emerald-400/20">
                  Trend score: {context.trendScore}
                </div>
              )}
            </div>
            {(context.description || tags.length > 0) && (
              <div className="mt-3 grid gap-3 md:grid-cols-[2fr,1fr]">
                {context.description && (
                  <p className="text-sm text-gray-300 leading-relaxed bg-white/5 rounded-xl border border-white/10 p-3">
                    {context.description}
                  </p>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-purple-500/30 bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-100"
                      >
                        #{tag.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col flex-1 min-h-0">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-[#281654]/40 via-[#1e0f3c]/40 to-transparent px-4 sm:px-6 py-4 sm:py-5">
            {isBootstrapping ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-purple-100/80">
                <Loader2 className="h-6 w-6 animate-spin text-purple-300" />
                <p>El SEO Coach está analizando la tarjeta para darte un diagnóstico premium...</p>
              </div>
            ) : messages.length > 0 ? (
              messages.map((message, index) => (
                <CoachMessage key={`${message.role}-${index}`} role={message.role} content={message.content} />
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-sm text-gray-300">
                <p>No hay mensajes aún. Empieza la conversación cuando estés listo.</p>
              </div>
            )}
            {isLoading && !isBootstrapping && (
              <div className="flex items-center gap-2 text-sm text-purple-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>El coach está preparando la siguiente jugada SEO...</span>
              </div>
            )}
          </div>

          <div className="border-t border-purple-500/20 bg-black/40 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            {error && (
              <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Textarea
                value={userMessage}
                onChange={(event) => setUserMessage(event.target.value)}
                placeholder="Haz tu pregunta al coach (ej. ¿cómo posiciono esto en YouTube Shorts?, ¿qué CTA usarías?)."
                className="min-h-[72px] flex-1 resize-none border-purple-500/30 bg-[#160a2b]/70 text-sm text-gray-100 placeholder:text-gray-500 focus:border-purple-300 focus:ring-purple-400 disabled:opacity-60"
                disabled={sessionEnded || isLoading || isBootstrapping}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (!isLoading) {
                      sendMessage();
                    }
                  }
                }}
              />
              <Button
                type="submit"
                disabled={sessionEnded || isLoading || isBootstrapping}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-amber-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/40 transition hover:scale-[1.02] disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Pensando...
                  </>
                ) : (
                  <>
                    <span>Enviar</span>
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-purple-200/60">
              Powered by CreoVision Coaching Team
            </p>
          </div>
        </div>
        {sessionEnded && (
          <div className="border-t border-purple-500/20 bg-gradient-to-r from-purple-700/40 via-fuchsia-600/35 to-rose-600/30 px-4 sm:px-6 py-3 text-xs text-purple-50 flex-shrink-0">
            El coach cerró la conversación para que integres las acciones. Te invitamos a explorar el Centro Creativo y seguir construyendo tu estrategia con Creovision.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SEOCoachModal;
