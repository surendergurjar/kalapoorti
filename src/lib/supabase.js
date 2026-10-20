import { createClient } from '@supabase/supabase-js'

// Vite exposes variables that start with VITE_ via import.meta.env.
// These come from .env.local. Only the public anon key belongs here.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anonKey)

// createClient throws on an empty URL, so we fall back to placeholders and let
// the app show a friendly "missing keys" message instead of a blank page.
export const supabase = createClient(
  url || 'http://localhost',
  anonKey || 'missing-key'
)
