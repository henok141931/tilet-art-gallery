import { notFound } from 'next/navigation';
import { ArtworkCard } from '@/components/ArtworkCard';
import { artworks, getArtist } from '@/lib/data';

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = getArtist(slug);
  if (!artist) notFound();
  const work = artworks.filter((a) => a.artistSlug === artist.slug);

  return (
    <div className="page shell">
      <section className="artist-profile-hero">
        <div className="artist-avatar artist-avatar-xl">{artist.initials}</div>
        <div className="artist-profile-copy">
          <div className="eyebrow-row"><span>{artist.location}</span>{artist.verified && <span className="verified">Verified artist</span>}</div>
          <h1>{artist.name}</h1>
          <p className="artist-statement">{artist.statement}</p>
          <div className="profile-actions"><button className="pill pill-dark">Follow artist</button><button className="pill pill-light">Share profile</button></div>
        </div>
      </section>
      <section className="profile-about">
        <div><span className="eyebrow">About</span><h2>Artist story.</h2></div>
        <p>{artist.bio}</p>
      </section>
      <section className="section compact-section">
        <div className="section-heading split-heading"><div><span className="eyebrow">Available work</span><h2>Artwork by {artist.name.split(' ')[0]}.</h2></div><span className="muted">{work.length} works</span></div>
        <div className="art-grid">{work.map((a) => <ArtworkCard artwork={a} key={a.slug} />)}</div>
      </section>
    </div>
  );
}
