'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get('fullName') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`
      }
    });

    if (signUpError) {
      setError(signUpError.message);
    } else if (data.session) {
      window.location.assign('/account');
      return;
    } else {
      setMessage('Check your email to confirm your Tilet Art Gallery account.');
      event.currentTarget.reset();
    }

    setLoading(false);
  }

  return (
    <form className="form-card auth-card" onSubmit={onSubmit}>
      <div className="auth-card-heading">
        <span className="eyebrow">Create account</span>
        <h1>Join Tilet Art Gallery.</h1>
        <p>Discover Ethiopian art as a buyer, or apply to become an artist after creating your account.</p>
      </div>
      <div className="form-grid auth-form-grid">
        <label className="field-full"><span>Full name</span><input name="fullName" required autoComplete="name" placeholder="Your full name" /></label>
        <label className="field-full"><span>Email</span><input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
        <label className="field-full"><span>Password</span><input name="password" type="password" minLength={8} required autoComplete="new-password" placeholder="At least 8 characters" /></label>
      </div>
      {error && <div className="form-alert form-alert-error">{error}</div>}
      {message && <div className="form-alert form-alert-success">{message}</div>}
      <button className="pill pill-dark pill-full" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
      <p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>
    </form>
  );
}
