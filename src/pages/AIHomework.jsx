import React from 'react'
import { Bot, FileText, MoreVertical } from 'lucide-react'
import ChatBot from '../components/ai/ChatBot'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'

import { useLanguage } from '../context/LanguageContext'

const AIHomework = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] lg:h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
            <Bot className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t('ai_companion')}</h1>
            <div className="flex items-center gap-2 text-emerald-500 text-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {t('ai_status')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="glass" className="p-2.5">
            <FileText className="w-5 h-5" />
          </Button>
          <Button variant="glass" className="p-2.5">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ChatBot />
    </div>
  )
}

export default AIHomework
