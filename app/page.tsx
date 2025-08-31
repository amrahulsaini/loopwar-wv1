'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPlusMenuActive, setIsPlusMenuActive] = useState(false);
  const [isMobileMenuActive, setIsMobileMenuActive] = useState(false);

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

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

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

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

  // Add hover event handlers for better dropdown behavior
  const handlePlusButtonMouseEnter = () => {
    setIsPlusMenuActive(true);
  };

  const handlePlusButtonMouseLeave = () => {
    // Don't close immediately, let the dropdown handle its own hover
  };

  const handleDropdownMouseEnter = () => {
    setIsPlusMenuActive(true);
  };

  const handleDropdownMouseLeave = () => {
    // Small delay to allow moving cursor back to button
    setTimeout(() => {
      if (!document.querySelector('.plus-button-container:hover')) {
        setIsPlusMenuActive(false);
      }
    }, 150);
  };

  const handleContainerMouseLeave = () => {
    // Close dropdown when leaving the entire container
    setTimeout(() => {
      setIsPlusMenuActive(false);
    }, 100);
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
          <Link href="/" className="logo" aria-label="LoopWar.dev Home">L</Link>
          
          <nav className="main-nav">
            <ul className={`nav-links ${isMobileMenuActive ? 'active' : ''}`}>
              <li><a href="#showcase" onClick={closeMobileMenu}>Showcase</a></li>
              <li><a href="#meetup" onClick={closeMobileMenu}>AI Meetup</a></li>
              <li><a href="#community" onClick={closeMobileMenu}>Community</a></li>
            </ul>
            <div className="nav-actions">
              <button 
                className="theme-switcher" 
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <div 
                className={`plus-button-container ${isPlusMenuActive ? 'active' : ''}`}
                onMouseLeave={handleContainerMouseLeave}
              >
                <button 
                  className="plus-button" 
                  onClick={togglePlusMenu}
                  onMouseEnter={handlePlusButtonMouseEnter}
                  onMouseLeave={handlePlusButtonMouseLeave}
                  aria-label="Open menu"
                >
                  +
                </button>
                <div 
                  className="dropdown-menu"
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                >
                  <a href="/join" className="dropdown-btn btn-join">Join the War</a>
                  <a href="/login" className="dropdown-btn btn-login">Login</a>
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
        <section id="showcase" className="section fade-in-section">
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
    </>
  );
}
