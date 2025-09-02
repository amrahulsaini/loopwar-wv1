# LoopWar Backend Setup Guide

## 🚀 **Installation & Setup**

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Environment Variables**
Create a `.env.local` file in your project root with:

```env
# SMTP Configuration for Email Verification
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=903fd4002@smtp-brevo.com
SMTP_PASS=7rxfNbnRm1OCjUW2
SMTP_FROM=verify@loopwar.dev

# Security
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3001
```

### OAuth (Google & GitHub)
If you want to enable Google and GitHub sign-in, add these variables to `.env.local` (values from Google/GitHub console):

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
OAUTH_REDIRECT_URL=https://your-domain.com/api/auth/oauth?provider=google&action=callback
```

You can copy `.env.example` to `.env.local` and fill values:

```powershell
copy .env.example .env.local
# then open .env.local and paste your secrets
```

### 3. **Data Directory**
The system will automatically create a `data/` directory to store:
- `users.json` - User account data
- `verification_codes.json` - Email verification codes

## 🔒 **Security Features**

### **Password Security**
- **bcryptjs**: 12 salt rounds for password hashing
- **Validation**: Minimum 8 characters, requires lowercase, uppercase, and number
- **No plain text**: Passwords are never stored in plain text

### **Data Protection**
- **JSON files**: Stored in `data/` directory (not accessible via web)
- **Verification codes**: Stored separately with 15-minute expiry
- **Input validation**: Comprehensive validation for all user inputs
- **Rate limiting**: Built-in protection against brute force attacks

### **Email Security**
- **SMTP over TLS**: Secure email transmission
- **Verification codes**: 6-digit numeric codes with expiry
- **Professional templates**: Branded LoopWar email templates

## 📧 **Email Verification Flow**

1. **User signs up** → Account created but not verified
2. **Verification email sent** → 6-digit code with 15-minute expiry
3. **User enters code** → Account verified and activated
4. **Login enabled** → User can now access LoopWar

## 🛡️ **Attack Prevention**

### **SQL Injection Protection**
- No SQL queries (JSON file storage)
- Input sanitization and validation

### **XSS Protection**
- React's built-in XSS protection
- Input validation and sanitization

### **CSRF Protection**
- Next.js built-in CSRF protection
- Proper HTTP methods and headers

### **Brute Force Protection**
- Verification code expiry (15 minutes)
- Rate limiting on API endpoints
- Secure password requirements

## 📁 **File Structure**

```
app/
├── api/
│   └── auth/
│       ├── signup/route.ts      # User registration
│       └── verify/route.ts      # Email verification
├── join/page.tsx                # Signup page
├── verify/page.tsx              # Verification page
└── globals.css                  # Styling

data/                           # Auto-created
├── users.json                  # User accounts
└── verification_codes.json     # Verification codes
```

## 🚀 **Running the Application**

### **Development**
```bash
npm run dev
```

### **Production Build**
```bash
npm run build
npm start
```

## 📱 **Features**

- ✅ **Secure user registration**
- ✅ **Email verification system**
- ✅ **Professional email templates**
- ✅ **Responsive design**
- ✅ **Dark/light theme support**
- ✅ **Form validation**
- ✅ **Error handling**
- ✅ **Loading states**

## 🔧 **Customization**

### **Email Template**
Edit the HTML template in `app/api/auth/signup/route.ts`

### **Validation Rules**
Modify validation functions in the signup route

### **Styling**
Update CSS variables in `app/globals.css`

## 🚨 **Important Notes**

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Data Security**: The `data/` directory should not be web-accessible
3. **Production**: Change `NEXTAUTH_SECRET` to a strong random string
4. **SMTP**: Ensure your SMTP credentials are secure
5. **Backup**: Regularly backup the `data/` directory

## 🆘 **Troubleshooting**

### **Email Not Sending**
- Check SMTP credentials
- Verify network connectivity
- Check spam folder

### **Verification Issues**
- Ensure code is entered within 15 minutes
- Check browser console for errors
- Verify API endpoints are working

### **Build Errors**
- Install all dependencies: `npm install`
- Check TypeScript types
- Verify environment variables

---

**LoopWar.dev** - The Future of AI-Powered Coding Education 🚀
