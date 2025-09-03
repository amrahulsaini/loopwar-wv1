'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import NProgress from 'nprogress';

export default function PrivacyPage() {
  // Configure NProgress
  useEffect(() => {
    NProgress.configure({ 
      showSpinner: false,
      minimum: 0.3,
      easing: 'ease',
      speed: 800
    });
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
              <li><Link href="/#showcase">Languages</Link></li>
              <li><Link href="/#meetup">Features</Link></li>
              <li><Link href="/#community">Community</Link></li>
            </ul>
            <div className="nav-actions">
              <ThemeSwitcher className="theme-toggle hover-lift icon" />
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
            <h1 className="page-title">Privacy Policy</h1>
            <p className="page-subtitle">Your privacy and data security are our top priorities</p>
            <p className="last-updated">Last updated: September 3, 2025</p>
          </div>
        </section>

        <section className="content-section">
          <div className="container">
            <div className="content-main privacy-content">
              <h2>Introduction</h2>
              <p>At LoopWar.dev ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered coding education platform.</p>

              <h2>Information We Collect</h2>
              
              <h3>Personal Information</h3>
              <ul>
                <li><strong>Account Information:</strong> Username, email address, password (encrypted)</li>
                <li><strong>Profile Data:</strong> Experience level, learning preferences, programming language interests</li>
                <li><strong>Contact Information:</strong> Email address for communications and account verification</li>
              </ul>

              <h3>Usage Information</h3>
              <ul>
                <li><strong>Learning Data:</strong> Code submissions, progress tracking, completed challenges, performance metrics</li>
                <li><strong>Platform Activity:</strong> Login times, feature usage, AI interactions, learning path progression</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, session data</li>
              </ul>

              <h3>AI Interaction Data</h3>
              <ul>
                <li><strong>Code Analysis:</strong> Your code submissions for AI feedback and improvement suggestions</li>
                <li><strong>Learning Patterns:</strong> How you interact with our AI tutors and adaptive learning system</li>
                <li><strong>Performance Metrics:</strong> Success rates, time spent on problems, skill development tracking</li>
              </ul>

              <h2>How We Use Your Information</h2>
              
              <h3>Educational Services</h3>
              <ul>
                <li>Provide personalized AI-powered coding education and tutoring</li>
                <li>Generate adaptive learning paths based on your progress and goals</li>
                <li>Create infinite, tailored practice problems and coding challenges</li>
                <li>Offer intelligent code reviews and improvement suggestions</li>
              </ul>

              <h3>Platform Improvement</h3>
              <ul>
                <li>Analyze usage patterns to enhance our AI algorithms and learning effectiveness</li>
                <li>Improve platform features and user experience</li>
                <li>Develop new educational content and programming languages support</li>
              </ul>

              <h3>Communications</h3>
              <ul>
                <li>Send account verification emails and security notifications</li>
                <li>Provide updates about new features, courses, and platform improvements</li>
                <li>Respond to your inquiries and support requests</li>
              </ul>

              <h2>Data Sharing and Disclosure</h2>
              
              <h3>We Do NOT Share Your Personal Information Except:</h3>
              <ul>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulations</li>
                <li><strong>Security Purposes:</strong> To protect the rights, property, or safety of LoopWar, our users, or others</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice)</li>
              </ul>

              <h3>Anonymous Data</h3>
              <p>We may share aggregated, anonymized data that cannot be used to identify individual users for research, analytics, and platform improvement purposes.</p>

              <h2>Data Security</h2>
              <ul>
                <li><strong>Encryption:</strong> All sensitive data is encrypted both in transit and at rest</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication measures</li>
                <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
                <li><strong>Secure Infrastructure:</strong> Industry-standard security practices and protocols</li>
              </ul>

              <h2>Your Rights and Choices</h2>
              
              <h3>Account Management</h3>
              <ul>
                <li><strong>Access:</strong> View and download your personal data and learning progress</li>
                <li><strong>Update:</strong> Modify your profile information and learning preferences</li>
                <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                <li><strong>Export:</strong> Download your code submissions and learning history</li>
              </ul>

              <h3>Communication Preferences</h3>
              <ul>
                <li>Opt out of non-essential communications while maintaining security notifications</li>
                <li>Customize the frequency and type of educational updates you receive</li>
              </ul>

              <h2>Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to:</p>
              <ul>
                <li>Maintain your login session and preferences</li>
                <li>Remember your learning progress and AI interaction history</li>
                <li>Analyze platform usage to improve our services</li>
                <li>Provide personalized content and recommendations</li>
              </ul>
              <p>You can control cookie settings through your browser, though some features may not function properly if cookies are disabled.</p>

              <h2>Data Retention</h2>
              <ul>
                <li><strong>Active Accounts:</strong> We retain your data while your account is active and for educational continuity</li>
                <li><strong>Inactive Accounts:</strong> Data may be retained for up to 24 months after account deletion for recovery purposes</li>
                <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law or for legitimate business purposes</li>
              </ul>

              <h2>International Data Transfers</h2>
              <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your privacy rights and comply with applicable data protection laws.</p>

              <h2>Children's Privacy</h2>
              <p>LoopWar is intended for users 13 years of age and older. We do not knowingly collect personal information from children under 13. If we discover we have collected information from a child under 13, we will delete it immediately.</p>

              <h2>Changes to This Policy</h2>
              <p>We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. We will notify you of significant changes via email or through our platform. Your continued use of LoopWar after such changes constitutes acceptance of the updated policy.</p>

              <h2>Contact Us</h2>
              <p>If you have questions about this Privacy Policy or how we handle your personal information, please contact us:</p>
              <ul>
                <li><strong>Email:</strong> privacy@loopwar.dev</li>
                <li><strong>Support:</strong> contact@loopwar.dev</li>
                <li><strong>Address:</strong> LoopWar.dev Privacy Team</li>
              </ul>
            </div>
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
    </>
  );
}
