# Vercel Deployment Guide

Deploy Onchain LEGO to Vercel with both frontend and backend (serverless).

## Prerequisites

1. **Vercel account** - Sign up at https://vercel.com
2. **Vercel CLI** - Install: `npm i -g vercel`
3. **GitHub repository** - Push your code to GitHub

## Option 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create onchain-lego --public --source=. --push
# or use GitHub web interface
```

### Step 2: Import to Vercel
1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository

### Step 3: Configure Environment Variables
In Vercel dashboard, go to **Settings** → **Environment Variables**:

Add these variables:
```
QUICKNODE_RPC_URL  →  your QuickNode HTTP URL
QUICKNODE_WS_URL   →  your QuickNode WebSocket URL
```

Click **Save**

### Step 4: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2 minutes)
3. Get your live URL!

## Option 2: Deploy via CLI

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Deploy
```bash
# From project root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your name
# - Link to existing project? No
# - Project name? onchain-lego
# - Directory? ./
# - Want to modify settings? No (we've configured vercel.json)

# For production:
vercel --prod
```

### Step 4: Add Environment Variables
```bash
vercel env add QUICKNODE_RPC_URL
vercel env add QUICKNODE_WS_URL

# Deploy again
vercel --prod
```

---

## Configuration Files

### vercel.json
Created in project root with:
- Build command for frontend
- Output directory
- API route configuration
- Environment variables

### API Routes Structure
```
/api/
├── health.ts              # Health check
├── slot.ts                # Get current slot
├── block/[slot].ts        # Get block details
├── transaction/[sig].tsx  # Get transaction details
├── wallet/[address].tsx   # Get wallet info
├── wallet/[address]/transactions.ts  # Get wallet transactions
├── blocks.ts              # Get recent blocks
└── ws-info.ts             # WebSocket info
```

### Environment Variables
Required in Vercel:
- `QUICKNODE_RPC_URL` - QuickNode HTTP endpoint
- `QUICKNODE_WS_URL` - QuickNode WebSocket endpoint

Optional:
- `BACKEND_PORT` - Set to 3001

---

## Local Development with Vercel

### Run Serverless Functions Locally
```bash
vercel dev
```
This starts both frontend and API routes locally.

### Test Production Build
```bash
vercel build && vercel deploy --prebuilt
```

---

## Architecture

### Frontend
- Deployed as static site from `/frontend/dist`
- Served by Vercel's CDN
- Auto-scales globally

### Backend (Serverless)
- API routes in `/api` directory
- Each endpoint is a separate serverless function
- Auto-scales with traffic
- Cold starts ~100-500ms

### WebSocket Limitation
⚠️ **Important**: Vercel functions don't support WebSockets natively.

**Options:**
1. **Use polling** in frontend (recommended for Vercel)
   - Frontend polls REST API instead of WebSocket
   
2. **External WebSocket server**
   - Deploy WebSocket server separately (Railway, Render, Fly.io)
   - Update frontend `.env` to point to it

3. **Pusher/Ably** (managed service)
   - Use managed real-time service
   - More cost for high traffic

### Recommended: Polling Approach
I'll update the frontend to use polling instead of WebSocket for Vercel compatibility.

---

## URLs After Deployment

After deployment, you'll get:
- **Frontend**: `https://onchain-lego.vercel.app`
- **API**: `https://onchain-lego.vercel.app/api`
- **Health**: `https://onchain-lego.vercel.app/api/health`

---

## Troubleshooting

### Build Fails
- Check TypeScript errors: `cd frontend && npm run typecheck`
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Function Timeout
- Serverless functions have 10-30s timeout
- Keep operations fast
- Use caching where possible

### Environment Variables Not Working
- Ensure they're set in Vercel dashboard
- Redeploy after adding new variables
- Use `vercel env pull` to sync to local

### WebSocket Not Working
- Vercel doesn't support WebSockets
- Use polling or external service
- See "WebSocket Limitation" section above

---

## Performance Tips

1. **Use ISR** for frequently accessed data (optional)
2. **Enable caching** in vercel.json
3. **Use CDN** for frontend (automatic)
4. **Optimize images** if adding screenshots
5. **Monitor** with Vercel Analytics

---

## Cost Estimation

**Free Tier Includes:**
- 100GB bandwidth/month
- 100 hours serverless execution
- Unlimited static files
- Custom domain

**Pay-as-you-go:**
- Beyond free tier: $0.02/GB bandwidth
- Serverless: $0.02/100ms execution

**Estimated cost for hobby project:** $0/month

---

## Next Steps After Deployment

1. **Add custom domain** - Vercel Settings → Domains
2. **Enable HTTPS** - Automatic with Vercel
3. **Set up preview deploys** - Automatic on PR
4. **Add analytics** - Vercel Analytics dashboard

---

## Rollback

To rollback to previous deployment:
1. Go to Vercel dashboard
2. Click on deployment
3. Click "..." menu
4. Select "Redeploy"

---

## Support

- Vercel Docs: https://vercel.com/docs
- Serverless Functions: https://vercel.com/docs/concepts/functions
- Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

---

**Happy Deploying! 🚀**