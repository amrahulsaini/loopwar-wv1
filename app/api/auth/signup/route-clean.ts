import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
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

// Global in-memory storage - this will persist for the lifetime of the serverless function
// Note: Data will be lost when the function cold starts, but this is for testing only
const globalUsers: User[] = [];

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
      isVerified: true, // Auto-verify for testing
      verificationCode,
      verificationExpiry: Date.now() + (15 * 60 * 1000),
      createdAt: Date.now(),
      lastLogin: null,
      sessionToken
    };

    // Save user to global array (NO FILE SYSTEM OPERATIONS)
    console.log('💾 Saving user to memory...');
    globalUsers.push(newUser);
    console.log('✅ User saved successfully. Total users:', globalUsers.length);

    const endTime = Date.now();
    console.log('⏱️ Request processed in:', endTime - startTime, 'ms');
    console.log('🎉 Signup completed successfully for user:', username);

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      userId: newUser.id,
      sessionToken: newUser.sessionToken,
      debug: {
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime,
        totalUsers: globalUsers.length
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
