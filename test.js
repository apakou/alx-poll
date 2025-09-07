// Better approach using Supabase patterns
import { createClient } from '@/lib/supabase/server';

async function handleSecureSession(userId) {
  const supabase = createClient();
  
  // Use Supabase's built-in session management
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // Let Supabase handle token refresh
    const { data: refreshed } = await supabase.auth.refreshSession();
    return refreshed.session;
  }
  
  return session;
}