import React from 'react'
import { motion } from 'framer-motion'

const Loader = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  }

  return (
    <div className="flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className={`${sizes[size]} border-primary border-t-transparent rounded-full`}
      />
    </div>
  )
}

export default Loader
