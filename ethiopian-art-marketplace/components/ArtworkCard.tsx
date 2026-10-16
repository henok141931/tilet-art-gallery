import Link from 'next/link';
import { ArtworkVisual } from './ArtworkVisual';
import { formatETB, type Artwork } from '@/lib/data';

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <article className="art-card">
      <Link href={`/artwork/${artwork.slug}`} className="art-link" aria-label={`View ${artwork.title}`}>
        <ArtworkVisual tone={artwork.tone} title={artwork.title} />
      </Link>
      <div className="art-card-meta">
        <div>
          <h3><Link href={`/artwork/${artwork.slug}`}>{artwork.title}</Link></h3>
          <p><Link href={`/artists/${artwork.artistSlug}`}>{artwork.artist}</Link></p>
        </div>
        <div className="art-price-block">
          <strong>{formatETB(artwork.price)}</strong>
          <span className={`status status-${artwork.status.toLowerCase()}`}>{artwork.status}</span>
        </div>
      </div>
    </article>
  );
}
