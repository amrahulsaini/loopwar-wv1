// Environment Variable Validation Utility
// This ensures all required environment variables are present at startup

interface RequiredEnvVars {
  [key: string]: {
    required: boolean;
    description: string;
    defaultValue?: string;
  };
}

const ENV_CONFIG: RequiredEnvVars = {
  // Database Configuration
  DB_HOST: { required: true, description: 'Database host' },
  DB_USER: { required: true, description: 'Database username' },
  DB_PASSWORD: { required: true, description: 'Database password' },
  DB_NAME: { required: true, description: 'Database name' },
  DB_PORT: { required: false, description: 'Database port', defaultValue: '3306' },

  // SMTP Configuration
  SMTP_HOST: { required: true, description: 'SMTP server host' },
  SMTP_PORT: { required: false, description: 'SMTP server port', defaultValue: '587' },
  SMTP_USER: { required: true, description: 'SMTP username' },
  SMTP_PASS: { required: true, description: 'SMTP password' },
  SMTP_FROM: { required: true, description: 'SMTP from email address' },

  // Next.js Configuration
  NEXTAUTH_URL: { required: true, description: 'Application URL' },
  NEXTAUTH_SECRET: { required: true, description: 'NextAuth secret key' },

  // OAuth Configuration (optional for basic functionality)
  GOOGLE_CLIENT_ID: { required: false, description: 'Google OAuth client ID' },
  GOOGLE_CLIENT_SECRET: { required: false, description: 'Google OAuth client secret' },
  GITHUB_CLIENT_ID: { required: false, description: 'GitHub OAuth client ID' },
  GITHUB_CLIENT_SECRET: { required: false, description: 'GitHub OAuth client secret' },

  // Optional
  OAUTH_REDIRECT_URL: { required: false, description: 'OAuth redirect URL' },
  NODE_ENV: { required: false, description: 'Node environment', defaultValue: 'development' }
};

export class EnvironmentValidator {
  static validate(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required environment variables
    Object.entries(ENV_CONFIG).forEach(([key, config]) => {
      const value = process.env[key];
      
      if (config.required && !value) {
        errors.push(`❌ Missing required environment variable: ${key} (${config.description})`);
      } else if (!value && config.defaultValue) {
        warnings.push(`⚠️  Using default value for ${key}: ${config.defaultValue}`);
      }
    });

    // Additional security checks
    if (process.env.NEXTAUTH_SECRET === 'your-production-secret-change-this') {
      errors.push('❌ NEXTAUTH_SECRET is still set to default value - change this for security!');
    }

    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD.length < 8) {
      warnings.push('⚠️  Database password is less than 8 characters - consider using a stronger password');
    }

    if (process.env.NODE_ENV === 'production' && !process.env.GOOGLE_CLIENT_ID && !process.env.GITHUB_CLIENT_ID) {
      warnings.push('⚠️  No OAuth providers configured - users can only sign up with email');
    }

    const isValid = errors.length === 0;

    return { isValid, errors, warnings };
  }

  static logValidationResults(): boolean {
    const { isValid, errors, warnings } = this.validate();

    console.log('\n🔍 Environment Variable Validation');
    console.log('==================================');

    if (errors.length > 0) {
      console.log('\n🚨 ERRORS (Must be fixed):');
      errors.forEach(error => console.log(error));
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      warnings.forEach(warning => console.log(warning));
    }

    if (isValid) {
      console.log('\n✅ Environment validation passed!');
    } else {
      console.log('\n❌ Environment validation failed! Please fix the errors above.');
    }

    console.log('==================================\n');

    return isValid;
  }

  static getRequiredVars(): string[] {
    return Object.entries(ENV_CONFIG)
      .filter(([, config]) => config.required)
      .map(([key]) => key);
  }

  static getConfigSummary(): void {
    console.log('\n📋 Required Environment Variables:');
    console.log('==================================');
    
    Object.entries(ENV_CONFIG).forEach(([key, config]) => {
      const status = process.env[key] ? '✅' : (config.required ? '❌' : '⚪');
      const required = config.required ? '(Required)' : '(Optional)';
      console.log(`${status} ${key} ${required} - ${config.description}`);
    });
    
    console.log('==================================\n');
  }
}

// Auto-validate on import in production
if (process.env.NODE_ENV === 'production') {
  EnvironmentValidator.logValidationResults();
}

export default EnvironmentValidator;
