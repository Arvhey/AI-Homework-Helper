import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, LogOut, Bell, User, Settings, Search } from 'lucide-react'
import { cn } from '../ui/Glass'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../services/supabase'
import Button from '../ui/Button'

const TopNavbar = () => {
  const { t } = useLanguage()
  const { signOut } = useAuth()
  const { showToast } = useToast()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  React.useEffect(() => {
    if (user) {
      fetchUnreadCount()
      
      const subscription = supabase
        .channel('nav_notifications')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => fetchUnreadCount())
        .subscribe()

      return () => supabase.removeChannel(subscription)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)
    
    setUnreadCount(count || 0)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      showToast('Logged out successfully', 'success')
    } catch (error) {
      showToast('Error logging out', 'error')
    }
  }

  return (
    <nav className="fixed top-0 left-0 lg:left-72 right-0 z-40 bg-[#0f172a] px-4 lg:px-8 h-16 flex items-center">
      <div className="w-full flex items-center justify-between">
        {/* Mobile Logo */}
        <div className="flex lg:hidden items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-black font-outfit tracking-tight text-white uppercase">AI Helper</span>
        </div>

        {/* Global Intelligence Bar (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl w-full max-w-md group focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search across your intelligence system..." 
              className="bg-transparent border-none outline-none text-xs text-white placeholder:text-slate-600 w-full font-medium"
            />
          </div>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            System Active
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2 md:gap-4 relative">
          <Link to="/notifications" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors relative group">
            <Bell className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-2 right-2 min-w-[14px] h-3.5 px-1 flex items-center justify-center bg-red-500 text-[8px] font-black text-white rounded-full border-2 border-[#0f172a] shadow-lg shadow-red-500/20"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border",
                isProfileOpen ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]" : "border-white/10 bg-white/5 hover:border-white/20"
              )}
            >
              <User className={cn("w-5 h-5 transition-colors", isProfileOpen ? "text-primary" : "text-slate-400")} />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setIsProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                  >
                    <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
                      <User className="w-4 h-4 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">{t('profile')}</span>
                    </Link>
                    <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group">
                      <Settings className="w-4 h-4 group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium">{t('settings')}</span>
                    </Link>
                    <div className="h-px bg-white/5 my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all group">
                      <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                      <span className="text-sm font-medium">{t('logout')}</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopNavbar
