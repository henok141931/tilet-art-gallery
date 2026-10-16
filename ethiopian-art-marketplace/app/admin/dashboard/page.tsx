import Link from 'next/link';
import { DashboardShell } from '@/components/DashboardShell';
import { requireRole } from '@/lib/auth';

export default async function AdminDashboard() {
  const { profile } = await requireRole(['admin'], '/admin/dashboard');
  return <div className="page dashboard-page"><DashboardShell mode="admin" displayName={profile.full_name || 'Admin Console'}>
    <div className="dash-heading"><div><span className="eyebrow">Operations overview</span><h1>Keep the marketplace moving.</h1><p>Prioritize reviews, payment verification, and delivery exceptions.</p></div><span className="mini-label">Tilet Art Gallery</span></div>
    <div className="metric-grid"><div className="metric-card"><span>Artist applications</span><strong>7</strong><small>3 need review</small></div><div className="metric-card"><span>Artwork pending</span><strong>12</strong><small>5 new today</small></div><div className="metric-card"><span>Awaiting payment</span><strong>4</strong><small>2 submitted proof</small></div><div className="metric-card"><span>Active deliveries</span><strong>6</strong><small>1 needs attention</small></div></div>
    <div className="admin-queue">
      <section className="panel"><div className="panel-heading"><div><span className="eyebrow">Priority queue</span><h2>Needs attention</h2></div></div>{[['Payment proof submitted','TAG-2026-00124','Verify payment'],['New artist application','TAG-ART-2026-00087','Review artist'],['Artwork submitted','Golden Thread','Review artwork'],['Delivery issue','TAG-2026-00118','Open order']].map(([title,ref,action]) => <div className="queue-row" key={ref}><div><strong>{title}</strong><span>{ref}</span></div><button className="text-button">{action} ↗</button></div>)}</section>
      <section className="panel quick-links"><span className="eyebrow">Operations</span><h2>Jump to a workflow</h2><Link href="/admin/applications">Artist applications <span>›</span></Link><Link href="/admin/artworks">Artwork review <span>›</span></Link><Link href="/admin/orders">Orders & payments <span>›</span></Link></section>
    </div>
  </DashboardShell></div>
}
