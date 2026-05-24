import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Mail, Lock, ArrowRight, Github, Chrome, User, Download } from 'lucide-react'
import { Brain, Sparkles, Zap } from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { useInstall } from '../context/InstallContext'

import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const Login = () => {
  const navigate = useNavigate()
  const { signIn, signUp, user } = useAuth()
  const { showToast } = useToast()
  const { canInstall, installApp } = useInstall()
  const [mode, setMode] = React.useState('login') // 'login' or 'register'
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    fullName: ''
  })
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

  // Loading Splash Screen State (Desktop & Mobile)
  const [showSplash, setShowSplash] = React.useState(true)
  const [splashStep, setSplashStep] = React.useState('first') // 'first' or 'second'

  React.useEffect(() => {
    if (showSplash) {
      // Step 1: Counter-clockwise spinner for the first 1.5 seconds
      const stepTimer = setTimeout(() => {
        setSplashStep('second')
      }, 1500)

      // Step 2: Fade out splash and show login form at 3 seconds
      const closeTimer = setTimeout(() => {
        setShowSplash(false)
      }, 3000)

      return () => {
        clearTimeout(stepTimer)
        clearTimeout(closeTimer)
      }
    }
  }, [showSplash])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn({
        email: formData.email,
        password: formData.password,
      })
      setLoading(false)
      if (error) {
        showToast(error.message, 'error')
      } else {
        showToast('Welcome back!', 'success')
        navigate('/dashboard', { replace: true })
      }
    } else {
      const { error } = await signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.fullName }
        }
      })
      setLoading(false)
      if (error) {
        showToast(error.message, 'error')
      } else {
        showToast('Registration successful! Please log in.', 'success')
        setMode('login')
      }
    }
  }

  if (user) {
    return null
  }

  if (showSplash) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center relative overflow-hidden px-4 select-none">
        {/* Decorative Blur Glows */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 w-72 h-72 bg-accent/15 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
          {/* Dual-Rotating Concentric Spinners */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Spinner 1: Outer Ring (Solid, Rotating Clockwise, active immediately) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: 360
              }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                rotate: { repeat: Infinity, duration: 1.8, ease: 'linear' }
              }}
              className="absolute inset-0 rounded-full border-[5px] border-t-primary border-r-transparent border-b-primary/20 border-l-transparent"
            />

            {/* Spinner 2: Inner Ring (Dashed, Rotating Counter-Clockwise, active immediately) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 0.8,
                rotate: -360
              }}
              transition={{ 
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                rotate: { repeat: Infinity, duration: 1.2, ease: 'linear' }
              }}
              className="absolute inset-0 rounded-full border-[4px] border-dashed border-t-accent border-r-transparent border-b-accent/30 border-l-transparent"
            />

            {/* Central Gentle Float Icon */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-18 h-18 rounded-[24px] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30 relative z-10"
            >
              <GraduationCap className="text-white w-9 h-9" />
            </motion.div>
          </div>

          {/* Core Brand Title and Loading Steps */}
          <div className="space-y-2">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-black text-white tracking-tight"
            >
              AI Homework Helper
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.25em] h-4"
            >
              {splashStep === 'first' ? 'Loading Study Modules...' : 'Configuring Intelligence Hub...'}
            </motion.p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-bg selection:bg-primary/30">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary/5 items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[150px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10 text-center space-y-8 max-w-lg"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 relative group">
            <GraduationCap className="text-white w-12 h-12 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12" />
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
            {mode === 'login' ? 'Master Your Studies with' : 'Start Your Success'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x">
              {mode === 'login' ? 'AI Intelligence' : 'Story Today'}
            </span>
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed px-8">
            {mode === 'login'
              ? 'Join thousands of students who are already crushing their academic goals with our smart study companion.'
              : 'Create your account and unlock a world of AI-powered study tools designed to help you excel.'}
          </p>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-hidden">
        {/* Mobile Glows */}
        <div className="md:hidden absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full" />
        </div>

        {/* Mobile Install App Banner - OUTSIDE the login form, ONLY in login mode */}
        {canInstall && mode === 'login' && (
          <motion.div
            onClick={installApp}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden w-full max-w-md mb-5 z-20 px-1 cursor-pointer active:scale-[0.98] transition-transform duration-200"
          >
            <Glass className="p-4 border-accent/20 bg-gradient-to-r from-accent/10 via-primary/5 to-transparent backdrop-blur-xl relative overflow-hidden flex items-center justify-between gap-4 shadow-lg shadow-accent/5 rounded-2xl">
              {/* Decorative Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 blur-2xl rounded-full" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/25 shrink-0">
                  <Download className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div className="text-left">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    AI Homework Helper <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                  </h3>
                  <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-tight">
                    Get Access & Fullscreen
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="py-2 px-3 text-[9px] font-black uppercase tracking-wider shadow-md shadow-accent/20 shrink-0 bg-gradient-to-r from-accent via-primary to-accent border border-white/10 rounded-xl text-white transition-all active:scale-95 z-20"
              >
                Install App
              </button>
            </Glass>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-md relative z-10"
          >
            <Glass className="p-6 sm:p-8 border-white/20 bg-white/[0.02] backdrop-blur-2xl ring-1 ring-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              {/* Logo Section */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 shadow-xl">
                  <GraduationCap className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  {mode === 'login' ? 'Welcome Back' : 'Join the Future'}
                </h1>
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-widest mt-1">
                  {mode === 'login' ? 'Continue your journey' : 'Create your account'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-medium"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500">Password</label>
                    {mode === 'login' && (
                      <a href="#" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary-light transition-colors">Forgot?</a>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full py-4 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20" disabled={loading}>
                  {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="border-t border-white/5 w-full" />
                  <span className="absolute bg-[#0f172a] px-4 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 whitespace-nowrap">
                    {mode === 'login' ? 'Or Continue With' : 'Register With'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="glass" className="py-3 text-[9px] font-black uppercase tracking-widest">
                    <Chrome className="w-4 h-4" />
                    Google
                  </Button>
                  <Button variant="glass" className="py-3 text-[9px] font-black uppercase tracking-widest">
                    <Github className="w-4 h-4" />
                    Github
                  </Button>
                </div>
              </div>

              <p className="mt-6 text-center text-slate-500 font-medium text-[11px]">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-primary font-black hover:text-primary-light transition-colors"
                >
                  {mode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </Glass>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Login
