import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, CheckCircle, AlertTriangle } from 'lucide-react'
import { cn } from './Glass'

const Toast = ({ toasts }) => {
  return (
    <div className="fixed top-4 right-4 lg:top-8 lg:right-8 z-[100] flex flex-col gap-2 w-fit max-w-[280px] lg:max-w-sm px-4 lg:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "px-3 py-2.5 lg:p-4 rounded-xl backdrop-blur-xl border flex items-center gap-2 lg:gap-3 shadow-2xl",
              toast.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
              toast.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-500" :
              "bg-primary/10 border-primary/20 text-primary"
            )}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" /> :
             toast.type === 'error' ? <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5" /> :
             <Info className="w-4 h-4 lg:w-5 lg:h-5" />}
            
            <span className="flex-1 font-bold text-[10px] lg:text-sm tracking-tight leading-tight">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default Toast
