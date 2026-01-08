# Environment Variables for Supabase Storage

## Required Variables

Add the following to your `frontend/.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_BUCKET=bargainly-uploads
```

## Getting Your Service Role Key

1. Go to your Supabase project dashboard
2. Click **Settings** in the left sidebar
3. Click **API** under Project Settings
4. Scroll to **Project API keys**
5. Copy the **service_role** key (NOT the anon key)
6. Add it to `.env.local` as `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`

## Security Note

> [!CAUTION]
> The service role key has **full access** to your database and bypasses all RLS policies. 
> 
> **It's safe to use in this case because:**
> - The `ImageUpload` component is only used in the admin panel
> - The admin panel should be protected by authentication middleware
> - Only authorized admins can access the upload functionality
> 
> **Never expose the service role key in:**
> - Public-facing components
> - Client-side code accessible to regular users
> - Version control (already in `.gitignore`)

## After Adding the Key

1. Save the `.env.local` file
2. Restart your Next.js dev server:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```
3. Test image upload in the admin panel
