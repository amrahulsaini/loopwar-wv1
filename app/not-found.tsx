'use client';

import Link from 'next/link';
import Logo from './components/Logo';

export default function NotFoundPage() {
  return (
    <>
      <header className="main-header">
        <div className="container">
          <Link href="/" className="logo-link" aria-label="LoopWar.dev Home">
            <Logo size={60} showText={false} />
          </Link>
          
          <nav className="main-nav">
            <ul className="nav-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
            <div className="nav-actions">
              <div className="auth-buttons">
                <Link href="/join" className="btn btn-join">Join the War</Link>
                <Link href="/login" className="btn btn-login">Login</Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="page-content">
        <section className="hero-page">
          <div className="container">
            <h1 className="page-title">404 - Page Not Found</h1>
            <p className="page-subtitle">The page you&apos;re looking for doesn&apos;t exist</p>
          </div>
        </section>

        <section className="content-section">
          <div className="container">
            <div className="not-found-content">
              <h2>Oops! This page seems to have vanished into the code void.</h2>
              <p>The page you&apos;re looking for might have been moved, deleted, or perhaps never existed at all. But don&apos;t worry – there&apos;s plenty more to explore!</p>
              
              <div className="cta-buttons" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/" className="btn btn-primary">
                  🏠 Back to Home
                </Link>
                <Link href="/join" className="btn btn-primary">
                  🚀 Join LoopWar
                </Link>
                <Link href="/about" className="btn btn-secondary">
                  📖 Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <div className="container">
          <div className="footer-left">
            <p className="copyright">© 2025 LoopWar.dev. All rights reserved.</p>
          </div>
          <div className="footer-right">
            <nav className="footer-nav">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
