---
description: How to deploy Languro to Coolify
---

# Deploy to Coolify

This workflow ensures that Prisma generates correctly and the application deploys successfully to Coolify.

## Prerequisites

1. **Coolify instance** running and accessible
2. **Database** (PostgreSQL) provisioned in Coolify or externally
3. **Environment variables** ready (see below)

## Step 1: Ensure Prisma Scripts Are Configured

✅ **Already Done!** Your `package.json` includes:
- `"postinstall": "prisma generate"` - Generates after `npm install`
- `"build": "prisma generate && next build"` - Generates before build

This ensures Prisma Client is generated at multiple stages of deployment.

## Step 2: Set Up Environment Variables in Coolify

Navigate to your Coolify project → **Environment Variables** and add:

### Required Variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="<generate-a-random-32-char-secret>"

# Google Cloud (for TTS)
GOOGLE_APPLICATION_CREDENTIALS_JSON='<your-service-account-json>'

# AWS S3 (for audio storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="<your-key>"
AWS_SECRET_ACCESS_KEY="<your-secret>"
AWS_S3_BUCKET_NAME="<your-bucket-name>"

# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY="<your-api-key>"

# Email (Nodemailer)
EMAIL_FROM="noreply@your-domain.com"
EMAIL_HOST="smtp.your-provider.com"
EMAIL_PORT="587"
EMAIL_USER="<your-smtp-user>"
EMAIL_PASS="<your-smtp-password>"

# Stripe (if using payments)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Node Environment
NODE_ENV="production"
```

## Step 3: Configure Build Settings in Coolify

### Build Command:
```bash
npm install && npm run build
```

**Note**: The `postinstall` script will run `prisma generate` automatically after `npm install`.

### Start Command:
```bash
npm start
```

### Install Command (if needed):
```bash
npm ci
```

## Step 4: Configure Prisma Features

If you need to run migrations on deployment, you have two options:

### Option A: Auto-migrate on Build (Not Recommended for Production)

Add a `prebuild` script to `package.json`:
```json
"prebuild": "prisma migrate deploy"
```

### Option B: Manual Migration (Recommended)

Run migrations manually via Coolify's console or SSH:
```bash
npx prisma migrate deploy
```

## Step 5: Deploy

1. **Connect your Git repository** to Coolify
2. **Trigger deployment** manually or via push
3. **Monitor build logs** for any Prisma generation errors
4. **Verify deployment** by checking:
   - Application loads
   - Database connections work
   - No Prisma Client errors in logs

## Troubleshooting

### Issue: "Cannot find module '@prisma/client'"

**Solution**: Ensure `postinstall` script exists in `package.json`:
```json
"postinstall": "prisma generate"
```

### Issue: "Prisma schema not found"

**Solution**: Ensure `prisma/schema.prisma` is committed to Git and not in `.gitignore`.

### Issue: Database migrations not applied

**Solution**: Run migrations manually:
```bash
npx prisma migrate deploy
```

### Issue: Environment variable not loading

**Solution**: 
- Check that variables are set in Coolify's environment settings
- Restart the application after adding new variables
- Use `process.env.VARIABLE_NAME` to debug in code

## Verification Checklist

- [ ] Database connection works (`DATABASE_URL` is correct)
- [ ] Prisma Client generates without errors
- [ ] Application builds successfully
- [ ] All API routes respond correctly
- [ ] Authentication works (NextAuth)
- [ ] External services work (Google Cloud TTS, S3, etc.)

## Post-Deployment

1. **Monitor logs** for the first few hours
2. **Test critical features** (login, reading, drills, etc.)
3. **Set up automated backups** for your database
4. **Configure SSL certificate** if not already done

## Performance Tips

- Enable **caching** in Coolify if available
- Configure **connection pooling** for Prisma (add to `DATABASE_URL`):
  ```
  postgresql://user:pass@host/db?connection_limit=10&pool_timeout=20
  ```
- Use **CDN** for static assets if needed
