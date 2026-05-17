import React from 'react'

const PromptSuggestions = ({ suggestions, onSelect }) => {
  return (
    <div className="p-4 overflow-x-auto border-t border-white/5 bg-white/5 flex gap-2 no-scrollbar">
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 hover:text-white hover:border-primary/50 whitespace-nowrap transition-all"
        >
          {s}
        </button>
      ))}
    </div>
  )
}

export default PromptSuggestions
