import React from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image, Star } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ThumbnailEvaluation = ({ videos }) => {
  if (!videos || videos.length === 0) return null;

  // Calcular score basado en engagement
  const getThumbnailScore = (video) => {
    const engagementRate = parseFloat(video.engagement);
    if (engagementRate >= 5) return 9;
    if (engagementRate >= 4) return 8;
    if (engagementRate >= 3) return 7;
    if (engagementRate >= 2) return 6;
    return 5;
  };

  const getScoreBadge = (score) => {
    if (score >= 8) return { color: 'bg-[#4ADE80]', text: 'Excelente' };
    if (score >= 6) return { color: 'bg-[#FBBF24]', text: 'Buena' };
    return { color: 'bg-[#EF4444]', text: 'Mejorable' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <Card className="bg-[#2A1B3D]/50 border-[#C93CFC]/20 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#F5F5F7]">
            <Image className="w-6 h-6 text-[#C93CFC]" />
            Evaluación de Miniaturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{ delay: 3000 }}
            className="thumbnail-swiper"
          >
            {videos.map((video, index) => {
              const score = getThumbnailScore(video);
              const badge = getScoreBadge(score);

              return (
                <SwiperSlide key={video.id}>
                  <div className="relative group">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-64 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay con info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1333] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end p-4">
                      <div className="w-full">
                        <p className="text-[#F5F5F7] font-bold text-sm mb-2 line-clamp-2">
                          {video.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className={`${badge.color} text-white`}>
                            {badge.text}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24]" />
                            <span className="text-[#F5F5F7] font-bold">
                              {score}/10
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badge de puntuación siempre visible */}
                    <div className="absolute top-4 right-4 bg-[#1C1333]/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#FBBF24] fill-[#FBBF24]" />
                      <span className="text-[#F5F5F7] font-bold text-sm">
                        {score}
                      </span>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <div className="mt-4 p-4 bg-[#1C1333]/50 rounded-lg">
            <p className="text-[#A0A0A8] text-sm">
              <span className="text-[#2A8CFF] font-bold">Análisis:</span> Las miniaturas se evalúan por claridad visual, contraste, y correlación con el engagement del video.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ThumbnailEvaluation;
