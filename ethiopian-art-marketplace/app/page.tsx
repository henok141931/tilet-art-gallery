import Link from 'next/link';
import { ArtworkCard } from '@/components/ArtworkCard';
import { ArtistCard } from '@/components/ArtistCard';
import { artworks, artists } from '@/lib/data';

export default function HomePage() {
  return (
    <>
      <section className="hero shell">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Original work. Real artists. Ethiopian stories.</span>
            <h1>Discover art that carries a story.</h1>
            <p>Meet Ethiopian artists, understand the work behind each piece, and purchase original artwork through a transparent, human process.</p>
            <div className="hero-actions">
              <Link className="pill pill-dark" href="/explore">Explore artwork <span>↗</span></Link>
              <Link className="pill pill-light" href="/artists/hana-tesfaye">Meet the artists</Link>
            </div>
            <div className="trust-strip">
              <span>Verified artists</span><span>Original artwork</span><span>Clear order status</span>
            </div>
          </div>
          <div className="hero-gallery" aria-label="Featured art composition">
            <div className="hero-art hero-art-main"><span className="hero-brush a"/><span className="hero-brush b"/><span className="hero-brush c"/></div>
            <div className="hero-art hero-art-small"><span className="hero-brush d"/><span className="hero-brush e"/></div>
            <div className="hero-floating-card">
              <span className="mini-label">Featured work</span>
              <strong>Addis Morning</strong>
              <span>Hana Tesfaye · 30,000 ETB</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading">
          <div><span className="eyebrow">Curated now</span><h2>Artwork worth slowing down for.</h2></div>
          <Link href="/explore" className="inline-action">Explore all artwork <span>↗</span></Link>
        </div>
        <div className="art-grid">{artworks.slice(0, 3).map((art) => <ArtworkCard artwork={art} key={art.slug} />)}</div>
      </section>

      <section className="section shell category-band">
        <div className="section-heading center-heading">
          <span className="eyebrow">Explore your way</span>
          <h2>Start with what catches your eye.</h2>
        </div>
        <div className="category-grid">
          {['Painting', 'Portraits', 'Mixed Media', 'Contemporary', 'Traditional Art', 'Photography'].map((category, i) => (
            <Link href={`/explore?category=${encodeURIComponent(category)}`} className={`category-card cat-${i + 1}`} key={category}><span>{category}</span><b>↗</b></Link>
          ))}
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading split-heading">
          <div><span className="eyebrow">Meet the people</span><h2>The artist is part of the artwork.</h2></div>
          <p className="section-side-copy">This marketplace is designed to make the person, process, and story behind each piece visible—not anonymous.</p>
        </div>
        <div className="artist-grid">{artists.map((artist) => <ArtistCard artist={artist} key={artist.slug} />)}</div>
      </section>

      <section className="section shell story-block">
        <div className="story-copy">
          <span className="eyebrow">Stories behind the art</span>
          <h2>More than an object on a wall.</h2>
          <p>Every work can hold a memory, place, idea, or question. We give artists room to explain what inspired the piece, how it was made, and why it matters.</p>
          <Link href="/artwork/addis-morning" className="pill pill-dark">Read an artwork story <span>↗</span></Link>
        </div>
        <div className="story-quote">
          <span>“</span>
          <blockquote>I am discovering a real artist, understanding their work, and purchasing something meaningful.</blockquote>
        </div>
      </section>

      <section className="section shell artist-cta">
        <div>
          <span className="eyebrow">For Ethiopian artists</span>
          <h2>Your work deserves a thoughtful digital home.</h2>
          <p>Apply, build your profile, publish original work, and let collectors discover the story behind what you create.</p>
        </div>
        <Link href="/become-an-artist" className="pill pill-dark">Become an artist <span>↗</span></Link>
      </section>
    </>
  );
}
