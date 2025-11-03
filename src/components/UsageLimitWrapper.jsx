/**
 * 🔒 UsageLimitWrapper - Componente HOC para aplicar límites de uso
 *
 * Envuelve cualquier feature y automáticamente verifica/incrementa límites de uso.
 * Muestra modal de upgrade cuando se alcanza el límite.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  checkUsageLimit,
  incrementUsage,
  getLimitMessage,
  logBlockedAttempt
} from '@/services/usageLimitService';
import SubscriptionModal from '@/components/SubscriptionModal';
import { AlertCircle, Crown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx';

/**
 * Wrapper Component que verifica límites antes de ejecutar una acción
 */
export function UsageLimitWrapper({
  featureName,
  children,
  onBlock,
  showInlineWarning = true
}) {
  const { user, userPremium } = useAuth();
  const { toast } = useToast();
  const [usageStatus, setUsageStatus] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkLimit();
  }, [user, userPremium, featureName]);

  const checkLimit = async () => {
    setIsChecking(true);
    const status = await checkUsageLimit(user?.id, featureName, userPremium);
    setUsageStatus(status);
    setIsChecking(false);
  };

  const handleAction = async (actionFn) => {
    // Re-check en tiempo real por si cambió
    const status = await checkUsageLimit(user?.id, featureName, userPremium);

    if (!status.allowed) {
      // Límite alcanzado
      const message = getLimitMessage(featureName, status.limit);

      toast({
        variant: 'destructive',
        title: '🔒 Límite alcanzado',
        description: message
      });

      // Log analytics
      if (user?.id) {
        await logBlockedAttempt(user.id, featureName);
      }

      // Mostrar modal de upgrade
      setShowUpgradeModal(true);

      // Callback custom si existe
      if (onBlock) {
        onBlock(status);
      }

      return null;
    }

    // Límite OK, ejecutar acción
    try {
      const result = await actionFn();

      // Incrementar contador de uso
      await incrementUsage(user?.id, featureName, userPremium);

      // Re-check para actualizar UI
      await checkLimit();

      return result;
    } catch (error) {
      console.error('Error in wrapped action:', error);
      throw error;
    }
  };

  // Clonar children y pasarles el wrapper de acción
  const wrappedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        usageLimitWrapper: handleAction,
        usageStatus,
        isCheckingLimit: isChecking
      });
    }
    return child;
  });

  return (
    <>
      {/* Inline warning cuando está cerca del límite */}
      {showInlineWarning && usageStatus && !userPremium && usageStatus.remaining <= 2 && usageStatus.remaining > 0 && (
        <Alert className="mb-4 border-amber-500 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900">
            ⚠️ Quedán {usageStatus.remaining} {usageStatus.remaining === 1 ? 'uso' : 'usos'}
          </AlertTitle>
          <AlertDescription className="text-amber-700">
            Actualiza a Premium para uso ilimitado.
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="ml-2 underline font-semibold hover:text-amber-900"
            >
              Ver planes <Crown className="inline h-3 w-3" />
            </button>
          </AlertDescription>
        </Alert>
      )}

      {wrappedChildren}

      {/* Modal de upgrade */}
      <SubscriptionModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onAuthClick={() => {
          setShowUpgradeModal(false);
          // Aquí podrías abrir el AuthModal si el usuario no está autenticado
        }}
      />
    </>
  );
}

/**
 * Hook personalizado para usar límites de uso
 */
export function useUsageLimit(featureName) {
  const { user, userPremium } = useAuth();
  const { toast } = useToast();
  const [usageStatus, setUsageStatus] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    checkLimit();
  }, [user, userPremium, featureName]);

  const checkLimit = async () => {
    const status = await checkUsageLimit(user?.id, featureName, userPremium);
    setUsageStatus(status);
    return status;
  };

  const withUsageLimit = async (actionFn) => {
    const status = await checkUsageLimit(user?.id, featureName, userPremium);

    if (!status.allowed) {
      const message = getLimitMessage(featureName, status.limit);

      toast({
        variant: 'destructive',
        title: '🔒 Límite alcanzado',
        description: message,
        action: (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700"
          >
            <Crown className="inline h-4 w-4 mr-1" />
            Upgrade
          </button>
        )
      });

      if (user?.id) {
        await logBlockedAttempt(user.id, featureName);
      }

      setShowUpgradeModal(true);
      throw new Error('USAGE_LIMIT_EXCEEDED');
    }

    try {
      const result = await actionFn();
      await incrementUsage(user?.id, featureName, userPremium);
      await checkLimit();
      return result;
    } catch (error) {
      console.error('Error in withUsageLimit:', error);
      throw error;
    }
  };

  return {
    usageStatus,
    withUsageLimit,
    checkLimit,
    showUpgradeModal,
    setShowUpgradeModal
  };
}

export default UsageLimitWrapper;
