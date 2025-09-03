'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CookieConsent from './components/CookieConsent';
import ThemeSwitcher from './components/ThemeSwitcher';
import Logo from './components/Logo';

export default function Home() {
  const [isPlusMenuActive, setIsPlusMenuActive] = useState(false);
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

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

  const togglePlusMenu = () => {
    setIsPlusMenuActive(!isPlusMenuActive);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuActive(!isMobileMenuActive);
    // Close the plus menu when mobile menu opens
    if (!isMobileMenuActive) {
      setIsPlusMenuActive(false);
    }
  };

  // Close mobile menu when clicking on a link
  const closeMobileMenu = () => {
    setIsMobileMenuActive(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.plus-button-container')) {
        setIsPlusMenuActive(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <header className="main-header">
        <div className="container">
          <Link href="/" className="logo-link" aria-label="LoopWar.dev Home">
            <Logo size={60} showText={false} />
          </Link>
          
          <nav className="main-nav">
            <ul className={`nav-links ${isMobileMenuActive ? 'active' : ''}`}>
              <li><a href="#showcase" onClick={closeMobileMenu}>Showcase</a></li>
              <li><a href="#meetup" onClick={closeMobileMenu}>AI Meetup</a></li>
              <li><a href="#community" onClick={closeMobileMenu}>Community</a></li>
            </ul>
            <div className="nav-actions">
              <ThemeSwitcher className="theme-toggle hover-lift icon" />
              <div 
                className={`plus-button-container ${isPlusMenuActive ? 'active' : ''}`}
              >
                <button 
                  className="plus-button hover-lift glow" 
                  onClick={togglePlusMenu}
                  aria-label="Open menu"
                >
                  +
                </button>
                <div className="dropdown-menu scale-in">
                  <a href="/join" className="dropdown-btn btn-join hover-lift-small gradient-animate">Join the War</a>
                  <a href="/login" className="dropdown-btn btn-login hover-lift-small">Login</a>
                </div>
              </div>
            </div>
             <button 
              className="hamburger" 
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              &#9776;
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero fade-in-section">
          <div className="container">
            <div className="hero-text stagger-children">
              <span className="fade-in-up">Welcome to the Arena</span>
              <h1 className="fade-in-up typewriter">What is LoopWar?</h1>
              <p className="fade-in-up">It&apos;s not just a platform; it&apos;s your personal AI coding dojo. We&apos;re redefining learning by combining AI-guidance with gamified challenges to forge career-ready developers. Stop memorizing, start building.</p>
            </div>
            <div className="hero-card card-hover float">
              <p>&ldquo;LoopWar is an online AI learning platform that helps students learn coding in all languages and build software skills in a fun and personalized way. It&apos;s like having a smart AI tutor that gives you hints, helps fix your code, and guides you through projects. You can also compete in coding battles, making learning feel like a game!&rdquo;</p>
            </div>
          </div>
        </section>

        {/* Languages & Tracks Section */}
        <section id="showcase" className="section fade-in-section">
          <div className="container">
            <h2 className="section-title scale-in">Master Your Arsenal</h2>
            <p className="section-subtitle fade-in-up">From foundational syntax to complex system architecture, we provide the tracks you need to conquer the tech world.</p>
            <div className="languages-grid stagger-children">
              <div className="lang-card card-hover hover-lift">Python</div>
              <div className="lang-card card-hover hover-lift">Java</div>
              <div className="lang-card card-hover hover-lift">C++</div>
              <div className="lang-card card-hover hover-lift">JavaScript</div>
              <div className="lang-card card-hover hover-lift">Data Structures</div>
              <div className="lang-card card-hover hover-lift">Algorithms</div>
              <div className="lang-card card-hover hover-lift">System Design</div>
              <div className="lang-card card-hover hover-lift">Databases (SQL)</div>
              <div className="lang-card card-hover hover-lift">Web Development</div>
              <div className="lang-card card-hover hover-lift">AI / Machine Learning</div>
              <div className="lang-card card-hover hover-lift">DevOps & CI/CD</div>
              <div className="lang-card">PHP</div>
            </div>
          </div>
        </section>
        
        {/* AI Features Section */}
        <section id="meetup" className="section ai-features fade-in-section">
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
        <section id="community" className="section cta fade-in-section">
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
              <li><a href="/about">About</a></li>
              <li><a href="/privacy">Privacy</a></li>
              <li><a href="/terms">Terms</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Cookie Consent */}
      <CookieConsent />
    </>
  );
}
