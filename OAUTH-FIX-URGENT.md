# 🚨 URGENT: OAuth Configuration Fix Required

## Issues Found:
1. **Google OAuth Error**: "doesn't comply with Google's OAuth 2.0 policy"
2. **GitHub OAuth Error**: "404 not found"

## Root Cause:
The redirect URIs in your OAuth apps don't match the actual callback URLs being used.

---

## ✅ FIXES NEEDED:

### 1. Google Cloud Console Updates

**Go to**: https://console.cloud.google.com/
**Navigate to**: APIs & Services > Credentials > Your OAuth 2.0 Client

**Update Authorized Redirect URIs to**:
```
https://loopwar.dev/api/auth/oauth?provider=google&action=callback
http://localhost:3000/api/auth/oauth?provider=google&action=callback
```

**Update Authorized JavaScript Origins to**:
```
https://loopwar.dev
http://localhost:3000
```

### 2. GitHub OAuth App Updates

**Go to**: https://github.com/settings/developers
**Select your OAuth App**: LoopWar
**Update Authorization callback URL to**:
```
https://loopwar.dev/api/auth/oauth?provider=github&action=callback
```

**Update Homepage URL to**:
```
https://loopwar.dev
```

---

## 🔧 WHAT I FIXED IN THE CODE:

### OAuth Route Updates (`app/api/auth/oauth/route.ts`):
- ✅ Fixed redirect URI construction to be consistent
- ✅ Removed dependency on `OAUTH_REDIRECT_URL` environment variable
- ✅ Ensured URLs match the format: `{baseUrl}/api/auth/oauth?provider={provider}&action=callback`
- ✅ Fixed both Google and GitHub token exchange requests

### Key Changes:
```typescript
// Before (inconsistent):
const redirectUri = encodeURIComponent(process.env.OAUTH_REDIRECT_URL || (process.env.NEXTAUTH_URL + '/api/auth/oauth?provider=google&action=callback'));

// After (consistent):
const baseUrl = process.env.NEXTAUTH_URL || 'https://loopwar.dev';
const redirectUri = `${baseUrl}/api/auth/oauth?provider=google&action=callback`;
```

---

## 🚀 DEPLOYMENT STEPS:

### 1. Update OAuth Apps (CRITICAL):
- Update Google Cloud Console redirect URIs
- Update GitHub OAuth app callback URL

### 2. Deploy Code Changes:
```bash
# On your server:
cd /home/loopwar.dev/public_html/loopwar-wv1
git pull origin main
npm run build
pm2 restart loopwar  # or your restart command
```

### 3. Test OAuth Flow:
- Visit https://loopwar.dev/join
- Try "Join with Google" - should work
- Try "Join with GitHub" - should work

---

## 📋 CHECKLIST:

- [ ] Update Google Cloud Console redirect URIs
- [ ] Update GitHub OAuth app callback URL  
- [ ] Pull latest code changes on server
- [ ] Rebuild and restart application
- [ ] Test Google OAuth sign-in
- [ ] Test GitHub OAuth sign-in
- [ ] Verify user creation in database

---

## 🆘 IF STILL NOT WORKING:

1. **Check environment variables** on server:
   ```bash
   cat .env.local | grep -E "(GOOGLE|GITHUB)"
   ```

2. **Check OAuth app settings** match exactly:
   - Google: `https://loopwar.dev/api/auth/oauth?provider=google&action=callback`
   - GitHub: `https://loopwar.dev/api/auth/oauth?provider=github&action=callback`

3. **Check browser developer tools** for any console errors

4. **Verify database schema** has OAuth fields:
   ```sql
   DESCRIBE users;
   ```

The main issue was **mismatched redirect URIs** between OAuth apps and the actual callback URLs. Once you update the OAuth app settings, everything should work! 🎯
