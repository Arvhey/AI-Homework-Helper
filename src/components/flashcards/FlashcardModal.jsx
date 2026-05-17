import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, HelpCircle, MessageSquare } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'

const FlashcardModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || { question: '', answer: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    setFormData({ question: '', answer: '' })
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
            className="w-full max-w-lg z-10"
          >
            <Glass className="p-8 border-primary/20 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">{initialData ? 'Edit Flashcard' : 'Create Flashcard'}</h2>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 flex items-center gap-2 ml-1">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    Front (Question)
                  </label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Enter your question..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-all resize-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-400 flex items-center gap-2 ml-1">
                    <MessageSquare className="w-4 h-4 text-secondary" />
                    Back (Answer)
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                    placeholder="Enter the answer..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-secondary/50 transition-all resize-none"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="glass" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1">
                    <Save className="w-5 h-5" />
                    {initialData ? 'Update' : 'Save Card'}
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

export default FlashcardModal
