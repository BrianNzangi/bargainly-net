# Bargainly Deployment Guide

Complete guide for deploying Bargainly to production using **Render** (backend) and **Vercel** (frontend).

## Prerequisites

- GitHub repository: `https://github.com/BrianNzangi/bargainly-net`
- Supabase project with database configured
- Environment variables ready

---

## Part 1: Deploy Backend to Render

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

## Part 2: Deploy Frontend to Vercel

Vercel is the ideal platform for Next.js applications with zero configuration needed.

### Setup Steps

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import `BrianNzangi/bargainly-net` repository
   - Vercel auto-detects Next.js

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: npm install
   ```

4. **Set Environment Variables**
   Add these in Vercel's Environment Variables section:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel builds and deploys automatically
   - Your site will be at: `https://bargainly.vercel.app`

6. **Add Custom Domain (Optional)**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `bargainly.net`)
   - Follow DNS configuration instructions

---

## Part 3: Post-Deployment Configuration

### 1. Update Backend CORS

After deploying frontend, update `backend/nuxt.config.ts` to restrict CORS:

```typescript
routeRules: {
  '/api/**': {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': 'https://bargainly.vercel.app',
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
}
```

Commit and push to trigger automatic redeployment on Render.

### 2. Test Full Stack

```bash
# Test backend API
curl https://your-backend.onrender.com/api/v1/products

# Visit frontend
open https://bargainly.vercel.app
```

### 3. Database Migrations

Run migrations on Render:
- Go to Render dashboard → Your service → Shell
- Run: `npm run migrate`

### 4. Seed Admin User

```bash
# In Render shell
npm run seed:admin
```

---

## Environment Variables Reference

### Backend (Render)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | `production` |
| `SUPABASE_URL` | Supabase project URL | Yes | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key | Yes | `eyJhbGc...` |
| `ENCRYPTION_KEY` | Encryption key (32+ chars) | Yes | `your-secure-key-here` |

### Frontend (Vercel)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | `https://bargainly-backend.onrender.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Yes | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes | `eyJhbGc...` |

---

## Monitoring & Logs

### Render (Backend)
- View real-time logs in dashboard
- Set up health checks
- Configure alerts for downtime

### Vercel (Frontend)
- Analytics dashboard for performance metrics
- Real-time function logs
- Error tracking integration

---

## Troubleshooting

### Backend Issues

**Build Fails on Render**
- Check Node.js version (18+ required)
- Verify all dependencies in `package.json`
- Review build logs for specific errors

**API Returns 500 Errors**
- Verify environment variables are set correctly
- Check Supabase connection
- Review Render logs for error details

**Service Spins Down (Free Tier)**
- Upgrade to Starter plan ($7/month) for always-on
- Or implement a ping service to keep it active

### Frontend Issues

**Build Fails on Vercel**
- Check for TypeScript errors
- Verify all environment variables are set
- Review build logs

**API Connection Fails**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration on backend
- Ensure backend is running

**Environment Variables Not Working**
- Must start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding new variables

---

## Continuous Deployment

Both platforms support automatic deployments:

### Render
- **Auto-deploy**: Pushes to `main` branch trigger deployment
- **Manual deploy**: Use "Manual Deploy" button in dashboard
- **Rollback**: Revert to previous deployment anytime

### Vercel
- **Auto-deploy**: Every push creates a deployment
- **Preview deployments**: Pull requests get preview URLs
- **Production**: Only `main` branch deploys to production
- **Instant rollback**: One-click rollback to any previous deployment

---

## Production Checklist

Before going live, ensure:

- [ ] Backend deployed to Render and accessible
- [ ] Frontend deployed to Vercel and accessible
- [ ] All environment variables configured correctly
- [ ] CORS properly restricted to frontend domain
- [ ] Database migrations run successfully
- [ ] Admin user seeded
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificates active (automatic on both platforms)
- [ ] API endpoints tested and working
- [ ] Frontend can communicate with backend
- [ ] Error monitoring set up
- [ ] Backup strategy in place for database

---

## Cost Estimate

### Recommended Production Setup

| Service | Plan | Cost |
|---------|------|------|
| **Render** (Backend) | Starter | $7/month |
| **Vercel** (Frontend) | Hobby (Free) | $0/month |
| **Supabase** (Database) | Free tier | $0/month |
| **Total** | | **$7/month** |

### Scaling Considerations

As your app grows:
- **Render**: Upgrade to Standard ($25/mo) for better performance
- **Vercel**: Pro plan ($20/mo) for team features and analytics
- **Supabase**: Pro plan ($25/mo) for more resources

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel  
3. ✅ Configure environment variables
4. ✅ Update CORS settings
5. ✅ Run migrations and seed data
6. ✅ Test full application
7. 🚀 Go live!

For support:
- **Render**: [render.com/docs](https://render.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)

