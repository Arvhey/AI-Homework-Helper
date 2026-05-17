import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowLeft, Send, Sparkles, Smartphone, Coins, CreditCard } from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'

const GcashPay = () => {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState('input') // 'input', 'processing', 'receipt'
  const [refNo, setRefNo] = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return alert('Please enter a valid amount')
    
    // Generate simulated reference number
    const randomRef = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join(' ')
    setRefNo(`5019 ${randomRef}`)
    
    setStep('processing')
    setTimeout(() => {
      setStep('receipt')
    }, 1800)
  }

  // Preset amounts helper
  const presets = [50, 100, 200, 500]

  return (
    <div className="min-h-screen bg-[#0d1527] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      <style>{`
        @keyframes floatMoney {
          0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .bill {
          position: absolute;
          animation: floatMoney 4s linear infinite;
          user-select: none;
          pointer-events: none;
          z-index: 50;
        }
      `}</style>

      {/* Background neon glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#005efe]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Header bar */}
      <header className="bg-[#005efe] text-white py-4 px-6 flex items-center justify-between border-b border-blue-600/30 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-white" />
          <span className="font-black tracking-widest text-base">GCash Pay Portal</span>
        </div>
        <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
          Simulation
        </span>
      </header>

      {/* Main Flow Container */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-20">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <Glass className="p-6 md:p-8 border-blue-500/20 shadow-2xl space-y-6">
                {/* Dev Profile card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md border border-blue-400/30">
                    AL
                  </div>
                  <div>
                    <div className="text-[9px] text-blue-400 font-black uppercase tracking-wider">Send Support To</div>
                    <h2 className="text-base font-black text-white uppercase tracking-tight">ARVHEY L.</h2>
                    <p className="text-xs font-semibold text-slate-500">GCash • 0927 *** 1269</p>
                  </div>
                </div>

                <form onSubmit={handleSend} className="space-y-6">
                  {/* Enter Amount section */}
                  <div className="space-y-2 text-center">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Enter Amount (PHP)</label>
                    <div className="relative flex items-center justify-center">
                      <span className="absolute left-6 text-2xl font-black text-blue-400">₱</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-center text-2xl font-black text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {presets.map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toString())}
                        className="py-2.5 rounded-xl bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/30 text-xs font-bold text-white transition-all active:scale-95"
                      >
                        ₱{val}
                      </button>
                    ))}
                  </div>

                  {/* Message container */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Message (Optional)</label>
                    <textarea
                      placeholder="Thank you for building this awesome AI!"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-4 text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Support ₱{amount || '0.00'}
                  </Button>
                </form>
              </Glass>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm text-center"
            >
              <Glass className="p-8 border-blue-500/20 shadow-2xl space-y-6 flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white uppercase tracking-wider">Processing Payment</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">Contacting GCash Gateway...</p>
                </div>
              </Glass>
            </motion.div>
          )}

          {step === 'receipt' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md space-y-6"
            >
              {/* Floating money particles simulation */}
              {Array.from({ length: 15 }).map((_, i) => {
                const isCoin = Math.random() > 0.5
                const leftPos = Math.random() * 90
                const size = isCoin ? Math.random() * 16 + 8 : Math.random() * 24 + 16
                const delay = Math.random() * 3
                const duration = Math.random() * 2 + 3

                return (
                  <div
                    key={i}
                    className="bill flex items-center justify-center text-yellow-500"
                    style={{
                      left: `${leftPos}%`,
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`,
                      top: `-20px`
                    }}
                  >
                    {isCoin ? (
                      <Coins style={{ width: size, height: size }} className="text-yellow-400 drop-shadow-md" />
                    ) : (
                      <CreditCard style={{ width: size * 1.5, height: size }} className="text-emerald-400 drop-shadow-md rotate-12" />
                    )}
                  </div>
                )
              })}

              <Glass className="p-6 md:p-8 border-emerald-500/20 shadow-2xl space-y-6 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent">
                {/* Header Badge */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                    <Check className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                      Transaction Success
                    </span>
                    <h2 className="text-xl font-black text-white tracking-wide uppercase mt-1">Successfully Sent</h2>
                    <p className="text-slate-400 text-xs font-semibold">Sent to ARVHEY L.</p>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Money receipt body */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Amount Sent</span>
                    <span className="text-2xl font-black text-emerald-400">₱{parseFloat(amount).toFixed(2)}</span>
                  </div>

                  {message && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed text-left">
                      <div className="text-[8px] text-slate-500 font-black uppercase tracking-wider mb-1">Your Message</div>
                      "{message}"
                    </div>
                  )}

                  <div className="space-y-2.5 bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Receipt Date</span>
                      <span className="text-white font-bold">{new Date().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Reference No.</span>
                      <span className="text-blue-400 font-black tracking-widest">{refNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold uppercase text-[9px]">Payment Method</span>
                      <span className="text-white font-bold">GCash Personal</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="glass"
                    onClick={() => {
                      setAmount('')
                      setMessage('')
                      setStep('input')
                    }}
                    className="flex-1 py-3 text-xs font-black uppercase tracking-widest"
                  >
                    Send Again
                  </Button>
                </div>
              </Glass>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer support signature */}
      <footer className="py-4 text-center text-slate-500 text-[10px] uppercase font-black tracking-wider border-t border-white/5 z-20">
        💙 Created by the AI Homework Helper Dev Team
      </footer>
    </div>
  )
}

export default GcashPay
