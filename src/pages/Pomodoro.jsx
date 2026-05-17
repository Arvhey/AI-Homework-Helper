import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Settings,
  Music,
  Volume2,
  Sparkles
} from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import TimerSettingsModal from '../components/pomodoro/TimerSettingsModal'
import { useToast } from '../hooks/useToast'
import { useLanguage } from '../context/LanguageContext'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'

const Pomodoro = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [settings, setSettings] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 15
  })

  const [timeLeft, setTimeLeft] = useState(settings.focus * 60)
  const [isActive, setIsActive] = useState(false)
  const [mode, setMode] = useState('focus')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Sync tab title with timer
  useEffect(() => {
    const mins = Math.floor(timeLeft / 60)
    const secs = timeLeft % 60
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    const modeLabel = mode === 'focus' ? t('focus') : t('break')
    document.title = isActive ? `${timeStr} - ${modeLabel}` : 'AI Homework Helper'
    return () => { document.title = 'AI Homework Helper' }
  }, [timeLeft, isActive, mode, t])

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      clearInterval(interval)
      setIsActive(false)
      playAlarm()
      
      const duration = mode === 'focus' ? settings.focus : mode === 'short-break' ? settings.shortBreak : settings.longBreak
      
      // Save session if it was a focus session
      if (mode === 'focus' && user) {
        saveSession(duration)
      }
      
      showToast(`${mode === 'focus' ? t('focus') : t('break')} ${t('success')}`, 'success')
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, mode, showToast, t, settings, user])

  const saveSession = async (duration) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .insert([{
          user_id: user.id,
          duration: duration,
          completed: true
        }])
      if (error) throw error
    } catch (error) {
      console.error('Error saving study session:', error)
    }
  }

  const playAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5)
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1)
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 1)
    } catch (e) {
      console.error('Failed to play alarm:', e)
    }
  }

  const toggleTimer = () => setIsActive(!isActive)

  const resetTimer = () => {
    setIsActive(false)
    const duration = mode === 'focus' ? settings.focus : mode === 'short-break' ? settings.shortBreak : settings.longBreak
    setTimeLeft(duration * 60)
  }

  const changeMode = (newMode) => {
    setMode(newMode)
    setIsActive(false)
    const duration = newMode === 'focus' ? settings.focus : newMode === 'short-break' ? settings.shortBreak : newMode === 'long-break' ? settings.longBreak : 0
    setTimeLeft(duration * 60)
  }

  const handleUpdateSettings = (newSettings) => {
    setSettings(newSettings)
    if (!isActive) {
      const duration = mode === 'focus' ? newSettings.focus : mode === 'short-break' ? newSettings.shortBreak : newSettings.longBreak
      setTimeLeft(duration * 60)
    }
    showToast(t('success'), 'success')
  }

  const totalDuration = (mode === 'focus' ? settings.focus : mode === 'short-break' ? settings.shortBreak : settings.longBreak) * 60
  const progress = (timeLeft / totalDuration) * 100
  const radius = 130
  const circumference = 2 * Math.PI * radius

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-12 pb-24 lg:pb-20 px-2 md:px-0">
      {/* Immersive Header - Responsive Padding */}
      <div className="relative py-6 md:py-10 px-4 md:px-6 rounded-2xl md:rounded-[2rem] overflow-hidden group">
        <div className={cn(
          "absolute inset-0 opacity-20 transition-colors duration-1000",
          mode === 'focus' ? "bg-primary" : mode === 'short-break' ? "bg-secondary" : "bg-accent"
        )} />
        
        <div className="relative z-10 text-center space-y-2 md:space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-1"
          >
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Productivity Mode</span>
          </motion.div>
          <h1 className="text-2xl md:text-5xl font-black text-white tracking-tight drop-shadow-2xl">{t('focus_timer')}</h1>
          <p className="text-slate-400 max-w-lg mx-auto leading-relaxed text-xs md:text-base font-medium opacity-80 md:opacity-100">
            {t('pomodoro_desc')}
          </p>
        </div>
      </div>

      <Glass className="p-6 md:p-12 lg:p-20 text-center relative overflow-hidden max-w-3xl mx-auto border-white/5 shadow-2xl">
        {/* Ambient Glows */}
        <div className={cn(
          "absolute -top-24 -left-24 w-48 md:w-64 h-48 md:h-64 blur-[80px] md:blur-[100px] opacity-20 transition-colors duration-1000",
          mode === 'focus' ? "bg-primary" : mode === 'short-break' ? "bg-secondary" : "bg-accent"
        )} />

        <div className="relative z-10">
          {/* Responsive Mode Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-8 md:mb-16">
            {[
              { id: 'focus', label: t('focus'), icon: Brain, color: 'bg-primary' },
              { id: 'short-break', label: t('break'), icon: Coffee, color: 'bg-secondary' },
              { id: 'long-break', label: t('long_break'), icon: Music, color: 'bg-accent' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => changeMode(m.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 md:px-8 py-2 md:py-3.5 rounded-xl md:rounded-2xl transition-all duration-500 border overflow-hidden",
                  mode === m.id 
                    ? `${m.color} text-white border-transparent shadow-lg scale-105 md:scale-110 z-20` 
                    : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white z-10"
                )}
              >
                <m.icon className="w-3.5 h-3.5 md:w-5 md:h-5" />
                <span className="font-black text-[10px] md:text-xs uppercase tracking-wider">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Responsive Timer Display */}
          <div className="mb-10 md:mb-20 relative inline-flex items-center justify-center">
            <svg className="w-64 h-64 md:w-80 lg:w-[450px] lg:h-[450px] -rotate-90 relative z-10">
              <circle
                cx="50%"
                cy="50%"
                r="110"
                className="md:hidden"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                style={{ color: 'rgba(255,255,255,0.05)' }}
              />
              <circle
                cx="50%"
                cy="50%"
                r="160"
                className="hidden md:block"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                style={{ color: 'rgba(255,255,255,0.05)' }}
              />
              {/* Mobile Ring */}
              <motion.circle
                cx="50%"
                cy="50%"
                r="110"
                className="md:hidden transition-colors duration-1000"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 110}
                animate={{ strokeDashoffset: (2 * Math.PI * 110) - ((2 * Math.PI * 110) * progress) / 100 }}
                transition={{ duration: 1, ease: "linear" }}
                style={{ 
                  color: mode === 'focus' ? '#6366f1' : mode === 'short-break' ? '#ec4899' : '#06b6d4'
                }}
                strokeLinecap="round"
              />
              {/* Desktop Ring */}
              <motion.circle
                cx="50%"
                cy="50%"
                r="160"
                className="hidden md:block transition-colors duration-1000"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 160}
                animate={{ strokeDashoffset: (2 * Math.PI * 160) - ((2 * Math.PI * 160) * progress) / 100 }}
                transition={{ duration: 1, ease: "linear" }}
                style={{ 
                  color: mode === 'focus' ? '#6366f1' : mode === 'short-break' ? '#ec4899' : '#06b6d4'
                }}
                strokeLinecap="round"
              />
            </svg>
            
            <div className="absolute flex flex-col items-center z-20">
              <span className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white font-outfit tabular-nums leading-none tracking-tighter drop-shadow-2xl">
                {formatTime(timeLeft)}
              </span>
              <div className="mt-4 md:mt-8 px-4 md:px-6 py-1 md:py-2 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <span className={cn(
                  "text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.5em] transition-colors duration-1000",
                  mode === 'focus' ? "text-primary-light" : mode === 'short-break' ? "text-secondary-light" : "text-accent-light"
                )}>
                  {mode === 'focus' ? 'Deep Work' : 'Time to Rest'}
                </span>
              </div>
            </div>
          </div>

          {/* Responsive Controls */}
          <div className="flex items-center justify-center gap-6 md:gap-10">
            <Button 
              variant="glass" 
              className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[2rem] p-0 border-white/10"
              onClick={resetTimer}
            >
              <RotateCcw className="w-5 h-5 md:w-8 md:h-8" />
            </Button>
            <Button 
              variant="primary" 
              className={cn(
                "w-20 h-20 md:w-32 md:h-32 rounded-2xl md:rounded-[3rem] p-0 shadow-xl transition-all duration-1000",
                mode === 'focus' ? "bg-primary shadow-primary/30" : mode === 'short-break' ? "bg-secondary shadow-secondary/30" : "bg-accent shadow-accent/30"
              )}
              onClick={toggleTimer}
            >
              <AnimatePresence mode="wait">
                {isActive ? (
                  <motion.div key="pause" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                    <Pause className="w-8 h-8 md:w-14 md:h-14 fill-white border-none" />
                  </motion.div>
                ) : (
                  <motion.div key="play" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                    <Play className="w-8 h-8 md:w-14 md:h-14 fill-white translate-x-0.5 border-none" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            <Button 
              variant="glass" 
              className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[2rem] p-0 border-white/10"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-5 h-5 md:w-8 md:h-8" />
            </Button>
          </div>
        </div>
      </Glass>

      {/* Responsive Productivity Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Glass className="p-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-accent/10">
            <Volume2 className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Ambient Noise</h3>
            <p className="text-sm text-slate-400">Play lo-fi beats or white noise to drown out distractions.</p>
          </div>
        </Glass>
        <Glass className="p-6 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-secondary/10">
            <Target className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">{t('productivity_tip')}</h3>
            <p className="text-sm text-slate-400">Complete 4 focus sessions to earn 50 bonus XP.</p>
          </div>
        </Glass>
      </div>

      <TimerSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleUpdateSettings}
        settings={settings}
      />
    </div>
  )
}

const Target = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
)

export default Pomodoro
