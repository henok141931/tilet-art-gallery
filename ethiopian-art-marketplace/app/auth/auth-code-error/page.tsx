import Link from 'next/link';

export default function AuthCodeErrorPage() {
  return (
    <div className="page shell auth-page">
      <div className="form-card auth-card auth-message-card">
        <span className="eyebrow">Authentication</span>
        <h1>That confirmation link did not work.</h1>
        <p>It may have expired or already been used. Try logging in, or create the account again if needed.</p>
        <div className="hero-actions"><Link className="pill pill-dark" href="/login">Log in</Link><Link className="pill pill-light" href="/signup">Create account</Link></div>
      </div>
    </div>
  );
}
