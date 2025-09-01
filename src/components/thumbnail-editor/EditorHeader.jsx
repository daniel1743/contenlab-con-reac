import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Download, Undo, Redo, Save, History } from 'lucide-react';

const EditorHeader = ({ onBack, onExport, canUndo, canRedo, onUndo, onRedo }) => {
  const { toast } = useToast();

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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gradient">Editor de Miniaturas</h1>
            <p className="text-xs text-gray-400">ContentLab Premium</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onUndo} disabled={!canUndo} className="disabled:opacity-50 hover:bg-purple-500/20">
            <Undo className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onRedo} disabled={!canRedo} className="disabled:opacity-50 hover:bg-purple-500/20">
            <Redo className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNotImplemented} className="hover:bg-purple-500/20">
            <History className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleNotImplemented} className="border-purple-500/20">
            <Save className="w-4 h-4 mr-2" />
            Guardar
          </Button>
          <Button onClick={onExport} className="gradient-primary hover:opacity-90">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorHeader;