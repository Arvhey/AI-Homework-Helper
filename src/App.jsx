import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Compass, Share, ArrowUpRight, ShieldAlert, Chrome, Sparkles } from 'lucide-react'
import AppRoutes from './routes/AppRoutes'
import './styles/glass.css'
import './styles/animations.css'
import Glass from './components/ui/Glass'
import Button from './components/ui/Button'

function App() {
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera
    const isInApp = (
      ua.indexOf('FBAN') > -1 ||
      ua.indexOf('FBAV') > -1 ||
      ua.indexOf('Instagram') > -1 ||
      ua.indexOf('Messenger') > -1 ||
      ua.indexOf('Line') > -1 ||
      ua.indexOf('Threads') > -1
    )

    const isAndroid = /Android/i.test(ua)
    const isIOS = /iPhone|iPad|iPod/i.test(ua)

    if (isInApp) {
      if (isAndroid) {
        // Force-open in native Google Chrome on Android using Intent URI!
        const currentUrl = window.location.href.replace(/^https?:\/\//, '')
        const intentUrl = `intent://${currentUrl}#Intent;scheme=https;action=android.intent.action.VIEW;end;`
        window.location.replace(intentUrl)
      } else if (isIOS) {
        // Show premium opening guide for Safari on iOS
        setShowIosGuide(true)
      }
    }
  }, [])

  return (
    <div className="min-h-screen relative">
      <div className="bg-mesh" />
      <AppRoutes />

      {/* Premium iOS Safari In-App Browser Guide Overlay */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[300] bg-[#0a0e1a]/95 backdrop-blur-2xl flex items-center justify-center p-6 select-none overflow-y-auto">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-accent/15 blur-[120px] rounded-full" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md relative z-10"
          >
            <Glass className="p-8 border-primary/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] text-center space-y-6 bg-[#0c1020]/80">
              {/* Header Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <ShieldAlert className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">In-App Browser Detected</span>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white uppercase tracking-wider">
                  Open in Safari for Full Experience 🚀
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  You are opening this link inside Messenger/social webviews which restrict **physical camera flashlights**, **sound sirens**, and **PWA installation**.
                </p>
              </div>

              {/* Instructional Steps card */}
              <div className="space-y-4 text-left bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs uppercase tracking-wide">Tap the Menu Button</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tap the **Three Dots (`···`)** or the **Share icon** at the top right of your Messenger screen.
                    </p>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xs uppercase tracking-wide">Select Open in Safari</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tap **"Open in Safari"** or **"Open in system browser"** from the menu options.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <div className="flex items-center justify-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Unlocks camera flash & audio alarms
                </div>
                <Button 
                  variant="primary" 
                  className="w-full py-4 text-xs font-black uppercase tracking-widest bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20"
                  onClick={() => setShowIosGuide(false)}
                >
                  Continue Anyway ➔
                </Button>
              </div>
            </Glass>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default App
