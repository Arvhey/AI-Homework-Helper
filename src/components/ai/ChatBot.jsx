import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Image as ImageIcon, Trash2 } from 'lucide-react'
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
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('desktop_assistant_chat_history')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse desktop chat history', e)
      }
    }
    return [
      { role: 'assistant', content: "Hello! I'm your AI Study Companion. How can I help you today?" }
    ]
  })

  // Auto-save chat history on message change
  useEffect(() => {
    localStorage.setItem('desktop_assistant_chat_history', JSON.stringify(messages))
  }, [messages])

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your chat history?")) {
      const initial = [
        { role: 'assistant', content: "Hello! I'm your AI Study Companion. How can I help you today?" }
      ]
      setMessages(initial)
      localStorage.setItem('desktop_assistant_chat_history', JSON.stringify(initial))
      showToast('Chat history cleared!', 'info')
    }
  }

  const [input, setInput] = useState('')
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Initial message translation if needed, but usually kept as is
  }, [t])

  // Dynamically load Mammoth docx parser
  const loadMammoth = async () => {
    if (window.mammoth) return window.mammoth
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
      script.onload = () => resolve(window.mammoth)
      script.onerror = () => reject(new Error('Failed to load DOCX parser'))
      document.head.appendChild(script)
    })
  }

  // Dynamically load PDFJS parser
  const loadPDFJS = async () => {
    if (window.pdfjsLib) return window.pdfjsLib
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'
        resolve(window.pdfjsLib)
      }
      script.onerror = () => reject(new Error('Failed to load PDF parser'))
      document.head.appendChild(script)
    })
  }

  const extractDocxText = async (file) => {
    const mammothLib = await loadMammoth()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result
          const result = await mammothLib.extractRawText({ arrayBuffer })
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
    const pdfjs = await loadPDFJS()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result)
          const pdf = await pdfjs.getDocument(typedarray).promise
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const extension = file.name.split('.').pop().toLowerCase()
    showToast(`Reading ${file.name}...`, 'info')

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

      if (extractedText && extractedText.trim().length > 0) {
        setInput(prev => prev + `\n\n[File Attached: ${file.name}]\n${extractedText}`)
        showToast(`${file.name} loaded successfully!`, 'success')
      } else {
        showToast('Successfully read file, but no text content was found.', 'warning')
      }
    } catch (err) {
      console.error(err)
      showToast(`Error reading document: ${err.message}`, 'error')
    }
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
          accept=".txt,.js,.py,.md,.html,.css,.json,.pdf,.docx"
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
            {messages.length > 1 && (
              <Button 
                variant="ghost" 
                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                onClick={clearHistory}
                title="Clear Chat History"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
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
