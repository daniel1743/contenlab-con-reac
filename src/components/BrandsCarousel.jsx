import React from 'react';
import { motion } from 'framer-motion';

const BrandsCarousel = () => {
  const logos = ['Google', 'YouTube', 'Meta', 'TikTok', 'Twitch', 'Shopify'];
  const extendedLogos = [...logos, ...logos];

  return (
    <div className="py-12 overflow-hidden">
      <div className="relative w-full h-16">
        <motion.div className="absolute left-0 flex items-center" animate={{ x: ['0%', '-50%'] }} transition={{ ease: 'linear', duration: 20, repeat: Infinity }}>
          {extendedLogos.map((logo, index) => (
            <div key={index} className="flex-shrink-0 w-48 h-16 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-500 opacity-70">{logo}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BrandsCarousel;