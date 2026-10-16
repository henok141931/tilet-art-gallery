import Link from 'next/link';
import { DashboardShell } from '@/components/DashboardShell';
import { ArtworkCard } from '@/components/ArtworkCard';
import { artworks } from '@/lib/data';
import { requireRole } from '@/lib/auth';

export default async function ArtistDashboard() {
  const { profile } = await requireRole(['artist', 'admin'], '/artist/dashboard');
  const name = profile.full_name || 'Artist';
  return (
    <div className="page dashboard-page"><DashboardShell mode="artist" displayName={name}>
      <div className="dash-heading"><div><span className="eyebrow">Overview</span><h1>Welcome, {name}.</h1><p>Here’s what is happening with your work.</p></div><Link href="/artist/artworks/new" className="pill pill-dark">+ Add artwork</Link></div>
      <div className="metric-grid"><div className="metric-card"><span>Your artwork</span><strong>12</strong><small>All uploaded works</small></div><div className="metric-card"><span>Available</span><strong>9</strong><small>Live and purchasable</small></div><div className="metric-card"><span>Sold</span><strong>3</strong><small>Completed sales</small></div><div className="metric-card"><span>Total sales</span><strong>85,000 <em>ETB</em></strong><small>Before commission</small></div></div>
      <div className="panel dashboard-panel"><div className="panel-heading"><div><span className="eyebrow">Next step</span><h2>Prepare Addis Morning</h2></div><span className="status status-reserved">Payment confirmed</span></div><p>A buyer’s payment has been verified. Prepare, package, and mark the artwork ready for delivery.</p><button className="pill pill-dark">Mark ready for delivery</button></div>
      <div className="dash-section-heading"><div><span className="eyebrow">Your artwork</span><h2>Recently updated.</h2></div><Link href="/artist/artworks/new" className="inline-action">Manage artwork ↗</Link></div>
      <div className="art-grid two-col">{artworks.slice(0,2).map((art) => <ArtworkCard artwork={art} key={art.slug}/>)}</div>
    </DashboardShell></div>
  );
}
