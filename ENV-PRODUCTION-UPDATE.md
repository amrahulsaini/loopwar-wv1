# Updated .env.local for your LoopWar Production Server
# Add these OAuth variables to enable Google and GitHub sign-in

# Existing Variables (Keep these as they are)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=903fd4002@smtp-brevo.com
SMTP_PASS=7rxfNbnRm1OCjUW2
SMTP_FROM=verify@loopwar.dev
NEXTAUTH_URL=https://loopwar.dev
NEXTAUTH_SECRET=your-production-secret-change-this
DB_HOST=localhost
DB_USER=loop_wv1
DB_PASSWORD=wv1
DB_NAME=loop_wv1
DB_PORT=3306

# NEW: Add these OAuth variables for social login
# Google OAuth - Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# GitHub OAuth - Get these from GitHub Developer Settings
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here

# Optional: OAuth redirect URL (defaults to NEXTAUTH_URL + /api/auth/oauth if not set)
OAUTH_REDIRECT_URL=https://loopwar.dev/api/auth/oauth
