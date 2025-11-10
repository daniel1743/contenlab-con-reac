/**
 * 📚 Playbook Card
 * Tarjeta de playbook con sistema de bloqueo/desbloqueo por créditos
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';

const UNLOCK_COST = 150;

export default function PlaybookCard({ playbook = {}, userId }) {
  const { toast } = useToast();
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(playbook.locked === false);

  const {
    title = 'Playbook sin título',
    preview = 'Sin preview disponible',
    locked = true,
    unlock_cost = UNLOCK_COST,
    difficulty = 'medium',
    estimated_time = 'N/A',
    expected_results = '',
    steps = [],
    category = '',
  } = playbook;

  // Verificar y consumir créditos para desbloquear
  const handleUnlock = async () => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para desbloquear playbooks',
        variant: 'destructive',
      });
      return;
    }

    setIsUnlocking(true);

    try {
      // Verificar créditos
      const { data: creditData, error: creditError } = await supabase
        .from('user_credits')
        .select('total_credits')
        .eq('user_id', userId)
        .single();

      if (creditError) throw creditError;

      const balance = creditData?.total_credits || 0;

      if (balance < unlock_cost) {
        toast({
          title: 'Créditos insuficientes',
          description: `Necesitas ${unlock_cost} créditos. Balance actual: ${balance}`,
          variant: 'destructive',
        });
        setIsUnlocking(false);
        return;
      }

      // Consumir créditos
      const { data, error } = await supabase.rpc('consume_credits', {
        p_user_id: userId,
        p_amount: unlock_cost,
        p_feature: 'playbook_unlock',
        p_description: `Desbloqueo de playbook: ${title}`,
      });

      if (error) throw error;

      if (data === true) {
        setIsUnlocked(true);
        toast({
          title: 'Playbook desbloqueado',
          description: `Has consumido ${unlock_cost} créditos`,
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron consumir los créditos',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error desbloqueando playbook:', error);
      toast({
        title: 'Error',
        description: 'Ocurrió un error desbloqueando el playbook',
        variant: 'destructive',
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  };

  const difficultyLabels = {
    easy: 'Fácil',
    medium: 'Medio',
    hard: 'Difícil',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: locked && !isUnlocked ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors h-full relative overflow-hidden ${
        locked && !isUnlocked ? 'cursor-pointer' : ''
      }`}>
        {/* Lock overlay */}
        {locked && !isUnlocked && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="text-6xl mb-4">🔒</div>
              <div className="text-white font-bold text-lg mb-2">Playbook Bloqueado</div>
              <div className="text-slate-300 text-sm mb-4">
                Desbloquea este playbook para ver el contenido completo
              </div>
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 mb-4">
                <div className="text-2xl font-bold text-white mb-1">
                  {unlock_cost} créditos
                </div>
                <div className="text-xs text-slate-300">Precio de desbloqueo</div>
              </div>
              <Button
                onClick={handleUnlock}
                disabled={isUnlocking}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full"
              >
                {isUnlocking ? (
                  <>
                    <span className="animate-spin mr-2">⚡</span>
                    Desbloqueando...
                  </>
                ) : (
                  <>
                    🔓 Desbloquear por {unlock_cost} créditos
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white font-bold text-lg">{title}</h3>
                {!locked || isUnlocked ? (
                  <Badge className="bg-green-500 text-white text-xs">
                    Desbloqueado
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {category && (
                  <Badge variant="outline" className="text-xs">
                    {category}
                  </Badge>
                )}
                <Badge className={`${difficultyColors[difficulty]} text-white text-xs`}>
                  {difficultyLabels[difficulty] || 'Medio'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Preview */}
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            {preview}
          </p>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-slate-700/50 rounded-lg p-2 border border-slate-600">
              <div className="text-xs text-slate-400">Tiempo estimado</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {estimated_time}
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2 border border-slate-600">
              <div className="text-xs text-slate-400">Pasos</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {steps?.length || 'N/A'}
              </div>
            </div>
          </div>

          {/* Content (solo si está desbloqueado) */}
          {(!locked || isUnlocked) && (
            <div className="space-y-4">
              {/* Expected Results */}
              {expected_results && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="text-xs font-semibold text-green-300 mb-1">
                    🎯 Resultados Esperados
                  </div>
                  <p className="text-sm text-slate-200">
                    {expected_results}
                  </p>
                </div>
              )}

              {/* Steps */}
              {steps && steps.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold text-sm mb-3">
                    📋 Pasos a Seguir
                  </h4>
                  <div className="space-y-2">
                    {steps.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 bg-slate-700/30 rounded-lg p-3 border border-slate-600"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm mb-1">
                            {step.title || step.name || `Paso ${idx + 1}`}
                          </div>
                          <div className="text-slate-300 text-xs">
                            {step.description || step.action || ''}
                          </div>
                          {step.duration && (
                            <div className="text-slate-400 text-xs mt-1">
                              ⏱️ {step.duration}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools/Resources */}
              {playbook.tools && playbook.tools.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-xs font-semibold text-blue-300 mb-2">
                    🛠️ Herramientas Necesarias
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {playbook.tools.map((tool, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {playbook.tips && playbook.tips.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-xs font-semibold text-yellow-300 mb-2">
                    💡 Tips Pro
                  </div>
                  <ul className="space-y-1">
                    {playbook.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
