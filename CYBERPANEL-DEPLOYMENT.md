# CyberPanel Deployment Guide for LoopAI Backend

## Prerequisites
- CyberPanel installed on your server
- Domain/subdomain configured in CyberPanel
- SSH access to your server

## Step 1: Create a Website in CyberPanel
1. Log into CyberPanel
2. Go to "Websites" → "Create Website"
3. Enter your domain (e.g., ai.loopwar.dev)
4. Select package and create

## Step 2: Upload Files via SFTP
1. Use FileZilla or similar SFTP client
2. Connect to your server using:
   - Host: your-server-ip
   - Username: website-username (from CyberPanel)
   - Password: website-password
   - Port: 22
3. Upload the ai-backend folder to `/home/website-domain/public_html/`

## Step 3: Install Python and Dependencies
Connect via SSH and run:

```bash
# Navigate to your website directory
cd /home/ai.loopwar.dev/public_html/ai-backend

# Install Python 3.9+ if not available
# (CyberPanel usually has Python, but verify version)
python3 --version

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 4: Configure Environment Variables
Create `.env` file in the ai-backend directory:

```bash
nano .env
```

Add:
```
DB_HOST=localhost
DB_USER=loop_wv1
DB_PASSWORD=your_db_password
DB_NAME=loop_wv1
GEMINI_API_KEY=AIzaSyDloh6LukhgTcIGITl58o3Plh2ZlqBPofQ
```

## Step 5: Create WSGI Entry Point
Create `wsgi.py` in ai-backend directory:

```python
from main import app

if __name__ == "__main__":
    app.run()
```

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
