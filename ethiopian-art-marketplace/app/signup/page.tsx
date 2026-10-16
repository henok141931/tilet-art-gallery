import { redirect } from 'next/navigation';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { getCurrentUserProfile } from '@/lib/auth';

export default async function SignUpPage() {
  const { user } = await getCurrentUserProfile();
  if (user) redirect('/account');

  return <div className="page shell auth-page"><SignUpForm /></div>;
}
