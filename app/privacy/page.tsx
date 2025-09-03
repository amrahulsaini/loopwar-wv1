'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import Logo from '../components/Logo';

export default function PrivacyPage() {
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
              <h1 className="page-title">Privacy Policy</h1>
              <p className="page-subtitle">Your privacy and data security are our top priorities</p>
              <p className="last-updated">Last updated: September 3, 2025</p>
            </div>

            <div className="content-grid">
              <div className="content-main">
                <div className="content-section">
                  <h2>Introduction</h2>
                  <p>At LoopWar.dev (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered coding education platform.</p>
                </div>

                <div className="content-section">
                  <h3>Information We Collect</h3>
                  
                  <h4>Personal Information</h4>
                  <ul>
                    <li><strong>Account Information:</strong> Username, email address, password (encrypted)</li>
                    <li><strong>Profile Data:</strong> Learning preferences, skill levels, educational goals</li>
                    <li><strong>Communication Data:</strong> Support requests, feedback, and correspondence</li>
                  </ul>

                  <h4>Usage Information</h4>
                  <ul>
                    <li><strong>Learning Data:</strong> Code submissions, progress tracking, completed challenges, performance metrics</li>
                    <li><strong>Platform Activity:</strong> Login times, feature usage, AI interactions, learning path progression</li>
                    <li><strong>Technical Data:</strong> IP address, browser type, device information, session data</li>
                  </ul>

                  <h4>AI Interaction Data</h4>
                  <ul>
                    <li><strong>Code Analysis:</strong> Your code submissions for AI feedback and improvement suggestions</li>
                    <li><strong>Learning Patterns:</strong> How you interact with our AI tutors and adaptive learning system</li>
                    <li><strong>Performance Metrics:</strong> Success rates, time spent on problems, skill development tracking</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>How We Use Your Information</h3>
                  
                  <h4>Educational Services</h4>
                  <ul>
                    <li>Provide personalized AI-powered coding education and tutoring</li>
                    <li>Generate adaptive learning paths based on your progress and goals</li>
                    <li>Create infinite, tailored practice problems and coding challenges</li>
                    <li>Offer intelligent code reviews and improvement suggestions</li>
                  </ul>

                  <h4>Platform Improvement</h4>
                  <ul>
                    <li>Analyze usage patterns to enhance our AI algorithms and learning effectiveness</li>
                    <li>Improve platform features and user experience</li>
                    <li>Develop new educational content and programming languages support</li>
                  </ul>

                  <h4>Communications</h4>
                  <ul>
                    <li>Send account verification emails and security notifications</li>
                    <li>Provide updates about new features, courses, and platform improvements</li>
                    <li>Respond to your inquiries and support requests</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Data Sharing and Disclosure</h3>
                  
                  <h4>We Do NOT Share Your Personal Information Except:</h4>
                  <ul>
                    <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
                    <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulations</li>
                    <li><strong>Security Purposes:</strong> To protect the rights, property, or safety of LoopWar, our users, or others</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice)</li>
                  </ul>

                  <h4>Anonymous Data</h4>
                  <p>We may share aggregated, anonymized data that cannot be used to identify individual users for research, analytics, and platform improvement purposes.</p>
                </div>

                <div className="content-section">
                  <h3>Data Security</h3>
                  <ul>
                    <li><strong>Encryption:</strong> All sensitive data is encrypted both in transit and at rest</li>
                    <li><strong>Access Controls:</strong> Strict access controls and authentication measures</li>
                    <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
                    <li><strong>Secure Infrastructure:</strong> Industry-standard security practices and protocols</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Your Rights and Choices</h3>
                  
                  <h4>Account Management</h4>
                  <ul>
                    <li><strong>Access:</strong> View and download your personal data and learning progress</li>
                    <li><strong>Update:</strong> Modify your profile information and learning preferences</li>
                    <li><strong>Delete:</strong> Request deletion of your account and associated data</li>
                    <li><strong>Export:</strong> Download your code submissions and learning history</li>
                  </ul>

                  <h4>Communication Preferences</h4>
                  <ul>
                    <li>Opt out of non-essential communications while maintaining security notifications</li>
                    <li>Customize the frequency and type of educational updates you receive</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Cookies and Tracking</h3>
                  <p>We use cookies and similar technologies to:</p>
                  <ul>
                    <li>Maintain your login session and preferences</li>
                    <li>Remember your learning progress and AI interaction history</li>
                    <li>Analyze platform usage to improve our services</li>
                    <li>Provide personalized content and recommendations</li>
                  </ul>
                  <p>You can control cookie settings through your browser, though some features may not function properly if cookies are disabled.</p>
                </div>

                <div className="content-section">
                  <h3>Data Retention</h3>
                  <ul>
                    <li><strong>Active Accounts:</strong> We retain your data while your account is active and for educational continuity</li>
                    <li><strong>Inactive Accounts:</strong> Data may be retained for up to 24 months after account deletion for recovery purposes</li>
                    <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law or for legitimate business purposes</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>International Data Transfers</h3>
                  <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your privacy rights and comply with applicable data protection laws.</p>
                </div>

                <div className="content-section">
                  <h3>Children&apos;s Privacy</h3>
                  <p>LoopWar is intended for users 13 years of age and older. We do not knowingly collect personal information from children under 13. If we discover we have collected information from a child under 13, we will delete it immediately.</p>
                </div>

                <div className="content-section">
                  <h3>Changes to This Policy</h3>
                  <p>We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. We will notify you of significant changes via email or through our platform. Your continued use of LoopWar after such changes constitutes acceptance of the updated policy.</p>
                </div>

                <div className="content-section">
                  <h3>Contact Us</h3>
                  <p>If you have questions about this Privacy Policy or how we handle your personal information, please contact us:</p>
                  <ul>
                    <li><strong>Email:</strong> privacy@loopwar.dev</li>
                    <li><strong>Support:</strong> contact@loopwar.dev</li>
                    <li><strong>Address:</strong> LoopWar.dev Privacy Team</li>
                  </ul>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="stats-card">
                  <h4>Privacy Quick Links</h4>
                  <div className="nav-item">
                    <a href="#data-collection">Data Collection</a>
                  </div>
                  <div className="nav-item">
                    <a href="#data-use">How We Use Data</a>
                  </div>
                  <div className="nav-item">
                    <a href="#data-sharing">Data Sharing</a>
                  </div>
                  <div className="nav-item">
                    <a href="#security">Security</a>
                  </div>
                  <div className="nav-item">
                    <a href="#your-rights">Your Rights</a>
                  </div>
                  <div className="nav-item">
                    <a href="#cookies">Cookies</a>
                  </div>
                </div>

                <div className="cta-card">
                  <h4>Privacy Questions?</h4>
                  <p>Contact our privacy team for any questions about your data and privacy rights.</p>
                  <Link href="/contact" className="btn-primary">Contact Privacy Team</Link>
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
