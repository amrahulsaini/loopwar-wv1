# 🔐 SECURE CREDENTIALS STORAGE - LOOPWAR DATABASE
# Store this file securely - DO NOT COMMIT TO PUBLIC REPOSITORIES

## MySQL Database Configuration
```
Database: loop_wv1
Username: wv1  
Password: wv1
Host: localhost
Port: 3306
```

## SMTP Email Configuration
```
Host: smtp-relay.brevo.com
Port: 587
Username: 903fd4002@smtp-brevo.com
Password: 7rxfNbnRm1OCjUW2
From Email: verify@loopwar.dev
```

## Production Server Environment Variables
Add these to your server's `.env.local` file:

```bash
# MySQL Database
DB_HOST=localhost
DB_USER=wv1
DB_PASSWORD=wv1
DB_NAME=loop_wv1
DB_PORT=3306

# SMTP Email
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=903fd4002@smtp-brevo.com
SMTP_PASS=7rxfNbnRm1OCjUW2
SMTP_FROM=verify@loopwar.dev

# Next.js
NEXTAUTH_URL=https://loopwar.dev
NEXTAUTH_SECRET=generate-a-secure-random-string-for-production
```

## Server Deployment Commands
```bash
# Create .env.local on server with above variables
# Then run deployment:
cd /home/loopwar.dev/public_html/loopwar-wv1 && pkill -f "next" && pm2 delete all 2>/dev/null; git pull origin main && npm install && rm -rf .next && npm run build && pm2 start npm --name "loopwar" -- start && pm2 save
```

---
**🚨 SECURITY NOTES:**
- Never commit actual passwords to git
- Use environment variables for all sensitive data
- Change NEXTAUTH_SECRET in production
- Backup database credentials securely
