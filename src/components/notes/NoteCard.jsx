import React from 'react'
import { FileText, MoreHorizontal, Clock } from 'lucide-react'
import Glass from '../ui/Glass'
import { cn } from '../ui/Glass'

const NoteCard = ({ note }) => {
  return (
    <Glass className="p-6 group hover:border-primary/50 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
          <FileText className="w-6 h-6 text-slate-400 group-hover:text-primary" />
        </div>
        <button className="text-slate-500 hover:text-white p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{note.title}</h3>
      <p className="text-sm text-slate-400 mb-6 line-clamp-3 leading-relaxed">
        {note.content}
      </p>
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
          {note.category}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          {note.date}
        </div>
      </div>
    </Glass>
  )
}

export default NoteCard
