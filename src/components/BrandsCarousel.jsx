import React from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaYoutube, FaFacebook, FaTiktok, FaShopify } from 'react-icons/fa';

const logos = [
  { name: 'Google', Icon: FaGoogle, color: '#4285F4' },
  { name: 'YouTube', Icon: FaYoutube, color: '#FF0000' },
  { name: 'Meta', Icon: FaFacebook, color: '#1877F2' },
  { name: 'TikTok', Icon: FaTiktok, color: '#000000' },
  { name: 'Shopify', Icon: FaShopify, color: '#96bf48' }
];

// Agregamos dos copias del primer logo para que se vea 2 veces al final y al inicio
const extendedLogos = [...logos, ...logos, logos[0]];

const BrandsCarousel = () => {
  return (
    <div className="py-12 overflow-hidden bg-gray-900">
      <div className="relative w-full h-20">
        <motion.div
          className="absolute left-0 flex items-center space-x-16"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ ease: 'linear', duration: 60, repeat: Infinity }}
        >
          {extendedLogos.map(({ Icon, name, color }, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-48 h-20 flex items-center justify-center"
              title={name}
            >
              <Icon size={48} color={color} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BrandsCarousel;
