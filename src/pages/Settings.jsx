import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Moon, 
  Globe, 
  Shield, 
  CreditCard,
  ChevronRight,
  Sparkles,
  Zap,
  LogOut
} from 'lucide-react'
import { motion } from 'framer-motion'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import Skeleton from '../components/ui/Skeleton'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { useLanguage } from '../context/LanguageContext'
import EditProfileModal from '../components/profile/EditProfileModal'
import LanguageModal from '../components/settings/LanguageModal'

const SettingsSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
    <div className="space-y-2">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-5 w-64" />
    </div>
    {[1, 2].map(i => (
      <div key={i} className="space-y-6">
        <Skeleton className="h-4 w-32 ml-4" />
        <div className="space-y-4">
          {[1, 2, 3].map(j => (
            <Skeleton key={j} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    ))}
  </div>
)

const Settings = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { language, setLanguage, t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [appSettings, setAppSettings] = useState({
    darkMode: true,
    notifications: true,
    aiModel: 'Advanced'
  })

  useEffect(() => {
    if (user) fetchProfile()
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [user])

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) setProfile(data)
  }

  const handleUpdateProfile = async (formData) => {
    const { error } = await supabase.from('profiles').update(formData).eq('id', user.id)
    if (!error) {
      setProfile({ ...profile, ...formData })
      showToast('Profile information updated!', 'success')
      setIsProfileModalOpen(false)
    }
  }

  const toggleSetting = (key) => {
    setAppSettings(prev => ({ ...prev, [key]: !prev[key] }))
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} updated!`, 'success')
  }

  if (loading) return <SettingsSkeleton />

  const sections = [
    { 
      title: 'General',
      items: [
        { label: 'Profile Information', icon: User, desc: 'Change your photo, name, and email', action: () => setIsProfileModalOpen(true) },
        { label: 'Appearance', icon: Moon, desc: 'Dark Mode, Glassmorphism enabled', type: 'toggle', value: appSettings.darkMode, key: 'darkMode' },
        { label: 'Language & Region', icon: Globe, desc: language, action: () => setIsLanguageModalOpen(true) },
      ]
    },
    { 
      title: 'Education & AI',
      items: [
        { label: 'AI Configuration', icon: Sparkles, desc: `Model: ${appSettings.aiModel}`, action: () => showToast('AI Tuning coming soon!', 'info') },
        { label: 'Study Goals', icon: SettingsIcon, desc: 'Manage your weekly study targets', path: '/goals' },
      ]
    },
    { 
      title: 'Security & Plans',
      items: [
        { label: 'Notifications', icon: Bell, desc: 'Configure push alerts', type: 'toggle', value: appSettings.notifications, key: 'notifications' },
        { label: 'Billing & Plans', icon: CreditCard, desc: 'Manage your subscription', action: () => showToast('Billing portal opening...', 'info') },
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 px-4 md:px-0">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-slate-400 font-medium">Manage your account and academic preferences.</p>
      </div>

      <div className="space-y-12">
        {sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-6 ml-4">{section.title}</h2>
            <div className="space-y-4">
              {section.items.map((item, j) => (
                <Glass 
                  key={j} 
                  className="p-1 border-white/5 hover:border-primary/30 transition-all cursor-pointer group overflow-hidden"
                  onClick={item.action}
                >
                  <div className="flex items-center justify-between p-4 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all duration-300">
                        <item.icon className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white text-lg group-hover:text-primary transition-colors">{item.label}</div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{item.desc}</div>
                      </div>
                    </div>
                    
                    {item.type === 'toggle' ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSetting(item.key); }}
                        className={cn(
                          "w-12 h-6 rounded-full p-1 transition-all duration-500 relative",
                          item.value ? "bg-primary" : "bg-slate-700"
                        )}
                      >
                        <motion.div
                          animate={{ x: item.value ? 24 : 0 }}
                          className="w-4 h-4 bg-white rounded-full shadow-lg"
                        />
                      </button>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    )}
                  </div>
                </Glass>
              ))}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-red-500/50 font-black mb-6 ml-4">Danger Zone</h2>
          <Glass className="p-1 border-red-500/10 hover:border-red-500/30 transition-all cursor-pointer group overflow-hidden" onClick={() => signOut()}>
            <div className="flex items-center justify-between p-4 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-500/5 group-hover:bg-red-500/10 transition-all duration-300">
                  <LogOut className="w-6 h-6 text-red-400 group-hover:text-red-500 transition-colors" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white text-lg group-hover:text-red-500 transition-colors">{t('logout')}</div>
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sign out of your account</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
            </div>
          </Glass>
        </div>
      </div>

      <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          AI Homework Helper v2.4.0 (Stable)
        </p>
        <Button variant="ghost" className="text-primary hover:bg-primary/10 text-xs font-black uppercase tracking-widest">
          <Zap className="w-4 h-4" />
          Check for updates
        </Button>
      </div>

      <EditProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSave={handleUpdateProfile}
      />
      <LanguageModal 
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={language}
        onSelect={(lang) => setLanguage(lang)}
      />
    </div>
  )
}

export default Settings
