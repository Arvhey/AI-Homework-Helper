import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit,
  Plus,
  Rotate3d,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Paperclip,
  Brain
} from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { useAI } from '../hooks/useAI'
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

  // AI Flashcards States
  const fileInputRef = useRef(null)
  const { generateFlashcards } = useAI()
  const [generating, setGenerating] = useState(false)
  const [topic, setTopic] = useState('')
  const [savedNotes, setSavedNotes] = useState([])
  const [selectedNoteId, setSelectedNoteId] = useState('')

  // Library injection states
  const [pdfjs, setPdfjs] = useState(null)
  const [mammoth, setMammoth] = useState(null)

  useEffect(() => {
    if (user) {
      fetchCards()
      fetchSavedNotes()
    }
  }, [user])

  const loadPDFJS = () => {
    if (window.pdfjsLib) {
      setPdfjs(window.pdfjsLib)
      return Promise.resolve(window.pdfjsLib)
    }
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
      script.onload = () => {
        const pdfjsLib = window['pdfjs-dist/build/pdf']
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'
        setPdfjs(pdfjsLib)
        resolve(pdfjsLib)
      }
      document.head.appendChild(script)
    })
  }

  const loadMammoth = () => {
    if (window.mammoth) {
      setMammoth(window.mammoth)
      return Promise.resolve(window.mammoth)
    }
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
      script.onload = () => {
        setMammoth(window.mammoth)
        resolve(window.mammoth)
      }
      document.head.appendChild(script)
    })
  }

  const extractDocxText = async (file) => {
    const loader = await loadMammoth()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result
          const result = await loader.extractRawText({ arrayBuffer })
          resolve(result.value)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read DOCX file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const extractPdfText = async (file) => {
    const loader = await loadPDFJS()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result)
          const pdf = await loader.getDocument(typedarray).promise
          let fullText = ''
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map(item => item.str).join(' ')
            fullText += pageText + '\n'
          }
          
          resolve(fullText)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read PDF file'))
      reader.readAsArrayBuffer(file)
    })
  }

  const fetchSavedNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setSavedNotes(data || [])
    } catch (e) {
      console.error('Failed to load saved notes for flashcards selection:', e)
    }
  }

  const handleAttachSavedNote = (noteId) => {
    const selectedNote = savedNotes.find(n => n.id === noteId || n.id.toString() === noteId.toString())
    if (selectedNote) {
      setTopic(`=== NOTE: ${selectedNote.title} ===\nCategory: ${selectedNote.category}\n\n${selectedNote.content}`)
      setSelectedNoteId(noteId)
      showToast(`Attached saved note: "${selectedNote.title}"!`, 'success')
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    showToast(`Reading ${files.length} file(s)...`, 'info')
    
    let combinedText = ''
    let loadedCount = 0
    
    for (const file of files) {
      const extension = file.name.split('.').pop().toLowerCase()
      try {
        let extractedText = ''
        if (extension === 'pdf') {
          extractedText = await extractPdfText(file)
        } else if (extension === 'docx') {
          extractedText = await extractDocxText(file)
        } else {
          extractedText = await new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (evt) => resolve(evt.target.result)
            reader.onerror = () => reject(new Error('Failed to read file'))
            reader.readAsText(file)
          })
        }

        if (extractedText && extractedText.trim().length > 10) {
          combinedText += `\n\n=== FILE: ${file.name} ===\n${extractedText}`
          loadedCount++
        }
      } catch (err) {
        console.error(err)
        showToast(`Error reading ${file.name}: ${err.message}`, 'error')
      }
    }

    if (combinedText.trim().length > 10) {
      setTopic(combinedText.trim())
      setSelectedNoteId('')
      showToast(`Successfully loaded ${loadedCount} out of ${files.length} file(s)!`, 'success')
    } else {
      showToast('No text content was found in any of the uploaded files.', 'warning')
    }
  }

  const handleGenerateFlashcards = async () => {
    if (!topic) return showToast('Please enter a topic, attach notes, or select a saved note!', 'info')
    setGenerating(true)
    try {
      const generatedCards = await generateFlashcards(topic)
      if (generatedCards && generatedCards.length > 0) {
        const insertData = generatedCards.map(card => ({
          user_id: user.id,
          question: card.question,
          answer: card.answer
        }))
        const { error } = await supabase
          .from('flashcards')
          .insert(insertData)
        
        if (error) throw error
        showToast('AI successfully generated 10 new flashcards!', 'success')
        setTopic('')
        setSelectedNoteId('')
        fetchCards()
      } else {
        showToast('Could not generate flashcards. Please try again.', 'error')
      }
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setGenerating(false)
    }
  }

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
    <div className="space-y-8 pb-32">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".txt,.js,.py,.md,.html,.css,.json,.pdf,.docx"
        multiple
      />

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

      {/* AI Flashcards Generator Card */}
      <Glass className="p-5 md:p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent border-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Brain className="w-48 h-48 text-white rotate-12" />
        </div>
        
        <div className="max-w-2xl relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            AI Flashcard Generator ✨
          </h2>
          <p className="text-slate-300 mb-6 text-sm md:text-lg">
            Upload study files, attach documents, or select from your saved notes, and I'll generate a custom deck of 10 study flashcards for you instantly!
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-stretch">
            {/* File Uploader */}
            <div className="flex gap-2 w-full md:flex-1">
              <div 
                onClick={() => fileInputRef.current.click()}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all overflow-hidden h-[48px]"
              >
                <Paperclip className="w-5 h-5 shrink-0" />
                <span className="truncate text-xs md:text-sm">
                  {topic ? (
                    topic.startsWith('=== NOTE:') ? (
                      `📋 Note: ${topic.match(/=== NOTE: (.*?) ===/)?.[1] || 'Attached Note'}`
                    ) : topic.includes('=== FILE:') ? (
                      `📁 Attached ${topic.split('=== FILE:').length - 1} File(s)`
                    ) : (
                      topic.length > 30 ? topic.substring(0, 30) + '...' : topic
                    )
                  ) : 'Attach notes or study files...'}
                </span>
              </div>
              
              {topic && (
                <button
                  type="button"
                  onClick={() => {
                    setTopic('')
                    setSelectedNoteId('')
                    showToast('Attachment cleared!', 'info')
                  }}
                  className="p-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl transition-all flex items-center justify-center shrink-0 w-[48px] h-[48px]"
                  title="Clear attachment"
                >
                  <span className="text-sm font-bold">✕</span>
                </button>
              )}
            </div>

            {/* Saved Notes Dropdown Selector */}
            {savedNotes.length > 0 && (
              <select
                value={selectedNoteId}
                onChange={(e) => handleAttachSavedNote(e.target.value)}
                className="w-full md:w-auto bg-[#0a0e1a] border border-white/10 rounded-xl px-4 py-3 text-xs md:text-sm text-white outline-none focus:border-primary/50 transition-all cursor-pointer md:min-w-[220px] h-[48px]"
              >
                <option value="" disabled>📋 Select from My Notes...</option>
                {savedNotes.map(note => (
                  <option key={note.id} value={note.id}>
                    {note.title} ({note.category})
                  </option>
                ))}
              </select>
            )}
            
            {/* Action Button */}
            <Button 
              variant="primary" 
              className="w-full md:w-auto px-8 shadow-xl shadow-primary/40 text-sm md:text-lg shrink-0 h-[48px] flex items-center justify-center"
              onClick={handleGenerateFlashcards}
              disabled={generating}
            >
              {generating ? t('loading') : 'Generate Now'}
            </Button>
          </div>
        </div>
      </Glass>

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
