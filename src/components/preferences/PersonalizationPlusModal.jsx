/**
 * ⚙️ PERSONALIZACIÓN PLUS
 * Modal para configurar preferencias avanzadas del usuario
 * Permite definir estilo, tono, audiencia y guardar preferencias
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Target, MessageCircle, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const PersonalizationPlusModal = ({ open, onOpenChange, userPersonality, onPersonalityUpdate }) => {
  const { toast } = useToast();

  // User ID
  const [userId, setUserId] = useState(null);

  // Form states
  const [brandName, setBrandName] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [contentStyle, setContentStyle] = useState('profesional');
  const [tone, setTone] = useState('amigable');
  const [goals, setGoals] = useState([]);
  const [uniqueValue, setUniqueValue] = useState('');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Available goals
  const availableGoals = [
    { id: 'engagement', label: 'Aumentar Engagement', icon: '💬' },
    { id: 'growth', label: 'Crecer Audiencia', icon: '📈' },
    { id: 'sales', label: 'Generar Ventas', icon: '💰' },
    { id: 'brand', label: 'Construir Marca', icon: '🎯' },
    { id: 'education', label: 'Educar Audiencia', icon: '🎓' },
    { id: 'community', label: 'Crear Comunidad', icon: '👥' }
  ];

  // Get user ID and load preferences
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: 'Error de sesión',
            description: 'Debes estar autenticado para personalizar',
            variant: 'destructive'
          });
          onOpenChange(false);
          return;
        }

        setUserId(user.id);

        // Load existing preferences from userPersonality prop or database
        if (userPersonality) {
          setBrandName(userPersonality.brandName || '');
          setNiche(userPersonality.niche || '');
          setTargetAudience(userPersonality.targetAudience || '');
          setContentStyle(userPersonality.contentStyle || 'profesional');
          setTone(userPersonality.tone || 'amigable');
          setGoals(userPersonality.goals || []);
          setUniqueValue(userPersonality.uniqueValue || '');
        } else {
          // Try to load from profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();

          if (profile?.preferences) {
            const prefs = profile.preferences;
            setBrandName(prefs.brandName || '');
            setNiche(prefs.niche || '');
            setTargetAudience(prefs.targetAudience || '');
            setContentStyle(prefs.contentStyle || 'profesional');
            setTone(prefs.tone || 'amigable');
            setGoals(prefs.goals || []);
            setUniqueValue(prefs.uniqueValue || '');
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadUserPreferences();
    }
  }, [open, userPersonality]);

  const toggleGoal = (goalId) => {
    setGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSave = async () => {
    // Validación básica
    if (!brandName.trim() || !niche.trim() || !targetAudience.trim()) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor completa al menos nombre de marca, nicho y audiencia',
        variant: 'destructive'
      });
      return;
    }

    if (goals.length === 0) {
      toast({
        title: 'Selecciona objetivos',
        description: 'Por favor selecciona al menos un objetivo',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);

    try {
      const preferences = {
        brandName: brandName.trim(),
        niche: niche.trim(),
        targetAudience: targetAudience.trim(),
        contentStyle,
        tone,
        goals,
        uniqueValue: uniqueValue.trim(),
        updatedAt: new Date().toISOString()
      };

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .update({ preferences })
        .eq('id', userId);

      if (error) throw error;

      // Update parent component
      if (onPersonalityUpdate) {
        onPersonalityUpdate(preferences);
      }

      toast({
        title: '✅ Preferencias guardadas',
        description: 'Tus configuraciones se aplicarán a todas las herramientas'
      });

      // Close modal after short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error al guardar',
        description: error.message || 'No se pudieron guardar las preferencias',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border border-purple-500/30 rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-purple-500/30 bg-gray-900/80 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Personalización Plus</h2>
                <p className="text-sm text-gray-400">Configura tu estilo y preferencias</p>
              </div>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 text-gray-400 transition-colors rounded-lg hover:bg-gray-800 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
            {isLoading ? (
              /* LOADING */
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400">Cargando preferencias...</p>
              </div>
            ) : (
              /* FORM */
              <div className="space-y-6">
                {/* Info */}
                <div className="p-4 border border-purple-500/30 rounded-lg bg-purple-900/10">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <h4 className="mb-1 font-semibold text-purple-300">Personalización Inteligente</h4>
                      <p className="text-sm text-gray-400">
                        Configura tus preferencias una vez y todas las herramientas generarán contenido adaptado a tu estilo y audiencia.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Brand & Niche */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                      <User className="w-4 h-4 text-purple-400" />
                      Nombre de Marca / Canal *
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Ej: Mi Canal de Marketing"
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                      <Target className="w-4 h-4 text-purple-400" />
                      Nicho / Industria *
                    </label>
                    <input
                      type="text"
                      value={niche}
                      onChange={(e) => setNiche(e.target.value)}
                      placeholder="Ej: Marketing Digital"
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    />
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                    <Target className="w-4 h-4 text-purple-400" />
                    Audiencia Objetivo *
                  </label>
                  <textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Ej: Emprendedores digitales de 25-40 años que buscan escalar su negocio online"
                    rows={3}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                </div>

                {/* Style & Tone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-300">
                      Estilo de Contenido *
                    </label>
                    <select
                      value={contentStyle}
                      onChange={(e) => setContentStyle(e.target.value)}
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="profesional">Profesional / Corporativo</option>
                      <option value="casual">Casual / Relajado</option>
                      <option value="educativo">Educativo / Tutorial</option>
                      <option value="entretenimiento">Entretenimiento / Humor</option>
                      <option value="inspiracional">Inspiracional / Motivacional</option>
                      <option value="storytelling">Storytelling / Narrativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                      <MessageCircle className="w-4 h-4 text-purple-400" />
                      Tono de Comunicación *
                    </label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="amigable">Amigable / Cercano</option>
                      <option value="profesional">Profesional / Formal</option>
                      <option value="motivacional">Motivacional / Energético</option>
                      <option value="autoritario">Autoritario / Experto</option>
                      <option value="humoristico">Humorístico / Divertido</option>
                      <option value="empatico">Empático / Comprensivo</option>
                    </select>
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className="block mb-3 text-sm font-medium text-gray-300">
                    Objetivos de Contenido * (selecciona uno o más)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableGoals.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={`p-4 border rounded-xl transition-all text-left ${
                          goals.includes(goal.id)
                            ? 'border-purple-500 bg-purple-600/20'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl">{goal.icon}</span>
                          {goals.includes(goal.id) && (
                            <Check className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                        <p className={`text-sm font-medium ${
                          goals.includes(goal.id) ? 'text-white' : 'text-gray-300'
                        }`}>
                          {goal.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Unique Value */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Valor Único / Diferenciador (opcional)
                  </label>
                  <textarea
                    value={uniqueValue}
                    onChange={(e) => setUniqueValue(e.target.value)}
                    placeholder="Ej: Explico conceptos complejos de forma simple usando analogías cotidianas y ejemplos prácticos"
                    rows={3}
                    className="w-full px-4 py-3 text-white transition-colors bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 resize-none"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    ¿Qué te hace diferente? Esto ayudará a generar contenido más auténtico.
                  </p>
                </div>

                {/* Resumen de preferencias */}
                {brandName && niche && targetAudience && goals.length > 0 && (
                  <div className="p-5 border border-green-500/30 rounded-xl bg-green-900/10">
                    <h4 className="flex items-center gap-2 mb-3 text-lg font-bold text-white">
                      <Check className="w-5 h-5 text-green-400" />
                      Resumen de tu Personalización
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <strong className="text-green-400">Marca:</strong> {brandName} ({niche})
                      </p>
                      <p className="text-gray-300">
                        <strong className="text-green-400">Estilo:</strong> {contentStyle} • Tono: {tone}
                      </p>
                      <p className="text-gray-300">
                        <strong className="text-green-400">Objetivos:</strong> {goals.map(g => availableGoals.find(ag => ag.id === g)?.label).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botón guardar */}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !brandName.trim() || !niche.trim() || !targetAudience.trim() || goals.length === 0}
                  className="w-full px-6 py-4 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Preferencias
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PersonalizationPlusModal;
