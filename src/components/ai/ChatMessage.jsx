import React from 'react'
import { motion } from 'framer-motion'
import { Bot, User } from 'lucide-react'
import { cn } from '../ui/Glass'

const ChatMessage = ({ msg }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex gap-4 max-w-[85%] lg:max-w-[75%]",
        msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center",
        msg.role === 'user' ? "bg-secondary/20" : "bg-primary/20"
      )}>
        {msg.role === 'user' ? <User className="w-5 h-5 text-secondary" /> : <Bot className="w-5 h-5 text-primary" />}
      </div>
      <div className={cn(
        "p-4 rounded-2xl text-slate-200 leading-relaxed",
        msg.role === 'user' 
          ? "bg-secondary/10 border border-secondary/20 rounded-tr-none" 
          : "bg-white/5 border border-white/10 rounded-tl-none"
      )}>
        {msg.content}
      </div>
    </motion.div>
  )
}

export default ChatMessage
