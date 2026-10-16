'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton({ className = 'text-link' }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign('/');
  }

  return <button type="button" className={className} onClick={logout} disabled={loading}>{loading ? 'Logging out…' : 'Log out'}</button>;
}
