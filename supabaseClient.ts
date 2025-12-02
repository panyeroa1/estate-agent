
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sebmossplzlkfdznzsoo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlYm1vc3NwbHpsa2Zkem56c29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MDQ4ODQsImV4cCI6MjA4MDA4MDg4NH0.XCRDqvWTIn1CZsDZGQEYkcSTu8gK8E_ZbWEx6-jiXaM';

export const supabase = createClient(supabaseUrl, supabaseKey);
