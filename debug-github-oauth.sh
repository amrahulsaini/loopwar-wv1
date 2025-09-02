#!/bin/bash

# GitHub OAuth Debug Script
# Run this on your production server to check OAuth configuration

echo "🔍 GitHub OAuth Debug Check"
echo "=========================="

# Check if environment variables are set
echo "📋 Environment Variables:"
echo "GITHUB_CLIENT_ID: ${GITHUB_CLIENT_ID:+SET (hidden)} ${GITHUB_CLIENT_ID:-❌ NOT SET}"
echo "GITHUB_CLIENT_SECRET: ${GITHUB_CLIENT_SECRET:+SET (hidden)} ${GITHUB_CLIENT_SECRET:-❌ NOT SET}"
echo "NEXTAUTH_URL: ${NEXTAUTH_URL:-❌ NOT SET}"

echo ""
echo "🌐 Testing OAuth Route Availability:"

# Test if the OAuth route is accessible
echo "Testing: GET /api/auth/oauth"
curl -I "https://loopwar.dev/api/auth/oauth" 2>/dev/null | head -1

echo ""
echo "Testing: GitHub OAuth Start URL"
curl -I "https://loopwar.dev/api/auth/oauth?provider=github&action=start" 2>/dev/null | head -1

echo ""
echo "🔧 PM2 Process Info:"
pm2 list | grep loopwar

echo ""
echo "📝 Recent PM2 Logs (last 10 lines):"
pm2 logs loopwar --lines 10 --nostream

echo ""
echo "✅ Debug Complete"
echo "If you see 404 errors above, the OAuth route may not be properly deployed."
