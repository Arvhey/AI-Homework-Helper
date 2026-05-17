import React from 'react'
import { cn } from './Glass'

const Input = ({ label, icon: Icon, error, className, ...props }) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-sm font-semibold text-slate-300 ml-1">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />}
        <input 
          className={cn(
            "w-full bg-white/5 border border-white/10 rounded-xl py-3 text-white outline-none focus:border-primary/50 transition-all",
            Icon ? "pl-12 pr-4" : "px-4",
            error ? "border-red-500/50" : "",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  )
}

export default Input
