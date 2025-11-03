/**
 * 💎 CreditBalance Component
 *
 * Muestra el balance de créditos del usuario en el header.
 * Se actualiza automáticamente después de cada uso.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getUserCredits, checkLowCreditWarning, SUBSCRIPTION_PLANS } from '@/services/creditService';
import { Gem, Zap, ChevronDown, Crown, AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';

export function CreditBalance({ onBuyCredits, onUpgradePlan }) {
  const { user, userPremium } = useAuth();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (user) {
      loadCredits();
      // Recargar cada 30 segundos para mantener sincronizado
      const interval = setInterval(loadCredits, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadCredits = async () => {
    if (!user) return;

    const result = await getUserCredits(user.id);

    if (result.success) {
      setCredits(result);

      // Verificar si mostrar warning
      const warning = checkLowCreditWarning(result.credits.total);
      setShowWarning(warning.show);
    }

    setLoading(false);
  };

  // Refrescar credits (llamar desde componentes externos después de consumir)
  useEffect(() => {
    window.refreshCredits = loadCredits;
    return () => delete window.refreshCredits;
  }, [user]);

  if (!user || loading) {
    return null;
  }

  if (!credits) {
    return null;
  }

  const planConfig = SUBSCRIPTION_PLANS[credits.plan.toUpperCase()] || SUBSCRIPTION_PLANS.FREE;
  const totalCredits = credits.credits.total;
  const warning = checkLowCreditWarning(totalCredits);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              warning.severity === 'critical'
                ? 'border-red-500 bg-red-50 text-red-700 hover:bg-red-100'
                : warning.severity === 'high'
                ? 'border-amber-500 bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <Gem className={`h-5 w-5 ${warning.severity === 'critical' ? 'text-red-600' : warning.severity === 'high' ? 'text-amber-600' : 'text-purple-600'}`} />
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-bold leading-none">
                {totalCredits.toLocaleString()}
              </span>
              <span className="text-[10px] opacity-70 leading-none">
                créditos
              </span>
            </div>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72 p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Mis Créditos</h3>
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                <Zap className="h-3 w-3" />
                {planConfig.name}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-700">Total Disponible</span>
                {warning.severity === 'critical' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-purple-900">
                  {totalCredits.toLocaleString()}
                </span>
                <span className="text-sm text-purple-600">créditos</span>
              </div>
            </div>

            {/* Desglose */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-medium text-gray-500 uppercase">Desglose</div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Del plan mensual:</span>
                <span className="font-medium text-gray-900">{credits.credits.monthly}</span>
              </div>

              {credits.credits.purchased > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Comprados:</span>
                  <span className="font-medium text-gray-900">{credits.credits.purchased}</span>
                </div>
              )}

              {credits.credits.bonus > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">🎁 Bonos:</span>
                  <span className="font-medium text-green-600">{credits.credits.bonus}</span>
                </div>
              )}
            </div>

            <DropdownMenuSeparator />

            {/* Próximo Reset */}
            <div className="text-xs text-gray-600">
              📅 Resetea en {credits.daysUntilReset} días
            </div>

            <DropdownMenuSeparator />

            {/* Actions */}
            <div className="space-y-2">
              {credits.plan === 'free' ? (
                <Button
                  onClick={onUpgradePlan}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade para más créditos
                </Button>
              ) : (
                <Button
                  onClick={onBuyCredits}
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Comprar más créditos
                </Button>
              )}

              {credits.plan !== 'premium' && (
                <Button
                  onClick={onUpgradePlan}
                  variant="ghost"
                  size="sm"
                  className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  Ver planes superiores
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Warning Toast/Alert (inline cuando quedan pocos créditos) */}
      <AnimatePresence>
        {warning.show && warning.severity !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 w-80"
          >
            <Alert
              className={`border-2 ${
                warning.severity === 'critical'
                  ? 'border-red-500 bg-red-50'
                  : 'border-amber-500 bg-amber-50'
              }`}
            >
              <AlertCircle className={`h-4 w-4 ${warning.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
              <AlertDescription className="text-sm">
                <p className={`font-semibold ${warning.severity === 'critical' ? 'text-red-900' : 'text-amber-900'}`}>
                  {warning.message}
                </p>
                <p className={`text-xs mt-1 ${warning.severity === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                  {warning.action}
                </p>
                <div className="flex gap-2 mt-2">
                  {credits.plan === 'free' ? (
                    <Button
                      size="sm"
                      onClick={onUpgradePlan}
                      className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Ver Planes
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={onBuyCredits}
                      className="bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Comprar Créditos
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Hook para usar el sistema de créditos en componentes
 */
export function useCreditBalance() {
  const { user } = useAuth();
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) return;

    const result = await getUserCredits(user.id);
    if (result.success) {
      setCredits(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, [user]);

  return {
    credits: credits?.credits,
    plan: credits?.plan,
    loading,
    refresh
  };
}

export default CreditBalance;
