#!/bin/bash

# LoopWar Security Enhancement Script
# This script helps secure your application by:
# 1. Removing credential files from git history
# 2. Setting up proper .gitignore rules
# 3. Validating current security configuration

echo "🔒 LoopWar Security Enhancement Script"
echo "===================================="

# Function to check if running in git repository
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "❌ Not in a git repository. Please run this from your project root."
        exit 1
    fi
}

# Function to remove sensitive files from git history
remove_credential_files() {
    echo ""
    echo "🗑️  Removing credential files from git tracking..."
    
    # Files that contain credentials and should not be tracked
    CREDENTIAL_FILES=(
        "SECURE-CREDENTIALS.md"
        "ENV-PRODUCTION-UPDATE.md"
        ".env.local"
        ".env.production"
        ".env"
    )
    
    for file in "${CREDENTIAL_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "   Removing $file from git tracking..."
            git rm --cached "$file" 2>/dev/null || true
        fi
    done
}

# Function to update .gitignore
update_gitignore() {
    echo ""
    echo "📝 Updating .gitignore for security..."
    
    # Security-related entries to add to .gitignore
    SECURITY_IGNORES=(
        ""
        "# Security - Credential files"
        "SECURE-CREDENTIALS.md"
        "ENV-PRODUCTION-UPDATE.md"
        "credentials.txt"
        "passwords.txt"
        "secrets.json"
        ""
        "# Environment files with credentials"
        ".env.local"
        ".env.production"
        ".env.staging"
        ".env.development.local"
        ".env.test.local"
        ""
        "# Backup files that might contain credentials"
        "*.backup"
        "*.bak"
        "*.orig"
        ""
        "# Database dumps"
        "*.sql"
        "*.dump"
        "database.sql"
    )
    
    # Check if .gitignore exists
    if [ ! -f ".gitignore" ]; then
        echo "   Creating .gitignore file..."
        touch .gitignore
    fi
    
    # Add security entries if they don't exist
    for entry in "${SECURITY_IGNORES[@]}"; do
        if [ -n "$entry" ] && ! grep -q "^$entry$" .gitignore 2>/dev/null; then
            echo "$entry" >> .gitignore
        fi
    done
    
    echo "   ✅ .gitignore updated with security rules"
}

# Function to check for hardcoded credentials in code
scan_for_credentials() {
    echo ""
    echo "🔍 Scanning for potential hardcoded credentials..."
    
    # Patterns that might indicate hardcoded credentials
    PATTERNS=(
        "password.*=.*['\"][^'\"]*['\"]"
        "secret.*=.*['\"][^'\"]*['\"]"
        "api_key.*=.*['\"][^'\"]*['\"]"
        "token.*=.*['\"][^'\"]*['\"]"
        "903fd4002@smtp-brevo\.com"
        "7rxfNbnRm1OCjUW2"
        "loop_wv1.*wv1"
    )
    
    FOUND_ISSUES=false
    
    for pattern in "${PATTERNS[@]}"; do
        if grep -r -E "$pattern" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" . 2>/dev/null; then
            FOUND_ISSUES=true
            echo "   ⚠️  Found potential credential: $pattern"
        fi
    done
    
    if [ "$FOUND_ISSUES" = false ]; then
        echo "   ✅ No hardcoded credentials found in source code"
    else
        echo "   ⚠️  Please review and remove any hardcoded credentials found above"
    fi
}

# Function to validate environment configuration
validate_environment() {
    echo ""
    echo "🔧 Environment Configuration Check..."
    
    if [ -f ".env.example" ]; then
        echo "   ✅ .env.example exists"
    else
        echo "   ❌ .env.example missing - create this file with placeholder values"
    fi
    
    if [ -f ".env.local" ]; then
        echo "   ⚠️  .env.local exists (should not be committed to git)"
    else
        echo "   ✅ .env.local not found (good for git security)"
    fi
    
    # Check if .env.local is in .gitignore
    if grep -q "\.env\.local" .gitignore 2>/dev/null; then
        echo "   ✅ .env.local is ignored by git"
    else
        echo "   ⚠️  .env.local should be added to .gitignore"
    fi
}

# Function to show security recommendations
show_recommendations() {
    echo ""
    echo "💡 Security Recommendations:"
    echo "=========================="
    echo "1. 🔐 Change your database password from 'wv1' to a strong password"
    echo "2. 🔑 Update NEXTAUTH_SECRET to a secure random string"
    echo "3. 🔄 Rotate your SMTP credentials since they were exposed"
    echo "4. 📧 Consider using a dedicated email service for production"
    echo "5. 🛡️  Enable 2FA on your GitHub and Google accounts"
    echo "6. 📊 Set up monitoring for failed login attempts"
    echo "7. 🔍 Regular security audits with 'npm audit'"
    echo "8. 🚫 Never commit .env.local or credential files"
}

# Main execution
main() {
    check_git_repo
    remove_credential_files
    update_gitignore
    scan_for_credentials
    validate_environment
    show_recommendations
    
    echo ""
    echo "🎉 Security enhancement complete!"
    echo "📋 Next steps:"
    echo "   1. Review any warnings above"
    echo "   2. Test your application with environment variables"
    echo "   3. Commit the security improvements"
    echo "   4. Deploy with proper environment variables"
}

# Run the main function
main
