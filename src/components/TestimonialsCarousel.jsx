import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonialsData = [
  {
    name: "Carlos Rodríguez",
    role: "YouTuber",
    comment: "El editor de miniaturas es súper potente y fácil de usar. Mis CTRs han subido un 30%.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop"
  },
  {
    name: "María González",
    role: "Instagrammer",
    comment: "Las herramientas de IA han revolucionado mi flujo de trabajo creativo.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
  },
  {
    name: "Elena Petrova",
    role: "Estratega de contenido",
    comment: "El análisis de tendencias es increíblemente preciso. Imprescindible.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop"
  },
  {
    name: "Diego Tech",
    role: "Revisor de tecnología",
    comment: "Perfecto para crear contenido viral. Lo uso todos los días.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop"
  },
  {
    name: "Ana Estilo de vida",
    role: "Bloguera de estilo de vida",
    comment: "ContentLab ha mejorado muchísimo la calidad de mi contenido.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1972&auto=format&fit=crop"
  }
];

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3, partialVisibilityGutter: 40 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 2, partialVisibilityGutter: 30 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1, partialVisibilityGutter: 30 }
};

const cardVariants = {
  offscreen: { y: 30, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", bounce: 0.25, duration: 0.7 }
  },
  hover: {
    scale: 1.06,
    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)",
    transition: { type: "spring", stiffness: 320, damping: 25 }
  }
};

const TestimonialCard = ({ name, role, comment, rating, avatar }) => (
  <motion.div
    className="w-full max-w-sm mx-auto h-[420px] bg-gray-800 bg-opacity-70 rounded-3xl p-8 flex flex-col items-center text-center cursor-pointer glass-effect border border-purple-500/30 shadow-lg"
    initial="offscreen"
    whileInView="onscreen"
    viewport={{ once: true, amount: 0.3 }}
    whileHover="hover"
    variants={cardVariants}
  >
    <img
      src={avatar}
      alt={name}
      className="w-20 h-20 rounded-full object-cover border-4 border-purple-400 shadow-md mb-6 flex-shrink-0"
    />
    <h3 className="text-white font-semibold text-xl mb-1 flex-shrink-0">{name}</h3>
    <p className="text-purple-300 text-sm mb-4 flex-shrink-0">{role}</p>
    <p className="text-gray-300 italic mb-6 leading-relaxed flex-grow flex items-center">"{comment}"</p>
    <div className="flex space-x-1 text-yellow-400 flex-shrink-0">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-6 h-6 fill-current" />
      ))}
    </div>
  </motion.div>
);

const TestimonialsCarousel = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Amado por Creadores como Tú
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            No lo decimos solo nosotros, mira lo que nuestra comunidad opina.
          </p>
        </motion.div>
      </div>

      <div className="py-8">
        <Carousel
          responsive={responsive}
          infinite
          autoPlay
          autoPlaySpeed={4500}
          keyBoardControl
          customTransition="transform 600ms cubic-bezier(0.45, 0, 0.55, 1)"
          containerClass="carousel-container"
          removeArrowOnDeviceType={["tablet", "mobile"]}
          itemClass="carousel-item-padding-40-px py-4"
          arrows={false}
        >
          {testimonialsData.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
