import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Types (same as signup route)
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

interface VerificationRequest {
  userId: string;
  code: string;
}

interface VerificationCodeData {
  userId: string;
  code: string;
  expiry: number;
}

// Global storage (shared with signup route)
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

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('=== VERIFICATION API CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Current users:', globalUsers.length);
    console.log('Current verification codes:', globalVerificationCodes.length);
    
    // Parse request body
    let body: VerificationRequest;
    try {
      body = await request.json();
      console.log('✅ Request body parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { userId, code } = body;
    console.log('📝 Verification request:', { userId, codeLength: code?.length });

    // Validation
    if (!userId) {
      console.log('❌ User ID not provided');
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    if (!code || code.length !== 6) {
      console.log('❌ Invalid verification code');
      return NextResponse.json({ message: 'Please enter a valid 6-digit verification code' }, { status: 400 });
    }

    console.log('✅ Basic validation passed');

    // Find user
    const userIndex = globalUsers.findIndex(user => user.id === userId);
    if (userIndex === -1) {
      console.log('❌ User not found:', userId);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const user = globalUsers[userIndex];
    console.log('✅ User found:', user.username);

    // Check if already verified
    if (user.isVerified) {
      console.log('ℹ️ User already verified');
      return NextResponse.json({
        success: true,
        message: 'Account already verified',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          sessionToken: user.sessionToken
        }
      });
    }

    // Check verification code
    if (user.verificationCode !== code) {
      console.log('❌ Invalid verification code provided');
      return NextResponse.json({ message: 'Invalid verification code' }, { status: 400 });
    }

    // Check if code expired
    if (Date.now() > user.verificationExpiry) {
      console.log('❌ Verification code expired');
      return NextResponse.json({ message: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    console.log('✅ Verification code valid');

    // Mark user as verified
    user.isVerified = true;
    user.lastLogin = Date.now();
    
    // Generate new session token for security
    user.sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(val => val.toString(16).padStart(2, '0'))
      .join('');

    // Update user in global array
    globalUsers[userIndex] = user;
    
    // Remove verification code from global codes array
    const codeIndex = globalVerificationCodes.findIndex(vc => vc.userId === userId);
    if (codeIndex !== -1) {
      globalVerificationCodes.splice(codeIndex, 1);
    }

    console.log('✅ User verified successfully');

    const endTime = Date.now();
    console.log('⏱️ Verification processed in:', endTime - startTime, 'ms');
    console.log('🎉 Verification completed for user:', user.username);

    // Return success with user data for cookies
    return NextResponse.json({
      success: true,
      message: 'Account verified successfully! Welcome to LoopWar.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        experienceLevel: user.experienceLevel,
        isVerified: user.isVerified,
        sessionToken: user.sessionToken
      },
      debug: {
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime
      }
    });

  } catch (error) {
    const endTime = Date.now();
    console.error('💥 === VERIFICATION ERROR ===');
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
  console.log('OPTIONS request received for verification');
  
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
    message: 'Verification API is working',
    timestamp: new Date().toISOString(),
    totalUsers: globalUsers.length,
    totalCodes: globalVerificationCodes.length,
    verifiedUsers: globalUsers.filter(u => u.isVerified).length,
    unverifiedUsers: globalUsers.filter(u => !u.isVerified).length
  });
}
