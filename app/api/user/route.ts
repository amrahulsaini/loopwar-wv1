import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get user info from cookies (no database call needed for basic info)
    const cookies = request.headers.get('cookie') || '';
    const sessionToken = cookies.split(';')
      .find(c => c.trim().startsWith('sessionToken='))
      ?.split('=')[1];
    
    const username = cookies.split(';')
      .find(c => c.trim().startsWith('username='))
      ?.split('=')[1];
    
    if (!sessionToken || !username) {
      return NextResponse.json(
        { error: 'No active session' }, 
        { status: 401 }
      );
    }

    // Return user info from cookies (avoiding database SSL issues)
    return NextResponse.json({ 
      username: decodeURIComponent(username),
      authenticated: true 
    });
    
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' }, 
      { status: 500 }
    );
  }
}
