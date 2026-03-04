import React, { useState } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';

import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Services from '../components/landing/Services';
import About from '../components/landing/About';
import Testimonials from '../components/landing/Testimonials';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';
import AppointmentBooking from '../components/landing/AppointmentBooking';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      
      {/* Barra de progresso */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-teal-600 z-50 origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <Navbar onOpenBooking={() => setShowBooking(true)} />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Hero onOpenBooking={() => setShowBooking(true)} />
        <Services />
        <About />
        <Testimonials />
        <Contact />
        <Footer />
      </motion.main>

      <AnimatePresence>
        {showBooking && (
          <AppointmentBooking onClose={() => setShowBooking(false)} />
        )}
      </AnimatePresence>

    </div>
  );
}

