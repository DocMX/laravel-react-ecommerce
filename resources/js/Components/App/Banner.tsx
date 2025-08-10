import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const backgroundImages = [
  '/img/ban1.avif',
  '/img/ban2.avif',
  '/img/ban3.avif',
  '/img/ban4.avif',
  ];

// This component displays a banner with a rotating background image and animated text.
// It uses Framer Motion for animations and transitions.  


export default function Banner() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex h-[400px] items-center justify-center overflow-hidden bg-gray-900 text-white"
    >
      <motion.div
        key={currentImageIndex}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImages[currentImageIndex]})`
        }}
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 1.5,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
      </motion.div>
      <motion.div
        className="relative z-10 max-w-6xl px-4 text-center"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2,
              delayChildren: 0.4,
            },
          },
        }}
      >
        <motion.h1
          className="mb-6 text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
          variants={{
            hidden: { y: 50, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
              },
            },
          }}
        >
          Premium Products for <span className="text-indigo-400">Your Lifestyle</span>
        </motion.h1>

        <motion.p
          className="mx-auto mb-10 max-w-2xl text-lg md:text-xl lg:text-2xl"
          variants={{
            hidden: { y: 30, opacity: 0 },
            visible: {
              y: 0,
              opacity: 1,
              transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
                delay: 0.2,
              },
            },
          }}
        >
          Discover the best deals on high-quality products curated just for you.
        </motion.p>

        <motion.div
          variants={{
            hidden: { scale: 0.8, opacity: 0 },
            visible: {
              scale: 1,
              opacity: 1,
              transition: {
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.4,
              },
            },
          }}
        >
          <button className="rounded-full bg-indigo-600 px-10 py-4 text-lg font-medium tracking-wide transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30">
            Shop Now
          </button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}