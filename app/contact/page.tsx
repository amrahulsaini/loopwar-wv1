'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, Mail, MessageCircle, Shield, Users } from 'lucide-react';
import Logo from '../components/Logo';

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
              <h1 className="page-title">Contact Us</h1>
              <p className="page-subtitle">Get in touch with the LoopWar team</p>
            </div>

            <div className="content-grid">
              <div className="content-main">
                <div className="content-section">
                  <h2>Get in Touch</h2>
                  <p>Have questions about LoopWar? Need technical support? Want to provide feedback? We&apos;d love to hear from you!</p>
                </div>

                <div className="content-section">
                  <h3>Contact Methods</h3>
                  <div className="contact-methods-grid">
                    <div className="contact-method-card">
                      <div className="contact-icon">
                        <Mail size={24} />
                      </div>
                      <h4>General Inquiries</h4>
                      <p>For general questions, feedback, or suggestions</p>
                      <a href="mailto:contact@loopwar.dev" className="contact-link">contact@loopwar.dev</a>
                    </div>

                    <div className="contact-method-card">
                      <div className="contact-icon">
                        <MessageCircle size={24} />
                      </div>
                      <h4>Technical Support</h4>
                      <p>Having trouble with the platform? Need technical assistance?</p>
                      <a href="mailto:support@loopwar.dev" className="contact-link">support@loopwar.dev</a>
                    </div>

                    <div className="contact-method-card">
                      <div className="contact-icon">
                        <Shield size={24} />
                      </div>
                      <h4>Privacy & Legal</h4>
                      <p>For privacy concerns, legal matters, or data requests</p>
                      <a href="mailto:legal@loopwar.dev" className="contact-link">legal@loopwar.dev</a>
                    </div>

                    <div className="contact-method-card">
                      <div className="contact-icon">
                        <Users size={24} />
                      </div>
                      <h4>Partnerships</h4>
                      <p>Interested in partnering with LoopWar?</p>
                      <a href="mailto:partnerships@loopwar.dev" className="contact-link">partnerships@loopwar.dev</a>
                    </div>
                  </div>
                </div>

                <div className="content-section">
                  <h3>Send us a Message</h3>
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-row">
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
                    </div>

                    <div className="form-row">
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

                <div className="content-section">
                  <h3>Before You Contact Us</h3>
                  <ul>
                    <li>Check our <Link href="/about" className="inline-link">About page</Link> for general platform information</li>
                    <li>Review our <Link href="/privacy" className="inline-link">Privacy Policy</Link> for data-related questions</li>
                    <li>Read our <Link href="/terms" className="inline-link">Terms of Service</Link> for usage guidelines</li>
                    <li>Try refreshing the page or clearing your browser cache for technical issues</li>
                  </ul>
                </div>
              </div>

              <div className="content-sidebar">
                <div className="stats-card">
                  <h4>Response Times</h4>
                  <div className="stat-item">
                    <span className="stat-label">General Inquiries</span>
                    <span className="stat-number">24-48h</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Technical Support</span>
                    <span className="stat-number">12-24h</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Critical Issues</span>
                    <span className="stat-number">2-4h</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Partnership Inquiries</span>
                    <span className="stat-number">3-5 days</span>
                  </div>
                </div>

                <div className="cta-card emergency-card">
                  <h4>🚨 Need Immediate Help?</h4>
                  <p>For urgent technical issues affecting your learning or account security:</p>
                  <div className="emergency-contacts">
                    <a href="mailto:urgent@loopwar.dev" className="btn-primary">urgent@loopwar.dev</a>
                    <a href="mailto:admin@loopwar.dev" className="btn-secondary">admin@loopwar.dev</a>
                  </div>
                  <p className="emergency-note">We monitor these addresses 24/7 and will respond within 2-4 hours.</p>
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
