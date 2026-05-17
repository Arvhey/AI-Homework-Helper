import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Bell, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

const Navbar = () => {
  return (
    <nav className="lg:hidden sticky top-0 z-40 w-full bg-dark-bg/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <GraduationCap className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-bold text-white font-outfit">AI Helper</span>
      </div>
      
      <div className="flex items-center gap-3">
        <Link to="/notifications">
          <Button variant="ghost" className="p-2">
            <Bell className="w-5 h-5" />
          </Button>
        </Link>
        <Link to="/profile">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-400" />
          </div>
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
