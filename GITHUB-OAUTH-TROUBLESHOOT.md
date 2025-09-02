# 🔍 GitHub OAuth Troubleshooting Guide

## Problem: GitHub OAuth shows "404 not found" after login

## Root Cause:
Your GitHub OAuth app's callback URL doesn't match the actual callback URL being sent.

## ✅ IMMEDIATE FIX:

### 1. Check Your GitHub OAuth App Settings
1. Go to: https://github.com/settings/developers
2. Click on your LoopWar OAuth app
3. Verify these settings:

**Homepage URL should be:**
```
https://loopwar.dev
```

**Authorization callback URL should be EXACTLY:**
```
https://loopwar.dev/api/auth/oauth?provider=github&action=callback
```

### 2. Common Mistakes to Avoid:
❌ **Wrong**: `https://loopwar.dev/api/auth/oauth`
❌ **Wrong**: `https://loopwar.dev/api/auth/oauth/callback`  
❌ **Wrong**: `https://loopwar.dev/auth/github/callback`
✅ **Correct**: `https://loopwar.dev/api/auth/oauth?provider=github&action=callback`

### 3. URL Structure Explanation:
- **Base URL**: `https://loopwar.dev`
- **OAuth Route**: `/api/auth/oauth`
- **Provider Parameter**: `?provider=github`
- **Action Parameter**: `&action=callback`

## 🧪 Testing Steps:

### 1. Debug the OAuth Flow:
1. Clear your browser cookies for `loopwar.dev`
2. Go to: https://loopwar.dev/join
3. Click "Join with GitHub"
4. Complete GitHub login
5. Check if you're redirected properly

### 2. If Still 404:
- Double-check the exact callback URL in GitHub settings
- Make sure there are no extra spaces or characters
- Save the GitHub OAuth app settings
- Wait 1-2 minutes for changes to propagate

### 3. Environment Variables:
Ensure your production server has:
```env
GITHUB_CLIENT_ID=your_actual_client_id
GITHUB_CLIENT_SECRET=your_actual_client_secret
NEXTAUTH_URL=https://loopwar.dev
```

## 🎯 Expected Flow:
1. User clicks "Join with GitHub" → redirects to GitHub
2. User logs in/authorizes on GitHub → GitHub redirects to callback
3. Callback processes GitHub response → creates/logs in user
4. User redirected to main app with session cookies

## 📞 If Still Having Issues:
1. Check PM2 logs: `pm2 logs loopwar`
2. Look for any OAuth-related errors
3. Verify database migration was applied correctly
4. Test Google OAuth to confirm it's working

---
*This guide helps fix the GitHub OAuth 404 error by ensuring callback URL alignment.*
