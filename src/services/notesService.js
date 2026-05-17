import { supabase } from './supabase'

export const notesService = {
  getNotes: async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
    return { data, error }
  },

  createNote: async (note) => {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
    return { data, error }
  },

  updateNote: async (id, updates) => {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
    return { data, error }
  },

  deleteNote: async (id) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    return { error }
  }
}
