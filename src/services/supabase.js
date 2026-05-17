import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder-project.supabase.co'
const finalKey = supabaseAnonKey && supabaseAnonKey !== 'your-anon-key' ? supabaseAnonKey : 'placeholder-key'

if (!isValidUrl(supabaseUrl) || finalKey === 'placeholder-key') {
  console.warn('⚠️ Supabase credentials are invalid or missing. Please update your .env file with real project details.')
}

export const supabase = createClient(finalUrl, finalKey)
