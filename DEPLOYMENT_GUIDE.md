# MatriCare Deployment Guide

This guide covers multiple deployment options for your MatriCare React application, from easiest to most advanced.

---

## 🚀 Quick Deployment Options (Recommended)

### Option 1: Vercel (Easiest & Free)

**Best for:** Quick deployment, automatic CI/CD, free hosting

#### Steps:

1. **Install Vercel CLI** (optional, or use web interface)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via CLI**
   ```bash
   vercel
   ```
   - Follow the prompts
   - Select your project directory
   - Vercel will auto-detect Vite configuration

3. **Or Deploy via Web Interface:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository (GitHub/GitLab/Bitbucket)
   - Vercel auto-detects Vite settings
   - Click "Deploy"

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Features:**
- ✅ Free SSL certificate
- ✅ Automatic deployments on Git push
- ✅ Preview deployments for pull requests
- ✅ Global CDN
- ✅ Custom domain support

---

### Option 2: Netlify (Easy & Free)

**Best for:** Simple deployment, form handling, serverless functions

#### Steps:

1. **Install Netlify CLI** (optional)
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy via CLI**
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. **Or Deploy via Web Interface:**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

**Features:**
- ✅ Free SSL certificate
- ✅ Continuous deployment
- ✅ Form handling
- ✅ Serverless functions
- ✅ Custom domain support

---

### Option 3: GitHub Pages (Free)

**Best for:** Static hosting, simple projects

#### Steps:

1. **Install gh-pages package**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   Add these fields:
   ```json
   {
     "homepage": "https://yourusername.github.io/MaternalHealth",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.js**
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     base: '/MaternalHealth/' // Your repo name
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages"
   - Select `gh-pages` branch as source

**Features:**
- ✅ Free hosting
- ✅ Custom domain support
- ⚠️ Public repositories only (for free tier)

---

### Option 4: Render (Free Tier Available)

**Best for:** Full-stack apps, databases, background workers

#### Steps:

1. **Go to [render.com](https://render.com)**
2. Click "New" → "Static Site"
3. Connect your Git repository
4. Configure:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
5. Click "Create Static Site"

**Features:**
- ✅ Free SSL
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ Easy to add backend services later

---

## 🏢 Advanced Deployment Options

### Option 5: AWS S3 + CloudFront

**Best for:** Enterprise applications, high traffic, AWS ecosystem

#### Steps:

1. **Build your app**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   - Go to AWS S3 Console
   - Create a new bucket
   - Enable static website hosting
   - Set bucket policy for public read access

3. **Upload files**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   ```

4. **Set up CloudFront** (optional, for CDN)
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure SSL certificate

**Cost:** Pay-as-you-go (very cheap for small apps)

---

### Option 6: Firebase Hosting

**Best for:** Google ecosystem, real-time features

#### Steps:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and initialize**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure firebase.json**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Build and deploy**
   ```bash
   npm run build
   firebase deploy
   ```

**Features:**
- ✅ Free tier (10GB storage, 360MB/day transfer)
- ✅ Global CDN
- ✅ Easy integration with Firebase services

---

### Option 7: Docker + Any Cloud Provider

**Best for:** Custom infrastructure, containerized deployments

#### Steps:

1. **Create Dockerfile**
   ```dockerfile
   # Build stage
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   RUN npm run build

   # Production stage
   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**
   ```nginx
   server {
     listen 80;
     server_name localhost;
     root /usr/share/nginx/html;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

3. **Build and run**
   ```bash
   docker build -t matricare .
   docker run -p 80:80 matricare
   ```

4. **Deploy to:**
   - AWS ECS/EKS
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean App Platform

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are configured
- [ ] Build process completes without errors (`npm run build`)
- [ ] Test the production build locally (`npm run preview`)
- [ ] Update API endpoints for production
- [ ] Configure proper routing for SPA (Single Page Application)
- [ ] Set up error tracking (optional: Sentry, LogRocket)
- [ ] Configure analytics (optional: Google Analytics, Plausible)
- [ ] Test on multiple devices and browsers
- [ ] Optimize images and assets
- [ ] Check bundle size and performance

---

## 🎯 Recommended Choice for MatriCare

**For your MatriCare application, I recommend:**

### **Vercel** (Primary Choice)
- **Why:** Easiest setup, excellent performance, free tier is generous
- **Perfect for:** React/Vite applications
- **Time to deploy:** 5 minutes
- **Cost:** Free for personal projects

### **Netlify** (Alternative)
- **Why:** Similar to Vercel, great for static sites
- **Perfect for:** If you need form handling or serverless functions
- **Time to deploy:** 5 minutes
- **Cost:** Free for personal projects

---

## 🔧 Quick Start (Vercel)

1. **Push your code to GitHub** (if not already)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/MaternalHealth.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "Import Project"
   - Select your repository
   - Click "Deploy"

3. **Done!** Your app will be live at `https://your-project.vercel.app`

---

## 🌐 Custom Domain Setup

After deployment, you can add a custom domain:

1. **Purchase a domain** (from Namecheap, GoDaddy, Google Domains, etc.)
2. **Add domain in your hosting platform:**
   - Vercel: Project Settings → Domains
   - Netlify: Site Settings → Domain Management
3. **Update DNS records** as instructed by your platform
4. **Wait for SSL certificate** (automatic, takes a few minutes)

---

## 📊 Monitoring & Analytics

After deployment, consider adding:

- **Google Analytics** - Track user behavior
- **Sentry** - Error tracking
- **Vercel Analytics** - Performance monitoring (if using Vercel)
- **Hotjar** - User session recording

---

## 🆘 Troubleshooting

### Blank page after deployment
- Check browser console for errors
- Ensure `base` in `vite.config.js` is correct
- Verify all routes are properly configured

### 404 on page refresh
- Configure rewrites to serve `index.html` for all routes
- For Vercel: Create `vercel.json` with rewrites
- For Netlify: Create `_redirects` file

### Build fails
- Check Node.js version compatibility
- Clear `node_modules` and reinstall: `npm ci`
- Check for missing environment variables

---

## 📞 Need Help?

- Vercel Documentation: https://vercel.com/docs
- Netlify Documentation: https://docs.netlify.com
- Vite Deployment Guide: https://vitejs.dev/guide/static-deploy.html

---

**Ready to deploy? Start with Vercel for the easiest experience!** 🚀
