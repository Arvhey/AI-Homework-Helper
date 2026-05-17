import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Calendar,
  Trophy,
  TrendingUp,
  Trash2,
  Loader2
} from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import GoalModal from '../components/goals/GoalModal'
import Skeleton from '../components/ui/Skeleton'

const GoalSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <Glass key={i} className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4 rounded-md" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20 rounded-sm" />
              <Skeleton className="h-3 w-16 rounded-sm" />
            </div>
          </div>
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </Glass>
    ))}
  </div>
)

import { useLanguage } from '../context/LanguageContext'

const Goals = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (user) fetchGoals()
  }, [user])

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
      showToast(t('error'), 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddGoal = async (goalData) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...goalData, user_id: user.id }])
        .select()

      if (error) throw error
      setGoals([data[0], ...goals])
      showToast(t('success'), 'success')
    } catch (error) {
      console.error('Error adding goal:', error)
      showToast(t('error'), 'error')
    }
  }

  const toggleGoal = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ completed: !currentStatus })
        .eq('id', id)

      if (error) throw error
      setGoals(goals.map(g => g.id === id ? { ...g, completed: !currentStatus } : g))
      showToast(t('success'), 'success')
    } catch (error) {
      console.error('Error updating goal:', error)
      showToast(t('error'), 'error')
    }
  }

  const deleteGoal = async (id) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      setGoals(goals.filter(g => g.id !== id))
      showToast(t('success'), 'success')
    } catch (error) {
      console.error('Error deleting goal:', error)
      showToast(t('error'), 'error')
    }
  }

  const completedCount = goals.filter(g => g.completed).length
  const completionRate = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{t('study_goals')}</h1>
          <p className="text-slate-400 font-medium">{t('goals_desc')}</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="shadow-primary/20 shadow-lg">
          <Plus className="w-5 h-5" />
          {t('set_goal')}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 px-4 md:px-0">
        {/* Goals List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <GoalSkeleton />
          ) : goals.length === 0 ? (
            <Glass className="p-12 text-center border-dashed border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No goals set yet</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">Every great achievement starts with a single goal. What will you conquer today?</p>
              <Button variant="glass" onClick={() => setIsModalOpen(true)}>
                Create Your First Goal
              </Button>
            </Glass>
          ) : (
            <AnimatePresence mode="popLayout">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Glass className={cn(
                    "p-5 md:p-6 flex items-center justify-between group transition-all duration-300",
                    goal.completed ? "bg-emerald-500/5 border-emerald-500/20" : "hover:border-primary/30"
                  )}>
                    <div className="flex items-center gap-4 flex-1">
                      <button 
                        onClick={() => toggleGoal(goal.id, goal.completed)}
                        className={cn(
                          "transition-all duration-500 transform hover:scale-110",
                          goal.completed ? "text-emerald-500" : "text-slate-600 hover:text-primary"
                        )}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8" />
                        ) : (
                          <Circle className="w-7 h-7 md:w-8 md:h-8" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          "text-base md:text-lg font-bold text-white mb-1 transition-all duration-300 truncate",
                          goal.completed ? "line-through text-slate-500 opacity-60" : ""
                        )}>
                          {goal.goal}
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(goal.created_at).toLocaleDateString()}
                          </span>
                          <span className={cn(goal.completed ? "text-emerald-500" : "")}>
                            {goal.completed ? 'Achieved' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteGoal(goal.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all duration-300 ml-4"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Glass>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Stats & Insights Sidebar */}
        <div className="space-y-6">
          <Glass className="p-8 text-center bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-2xl relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Trophy className={cn("w-10 h-10", completionRate === 100 ? "text-yellow-400 animate-bounce" : "text-primary")} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {completionRate === 100 ? t('mastermind') : completionRate >= 50 ? t('on_fire') : t('keep_pushing')}
              </h2>
              <p className="text-slate-400 text-sm mb-6 px-4">
                {t('conquered_missions').replace('{{rate}}', completionRate)}
              </p>
              
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl font-black text-white">{completedCount}</span>
                <span className="text-xl font-bold text-slate-500">/ {goals.length}</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-light">{t('missions_completed')}</div>
            </div>
          </Glass>

          <Glass className="p-6">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              {t('insights')}
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
                <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">{t('productivity_tip')}</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Breaking large goals into smaller tasks increases completion speed by <span className="text-white font-bold">2.5x</span>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-colors">
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Streak Bonus</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Achieve 5 goals in a row to earn a <span className="text-white font-bold">Legendary Badge</span>.
                </p>
              </div>
            </div>
          </Glass>
        </div>
      </div>

      <GoalModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddGoal}
      />
    </div>
  )
}

export default Goals
