import React from 'react'
import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

const TypingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
        <Bot className="w-5 h-5 text-primary" />
      </div>
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-1 items-center">
        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary" />
      </div>
    </motion.div>
  )
}

export default TypingIndicator
