---
description: How to deploy MatriCare to production
---

# Deployment Workflow for MatriCare

This workflow guides you through deploying the MatriCare application to production using either Netlify or Vercel.

## Prerequisites

1. Ensure all changes are committed to Git
2. Have a GitHub account with the repository pushed
3. Have either a Netlify or Vercel account

## Option 1: Deploy to Netlify

### Step 1: Build the Project Locally (Optional - for testing)
```bash
powershell -ExecutionPolicy Bypass -Command "npm run build"
```

### Step 2: Deploy via Netlify CLI

If you have Netlify CLI installed:
```bash
netlify deploy --prod
```

### Step 3: Deploy via Netlify Web Interface

1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 18
5. Click "Deploy site"

### Step 4: Configure Environment Variables (if needed)

If you need to add environment variables:
1. Go to Site settings → Environment variables
2. Add any required variables (e.g., Firebase config if you want to use env vars)

## Option 2: Deploy to Vercel

### Step 1: Deploy via Vercel CLI

If you have Vercel CLI installed:
```bash
vercel --prod
```

### Step 2: Deploy via Vercel Web Interface

1. Go to https://vercel.com/
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration
5. Click "Deploy"

## Post-Deployment Checklist

- [ ] Test all pages on the live site
- [ ] Verify Firebase authentication works
- [ ] Test multilingual functionality (English, Hindi, Marathi, Tamil)
- [ ] Check responsive design on mobile devices
- [ ] Test all navigation links
- [ ] Verify the Find Care map functionality
- [ ] Test SOS emergency buttons
- [ ] Check chatbot functionality
- [ ] Verify all trimester pages load correctly
- [ ] Test the Analytics page
- [ ] Verify Settings page functionality

## Troubleshooting

### If the site shows a blank page:
- Check browser console for errors
- Verify all environment variables are set correctly
- Check that the build completed successfully

### If routing doesn't work:
- Ensure `netlify.toml` or `vercel.json` is properly configured
- Verify the redirect rules are in place

### If Firebase auth doesn't work:
- Add your deployment domain to Firebase authorized domains
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your Netlify/Vercel domain (e.g., `your-app.netlify.app`)

## Continuous Deployment

Both Netlify and Vercel support automatic deployments:
- Every push to `main` branch will trigger a new deployment
- Pull requests will create preview deployments
- You can configure branch-specific deployments in the platform settings

## Custom Domain (Optional)

### For Netlify:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### For Vercel:
1. Go to Project settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
