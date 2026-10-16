import { createClient } from '@supabase/supabase-js';

// Vercel builds prerender client pages before runtime environment variables may
// be configured. Use inert placeholders only for build-time rendering; real
// authentication requires the project's public Supabase URL and publishable key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://build-placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'build-placeholder-publishable-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
