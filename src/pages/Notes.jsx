import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Clock,
  LayoutGrid,
  List
} from 'lucide-react'
import Glass from '../components/ui/Glass'
import Button from '../components/ui/Button'
import { cn } from '../components/ui/Glass'
import { useToast } from '../hooks/useToast'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import NoteModal from '../components/notes/NoteModal'
import Skeleton from '../components/ui/Skeleton'

const NoteSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <Glass key={i} className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>
        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
      </Glass>
    ))}
  </div>
)

import { useLanguage } from '../context/LanguageContext'

const Notes = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [view, setView] = useState('grid')
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')

  useEffect(() => {
    if (user) fetchNotes()
  }, [user])

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNote = async (formData) => {
    try {
      if (editingNote) {
        const { error } = await supabase
          .from('notes')
          .update({ 
            title: formData.title, 
            content: formData.content, 
            category: formData.category 
          })
          .eq('id', editingNote.id)
        if (error) throw error
        showToast(t('success'), 'success')
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([{ 
            user_id: user.id,
            title: formData.title, 
            content: formData.content, 
            category: formData.category 
          }])
        if (error) throw error
        showToast(t('success'), 'success')
      }
      setIsModalOpen(false)
      setEditingNote(null)
      fetchNotes()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
      if (error) throw error
      showToast(t('delete_note'), 'success')
      fetchNotes()
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'All Categories' || note.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('my_notes')}</h1>
          <p className="text-slate-400">Manage and organize your study materials</p>
        </div>
        <Button variant="primary" onClick={() => {
          setEditingNote(null)
          setIsModalOpen(true)
        }}>
          <Plus className="w-5 h-5" />
          {t('new_note')}
        </Button>
      </div>

      {/* Toolbar */}
      <Glass className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder={t('search_notes')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2 text-white outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setView('grid')}
              className={cn("p-2 rounded-md transition-all", view === 'grid' ? "bg-primary text-white" : "text-slate-500 hover:text-white")}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn("p-2 rounded-md transition-all", view === 'list' ? "bg-primary text-white" : "text-slate-500 hover:text-white")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none"
          >
            <option>All Categories</option>
            <option>Biology</option>
            <option>History</option>
            <option>Math</option>
            <option>CompSci</option>
          </select>
        </div>
      </Glass>

      {/* Notes Content */}
      {loading ? (
        <NoteSkeleton />
      ) : filteredNotes.length > 0 ? (
        <div className={cn(
          "grid gap-6",
          view === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredNotes.map((note) => (
            <Glass key={note.id} className="p-6 group hover:border-primary/50 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div onClick={() => { setEditingNote(note); setIsModalOpen(true); }} className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                  <FileText className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                </div>
                <div className="relative group/menu">
                  <button className="text-slate-500 hover:text-white p-1">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-32 bg-dark-bg border border-white/10 rounded-xl overflow-hidden hidden group-hover/menu:block z-20">
                    <button 
                      onClick={() => { setEditingNote(note); setIsModalOpen(true); }}
                      className="w-full px-4 py-2 text-sm text-white hover:bg-white/5 text-left"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteNote(note.id)}
                      className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 text-left"
                    >
                      {t('delete_note')}
                    </button>
                  </div>
                </div>
              </div>
              <div onClick={() => { setEditingNote(note); setIsModalOpen(true); }}>
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
                    {new Date(note.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Glass>
          ))}
        </div>
      ) : (
        <Glass className="p-12 text-center">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{t('no_notes')}</h3>
          <p className="text-slate-400">{t('create_first_note')}</p>
        </Glass>
      )}

      <NoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveNote}
        initialData={editingNote}
      />
    </div>
  )
}

export default Notes
