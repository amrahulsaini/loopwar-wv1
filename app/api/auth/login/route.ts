import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { UserStorage, type User } from '../../../../lib/userStorage';

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
    console.log('Current users in memory:', UserStorage.getAll().length);
    
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
    
    // Find user by username using UserStorage
    const user = UserStorage.findByUsername(username);

    if (!user) {
      console.log('❌ User not found:', username);
      return NextResponse.json({ 
        message: 'Invalid username or password' 
      }, { status: 401 });
    }

    console.log('✅ User found:', user.username);

    // Verify password
    console.log('🔐 Verifying password...');
    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);

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
    user.sessionToken = sessionToken;
    user.lastLogin = Date.now();

    console.log('✅ Session token generated and user updated');

    const endTime = Date.now();
    console.log('⏱️ Request processed in:', endTime - startTime, 'ms');
    console.log('🎉 Login completed successfully for user:', username);

    // Return success with user data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        experienceLevel: user.experienceLevel,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      },
      sessionToken: sessionToken,
      rememberMe,
      debug: {
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime,
        totalUsers: UserStorage.getAll().length
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
  const allUsers = UserStorage.getAll();
  return NextResponse.json({
    message: 'Login API is working',
    timestamp: new Date().toISOString(),
    totalUsers: allUsers.length,
    users: allUsers.map(u => ({ 
      id: u.id, 
      username: u.username, 
      email: u.email, 
      isVerified: u.isVerified,
      lastLogin: u.lastLogin 
    }))
  });
}
