import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, ArrowRight, Trophy, Brain } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'
import { cn } from '../ui/Glass'

const QuizModal = ({ isOpen, onClose, quizData, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState([])

  if (!quizData || quizData.length === 0) return null

  const handleAnswerSelect = (option) => {
    if (selectedAnswer) return // Prevent multiple selections
    setSelectedAnswer(option)
    
    const isCorrect = option === quizData[currentQuestion].answer
    if (isCorrect) setScore(prev => prev + 1)
    
    setAnswers(prev => [...prev, { 
      question: quizData[currentQuestion].question,
      selected: option,
      correct: quizData[currentQuestion].answer,
      isCorrect 
    }])
  }

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      setShowResult(true)
    }
  }

  const handleFinish = () => {
    onComplete({
      score,
      total: quizData.length,
      answers
    })
    onClose()
  }

  const question = quizData[currentQuestion]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl z-10 p-4"
          >
            <Glass className="p-8 border-primary/20 shadow-2xl relative overflow-hidden">
              {!showResult ? (
                <>
                  {/* Progress Bar */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <motion.div 
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-8">
                    <span className="text-sm font-bold text-primary uppercase tracking-widest">
                      Question {currentQuestion + 1} of {quizData.length}
                    </span>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-8 leading-tight">
                    {question.question}
                  </h2>

                  <div className="space-y-4">
                    {question.options.map((option, i) => {
                      const isSelected = selectedAnswer === option
                      const isCorrect = option === question.answer
                      const isWrong = isSelected && !isCorrect
                      
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={!!selectedAnswer}
                          className={cn(
                            "w-full p-4 rounded-xl border text-left transition-all duration-300 flex items-center justify-between group",
                            !selectedAnswer ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50" :
                            isCorrect ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" :
                            isWrong ? "bg-red-500/10 border-red-500/50 text-red-500" :
                            "bg-white/5 border-white/10 opacity-50"
                          )}
                        >
                          <span className="font-medium">{option}</span>
                          {selectedAnswer && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                          {selectedAnswer && isWrong && <AlertCircle className="w-5 h-5" />}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button 
                      variant="primary" 
                      onClick={handleNext}
                      disabled={!selectedAnswer}
                      className="px-8"
                    >
                      {currentQuestion === quizData.length - 1 ? 'Finish' : 'Next Question'}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-12 h-12 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Quiz Completed!</h2>
                  <p className="text-slate-400 mb-8">Great job! Here's how you performed:</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <Glass className="p-6 bg-white/5">
                      <div className="text-4xl font-black text-white mb-1">{score}/{quizData.length}</div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Final Score</div>
                    </Glass>
                    <Glass className="p-6 bg-white/5">
                      <div className="text-4xl font-black text-primary mb-1">{Math.round((score/quizData.length)*100)}%</div>
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Accuracy</div>
                    </Glass>
                  </div>

                  <Button variant="primary" className="w-full py-4 text-lg" onClick={handleFinish}>
                    Close & Save Results
                  </Button>
                </div>
              )}
            </Glass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default QuizModal
