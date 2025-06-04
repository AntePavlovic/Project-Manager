import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://klnspuosgxokqsjopwer.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbnNwdW9zZ3hva3Fzam9wd2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNzA0NzIsImV4cCI6MjA2NDY0NjQ3Mn0._YBE0irIvnWyA79iElGvZd4ZlRQHg2e_xWbOEIxseqg';
export const supabase = createClient(supabaseUrl, supabaseKey);