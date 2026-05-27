import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, ChevronRight, LogOut, User, Settings, Bell } from 'lucide-react'
import { cn } from '../ui/Glass'
import { useLanguage } from '../../context/LanguageContext'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../services/supabase'
import { NAV_ITEMS } from '../../utils/constants'

const DesktopSidebar = () => {
  const { t } = useLanguage()
  const { signOut, user } = useAuth()
  const { showToast } = useToast()
  const [unreadCount, setUnreadCount] = useState(0)

  React.useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const subscription = supabase
        .channel('sidebar_notifications')
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
    <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-[#0f172a] z-50">
      {/* Seamless Branding Header - Aligned with TopNavbar height */}
      <div className="h-16 flex items-center justify-between px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-black font-outfit tracking-tighter text-white uppercase">AI Helper</span>
        </div>

        <Link to="/notifications" className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
          <Bell className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-1.5 right-1.5 min-w-[12px] h-3 px-1 flex items-center justify-center bg-red-500 text-[7px] font-black text-white rounded-full border-2 border-[#0f172a] shadow-lg shadow-red-500/20"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Main Navigation Hub */}
      <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto no-scrollbar">
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 px-2">Navigation Console</div>
        {NAV_ITEMS.filter(item => item.label !== 'AI Assistant').map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
              isActive ? "bg-primary/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "group-hover:text-primary transition-colors")} />
                <span className="font-bold text-xs tracking-tight">{t(item.label.toLowerCase())}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-marker"
                    className="absolute left-0 w-1 h-5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Simplified Footer - Matching Navbar Aesthetic */}
      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/5 group">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-primary/20 overflow-hidden bg-white/5 p-0.5">
              <img 
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                alt="Avatar" 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-white truncate">{user?.email?.split('@')[0]}</div>
              <div className="text-[9px] font-black text-primary uppercase tracking-widest opacity-80">Pro Member</div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-all group border border-red-500/5"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t('logout')}</span>
          </div>
          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0" />
        </button>
      </div>
    </aside>
  )
}

export default DesktopSidebar
