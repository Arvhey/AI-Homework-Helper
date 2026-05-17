import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, AlertCircle } from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md relative z-10"
      >
        <div className="mb-8 relative inline-block">
          <div className="text-[150px] font-black text-white/5 font-outfit select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="w-24 h-24 text-primary animate-bounce" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4 font-outfit">Lost in Space?</h1>
        <p className="text-slate-400 mb-10 leading-relaxed">
          The page you're looking for has drifted away into the void. Don't worry, we can help you find your way back home.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard">
            <Button variant="primary">
              <Home className="w-5 h-5" />
              Back to Safety
            </Button>
          </Link>
          <Button variant="glass">
            <Search className="w-5 h-5" />
            Search Help
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound
