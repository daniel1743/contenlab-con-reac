/**
 * 🎟️ Modal de Códigos Promocionales
 * Permite a los usuarios canjear códigos para obtener créditos
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  TicketIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const PROMO_REDEEM_TIMEOUT_MS = 15000;

const withTimeout = (promise, timeoutMs = PROMO_REDEEM_TIMEOUT_MS) => {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('La validacion tardo demasiado. Revisa tu conexion o intenta de nuevo.'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
};

export default function PromoCodeModal({ isOpen, onClose, userId, onSuccess }) {
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null); // { success, message, credits }
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!promoCode.trim()) {
      toast({
        title: 'Código requerido',
        description: 'Por favor ingresa un código promocional',
        variant: 'destructive',
      });
      return;
    }

    if (!userId) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para canjear códigos',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await withTimeout(
        supabase.rpc('redeem_promo_code', {
          p_user_id: userId,
          p_code: promoCode.trim().toUpperCase(),
        })
      );

      if (error) {
        throw error;
      }

      // data es un array con un objeto: [{ success, message, credits_granted }]
      const response = Array.isArray(data) ? data[0] : data;

      if (!response) {
        throw new Error('Supabase no devolvio respuesta al validar el codigo.');
      }

      setResult({
        success: response.success,
        message: response.message,
        credits: response.credits_granted,
      });

      if (response.success) {
        toast({
          title: '¡Código canjeado! 🎉',
          description: `Has recibido ${response.credits_granted} créditos`,
          duration: 5000,
        });

        // Llamar callback de éxito para actualizar balance
        if (onSuccess) {
          onSuccess(response.credits_granted);
        }

        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        toast({
          title: 'Error al canjear código',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error canjeando código:', error);

      setResult({
        success: false,
        message: error.message || 'Error desconocido al canjear el código',
        credits: 0,
      });

      toast({
        title: 'No se pudo validar',
        description: error.message || 'Ocurrio un error al intentar canjear el codigo',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPromoCode('');
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <TicketIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-white">
                Canjear Código Promocional
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Ingresa tu código para recibir créditos gratis
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="promo-code" className="text-white">
              Código Promocional
            </Label>
            <Input
              id="promo-code"
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="CREO-TEST-001"
              disabled={isLoading || result?.success}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 uppercase"
              maxLength={50}
              autoComplete="off"
            />
            <p className="text-xs text-slate-500">
              Los códigos no distinguen mayúsculas/minúsculas
            </p>
          </div>

          {/* Resultado del canje */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircleIcon className="h-6 w-6 text-green-400 flex-shrink-0" />
                  ) : (
                    <XCircleIcon className="h-6 w-6 text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-semibold mb-1 ${
                        result.success ? 'text-green-300' : 'text-red-300'
                      }`}
                    >
                      {result.success ? '¡Éxito!' : 'Error'}
                    </p>
                    <p className="text-sm text-slate-300">{result.message}</p>
                    {result.success && result.credits > 0 && (
                      <div className="mt-3 flex items-center gap-2 text-white">
                        <SparklesIcon className="h-5 w-5 text-yellow-400" />
                        <span className="font-bold text-lg">
                          +{result.credits} créditos
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info adicional */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-sm text-slate-300 mb-2">
              <strong className="text-white">💡 Tip:</strong> Los códigos promocionales solo pueden usarse una vez por usuario.
            </p>
            <p className="text-xs text-slate-400">
              Los créditos se agregarán automáticamente a tu balance como créditos bonus.
            </p>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !promoCode.trim() || result?.success}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⚡</span>
                  Validando...
                </>
              ) : result?.success ? (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Canjeado
                </>
              ) : (
                <>
                  <TicketIcon className="h-4 w-4 mr-2" />
                  Canjear Código
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
