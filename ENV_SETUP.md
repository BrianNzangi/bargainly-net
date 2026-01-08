# Environment Variables Setup

## Frontend Environment Variables

Add these to `frontend/.env.local`:

```env
# NextAuth Configuration
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars-replace-this
NEXTAUTH_URL=http://localhost:3000

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Backend Environment Variables

Add these to `backend/.env`:

```env
# NextAuth Secret (MUST match frontend)
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars-replace-this

# Your existing Supabase variables should already be here
```

## Important Notes

1. **NEXTAUTH_SECRET must be identical** in both frontend and backend `.env` files
2. Generate a secure secret using: `openssl rand -base64 32`
3. Never commit `.env` files to version control
4. The secret should be at least 32 characters long

## Quick Setup

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Then copy the output and paste it as the value for `NEXTAUTH_SECRET` in both:
- `frontend/.env.local`
- `backend/.env`
