import { supabase } from './supabase'

export const quizService = {
  getQuizzes: async () => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  createQuiz: async (quiz) => {
    const { data, error } = await supabase
      .from('quizzes')
      .insert([quiz])
      .select()
    return { data, error }
  },

  saveScore: async (id, score) => {
    const { data, error } = await supabase
      .from('quizzes')
      .update({ last_score: score })
      .eq('id', id)
      .select()
    return { data, error }
  }
}
