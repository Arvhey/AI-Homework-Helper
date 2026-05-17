import React from 'react'
import { BarChart3, Brain, Clock, Play } from 'lucide-react'
import Glass from '../ui/Glass'
import Button from '../ui/Button'
import { cn } from '../ui/Glass'

const QuizCard = ({ quiz }) => {
  return (
    <Glass className="p-6 hover:border-accent/50 transition-all group cursor-pointer">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/20 transition-all">
            <BarChart3 className="w-7 h-7 text-slate-400 group-hover:text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{quiz.title}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1"><Brain className="w-3.5 h-3.5" /> {quiz.questions} Questions</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {quiz.duration}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{quiz.lastScore}</div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Last Score</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
            quiz.difficulty === 'Hard' ? "bg-red-500/10 text-red-500" :
            quiz.difficulty === 'Expert' ? "bg-purple-500/10 text-purple-500" :
            quiz.difficulty === 'Medium' ? "bg-yellow-500/10 text-yellow-500" :
            "bg-emerald-500/10 text-emerald-500"
          )}>
            {quiz.difficulty}
          </span>
          <span className="text-xs text-slate-500">{quiz.attempts} attempts</span>
        </div>
        <Button variant="glass" className="py-2 px-4 text-sm group-hover:bg-accent group-hover:text-white transition-all">
          <Play className="w-4 h-4 fill-current" />
          Start Quiz
        </Button>
      </div>
    </Glass>
  )
}

export default QuizCard
