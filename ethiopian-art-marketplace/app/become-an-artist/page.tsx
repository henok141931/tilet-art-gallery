import Link from 'next/link';
import { ArtistApplicationForm } from '@/components/ArtistApplicationForm';
import { getCurrentUserProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function BecomeArtistPage() {
  const { user, profile } = await getCurrentUserProfile();
  const supabase = user ? await createClient() : null;
  const { data: application } = user && supabase
    ? await supabase.from('artist_applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null };

  return (
    <div className="page shell">
      <section className="application-hero">
        <span className="eyebrow">Become an artist</span>
        <h1>Share your art with people who appreciate it.</h1>
        <p>Apply to join a curated marketplace built to present Ethiopian artists professionally and make selling clear, transparent, and human.</p>
      </section>
      <section className="steps-grid">
        {[
          ['01', 'Apply', 'Tell us about you, your practice, mediums, experience, and portfolio.'],
          ['02', 'Get reviewed', 'Tilet Art Gallery reviews artistic relevance, profile quality, and verification information where needed.'],
          ['03', 'Build your profile', 'Once approved, create your public artist story and complete your profile.'],
          ['04', 'Publish artwork', 'Add artwork, tell its story, set a price, and submit it for review.']
        ].map(([n, title, text]) => <div className="step-card" key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></div>)}
      </section>
      <section className="application-layout">
        <div className="application-copy"><span className="eyebrow">Application</span><h2>Start with the essentials.</h2><p>Artwork details are collected after approval so onboarding stays focused. Drafts can be saved before submission.</p></div>
        {!user ? (
          <div className="form-card application-login-card"><span className="eyebrow">Account required</span><h2>Create an account before applying.</h2><p>This lets you save your application and track review status without filling the form again.</p><div className="hero-actions"><Link href="/signup" className="pill pill-dark">Create account</Link><Link href="/login?next=/become-an-artist" className="pill pill-light">Log in</Link></div></div>
        ) : profile?.role === 'artist' || profile?.role === 'admin' ? (
          <div className="form-card application-login-card"><span className="eyebrow">Approved artist</span><h2>Your artist access is active.</h2><p>You no longer need to submit an artist application.</p><Link href="/artist/dashboard" className="pill pill-dark">Open Artist Studio</Link></div>
        ) : (
          <ArtistApplicationForm defaultEmail={user.email ?? ''} defaultFullName={profile?.full_name ?? user.user_metadata?.full_name ?? ''} existing={application as never} />
        )}
      </section>
    </div>
  );
}
