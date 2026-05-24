import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react'
import { Brain, Sparkles, Zap } from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'

import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'

const Register = () => {
  const navigate = useNavigate()
  const { signUp, user } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = React.useState({ fullName: '', email: '', password: '' })
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, navigate])

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
      // User must log in after registering
      showToast('Registration successful! Please log in.', 'success')
      navigate('/login')
    }
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-dark-bg selection:bg-primary/30">
      {/* Visual Side - Hidden on Mobile */}
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
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-2xl shadow-primary/30">
            <GraduationCap className="text-white w-12 h-12" />
          </div>
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
            Start Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x">Success Story</span> Today
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed px-8">
            Create your account and unlock a world of AI-powered study tools designed to help you excel.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-8 px-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl">
              <div className="text-primary font-black text-2xl mb-1">10k+</div>
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Active Students</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl">
              <div className="text-secondary font-black text-2xl mb-1">98%</div>
              <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Success Rate</div>
            </div>
          </div>
        </motion.div>

        {/* Floating Decorative Elements with Icons */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-3xl animate-float flex items-center justify-center shadow-2xl">
          <Brain className="text-primary/50 w-8 h-8" />
        </div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 border border-white/5 rounded-[3rem] backdrop-blur-3xl animate-float-delayed flex items-center justify-center shadow-2xl">
          <Sparkles className="text-secondary/50 w-12 h-12" />
        </div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/5 border border-white/10 rounded-full backdrop-blur-3xl animate-float flex items-center justify-center">
          <Zap className="text-yellow-500/30 w-6 h-6" />
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 relative overflow-hidden">
        {/* Mobile Background Glows */}
        <div className="md:hidden absolute inset-0 z-0">
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <Glass className="p-5 sm:p-7 border-white/20 bg-white/[0.02] backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl">
            {/* Mobile Logo */}
            <div className="md:hidden flex flex-col items-center mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-1 shadow-xl">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <h1 className="text-lg font-black text-white uppercase tracking-tighter">AI Helper</h1>
            </div>

            <div className="mb-4 text-center md:text-left">
              <h1 className="text-xl font-black text-white mb-0.5 tracking-tight">Join the Future</h1>
              <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Create your study account</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="pt-1">
                <Button type="submit" variant="primary" className="w-full py-3 text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/20" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            <div className="mt-4">
              <div className="relative flex items-center justify-center mb-4">
                <div className="border-t border-white/5 w-full" />
                <span className="absolute bg-[#0f172a] px-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 whitespace-nowrap">Register With</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="glass" className="py-2.5 text-[9px] font-black uppercase tracking-widest">
                  <Chrome className="w-4 h-4" />
                  Google
                </Button>
                <Button variant="glass" className="py-2.5 text-[9px] font-black uppercase tracking-widest">
                  <Github className="w-4 h-4" />
                  Github
                </Button>
              </div>
            </div>

            <p className="mt-4 text-center text-slate-500 font-medium text-[11px]">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-black hover:text-primary-light transition-colors">Log In</Link>
            </p>
          </Glass>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
