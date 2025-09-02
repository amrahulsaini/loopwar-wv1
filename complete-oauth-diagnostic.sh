#!/bin/bash

echo "🔍 COMPLETE GITHUB OAUTH DIAGNOSTIC"
echo "==================================="

echo ""
echo "📋 1. ENVIRONMENT VARIABLES CHECK:"
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-❌ NOT SET}"
echo "GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID:-❌ NOT SET}"
echo "GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET:+✅ SET (${#GITHUB_CLIENT_SECRET} chars)} ${GITHUB_CLIENT_SECRET:-❌ NOT SET}"

echo ""
echo "📄 2. .ENV.LOCAL FILE CHECK:"
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    echo "Content related to OAuth:"
    grep -E "(NEXTAUTH_URL|GITHUB_CLIENT)" .env.local || echo "❌ No OAuth config found in .env.local"
else
    echo "❌ .env.local file not found"
fi

echo ""
echo "🔗 3. OAUTH ROUTE ACCESSIBILITY:"
echo "Testing OAuth route..."
curl -s -o /dev/null -w "Status: %{http_code}\n" "https://loopwar.dev/api/auth/oauth"

echo ""
echo "🗄️ 4. DATABASE OAUTH COLUMNS CHECK:"
mysql -u loop_wv1 -p -e "USE loop_wv1; DESCRIBE users;" 2>/dev/null | grep oauth || echo "❌ OAuth columns missing - run migration!"

echo ""
echo "🚀 5. PM2 PROCESS STATUS:"
pm2 list | grep loopwar

echo ""
echo "🎯 6. TEST GITHUB OAUTH URL:"
CLIENT_ID="${GITHUB_CLIENT_ID:-0v231iHb4Kj3GG22PDcW}"
CALLBACK_URL="https%3A%2F%2Floopwar.dev%2Fapi%2Fauth%2Foauth%3Fprovider%3Dgithub%26action%3Dcallback"
TEST_URL="https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user:email&redirect_uri=${CALLBACK_URL}"

echo "Testing GitHub OAuth URL..."
curl -s -o /dev/null -w "GitHub OAuth Status: %{http_code}\n" "$TEST_URL"
echo ""
echo "📋 GitHub OAuth URL to test manually:"
echo "$TEST_URL"

echo ""
echo "📝 7. RECENT PM2 LOGS:"
pm2 logs loopwar --lines 5 --nostream

echo ""
echo "✅ DIAGNOSTIC COMPLETE"
echo ""
echo "🔧 COMMON FIXES:"
echo "1. If environment variables are missing: Update .env.local and restart PM2"
echo "2. If OAuth columns missing: Run 'mysql -u loop_wv1 -p loop_wv1 < database/oauth-migration.sql'"
echo "3. If GitHub URL returns 404: Check Client ID in GitHub OAuth app settings"
echo "4. If all looks good but still 404: Check GitHub OAuth app status (enabled/disabled)"
