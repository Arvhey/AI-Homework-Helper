import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const Button = ({ children, variant = 'primary', className, ...props }) => {
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20",
    secondary: "bg-secondary hover:bg-secondary-dark text-white shadow-lg shadow-secondary/20",
    accent: "bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20",
    glass: "bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white",
    ghost: "hover:bg-white/5 text-slate-400 hover:text-white",
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default Button
