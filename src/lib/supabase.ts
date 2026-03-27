import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Detect if running in demo mode (no real Supabase credentials)
export const isDemoMode =
  !supabaseUrl ||
  !supabaseKey ||
  supabaseUrl.includes('placeholder') ||
  supabaseKey.includes('placeholder');

// Use real values if available, otherwise use safe placeholders that won't hard-throw
const url = isDemoMode ? 'https://demo.supabase.co' : supabaseUrl;
const key = isDemoMode
  ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlbW8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjo5OTk5OTk5OTk5fQ.demo'
  : supabaseKey;

export const supabase = createClient(url, key);
