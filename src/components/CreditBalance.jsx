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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <Gem className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-semibold text-gray-300">
              {totalCredits.toLocaleString()}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-72 p-4 glass-effect border-purple-500/20">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Mis Créditos</h3>
              <div className="flex items-center gap-1 text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded border border-purple-500/30">
                <Zap className="h-3 w-3" />
                {planConfig.name}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 rounded-lg p-4 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-300">Total Disponible</span>
                {warning.severity === 'critical' && (
                  <AlertCircle className="h-4 w-4 text-pink-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">
                  {totalCredits.toLocaleString()}
                </span>
                <span className="text-sm text-purple-300">créditos</span>
              </div>
            </div>

            {/* Desglose */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-medium text-purple-400 uppercase">Desglose</div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Del plan mensual:</span>
                <span className="font-medium text-white">{credits.credits.monthly}</span>
              </div>

              {credits.credits.purchased > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Comprados:</span>
                  <span className="font-medium text-white">{credits.credits.purchased}</span>
                </div>
              )}

              {credits.credits.bonus > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">🎁 Bonos:</span>
                  <span className="font-medium text-green-400">{credits.credits.bonus}</span>
                </div>
              )}
            </div>

            <DropdownMenuSeparator className="bg-purple-500/20" />

            {/* Próximo Reset */}
            <div className="text-xs text-gray-400">
              📅 Resetea en {credits.daysUntilReset} días
            </div>

            <DropdownMenuSeparator className="bg-purple-500/20" />

            {/* Actions */}
            <div className="space-y-2">
              {credits.plan === 'free' ? (
                <Button
                  onClick={onUpgradePlan}
                  className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white hover:from-violet-700 hover:via-purple-700 hover:to-pink-700"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade para más créditos
                </Button>
              ) : (
                <Button
                  onClick={onBuyCredits}
                  variant="outline"
                  className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
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
                  className="w-full text-purple-300 hover:text-purple-200 hover:bg-purple-500/10"
                >
                  Ver planes superiores
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
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
