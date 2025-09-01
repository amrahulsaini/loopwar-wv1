import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Database from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Verification API called (MySQL version)');
    
    // Health check for database
    const dbHealthy = await Database.healthCheck();
    if (!dbHealthy) {
      console.error('❌ Database connection failed');
      return NextResponse.json(
        { error: 'Database service unavailable' },
        { status: 503 }
      );
    }

    const { verificationCode, code, userId } = await request.json();
    console.log('📋 Received verification request');

    // Accept either 'code' or 'verificationCode' field
    const codeToVerify = verificationCode || code;

    // Validation
    if (!codeToVerify) {
      console.log('❌ Missing verification code');
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    // Validate code format
    if (!/^\d{6}$/.test(codeToVerify)) {
      console.log('❌ Invalid verification code format');
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    // Find user by verification code
    const user = await Database.queryOne(
      'SELECT * FROM users WHERE verification_code = ? AND verification_code_expires > NOW() AND is_verified = FALSE',
      [codeToVerify]
    ) as { id: number; username: string; email: string } | null;

    if (!user) {
      console.log('❌ Invalid or expired verification code');
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    console.log('✅ Valid verification code found for user:', user.username);

    // Verify the user
    const verificationSuccess = await Database.verifyUser(codeToVerify);
    
    if (!verificationSuccess) {
      console.log('❌ Failed to verify user');
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      );
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(64).toString('hex');
    
    // Get client information
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create session
    await Database.createSession(user.id, sessionToken, clientIP, userAgent);

    // Log verification activity
    await Database.logActivity(user.id, 'verify_email', clientIP, userAgent, {
      verificationCode: codeToVerify
    });

    // Skip notification creation to avoid charset issues temporarily
    console.log('⏭️ Skipping verification notification to avoid charset issues');

    console.log('✅ User verified successfully and saved to MySQL:', user.username);

    // Set response with cookies
    const response = NextResponse.json({
      message: 'Email verified successfully!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: true
      }
    }, { status: 200 });

    // Set secure cookies
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: false, // Allow client-side access for our middleware
      secure: isProduction,
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    };

    response.cookies.set('sessionToken', sessionToken, cookieOptions);
    response.cookies.set('username', user.username, cookieOptions);
    response.cookies.set('isVerified', 'true', cookieOptions);

    return response;

  } catch (error) {
    console.error('❌ Verification error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error occurred during verification',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
