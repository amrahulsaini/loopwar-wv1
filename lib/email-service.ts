import nodemailer from 'nodemailer';
import Database from './database';

// Email templates
const EMAIL_TEMPLATES = {
  verification: {
    subject: '🔐 Verify Your LoopWar Account',
    template: 'verification'
  },
  welcome: {
    subject: '🎉 Welcome to LoopWar - Your AI Coding Journey Begins!',
    template: 'welcome'
  },
  password_reset: {
    subject: '🔑 Reset Your LoopWar Password',
    template: 'password_reset'
  },
  security_alert: {
    subject: '🚨 Security Alert - LoopWar Account Activity',
    template: 'security_alert'
  }
};

// SMTP configuration with debugging enabled
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '903fd4002@smtp-brevo.com',
    pass: process.env.SMTP_PASS || '7rxfNbnRm1OCjUW2'
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});

export class EmailService {
  // Send verification email
  static async sendVerificationEmail(
    userId: number,
    email: string,
    username: string,
    verificationCode: string
  ): Promise<void> {
    const emailContent = this.generateVerificationHTML(username, verificationCode);
    
    await this.queueEmail({
      userId,
      emailType: 'verification',
      recipientEmail: email,
      subject: EMAIL_TEMPLATES.verification.subject,
      emailContent,
      priority: 'high',
      metadata: { verificationCode, username }
    });

    await this.processEmailQueue();
  }

  // Send welcome email
  static async sendWelcomeEmail(
    userId: number,
    email: string,
    username: string
  ): Promise<void> {
    const emailContent = this.generateWelcomeHTML(username);
    
    await this.queueEmail({
      userId,
      emailType: 'welcome',
      recipientEmail: email,
      subject: EMAIL_TEMPLATES.welcome.subject,
      emailContent,
      priority: 'normal',
      metadata: { username, welcomeDate: new Date().toISOString() }
    });

    // Send welcome email immediately after verification
    await this.processEmailQueue();
  }

  // Queue email for sending
  static async queueEmail(emailData: {
    userId: number;
    emailType: string;
    recipientEmail: string;
    subject: string;
    emailContent: string;
    priority?: string;
    scheduledFor?: Date;
    metadata?: Record<string, unknown>;
  }): Promise<number> {
    const sql = `
      INSERT INTO email_sender (
        user_id, email_type, recipient_email, subject, email_content, 
        priority, scheduled_for, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await Database.query(sql, [
      emailData.userId,
      emailData.emailType,
      emailData.recipientEmail,
      emailData.subject,
      emailData.emailContent,
      emailData.priority || 'normal',
      emailData.scheduledFor || null,
      JSON.stringify(emailData.metadata || {})
    ]) as { insertId: number };

    console.log(`📧 Email queued for ${emailData.recipientEmail} (ID: ${result.insertId})`);
    return result.insertId;
  }

  // Process email queue
  static async processEmailQueue(): Promise<void> {
    try {
      // Get pending emails
      const pendingEmails = await Database.query(`
        SELECT * FROM email_sender 
        WHERE status = 'pending' 
        AND (scheduled_for IS NULL OR scheduled_for <= NOW())
        ORDER BY priority DESC, created_at ASC 
        LIMIT 10
      `) as {
        id: number;
        user_id: number;
        email_type: string;
        recipient_email: string;
        subject: string;
        email_content: string;
        priority: string;
        metadata: string;
      }[];

      for (const email of pendingEmails) {
        await this.sendQueuedEmail(email);
      }
    } catch (error) {
      console.error('Failed to process email queue:', error);
    }
  }

  // Send individual queued email
  static async sendQueuedEmail(emailRecord: {
    id: number;
    user_id: number;
    email_type: string;
    recipient_email: string;
    subject: string;
    email_content: string;
    priority: string;
    metadata: string;
  }): Promise<void> {
    try {
      console.log(`📧 Attempting to send email to: ${emailRecord.recipient_email}`);
      console.log(`📧 SMTP Config: Host=${process.env.SMTP_HOST}, Port=${process.env.SMTP_PORT}, User=${process.env.SMTP_USER}`);
      
      // Update status to sent (since we're about to send)
      await Database.query(
        'UPDATE email_sender SET status = ?, sent_at = NOW() WHERE id = ?',
        ['sent', emailRecord.id]
      );

      const mailOptions = {
        from: `"LoopWar Team" <${process.env.SMTP_FROM || 'verify@loopwar.dev'}>`,
        to: emailRecord.recipient_email,
        subject: emailRecord.subject,
        html: emailRecord.email_content
      };

      const info = await transporter.sendMail(mailOptions);

      // Update as sent
      await Database.query(
        'UPDATE email_sender SET status = ?, sent_at = NOW(), smtp_response = ? WHERE id = ?',
        ['sent', JSON.stringify(info), emailRecord.id]
      );

      console.log(`✅ Email sent successfully to ${emailRecord.recipient_email}`);
    } catch (error) {
      console.error(`❌ Failed to send email to ${emailRecord.recipient_email}:`, error);
      
      // Update as failed
      await Database.query(
        'UPDATE email_sender SET status = ?, error_message = ? WHERE id = ?',
        ['failed', String(error), emailRecord.id]
      );
    }
  }

  // Generate verification email HTML
  static generateVerificationHTML(username: string, verificationCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your LoopWar Account</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #4d4d4d 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; font-size: 28px; margin-bottom: 10px; }
          .header p { color: rgba(255,255,255,0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .welcome-text { font-size: 18px; margin-bottom: 30px; color: #2c3e50; }
          .verification-box { background: #f8f9fa; border: 2px dashed #6c757d; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
          .verification-code { font-size: 36px; font-weight: bold; color: #1a1a1a; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; }
          .instructions { background: #f5f5f5; border-left: 4px solid #4d4d4d; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
          .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
          .security-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🚀 Welcome to LoopWar!</h1>
            <p>Your AI-Powered Coding Journey Begins Here</p>
          </div>
          
          <div class="content">
            <div class="welcome-text">
              Hello <strong>${username}</strong>!
            </div>
            
            <p>Thank you for joining LoopWar! To complete your registration and start your coding journey, please verify your email address using the code below:</p>
            
            <div class="verification-box">
              <p style="margin-bottom: 10px; font-size: 16px; color: #666;">Your Verification Code:</p>
              <div class="verification-code">${verificationCode}</div>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">This code expires in 24 hours</p>
            </div>
            
            <div class="instructions">
              <h3 style="margin-bottom: 15px;">🔐 How to verify:</h3>
              <ol style="margin-left: 20px;">
                <li>Go back to the LoopWar verification page</li>
                <li>Enter the 6-digit code above</li>
                <li>Click "Verify Account"</li>
                <li>Start coding with AI assistance!</li>
              </ol>
            </div>
            
            <div class="security-notice">
              <strong>🛡️ Security Notice:</strong> Never share this verification code with anyone. LoopWar staff will never ask for this code via email or phone.
            </div>
          </div>
          
          <div class="footer">
            <p>🤖 LoopWar Team</p>
            <p style="font-size: 14px; opacity: 0.8; margin-top: 10px;">
              If you didn't create this account, please ignore this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate welcome email HTML
  static generateWelcomeHTML(username: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to LoopWar!</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #4d4d4d 100%); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; font-size: 28px; margin-bottom: 10px; }
          .content { padding: 40px 30px; }
          .welcome-section { text-align: center; margin: 30px 0; }
          .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .feature-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
          .cta-button { display: inline-block; background: #1a1a1a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎉 Welcome to LoopWar!</h1>
            <p>Your account has been successfully verified</p>
          </div>
          
          <div class="content">
            <div class="welcome-section">
              <h2>Hello ${username}! 👋</h2>
              <p style="font-size: 18px; margin: 20px 0;">
                Congratulations! Your LoopWar account is now active and ready to use.
              </p>
            </div>
            
            <div class="feature-grid">
              <div class="feature-card">
                <h3>🤖 AI Assistance</h3>
                <p>Get intelligent code suggestions and debugging help</p>
              </div>
              <div class="feature-card">
                <h3>📚 Learning Path</h3>
                <p>Follow structured coding challenges and tutorials</p>
              </div>
              <div class="feature-card">
                <h3>🏆 Achievements</h3>
                <p>Track your progress and earn coding badges</p>
              </div>
              <div class="feature-card">
                <h3>👥 Community</h3>
                <p>Connect with fellow developers and share knowledge</p>
              </div>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/zone" class="cta-button">
                🚀 Start Your Journey
              </a>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 10px; margin: 30px 0;">
              <h3>🎯 Next Steps:</h3>
              <ul style="margin: 15px 0 0 20px;">
                <li>Complete your profile setup</li>
                <li>Choose your experience level</li>
                <li>Start your first coding challenge</li>
                <li>Join our community discussions</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Happy coding! 🚀</p>
            <p><strong>The LoopWar Team</strong></p>
            <p style="font-size: 14px; opacity: 0.8; margin-top: 10px;">
              Need help? Reply to this email or visit our support center.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Get email statistics for user
  static async getEmailStats(userId: number): Promise<{
    email_type: string;
    status: string;
    count: number;
  }[]> {
    const stats = await Database.query(`
      SELECT 
        email_type,
        status,
        COUNT(*) as count
      FROM email_sender 
      WHERE user_id = ?
      GROUP BY email_type, status
    `, [userId]);

    return stats as {
      email_type: string;
      status: string;
      count: number;
    }[];
  }

  // Mark email as opened (for tracking)
  static async markEmailOpened(emailId: number): Promise<void> {
    await Database.query(
      'UPDATE email_sender SET opened_at = NOW() WHERE id = ? AND opened_at IS NULL',
      [emailId]
    );
  }

  // Mark email as clicked (for tracking)
  static async markEmailClicked(emailId: number): Promise<void> {
    await Database.query(
      'UPDATE email_sender SET clicked_at = NOW() WHERE id = ? AND clicked_at IS NULL',
      [emailId]
    );
  }
}

export default EmailService;
