# QuickBites Frontend Deployment Guide

## Vercel Deployment

### Prerequisites
- Vercel account
- Render backend deployed (Phase 12.1)
- Domain name (optional)

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "chore: add Vercel deployment config"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the frontend folder as root
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Set Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api/v1`
   - `NODE_VERSION` = `18`

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy
   - You'll get a URL like `https://quickbites.vercel.app`

### Custom Domain (Optional)

1. **Buy Domain** (Namecheap, GoDaddy, etc.)

2. **Add to Vercel**
   - Vercel Dashboard → Settings → Domains
   - Add your domain (e.g., `quickbites.com`)
   - Vercel will provide DNS records

3. **Update DNS**
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Or A records to Vercel IPs

4. **SSL**
   - Vercel auto-provisions SSL certificate
   - Force HTTPS in `vercel.json`

### Post-Deployment Checklist

- [ ] Verify all pages load
- [ ] Test authentication flow
- [ ] Check API calls work
- [ ] Test cart functionality
- [ ] Verify CORS headers
- [ ] Check mobile responsiveness
