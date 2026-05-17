import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  GraduationCap, 
  Sparkles, 
  Bot, 
  Zap, 
  ChevronRight,
  Github,
  Twitter,
  Globe,
  Menu,
  X
} from 'lucide-react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Glass, { cn } from '../components/ui/Glass'
import { useLanguage } from '../context/LanguageContext'

import { useAuth } from '../hooks/useAuth'
import AuthModal from '../components/auth/AuthModal'

const LandingPage = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' })
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // If mobile or logged in, bypass landing page
  if (isMobile || user) {
    return <Navigate to={user ? "/dashboard" : "/login"} replace />
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const navLinks = [
    { name: t('features'), href: '#features' },
    { name: t('how_it_works'), href: '#how-it-works' },
    { name: t('pricing'), href: '#pricing' }
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-dark-bg selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 backdrop-blur-xl bg-dark-bg/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black text-white font-outfit tracking-tight">AI Helper</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} className="hover:text-primary transition-all hover:tracking-[0.3em]">
                {link.name}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            <button 
              onClick={() => setAuthModal({ isOpen: true, mode: 'login' })}
              className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-white hover:text-primary transition-colors"
            >
              {t('login')}
            </button>
            <Button 
              variant="primary" 
              className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5"
              onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
            >
              {t('get_started')}
            </Button>
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden absolute top-full left-0 right-0 bg-dark-bg/95 border-b border-white/10 backdrop-blur-2xl overflow-hidden"
            >
              <div className="p-8 flex flex-col gap-6 items-center">
                {navLinks.map(link => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    className="text-white font-black uppercase tracking-widest text-sm hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                ))}
                <div className="w-full h-px bg-white/5 my-2" />
                <Link 
                  to="/login" 
                  className="text-white font-black uppercase tracking-widest text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('login')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto relative">
        {/* Animated Background Elements */}
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse -z-10" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 blur-[150px] rounded-full -z-10" />

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-10"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-primary-light font-black text-[10px] uppercase tracking-[0.2em] backdrop-blur-xl shadow-2xl"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Future of Learning is Here</span>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-7xl lg:text-[8rem] font-black text-white leading-[1.1] font-outfit tracking-tighter"
          >
            {t('hero_title_1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x">{t('hero_title_2')}</span>,<br />
            {t('hero_title_3')}
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed px-4"
          >
            {t('hero_subtitle')}
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 px-6"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto text-[11px] font-black uppercase tracking-widest px-10 py-5 group shadow-2xl shadow-primary/30">
                {t('join_students')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="glass" className="w-full sm:w-auto text-[11px] font-black uppercase tracking-widest px-10 py-5">
              {t('watch_demo')}
            </Button>
          </motion.div>

          {/* Floating UI Preview */}
          <motion.div 
            variants={itemVariants}
            className="mt-24 relative max-w-5xl mx-auto px-4"
          >
            <div className="absolute inset-0 bg-primary/10 blur-[100px] -z-10 transform scale-75" />
            <Glass className="p-2 md:p-4 border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.1)] rounded-[2.5rem] bg-white/[0.02]">
              <div className="rounded-[1.8rem] overflow-hidden border border-white/5 aspect-video relative">
                <img 
                  src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=2070" 
                  alt="Dashboard Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/80 via-transparent to-transparent" />
              </div>
            </Glass>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight uppercase">{t('features_title')}</h2>
          <p className="text-slate-400 max-w-lg mx-auto font-medium">{t('features_subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {[
            { 
              title: t('ai_assistant_title'), 
              desc: t('ai_assistant_desc'), 
              icon: Bot, 
              color: 'text-primary',
              bg: 'bg-primary/10'
            },
            { 
              title: t('smart_quizzes_title'), 
              desc: t('smart_quizzes_desc'), 
              icon: Zap, 
              color: 'text-yellow-500',
              bg: 'bg-yellow-500/10'
            },
            { 
              title: t('focus_tracking_title'), 
              desc: t('focus_tracking_desc'), 
              icon: GraduationCap, 
              color: 'text-secondary',
              bg: 'bg-secondary/10'
            }
          ].map((feature, i) => (
            <Glass key={i} className="p-10 group hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:rotate-6", feature.bg)}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm font-medium">{feature.desc}</p>
            </Glass>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 px-6 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black text-white font-outfit tracking-tighter">AI Helper</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest max-w-[200px] text-center md:text-left">
              Empowering students with AI intelligence.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors hover:tracking-[0.3em]">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors hover:tracking-[0.3em]">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors hover:tracking-[0.3em]">Contact Us</a>
          </div>

          <div className="flex gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer group">
              <Twitter className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer group">
              <Github className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 text-center text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
          &copy; 2026 AI Homework Helper. Build with intelligence.
        </div>
      </footer>
      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialMode={authModal.mode}
      />
    </div>
  )
}

export default LandingPage
