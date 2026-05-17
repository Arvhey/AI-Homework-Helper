import React, { createContext, useContext, useState } from 'react'

const AIContext = createContext()

export const AIProvider = ({ children }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')

  const value = {
    isGenerating,
    setIsGenerating,
    currentResponse,
    setCurrentResponse
  }

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  )
}

export const useAIContext = () => useContext(AIContext)
