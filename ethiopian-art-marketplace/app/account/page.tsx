import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const { user, profile } = await requireUser('/account');
  const params = await searchParams;
  const supabase = await createClient();

  const { data: application } = await supabase
    .from('artist_applications')
    .select('reference, status, review_note, submitted_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const role = profile?.role ?? 'buyer';
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Collector';

  return (
    <div className="page shell account-page">
      <div className="account-hero">
        <div><span className="eyebrow">Your account</span><h1>Welcome, {displayName}.</h1><p>{user.email}</p></div>
        <span className="account-role">{role}</span>
      </div>

      {params.notice === 'permission' && <div className="form-alert form-alert-error account-notice">Your account does not have permission to open that workspace yet.</div>}

      <div className="account-grid">
        <section className="panel account-panel">
          <span className="eyebrow">Marketplace</span>
          <h2>Continue discovering.</h2>
          <p>Explore original Ethiopian artwork and keep your purchase journey connected to this account.</p>
          <Link href="/explore" className="pill pill-dark">Explore artwork</Link>
        </section>

        {role === 'admin' ? (
          <section className="panel account-panel"><span className="eyebrow">Administrator</span><h2>Marketplace operations.</h2><p>Review artists and artwork, verify payments, and coordinate orders.</p><Link href="/admin/dashboard" className="pill pill-dark">Open admin dashboard</Link></section>
        ) : role === 'artist' ? (
          <section className="panel account-panel"><span className="eyebrow">Artist</span><h2>Your artist studio.</h2><p>Manage artwork, sales, preparation, and your public artist presence.</p><Link href="/artist/dashboard" className="pill pill-dark">Open Artist Studio</Link></section>
        ) : (
          <section className="panel account-panel"><span className="eyebrow">Become an artist</span><h2>{application ? 'Your application' : 'Share your work.'}</h2>{application ? <><p>Application <strong>{application.reference}</strong> is currently <strong>{String(application.status).replaceAll('_', ' ')}</strong>.</p>{application.review_note && <p>Review note: {application.review_note}</p>}<Link href="/become-an-artist" className="pill pill-light">View application</Link></> : <><p>Apply to join Tilet Art Gallery and build a public artist profile after approval.</p><Link href="/become-an-artist" className="pill pill-dark">Apply to become an artist</Link></>}</section>
        )}
      </div>

      <div className="account-signout"><LogoutButton className="pill pill-light" /></div>
    </div>
  );
}
