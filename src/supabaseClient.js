import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xqnyazcgizacvyyifypj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxbnlhemNnaXphY3Z5eWlmeXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzYzMDAsImV4cCI6MjA2MjcxMjMwMH0.DspGFt-umlMc_6rd_yq6FAXb4bi_F1lEplLaFLqZwBA';

export const supabase = createClient(supabaseUrl, supabaseKey);