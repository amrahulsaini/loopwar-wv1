'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import CookieConsent from './components/CookieConsent';
import Logo from './components/Logo';

export default function Home() {
  // Check existing session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if user is already logged in and verified
      const sessionToken = getCookie('sessionToken');
      const username = getCookie('username');
      const isUserVerified = getCookie('isVerified') === 'true';
      
      if (sessionToken && username && isUserVerified) {
        // Redirect to zone if already authenticated and verified
        window.location.href = '/zone';
      }
    }
  }, []);

  // Cookie utility functions
  const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  };

  useEffect(() => {
    // Fade-in animation on scroll
    const sections = document.querySelectorAll('.fade-in-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.animationPlayState = 'running';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    sections.forEach(section => {
      // Pause animation initially
      (section as HTMLElement).style.animationPlayState = 'paused';
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header className="main-header">
        <div className="container">
          <Link href="/" className="logo-link" aria-label="LoopWar.dev Home">
            <Logo size={60} showText={false} />
          </Link>
          
          <nav className="main-nav">
            <ul className="nav-links">
              <li><a href="#showcase">Showcase</a></li>
              <li><a href="#meetup">AI Meetup</a></li>
              <li><a href="#community">Community</a></li>
            </ul>
            <div className="nav-actions">
              <Link href="/join" className="btn btn-join">Join the War</Link>
              <Link href="/login" className="btn btn-login">Login</Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <div className="hero-text">
              <span>Welcome to the Arena</span>
              <h1>What is LoopWar?</h1>
              <p>It&apos;s not just a platform; it&apos;s your personal AI coding dojo. We&apos;re redefining learning by combining AI-guidance with gamified challenges to forge career-ready developers. Stop memorizing, start building.</p>
            </div>
            <div className="hero-card">
              <p>&ldquo;LoopWar is an online AI learning platform that helps students learn coding in all languages and build software skills in a fun and personalized way. It&apos;s like having a smart AI tutor that gives you hints, helps fix your code, and guides you through projects. You can also compete in coding battles, making learning feel like a game!&rdquo;</p>
            </div>
          </div>
        </section>

        {/* Languages & Tracks Section */}
        <section id="showcase" className="section">
          <div className="container">
            <h2 className="section-title">Master Your Arsenal</h2>
            <p className="section-subtitle">From foundational syntax to complex system architecture, we provide the tracks you need to conquer the tech world.</p>
            <div className="languages-grid">
              <div className="lang-card">Python</div>
              <div className="lang-card">Java</div>
              <div className="lang-card">C++</div>
              <div className="lang-card">JavaScript</div>
              <div className="lang-card">Data Structures</div>
              <div className="lang-card">Algorithms</div>
              <div className="lang-card">System Design</div>
              <div className="lang-card">Databases (SQL)</div>
              <div className="lang-card">Web Development</div>
              <div className="lang-card">AI / Machine Learning</div>
              <div className="lang-card">DevOps & CI/CD</div>
              <div className="lang-card">PHP</div>
            </div>
          </div>
        </section>
        
        {/* AI Features Section */}
        <section id="meetup" className="section ai-features">
          <div className="container">
            <h2 className="section-title">How LoopAI Sharpens Your Skills</h2>
            <p className="section-subtitle">Our AI is more than a tool—it&apos;s your mentor, sparring partner, and strategist, available 24/7.</p>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">💡</div>
                <h3>Infinite Problem Generation</h3>
                <p>Never run out of practice. LoopAI creates endless, unique problems tailored to any topic and difficulty level, ensuring you truly master the concepts.</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🗺️</div>
                <h3>Personalized Learning Paths</h3>
                <p>No more confusion. Based on your performance, our AI crafts a dynamic roadmap, suggesting what to learn next and identifying your weak spots.</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📈</div>
                <h3>Conversational Feedback</h3>
                <p>Get detailed, human-like reports on your code. LoopAI explains your mistakes, suggests improvements, and helps you understand the &ldquo;why&rdquo; behind the logic.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="community" className="section cta">
          <div className="container">
            <h2 className="section-title">Ready to Join the Battle?</h2>
            <p className="section-subtitle">Your journey from beginner to pro starts here. Sign up for free and start your first challenge today. The arena awaits.</p>
            <Link href="/join" className="cta-btn">Start Learning Now</Link>
          </div>
        </section>
      </main>

      <footer className="main-footer">
        <div className="container">
          <div className="footer-left">
            <p className="copyright">&copy; {new Date().getFullYear()} LoopWar.dev. All Rights Reserved.</p>
          </div>
          <div className="footer-right">
            <ul className="footer-nav">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Cookie Consent */}
      <CookieConsent />
    </>
  );
}
