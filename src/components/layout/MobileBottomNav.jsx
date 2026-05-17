import React from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV_ITEMS } from '../../utils/constants'
import { User, Home } from 'lucide-react'
import { cn } from '../ui/Glass'
import { useLanguage } from '../../context/LanguageContext'

const MobileBottomNav = () => {
  const { t } = useLanguage()

  // Pick 7 essential items for mobile bottom nav
  const mobileItems = [
    NAV_ITEMS[2], // Notes
    NAV_ITEMS[3], // Quiz
    NAV_ITEMS[4], // Flashcards
    { label: 'Home', icon: Home, path: '/dashboard' }, // Home (Dashboard) - CENTER
    NAV_ITEMS[5], // Pomodoro
    NAV_ITEMS[6], // Goals
    { label: 'Profile', icon: User, path: '/profile' }
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-dark-bg/95 backdrop-blur-3xl border-t border-white/10 px-1 flex items-center justify-between z-50 pb-safe">
      {mobileItems.map((item, index) => {
        const isHome = item.label === 'Home'
        
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex-1 flex flex-col items-center justify-center transition-all duration-300 relative",
              isActive ? "text-primary" : "text-slate-400",
              isHome ? "z-20 -mt-8" : "z-10"
            )}
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "flex items-center justify-center transition-all duration-500",
                  isHome 
                    ? "w-14 h-14 rounded-full bg-primary text-white shadow-[0_8px_25px_rgba(99,102,241,0.5)] border-4 border-[#0f172a] scale-110" 
                    : "p-1.5 rounded-lg",
                  isActive && !isHome ? "bg-primary/10" : ""
                )}>
                  <item.icon className={cn(isHome ? "w-7 h-7" : "w-5 h-5")} />
                </div>
                
                {!isHome && (
                  <span className="text-[8px] font-bold uppercase tracking-tighter mt-1 text-center opacity-80">
                    {t(item.label.toLowerCase())}
                  </span>
                )}

                {isActive && !isHome && (
                  <motion.div
                    layoutId="active-dot"
                    className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,1)]"
                  />
                )}
              </>
            )}
          </NavLink>
        )
      })}
    </nav>
  )
}

export default MobileBottomNav
