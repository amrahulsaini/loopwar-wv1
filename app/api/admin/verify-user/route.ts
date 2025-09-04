import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = SecurityService.authenticateUser(request);
    if (!auth.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // Check if user exists
    const user = await Database.findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userRecord = user as { id: number; username: string; email: string; is_verified: boolean };

    if (userRecord.is_verified) {
      return NextResponse.json({ 
        message: `User '${username}' is already verified`,
        user: userRecord
      });
    }

    // Verify the user using the same method as email verification
    const verificationSuccess = await Database.query(
      'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_code_expires = NULL WHERE username = ?',
      [username]
    ) as { affectedRows: number };

    if (verificationSuccess.affectedRows > 0) {
      return NextResponse.json({ 
        message: `User '${username}' has been verified successfully`,
        success: true
      });
    } else {
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
