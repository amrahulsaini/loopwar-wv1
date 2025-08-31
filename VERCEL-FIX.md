# LoopWar Vercel Deployment Fix

This document explains the fixes applied to resolve the "Internal Server Error" on Vercel.

## Problems Identified

1. **File System Operations**: The original code used `fs.writeFile` and `fs.readFile` to store data in JSON files, which doesn't work on Vercel's serverless environment.
2. **Missing Environment Variables**: SMTP credentials were hardcoded instead of using environment variables.

## Solutions Applied

### 1. Replaced File System with In-Memory Storage (Temporary)

**Original (doesn't work on Vercel):**
```typescript
import fs from 'fs/promises';
import path from 'path';

async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(
    path.join(process.cwd(), 'data', 'users.json'),
    JSON.stringify(users, null, 2)
  );
}
```

**Fixed (works on Vercel):**
```typescript
// In-memory storage (temporary solution)
let users: User[] = [];

async function saveUsers(newUsers: User[]): Promise<void> {
  users = newUsers;
}
```

### 2. Environment Variables Setup

Create a `.env.local` file for local development:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=verify@loopwar.dev
```

## Deployment Steps

### 1. Set Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables and add:

- `SMTP_HOST`: smtp-relay.brevo.com
- `SMTP_PORT`: 587
- `SMTP_USER`: your SMTP username
- `SMTP_PASS`: your SMTP password
- `SMTP_FROM`: verify@loopwar.dev

### 2. Deploy to Vercel

```bash
# Install dependencies
npm install

# Build and deploy
vercel --prod
```

## Important Notes

⚠️ **The current in-memory storage is temporary** and will reset on each function invocation. For production, you need a persistent database.

## Production Database Solutions

### Option 1: Vercel KV (Recommended for Quick Fix)

1. Enable Vercel KV in your project dashboard
2. Install the package: `npm install @vercel/kv`
3. Replace storage functions with KV calls

### Option 2: PostgreSQL with Vercel Postgres

1. Add Vercel Postgres to your project
2. Install: `npm install @vercel/postgres`
3. Create database tables and update storage functions

### Option 3: MongoDB Atlas

1. Create MongoDB Atlas account
2. Install: `npm install mongodb`
3. Update storage functions to use MongoDB

## Quick KV Implementation

If you want to use Vercel KV, update your `route.ts`:

```typescript
import { kv } from '@vercel/kv';

async function loadUsers(): Promise<User[]> {
  const users = await kv.get('users');
  return users ? JSON.parse(users as string) : [];
}

async function saveUsers(users: User[]): Promise<void> {
  await kv.set('users', JSON.stringify(users));
}
```

## Testing

After deployment:

1. Try creating an account
2. Check Vercel function logs for any errors
3. Verify email sending works
4. Test the verification flow

## Troubleshooting

- **Email not sending**: Check SMTP environment variables
- **Data not persisting**: Upgrade to a persistent database solution
- **Function timeout**: Consider optimizing email sending or making it async

The current fix should resolve the immediate deployment issue, but plan to implement a proper database solution for production use.
