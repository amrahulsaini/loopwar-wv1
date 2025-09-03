'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import Logo from '../components/Logo';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="main-header">
        <div className="container">
          <Logo />
          <div className="nav-actions">
            <Link href="/" className="home-btn" title="Home">
              <Home size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="join-main">
        <div className="container">
          <div className="page-content-wrapper">
            <div className="page-header">
              <h1 className="page-title">About LoopWar</h1>
              <p className="page-subtitle">Your personal AI coding dojo where legends are forged</p>
            </div>

            <div className="content-grid">
              <div className="content-main">
                <div className="content-section">
                  <h2>What is LoopWar?</h2>
                  <p>LoopWar is not just another coding platform—it&apos;s a revolutionary AI-powered learning ecosystem designed to transform how developers master their craft. We combine cutting-edge artificial intelligence with gamified learning experiences to create the ultimate coding education platform.</p>
                </div>

                <div className="content-section">
                  <h3>Our Mission</h3>
                  <p>To democratize coding education by providing personalized, AI-driven learning experiences that adapt to each student&apos;s unique learning style, pace, and goals. We believe that everyone deserves access to world-class programming education, regardless of their background or experience level.</p>
                </div>

                <div className="content-section">
                  <h3>Why LoopWar?</h3>
                  <div className="feature-grid">
                    <div className="feature-card">
                      <div className="feature-icon">🤖</div>
                      <h4>AI-Powered Learning</h4>
                      <p>Our advanced AI tutors provide personalized guidance, generate infinite practice problems, and offer intelligent code reviews that help you understand not just what to code, but why.</p>
                    </div>
                    
                    <div className="feature-card">
                      <div className="feature-icon">🎮</div>
                      <h4>Gamified Experience</h4>
                      <p>Learning becomes addictive with our battle-based challenges, achievement systems, and competitive coding wars that make skill development feel like playing your favorite game.</p>
                    </div>
                    
                    <div className="feature-card">
                      <div className="feature-icon">🗺️</div>
                      <h4>Adaptive Pathways</h4>
                      <p>Dynamic learning paths that evolve based on your progress, ensuring you&apos;re always challenged at the right level while building upon solid foundations.</p>
                    </div>
                    
                    <div className="feature-card">
                      <div className="feature-icon">💻</div>
                      <h4>Real-World Skills</h4>
                      <p>From algorithms and data structures to system design and modern frameworks, we cover everything you need to become a professional developer.</p>
                    </div>
                  </div>
                </div>

                <div className="content-section">
                  <h3>Our Technology Stack</h3>
                  <p>LoopWar supports a comprehensive range of programming languages and technologies:</p>
                  <div className="tech-categories">
                    <div className="tech-category">
                      <h4>Languages</h4>
                      <p>Python, Java, C++, JavaScript, TypeScript, PHP, Go, Rust</p>
                    </div>
                    <div className="tech-category">
                      <h4>Web Technologies</h4>
                      <p>HTML5, CSS3, React, Next.js, Node.js, Express</p>
                    </div>
                    <div className="tech-category">
                      <h4>Data & AI</h4>
                      <p>Machine Learning, Data Science, SQL, MongoDB</p>
                    </div>
                    <div className="tech-category">
                      <h4>DevOps</h4>
                      <p>Docker, Kubernetes, CI/CD, Cloud Platforms</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="stats-card">
                  <h4>Platform Stats</h4>
                  <div className="stat-item">
                    <span className="stat-number">50+</span>
                    <span className="stat-label">Programming Languages</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">1000+</span>
                    <span className="stat-label">Practice Problems</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">AI Tutor Availability</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">∞</span>
                    <span className="stat-label">Generated Challenges</span>
                  </div>
                </div>

                <div className="cta-card">
                  <h4>Ready to Start?</h4>
                  <p>Join thousands of developers who are already sharpening their skills in the LoopWar arena.</p>
                  <Link href="/join" className="btn-primary">Start Learning Now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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
    </div>
  );
}
