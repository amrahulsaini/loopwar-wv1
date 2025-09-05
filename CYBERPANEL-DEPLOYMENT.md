# LoopWar Deployment Guide (Next.js Only)

## Prerequisites
- CyberPanel installed on your server
- Domain configured in CyberPanel
- SSH access to your server

## Step 1: Create a Website in CyberPanel
1. Log into CyberPanel
2. Go to "Websites" → "Create Website"
3. Enter your domain (e.g., loopwar.dev)
4. Select package and create

## Step 2: Upload Files via SFTP
1. Use FileZilla or similar SFTP client
2. Connect to your server using:
   - Host: your-server-ip
   - Username: website-username (from CyberPanel)
   - Password: website-password
   - Port: 22
3. Upload the entire project folder to `/home/loopwar.dev/public_html/`

## Step 3: Install Dependencies
Connect via SSH and run:

```bash
cd /home/loopwar.dev/public_html/loopwar-wv1

# Install Node.js dependencies
npm install
```

## Step 4: Configure Environment Variables
Create `.env.local` file in the project root:

```bash
nano .env.local
```

Add your configuration:
```
# SMTP Configuration
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=903fd4002@smtp-brevo.com
SMTP_PASS=7rxfNbnRm1OCjUW2
SMTP_FROM=verify@loopwar.dev

# Next.js Environment
NEXTAUTH_URL=https://loopwar.dev
NEXTAUTH_SECRET=your-nextauth-secret-key

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=loop_wv1
DB_PASSWORD=your_db_password
DB_NAME=loop_wv1
DB_PORT=3306

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDloh6LukhgTcIGITl58o3Plh2ZlqBPofQ
```

## Step 5: Set Up Database
1. In CyberPanel, go to "Databases" → "phpMyAdmin"
2. Import the AI tables from `database/ai-tables.sql`
3. Ensure your database user has proper permissions

## Step 6: Build and Start Application
```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name "loopwar" -- start
pm2 save
```

## Step 7: Configure SSL
Don't forget to:
1. Go to "SSL" → "Manage SSL"
2. Issue Let's Encrypt certificate for your domain

## Features Included
- ✅ AI-powered learning assistant (LoopAI)
- ✅ Interactive MCQ quizzes
- ✅ Code challenge editor
- ✅ User authentication and sessions
- ✅ Database integration
- ✅ Responsive design

## Testing
1. Visit your domain
2. Navigate to Zone → Select a problem
3. Click "Learn" to test the AI assistant
4. Try MCQ and Code modes

## Troubleshooting
- Check PM2 logs: `pm2 logs loopwar`
- Verify environment variables are loaded
- Ensure database connectivity
- Check file permissions

The AI functionality is now integrated directly into your Next.js application, making deployment much simpler!

## Step 6: Configure OpenLiteSpeed
1. In CyberPanel, go to "Websites" → "Manage" → your domain
2. Go to "Configurations" → "vHost Conf"
3. Add Python context in the configuration:

```
context /api/ {
  location                /home/ai.loopwar.dev/public_html/ai-backend/
  binPath                 /home/ai.loopwar.dev/public_html/ai-backend/venv/bin/python
  appType                 wsgi
  startupFile             wsgi.py
  env                     PYTHONPATH=/home/ai.loopwar.dev/public_html/ai-backend/
  env                     DB_HOST=localhost
  env                     DB_USER=loop_wv1
  env                     DB_PASSWORD=your_db_password
  env                     DB_NAME=loop_wv1
  env                     GEMINI_API_KEY=your_api_key
}
```

## Step 7: Set Up Database
1. In CyberPanel, go to "Databases" → "phpMyAdmin"
2. Import the AI tables from `database/ai-tables.sql`

## Step 8: Configure Firewall
In CyberPanel:
1. Go to "Security" → "Firewall"
2. Allow port 8000 (or whatever port you configure)

## Step 9: Test Deployment
1. Restart OpenLiteSpeed from CyberPanel
2. Run the test script:
```bash
chmod +x test-deployment.sh
./test-deployment.sh
```
3. Test the API endpoint:
```bash
curl -X POST "https://ai.loopwar.dev/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{"user_id": 1, "message": "Hello AI"}'
```

## Alternative: Use CyberPanel's Python App Manager
If available, CyberPanel has a Python app manager:
1. Go to "Websites" → "Python App" → "Install"
2. Select your domain
3. Configure the app path and settings

## Troubleshooting
- Check CyberPanel logs: `/usr/local/lsws/logs/`
- Verify Python path: `which python3`
- Test locally first: `python main.py`
- Ensure database connectivity from server

## SSL Certificate
Don't forget to:
1. Go to "SSL" → "Manage SSL"
2. Issue Let's Encrypt certificate for your AI subdomain
