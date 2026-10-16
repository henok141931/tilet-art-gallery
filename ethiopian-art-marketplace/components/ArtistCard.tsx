import Link from 'next/link';
import type { Artist } from '@/lib/data';

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <article className="artist-card">
      <div className="artist-avatar">{artist.initials}</div>
      <div className="artist-card-copy">
        <div className="eyebrow-row"><span>{artist.location}</span>{artist.verified && <span className="verified">Verified</span>}</div>
        <h3>{artist.name}</h3>
        <p>{artist.statement}</p>
        <Link href={`/artists/${artist.slug}`} className="inline-action">View artist <span>↗</span></Link>
      </div>
    </article>
  );
}
