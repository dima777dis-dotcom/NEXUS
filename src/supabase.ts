import { createClient } from '@supabase/supabase-js'

// Publishable key is intended for browser use; database access is restricted by RLS.
const url = 'https://ehqoawymfadhlyamxaei.supabase.co'
const key = 'sb_publishable_DYjtvq--7sM6jwXpEz85aQ_q1y82_bo'

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
})
