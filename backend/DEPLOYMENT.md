# Backend Deployment Guide

This guide covers deploying the Bargainly backend (Nuxt/Nitro) to production hosting platforms.

## Prerequisites

- GitHub repository set up: `https://github.com/BrianNzangi/bargainly-net`
- Supabase project with database configured
- Environment variables ready

## Deployment Options

### Option 1: Render (Recommended)

Render is ideal for this Nuxt backend because it supports traditional Node.js servers without requiring code changes.

#### Setup Steps

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up and connect your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect to `BrianNzangi/bargainly-net` repository
   - Select the `backend` directory as the root

3. **Configure Build Settings**
   ```
   Name: bargainly-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: node .output/server/index.mjs
   ```

4. **Set Environment Variables**
   Add these in Render's Environment section:
   ```
   NODE_ENV=production
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ENCRYPTION_KEY=your_secure_encryption_key_32_chars
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy
   - Your API will be available at: `https://bargainly-backend.onrender.com`

#### Render Pricing
- **Free Tier**: Available with limitations (spins down after inactivity)
- **Starter**: $7/month for always-on service
- Auto-scaling available on higher tiers

---

### Option 2: Vercel

Vercel can host the backend as serverless functions, but requires a configuration change.

#### Setup Steps

1. **Update Configuration**
   
   Edit `backend/nuxt.config.ts`:
   ```typescript
   nitro: {
     preset: 'vercel',  // Change from 'node-server'
     // ... rest of config
   }
   ```

2. **Create Vercel Project**
   - Go to [vercel.com](https://vercel.com)
   - Import `BrianNzangi/bargainly-net` repository
   - Framework Preset: Nuxt.js
   - Root Directory: `backend`

3. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: .output
   Install Command: npm install
   ```

4. **Set Environment Variables**
   ```
   SUPABASE_URL
   SUPABASE_SERVICE_ROLE_KEY
   ENCRYPTION_KEY
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Your API will be at: `https://bargainly-backend.vercel.app`

#### Vercel Considerations
- Serverless functions have execution time limits (10-60s depending on plan)
- Better for stateless API endpoints
- Excellent for edge deployment

---

### Option 3: Railway

Railway offers simple deployment with generous free tier.

#### Setup Steps

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub

2. **New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `bargainly-net` repository

3. **Configure Service**
   ```
   Root Directory: backend
   Build Command: npm install && npm run build
   Start Command: node .output/server/index.mjs
   ```

4. **Environment Variables**
   Add in Railway's Variables section:
   ```
   NODE_ENV=production
   SUPABASE_URL=your_url
   SUPABASE_SERVICE_ROLE_KEY=your_key
   ENCRYPTION_KEY=your_key
   ```

5. **Generate Domain**
   - Railway auto-generates a domain
   - Or add custom domain in settings

---

## Post-Deployment Setup

### 1. Test API Endpoints

```bash
# Health check
curl https://your-backend-url.com/api/v1/settings

# Test products endpoint
curl https://your-backend-url.com/api/v1/products
```

### 2. Update Frontend Configuration

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### 3. CORS Configuration

The backend is already configured for CORS in `nuxt.config.ts`:
```typescript
routeRules: {
  '/api/**': {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      // ...
    }
  }
}
```

For production, consider restricting to your frontend domain:
```typescript
'Access-Control-Allow-Origin': 'https://your-frontend-domain.com'
```

### 4. Database Migrations

If you have pending migrations, run them after deployment:

```bash
# SSH into your server or use platform CLI
npm run migrate
```

### 5. Seed Admin User (if needed)

```bash
npm run seed:admin
```

---

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations | Yes | `eyJhbGc...` |
| `ENCRYPTION_KEY` | Key for encrypting sensitive settings | Yes | 32+ character string |

---

## Monitoring & Logs

### Render
- View logs in dashboard under "Logs" tab
- Set up log drains for external monitoring

### Vercel
- Real-time logs in deployment dashboard
- Integrate with monitoring tools (Sentry, LogRocket)

### Railway
- Built-in observability dashboard
- View metrics and logs in real-time

---

## Troubleshooting

### Build Fails

**Issue**: `npm install` fails
- **Solution**: Check Node.js version compatibility (use Node 18+)
- Add `engines` field to `package.json`:
  ```json
  "engines": {
    "node": ">=18.0.0"
  }
  ```

### API Returns 500 Errors

**Issue**: Database connection fails
- **Solution**: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check Supabase project is active and accessible

### CORS Errors

**Issue**: Frontend can't access API
- **Solution**: Update CORS headers in `nuxt.config.ts`
- Ensure frontend domain is allowed

---

## Continuous Deployment

All platforms support automatic deployments:

1. **Push to GitHub** → Automatic deployment triggered
2. **Pull Request Previews** → Test changes before merging
3. **Rollback** → Revert to previous deployment if issues occur

---

## Recommended Setup

For production, we recommend:

- **Backend**: Render (Starter plan - $7/month)
- **Frontend**: Vercel (Free tier or Pro)
- **Database**: Supabase (Free tier or Pro)

This combination provides:
- ✅ Reliable uptime
- ✅ Easy scaling
- ✅ Automatic SSL
- ✅ Global CDN
- ✅ Simple CI/CD

---

## Next Steps

1. Choose your hosting platform
2. Set up deployment following the guide above
3. Configure environment variables
4. Deploy and test
5. Update frontend to use production API URL
6. Monitor logs and performance

For issues or questions, refer to the platform-specific documentation or check the troubleshooting section above.
