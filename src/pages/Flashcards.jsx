import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit,
  Plus,
  Rotate3d,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { FlashcardModal } from '../components/flashcards'
import Skeleton from '../components/ui/Skeleton'

const FlashcardSkeleton = () => (
  <div className="max-w-2xl mx-auto w-full px-2 animate-pulse">
    <Glass className="w-full h-[400px] p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <Skeleton className="w-5 h-5 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-sm" />
      </div>
      <Skeleton className="h-10 w-full rounded-md" />
      <Skeleton className="h-10 w-3/4 rounded-md" />
      <div className="absolute bottom-6 flex items-center gap-2">
        <Skeleton className="w-4 h-4 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-sm" />
      </div>
    </Glass>
    <div className="flex items-center justify-between mt-8">
      <Skeleton className="h-10 w-24 rounded-xl" />
      <div className="space-y-2 flex flex-col items-center">
        <Skeleton className="h-5 w-12 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-sm" />
      </div>
      <Skeleton className="h-10 w-24 rounded-xl" />
    </div>
  </div>
)

import { useLanguage } from '../context/LanguageContext'

const Flashcards = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { t } = useLanguage()

  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [flipped, setFlipped] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCards()
    }
  }, [user])

  const fetchCards = async () => {
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCards(data || [])
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCard = async (formData) => {
    try {
      const { error } = await supabase
        .from('flashcards')
        .insert([{
          user_id: user.id,
          question: formData.question,
          answer: formData.answer
        }])

      if (error) throw error
      showToast(t('success'), 'success')
      setIsModalOpen(false)
      fetchCards()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Delete this card?')) return
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id)
      if (error) throw error
      showToast(t('success'), 'success')
      fetchCards()
      if (currentIndex >= cards.length - 1) {
        setCurrentIndex(Math.max(0, cards.length - 2))
      }
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const nextCard = () => {
    if (cards.length === 0) return
    setFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length)
    }, 150)
  }

  const prevCard = () => {
    if (cards.length === 0) return
    setFlipped(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }, 150)
  }

  return (
    <div className="space-y-8 pb-24 lg:pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('flashcards')}</h1>
          <p className="text-slate-400">Master concepts through active recall</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5" />
          {t('coming_soon')}
        </Button>
      </div>

      {loading ? (
        <FlashcardSkeleton />
      ) : cards.length > 0 ? (
        <div className="max-w-2xl mx-auto w-full px-2">
          <div 
            className="relative perspective-1000 h-[400px] w-full cursor-pointer" 
            onClick={() => setFlipped(!flipped)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex + (flipped ? '-back' : '-front')}
                initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                <Glass className={cn(
                  "w-full h-full p-8 md:p-12 flex flex-col items-center justify-center text-center border-2 transition-colors duration-500",
                  flipped ? "border-secondary/30 bg-secondary/5" : "border-primary/30 bg-primary/5"
                )}>
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <Sparkles className={cn("w-5 h-5", flipped ? "text-secondary" : "text-primary")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {flipped ? 'Answer' : 'Question'}
                    </span>
                  </div>

                  <h2 className={cn(
                    "text-xl md:text-3xl font-bold text-white leading-tight",
                    flipped ? "font-normal text-slate-200" : "font-outfit"
                  )}>
                    {flipped ? cards[currentIndex].answer : cards[currentIndex].question}
                  </h2>

                  <div className="absolute bottom-6 text-slate-500 text-xs flex items-center gap-2">
                    <Rotate3d className="w-4 h-4" />
                    {t('flip_card')}
                  </div>
                </Glass>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between mt-8">
            <Button variant="glass" onClick={(e) => { e.stopPropagation(); prevCard(); }} className="px-4">
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{t('previous_card')}</span>
            </Button>
            <div className="flex flex-col items-center">
              <div className="text-slate-400 font-bold">
                {currentIndex + 1} / {cards.length}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteCard(cards[currentIndex].id); }}
                className="text-[10px] text-red-500 hover:underline mt-2 uppercase tracking-tighter"
              >
                {t('delete_note')}
              </button>
            </div>
            <Button variant="glass" onClick={(e) => { e.stopPropagation(); nextCard(); }} className="px-4">
              <span className="hidden sm:inline">{t('next_card')}</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        <Glass className="max-w-2xl mx-auto p-12 md:p-20 text-center border-dashed border-white/10 bg-white/[0.02]">
          <BrainCircuit className="w-16 h-16 text-slate-700 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-white mb-2">No flashcards yet</h3>
          <p className="text-slate-400 mb-8">Start adding cards to build your custom study deck!</p>
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Create Your First Card
            </Button>
          </div>
        </Glass>
      )}

      <FlashcardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCard}
      />
    </div>
  )
}

export default Flashcards
