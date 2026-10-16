import { ArtworkCard } from '@/components/ArtworkCard';
import { artworks } from '@/lib/data';

export default function ExplorePage() {
  return (
    <section className="page shell">
      <div className="page-intro">
        <span className="eyebrow">Explore original artwork</span>
        <h1>Find something you want to keep looking at.</h1>
        <p>Browse original physical artwork from Ethiopian artists. Search and filters are represented in this MVP interface and are ready to connect to live data.</p>
      </div>
      <div className="explore-tools">
        <label className="search-box"><span>⌕</span><input aria-label="Search artwork" placeholder="Search artwork, artist, category…" /></label>
        <button className="filter-pill">Category <span>⌄</span></button>
        <button className="filter-pill">Price <span>⌄</span></button>
        <button className="filter-pill">Medium <span>⌄</span></button>
        <button className="filter-pill">Availability <span>⌄</span></button>
      </div>
      <div className="results-row"><span>Showing {artworks.length} original works</span><button className="sort-button">Recently added ⌄</button></div>
      <div className="art-grid explore-grid">{artworks.map((art) => <ArtworkCard artwork={art} key={art.slug} />)}</div>
    </section>
  );
}
