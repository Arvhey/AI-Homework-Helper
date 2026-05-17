import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Sparkles } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'
import { useAI } from '../../hooks/useAI'

const NoteModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || { title: '', content: '', category: 'General' })
  const [summarizing, setSummarizing] = useState(false)
  const { summarize } = useAI()

  const handleSummarize = async () => {
    if (!formData.content) return
    setSummarizing(true)
    try {
      const summary = await summarize(formData.content)
      setFormData(prev => ({ ...prev, content: prev.content + "\n\n--- AI SUMMARY ---\n" + summary }))
    } catch (error) {
      console.error(error)
    } finally {
      setSummarizing(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl z-10 p-2 sm:p-4"
          >
            <Glass className="p-6 md:p-8 border-primary/20 shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden relative">
              <div className="flex items-center justify-between mb-5 shrink-0">
                <h2 className="text-xl md:text-2xl font-bold text-white">{initialData ? 'Edit Note' : 'Create New Note'}</h2>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 md:space-y-5 mb-4 scrollbar-thin">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 ml-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter note title..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white outline-none focus:border-primary/50 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 ml-1">Category</label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white outline-none focus:border-primary/50 transition-all cursor-pointer [&>option]:bg-slate-900"
                      >
                        <option value="General">General</option>
                        <option value="Biology">Biology</option>
                        <option value="Math">Math</option>
                        <option value="History">History</option>
                        <option value="CompSci">CompSci</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-semibold text-slate-400">Content</label>
                      <button 
                        type="button"
                        onClick={handleSummarize}
                        disabled={summarizing || !formData.content}
                        className="text-[10px] md:text-xs text-primary flex items-center gap-1 hover:underline disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        {summarizing ? 'AI Summarizing...' : 'Summarize with AI'}
                      </button>
                    </div>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write your note here..."
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm text-white outline-none focus:border-primary/50 transition-all resize-none min-h-[120px]"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 shrink-0 border-t border-white/5">
                  <Button type="button" variant="glass" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    <Save className="w-5 h-5" />
                    {initialData ? 'Update Note' : 'Save Note'}
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

export default NoteModal
