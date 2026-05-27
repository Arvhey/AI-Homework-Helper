import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Clock, ShieldAlert, Check } from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { useToast } from '../hooks/useToast'

const AlarmContext = createContext()

export const AlarmProvider = ({ children }) => {
  const { showToast } = useToast()
  const [alarmActive, setAlarmActive] = useState(false)
  const [alarmTitle, setAlarmTitle] = useState('Critical Alert')
  const [alarmBody, setAlarmBody] = useState('Take action on your active study milestone!')
  
  // Daily reminder states
  const [isDailyEnabled, setIsDailyEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('daily_reminder_enabled')
      return saved ? JSON.parse(saved) : true
    } catch (e) {
      return true
    }
  })
  
  const [dailyTime, setDailyTime] = useState(() => {
    try {
      return localStorage.getItem('daily_reminder_time') || '19:00'
    } catch (e) {
      return '19:00'
    }
  })
  
  const [lastTriggeredDate, setLastTriggeredDate] = useState(() => {
    try {
      return localStorage.getItem('daily_reminder_last_date') || ''
    } catch (e) {
      return ''
    }
  })

  // Sync to localStorage and request OS permissions when enabled
  useEffect(() => {
    try {
      localStorage.setItem('daily_reminder_enabled', JSON.stringify(isDailyEnabled))
      
      // Request native OS notification permissions when enabled
      if (isDailyEnabled && 'Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          Notification.requestPermission()
        }
      }
    } catch (e) {}
  }, [isDailyEnabled])

  useEffect(() => {
    try {
      localStorage.setItem('daily_reminder_last_date', lastTriggeredDate)
    } catch (e) {}
  }, [lastTriggeredDate])

  // Background ticker to check daily time
  useEffect(() => {
    const checkReminder = async () => {
      if (!isDailyEnabled) return

      const now = new Date()
      // format to HH:MM in 24hr format
      const currentHour = String(now.getHours()).padStart(2, '0')
      const currentMin = String(now.getMinutes()).padStart(2, '0')
      const currentHourMin = `${currentHour}:${currentMin}`
      const currentDateString = now.toDateString() // e.g. "Mon May 18 2026"

      // Trigger exactly at 8:00 PM (20:00) once per day
      if (currentHourMin === '20:00' && lastTriggeredDate !== currentDateString) {
        setLastTriggeredDate(currentDateString)
        
        // 1. Trigger actual Native OS Push Notification (Android/iOS banner)
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            if ('serviceWorker' in navigator) {
              const registration = await navigator.serviceWorker.ready;
              registration.showNotification("⏰ DAILY STUDY ALARM! 🚨", {
                body: "Time to crush your study goals! Your phone's strobe light is flashing!",
                icon: "/logo.png",
                badge: "/logo.png",
                vibrate: [500, 250, 500, 250, 500],
                requireInteraction: true
              });
            } else {
              new Notification("⏰ DAILY STUDY ALARM! 🚨", {
                body: "Time to crush your study goals! Your phone's strobe light is flashing!",
                icon: "/logo.png",
                vibrate: [500, 250, 500, 250, 500]
              })
            }
          }
        } catch (e) {
          console.warn("Could not fire OS native notification:", e)
        }

        // 2. Insert into Intelligence Alerts (global notifications table)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user?.id) {
            await supabase.from('notifications').insert([{
              user_id: session.user.id,
              type: 'alert',
              message: 'Daily Study Alarm Triggered',
              details: 'It is 8:00 PM. Time to log in and master your studies!',
              read: false
            }])
          }
        } catch (e) {
          console.error("Failed to insert Intelligence Alert:", e)
        }

        // 3. Trigger physical LED flashlight strobe and sound siren!
        triggerAlarm(
          "⏰ DAILY STUDY SESSION REMINDER! 🚨",
          "Time to log in and master your studies! Camera strobe flashlight is now strobing, sound alarm ringing!"
        )
      }
    }

    const interval = setInterval(checkReminder, 10000) // check every 10 seconds
    return () => clearInterval(interval)
  }, [isDailyEnabled, lastTriggeredDate])
  
  // Snooze states
  const [isSnoozed, setIsSnoozed] = useState(false)
  const [snoozeTimeLeft, setSnoozeTimeLeft] = useState(0)
  
  const cameraStreamRef = useRef(null)
  const strobeIntervalRef = useRef(null)
  const audioCtxRef = useRef(null)
  const soundIntervalRef = useRef(null)
  const snoozeTimerRef = useRef(null)

  // Web Audio synthesizer for emergency siren sound
  const startAudioSiren = () => {
    try {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      
      soundIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current) return
        const osc = audioCtxRef.current.createOscillator()
        const gain = audioCtxRef.current.createGain()
        
        osc.type = 'sawtooth'
        // High urgency alternating frequency
        osc.frequency.setValueAtTime(Math.random() > 0.5 ? 900 : 700, audioCtxRef.current.currentTime)
        
        gain.gain.setValueAtTime(0.12, audioCtxRef.current.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.4)
        
        osc.connect(gain)
        gain.connect(audioCtxRef.current.destination)
        
        osc.start()
        osc.stop(audioCtxRef.current.currentTime + 0.45)
      }, 500)
    } catch (err) {
      console.warn("Failed to initialize Web Audio siren:", err)
    }
  }

  const stopAudioSiren = () => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current)
      soundIntervalRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
  }

  // HTML5 Image Capture Flashlight Strobe Manager
  const startCameraFlashlight = async () => {
    if (!('mediaDevices' in navigator)) return
    
    try {
      // Request access to environment camera (rear camera with flash led)
      cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      })
      
      const track = cameraStreamRef.current.getVideoTracks()[0]
      const capabilities = track.getCapabilities ? track.getCapabilities() : {}
      
      // Check if torch feature is supported on this mobile device
      if (capabilities.torch || 'torch' in track.getSettings()) {
        let torchOn = false
        
        strobeIntervalRef.current = setInterval(() => {
          torchOn = !torchOn
          track.applyConstraints({
            advanced: [{ torch: torchOn }]
          }).catch(() => {})
        }, 300) // Fast strobe every 300ms
      }
    } catch (err) {
      console.warn("Flashlight camera permissions not granted or unsupported on this device:", err)
    }
  }

  const stopCameraFlashlight = async () => {
    if (strobeIntervalRef.current) {
      clearInterval(strobeIntervalRef.current)
      strobeIntervalRef.current = null
    }
    
    if (cameraStreamRef.current) {
      const track = cameraStreamRef.current.getVideoTracks()[0]
      if (track) {
        // Try turning off torch before closing tracks
        await track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {})
        track.stop()
      }
      cameraStreamRef.current = null
    }
  }

  // Trigger global alarm
  const triggerAlarm = (title, body) => {
    // If alarm is already running, ignore
    if (alarmActive) return

    setAlarmTitle(title || 'Critical Study Alert 🚨')
    setAlarmBody(body || 'Take action immediately on your scheduled study milestone!')
    setAlarmActive(true)
    setIsSnoozed(false)
    
    // Start siren sounds and flashlight strobe
    startAudioSiren()
    startCameraFlashlight()
  }

  // Stop/Dismiss alarm
  const stopAlarm = () => {
    setAlarmActive(false)
    setIsSnoozed(false)
    if (snoozeTimerRef.current) {
      clearInterval(snoozeTimerRef.current)
    }
    
    stopAudioSiren()
    stopCameraFlashlight()
    showToast('Alarm dismissed successfully.', 'info')
  }

  // Snooze alarm
  const snoozeAlarm = (seconds = 10) => {
    setIsSnoozed(true)
    setSnoozeTimeLeft(seconds)
    
    // Temporarily pause audio siren and flashlight
    stopAudioSiren()
    stopCameraFlashlight()
    showToast(`Alarm snoozed for ${seconds} seconds! ⏱️`, 'success')

    if (snoozeTimerRef.current) {
      clearInterval(snoozeTimerRef.current)
    }

    snoozeTimerRef.current = setInterval(() => {
      setSnoozeTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(snoozeTimerRef.current)
          setIsSnoozed(false)
          // Ring alarm again!
          startAudioSiren()
          startCameraFlashlight()
          showToast('Snooze over! Alarm active! 🚨', 'warning')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      stopAudioSiren()
      stopCameraFlashlight()
      if (snoozeTimerRef.current) clearInterval(snoozeTimerRef.current)
    }
  }, [])

  return (
    <AlarmContext.Provider value={{ 
      triggerAlarm, 
      stopAlarm, 
      snoozeAlarm, 
      alarmActive, 
      isSnoozed, 
      isDailyEnabled, 
      setIsDailyEnabled
    }}>
      {children}

      {/* Native-style Alarm Notification Banner */}
      <AnimatePresence>
        {alarmActive && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[400px] z-[99999]">
            <motion.div
              initial={{ y: -100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative overflow-hidden rounded-[24px] bg-slate-900/95 backdrop-blur-xl border border-red-500/30 shadow-[0_10px_40px_-10px_rgba(239,68,68,0.4)]"
            >
              {/* Red pulsing top border */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />

              <div className="p-4 flex flex-col gap-3">
                {/* Header (App Icon + Title) */}
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-10 h-10 rounded-[12px] bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[11px] font-black text-white/90 uppercase tracking-wider">
                        Study Alarm
                      </span>
                      <span className="text-[10px] text-white/50 font-bold">now</span>
                    </div>
                    <h3 className="text-sm font-bold text-red-400 truncate animate-pulse">
                      {alarmTitle}
                    </h3>
                  </div>
                </div>

                {/* Body Text */}
                <p className="text-[12px] text-slate-300 font-medium leading-snug px-1">
                  {isSnoozed 
                    ? `Snoozing... Ringing again in ${snoozeTimeLeft}s` 
                    : alarmBody}
                </p>

                {/* Status Indicator */}
                <div className="px-1">
                  {isSnoozed ? (
                    <div className="flex items-center gap-2 text-[10px] text-yellow-400 font-bold uppercase">
                      <Clock className="w-3 h-3 animate-spin" />
                      Paused ({snoozeTimeLeft}s left)
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase animate-pulse">
                      <ShieldAlert className="w-3 h-3" />
                      Flashlight Strobing Active
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {!isSnoozed ? (
                    <>
                      <button
                        onClick={() => snoozeAlarm(300)}
                        className="py-2.5 rounded-[12px] bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold transition-colors active:scale-95"
                      >
                        Snooze 5m
                      </button>
                      <button
                        onClick={stopAlarm}
                        className="py-2.5 rounded-[12px] bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 text-[11px] font-bold transition-colors active:scale-95"
                      >
                        Stop Alarm
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={stopAlarm}
                      className="col-span-2 py-2.5 rounded-[12px] bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 text-[11px] font-bold transition-colors active:scale-95"
                    >
                      Turn Off Completely
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlarmContext.Provider>
  )
}

export const useAlarm = () => useContext(AlarmContext)
