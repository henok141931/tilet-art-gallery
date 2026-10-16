import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type ApplicationPayload = {
  applicationId?: string;
  full_name?: string;
  public_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  biography?: string | null;
  artist_statement?: string | null;
  categories?: string[];
  mediums?: string[];
  years_experience?: number | null;
  portfolio_links?: string[];
  status?: 'draft' | 'submitted';
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'You need to log in again before saving your application.' }, { status: 401 });
  }

  let body: ApplicationPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid application data.' }, { status: 400 });
  }

  const status = body.status === 'submitted' ? 'submitted' : 'draft';
  const payload = {
    // Never trust a user id supplied by the browser. Derive ownership from the
    // authenticated Supabase session on the server.
    user_id: user.id,
    full_name: String(body.full_name ?? '').trim(),
    public_name: String(body.public_name ?? '').trim(),
    email: String(body.email ?? user.email ?? '').trim().toLowerCase(),
    phone: String(body.phone ?? '').trim(),
    location: String(body.location ?? '').trim(),
    biography: body.biography ? String(body.biography).trim() : null,
    artist_statement: body.artist_statement ? String(body.artist_statement).trim() : null,
    categories: Array.isArray(body.categories) ? body.categories.filter(Boolean) : [],
    mediums: Array.isArray(body.mediums) ? body.mediums.filter(Boolean) : [],
    years_experience:
      typeof body.years_experience === 'number' && Number.isFinite(body.years_experience)
        ? body.years_experience
        : null,
    portfolio_links: Array.isArray(body.portfolio_links) ? body.portfolio_links.filter(Boolean) : [],
    status
  };

  if (
    status === 'submitted' &&
    (!payload.full_name ||
      !payload.public_name ||
      !payload.email ||
      !payload.phone ||
      !payload.location ||
      payload.categories.length === 0 ||
      payload.mediums.length === 0)
  ) {
    return NextResponse.json(
      { error: 'Complete the required identity, category, and medium fields before submitting.' },
      { status: 400 }
    );
  }

  if (body.applicationId) {
    // The user_id filter is intentional. It makes the endpoint safe even before
    // PostgreSQL RLS is evaluated, and RLS remains the final database guard.
    const { data, error } = await supabase
      .from('artist_applications')
      .update(payload)
      .eq('id', body.applicationId)
      .eq('user_id', user.id)
      .select('id, reference, status')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ application: data });
  }

  const { data, error } = await supabase
    .from('artist_applications')
    .insert(payload)
    .select('id, reference, status')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ application: data }, { status: 201 });
}
