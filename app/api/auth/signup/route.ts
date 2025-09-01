import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import Database from '../../../../lib/database';

// SMTP configuration for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '903fd4002@smtp-brevo.com',
    pass: process.env.SMTP_PASS || '7rxfNbnRm1OCjUW2'
  }
});

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Signup API called');
    
    // Health check for database
    const dbHealthy = await Database.healthCheck();
    if (!dbHealthy) {
      console.error('❌ Database connection failed');
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const { username, email, password } = await request.json();
    console.log('📋 Received signup data:', { username, email });

    // Validation
    if (!username || !email || !password) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 6) {
      console.log('❌ Password too short');
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserByEmail = await Database.findUserByEmail(email);
    if (existingUserByEmail) {
      console.log('❌ User already exists with this email');
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    const existingUserByUsername = await Database.findUserByUsername(username);
    if (existingUserByUsername) {
      console.log('❌ Username already taken');
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Generated verification code for', email);

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Password hashed successfully');

    // Create user in database
    const userId = await Database.createUser({
      username,
      email,
      passwordHash,
      verificationCode
    });

    console.log('✅ User created with ID:', userId);

    // Log registration activity
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await Database.logActivity(userId, 'register', clientIP, userAgent, {
      email: email,
      username: username
    });

    // Send verification email
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to LoopWar - Verify Your Email</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; font-size: 28px; margin-bottom: 10px; }
            .header p { color: rgba(255,255,255,0.9); font-size: 16px; }
            .content { padding: 40px 30px; }
            .welcome-text { font-size: 18px; margin-bottom: 30px; color: #2c3e50; }
            .verification-box { background: #f8f9fa; border: 2px dashed #6c757d; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
            .verification-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace; }
            .instructions { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { background: #2c3e50; color: white; padding: 30px; text-align: center; }
            .footer a { color: #3498db; text-decoration: none; }
            @media (max-width: 600px) {
              .content { padding: 20px 15px; }
              .header { padding: 30px 15px; }
              .verification-code { font-size: 28px; letter-spacing: 4px; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>🚀 Welcome to LoopWar!</h1>
              <p>Your AI-Powered Coding Journey Begins Here</p>
            </div>
            
            <div class="content">
              <p class="welcome-text">
                Hi <strong>${username}</strong>! 👋
              </p>
              
              <p>Welcome to <strong>LoopWar.dev</strong> - where coding meets AI innovation! We're excited to have you join our community of developers who are shaping the future of programming education.</p>
              
              <div class="verification-box">
                <h3>🔐 Your Verification Code</h3>
                <div class="verification-code">${verificationCode}</div>
                <p>Enter this code on the verification page to activate your account</p>
              </div>
              
              <div class="instructions">
                <h4>📋 Next Steps:</h4>
                <ol>
                  <li>Copy the verification code above</li>
                  <li>Return to the LoopWar verification page</li>
                  <li>Enter your code to activate your account</li>
                  <li>Start your AI-powered coding journey!</li>
                </ol>
              </div>
              
              <center>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify" class="button">
                  Verify My Account 🚀
                </a>
              </center>
              
              <p style="margin-top: 30px; color: #7f8c8d; font-size: 14px;">
                <strong>⏰ Important:</strong> This verification code will expire in 24 hours for security reasons.
              </p>
              
              <p style="margin-top: 20px; color: #7f8c8d; font-size: 14px;">
                If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p>🔮 <strong>LoopWar.dev</strong> - The Future of AI-Powered Coding Education</p>
              <p style="margin-top: 10px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}">Visit LoopWar</a> | 
                <a href="mailto:support@loopwar.dev">Contact Support</a>
              </p>
              <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                © 2025 LoopWar. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"LoopWar Team" <${process.env.SMTP_FROM || 'verify@loopwar.dev'}>`,
        to: email,
        subject: '🚀 Welcome to LoopWar - Verify Your Email',
        html: emailHtml,
        text: `Welcome to LoopWar! Your verification code is: ${verificationCode}\n\nEnter this code on the verification page to activate your account.\n\nThis code expires in 24 hours.\n\nIf you didn't create this account, you can safely ignore this email.`
      });

      console.log('📧 Verification email sent successfully to:', email);

      // Skip notification creation for now to avoid charset issues
      console.log('⏭️ Skipping notification creation to avoid charset issues');

    } catch (emailError) {
      console.error('📧 Failed to send verification email:', emailError);
      // Don't fail the signup if email fails
    }

    console.log('✅ Signup process completed successfully');

    // Return success response (without exposing verification code)
    const response = {
      message: 'Account created successfully! Please check your email for verification code.',
      email: email,
      userId: userId,
      requiresVerification: true
    };
    
    console.log('📤 Sending response:', response);
    
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('❌ Signup error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error occurred during signup',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
