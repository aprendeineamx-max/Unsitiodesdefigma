import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './components/ThemeProvider';
import { LanguageProvider, useLanguage } from './components/LanguageProvider';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { QuickAccess } from './components/QuickAccess';
import { ServicesByPersona } from './components/ServicesByPersona';
import { NewsSection } from './components/NewsSection';
import { AgendaSection } from './components/AgendaSection';
import { TransparencySection } from './components/TransparencySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { FloatingButtons } from './components/FloatingButtons';

// Apple-style Loading Component
function AppleLoadingScreen() {
  const { t } = useLanguage();
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        scale: 1.05,
      }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="text-center">
        {/* Apple-style loading ring */}
        <motion.div
          className="relative w-16 h-16 mx-auto mb-8"
        >
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-muted"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-br from-primary to-emerald-600 opacity-20"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.h2
            className="text-xl mb-2 font-semibold text-foreground"
          >
            {t.loading_title}
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {t.loading_subtitle}
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Apple-style Page Transition
function ApplePageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: 20,
        scale: 0.98
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1
      }}
      exit={{ 
        opacity: 0, 
        y: -10,
        scale: 1.02
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.23, 1, 0.32, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Apple-style loading duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Enable smooth scrolling with Apple-style behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Preload critical images
    const imagesToPreload = [
      'https://images.unsplash.com/photo-1555212697-194d092e3b8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ];
    
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Section animation variants with Apple-style easing
  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      y: 40,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  return (
    <div className="min-h-screen relative bg-background">
      <AnimatePresence mode="wait">
        {isLoading && <AppleLoadingScreen key="loading" />}
      </AnimatePresence>

      <AnimatePresence>
        {!isLoading && (
          <ApplePageTransition key="main">
            {/* Header with absolute positioning to not interfere with hero */}
            <div className="relative z-50">
              <Header />
            </div>
            
            {/* Hero section - full screen without padding conflicts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <HeroSection />
            </motion.div>
            
            {/* Main content sections */}
            <main className="relative z-10">
              {/* Staggered section animations */}
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <QuickAccess />
              </motion.div>
              
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <ServicesByPersona />
              </motion.div>
              
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <NewsSection />
              </motion.div>
              
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <AgendaSection />
              </motion.div>
              
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <TransparencySection />
              </motion.div>
              
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <TestimonialsSection />
              </motion.div>
            </main>
            
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Footer />
            </motion.div>
            
            <FloatingButtons />
          </ApplePageTransition>
        )}
      </AnimatePresence>

      {/* Apple-style scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 w-full h-0.5 bg-primary z-50 origin-left"
        style={{
          scaleX: typeof window !== 'undefined' 
            ? window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) 
            : 0
        }}
        initial={{ scaleX: 0 }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}