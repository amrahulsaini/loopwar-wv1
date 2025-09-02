import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Database } from '../../../../lib/database';
import { SecurityService } from '../../../../lib/security';
import { EmailService } from '../../../../lib/email-service';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Signup API called');
    
    // Security: Check rate limiting
    const rateLimit = await SecurityService.checkRateLimit(request);
    if (!rateLimit.allowed) {
      await SecurityService.logSecurityEvent(
        'rate_limit_exceeded',
        SecurityService.getClientIP(request),
        '/api/auth/signup'
      );
      
      return SecurityService.createSecureResponse(
        { 
          error: 'Too many requests. Please try again later.',
          resetTime: rateLimit.resetTime 
        },
        429
      );
    }
    
    // Health check for database
    const dbHealthy = await Database.healthCheck();
    if (!dbHealthy) {
      console.error('❌ Database connection failed');
      return SecurityService.createSecureResponse(
        { error: 'Database service unavailable' },
        503
      );
    }

    const { username, email, password } = await request.json();
    console.log('📋 Received signup data:', { username, email });

    // Security: Input validation and sanitization
    if (!username || !email || !password) {
      console.log('❌ Missing required fields');
      return SecurityService.createSecureResponse(
        { error: 'Username, email, and password are required' },
        400
      );
    }

    // Sanitize inputs
    const sanitizedUsername = SecurityService.sanitizeInput(username);
    const sanitizedEmail = SecurityService.sanitizeInput(email);

    // Enhanced validation
    if (!SecurityService.validateEmail(sanitizedEmail)) {
      console.log('❌ Invalid email format');
      return SecurityService.createSecureResponse(
        { error: 'Invalid email format' },
        400
      );
    }

    if (!SecurityService.validateUsername(sanitizedUsername)) {
      console.log('❌ Invalid username format');
      return SecurityService.createSecureResponse(
        { error: 'Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores' },
        400
      );
    }

    // Enhanced password validation
    const passwordValidation = SecurityService.validatePassword(password);
    if (!passwordValidation.valid) {
      console.log('❌ Password validation failed');
      return SecurityService.createSecureResponse(
        { error: 'Password requirements not met', details: passwordValidation.errors },
        400
      );
    }

    // Check if user already exists
    const existingUserByEmail = await Database.findUserByEmail(sanitizedEmail);
    if (existingUserByEmail) {
      console.log('❌ User already exists with this email');
      return SecurityService.createSecureResponse(
        { error: 'User already exists with this email' },
        409
      );
    }

    const existingUserByUsername = await Database.findUserByUsername(sanitizedUsername);
    if (existingUserByUsername) {
      console.log('❌ Username already taken');
      return SecurityService.createSecureResponse(
        { error: 'Username already taken' },
        409
      );
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Generated verification code for', sanitizedEmail);

    // Hash password with higher salt rounds
    const saltRounds = 14;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('🔐 Password hashed successfully');

    // Create user in database
    const userId = await Database.createUser({
      username: sanitizedUsername,
      email: sanitizedEmail,
      passwordHash,
      verificationCode
    });

    console.log('✅ User created with ID:', userId);

    // Log registration activity with enhanced details
    const clientIP = SecurityService.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await Database.logActivity(userId, 'register', clientIP, userAgent, {
      email: sanitizedEmail,
      username: sanitizedUsername,
      registrationMethod: 'standard'
    });

    // Send verification email using EmailService
    await EmailService.sendVerificationEmail(
      userId,
      sanitizedEmail,
      sanitizedUsername,
      verificationCode
    );

    console.log('📧 Verification email queued for', sanitizedEmail);

    // Store cookie consent (default settings)
    await Database.storeCookieConsent(
      userId,
      clientIP,
      false, // User hasn't consented yet
      { necessary: true, analytics: false, marketing: false },
      userAgent
    );

    console.log('✅ Registration completed successfully');

    return SecurityService.createSecureResponse({
      success: true,
      message: 'Account created successfully! Please check your email for verification code.',
      userId: userId,
      email: sanitizedEmail,
      nextStep: 'email_verification'
    }, 201);

    // Send verification email using EmailService
    try {
      await EmailService.sendVerificationEmail(userId, sanitizedEmail, username, verificationCode);
      console.log('📧 Verification email queued successfully');
    } catch (emailError) {
      console.error('📧 Failed to queue verification email:', emailError);
      // Don't fail the signup if email fails
    }

    console.log('✅ Signup process completed successfully');

    // Return success response (without exposing verification code)
    const response = {
      message: 'Account created successfully! Please check your email for verification code.',
      email: email,
      userId: userId,
      requiresVerification: true
    };
    
    console.log('📤 Sending response:', response);
    
    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('❌ Signup error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error occurred during signup',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}
