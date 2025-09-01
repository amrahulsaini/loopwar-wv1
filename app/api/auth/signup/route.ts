import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  experienceLevel: string;
  isVerified: boolean;
  verificationCode: string;
  verificationExpiry: number;
  createdAt: number;
  lastLogin: number | null;
  sessionToken: string;
}

interface SignupRequest {
  username: string;
  email: string;
  password: string;
  experienceLevel: string;
}

interface VerificationCodeData {
  userId: string;
  code: string;
  expiry: number;
}

// Global storage shared across serverless functions
declare global {
  var globalUsers: User[] | undefined;
  var globalVerificationCodes: VerificationCodeData[] | undefined;
}

// Initialize global storage if not exists
if (!global.globalUsers) {
  global.globalUsers = [];
}
if (!global.globalVerificationCodes) {
  global.globalVerificationCodes = [];
}

const globalUsers = global.globalUsers;
const globalVerificationCodes = global.globalVerificationCodes;

// SMTP Configuration
let transporter: nodemailer.Transporter | null = null;

try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '903fd4002@smtp-brevo.com',
      pass: process.env.SMTP_PASS || '7rxfNbnRm1OCjUW2',
    },
    logger: false,
    debug: false,
  });
} catch (error) {
  console.error('Failed to create SMTP transporter:', error);
}

async function sendVerificationEmail(email: string, code: string) {
  const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your LoopWar Account</title>
    <style>
        body {
            font-family: 'Sora', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 2rem;
            font-weight: 800;
            color: #000;
            margin-bottom: 10px;
        }
        .title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #000;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            font-size: 1.1rem;
        }
        .verification-code {
            background-color: #f0f0f0;
            border: 2px solid #000;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: 4px;
            color: #000;
        }
        .instructions {
            background-color: #f8f9fa;
            border-left: 4px solid #000;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9rem;
        }
        .cta {
            background-color: #000;
            color: #fff;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">L</div>
            <h1 class="title">Welcome to LoopWar!</h1>
            <p class="subtitle">Your AI-powered coding journey begins now</p>
        </div>

        <p>Hi there,</p>

        <p>Thank you for joining LoopWar! To complete your account setup and start your coding adventure, please verify your email address.</p>
        
        <div class="verification-code">
            ${code}
        </div>
        
        <div class="instructions">
            <strong>How to verify:</strong>
            <ol>
                <li>Copy the verification code above</li>
                <li>Go back to LoopWar and enter the code</li>
                <li>Start your coding journey!</li>
            </ol>
        </div>
        
        <p>This verification code will expire in 15 minutes for security reasons.</p>
        
        <div class="footer">
            <p>If you didn't create this account, please ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} LoopWar.dev. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

  const mailOptions = {
    from: process.env.SMTP_FROM || 'verify@loopwar.dev',
    to: email,
    subject: 'Verify Your LoopWar Account - Start Your Coding Journey!',
    html: emailTemplate,
  };

  if (!transporter) {
    throw new Error('SMTP transporter not configured');
  }

  await transporter.sendMail(mailOptions);
}

// Validation functions
function validateUsername(username: string): string | null {
  if (!username || username.length < 3 || username.length > 20) {
    return 'Username must be between 3 and 20 characters';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
  }
  return null;
}

function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('=== VERCEL FIXED SIGNUP API - NO FILE SYSTEM ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Current users in memory:', globalUsers.length);
    
    // Parse request body
    let body: SignupRequest;
    try {
      body = await request.json();
      console.log('✅ Request body parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { username, email, password, experienceLevel } = body;
    console.log('📝 Signup request:', { 
      username, 
      email, 
      experienceLevel,
      hasPassword: !!password 
    });

    // Input validation
    console.log('🔍 Starting validation...');
    
    const usernameError = validateUsername(username);
    if (usernameError) {
      console.log('❌ Username validation failed:', usernameError);
      return NextResponse.json({ message: usernameError }, { status: 400 });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      console.log('❌ Email validation failed:', emailError);
      return NextResponse.json({ message: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      console.log('❌ Password validation failed:', passwordError);
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    if (!experienceLevel) {
      console.log('❌ Experience level not provided');
      return NextResponse.json({ message: 'Please select your experience level' }, { status: 400 });
    }

    console.log('✅ All validations passed');

    // Check for duplicates in global array
    console.log('🔍 Checking for duplicates...');
    
    const existingUserByUsername = globalUsers.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
    
    if (existingUserByUsername) {
      console.log('❌ Username already exists:', username);
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    const existingUserByEmail = globalUsers.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUserByEmail) {
      console.log('❌ Email already registered:', email);
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    console.log('✅ No duplicates found');

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const passwordHash = await bcryptjs.hash(password, saltRounds);
    console.log('✅ Password hashed successfully');

    // Generate verification code and tokens
    console.log('🎲 Generating tokens...');
    
    const verificationCode = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(val => (val % 10).toString())
      .join('');
    
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(val => val.toString(16).padStart(2, '0'))
      .join('');
    
    const userId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(val => val.toString(16).padStart(2, '0'))
      .join('');

    console.log('✅ Generated tokens successfully');

    // Create user object
    const newUser: User = {
      id: userId,
      username,
      email: email.toLowerCase(),
      passwordHash,
      experienceLevel,
      isVerified: false, // Require verification
      verificationCode,
      verificationExpiry: Date.now() + (15 * 60 * 1000),
      createdAt: Date.now(),
      lastLogin: null,
      sessionToken
    };

    // Save user to global array (NO FILE SYSTEM OPERATIONS)
    console.log('💾 Saving user to memory...');
    globalUsers.push(newUser);
    
    // Save verification code separately
    const verificationCodeData: VerificationCodeData = {
      userId: userId,
      code: verificationCode,
      expiry: Date.now() + (15 * 60 * 1000)
    };
    globalVerificationCodes.push(verificationCodeData);
    
    console.log('✅ User saved successfully. Total users:', globalUsers.length);
    console.log('✅ Verification code saved. Total codes:', globalVerificationCodes.length);

    // Send verification email
    try {
      console.log('📧 Sending verification email...');
      await sendVerificationEmail(email, verificationCode);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Continue with signup even if email fails, but log the error
    }

    const endTime = Date.now();
    console.log('⏱️ Request processed in:', endTime - startTime, 'ms');
    console.log('🎉 Signup completed successfully for user:', username);

    // Return success (DO NOT include verification code in response)
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email for the verification code.',
      userId: newUser.id,
      sessionToken: newUser.sessionToken,
      requiresVerification: true,
      debug: {
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime,
        totalUsers: globalUsers.length,
        totalCodes: globalVerificationCodes.length
      }
    }, { status: 201 });

  } catch (error) {
    const endTime = Date.now();
    console.error('💥 === SIGNUP ERROR ===');
    console.error('⏱️ Error occurred at:', endTime - startTime, 'ms');
    console.error('🔍 Error type:', typeof error);
    console.error('📝 Error details:', error);
    
    if (error instanceof Error) {
      console.error('📄 Error message:', error.message);
      console.error('📚 Error stack:', error.stack);
    }
    
    return NextResponse.json({
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? String(error) : 'Server error',
      debug: {
        processingTime: endTime - startTime,
        errorType: typeof error
      }
    }, { status: 500 });
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS(request: NextRequest) {
  console.log('OPTIONS request received for signup');
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Add GET handler for debugging
export async function GET() {
  return NextResponse.json({
    message: 'Signup API is working',
    timestamp: new Date().toISOString(),
    totalUsers: globalUsers.length,
    users: globalUsers.map(u => ({ 
      id: u.id, 
      username: u.username, 
      email: u.email, 
      isVerified: u.isVerified 
    }))
  });
}
