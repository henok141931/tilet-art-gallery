import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { getCurrentUserProfile } from '@/lib/auth';

export default async function LoginPage() {
  const { user } = await getCurrentUserProfile();
  if (user) redirect('/account');

  return (
    <div className="page shell auth-page">
      <Suspense fallback={<div className="form-card auth-card">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
