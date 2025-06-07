import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://klnspuosgxokqsjopwer.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbnNwdW9zZ3hva3Fzam9wd2VyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTA3MDQ3MiwiZXhwIjoyMDY0NjQ2NDcyfQ.LWI6LfSsPzvkgsCSw_SZCqJ4CtZx7Pmukcyp9NB3IOM';
export const supabase = createClient(supabaseUrl, supabaseKey);