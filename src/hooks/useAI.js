import { useState } from 'react'
import { useAIContext } from '../context/AIContext'
import { aiService } from '../services/aiService'

export const useAI = () => {
  const { isGenerating, setIsGenerating, setCurrentResponse } = useAIContext()
  const [error, setError] = useState(null)

  const SYSTEM_PROMPT = 'You are a friendly, expert AI Homework Helper and Study Companion. Give concise, clear, well-formatted educational answers. Use bullet points and numbered lists to organize answers when helpful.'

  const askAI = async (prompt, conversationHistory = []) => {
    setIsGenerating(true)
    setError(null)
    try {
      // Build full context: system prompt + history + new user message
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...conversationHistory.filter(m => m.role === 'user' || m.role === 'assistant'),
        { role: 'user', content: prompt }
      ]
      const response = await aiService.chat(messages)
      setCurrentResponse(response)
      return response
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const generateQuiz = async (content, targetCount) => {
    setIsGenerating(true)
    try {
      const quiz = await aiService.generateQuiz(content, targetCount)
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

  const generateFlashcards = async (content) => {
    setIsGenerating(true)
    try {
      const flashcards = await aiService.generateFlashcards(content)
      return flashcards
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return { askAI, generateQuiz, summarize, generateFlashcards, loading: isGenerating, error }
}
