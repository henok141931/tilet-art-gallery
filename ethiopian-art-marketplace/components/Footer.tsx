import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <div className="brand footer-brand">Tilet Art Gallery<span>.</span></div>
          <p>A trusted digital home for Ethiopian art — connecting collectors with original work and the artists behind it.</p>
        </div>
        <div><strong>Discover</strong><Link href="/explore">Explore artwork</Link><Link href="/artists/hana-tesfaye">Artists</Link><Link href="/become-an-artist">Become an artist</Link></div>
        <div><strong>Account</strong><Link href="/login">Log in</Link><Link href="/signup">Create account</Link><Link href="/account">Your account</Link></div>
      </div>
      <div className="shell footer-bottom">© 2026 Tilet Art Gallery. Original Ethiopian art, thoughtfully presented.</div>
    </footer>
  );
}
