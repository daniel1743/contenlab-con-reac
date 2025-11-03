import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    // Verificar si hay un token de recuperación válido
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasValidToken(true);
      } else {
        toast({
          variant: "destructive",
          title: "Link inválido o expirado",
          description: "Por favor solicita un nuevo link de recuperación."
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };
    checkSession();
  }, [navigate, toast]);

  const handleResetPassword = async () => {
    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Contraseña muy corta",
        description: "La contraseña debe tener al menos 8 caracteres."
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Las contraseñas no coinciden",
        description: "Por favor verifica que ambas contraseñas sean iguales."
      });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar contraseña",
        description: error.message
      });
    } else {
      setIsSuccess(true);
      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido cambiada exitosamente."
      });
      setTimeout(() => navigate('/'), 3000);
    }
    setIsLoading(false);
  };

  if (!hasValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verificando link de recuperación...</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h2>
          <p className="text-gray-600 mb-4">
            Tu contraseña ha sido cambiada exitosamente. Redirigiendo a inicio...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <Lock className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restablecer contraseña</h1>
          <p className="text-gray-600">Ingresa tu nueva contraseña</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-gray-700">Nueva contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-gray-700">Confirmar contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                className="pl-10 bg-gray-50 border-gray-300 text-gray-900"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {password && (
            <div className="text-sm space-y-1">
              <p className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                {password.length >= 8 ? '✓' : '○'} Al menos 8 caracteres
              </p>
              <p className={`flex items-center ${password === confirmPassword && password ? 'text-green-600' : 'text-gray-400'}`}>
                {password === confirmPassword && password ? '✓' : '○'} Las contraseñas coinciden
              </p>
            </div>
          )}

          <Button
            onClick={handleResetPassword}
            disabled={isLoading || !password || password !== confirmPassword}
            className="w-full gradient-primary text-white hover:opacity-90 transition-opacity"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full text-sm text-gray-600 hover:text-gray-800 text-center"
          >
            Volver al inicio
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
