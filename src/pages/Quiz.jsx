import React, { useState, useEffect, useRef } from 'react'
import { 
  Brain, 
  Zap, 
  Clock, 
  BarChart3,
  Paperclip
} from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useAI } from '../hooks/useAI'
import { useToast } from '../hooks/useToast'
import QuizModal from '../components/quiz/QuizModal'
import Skeleton from '../components/ui/Skeleton'

const QuizSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {[1, 2, 3, 4].map(i => (
      <Glass key={i} className="p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Skeleton className="w-14 h-14 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20 rounded-sm" />
              <Skeleton className="h-3 w-16 rounded-sm" />
            </div>
          </div>
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-8 w-12 rounded-md ml-auto" />
          <Skeleton className="h-3 w-16 rounded-sm" />
        </div>
      </Glass>
    ))}
  </div>
)

import { useLanguage } from '../context/LanguageContext'

const Quiz = () => {
  const { user } = useAuth()
  const { generateQuiz } = useAI()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const fileInputRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('my-quizzes')
  const [quizHistory, setQuizHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [topic, setTopic] = useState('')
  
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (user) fetchQuizHistory()
  }, [user])

  const fetchQuizHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setQuizHistory(data || [])
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!topic) return showToast(t('topic'), 'info')
    setGenerating(true)
    try {
      const questions = await generateQuiz(topic)
      if (questions && questions.length > 0) {
        const firstLine = topic.split('\n')[0].trim()
        const cleanTitle = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine
        setActiveQuiz({ title: cleanTitle, questions })
        setIsModalOpen(true)
      } else {
        showToast(t('error'), 'error')
      }
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setGenerating(false)
    }
  }

  const handleQuizComplete = async (result) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .insert([{
          user_id: user.id,
          title: activeQuiz.title,
          score: result.score,
          total_questions: result.total
        }])
      
      if (error) throw error
      showToast(t('success'), 'success')
      fetchQuizHistory()
    } catch (error) {
      showToast(t('error'), 'error')
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setTopic(e.target.result)
      showToast(`${file.name} loaded!`, 'success')
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-8">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept=".txt,.js,.py,.md,.html,.css,.json"
      />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('quiz_generator')}</h1>
          <p className="text-slate-400">{t('quiz_desc')}</p>
        </div>
      </div>

      {/* AI Generator Card */}
      <Glass className="p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent border-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Brain className="w-48 h-48 text-white rotate-12" />
        </div>
        
        <div className="max-w-2xl relative z-10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            {t('ai_magic')} ✨
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            {t('ai_magic_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div 
              onClick={() => fileInputRef.current.click()}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-400 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all overflow-hidden"
            >
              <Paperclip className="w-5 h-5 shrink-0" />
              <span className="truncate">{topic ? (topic.length > 30 ? topic.substring(0, 30) + '...' : topic) : t('attach_notes')}</span>
            </div>
            <Button 
              variant="primary" 
              className="px-8 shadow-xl shadow-primary/40 text-lg"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? t('loading') : t('generate_now')}
            </Button>
          </div>
        </div>
      </Glass>

      {/* Tabs & History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t('recent_quizzes')}
          </h2>
        </div>

        {loading ? (
          <QuizSkeleton />
        ) : quizHistory.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {quizHistory.map((quiz) => (
              <Glass key={quiz.id} className="p-6 hover:border-accent/50 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-accent/10 group-hover:border-accent/20 transition-all">
                      <BarChart3 className="w-7 h-7 text-slate-400 group-hover:text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors truncate">{quiz.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 shrink-0"><Brain className="w-3.5 h-3.5" /> {quiz.total_questions} {t('questions')}</span>
                        <span className="flex items-center gap-1 shrink-0"><Clock className="w-3.5 h-3.5" /> {new Date(quiz.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <div className="text-2xl font-bold text-white">
                      {quiz.total_questions > 0 ? Math.round((quiz.score / quiz.total_questions) * 100) : 0}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{t('accuracy')}</div>
                  </div>
                </div>
              </Glass>
            ))}
          </div>
        ) : (
          <Glass className="p-12 text-center">
            <Zap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t('no_quizzes')}</h3>
            <p className="text-slate-400">{t('first_goal_desc')}</p>
          </Glass>
        )}
      </div>

      <QuizModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        quizData={activeQuiz?.questions}
        onComplete={handleQuizComplete}
      />
    </div>
  )
}

export default Quiz
