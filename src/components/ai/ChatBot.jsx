import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Image as ImageIcon } from 'lucide-react'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'
import PromptSuggestions from './PromptSuggestions'
import Glass from '../ui/Glass'
import Button from '../ui/Button'
import { useAI } from '../../hooks/useAI'
import { useToast } from '../../hooks/useToast'

import { useLanguage } from '../../context/LanguageContext'

const ChatBot = () => {
  const { askAI, loading } = useAI()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Study Companion. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Initial message translation if needed, but usually kept as is
  }, [t])

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      setInput(prev => prev + `\n\n[File Attached: ${file.name}]\n${content}`)
    }
    reader.readAsText(file)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    const response = await askAI(input)
    if (response) {
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    }
  }

  const suggestions = [
    "Summarize this PDF",
    "Explain Quantum Physics",
    "Create a 5-question quiz",
    "Check my grammar",
  ]

  return (
    <Glass className="flex-1 flex flex-col mb-4 overflow-hidden border-white/5">
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <ChatMessage key={i} msg={msg} />
          ))}
        </AnimatePresence>
        
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <PromptSuggestions suggestions={suggestions} onSelect={setInput} />

      {/* Input Area */}
      <div className="p-4 lg:p-6 bg-white/5 border-t border-white/10">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept=".txt,.js,.py,.md,.html,.css,.json"
        />
        <div className="relative flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              className="p-2 text-slate-400 hover:text-primary"
              onClick={() => fileInputRef.current.click()}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              className="p-2 text-slate-400 hover:text-primary"
              onClick={() => showToast('Image analysis coming soon!', 'info')}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('ai_placeholder')}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50 transition-all"
          />
          <Button 
            onClick={handleSend}
            variant="primary" 
            className="p-3 rounded-xl min-w-0"
            disabled={!input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Glass>
  )
}

export default ChatBot
