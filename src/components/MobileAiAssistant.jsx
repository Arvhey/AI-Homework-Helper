import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, Brain, GraduationCap, Paperclip, Trash2, History, Plus, Edit2 } from 'lucide-react'
import Glass from './ui/Glass'
import Button from './ui/Button'
import { useToast } from '../hooks/useToast'

const MobileAiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('homework_helper_chat_sessions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.map(session => ({
          ...session,
          messages: session.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
      } catch (e) {
        console.error('Failed to parse chat sessions', e)
      }
    }
    const defaultSessionId = Date.now()
    return [
      {
        id: defaultSessionId,
        title: 'New Chat 🤖',
        messages: [
          {
            id: 1,
            sender: 'ai',
            text: "Hello! 👋 I am your AI Homework Companion. Ask me any math, science, or writing question, and I'll help you solve it instantly!",
            timestamp: new Date()
          }
        ]
      }
    ]
  })

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const saved = localStorage.getItem('homework_helper_active_session_id')
    if (saved) {
      return Number(saved)
    }
    return sessions[0]?.id || Date.now()
  })

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const { showToast } = useToast()

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0]
  const messages = activeSession ? activeSession.messages : []

  // Auto-save sessions and activeSessionId to local storage
  useEffect(() => {
    localStorage.setItem('homework_helper_chat_sessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('homework_helper_active_session_id', activeSessionId.toString())
  }, [activeSessionId])

  const startNewChat = () => {
    const newSessionId = Date.now()
    const newSession = {
      id: newSessionId,
      title: 'New Chat 🤖',
      messages: [
        {
          id: 1,
          sender: 'ai',
          text: "Hello! 👋 I am your AI Homework Companion. Ask me any math, science, or writing question, and I'll help you solve it instantly!",
          timestamp: new Date()
        }
      ]
    }
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSessionId)
    setIsHistoryOpen(false)
    showToast('Started new chat!', 'success')
  }

  const deleteSession = (id, e) => {
    e.stopPropagation()
    if (sessions.length === 1) {
      showToast('Cannot delete the only chat session!', 'warning')
      return
    }
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      const remaining = sessions.filter(s => s.id !== id)
      setSessions(remaining)
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id)
      }
      showToast('Chat deleted!', 'info')
    }
  }

  const renameSession = (id, e) => {
    e.stopPropagation()
    const sessionToRename = sessions.find(s => s.id === id)
    if (!sessionToRename) return
    
    const newName = window.prompt("Enter new title for this chat:", sessionToRename.title)
    if (newName && newName.trim().length > 0) {
      setSessions(prev => prev.map(s => {
        if (s.id === id) {
          return { ...s, title: newName.trim() }
        }
        return s
      }))
      showToast('Chat title updated!', 'success')
    }
  }

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
        setInputValue(prev => prev + `\n\n[File Attached: ${file.name}]\n${extractedText}`)
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const suggestions = [
    { label: '📝 Math: Quadratic Formula', text: 'Explain how to solve quadratic equations using the quadratic formula.' },
    { label: '🔬 Science: Gravity', text: 'Can you explain gravity in simple terms?' },
    { label: '✍️ Essay: Narrative intro', text: 'Give me a hook idea for a narrative essay about technology.' }
  ]

  const getLocalResponse = (text) => {
    const q = text.toLowerCase().trim()
    if (q.includes('bahay kubo') || q.includes('kubo')) {
      return `Here are the complete lyrics to **Bahay Kubo**! 🎵\n\n*Bahay kubo, kahit munti*\n*Ang halaman doon ay sari-sari.*\n*Singkamas at talong, sigarilyas at mani,*\n*Sitaw, bataw, patani.*\n\n*Kundol, patola, upo't kalabasa,*\n*At saka mayroon pa — labanos, mustasa,*\n*Sibuyas, kamatis, bawang at luya,*\n*Sa paligid-ligid ay puro linga.*\n\n💡 The song celebrates a small Filipino nipa hut surrounded by 18 vegetables!`
    }
    if (q.includes('jose rizal') || q.includes('rizal')) {
      return `**Dr. José Rizal** is the national hero of the Philippines! 🇵🇭\n\n• Wrote *Noli Me Tángere* (1887) and *El Filibusterismo* (1891)\n• Executed on December 30, 1896 at Bagumbayan (now Rizal Park)\n• His death sparked the Philippine Revolution against Spain`
    }
    if (q.includes('photosynthesis')) {
      return `**Photosynthesis** converts sunlight into food for plants! ☀️🌱\n\n🧪 **Equation**: 6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂\n\n1. Leaves absorb sunlight via **chlorophyll**\n2. CO₂ from air + H₂O from soil are absorbed\n3. Glucose (food) is produced; Oxygen is released`
    }
    if (q.includes('water cycle')) {
      return `The **Water Cycle** moves water continuously through Earth! 🌧️\n\n1. **Evaporation** — sun turns water to vapor\n2. **Condensation** — vapor forms clouds\n3. **Precipitation** — rain/snow falls\n4. **Collection** — water returns to oceans & rivers`
    }
    if (q.includes('quadratic') || q.includes('formula') || (q.includes('math') && q.includes('solve'))) {
      return `**Quadratic Formula** for ax² + bx + c = 0:\n\n🧮 **x = (-b ± √(b² - 4ac)) / 2a**\n\n1. Find **a**, **b**, **c** in your equation\n2. Plug into the formula\n3. Solve for both + and − to get two answers!`
    }
    if (q.includes('gravity') || q.includes('physics')) {
      return `**Gravity** is the force attracting objects toward each other! 🌌\n\n• Earth's gravitational pull = **9.8 m/s²**\n• More mass = stronger gravity\n• Keeps the Moon orbiting Earth & Earth orbiting the Sun`
    }
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hello! 👋 I'm your AI Study Companion!\n\n📚 Ask me anything about:\n• Math, Science, History, English\n• Filipino songs & culture (Bahay Kubo!)\n• Essay writing, formulas, definitions\n• Any homework topic!\n\nWhat are you studying today?`
    }
    // Smart generic fallback
    const topic = text.replace(/explain|what is|who is|tell me about|give me|define/gi, '').trim()
    return `Here's a breakdown of **"${topic}"**: 🧠\n\n1. **Definition** — Research the core meaning of "${topic}" in your textbook.\n2. **Key Points** — Identify the main concepts or rules.\n3. **Application** — Think about how "${topic}" is used in real life.\n\n💡 Tip: Try asking me something more specific like:\n• "Explain ${topic} step by step"\n• "Give me an example of ${topic}"`
  }

  const handleSend = async (text) => {
    if (!text.trim()) return

    const userMsg = { id: Date.now(), sender: 'user', text, timestamp: new Date() }
    
    // Append to active session and auto-rename title if default
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const isDefaultTitle = s.title === 'New Chat 🤖' || s.title === 'New Chat'
        const newTitle = isDefaultTitle 
          ? (text.length > 25 ? text.substring(0, 25) + '...' : text)
          : s.title
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMsg]
        }
      }
      return s
    }))

    setInputValue('')
    setIsTyping(true)

    let responseText = ''

    try {
      const systemPrompt = 'You are a friendly, expert AI Homework Helper and Study Companion for Filipino students. Give concise, clear, well-formatted educational answers. For Tagalog folk songs like Bahay Kubo, provide the complete lyrics. Use bullet points and numbered lists to organize answers.'

      const promptText = `System: ${systemPrompt}\nUser: ${text}`
      const encodedPrompt = encodeURIComponent(promptText)

      // Layer 1: text.pollinations.ai
      try {
        const res = await fetch(`https://text.pollinations.ai/${encodedPrompt}`, { signal: AbortSignal.timeout(8000) })
        if (res.ok) {
          const raw = await res.text()
          if (raw && raw.trim().length > 0) responseText = raw.trim()
        }
      } catch (err) {
        console.warn('Chat Layer 1 failed, trying Layer 2...', err)
      }

      // Layer 2: gen.pollinations.ai
      if (!responseText) {
        try {
          const res = await fetch(`https://gen.pollinations.ai/text/${encodedPrompt}`, { signal: AbortSignal.timeout(8000) })
          if (res.ok) {
            const raw = await res.text()
            if (raw && raw.trim().length > 0) responseText = raw.trim()
          }
        } catch (err) {
          console.warn('Chat Layer 2 failed, trying Layer 3 proxy...', err)
        }
      }

      // Layer 3: AllOrigins CORS proxy
      if (!responseText) {
        try {
          const targetUrl = `https://text.pollinations.ai/${encodedPrompt}`
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
          const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) })
          if (res.ok) {
            const data = await res.json()
            if (data && data.contents && data.contents.trim().length > 0) {
              responseText = data.contents.trim()
            }
          }
        } catch (err) {
          console.error('Chat Layer 3 failed, using offline fallback:', err)
          responseText = getLocalResponse(text)
        }
      }

      if (!responseText) {
        responseText = getLocalResponse(text)
      }
    } catch {
      responseText = getLocalResponse(text)
    }

    setTimeout(() => {
      setIsTyping(false)
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        timestamp: new Date()
      }
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, aiMsg]
          }
        }
        return s
      }))
    }, 300)
  }

  return (
    <>
      {/* Floating Robot Action Button - Responsive and fully functional on desktop & mobile */}
      <div className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-50">
        <div className="relative">
          {/* Pulsing Outer Ring */}
          <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-r from-accent via-primary to-accent shadow-lg shadow-accent/40 border border-white/20 relative z-10 text-white focus:outline-none"
          >
            <Bot className="w-7 h-7 animate-pulse" />
          </motion.button>
        </div>
      </div>

      {/* Chat Companion Modal / Floating Card */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 md:inset-auto md:bottom-24 md:right-8 md:p-0 md:z-50">
            {/* Overlay - Mobile Only to allow desktop multitasking */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full max-w-md h-[80vh] md:w-96 md:h-[550px] flex flex-col relative z-10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <Glass className="flex-1 flex flex-col border-white/20 bg-[#0d1220]/90 backdrop-blur-2xl ring-1 ring-white/10 shadow-2xl h-full">
                
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] z-50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                      title="Chat History"
                      className={`p-1.5 rounded-lg border transition-all shrink-0 ${
                        isHistoryOpen 
                          ? "bg-primary/20 border-primary/30 text-primary" 
                          : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg shadow-accent/20 shrink-0">
                        <Bot className="w-4.5 h-4.5 text-white animate-bounce" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1 truncate pr-1">
                          {isHistoryOpen ? "Chat History" : activeSession.title}
                        </h2>
                        <p className="text-[9px] text-slate-400 font-semibold tracking-wide uppercase mt-0.5">AI Companion</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sliding History Drawer */}
                <AnimatePresence>
                  {isHistoryOpen && (
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'tween', duration: 0.25 }}
                      className="absolute inset-x-0 bottom-0 top-[65px] bg-[#0a0e1a]/95 backdrop-blur-3xl z-40 border-r border-white/10 flex flex-col p-4"
                    >
                      {/* New Chat Button */}
                      <button
                        onClick={startNewChat}
                        className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white rounded-xl font-black uppercase text-xs tracking-wider shadow-lg shadow-accent/20 transition-all mb-4 shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        New Chat
                      </button>

                      {/* Sessions List */}
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 px-1">Recent Conversations</p>
                      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {sessions.map(s => {
                          const isActive = s.id === activeSessionId
                          return (
                            <div
                              key={s.id}
                              onClick={() => {
                                setActiveSessionId(s.id)
                                setIsHistoryOpen(false)
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                                isActive 
                                  ? 'bg-primary/10 border-primary/30 text-white font-bold' 
                                  : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <Bot className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
                                <span className="text-xs truncate">{s.title}</span>
                              </div>
                              
                              {/* Session Action Buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0 ml-2">
                                <button
                                  onClick={(e) => renameSession(s.id, e)}
                                  title="Rename Chat"
                                  className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => deleteSession(s.id, e)}
                                  title="Delete Chat"
                                  className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0e1a]/40">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-lg ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-primary to-accent text-white rounded-br-none border border-white/10'
                            : 'bg-white/5 border border-white/10 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <div className="whitespace-pre-line font-medium">{msg.text}</div>
                        <div className={`text-[8px] mt-1.5 opacity-50 flex items-center gap-1 ${
                          msg.sender === 'user' ? 'justify-end text-white' : 'justify-start text-slate-400'
                        }`}>
                          {msg.sender === 'ai' ? <Brain className="w-2.5 h-2.5" /> : <GraduationCap className="w-2.5 h-2.5" />}
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* AI Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestions / Chips */}
                {messages.length === 1 && !isTyping && (
                  <div className="p-3 bg-white/[0.01] border-t border-white/5 space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Try asking:</p>
                    <div className="flex flex-col gap-1.5">
                      {suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug.text)}
                          className="w-full text-left text-[11px] font-medium text-slate-300 hover:text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 transition-all duration-200"
                        >
                          {sug.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Bar */}
                <div className="p-4 border-t border-white/10 bg-white/[0.02]">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".txt,.js,.py,.md,.html,.css,.json,.pdf,.docx"
                  />
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend(inputValue)
                    }}
                    className="flex gap-2 items-center"
                  >
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all flex items-center justify-center shrink-0"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask or attach document..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
                    />
                    <Button
                      type="submit"
                      variant="accent"
                      className="px-4 bg-gradient-to-r from-accent to-primary flex items-center justify-center h-10"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>

              </Glass>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export default MobileAiAssistant
