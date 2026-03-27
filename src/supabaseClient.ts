import { createClient } from '@supabase/supabase-js'

// Replace with your actual Project URL and Anon Key from Supabase Settings
const supabaseUrl = 'https://alzgunkuppayjudqnebf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsemd1bmt1cHBheWp1ZHFuZWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MDc0MTAsImV4cCI6MjA5MDE4MzQxMH0.gKn-wJaHeUKYC8g6_aDn75hQdlBarm1S-vdPeMODUCk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)