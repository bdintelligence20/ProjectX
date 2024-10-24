import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ppwfpdshjemkokrfteca.supabase.co'; // Replace with your actual Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwd2ZwZHNoamVta29rcmZ0ZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0OTUwOTUsImV4cCI6MjA0NTA3MTA5NX0.0agwgh5YXKIMd91qe4XSHYLiFlOF1XdXRUNwXXwM4mw'; // Replace with your actual Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
