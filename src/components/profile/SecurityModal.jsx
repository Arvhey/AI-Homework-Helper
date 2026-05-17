import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Lock, Smartphone, Laptop, Check } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'
import { supabase } from '../../services/supabase'
import { useToast } from '../../hooks/useToast'
import { useLanguage } from '../../context/LanguageContext'

const SecurityModal = ({ isOpen, onClose }) => {
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updating, setUpdating] = useState(false)
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!password) return showToast('Please enter a new password', 'error')
    if (password !== confirmPassword) return showToast('Passwords do not match', 'error')
    if (password.length < 6) return showToast('Password must be at least 6 characters', 'error')

    setUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      showToast('Password updated successfully!', 'success')
      setPassword('')
      setPassword('')
      onClose()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setUpdating(false)
    }
  }

  const toggle2FA = () => {
    setIs2FAEnabled(prev => !prev)
    showToast(
      !is2FAEnabled 
        ? 'Two-Factor Authentication simulated successfully!' 
        : 'Two-Factor Authentication disabled.', 
      'info'
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md z-10"
          >
            <Glass className="p-8 border-primary/20 shadow-2xl space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                  <Shield className="w-5 h-5 text-primary" />
                  Security Settings
                </h2>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" /> Change Password
                </h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="New Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[48px] bg-white/5 border border-white/10 rounded-2xl px-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[48px] bg-white/5 border border-white/10 rounded-2xl px-4 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full py-3 text-sm font-black"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>

              <div className="h-px bg-white/10" />

              {/* simulated 2FA settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-accent" /> Multi-Factor Auth (MFA)
                </h3>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div>
                    <div className="font-bold text-white text-sm">Authenticator App</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Get codes via Google Authenticator</div>
                  </div>
                  <button
                    onClick={toggle2FA}
                    className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
                      is2FAEnabled ? "bg-primary" : "bg-slate-700"
                    }`}
                  >
                    <motion.div
                      animate={{ x: is2FAEnabled ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Active Sessions list */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-secondary" /> Active Sessions
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                    <div className="flex items-center gap-3">
                      <Laptop className="w-4 h-4 text-primary" />
                      <div>
                        <div className="font-bold text-white">Windows Desktop (Chrome)</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Active Session</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Current
                    </span>
                  </div>
                </div>
              </div>
            </Glass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default SecurityModal
