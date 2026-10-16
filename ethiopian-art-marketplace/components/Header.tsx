import Link from 'next/link';
import { getCurrentUserProfile } from '@/lib/auth';
import { LogoutButton } from '@/components/auth/LogoutButton';

export async function Header() {
  const { user, profile } = await getCurrentUserProfile();
  const role = profile?.role;

  return (
    <header className="site-header-wrap">
      <nav className="site-header shell" aria-label="Main navigation">
        <Link href="/" className="brand">Tilet Art Gallery<span>.</span></Link>
        <div className="nav-links">
          <Link href="/explore">Explore</Link>
          <Link href="/artists/hana-tesfaye">Artists</Link>
          <Link href="/become-an-artist">Become an Artist</Link>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              {role === 'admin' ? <Link href="/admin/dashboard" className="text-link">Admin</Link> : role === 'artist' ? <Link href="/artist/dashboard" className="text-link">Artist Studio</Link> : null}
              <Link href="/account" className="text-link">Account</Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="text-link">Log in</Link>
          )}
          <Link href="/explore" className="pill pill-dark">Explore Art</Link>
        </div>
      </nav>
    </header>
  );
}
