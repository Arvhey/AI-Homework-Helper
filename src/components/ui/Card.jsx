import React from 'react'
import { cn } from './Glass'
import { motion } from 'framer-motion'

const Card = ({ children, className, ...props }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn(
        "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
