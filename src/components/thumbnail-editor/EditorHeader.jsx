import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  BookmarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const EditorHeader = ({ onBack, onExport, onExportTikTok, onExportInstagram, canUndo, canRedo, onUndo, onRedo }) => {
  const { toast } = useToast();
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const exportMenuRef = React.useRef(null);

  // Cerrar menú al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const handleNotImplemented = () => {
    toast({
      title: '🚧 Esta función no está implementada aún',
      description: '¡No te preocupes! Puedes solicitarla en tu próximo prompt! 🚀',
    });
  };

  return (
    <div className="glass-effect border-b border-purple-500/20 p-2 flex-shrink-0">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
            <ArrowLeftIcon className="w-4 h-4 mr-2 stroke-[2]" />
            Volver
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gradient">Editor de Miniaturas</h1>
            <p className="text-xs text-gray-400">CreoVision Premium</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} className="disabled:opacity-50 hover:bg-purple-500/20">
            <ArrowUturnLeftIcon className="w-5 h-5 stroke-[2]" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} className="disabled:opacity-50 hover:bg-purple-500/20">
            <ArrowUturnRightIcon className="w-5 h-5 stroke-[2]" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNotImplemented} className="hover:bg-purple-500/20">
            <ClockIcon className="w-5 h-5 stroke-[2]" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleNotImplemented} className="border-purple-500/20">
            <BookmarkIcon className="w-4 h-4 mr-2 stroke-[2]" />
            Guardar
          </Button>
          <div className="relative" ref={exportMenuRef}>
            <Button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              className="gradient-primary hover:opacity-90"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2 stroke-[2]" />
              Exportar
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 glass-effect border border-purple-500/20 rounded-lg shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => {
                    onExport();
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-purple-500/20 text-sm text-white"
                >
                  📺 YouTube (1280×720)
                </button>
                {onExportTikTok && (
                  <button
                    onClick={() => {
                      onExportTikTok();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-purple-500/20 text-sm text-white"
                  >
                    🎵 TikTok (1080×1920)
                  </button>
                )}
                {onExportInstagram && (
                  <button
                    onClick={() => {
                      onExportInstagram();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-purple-500/20 text-sm text-white"
                  >
                    📷 Instagram (1080×1080)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorHeader;