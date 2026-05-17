import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CreditCard, Sparkles, Receipt, Check, AlertCircle } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'
import { useToast } from '../../hooks/useToast'

const BillingModal = ({ isOpen, onClose }) => {
  const { showToast } = useToast()



  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg z-10"
          >
            <Glass className="p-8 border-accent/20 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-tight">
                  <CreditCard className="w-5 h-5 text-accent" />
                  Billing & Subscriptions
                </h2>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Donation Tip for Dev Card (GCash support) */}
              <Glass className="p-6 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent border-blue-500/30 rounded-2xl space-y-4 shadow-lg shadow-blue-500/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/20 shrink-0">
                      <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-accent">
                        Donation Tip for Dev 💝
                      </h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Support future updates & premium features!</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md tracking-wider shrink-0">
                    GCash Support
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
                  <div className="space-y-4 text-center md:text-left flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      If this AI Homework Helper is making your study sessions easier, consider sending a small tip to the developer! Any support helps keep our server running and funds new features.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
                      <div className="w-full sm:w-auto flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 min-w-[220px]">
                        <div className="text-left">
                          <div className="text-[8px] text-slate-500 font-bold uppercase">GCash Account Name</div>
                          <div className="text-xs font-black text-white uppercase">Arvhey L.</div>
                          <div className="text-[8px] text-slate-500 font-bold uppercase mt-1">GCash Number</div>
                          <div className="text-sm font-black text-white">0927 347 1269</div>
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText('09273471269')
                            showToast('GCash Number copied to clipboard! Thank you so much! 💝', 'success')
                          }}
                          className="px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase transition-colors shrink-0 active:scale-95 shadow-md shadow-blue-500/20"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* High Tech scan frame utilizing our premium generated mockup QR Code */}
                  <div className="relative w-[130px] h-[130px] rounded-2xl bg-[#0b0f19] border border-blue-500/30 p-2 flex items-center justify-center shrink-0 shadow-xl shadow-black/40 group overflow-hidden select-none">
                    <style>{`
                      @keyframes scan {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                    `}</style>
                    {/* Animated scanning laser line */}
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_rgba(96,165,250,0.8)]" style={{
                      animation: 'scan 2s linear infinite',
                      position: 'absolute',
                      zIndex: 10
                    }} />
                    
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "/gcash-pay")}`} 
                      alt="Real GCash QR Code" 
                      className="w-full h-full object-contain p-1 bg-white rounded-xl relative z-0" 
                    />
                    
                    {/* Fallback clean vector structure if image load has delay */}
                    <div className="hidden w-full h-full p-1 text-blue-500 fill-current">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M 0,0 H 30 V 30 H 0 Z M 10,10 H 20 V 20 H 10 Z" />
                        <path d="M 70,0 H 100 V 30 H 70 Z M 80,10 H 90 V 20 H 80 Z" />
                        <path d="M 0,70 H 30 V 100 H 0 Z M 10,80 H 20 V 90 H 10 Z" />
                        <path d="M 75,75 H 85 V 85 H 75 Z M 79,79 H 81 V 81 H 79 Z" />
                        <path d="M 40,5 H 45 V 10 H 40 Z M 50,0 H 55 V 5 H 50 Z M 60,5 H 65 V 15 H 60 Z" />
                        <path d="M 35,20 H 45 V 25 H 35 Z M 50,25 H 60 V 30 H 50 Z" />
                        <path d="M 20,40 H 25 V 50 H 20 Z M 5,45 H 10 V 60 H 5 Z M 15,55 H 25 V 60 H 15 Z" />
                        <path d="M 40,40 H 60 V 45 H 40 Z M 45,50 H 50 V 65 H 45 Z" />
                        <path d="M 35,70 H 40 V 85 H 35 Z M 45,80 H 50 V 95 H 45 Z M 50,70 H 60 V 75 H 50 Z" />
                        <rect x="42" y="42" width="16" height="16" rx="4" className="text-blue-500 fill-current" />
                        <text x="50" y="53" font-family="system-ui" font-size="10" font-weight="black" fill="white" text-anchor="middle">G</text>
                      </svg>
                    </div>
                  </div>
                </div>
              </Glass>
            </Glass>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default BillingModal
