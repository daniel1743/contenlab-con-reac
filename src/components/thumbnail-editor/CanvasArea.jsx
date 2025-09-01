import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut } from 'lucide-react';

const CanvasArea = ({ zoom, setZoom }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-gray-800/50 relative overflow-hidden">
      <div 
        className="relative shadow-2xl bg-gray-900"
        style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out',
        }}
      >
        <canvas id="fabric-canvas" />
      </div>
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 glass-effect rounded-lg p-2">
        <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="hover:bg-purple-500/20">
          <ZoomOut className="w-5 h-5" />
        </Button>
        <span className="text-white text-sm font-semibold w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="hover:bg-purple-500/20">
          <ZoomIn className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default CanvasArea;