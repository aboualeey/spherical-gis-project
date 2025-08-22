# Vercel Deployment Guide

## Environment Variables Configuration

This guide explains how to configure environment variables for your Spherical GIS project deployment on Vercel.

### Required Environment Variables

#### 1. Database Configuration
```
DATABASE_URL="your-production-database-url"
```
**Note:** For production, use a cloud database like PlanetScale, Supabase, or Railway instead of SQLite.

#### 2. Authentication Configuration
```
NEXTAUTH_URL="https://your-app-domain.vercel.app"
NEXTAUTH_SECRET="your-secure-nextauth-secret-key"
JWT_SECRET="your-secure-jwt-secret-key"
```

#### 3. OAuth Configuration
```
REACT_APP_CLIENT_ID="${your_client_id}"
REACT_APP_CLIENT_SECRET="${your_client_secret}"
```
**Replace with your actual OAuth provider credentials (Google, GitHub, etc.)**

#### 4. Application URLs
```
NEXT_PUBLIC_APP_URL="https://your-app-domain.vercel.app"
NEXT_PUBLIC_API_URL="https://your-app-domain.vercel.app/api"
API_BASE_URL="https://your-app-domain.vercel.app/api"
```

#### 5. Admin Configuration
```
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="your-secure-admin-password"
```

#### 6. Email Configuration (Optional)
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@yourdomain.com"
```

#### 7. Security Configuration
```
BCRYPT_ROUNDS="12"
SESSION_TIMEOUT="86400"
```

#### 8. File Upload Configuration
```
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE="5242880"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
```

### How to Configure in Vercel

1. **Access Project Settings:**
   - Go to your Vercel dashboard
   - Select your project
   - Navigate to "Settings" → "Environment Variables"

2. **Add Environment Variables:**
   - Click "Add New"
   - Enter the variable name (e.g., `DATABASE_URL`)
   - Enter the variable value
   - Select the appropriate environments (Production, Preview, Development)
   - Click "Save"

3. **Critical Variables for Vercel:**
   ```
   NEXTAUTH_URL=https://your-app-domain.vercel.app
   NEXTAUTH_SECRET=your-long-random-secret-key
   DATABASE_URL=your-production-database-connection-string
   REACT_APP_CLIENT_ID=your-oauth-client-id
   REACT_APP_CLIENT_SECRET=your-oauth-client-secret
   ```

### Database Setup for Production

1. **Recommended Database Providers:**
   - **PlanetScale:** MySQL-compatible, serverless
   - **Supabase:** PostgreSQL with real-time features
   - **Railway:** PostgreSQL/MySQL with simple setup
   - **Neon:** Serverless PostgreSQL

2. **Database Migration:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to production database
   npx prisma db push
   
   # Seed production database
   npx prisma db seed
   ```

### OAuth Provider Setup

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your Vercel domain to authorized origins
6. Use the Client ID and Client Secret in environment variables

#### GitHub OAuth:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `https://your-domain.vercel.app/api/auth/callback/github`
4. Use the Client ID and Client Secret in environment variables

### Security Best Practices

1. **Generate Strong Secrets:**
   ```bash
   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # Generate JWT_SECRET
   openssl rand -base64 32
   ```

2. **Environment-Specific Variables:**
   - Use different secrets for production and preview
   - Never commit actual secrets to version control
   - Use Vercel's environment variable encryption

3. **Database Security:**
   - Use connection pooling for production
   - Enable SSL for database connections
   - Regularly rotate database passwords

### Deployment Checklist

- [ ] All environment variables configured in Vercel
- [ ] Production database set up and accessible
- [ ] OAuth providers configured with correct callback URLs
- [ ] NEXTAUTH_URL points to production domain
- [ ] Database schema deployed (`prisma db push`)
- [ ] Database seeded with initial data
- [ ] Admin user credentials configured
- [ ] Email service configured (if using)
- [ ] File upload directory accessible
- [ ] Security headers configured
- [ ] SSL certificate active

### Troubleshooting

1. **Authentication Issues:**
   - Verify NEXTAUTH_URL matches your domain
   - Check OAuth callback URLs
   - Ensure NEXTAUTH_SECRET is set

2. **Database Connection:**
   - Verify DATABASE_URL format
   - Check database server accessibility
   - Ensure Prisma schema is up to date

3. **Environment Variables:**
   - Check variable names (case-sensitive)
   - Verify values don't contain extra spaces
   - Ensure variables are set for correct environments

### Support

For deployment issues:
1. Check Vercel function logs
2. Review build logs for errors
3. Verify all environment variables are set
4. Test database connectivity
5. Check OAuth provider configuration