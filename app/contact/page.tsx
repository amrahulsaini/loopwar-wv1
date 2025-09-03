'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Thank you for your message! We have received it and will get back to you soon. For urgent matters, please email us directly at admin@loopwar.dev.'
        });
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          type: 'general'
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again or email us directly.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="page-title">Contact Us</h1>
            <p className="page-subtitle">Get in touch with the LoopWar team</p>
          </div>
        </section>

        <section className="content-section">
          <div className="container">
            <div className="contact-grid">
              <div className="contact-info">
                <h2>Get in Touch</h2>
                <p>Have questions about LoopWar? Need technical support? Want to provide feedback? We&apos;d love to hear from you!</p>

                <div className="contact-methods">
                  <div className="contact-item">
                    <h3>📧 General Inquiries</h3>
                    <p>For general questions, feedback, or suggestions:</p>
                    <a href="mailto:contact@loopwar.dev" className="contact-link">contact@loopwar.dev</a>
                  </div>

                  <div className="contact-item">
                    <h3>🛠️ Technical Support</h3>
                    <p>Having trouble with the platform? Need technical assistance?</p>
                    <a href="mailto:support@loopwar.dev" className="contact-link">support@loopwar.dev</a>
                  </div>

                  <div className="contact-item">
                    <h3>👨‍💼 Administration</h3>
                    <p>For account issues, billing, or administrative matters:</p>
                    <a href="mailto:admin@loopwar.dev" className="contact-link">admin@loopwar.dev</a>
                  </div>

                  <div className="contact-item">
                    <h3>🔒 Privacy & Legal</h3>
                    <p>For privacy concerns, legal matters, or data requests:</p>
                    <a href="mailto:legal@loopwar.dev" className="contact-link">legal@loopwar.dev</a>
                  </div>

                  <div className="contact-item">
                    <h3>🤝 Partnerships</h3>
                    <p>Interested in partnering with LoopWar?</p>
                    <a href="mailto:partnerships@loopwar.dev" className="contact-link">partnerships@loopwar.dev</a>
                  </div>
                </div>

                <div className="response-time">
                  <h3>📅 Response Times</h3>
                  <ul>
                    <li><strong>General Inquiries:</strong> Within 24-48 hours</li>
                    <li><strong>Technical Support:</strong> Within 12-24 hours</li>
                    <li><strong>Critical Issues:</strong> Within 2-4 hours</li>
                    <li><strong>Partnership Inquiries:</strong> Within 3-5 business days</li>
                  </ul>
                </div>
              </div>

              <div className="contact-form-section">
                <div className="contact-form-container">
                  <h2>Send us a Message</h2>
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label htmlFor="name">Full Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="type">Inquiry Type *</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="bug">Bug Report</option>
                        <option value="feature">Feature Request</option>
                        <option value="billing">Billing & Account</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        placeholder="Please provide details about your inquiry, including any relevant information that might help us assist you better."
                      />
                    </div>

                    {submitStatus.type && (
                      <div className={`form-status ${submitStatus.type}`}>
                        {submitStatus.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>

                <div className="additional-info">
                  <h3>💡 Before You Contact Us</h3>
                  <ul>
                    <li>Check our <Link href="/about" className="inline-link">About page</Link> for general platform information</li>
                    <li>Review our <Link href="/privacy" className="inline-link">Privacy Policy</Link> for data-related questions</li>
                    <li>Read our <Link href="/terms" className="inline-link">Terms of Service</Link> for usage guidelines</li>
                    <li>Try refreshing the page or clearing your browser cache for technical issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="emergency-contact">
          <div className="container">
            <div className="emergency-info">
              <h2>🚨 Need Immediate Help?</h2>
              <p>For urgent technical issues affecting your learning or account security:</p>
              <div className="emergency-contacts">
                <a href="mailto:urgent@loopwar.dev" className="emergency-btn">urgent@loopwar.dev</a>
                <span className="or">or</span>
                <a href="mailto:admin@loopwar.dev" className="emergency-btn">admin@loopwar.dev</a>
              </div>
              <p className="emergency-note">We monitor these addresses 24/7 and will respond within 2-4 hours.</p>
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
