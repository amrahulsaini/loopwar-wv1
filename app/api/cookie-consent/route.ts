import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../lib/database';
import { SecurityService } from '../../../lib/security';

export async function POST(request: NextRequest) {
  try {
    console.log('🍪 Cookie consent API called');
    
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
        { error: 'Too many requests. Please try again later.' },
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
    const body = await request.json();
    const { 
      necessary = true, 
      analytics = false, 
      marketing = false, 
      preferences = false,
      action = 'unknown'
    } = body;

    // Get session token from Authorization header
    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');

    let userId = null;
    
    // If session token provided, validate it and get user ID
    if (sessionToken) {
      try {
        const session = await Database.queryOne(
          'SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW()',
          [sessionToken]
        ) as { user_id: number } | null;
        
        if (session) {
          userId = session.user_id;
        }
      } catch (error) {
        console.error('Error validating session:', error);
        // Continue without user ID - still save anonymous consent
      }
    }

    // Store cookie consent
    await Database.storeCookieConsent(
      userId,
      clientIP,
      true, // consent was given (user made a choice)
      {
        necessary,
        analytics,
        marketing,
        preferences
      },
      userAgent,
      action
    );

    console.log('✅ Cookie consent saved successfully');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Cookie preferences saved successfully',
      preferences: {
        necessary,
        analytics,
        marketing,
        preferences
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error('💥 Cookie consent API error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to save cookie preferences',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🍪 Cookie consent GET API called');
    
    // Get session token from Authorization header
    const authHeader = request.headers.get('authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token required' },
        { status: 401 }
      );
    }

    // Validate session and get user ID
    const session = await Database.queryOne(
      'SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    ) as { user_id: number } | null;

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Get user's cookie preferences
    const cookieConsent = await Database.queryOne(
      'SELECT * FROM cookie_consents WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [session.user_id]
    ) as {
      necessary: boolean;
      analytics: boolean;
      marketing: boolean;
      preferences: boolean;
      created_at: string;
      action: string;
    } | null;

    if (!cookieConsent) {
      return NextResponse.json({
        preferences: {
          necessary: true,
          analytics: false,
          marketing: false,
          preferences: false
        },
        hasConsent: false
      });
    }

    return NextResponse.json({
      preferences: {
        necessary: cookieConsent.necessary,
        analytics: cookieConsent.analytics,
        marketing: cookieConsent.marketing,
        preferences: cookieConsent.preferences
      },
      hasConsent: true,
      consentDate: cookieConsent.created_at,
      action: cookieConsent.action
    });

  } catch (error) {
    console.error('💥 Cookie consent GET API error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      message: 'Failed to retrieve cookie preferences'
    }, { status: 500 });
  }
}
