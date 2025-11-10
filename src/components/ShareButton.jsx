/**
 * 📤 ShareButton Component - Web Share API Integration
 *
 * Componente que detecta si Web Share API está disponible y proporciona
 * share nativo en móviles o fallback a copy en desktop.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2Icon, CopyIcon, CheckIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function ShareButton({
  title,
  text,
  url = 'https://creovision.io',
  variant = 'default',
  className = '',
  onShareSuccess,
  onShareError,
  children
}) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [sharing, setSharing] = React.useState(false);

  // Detectar si Web Share API está disponible
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  const handleShare = async () => {
    setSharing(true);

    try {
      if (canShare) {
        // 📱 Móvil: usar Web Share API nativo
        await navigator.share({
          title: title || 'Contenido generado con CreoVision',
          text: text || '',
          url: url,
        });

        toast({
          title: 'Compartido exitosamente',
          description: 'El contenido ha sido compartido',
        });

        onShareSuccess?.();
      } else {
        // 💻 Desktop: copiar al portapapeles
        const shareText = `${title}\n\n${text}\n\n${url}`;
        await navigator.clipboard.writeText(shareText);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        toast({
          title: 'Copiado al portapapeles',
          description: 'Ahora puedes pegarlo donde quieras',
        });

        onShareSuccess?.();
      }
    } catch (error) {
      // Usuario canceló o error
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);

        toast({
          title: 'Error al compartir',
          description: error.message || 'Intenta de nuevo',
          variant: 'destructive',
        });

        onShareError?.(error);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleShare}
      disabled={sharing}
    >
      {sharing ? (
        <>
          <span className="animate-spin mr-2">⚡</span>
          Compartiendo...
        </>
      ) : copied ? (
        <>
          <CheckIcon className="w-4 h-4 mr-2" />
          ¡Copiado!
        </>
      ) : canShare ? (
        <>
          <Share2Icon className="w-4 h-4 mr-2" />
          {children || 'Compartir'}
        </>
      ) : (
        <>
          <CopyIcon className="w-4 h-4 mr-2" />
          {children || 'Copiar'}
        </>
      )}
    </Button>
  );
}

/**
 * Hook personalizado para usar Web Share programáticamente
 */
export function useWebShare() {
  const { toast } = useToast();
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  const share = async ({ title, text, url }) => {
    try {
      if (canShare) {
        await navigator.share({ title, text, url });
        return { success: true, method: 'native' };
      } else {
        const shareText = `${title}\n\n${text}\n\n${url}`;
        await navigator.clipboard.writeText(shareText);

        toast({
          title: 'Copiado al portapapeles',
          description: 'Ahora puedes pegarlo donde quieras',
        });

        return { success: true, method: 'clipboard' };
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast({
          title: 'Error al compartir',
          description: error.message,
          variant: 'destructive',
        });
      }
      return { success: false, error };
    }
  };

  return { share, canShare };
}
