import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { Database } from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';

interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface DatabaseUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  experience_level: string;
  is_verified: boolean;
  created_at: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('=== LOGIN API CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // Security checks
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Rate limiting check
    const rateLimit = await SecurityService.checkRateLimit(request);
    if (!rateLimit.allowed) {
      console.log('🚫 Rate limit exceeded for IP:', clientIP);
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Health check for database
    const dbHealthy = await Database.healthCheck();
    if (!dbHealthy) {
      console.error('❌ Database connection failed');
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }
    
    // Parse request body
    let body: LoginRequest;
    try {
      body = await request.json();
      console.log('✅ Request body parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { username, password, rememberMe = false } = body;
    console.log('📝 Login request:', { 
      username, 
      hasPassword: !!password,
      rememberMe 
    });

    // Input validation using SecurityService
    if (!SecurityService.validateUsername(username)) {
      console.log('❌ Invalid username format');
      return NextResponse.json(
        { error: 'Invalid username format' },
        { status: 400 }
      );
    }

    const passwordValidation = SecurityService.validatePassword(password);
    if (!passwordValidation.valid) {
      console.log('❌ Password validation failed:', passwordValidation.errors);
      return NextResponse.json(
        { error: 'Invalid password format', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedUsername = SecurityService.sanitizeInput(username);
    const sanitizedPassword = SecurityService.sanitizeInput(password);

    // Legacy check for backwards compatibility
    if (!sanitizedUsername || !sanitizedPassword) {
      console.log('❌ Missing username or password after sanitization');
      return NextResponse.json({ 
        message: 'Username and password are required' 
      }, { status: 400 });
    }

    console.log('🔍 Searching for user...');
    
    // Find user by username using Database with sanitized input
    const user = await Database.findUserByUsername(sanitizedUsername) as DatabaseUser | null;

    if (!user) {
      console.log('❌ User not found:', sanitizedUsername);
      return NextResponse.json({ 
        message: 'Invalid username or password' 
      }, { status: 401 });
    }

    console.log('✅ User found:', user.username);

    // Verify password
    console.log('🔐 Verifying password...');
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);

    if (!passwordMatch) {
      console.log('❌ Password verification failed');
      return NextResponse.json({ 
        message: 'Invalid username or password' 
      }, { status: 401 });
    }

    console.log('✅ Password verified successfully');

    // Generate new session token
    console.log('🎲 Generating new session token...');
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(val => val.toString(16).padStart(2, '0'))
      .join('');

    // Update user's session token and last login
    const sessionDuration = rememberMe ? 30 : 7; // 30 days if remember me, otherwise 7 days
    await Database.createSession(user.id, sessionToken, clientIP, userAgent, sessionDuration);

    // Log successful login activity
    await Database.logActivity(user.id, 'login', clientIP, userAgent, {
      username: user.username,
      success: true,
      sessionToken: sessionToken.substring(0, 8) + '...' // Log partial token for debugging
    });

    console.log('✅ Session token generated and user updated');

    const endTime = Date.now();
    console.log('⏱️ Request processed in:', endTime - startTime, 'ms');
    console.log('🎉 Login completed successfully for user:', sanitizedUsername);

    // Return success with user data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        experienceLevel: user.experience_level || 'beginner',
        isVerified: user.is_verified,
        createdAt: user.created_at,
        lastLogin: new Date().toISOString()
      },
      sessionToken: sessionToken,
      rememberMe,
      debug: {
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime
      }
    }, { status: 200 });

  } catch (error) {
    const endTime = Date.now();
    console.error('💥 === LOGIN ERROR ===');
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
export async function OPTIONS() {
  console.log('OPTIONS request received for login');
  
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
  try {
    const allUsers = await Database.query('SELECT id, username, email, is_verified, created_at FROM users');
    return NextResponse.json({
      message: 'Login API is working',
      timestamp: new Date().toISOString(),
      totalUsers: Array.isArray(allUsers) ? allUsers.length : 0,
      users: Array.isArray(allUsers) ? allUsers.slice(0, 10) : [] // Limit to 10 for debugging
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Login API is working but database error',
      timestamp: new Date().toISOString(),
      error: String(error)
    });
  }
}
