'use client';

import { useMemo, useState } from 'react';

type ExistingApplication = {
  id: string;
  reference: string;
  full_name: string;
  public_name: string;
  email: string;
  phone: string;
  location: string;
  biography: string | null;
  artist_statement: string | null;
  categories: string[];
  mediums: string[];
  years_experience: number | null;
  portfolio_links: string[];
  status: string;
  review_note: string | null;
} | null;

export function ArtistApplicationForm({
  defaultEmail,
  defaultFullName,
  existing
}: {
  defaultEmail: string;
  defaultFullName: string;
  existing: ExistingApplication;
}) {
  const [loading, setLoading] = useState<'draft' | 'submitted' | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentStatus, setCurrentStatus] = useState(existing?.status ?? 'draft');
  const [applicationId, setApplicationId] = useState(existing?.id ?? '');
  const [reference, setReference] = useState(existing?.reference ?? '');
  const locked = useMemo(() => ['submitted', 'under_review', 'approved', 'rejected'].includes(currentStatus), [currentStatus]);

  async function save(formElement: HTMLFormElement, status: 'draft' | 'submitted') {
    if (locked) return;
    setLoading(status);
    setMessage('');
    setError('');

    const form = new FormData(formElement);
    const value = (name: string) => String(form.get(name) || '').trim();
    const payload = {
      applicationId: applicationId || undefined,
      full_name: value('full_name'),
      public_name: value('public_name'),
      email: value('email').toLowerCase(),
      phone: value('phone'),
      location: value('location'),
      biography: value('biography') || null,
      artist_statement: value('artist_statement') || null,
      categories: value('category') ? [value('category')] : [],
      mediums: value('medium') ? [value('medium')] : [],
      years_experience: value('years_experience') ? Number(value('years_experience')) : null,
      portfolio_links: value('portfolio') ? [value('portfolio')] : [],
      status
    };

    if (status === 'submitted' && (!payload.full_name || !payload.public_name || !payload.email || !payload.phone || !payload.location || payload.categories.length === 0 || payload.mediums.length === 0)) {
      setError('Complete the required identity, category, and medium fields before submitting.');
      setLoading(null);
      return;
    }

    const response = await fetch('/api/artist-applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || 'We could not save your application. Please try again.');
    } else {
      if (result.application) {
        setApplicationId(result.application.id);
        setReference(result.application.reference);
      }
      setCurrentStatus(status);
      setMessage(status === 'submitted' ? 'Application submitted. You can track its status from your account.' : 'Draft saved.');
      if (status === 'submitted') window.setTimeout(() => window.location.assign('/account'), 900);
    }
    setLoading(null);
  }

  return (
    <form className="form-card" onSubmit={(event) => { event.preventDefault(); void save(event.currentTarget, 'submitted'); }}>
      {(existing || applicationId) && <div className="application-status-bar"><div><span className="mini-label">Application {reference || existing?.reference}</span><strong>{currentStatus.replaceAll('_', ' ')}</strong></div>{existing.review_note && <p>{existing.review_note}</p>}</div>}
      <fieldset disabled={locked} className="plain-fieldset">
        <div className="form-grid">
          <label><span>Full name *</span><input name="full_name" required defaultValue={existing?.full_name ?? defaultFullName} placeholder="Full name" /></label>
          <label><span>Artist / public name *</span><input name="public_name" required defaultValue={existing?.public_name ?? ''} placeholder="Name shown publicly" /></label>
          <label><span>Email *</span><input name="email" type="email" required defaultValue={existing?.email ?? defaultEmail} placeholder="you@example.com" /></label>
          <label><span>Phone *</span><input name="phone" required defaultValue={existing?.phone ?? ''} placeholder="+251…" /></label>
          <label className="field-full"><span>Location *</span><input name="location" required defaultValue={existing?.location ?? ''} placeholder="City, Ethiopia" /></label>
          <label className="field-full"><span>Biography</span><textarea name="biography" rows={4} defaultValue={existing?.biography ?? ''} placeholder="Tell us about your background and practice" /></label>
          <label className="field-full"><span>Artist statement</span><textarea name="artist_statement" rows={4} defaultValue={existing?.artist_statement ?? ''} placeholder="What ideas guide your work?" /></label>
          <label><span>Main category *</span><select name="category" required defaultValue={existing?.categories?.[0] ?? ''}><option value="" disabled>Select category</option><option>Painting</option><option>Photography</option><option>Sculpture</option><option>Traditional Art</option><option>Contemporary Art</option><option>Mixed Media</option></select></label>
          <label><span>Main medium *</span><input name="medium" required defaultValue={existing?.mediums?.[0] ?? ''} placeholder="Oil on canvas" /></label>
          <label><span>Years of experience</span><input name="years_experience" type="number" min="0" defaultValue={existing?.years_experience ?? ''} placeholder="5" /></label>
          <label><span>Portfolio / social link</span><input name="portfolio" type="url" defaultValue={existing?.portfolio_links?.[0] ?? ''} placeholder="https://…" /></label>
        </div>
      </fieldset>
      {error && <div className="form-alert form-alert-error">{error}</div>}
      {message && <div className="form-alert form-alert-success">{message}</div>}
      {locked ? <div className="form-alert form-alert-success">This application is currently {currentStatus.replaceAll('_', ' ')}. We will show the next action here when its status changes.</div> : <div className="form-actions"><button type="button" className="pill pill-light" disabled={!!loading} onClick={(event) => { const form = event.currentTarget.form; if (form) void save(form, 'draft'); }}>{loading === 'draft' ? 'Saving…' : 'Save draft'}</button><button type="submit" className="pill pill-dark" disabled={!!loading}>{loading === 'submitted' ? 'Submitting…' : currentStatus === 'changes_required' ? 'Resubmit application ↗' : 'Submit application ↗'}</button></div>}
    </form>
  );
}
