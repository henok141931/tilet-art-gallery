import Link from 'next/link';

export function DashboardShell({ mode, children, displayName }: { mode: 'artist' | 'admin'; children: React.ReactNode; displayName?: string }) {
  const artistLinks = [['Overview','/artist/dashboard'],['Artwork','/artist/artworks/new'],['Orders','/account'],['Sales','#'],['Earnings','#'],['Profile','/account']];
  const adminLinks = [['Overview','/admin/dashboard'],['Applications','/admin/applications'],['Artwork review','/admin/artworks'],['Orders & payments','/admin/orders'],['Artists','#'],['Settings','#']];
  const links = mode === 'artist' ? artistLinks : adminLinks;
  return (
    <div className="dashboard-shell shell">
      <aside className="dashboard-sidebar">
        <div><span className="mini-label">{mode === 'artist' ? 'Artist Studio' : 'Operations'}</span><h2>{displayName || (mode === 'artist' ? 'Artist' : 'Admin Console')}</h2></div>
        <nav>{links.map(([label, href], i) => <Link className={i === 0 ? 'active' : ''} href={href} key={label}>{label}<span>›</span></Link>)}</nav>
        <div className="sidebar-note"><strong>Phase 2</strong><span>Authentication is live. Dashboard records are still sample data until the next database wiring step.</span></div>
      </aside>
      <section className="dashboard-content">{children}</section>
    </div>
  );
}
