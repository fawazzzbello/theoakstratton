# Railway Deployment Guide

This guide provides step-by-step instructions for deploying the Oakstratton BNPL platform to Railway.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Railway Deployment](#railway-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)
8. [Monitoring and Logs](#monitoring-and-logs)

## Prerequisites

Before deploying to Railway, ensure you have:

- Node.js 16+ installed locally
- PostgreSQL 13+ (for local testing)
- Git and GitHub account
- Railway account (free tier available)
- A GitHub repository with this codebase pushed

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd theoakstratton
npm install
```

### 2. Create Local Environment File

Create `.env.local` in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/oakstratton_dev

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# API
VITE_API_URL=http://localhost:3000
API_URL=http://localhost:3000

# SMTP (optional, but recommended for testing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe (optional)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Other
NODE_ENV=development
PORT=3000
```

### 3. Set Up Local PostgreSQL Database

```bash
# Create database
createdb oakstratton_dev

# Run migrations (import schema)
psql oakstratton_dev < database/schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

This starts:
- Frontend: http://localhost:5173 (Vite dev server)
- Backend API: http://localhost:3000

## Railway Deployment

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub"
5. Choose your repository

### Step 2: Add PostgreSQL Service

1. In Railway, click "Add Service" or the "+" button
2. Select "PostgreSQL"
3. Railway will automatically create the DATABASE_URL environment variable
4. Note the database name and credentials

### Step 3: Configure Environment Variables

In Railway project settings:

1. Click "Variables" on the web service
2. Add the following environment variables:

```env
# JWT Configuration (IMPORTANT: Generate secure random strings)
JWT_SECRET=<generate-strong-random-string-min-32-chars>
JWT_REFRESH_SECRET=<generate-another-strong-random-string-min-32-chars>

# Node Environment
NODE_ENV=production

# API Configuration
API_URL=https://<your-railway-domain>.up.railway.app
CORS_ORIGIN=https://<your-railway-domain>.up.railway.app

# SMTP Configuration (Optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<app-password>
ADMIN_EMAIL=<admin-email@example.com>

# Stripe Configuration (Optional)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# reCAPTCHA (Optional)
RECAPTCHA_SITE_KEY=...
RECAPTCHA_SECRET_KEY=...

# Port
PORT=3000
```

### Step 4: Deploy

Railway automatically deploys when you push to the repository. To trigger a manual deployment:

1. Go to your project in Railway
2. Click the three dots (⋯) on the service
3. Select "Deploy"

Or simply push to your repository:

```bash
git push origin main
```

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for signing JWT tokens | Random 32+ character string |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Random 32+ character string |
| `NODE_ENV` | Node environment | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Email server host | Disabled |
| `SMTP_PORT` | Email server port | 587 |
| `SMTP_USER` | Email account username | Disabled |
| `SMTP_PASS` | Email account password | Disabled |
| `STRIPE_SECRET_KEY` | Stripe API key | Disabled |
| `PORT` | Server port | 3000 |
| `CORS_ORIGIN` | CORS allowed origins | `*` |

## Database Setup

### First-Time Database Initialization

When you first deploy to Railway with a new PostgreSQL instance:

1. **Option A: Connect via Railway Terminal**

```bash
# In Railway dashboard, click your PostgreSQL service
# Click "Connect" tab
# Copy the connection string and connect via psql
psql postgresql://user:pass@host:5432/db < database/schema.sql
```

2. **Option B: Import Schema via Code**

The server includes a database initialization check. On first startup with an empty database:

```javascript
// This is handled in server.js
pool.query('SELECT COUNT(*) FROM information_schema.tables WHERE table_name = "users"', (err, res) => {
  if (res.rows[0].count === 0) {
    console.log('Initializing database schema...')
    // Schema initialization happens here
  }
})
```

### Database Schema

The application uses 7 main tables:

- `users` - Admin and manager accounts
- `email_templates` - Email templates with categories
- `leads` - Waitlist and contact form submissions
- `email_events` - Email delivery tracking (sent, opened, clicked)
- `analytics_events` - User behavior analytics
- `alerts` - System and custom alerts
- `transactions` - Payment records (when using Stripe)

See `database/schema.sql` for full schema definition.

## Post-Deployment Verification

### 1. Check Deployment Status

```bash
# In Railway Dashboard
# Should see "Deployment Successful" status
```

### 2. Test Frontend Access

```bash
# Visit your Railway domain
https://<your-app>.up.railway.app
```

You should see:
- Landing page loads correctly
- Admin login page accessible at `/admin/login`
- No console errors

### 3. Test Admin Authentication

1. Go to `https://<your-app>.up.railway.app/admin/login`
2. Create test account or use default credentials:
   - Email: `admin@oakstratton.com`
   - Password: `AdminPassword123!`
3. Verify dashboard loads with all pages accessible

### 4. Test API Endpoints

```bash
# Test health check
curl https://<your-app>.up.railway.app/api/health

# Test login endpoint
curl -X POST https://<your-app>.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@oakstratton.com","password":"AdminPassword123!"}'
```

### 5. Check Database Connection

```bash
# In server logs (Railway Dashboard → Logs tab)
# Should see: "✓ PostgreSQL connection successful"
```

## Troubleshooting

### Common Issues

#### 1. Build Fails with "module not found"

**Solution**: Ensure all dependencies are listed in `package.json`
```bash
# Verify locally
npm install
npm run build

# Push changes
git push origin main
```

#### 2. DATABASE_URL Error

**Error**: `Error: Missing DATABASE_URL environment variable`

**Solution**: 
- Ensure PostgreSQL service is added to Railway project
- Check that DATABASE_URL variable is visible in service settings
- Railway should auto-generate this when PostgreSQL is added

#### 3. Build Succeeds but Site Won't Load

**Solution**: Check the build process. Vite build output should create a `dist` folder:

```bash
# Test locally
npm run build
ls -la dist/

# Should show index.html and assets/
```

#### 4. CORS Errors on Frontend

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**: Update CORS_ORIGIN in environment variables:
```env
CORS_ORIGIN=https://<your-railway-domain>.up.railway.app
```

#### 5. Database Initialization Failed

**Error**: `Error: Database "oakstratton" does not exist`

**Solution**: Manually initialize schema:

1. Get connection string from Railway PostgreSQL service
2. Run locally:
```bash
psql <CONNECTION_STRING> < database/schema.sql
```

Or use Railway's PostgreSQL explorer UI.

### Checking Logs

In Railway Dashboard:
1. Select your service
2. Click "Logs" tab
3. Filter by severity if needed
4. Look for errors (red text)

Common log patterns:
```
✓ PostgreSQL connection successful       → DB is working
Server running on port 3000              → Express started
POST /api/auth/login 200                 → Successful login
```

## Monitoring and Logs

### Key Metrics to Monitor

In Railway Dashboard → "Metrics" tab:

- **CPU Usage**: Should stay under 30% in normal operation
- **Memory Usage**: Should stay under 200MB
- **Network**: Monitor bandwidth usage

### Setting Up Alerts

1. Go to project settings
2. Click "Alerts"
3. Set thresholds for CPU, memory, or failed deployments

### Common Alerts

- **High Memory Usage**: Indicates memory leak or large data processing
- **Deployment Failed**: Check logs and recent code changes
- **Multiple 500 Errors**: Database or service connectivity issue

### Viewing Detailed Logs

```bash
# If Railway CLI is installed
railway logs

# Follow live logs
railway logs -f
```

### Production Checklist

Before going live:

- [ ] JWT_SECRET and JWT_REFRESH_SECRET are strong random strings
- [ ] SMTP configuration is set up and tested
- [ ] Stripe keys are configured (if using payments)
- [ ] Database is initialized with schema
- [ ] CORS_ORIGIN points to correct domain
- [ ] Admin user created with strong password
- [ ] SSL/TLS is enabled (Railway provides free SSL)
- [ ] Rate limiting is configured
- [ ] Logs are being monitored
- [ ] Backup strategy is in place

## Scaling Considerations

### For Higher Traffic

1. **Database**: PostgreSQL should handle 10,000+ concurrent connections
   - Upgrade PostgreSQL RAM if needed
   - Monitor query performance in logs

2. **API Server**: Node.js can handle 1000s of concurrent requests
   - Monitor CPU/Memory in Railway Dashboard
   - Consider horizontal scaling if CPU > 70% consistently

3. **Static Files**: Use CDN for frontend assets
   - Configure Railway to serve via Railway Edge Cache

4. **Email**: Consider switching to SendGrid or AWS SES for high volume
   - Update SMTP configuration in environment variables

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [React & Vite Docs](https://react.dev/)

## Support

For issues or questions:

1. Check logs in Railway Dashboard
2. Review this guide's troubleshooting section
3. Check application error messages in browser console
4. Contact Railway support: support@railway.app

---

**Last Updated**: May 2024
**Version**: 2.0.0 (Phase 4 Complete)
