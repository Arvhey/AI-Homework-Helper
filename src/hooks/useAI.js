import { useState } from 'react'
import { useAIContext } from '../context/AIContext'
import { aiService } from '../services/aiService'

export const useAI = () => {
  const { isGenerating, setIsGenerating, setCurrentResponse } = useAIContext()
  const [error, setError] = useState(null)

  const askAI = async (prompt) => {
    setIsGenerating(true)
    setError(null)
    try {
      const response = await aiService.chat([{ role: 'user', content: prompt }])
      setCurrentResponse(response)
      return response
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const generateQuiz = async (content) => {
    setIsGenerating(true)
    try {
      const quiz = await aiService.generateQuiz(content)
      return quiz
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const summarize = async (content) => {
    setIsGenerating(true)
    try {
      const summary = await aiService.summarize(content)
      return summary
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return { askAI, generateQuiz, summarize, loading: isGenerating, error }
}
