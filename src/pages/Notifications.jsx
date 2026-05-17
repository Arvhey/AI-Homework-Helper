import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Check, 
  Trash2, 
  Zap, 
  Trophy, 
  Clock,
  Settings,
  Info,
  AlertTriangle,
  Loader2,
  Inbox
} from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { useToast } from '../hooks/useToast'
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) return interval + "y ago"
  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) return interval + "mo ago"
  interval = Math.floor(seconds / 86400)
  if (interval >= 1) return interval + "d ago"
  interval = Math.floor(seconds / 3600)
  if (interval >= 1) return interval + "h ago"
  interval = Math.floor(seconds / 60)
  if (interval >= 1) return interval + "m ago"
  return "just now"
}

const Notifications = () => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Real-time subscription
      const subscription = supabase
        .channel('notifications_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n))
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id))
          }
        })
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

      if (error) throw error
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (error) {
      showToast('Error marking as read', 'error')
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      showToast('All marked as read', 'success')
    } catch (error) {
      showToast('Error marking all as read', 'error')
    }
  }

  const deleteNotification = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      setNotifications(prev => prev.filter(n => n.id !== id))
      showToast('Notification deleted', 'success')
    } catch (error) {
      showToast('Error deleting notification', 'error')
    }
  }

  const clearAll = async () => {
    if (!window.confirm('Delete all notifications?')) return
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setNotifications([])
      showToast('All notifications cleared', 'success')
    } catch (error) {
      showToast('Error clearing notifications', 'error')
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'achievement': return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
      case 'alert': return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' }
      case 'info': return { icon: Info, color: 'text-primary', bg: 'bg-primary/10' }
      case 'zap': return { icon: Zap, color: 'text-accent', bg: 'bg-accent/10' }
      default: return { icon: Bell, color: 'text-slate-400', bg: 'bg-white/5' }
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Notifications...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Intelligence Alerts</h1>
          <p className="text-slate-500 font-medium">{notifications.length} Total Alerts in System</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="glass" 
            className="px-4 py-2 text-xs font-black uppercase tracking-widest"
            onClick={markAllAsRead}
            disabled={!notifications.some(n => !n.read)}
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </Button>
          <Button 
            variant="ghost" 
            className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/5">
            <Inbox className="w-10 h-10 text-slate-700" />
          </div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">System Clear</h3>
          <p className="text-slate-500 font-medium">No new alerts or notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((note) => {
              const { icon: Icon, color, bg } = getIcon(note.type)
              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Glass className={cn(
                    "p-6 flex items-start gap-6 group relative overflow-hidden transition-all duration-500",
                    !note.read ? "border-primary/20 bg-primary/5" : "opacity-60 border-transparent hover:opacity-100"
                  )}>
                    {!note.read && (
                      <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                    )}
                    
                    <div className={cn("w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center border border-white/5", bg)}>
                      <Icon className={cn("w-6 h-6", color)} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className={cn("text-lg font-black tracking-tight truncate", !note.read ? "text-white" : "text-slate-400")}>
                          {note.message}
                        </h3>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest whitespace-nowrap">
                          {timeAgo(note.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        {note.details || 'System generated update regarding your learning progress.'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      {!note.read && (
                        <button 
                          onClick={() => markAsRead(note.id)}
                          className="p-2.5 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/20"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(note.id)}
                        className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Glass>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default Notifications
