
import React from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonialsData = {
  row1: [
    { name: "Carlos Rodriguez", role: "YouTuber", comment: "El editor de miniaturas es súper potente y fácil de usar. Mis CTRs han subido un 30%", rating: 5, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop" },
    { name: "María González", role: "Instagrammer", comment: "Las herramientas de IA han revolucionado mi flujo de trabajo creativo", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop" },
    { name: "Alex Gaming", role: "Streamer", comment: "ContentLab me ahorra horas de trabajo cada semana", rating: 5, avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=2080&auto=format&fit=crop" },
    { name: "Elena Petrova", role: "Content Strategist", comment: "El análisis de tendencias es increíblemente preciso. Imprescindible.", rating: 5, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop" },
  ],
  row2: [
    { name: "Sofia Creative", role: "TikToker", comment: "El generador de contenido IA es impresionante, siempre da ideas frescas", rating: 5, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop" },
    { name: "Diego Tech", role: "Tech Reviewer", comment: "Perfecto para crear contenido viral. Lo uso diariamente", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" },
    { name: "Luna Art", role: "Artista Digital", comment: "La interfaz es intuitiva y las funciones premium valen cada peso", rating: 5, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop" },
    { name: "Marco Bianchi", role: "Food Blogger", comment: "Desde que uso ContentLab, mi engagement se ha disparado. ¡Gracias!", rating: 5, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop" },
  ],
  row3: [
    { name: "Roberto Music", role: "Productor", comment: "Excelente para promocionar mis tracks con miniaturas profesionales", rating: 5, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop" },
    { name: "Ana Lifestyle", role: "Lifestyle Blogger", comment: "ContentLab ha mejorado significativamente la calidad de mi contenido", rating: 5, avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1972&auto=format&fit=crop" },
    { name: "Javier Fitness", role: "Coach Fitness", comment: "Herramientas increíbles para crear contenido motivacional", rating: 5, avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop" },
    { name: "Isabella Rossi", role: "Travel Vlogger", comment: "Planificar mis viajes y contenido nunca ha sido tan fácil. ¡Un salvavidas!", rating: 5, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop" },
  ]
};

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3, partialVisibilityGutter: 40 },
  tablet: { breakpoint: { max: 1024, min: 464 }, items: 2, partialVisibilityGutter: 30 },
  mobile: { breakpoint: { max: 464, min: 0 }, items: 1, partialVisibilityGutter: 30 }
};

const TestimonialCard = ({ name, role, comment, rating, avatar }) => (
  <motion.div 
    className="p-6 mx-2 h-full glass-effect border border-purple-500/20 rounded-2xl flex flex-col"
    whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center mb-4">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-400" />
      <div className="ml-4">
        <p className="font-bold text-white">{name}</p>
        <p className="text-sm text-gray-400">{role}</p>
      </div>
    </div>
    <p className="text-gray-300 italic flex-grow">"{comment}"</p>
    <div className="flex text-yellow-400 mt-4">
      {[...Array(rating)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
    </div>
  </motion.div>
);

const TestimonialsCarousel = () => {
  return (
    <section className="py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          viewport={{ once: true }} 
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Amado por Creadores como Tú</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">No solo lo decimos nosotros. Mira lo que nuestra comunidad opina.</p>
        </motion.div>
      </div>
      <div className="space-y-8">
        <Carousel
          responsive={responsive}
          infinite
          autoPlay
          autoPlaySpeed={4000}
          keyBoardControl
          customTransition="transform 500ms ease-in-out"
          containerClass="carousel-container"
          arrows={false}
        >
          {testimonialsData.row1.map((testimonial, index) => <TestimonialCard key={index} {...testimonial} />)}
        </Carousel>
        <Carousel
          responsive={responsive}
          infinite
          autoPlay
          autoPlaySpeed={4500}
          keyBoardControl
          customTransition="transform 500ms ease-in-out"
          containerClass="carousel-container"
          arrows={false}
          rtl
        >
          {testimonialsData.row2.map((testimonial, index) => <TestimonialCard key={index} {...testimonial} />)}
        </Carousel>
        <Carousel
          responsive={responsive}
          infinite
          autoPlay
          autoPlaySpeed={3500}
          keyBoardControl
          customTransition="transform 500ms ease-in-out"
          containerClass="carousel-container"
          arrows={false}
        >
          {testimonialsData.row3.map((testimonial, index) => <TestimonialCard key={index} {...testimonial} />)}
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
