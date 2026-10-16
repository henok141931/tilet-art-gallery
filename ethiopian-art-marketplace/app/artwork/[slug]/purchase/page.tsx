import { notFound } from 'next/navigation';
import { ArtworkVisual } from '@/components/ArtworkVisual';
import { formatETB, getArtwork } from '@/lib/data';

export default async function PurchasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artwork = getArtwork(slug);
  if (!artwork) notFound();

  return (
    <section className="page shell narrow-page">
      <div className="page-intro small-intro">
        <span className="eyebrow">Purchase request</span>
        <h1>Request {artwork.title}.</h1>
        <p>Tell us how to contact you and where the artwork would be delivered. You are not paying at this step.</p>
      </div>
      <div className="purchase-layout">
        <form className="form-card">
          <div className="form-grid">
            <label><span>Full name</span><input placeholder="Your full name" /></label>
            <label><span>Phone number</span><input placeholder="+251…" /></label>
            <label><span>Email</span><input type="email" placeholder="you@example.com" /></label>
            <label><span>Delivery location</span><input placeholder="Addis Ababa, area…" /></label>
            <label className="field-full"><span>Optional message</span><textarea rows={5} placeholder="Anything we should know?" /></label>
          </div>
          <div className="form-divider" />
          <div className="form-confirm"><input id="confirm" type="checkbox" /><label htmlFor="confirm">I understand this is a purchase request and payment will be confirmed separately.</label></div>
          <button type="button" className="pill pill-dark pill-full">Submit purchase request <span>↗</span></button>
        </form>
        <aside className="order-summary">
          <ArtworkVisual tone={artwork.tone} title={artwork.title} />
          <div><span>Artwork</span><strong>{artwork.title}</strong></div>
          <div><span>Artist</span><strong>{artwork.artist}</strong></div>
          <div><span>Price</span><strong>{formatETB(artwork.price)}</strong></div>
          <div><span>Delivery</span><strong>Confirmed separately</strong></div>
        </aside>
      </div>
    </section>
  );
}
