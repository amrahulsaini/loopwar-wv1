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

// In-memory storage for development/demo (replace with real database in production)
let users: User[] = [];

// Simple storage functions
async function loadUsers(): Promise<User[]> {
  return users;
}

async function saveUsers(newUsers: User[]): Promise<void> {
  users = newUsers;
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
  try {
    console.log('=== SIGNUP API CALLED ===');
    
    // Parse request body
    let body: SignupRequest;
    try {
      body = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { username, email, password, experienceLevel } = body;
    console.log('Signup data:', { username, email, experienceLevel });

    // Input validation
    const usernameError = validateUsername(username);
    if (usernameError) {
      console.log('Username validation failed:', usernameError);
      return NextResponse.json({ message: usernameError }, { status: 400 });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      console.log('Email validation failed:', emailError);
      return NextResponse.json({ message: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      console.log('Password validation failed:', passwordError);
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    if (!experienceLevel) {
      console.log('Experience level not provided');
      return NextResponse.json({ message: 'Please select your experience level' }, { status: 400 });
    }

    console.log('All validations passed');

    // Load existing users
    const existingUsers = await loadUsers();
    console.log('Current users count:', existingUsers.length);

    // Check for duplicates
    if (existingUsers.some(user => user.username.toLowerCase() === username.toLowerCase())) {
      console.log('Username already exists:', username);
      return NextResponse.json({ message: 'Username already exists' }, { status: 409 });
    }

    if (existingUsers.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      console.log('Email already registered:', email);
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    console.log('No duplicates found');

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcryptjs.hash(password, saltRounds);
    console.log('Password hashed');

    // Generate verification code and tokens
    const verificationCode = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(val => (val % 10).toString())
      .join('');
    
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(val => val.toString(16).padStart(2, '0'))
      .join('');
    
    const userId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(val => val.toString(16).padStart(2, '0'))
      .join('');

    console.log('Generated IDs and tokens');

    // Create user
    const newUser: User = {
      id: userId,
      username,
      email: email.toLowerCase(),
      passwordHash,
      experienceLevel,
      isVerified: false, // Set to true for now since we're not sending emails
      verificationCode,
      verificationExpiry: Date.now() + (15 * 60 * 1000),
      createdAt: Date.now(),
      lastLogin: null,
      sessionToken
    };

    // Save user
    await saveUsers([...existingUsers, newUser]);
    console.log('User saved successfully');

    // Return success
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now log in.',
      userId: newUser.id,
      sessionToken: newUser.sessionToken
    }, { status: 201 });

  } catch (error) {
    console.error('=== SIGNUP ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Server error'
      },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
