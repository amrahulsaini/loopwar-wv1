#!/bin/bash

# Force deployment script - overwrites local changes
echo "🚀 Starting forced deployment..."

# Stop the current application
pm2 delete loopwar 2>/dev/null

# Reset git to match remote exactly
git fetch origin main
git reset --hard origin/main

# Clean install
rm -rf node_modules package-lock.json .next
npm install

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "loopwar" -- start
pm2 save

echo "✅ Deployment complete!"
