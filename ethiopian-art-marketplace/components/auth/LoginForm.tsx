'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const requested = searchParams.get('next');
    const next = requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/account';
    window.location.assign(next);
  }

  return (
    <form className="form-card auth-card" onSubmit={onSubmit}>
      <div className="auth-card-heading">
        <span className="eyebrow">Welcome back</span>
        <h1>Log in.</h1>
        <p>Access your orders, artist application, or Tilet Art Gallery workspace.</p>
      </div>
      <div className="form-grid auth-form-grid">
        <label className="field-full"><span>Email</span><input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
        <label className="field-full"><span>Password</span><input name="password" type="password" required autoComplete="current-password" placeholder="Your password" /></label>
      </div>
      {error && <div className="form-alert form-alert-error">{error}</div>}
      <button className="pill pill-dark pill-full" disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
      <p className="auth-switch">New to Tilet Art Gallery? <Link href="/signup">Create an account</Link></p>
    </form>
  );
}
