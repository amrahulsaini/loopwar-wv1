'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import Logo from '../components/Logo';

export default function TermsPage() {
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
              <h1 className="page-title">Terms of Service</h1>
              <p className="page-subtitle">Important legal terms governing your use of LoopWar.dev</p>
              <p className="last-updated">Last updated: September 3, 2025</p>
            </div>

            <div className="content-grid">
              <div className="content-main">
                <div className="content-section">
                  <h2>Agreement to Terms</h2>
                  <p>By accessing and using LoopWar.dev (&quot;the Platform,&quot; &quot;our Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                </div>

                <div className="content-section">
                  <h3>Description of Service</h3>
                  <p>LoopWar.dev is an AI-powered coding education platform that provides:</p>
                  <ul>
                    <li>Interactive programming tutorials and challenges</li>
                    <li>AI-powered code review and feedback</li>
                    <li>Personalized learning paths and progress tracking</li>
                    <li>Gamified coding competitions and battles</li>
                    <li>Access to educational resources across multiple programming languages</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>User Accounts and Registration</h3>
                  
                  <h4>Account Creation</h4>
                  <ul>
                    <li>You must be at least 13 years old to create an account</li>
                    <li>You must provide accurate, current, and complete information during registration</li>
                    <li>You are responsible for safeguarding your account credentials</li>
                    <li>You must notify us immediately of any unauthorized access to your account</li>
                  </ul>

                  <h4>Account Responsibilities</h4>
                  <ul>
                    <li>Each person may maintain only one account</li>
                    <li>You are responsible for all activity that occurs under your account</li>
                    <li>You may not share your account credentials with others</li>
                    <li>You may not use another person&apos;s account without permission</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Acceptable Use Policy</h3>
                  
                  <h4>Permitted Uses</h4>
                  <ul>
                    <li>Learning programming and software development skills</li>
                    <li>Participating in coding challenges and educational activities</li>
                    <li>Sharing knowledge and helping other learners (when appropriate)</li>
                    <li>Using our AI tools for educational purposes</li>
                  </ul>

                  <h4>Prohibited Activities</h4>
                  <p>You agree NOT to:</p>
                  <ul>
                    <li><strong>Cheat or Exploit:</strong> Use external assistance, automated tools, or exploit system vulnerabilities in challenges</li>
                    <li><strong>Harmful Content:</strong> Submit malicious code, viruses, or content that could harm our systems or other users</li>
                    <li><strong>Intellectual Property Violation:</strong> Submit code that infringes on others&apos; copyrights, patents, or proprietary rights</li>
                    <li><strong>Harassment:</strong> Engage in abusive, threatening, or discriminatory behavior toward other users</li>
                    <li><strong>Spam or Misuse:</strong> Send unsolicited communications or misuse platform features</li>
                    <li><strong>Reverse Engineering:</strong> Attempt to reverse engineer, decompile, or hack our platform or AI systems</li>
                    <li><strong>Commercial Exploitation:</strong> Use the platform for unauthorized commercial purposes or compete with our services</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Content and Intellectual Property</h3>
                  
                  <h4>Your Content</h4>
                  <ul>
                    <li>You retain ownership of the code and content you create</li>
                    <li>By submitting code, you grant us a license to analyze, process, and provide feedback through our AI systems</li>
                    <li>You are responsible for ensuring your submissions don&apos;t violate any third-party rights</li>
                    <li>We may use anonymized, aggregated data from submissions to improve our AI and educational content</li>
                  </ul>

                  <h4>Our Content</h4>
                  <ul>
                    <li>LoopWar.dev owns all rights to the platform, AI systems, educational content, and design</li>
                    <li>You may not copy, distribute, or create derivative works of our proprietary content</li>
                    <li>Educational materials are provided for personal learning use only</li>
                    <li>Our AI-generated feedback and suggestions are provided under our license for your educational benefit</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>AI and Machine Learning Services</h3>
                  
                  <h4>AI-Powered Features</h4>
                  <ul>
                    <li>Our AI systems analyze your code to provide personalized feedback and learning recommendations</li>
                    <li>AI-generated content (problems, explanations, feedback) is provided for educational purposes</li>
                    <li>While we strive for accuracy, AI-generated content may occasionally contain errors</li>
                    <li>You should verify and understand AI suggestions rather than blindly implementing them</li>
                  </ul>

                  <h4>Data Processing</h4>
                  <ul>
                    <li>We process your coding submissions to provide personalized AI tutoring</li>
                    <li>Your interaction data helps improve our AI algorithms and educational effectiveness</li>
                    <li>We maintain appropriate security measures to protect your data during AI processing</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Payment and Subscription Terms</h3>
                  
                  <h4>Free Services</h4>
                  <ul>
                    <li>Basic access to LoopWar.dev is provided free of charge</li>
                    <li>Free users have access to core learning features with certain limitations</li>
                  </ul>

                  <h4>Premium Services (Future)</h4>
                  <ul>
                    <li>Advanced features may require a paid subscription in the future</li>
                    <li>Pricing and terms for premium services will be clearly disclosed</li>
                    <li>Subscriptions will be billed according to the selected plan</li>
                    <li>You may cancel subscriptions according to the cancellation policy provided at purchase</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Privacy and Data Protection</h3>
                  <p>Your privacy is important to us. Our collection and use of personal information is governed by our <Link href="/privacy" className="inline-link">Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
                </div>

                <div className="content-section">
                  <h3>Platform Availability and Modifications</h3>
                  
                  <h4>Service Availability</h4>
                  <ul>
                    <li>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
                    <li>Scheduled maintenance will be announced in advance when possible</li>
                    <li>We are not liable for temporary service interruptions</li>
                  </ul>

                  <h4>Platform Changes</h4>
                  <ul>
                    <li>We may modify, update, or discontinue features at any time</li>
                    <li>Significant changes to core functionality will be communicated to users</li>
                    <li>We may add new features, programming languages, or educational content</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Limitation of Liability</h3>
                  <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
                  <ul>
                    <li>LoopWar.dev is provided &quot;AS IS&quot; without warranties of any kind</li>
                    <li>We do not guarantee the accuracy of AI-generated educational content</li>
                    <li>We are not liable for any indirect, incidental, or consequential damages</li>
                    <li>Our total liability to you shall not exceed the amount you paid us in the past 12 months</li>
                    <li>We are not responsible for job placement, career advancement, or educational outcomes</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Indemnification</h3>
                  <p>You agree to indemnify and hold harmless LoopWar.dev from any claims, damages, or expenses arising from:</p>
                  <ul>
                    <li>Your violation of these Terms of Service</li>
                    <li>Your use of the platform in violation of applicable laws</li>
                    <li>Infringement of third-party rights by your submitted content</li>
                    <li>Any unauthorized access to accounts due to your negligence</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Termination</h3>
                  
                  <h4>Termination by You</h4>
                  <ul>
                    <li>You may terminate your account at any time through account settings</li>
                    <li>Upon termination, your access to premium features (if any) will cease</li>
                    <li>Your learning progress and submissions may be retained according to our Privacy Policy</li>
                  </ul>

                  <h4>Termination by Us</h4>
                  <ul>
                    <li>We may suspend or terminate accounts that violate these Terms</li>
                    <li>We may terminate the service entirely with 30 days&apos; notice</li>
                    <li>Immediate termination may occur for serious violations or legal requirements</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Governing Law and Disputes</h3>
                  <ul>
                    <li>These Terms are governed by the laws of [Jurisdiction to be specified]</li>
                    <li>Disputes will be resolved through binding arbitration when possible</li>
                    <li>You waive the right to participate in class action lawsuits against us</li>
                    <li>Any litigation must be filed within one year of the dispute arising</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Changes to Terms</h3>
                  <ul>
                    <li>We may update these Terms periodically to reflect changes in our service or legal requirements</li>
                    <li>Significant changes will be announced via email or platform notification</li>
                    <li>Continued use of the platform after changes constitutes acceptance of the new Terms</li>
                    <li>If you disagree with changes, you may terminate your account</li>
                  </ul>
                </div>

                <div className="content-section">
                  <h3>Contact Information</h3>
                  <p>For questions about these Terms of Service, please contact us:</p>
                  <ul>
                    <li><strong>Legal:</strong> legal@loopwar.dev</li>
                    <li><strong>General Support:</strong> contact@loopwar.dev</li>
                    <li><strong>Admin:</strong> admin@loopwar.dev</li>
                  </ul>

                  <div className="terms-acceptance">
                    <p><strong>By using LoopWar.dev, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</strong></p>
                  </div>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="stats-card">
                  <h4>Quick Navigation</h4>
                  <div className="nav-item">
                    <a href="#agreement">Agreement to Terms</a>
                  </div>
                  <div className="nav-item">
                    <a href="#accounts">User Accounts</a>
                  </div>
                  <div className="nav-item">
                    <a href="#usage">Acceptable Use</a>
                  </div>
                  <div className="nav-item">
                    <a href="#content">Content & IP</a>
                  </div>
                  <div className="nav-item">
                    <a href="#liability">Liability</a>
                  </div>
                  <div className="nav-item">
                    <a href="#termination">Termination</a>
                  </div>
                </div>

                <div className="cta-card">
                  <h4>Need Legal Help?</h4>
                  <p>For questions about these Terms of Service, contact our legal team.</p>
                  <Link href="/contact" className="btn-primary">Contact Legal</Link>
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
