import React from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  Flame, 
  Clock, 
  BookOpen, 
  ArrowUpRight, 
  Brain,
  Calendar
} from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import Skeleton from '../components/ui/Skeleton'

const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header Skeleton */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64 md:w-80" />
        <Skeleton className="h-5 w-48 md:w-64" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-24 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>

    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Glass key={i} className="p-6 space-y-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </Glass>
      ))}
    </div>

    {/* Content Skeleton */}
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Glass className="p-8 space-y-6">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="h-64 flex items-end gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${Math.random() * 100}%` }} />
            ))}
          </div>
        </Glass>
      </div>
      <Glass className="p-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </Glass>
    </div>
  </div>
)

import { supabase } from '../services/supabase'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../hooks/useAuth'

const Dashboard = () => {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = React.useState(true)
  const [profile, setProfile] = React.useState(null)
  const [statsData, setStatsData] = React.useState({
    streak: 0,
    courses: 0,
    focusMinutes: 0,
    xp: 0
  })
  const [deadlines, setDeadlines] = React.useState([])
  const [leaderboard, setLeaderboard] = React.useState([])
  const [weeklyData, setWeeklyData] = React.useState([0, 0, 0, 0, 0, 0, 0])
  
  React.useEffect(() => {
    if (user) {
      fetchAllData()
    }
  }, [user])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      
      // 1. Fetch Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) setProfile(profileData)

      // 2. Fetch Stats & XP
      const { data: quizData } = await supabase
        .from('quizzes')
        .select('score, created_at')
        .eq('user_id', user.id)
      const totalXP = quizData?.reduce((acc, q) => acc + (q.score || 0), 0) || 0
      
      const { data: noteData } = await supabase
        .from('notes')
        .select('category')
        .eq('user_id', user.id)
      const uniqueCategories = new Set(noteData?.map(n => n.category))
      
      // Calculate Start of Current Week (Monday)
      const now = new Date()
      const dayOfWeek = now.getDay() // 0 = Sun, 1 = Mon, ...
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust to Monday
      const startOfWeek = new Date(now.setDate(diff))
      startOfWeek.setHours(0, 0, 0, 0)

      const { data: sessionData } = await supabase
        .from('study_sessions')
        .select('duration, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startOfWeek.toISOString())
      
      const totalMinutes = sessionData?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0

      // Calculate Weekly Focus (minutes per day)
      const days = [0, 0, 0, 0, 0, 0, 0] // M, T, W, T, F, S, S
      sessionData?.forEach(s => {
        const date = new Date(s.created_at)
        let day = date.getDay() // 0 is Sunday, 1 is Monday
        day = day === 0 ? 6 : day - 1 // Convert to 0=Mon, ..., 6=Sun
        if (day >= 0 && day < 7) {
          days[day] += s.duration || 0
        }
      })
      
      // Normalize weekly data for the chart (max 100%)
      const maxMinutes = Math.max(...days, 60)
      setWeeklyData(days.map(m => (m / maxMinutes) * 100))

      setStatsData({
        streak: 1, 
        courses: uniqueCategories.size || 0,
        focusMinutes: totalMinutes,
        xp: totalXP * 10 
      })

      // 3. Fetch Deadlines (Goals)
      const { data: goalData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(3)
      setDeadlines(goalData || [])

      // 4. Fetch Leaderboard (Mocked since we don't have global XP column yet)
      setLeaderboard([
        { name: 'You', xp: (totalXP * 10).toLocaleString(), rank: 1, avatar: '👤' },
        { name: 'Sarah M.', xp: '2,320', rank: 2, avatar: '👩‍🎓' },
        { name: 'John D.', xp: '2,100', rank: 3, avatar: '👨‍🎓' },
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: t('study_streak'), value: `${statsData.streak} Days`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: t('active_courses'), value: `${statsData.courses} Active`, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: t('focus_time'), value: `${(statsData.focusMinutes / 60).toFixed(1)}h`, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: t('ai_tokens'), value: 'Unlimited', icon: Brain, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            {t('welcome_back')}, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-slate-400">{t('ready_to_crush')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Glass className="px-4 py-2 flex items-center gap-2 border-primary/20">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-white font-bold">{statsData.xp.toLocaleString()} XP</span>
          </Glass>
          <Button variant="primary" className="whitespace-nowrap" onClick={() => window.location.href='/pomodoro'}>
            {t('start_session')}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Glass key={i} className="p-4 md:p-6 group hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 md:p-3 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5 md:w-6 md:h-6", stat.color)} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs md:text-sm text-slate-400">{stat.label}</div>
          </Glass>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Progress & Tasks */}
        <div className="lg:col-span-2 space-y-8">
          <Glass className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t('weekly_focus')}</h2>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white outline-none">
                <option>This Week</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-3 px-2">
              {weeklyData.map((h, i) => (
                <div key={i} className="flex-1 h-full flex flex-col items-center gap-3">
                  <div className="flex-1 w-full flex items-end justify-center group relative pb-2">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h > 0 ? Math.max(h, 10) : 0}%` }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100, delay: i * 0.05 }}
                      className={cn(
                        "w-full rounded-t-lg transition-all duration-500 relative",
                        h > 0 ? "bg-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "bg-white/5"
                      )}
                    >
                      {h > 0 && (
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-dark-bg px-2 py-1 rounded text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 shadow-xl">
                          {Math.round((h/100) * (Math.max(...weeklyData) > 0 ? (60 / (Math.max(...weeklyData)/100)) : 60))}m
                        </div>
                      )}
                    </motion.div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold transition-colors",
                    h > 0 ? "text-primary" : "text-slate-600"
                  )}>
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i]}
                  </span>
                </div>
              ))}
            </div>
          </Glass>

          <Glass className="p-8">
            <h2 className="text-xl font-bold text-white mb-6">{t('todays_deadlines')}</h2>
            <div className="space-y-4">
              {deadlines.length > 0 ? deadlines.map((task, i) => (
                <div key={i} className={cn("p-4 rounded-xl bg-white/5 border-l-4 flex items-center justify-between", i % 2 === 0 ? "border-primary" : "border-accent")}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">{task.goal}</div>
                      <div className="text-sm text-slate-500">{new Date(task.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Button variant="ghost" className="px-3 py-1 text-xs" onClick={() => window.location.href='/goals'}>View</Button>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-500">
                  No active goals or deadlines.
                </div>
              )}
            </div>
          </Glass>
        </div>

        {/* Right Column: AI Suggestions & Streak */}
        <div className="space-y-8">
          <Glass className="p-8 bg-gradient-to-br from-primary/20 to-secondary/20">
            <h2 className="text-xl font-bold text-white mb-4">{t('ai_insight')} 🤖</h2>
            <p className="text-slate-200 text-sm leading-relaxed mb-6">
              {statsData.xp > 0 
                ? `Great job on your quizzes! You've earned ${statsData.xp} XP. Keep studying your ${statsData.courses > 0 ? 'active subjects' : 'notes'} to maintain your streak!`
                : "Welcome! Start by taking a quiz or creating some notes to get personalized AI insights."}
            </p>
            <Button variant="glass" className="w-full" onClick={() => window.location.href='/ai-assistant'}>
              {t('study_plan')}
            </Button>
          </Glass>

          <Glass className="p-8">
            <h2 className="text-xl font-bold text-white mb-6">{t('leaderboard')}</h2>
            <div className="space-y-6">
              {leaderboard.map((user, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-slate-500 w-4">{user.rank}</div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">
                      {user.avatar}
                    </div>
                    <div className="font-semibold text-white">{user.name}</div>
                  </div>
                  <div className="text-primary font-bold">{user.xp} XP</div>
                </div>
              ))}
            </div>
          </Glass>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
