import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Check } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'

const languages = [
  { code: 'en', name: 'English (US)', flag: '🇺🇸' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'jp', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
]

const LanguageModal = ({ isOpen, onClose, currentLanguage, onSelect }) => {
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
                  <Globe className="w-5 h-5 text-primary" />
                  Select Language
                </h2>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { onSelect(lang.name); onClose(); }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                      currentLanguage === lang.name ? "bg-primary/20 border-primary/30" : "bg-white/5 border border-white/10 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-bold text-white group-hover:text-primary transition-colors">{lang.name}</span>
                    </div>
                    {currentLanguage === lang.name && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Button variant="glass" className="w-full" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </Glass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

const cn = (...classes) => classes.filter(Boolean).join(' ')

export default LanguageModal
