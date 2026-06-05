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
   - `QUICKBITES_API_URL` = `https://your-backend.onrender.com/api/v1`
   - `NODE_VERSION` = `18`

   > Do not point `QUICKBITES_API_URL` to `http://localhost:8000` or `127.0.0.1:8000`.
   > A deployed Vercel site cannot call a local backend directly.

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

## Testing a Local Backend with Deployed Frontend

If you want your deployed Vercel frontend to call a backend running on your machine, use a public tunnel instead of `localhost`.

1. Start the backend locally on port 8000:
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
2. Start a tunnel to your local backend:
   - ngrok:
     ```bash
     ngrok http 8000
     ```
   - localtunnel:
     ```bash
     npx localtunnel --port 8000
     ```
3. Copy the generated public URL, for example: `https://abcd1234.ngrok-free.app`
4. In Vercel Dashboard → Settings → Environment Variables, set:
   - `QUICKBITES_API_URL` = `https://abcd1234.ngrok-free.app/api/v1`
5. Redeploy the frontend on Vercel.
6. Confirm your deployed site is loading API requests from the tunnel URL and not `localhost`.

> Never set `QUICKBITES_API_URL` to `http://localhost:8000` for a deployed app. A browser on Vercel cannot access your local loopback address directly.
