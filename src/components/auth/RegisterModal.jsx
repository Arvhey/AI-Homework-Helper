import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, GraduationCap, Mail, Lock, User, ArrowRight, Github, Chrome, Brain, Sparkles, Zap } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { signUp } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        }
      }
    })

    setLoading(false)
    if (error) {
      showToast(error.message, 'error')
    } else {
      showToast('Registration successful! Please log in.', 'success')
      onClose()
      onSwitchToLogin()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dark-bg/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg z-10"
        >
          <Glass className="p-5 sm:p-8 border-white/20 bg-[#0f172a]/95 backdrop-blur-2xl ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden relative">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-5 scrollbar-thin">
              {/* Header */}
              <div className="text-center mt-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3 shadow-xl">
                  <GraduationCap className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Join the Future</h1>
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Create your study account</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
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
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
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

                <div className="pt-2">
                  <Button type="submit" variant="primary" className="w-full py-3.5 sm:py-4 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>

              <div>
                <div className="relative flex items-center justify-center mb-5">
                  <div className="border-t border-white/5 w-full" />
                  <span className="absolute bg-[#0f172a] px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 whitespace-nowrap">Register With</span>
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

              <p className="pb-2 text-center text-slate-500 font-medium text-[11px]">
                Already have an account?{' '}
                <button 
                  onClick={() => { onClose(); onSwitchToLogin(); }}
                  className="text-primary font-black hover:text-primary-light transition-colors"
                >
                  Log In
                </button>
              </p>
            </div>
          </Glass>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default RegisterModal
