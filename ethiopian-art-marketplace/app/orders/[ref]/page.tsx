import { ArtworkVisual } from '@/components/ArtworkVisual';
import { StatusTimeline } from '@/components/StatusTimeline';

export default async function OrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return (
    <section className="page shell narrow-page">
      <div className="order-header"><div><span className="eyebrow">Order status</span><h1>Order #{ref}</h1><p>Everything important about your purchase, payment, preparation, and delivery is kept here.</p></div><span className="status status-reserved">Artwork being prepared</span></div>
      <div className="order-page-grid">
        <div className="order-main">
          <div className="panel"><h2>Where your order is now</h2><StatusTimeline activeIndex={3}/></div>
          <div className="panel payment-panel"><div><span className="eyebrow">Payment</span><h2>Payment confirmed</h2><p>Your payment has been verified. The artist is now preparing your artwork.</p></div><span className="confirmation-badge">✓ Confirmed</span></div>
        </div>
        <aside className="order-side panel"><ArtworkVisual tone="sunrise" title="Addis Morning"/><div><span>Artwork</span><strong>Addis Morning</strong></div><div><span>Artist</span><strong>Hana Tesfaye</strong></div><div><span>Price</span><strong>30,000 ETB</strong></div><div><span>Delivery</span><strong>Addis Ababa</strong></div></aside>
      </div>
    </section>
  );
}
