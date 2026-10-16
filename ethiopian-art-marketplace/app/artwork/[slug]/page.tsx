import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArtworkVisual } from '@/components/ArtworkVisual';
import { ArtworkCard } from '@/components/ArtworkCard';
import { artworks, formatETB, getArtwork } from '@/lib/data';

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artwork = getArtwork(slug);
  if (!artwork) notFound();
  const more = artworks.filter((a) => a.artistSlug === artwork.artistSlug && a.slug !== artwork.slug).slice(0, 2);

  return (
    <div className="page shell">
      <div className="art-detail">
        <div className="art-detail-visual"><ArtworkVisual tone={artwork.tone} title={artwork.title} large /></div>
        <aside className="art-detail-info">
          <div className="eyebrow-row"><span>{artwork.category}</span><span className={`status status-${artwork.status.toLowerCase()}`}>{artwork.status}</span></div>
          <h1>{artwork.title}</h1>
          <Link href={`/artists/${artwork.artistSlug}`} className="artist-byline">by {artwork.artist} <span className="verified">Verified artist</span></Link>
          <div className="detail-price">{formatETB(artwork.price)}</div>
          <div className="detail-specs">
            <div><span>Medium</span><strong>{artwork.medium}</strong></div>
            <div><span>Dimensions</span><strong>{artwork.dimensions}</strong></div>
            <div><span>Year</span><strong>{artwork.year}</strong></div>
          </div>
          <div className="trust-panel">
            <span>✓ Original artwork</span><span>✓ Artist verified</span><span>✓ Delivery coordinated</span>
          </div>
          {artwork.status === 'Available' ? (
            <Link href={`/artwork/${artwork.slug}/purchase`} className="pill pill-dark pill-full">Request to purchase <span>↗</span></Link>
          ) : <button className="pill pill-disabled pill-full" disabled>{artwork.status === 'Sold' ? 'Sold' : 'Currently reserved'}</button>}
          <p className="helper">Requesting to purchase does not charge you. We’ll create an order and provide manual payment instructions.</p>
        </aside>
      </div>

      <section className="detail-story">
        <div><span className="eyebrow">The story</span><h2>Behind the artwork.</h2></div>
        <p>{artwork.story}</p>
      </section>

      <section className="artist-mini">
        <div className="artist-avatar">{artwork.artist.split(' ').map((n) => n[0]).join('')}</div>
        <div><span className="eyebrow">The artist</span><h3>{artwork.artist}</h3><p>Explore the artist’s profile, statement, and other available work.</p></div>
        <Link href={`/artists/${artwork.artistSlug}`} className="pill pill-light">View artist</Link>
      </section>

      {more.length > 0 && <section className="section compact-section"><div className="section-heading"><span className="eyebrow">More from this artist</span><h2>Continue exploring.</h2></div><div className="art-grid two-col">{more.map((a) => <ArtworkCard artwork={a} key={a.slug}/>)}</div></section>}
    </div>
  );
}
