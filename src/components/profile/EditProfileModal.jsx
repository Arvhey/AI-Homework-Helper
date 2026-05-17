import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, School, Save } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'

const EditProfileModal = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    school: profile?.school || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
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
            className="w-full max-w-md z-10 p-2"
          >
            <Glass className="p-6 md:p-8 border-primary/20 shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden relative">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                  <User className="w-5 h-5 text-primary" />
                  Edit Profile
                </h2>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-1 space-y-5 mb-4 scrollbar-thin">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        required
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs md:text-sm text-white outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                      School / University
                    </label>
                    <div className="relative">
                      <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-xs md:text-sm text-white outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 shrink-0 border-t border-white/5">
                  <Button type="button" variant="glass" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    <Save className="w-5 h-5" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Glass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default EditProfileModal
