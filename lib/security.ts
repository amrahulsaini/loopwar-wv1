import { NextRequest, NextResponse } from 'next/server';
import Database from './database';
import crypto from 'crypto';

// Rate limiting configuration
const RATE_LIMITS = {
  '/api/auth/signup': { requests: 5, window: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  '/api/auth/login': { requests: 10, window: 15 * 60 * 1000 }, // 10 requests per 15 minutes
  '/api/auth/verify': { requests: 20, window: 60 * 60 * 1000 }, // 20 requests per hour
  default: { requests: 100, window: 60 * 60 * 1000 } // 100 requests per hour for other endpoints
};

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

export class SecurityService {
  // Get client IP address
  static getClientIP(request: NextRequest): string {
    const xForwardedFor = request.headers.get('x-forwarded-for');
    const xRealIP = request.headers.get('x-real-ip');
    const remoteAddr = request.headers.get('remote-addr');
    
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    if (xRealIP) {
      return xRealIP;
    }
    if (remoteAddr) {
      return remoteAddr;
    }
    return 'unknown';
  }

  // Check rate limits
  static async checkRateLimit(request: NextRequest): Promise<{ allowed: boolean; resetTime?: number }> {
    const ip = this.getClientIP(request);
    const endpoint = request.nextUrl.pathname;
    const limit = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
    
    try {
      // Get current rate limit data
      const rateLimitData = await Database.queryOne(
        'SELECT * FROM api_rate_limits WHERE ip_address = ? AND endpoint = ?',
        [ip, endpoint]
      ) as {
        request_count: number;
        window_start: string;
        blocked_until: string | null;
      } | null;

      const now = new Date();
      const windowStart = rateLimitData?.window_start ? new Date(rateLimitData.window_start) : now;
      const windowEnd = new Date(windowStart.getTime() + limit.window);

      // Check if we're still in the same window
      if (rateLimitData && now < windowEnd) {
        if (rateLimitData.request_count >= limit.requests) {
          // Check if still blocked
          if (rateLimitData.blocked_until && now < new Date(rateLimitData.blocked_until)) {
            return { allowed: false, resetTime: new Date(rateLimitData.blocked_until).getTime() };
          }
          
          // Block for 1 hour
          const blockUntil = new Date(now.getTime() + 60 * 60 * 1000);
          await Database.query(
            'UPDATE api_rate_limits SET blocked_until = ?, updated_at = NOW() WHERE ip_address = ? AND endpoint = ?',
            [blockUntil, ip, endpoint]
          );
          
          return { allowed: false, resetTime: blockUntil.getTime() };
        }

        // Increment counter
        await Database.query(
          'UPDATE api_rate_limits SET request_count = request_count + 1, updated_at = NOW() WHERE ip_address = ? AND endpoint = ?',
          [ip, endpoint]
        );
      } else {
        // New window or no existing record
        await Database.query(
          `INSERT INTO api_rate_limits (ip_address, endpoint, request_count, window_start) 
           VALUES (?, ?, 1, NOW()) 
           ON DUPLICATE KEY UPDATE request_count = 1, window_start = NOW(), blocked_until = NULL, updated_at = NOW()`,
          [ip, endpoint]
        );
      }

      return { allowed: true };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // On error, allow the request but log it
      return { allowed: true };
    }
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Validate CSRF token
  static validateCSRFToken(provided: string, expected: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'));
  }

  // Input validation and sanitization
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>'"&]/g, (char) => {
        const map: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return map[char];
      })
      .trim()
      .substring(0, 1000); // Limit length
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Validate username
  static validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  }

  // Validate password strength
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  // Create security headers response
  static createSecureResponse(data: unknown, status: number = 200): NextResponse {
    const response = NextResponse.json(data, { status });
    
    // Add security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Log security event
  static async logSecurityEvent(
    type: 'rate_limit_exceeded' | 'invalid_csrf' | 'suspicious_activity' | 'login_attempt',
    ip: string,
    endpoint: string,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await Database.query(
        `INSERT INTO user_activities (user_id, activity_type, ip_address, user_agent, details) 
         VALUES (0, ?, ?, ?, ?)`,
        [type, ip, 'security-system', JSON.stringify({ endpoint, ...details })]
      );
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export default SecurityService;
