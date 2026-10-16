import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type UserRole = 'buyer' | 'artist' | 'admin';

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone, location, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  return { user, profile };
}

export async function requireUser(next = '/account') {
  const current = await getCurrentUserProfile();
  if (!current.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return current as { user: NonNullable<typeof current.user>; profile: NonNullable<typeof current.profile> | null };
}

export async function requireRole(roles: UserRole[], next: string) {
  const current = await requireUser(next);
  if (!current.profile || !roles.includes(current.profile.role as UserRole)) {
    redirect('/account?notice=permission');
  }
  return current as typeof current & { profile: NonNullable<typeof current.profile> };
}
