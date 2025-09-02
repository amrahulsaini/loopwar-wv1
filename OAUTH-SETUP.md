# OAuth Setup Guide for LoopWar

This guide explains how to set up Google and GitHub OAuth for your LoopWar application.

## Required Environment Variables

Add these to your `.env.local` file (for development) or to your hosting platform's environment variables (for production):

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth  
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional: Custom redirect URL
OAUTH_REDIRECT_URL=https://yourdomain.com/api/auth/oauth
```

## Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"

4. **Configure OAuth Settings**
   - **Application name**: LoopWar
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://yourdomain.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/oauth?provider=google&action=callback
     https://yourdomain.com/api/auth/oauth?provider=google&action=callback
     ```

5. **Copy Credentials**
   - Copy the `Client ID` and `Client Secret`
   - Add them to your environment variables

## GitHub OAuth Setup

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/applications/new
   - Or go to Settings > Developer settings > OAuth Apps > New OAuth App

2. **Create New OAuth App**
   - **Application name**: LoopWar
   - **Homepage URL**: `https://yourdomain.com` (or `http://localhost:3000` for development)
   - **Authorization callback URL**: 
     ```
     https://yourdomain.com/api/auth/oauth?provider=github&action=callback
     ```
     (For development: `http://localhost:3000/api/auth/oauth?provider=github&action=callback`)

3. **Copy Credentials**
   - Copy the `Client ID` and `Client Secret`
   - Add them to your environment variables

## Database Schema

The OAuth functionality uses these database fields in the `users` table:

```sql
oauth_provider VARCHAR(50) NULL,
oauth_id VARCHAR(255) NULL,
profile_picture VARCHAR(255) NULL
```

These are already included in your schema.sql file.

## Testing OAuth

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit the join or login page**:
   - Go to `http://localhost:3000/join` or `http://localhost:3000/login`
   - Click on "Join with Google" or "Join with GitHub" buttons
   - You should be redirected to the respective OAuth provider

3. **Verify in database**:
   - After successful OAuth login, check your `users` table
   - You should see new entries with `oauth_provider`, `oauth_id`, and `profile_picture` fields populated

## Production Deployment

### Vercel Environment Variables

Add these to your Vercel project settings:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each OAuth variable:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

### Update OAuth Redirect URLs

Make sure to update your OAuth app settings with your production URLs:

**Google Cloud Console:**
- Add your production domain to authorized origins and redirect URIs

**GitHub OAuth App:**
- Update the homepage URL and callback URL to your production domain

## Troubleshooting

### Common Issues

1. **Invalid redirect URI**:
   - Ensure your redirect URIs exactly match what's configured in OAuth apps
   - Check for trailing slashes and http vs https

2. **Missing environment variables**:
   - Verify all OAuth variables are set correctly
   - Restart your development server after adding new variables

3. **Database connection errors**:
   - Ensure your database schema includes the OAuth fields
   - Check database connection credentials

### OAuth Flow Debug

The OAuth flow works as follows:

1. User clicks OAuth button → `/api/auth/oauth?provider=google&action=start`
2. Redirects to OAuth provider (Google/GitHub)
3. User authorizes → Provider redirects back to `/api/auth/oauth?provider=google&action=callback`
4. Backend exchanges code for access token
5. Fetches user profile information
6. Creates or updates user in database
7. Sets session cookies and redirects to `/zone`

### Support

If you encounter issues:
1. Check the browser developer console for errors
2. Check your server logs for API errors
3. Verify OAuth app configurations match your environment variables
4. Test with a fresh incognito/private browser window
