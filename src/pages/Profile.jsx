import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  Shield, 
  CreditCard, 
  LogOut,
  Mail,
  MapPin,
  Camera,
  Star,
  Award,
  ChevronRight,
  Loader2
} from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { useToast } from '../hooks/useToast'
import Skeleton from '../components/ui/Skeleton'
import EditProfileModal from '../components/profile/EditProfileModal'
import SettingsModal from '../components/profile/SettingsModal'
import { useLanguage } from '../context/LanguageContext'

const ProfileSkeleton = () => (
  <div className="max-w-4xl mx-auto space-y-8 py-8 animate-pulse px-4 md:px-0">
    <Glass className="p-8 lg:p-12 space-y-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <Skeleton className="w-32 h-32 rounded-3xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-64 rounded-md" />
          <div className="flex gap-6">
            <Skeleton className="h-4 w-32 rounded-sm" />
            <Skeleton className="h-4 w-32 rounded-sm" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-8">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    </Glass>
    <div className="grid md:grid-cols-2 gap-8">
      <Skeleton className="h-64 rounded-3xl" />
      <Skeleton className="h-64 rounded-3xl" />
    </div>
  </div>
)

const Profile = () => {
  const { user, signOut } = useAuth()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ quizzes: 0, notes: 0, xp: 0 })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  const [uploading, setUploading] = useState(false)
  const fileInputRef = React.useRef()

  useEffect(() => {
    if (user) fetchProfileData()
  }, [user])

  const handleAvatarUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl })
      showToast(t('success'), 'success')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      showToast(t('error'), 'error')
    } finally {
      setUploading(false)
    }
  }
  
  const handleUpdateProfile = async (formData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

      if (error) throw error
      setProfile({ ...profile, ...formData })
      showToast(t('success'), 'success')
      setIsEditModalOpen(false)
    } catch (error) {
      showToast(t('error'), 'error')
    }
  }

  const fetchProfileData = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      const [quizRes, noteRes] = await Promise.all([
        supabase.from('quizzes').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('notes').select('id', { count: 'exact' }).eq('user_id', user.id)
      ])

      setStats({
        quizzes: quizRes.count || 0,
        notes: noteRes.count || 0,
        xp: (quizRes.count || 0) * 100
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      showToast(t('logout'), 'success')
    } catch (error) {
      showToast(t('error'), 'error')
    }
  }

  if (loading) return <ProfileSkeleton />

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 py-4 md:py-8 px-4 md:px-0 pb-24 lg:pb-8">
      {/* Profile Header */}
      <Glass className="p-6 md:p-8 lg:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-primary via-accent to-secondary p-1 shadow-2xl relative">
              <div className="w-full h-full rounded-[22px] bg-dark-bg flex items-center justify-center overflow-hidden border-2 border-[#0f172a]">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <img 
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-1.5 md:p-2 rounded-xl bg-primary text-white shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-20"
            >
              <Camera className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3 md:mb-4">
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                {profile?.full_name || 'Anonymous Learner'}
              </h1>
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1 w-fit mx-auto md:mx-0 border border-primary/20">
                <Star className="w-3 h-3 fill-current" /> Pro Student
              </span>
            </div>
            <div className="flex flex-col md:flex-row flex-wrap justify-center md:justify-start gap-2 md:gap-6 text-slate-400 font-medium text-xs md:text-sm">
              <span className="flex items-center gap-2 justify-center md:justify-start"><Mail className="w-3.5 h-3.5 text-primary" /> {user?.email}</span>
              <span className="flex items-center gap-2 justify-center md:justify-start"><MapPin className="w-3.5 h-3.5 text-accent" /> {profile?.school || 'Not specified'}</span>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex flex-col gap-3 w-auto mt-0">
            <Button variant="primary" className="shadow-lg shadow-primary/20 py-3 text-sm px-6" onClick={() => setIsEditModalOpen(true)}>
              {t('edit_profile')}
            </Button>
            <Button variant="glass" className="py-3 text-sm px-6" onClick={() => setIsSettingsModalOpen(true)}>
              {t('settings')}
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden w-full mt-4 flex flex-col gap-3">
            <Button variant="primary" className="w-full shadow-lg shadow-primary/20 py-4 text-sm font-black uppercase tracking-widest" onClick={() => setIsEditModalOpen(true)}>
              {t('edit_profile')}
            </Button>
            
            <div className="relative w-full">
              <button 
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="w-full flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-[10px] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  Secondary Actions
                </div>
                <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", isActionsOpen ? "rotate-90" : "")} />
              </button>

              <AnimatePresence>
                {isActionsOpen && (
                  <>
                    <div className="fixed inset-0 z-[40]" onClick={() => setIsActionsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 right-0 top-full mt-3 z-[50] bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-1"
                    >
                      <button 
                        onClick={() => {
                          setIsActionsOpen(false)
                          setIsSettingsModalOpen(true)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                      >
                        <Settings className="w-4 h-4 group-hover:text-accent transition-colors" />
                        <span className="text-sm font-bold">{t('settings')}</span>
                      </button>

                      <div className="h-px bg-white/5 my-1" />

                      <button 
                        onClick={() => {
                          setIsActionsOpen(false)
                          handleSignOut()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-all group"
                      >
                        <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span className="text-sm font-bold">{t('logout')}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-12 border-t border-white/5 pt-8">
          <div className="text-center group cursor-pointer">
            <div className="text-2xl md:text-3xl font-black text-white group-hover:text-primary transition-colors">{stats.quizzes}</div>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{t('quiz')}</div>
          </div>
          <div className="text-center border-x border-white/5 group cursor-pointer">
            <div className="text-2xl md:text-3xl font-black text-white group-hover:text-accent transition-colors">{stats.notes}</div>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{t('notes')}</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="text-2xl md:text-3xl font-black text-white group-hover:text-secondary transition-colors">
              {stats.xp >= 1000 ? `${(stats.xp / 1000).toFixed(1)}k` : stats.xp}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">{t('study_xp')}</div>
          </div>
        </div>
      </Glass>

      <div className="grid md:grid-cols-2 gap-8">
        <Glass className="p-8 border-white/5">
          <h2 className="text-xl font-black text-white mb-8 flex items-center gap-2 uppercase tracking-tight">
            <Award className="w-6 h-6 text-yellow-500" />
            {t('badges')}
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center group cursor-help hover:bg-white/5 transition-all">
                <Award className={cn(
                  "w-10 h-10 transition-all duration-500 group-hover:rotate-12",
                  i <= (stats.quizzes > 0 ? 3 : 1) ? "text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" : "text-slate-700 grayscale"
                )} />
              </div>
            ))}
          </div>
        </Glass>

        <div className="space-y-6">
          <Glass className="p-6 space-y-2 border-white/5">
            <h2 className="text-xl font-black text-white mb-6 px-4 uppercase tracking-tight">{t('my_profile')}</h2>
            {[
              { label: 'Security', icon: Shield, desc: 'Passwords & 2FA' },
              { label: 'Billing', icon: CreditCard, desc: 'Manage subscription' },
              { label: 'Preferences', icon: Settings, desc: 'Theme & Language' },
            ].map((item) => (
              <button key={item.label} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-primary/20 transition-all duration-300">
                    <item.icon className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-primary transition-colors">{item.label}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{item.desc}</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </button>
            ))}
          </Glass>
          
          <Button 
            variant="glass" 
            onClick={handleSignOut}
            className="w-full text-red-400 hover:bg-red-500 hover:text-white border-red-500/20 py-4 font-black uppercase tracking-widest text-xs transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            {t('logout')}
          </Button>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleUpdateProfile}
      />
      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  )
}

export default Profile
