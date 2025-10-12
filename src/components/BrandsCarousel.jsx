import React from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaYoutube, FaFacebook, FaTiktok, FaInstagram, FaTwitter } from 'react-icons/fa';
import { SiTiktok } from 'react-icons/si';

const brands = [
  { name: 'Google AI', Icon: FaGoogle, color: '#4285F4' },
  { name: 'YouTube', Icon: FaYoutube, color: '#FF0000' },
  { name: 'Meta/Facebook', Icon: FaFacebook, color: '#1877F2' },
  { name: 'Instagram', Icon: FaInstagram, color: '#E4405F' },
  { name: 'TikTok', Icon: SiTiktok, color: '#000000' },
  { name: 'Twitter/X', Icon: FaTwitter, color: '#1DA1F2' }
];

// Duplicar el array para loop infinito sin saltos
const duplicatedBrands = [...brands, ...brands];

const BrandsCarousel = () => {
  return (
    <div className="py-16 overflow-hidden bg-gray-900">
      <div className="text-center mb-12">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-400 mb-2">
          Integrado con tus plataformas favoritas
        </h3>
        <p className="text-gray-500">Publica directamente en las redes sociales más importantes</p>
      </div>

      <div className="relative w-full h-32">
        {/* Gradientes para fade effect en los bordes */}
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-gray-900 to-transparent z-10"></div>

        <motion.div
          className="absolute left-0 flex items-center gap-20"
          animate={{ x: [0, -1 * (brands.length * 220)] }}
          transition={{
            ease: 'linear',
            duration: 30,
            repeat: Infinity,
            repeatType: 'loop'
          }}
        >
          {duplicatedBrands.map((brand, index) => (
            <div
              key={`brand-${index}`}
              className="flex-shrink-0 w-48 flex flex-col items-center justify-center gap-3 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <brand.Icon
                  size={56}
                  style={{ color: brand.color }}
                  className="relative drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors duration-300">
                {brand.name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default BrandsCarousel;
