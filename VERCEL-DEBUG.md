# Vercel Deployment Debugging Guide

## Changes Made to Fix Vercel Errors

### 1. Simplified Signup Route
I've created a simplified version of the signup route (`route-simple.ts`) that:
- Removes email functionality temporarily to isolate issues
- Adds extensive logging for debugging
- Uses more robust error handling
- Includes CORS headers

### 2. Error Tracking
The new route includes detailed logging that will appear in Vercel's function logs:
- Request parsing
- Validation steps
- User creation process
- Detailed error information

## How to Debug on Vercel

### 1. Check Function Logs
1. Go to your Vercel dashboard
2. Navigate to your project
3. Click on "Functions" tab
4. Look for logs from the `/api/auth/signup` function
5. Check for any error messages or console logs

### 2. Test the Simplified Version
The current deployed version:
- **Removes email sending** (potential source of errors)
- **Sets users as verified by default**
- **Adds detailed logging**

Try creating an account now and check if the basic functionality works.

### 3. Common Vercel Issues and Solutions

#### Issue: "Internal Server Error"
**Possible Causes:**
- Environment variables not set
- Module import issues
- Runtime errors

**Debug Steps:**
1. Check Vercel function logs
2. Verify all dependencies are in package.json
3. Check if environment variables are set

#### Issue: Email Sending Fails
**Possible Causes:**
- SMTP credentials not set in Vercel
- Nodemailer compatibility issues with Vercel's runtime
- Network restrictions

**Debug Steps:**
1. Check if SMTP environment variables are set in Vercel
2. Try the simplified version without email first

#### Issue: Data Not Persisting
**Expected Behavior:**
- Current version uses in-memory storage
- Data will reset between function invocations
- This is normal for the temporary fix

## Environment Variables to Set in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=verify@loopwar.dev
NODE_ENV=production
```

## Testing Steps

### 1. Test Basic Functionality
1. Try creating an account on your Vercel domain
2. Check if you get a success response
3. Note: Email won't be sent in the current simplified version

### 2. Check Logs
1. Go to Vercel dashboard
2. Check function logs for any errors
3. Look for console.log messages that show the execution flow

### 3. Test Different Scenarios
- Try with invalid email
- Try with weak password
- Try with duplicate username
- Try with missing fields

## Next Steps Based on Results

### If Basic Signup Works:
1. The issue was likely with email functionality
2. We can re-enable email with better error handling
3. Consider switching to a different email service

### If Signup Still Fails:
1. Check the specific error in Vercel logs
2. The issue might be with dependencies or runtime environment
3. May need to switch to a different approach (database, etc.)

## Current File Structure
```
app/api/auth/signup/
├── route.ts (current: simplified version)
├── route-simple.ts (backup of simplified version)
├── route-with-email.ts (backup with email functionality)
├── route-fixed.ts (fixed version with email)
└── route-kv.ts (Vercel KV version)
```

## Monitoring
After deployment, monitor:
1. Vercel function logs
2. Response times
3. Error rates
4. Network requests

Let me know what specific errors you see in the Vercel logs, and I can help debug further!
