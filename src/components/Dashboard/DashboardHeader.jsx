import React from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DashboardHeader = ({ channelInfo, aiSummary, fromCache, analyzedAt }) => {
  if (!channelInfo) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-r from-[#2A1B3D] to-[#1E2A4A] border-[#C93CFC]/20">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar del canal */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <img
                src={channelInfo.thumbnail}
                alt={channelInfo.title}
                className="w-24 h-24 rounded-full ring-4 ring-[#C93CFC]/50"
              />
              <div className="absolute -bottom-2 -right-2 bg-[#4ADE80] rounded-full p-2">
                <Users className="w-4 h-4 text-white" />
              </div>
            </motion.div>

            {/* Info del canal */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                <h1 className="text-3xl font-bold text-[#F5F5F7]">
                  {channelInfo.title}
                </h1>
                {fromCache && (
                  <Badge className="bg-[#2A8CFF]/20 text-[#2A8CFF] border-[#2A8CFF]/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Desde cache
                  </Badge>
                )}
              </div>

              {aiSummary && (
                <p className="text-[#2A8CFF] text-lg mb-4 italic">
                  "{aiSummary}"
                </p>
              )}

              {/* Métricas globales */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#C93CFC]" />
                  <span className="text-[#A0A0A8]">Suscriptores:</span>
                  <span className="text-[#F5F5F7] font-bold">
                    {channelInfo.subscribers.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#2A8CFF]" />
                  <span className="text-[#A0A0A8]">Vistas totales:</span>
                  <span className="text-[#F5F5F7] font-bold">
                    {channelInfo.totalViews.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#FBBF24]" />
                  <span className="text-[#A0A0A8]">Creado:</span>
                  <span className="text-[#F5F5F7] font-bold">
                    {new Date(channelInfo.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {analyzedAt && (
                <p className="text-[#A0A0A8] text-xs mt-3">
                  Análisis realizado: {new Date(analyzedAt).toLocaleString('es-ES')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardHeader;
