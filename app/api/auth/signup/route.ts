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

// In-memory storage for development/demo (replace with real database in production)
// Note: This is a temporary solution for Vercel deployment
let users: User[] = [];
let verificationCodes: VerificationCodeData[] = [];

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || '903fd4002@smtp-brevo.com',
    pass: process.env.SMTP_PASS || '7rxfNbnRm1OCjUW2',
  },
});

// Simple storage functions (replace with database calls in production)
async function loadUsers(): Promise<User[]> {
  return users;
}

async function saveUsers(newUsers: User[]): Promise<void> {
  users = newUsers;
}

async function loadVerificationCodes(): Promise<VerificationCodeData[]> {
  return verificationCodes;
}

async function saveVerificationCodes(codes: VerificationCodeData[]): Promise<void> {
  verificationCodes = codes;
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
        
        <a href="https://loopwar.dev/verify" class="cta">Verify Account</a>
        
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

  await transporter.sendMail(mailOptions);
}

// Validation functions
function validateUsername(username: string): string | null {
  if (username.length < 3 || username.length > 20) {
    return 'Username must be between 3 and 20 characters';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
  }
  return null;
}

function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json();
    const { username, email, password, experienceLevel } = body;

    // Input validation
    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json({ message: usernameError }, { status: 400 });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json({ message: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    if (!experienceLevel) {
      return NextResponse.json({ message: 'Please select your experience level' }, { status: 400 });
    }

    // Load existing users
    const users = await loadUsers();

    // Check for duplicate username
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    // Check for duplicate email
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcryptjs.hash(password, saltRounds);

    // Generate verification code
    const verificationCode = crypto.getRandomValues(new Uint8Array(6)).reduce((acc: string, val: number) => acc + (val % 10).toString(), '');
    const verificationExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes

    // Generate session token
    const sessionToken = crypto.getRandomValues(new Uint8Array(32)).reduce((acc: string, val: number) => acc + val.toString(16).padStart(2, '0'), '');
    
    // Generate unique user ID
    const userId = crypto.getRandomValues(new Uint8Array(16)).reduce((acc: string, val: number) => acc + val.toString(16).padStart(2, '0'), '');

    // Create user
    const newUser: User = {
      id: userId,
      username,
      email: email.toLowerCase(),
      passwordHash,
      experienceLevel,
      isVerified: false,
      verificationCode,
      verificationExpiry,
      createdAt: Date.now(),
      lastLogin: null,
      sessionToken: sessionToken
    };

    // Save user
    await saveUsers([...users, newUser]);

    // Save verification code separately for security
    const verificationCodeData: VerificationCodeData = {
      userId: userId,
      code: verificationCode,
      expiry: verificationExpiry
    };
    
    const existingCodes = await loadVerificationCodes();
    existingCodes.push(verificationCodeData);
    await saveVerificationCodes(existingCodes);

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the signup if email fails, but log it
    }

    // Return success (don't include sensitive data)
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email for verification code.',
      userId: newUser.id,
      sessionToken: newUser.sessionToken
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
