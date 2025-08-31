import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Interfaces
interface VerificationRequest {
  userId: string;
  code: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  experienceLevel: string;
  isVerified: boolean;
  createdAt: number;
  lastLogin: number | null;
  sessionToken: string; // Added sessionToken to User interface
}

interface VerificationCodeData {
  userId: string;
  code: string;
  expiry: number;
}

// Utility functions
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function loadUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'users.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveUsers(users: User[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(
    path.join(process.cwd(), 'data', 'users.json'),
    JSON.stringify(users, null, 2)
  );
}

async function loadVerificationCodes(): Promise<VerificationCodeData[]> {
  try {
    const data = await fs.readFile(path.join(process.cwd(), 'data', 'verification-codes.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveVerificationCodes(codes: VerificationCodeData[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(
    path.join(process.cwd(), 'data', 'verification-codes.json'),
    JSON.stringify(codes, null, 2)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { message: 'User ID and verification code are required' },
        { status: 400 }
      );
    }

    // Load users and verification codes
    const users = await loadUsers();
    const verificationCodes = await loadVerificationCodes();

    // Find user
    const userIndex = users.findIndex((user: User) => user.id === userId);
    if (userIndex === -1) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[userIndex];

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Account is already verified' },
        { status: 400 }
      );
    }

    // Find verification code
    const codeIndex = verificationCodes.findIndex(verificationCode => verificationCode.userId === userId && verificationCode.code === code);
    
    if (codeIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      }, { status: 400 });
    }
    
    const codeData = verificationCodes[codeIndex];
    
    // Check if code has expired
    if (Date.now() > codeData.expiry) {
      // Remove expired code
      verificationCodes.splice(codeIndex, 1);
      await saveVerificationCodes(verificationCodes);
      
      return NextResponse.json({
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      }, { status: 400 });
    }

    // Check if code matches
    if (codeData.code !== code) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update user verification status
    users[userIndex].isVerified = true;
    users[userIndex].sessionToken = crypto.getRandomValues(new Uint8Array(32)).reduce((acc, val) => acc + val.toString(16).padStart(2, '0'), ''); // Generate new session token
    await saveUsers(users);

    // Remove verification code
    verificationCodes.splice(codeIndex, 1);
    await saveVerificationCodes(verificationCodes);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! Your account is now active.',
      sessionToken: users[userIndex].sessionToken
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
