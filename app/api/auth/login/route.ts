import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import Database from '../../../../lib/database';

interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('=== LOGIN API CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    
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

    // Input validation
    if (!username || !password) {
      console.log('❌ Missing username or password');
      return NextResponse.json({ 
        message: 'Username and password are required' 
      }, { status: 400 });
    }

    console.log('🔍 Searching for user...');
    
    // Find user by username using Database
    const user = await Database.findUserByUsername(username);

    if (!user) {
      console.log('❌ User not found:', username);
      return NextResponse.json({ 
        message: 'Invalid username or password' 
      }, { status: 401 });
    }

    console.log('✅ User found:', (user as any).username);

    // Verify password
    console.log('🔐 Verifying password...');
    const passwordMatch = await bcryptjs.compare(password, (user as any).password_hash);

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
    await Database.createSession((user as any).id, sessionToken);

    console.log('✅ Session token generated and user updated');

    const endTime = Date.now();
    console.log('⏱️ Request processed in:', endTime - startTime, 'ms');
    console.log('🎉 Login completed successfully for user:', username);

    // Return success with user data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: (user as any).id,
        username: (user as any).username,
        email: (user as any).email,
        experienceLevel: (user as any).experience_level || 'beginner',
        isVerified: (user as any).is_verified,
        createdAt: (user as any).created_at,
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
