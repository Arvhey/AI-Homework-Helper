import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const Glass = ({ children, className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Glass
