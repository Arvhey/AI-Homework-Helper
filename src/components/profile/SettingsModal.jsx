import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings, Bell, Volume2, Moon, Sparkles } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'

const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    darkMode: true,
    aiSuggestions: true
  })

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md z-10"
          >
            <Glass className="p-8 border-primary/20 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                  <Settings className="w-5 h-5 text-primary" />
                  App Settings
                </h2>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'notifications', label: 'Push Notifications', icon: Bell, color: 'text-blue-400' },
                  { id: 'sound', label: 'Sound Effects', icon: Volume2, color: 'text-emerald-400' },
                  { id: 'darkMode', label: 'Deep Dark Mode', icon: Moon, color: 'text-purple-400' },
                  { id: 'aiSuggestions', label: 'AI Study Insights', icon: Sparkles, color: 'text-yellow-400' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-xl bg-white/5", item.color.replace('text', 'bg').replace('400', '400/10'))}>
                        <item.icon className={cn("w-5 h-5", item.color)} />
                      </div>
                      <span className="font-bold text-white">{item.label}</span>
                    </div>
                    <button
                      onClick={() => toggleSetting(item.id)}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 transition-all duration-300",
                        settings[item.id] ? "bg-primary" : "bg-slate-700"
                      )}
                    >
                      <motion.div
                        animate={{ x: settings[item.id] ? 24 : 0 }}
                        className="w-4 h-4 bg-white rounded-full shadow-lg"
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Button variant="primary" className="w-full" onClick={onClose}>
                  Done
                </Button>
              </div>
            </Glass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Simple helper to match the cn usage
const cn = (...classes) => classes.filter(Boolean).join(' ')

export default SettingsModal
