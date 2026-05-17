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
    <AlarmContext.Provider value={{ triggerAlarm, stopAlarm, snoozeAlarm, alarmActive, isSnoozed }}>
      {children}

      {/* Global Pulsing Fullscreen Alarm Overlay */}
      <AnimatePresence>
        {alarmActive && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 select-none">
            {/* Red Pulsing overlay border */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.8, 0.4, 0.8],
                backgroundColor: ['rgba(239, 68, 68, 0.35)', 'rgba(0,0,0,0.85)', 'rgba(239, 68, 68, 0.35)']
              }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 backdrop-blur-lg"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-md z-10"
            >
              <Glass className="p-8 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)] space-y-6 text-center bg-black/60 relative overflow-hidden">
                {/* Flashing scanner line border */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
                
                {/* Flashing alarm icon wrapper */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-lg shadow-red-500/10"
                >
                  <AlertTriangle className="w-10 h-10 animate-bounce" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-red-400 animate-pulse">
                    {alarmTitle}
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {isSnoozed 
                      ? `Snoozing... Ringing again in ${snoozeTimeLeft}s` 
                      : alarmBody}
                  </p>
                </div>

                {isSnoozed ? (
                  /* Snooze display */
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Clock className="w-6 h-6 text-yellow-400 animate-spin" />
                    <span className="text-sm font-black text-yellow-400 uppercase tracking-widest">
                      Snoozed for {snoozeTimeLeft}s
                    </span>
                  </div>
                ) : (
                  /* Live flash/alarm display */
                  <div className="space-y-1">
                    <div className="text-[10px] text-red-400 font-black uppercase tracking-wider animate-pulse flex items-center justify-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5" /> Mobile Flashlight Strobing Active
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-2">
                  {!isSnoozed && (
                    <Button
                      variant="glass"
                      onClick={() => snoozeAlarm(10)} // Snooze for 10s for demo/test ease
                      className="flex-1 py-3.5 text-xs font-black uppercase tracking-widest border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                    >
                      Snooze ⏱️
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    onClick={stopAlarm}
                    className="flex-1 py-3.5 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 shadow-lg shadow-red-500/20"
                  >
                    Stop Alert 🛑
                  </Button>
                </div>
              </Glass>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlarmContext.Provider>
  )
}

export const useAlarm = () => useContext(AlarmContext)
