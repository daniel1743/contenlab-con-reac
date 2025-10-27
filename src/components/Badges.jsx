import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Lock, Star, Trophy, Zap, Target, TrendingUp, Users, Crown, Sparkles } from 'lucide-react';

const Badges = () => {
  const userBadges = [
    {
      id: 1,
      name: 'Primer Viral',
      description: 'Alcanzaste tu primer millón de vistas',
      icon: Trophy,
      unlocked: true,
      unlockedDate: '15 Enero 2025',
      rarity: 'gold'
    },
    {
      id: 2,
      name: 'Creador Constante',
      description: 'Publicaste contenido durante 30 días consecutivos',
      icon: Target,
      unlocked: true,
      unlockedDate: '10 Enero 2025',
      rarity: 'silver'
    },
    {
      id: 3,
      name: 'Maestro del Engagement',
      description: 'Mantuviste un engagement rate superior al 8% por 3 meses',
      icon: Users,
      unlocked: true,
      unlockedDate: '5 Enero 2025',
      rarity: 'gold'
    },
    {
      id: 4,
      name: 'Velocidad Viral',
      description: 'Alcanza 100K vistas en menos de 24 horas',
      icon: Zap,
      unlocked: false,
      requirement: '0/100K vistas en 24h',
      rarity: 'platinum'
    },
    {
      id: 5,
      name: 'Multiplatforma Pro',
      description: 'Alcanza 50K seguidores en 3 plataformas diferentes',
      icon: Star,
      unlocked: false,
      requirement: '2/3 plataformas',
      rarity: 'gold'
    },
    {
      id: 6,
      name: 'Influencer de Elite',
      description: 'Alcanza 1 millón de seguidores totales',
      icon: Crown,
      unlocked: false,
      requirement: '875K/1M seguidores',
      rarity: 'platinum'
    },
    {
      id: 7,
      name: 'Tendencia Semanal',
      description: 'Aparece en trending de YouTube por 7 días',
      icon: TrendingUp,
      unlocked: false,
      requirement: '0/7 días en trending',
      rarity: 'gold'
    },
    {
      id: 8,
      name: 'Leyenda Viral',
      description: 'Acumula 10 millones de vistas totales',
      icon: Sparkles,
      unlocked: false,
      requirement: '6.5M/10M vistas',
      rarity: 'platinum'
    }
  ];

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'platinum': return 'from-cyan-400 to-blue-600';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-purple-400 to-pink-500';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'platinum': return 'border-cyan-400/50';
      case 'gold': return 'border-yellow-400/50';
      case 'silver': return 'border-gray-400/50';
      default: return 'border-purple-400/50';
    }
  };

  const unlockedCount = userBadges.filter(b => b.unlocked).length;
  const totalCount = userBadges.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold text-gradient">Tus Insignias</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Colecciona insignias completando desafíos y alcanzando hitos
        </p>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-effect border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-400" />
              Progreso de Colección
            </CardTitle>
            <CardDescription>Has desbloqueado {unlockedCount} de {totalCount} insignias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Progreso total</span>
                <span className="text-white font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {userBadges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
            >
              <Card className={`glass-effect ${getRarityBorder(badge.rarity)} border-2 h-full relative ${!badge.unlocked && 'opacity-50'}`}>
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`relative p-6 rounded-full ${badge.unlocked ? `bg-gradient-to-br ${getRarityColor(badge.rarity)}` : 'bg-gray-700'}`}>
                      <Icon className={`w-10 h-10 ${badge.unlocked ? 'text-white' : 'text-gray-500'}`} />
                      {!badge.unlocked && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardTitle className={`text-lg ${badge.unlocked ? 'text-white' : 'text-gray-400'}`}>
                    {badge.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-2">
                    {badge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  {badge.unlocked ? (
                    <div className="space-y-1">
                      <p className="text-xs text-green-400 font-semibold">Desbloqueada</p>
                      <p className="text-xs text-gray-400">{badge.unlockedDate}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-yellow-400 font-semibold">Bloqueada</p>
                      <p className="text-xs text-gray-400">{badge.requirement}</p>
                    </div>
                  )}
                  {/* Rarity Badge */}
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white`}>
                      {badge.rarity}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Badges;
