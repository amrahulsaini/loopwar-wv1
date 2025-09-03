# LoopWar Security Enhancement Script (PowerShell)
# This script helps secure your application by validating environment configuration

Write-Host "🔒 LoopWar Security Enhancement Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Function to check for git repository
function Test-GitRepo {
    try {
        git rev-parse --git-dir | Out-Null
        return $true
    }
    catch {
        Write-Host "❌ Not in a git repository. Please run this from your project root." -ForegroundColor Red
        return $false
    }
}

# Function to scan for potential credentials in code
function Test-HardcodedCredentials {
    Write-Host ""
    Write-Host "🔍 Scanning for potential hardcoded credentials..." -ForegroundColor Yellow
    
    $patterns = @(
        "903fd4002@smtp-brevo\.com",
        "7rxfNbnRm1OCjUW2",
        "password.*=.*[`'`"][^`'`"]*[`'`"]",
        "secret.*=.*[`'`"][^`'`"]*[`'`"]"
    )
    
    $foundIssues = $false
    
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem -Path . -Include "*.ts", "*.js", "*.tsx", "*.jsx" -Recurse | 
                 Select-String -Pattern $pattern -AllMatches
        
        if ($files) {
            $foundIssues = $true
            Write-Host "   ⚠️  Found potential credential pattern: $pattern" -ForegroundColor Yellow
            foreach ($file in $files) {
                Write-Host "      in $($file.Filename):$($file.LineNumber)" -ForegroundColor Gray
            }
        }
    }
    
    if (-not $foundIssues) {
        Write-Host "   ✅ No obvious hardcoded credentials found in source code" -ForegroundColor Green
    }
}

# Function to validate environment configuration
function Test-EnvironmentConfig {
    Write-Host ""
    Write-Host "🔧 Environment Configuration Check..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Write-Host "   ✅ .env.example exists" -ForegroundColor Green
    } else {
        Write-Host "   ❌ .env.example missing" -ForegroundColor Red
    }
    
    if (Test-Path ".env.local") {
        Write-Host "   ⚠️  .env.local exists (should not be committed to git)" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ .env.local not found in repo (good for security)" -ForegroundColor Green
    }
    
    if (Test-Path ".gitignore") {
        $gitignoreContent = Get-Content ".gitignore" -Raw
        if ($gitignoreContent -match "\.env" -or $gitignoreContent -match "env\.local") {
            Write-Host "   ✅ Environment files are ignored by git" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  .env files should be added to .gitignore" -ForegroundColor Yellow
        }
    }
}

# Function to check npm packages for vulnerabilities
function Test-Dependencies {
    Write-Host ""
    Write-Host "📦 Checking npm packages for vulnerabilities..." -ForegroundColor Yellow
    
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        try {
            $auditResult = npm audit --audit-level moderate 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ No vulnerabilities found in dependencies" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Vulnerabilities found in dependencies:" -ForegroundColor Yellow
                Write-Host $auditResult -ForegroundColor Gray
            }
        }
        catch {
            Write-Host "   ⚠️  Could not run npm audit" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  npm not found - cannot check dependencies" -ForegroundColor Yellow
    }
}

# Function to show security recommendations
function Show-SecurityRecommendations {
    Write-Host ""
    Write-Host "💡 Security Recommendations:" -ForegroundColor Cyan
    Write-Host "==========================" -ForegroundColor Cyan
    Write-Host "1. 🔐 Change database password from 'wv1' to a strong password" -ForegroundColor White
    Write-Host "2. 🔑 Update NEXTAUTH_SECRET to a secure random string" -ForegroundColor White
    Write-Host "3. 🔄 Rotate SMTP credentials since they were exposed" -ForegroundColor White
    Write-Host "4. 📧 Consider using a dedicated email service" -ForegroundColor White
    Write-Host "5. 🛡️  Enable 2FA on your GitHub and Google accounts" -ForegroundColor White
    Write-Host "6. 📊 Set up monitoring for failed login attempts" -ForegroundColor White
    Write-Host "7. 🔍 Regular security audits with 'npm audit'" -ForegroundColor White
    Write-Host "8. 🚫 Never commit .env.local or credential files" -ForegroundColor White
}

# Function to show current security status
function Show-SecurityStatus {
    Write-Host ""
    Write-Host "📊 Current Security Status:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    
    # Check if key security files exist
    $securityFeatures = @{
        "lib/security.ts" = "Rate limiting and security headers"
        "lib/env-validator.ts" = "Environment validation"
        "middleware.ts" = "Route protection"
        ".gitignore" = "Git security rules"
    }
    
    foreach ($file in $securityFeatures.Keys) {
        if (Test-Path $file) {
            Write-Host "   ✅ $($securityFeatures[$file])" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Missing: $($securityFeatures[$file])" -ForegroundColor Red
        }
    }
}

# Main execution
function Main {
    if (-not (Test-GitRepo)) {
        return
    }
    
    Test-HardcodedCredentials
    Test-EnvironmentConfig
    Test-Dependencies
    Show-SecurityStatus
    Show-SecurityRecommendations
    
    Write-Host ""
    Write-Host "🎉 Security enhancement check complete!" -ForegroundColor Green
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Review any warnings above" -ForegroundColor White
    Write-Host "   2. Update your .env.local with secure credentials" -ForegroundColor White
    Write-Host "   3. Test your application" -ForegroundColor White
    Write-Host "   4. Deploy with proper environment variables" -ForegroundColor White
}

# Run the main function
Main
