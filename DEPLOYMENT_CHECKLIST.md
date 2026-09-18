# 🚀 Vercel Deployment Checklist

## Pre-Deployment Checklist

### 1. Code Ready
- [ ] All TypeScript compiles without errors
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Backend API routes created in `/api` directory
- [ ] No hardcoded localhost URLs in production code

### 2. Environment Variables
- [ ] Get QuickNode RPC URL (optional but recommended)
- [ ] Get QuickNode WebSocket URL (optional but recommended)
- [ ] Decide if you need custom environment variables

### 3. GitHub Repository
- [ ] Code pushed to GitHub
- [ ] Repository is public or private (either works)
- [ ] .gitignore file exists and is correct

### 4. Vercel Account
- [ ] Signed up at vercel.com
- [ ] Vercel CLI installed (optional): `npm i -g vercel`

---

## Deployment Steps

### Option A: Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Ready for Vercel deployment"
   git remote add origin https://github.com/yourusername/onchain-lego.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Go to Settings → Environment Variables
   - Add: `QUICKNODE_RPC_URL` (your QuickNode HTTP URL)
   - Add: `QUICKNODE_WS_URL` (your QuickNode WebSocket URL)
   - Click "Save"

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes for build
   - ✅ Get your live URL!

---

### Option B: Vercel CLI

1. **Install CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   # Follow prompts:
   # - Set up and deploy? Yes
   # - Which scope? Your name
   # - Link to existing project? No
   # - Project name? onchain-lego
   # - Directory? ./
   # - Want to modify settings? No
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add QUICKNODE_RPC_URL
   vercel env add QUICKNODE_WS_URL
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## Post-Deployment Checklist

### 1. Verify Deployment
- [ ] Frontend loads at your Vercel URL
- [ ] Frontend builds without errors
- [ ] API endpoints return data (test `/api/health`)
- [ ] No CORS errors in browser console

### 2. Test API Routes
```bash
# Health check
curl https://your-app.vercel.app/api/health

# Get current slot
curl https://your-app.vercel.app/api/slot

# Get blocks
curl https://your-app.vercel.app/api/blocks
```

### 3. Check Browser Console
- [ ] No JavaScript errors
- [ ] No CORS warnings
- [ ] 3D world renders correctly
- [ ] No 404 errors for assets

### 4. Performance Check
- [ ] Page loads in < 3 seconds
- [ ] 3D scene renders smoothly
- [ ] No lag when rotating camera

---

## Common Issues & Solutions

### Build Fails
**Error**: TypeScript compilation errors
**Solution**: 
```bash
cd frontend && npm run typecheck
# Fix any errors shown
```

### API Returns 404
**Error**: `/api/slot` not found
**Solution**: 
- Check API routes exist in `/api` directory
- Ensure no typos in file names
- Verify `vercel.json` routes configuration

### Environment Variables Not Working
**Error**: `QUICKNODE_RPC_URL` is undefined
**Solution**:
- Add variables in Vercel dashboard
- Redeploy after adding
- Use `vercel env pull` to sync locally

### CORS Errors
**Error**: CORS policy blocked
**Solution**:
- Already configured in `vercel.json`
- Check headers are being set correctly

### Frontend Can't Reach API
**Error**: Network error or timeout
**Solution**:
- Frontend calls `/api/...` (relative path)
- Should work automatically with Vercel

### WebSocket Not Working
**Error**: Can't connect to WebSocket
**Solution**:
- WebSockets not supported on Vercel
- Already configured polling fallback
- Uses REST API polling instead

### 3D Scene Doesn't Render
**Error**: Black screen or WebGL error
**Solution**:
- Check browser supports WebGL
- Try Chrome or Firefox
- Check console for Three.js errors

---

## Environment Variables Reference

### Required for Real Blockchain Data
```
QUICKNODE_RPC_URL  = https://your-key.solana-mainnet.quiknode.pro/
QUICKNODE_WS_URL   = wss://your-key.solana-mainnet.quiknode.pro/
```

### Optional
```
BACKEND_PORT = 3001  # Just for reference, not used
NODE_ENV     = production
```

---

## URLs After Deployment

Once deployed, you'll have:
- **Frontend**: `https://onchain-lego.vercel.app`
- **Health Check**: `https://onchain-lego.vercel.app/api/health`
- **API Base**: `https://onchain-lego.vercel.app/api`

---

## Rollback & Recovery

### Rollback to Previous Version
1. Go to Vercel Dashboard
2. Click on deployment history
3. Find working deployment
4. Click "..." → "Redeploy"

### Delete and Re-deploy
1. Go to Vercel Dashboard
2. Settings → General
3. Scroll to "Danger Zone"
4. Click "Delete Project"
5. Re-deploy from GitHub

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Click "Add"
3. Enter your domain (e.g., onchainlego.com)
4. Follow DNS configuration instructions
5. HTTPS is automatic

---

## Monitoring & Analytics

### Enable Analytics
1. Vercel Dashboard → Settings → Analytics
2. Enable "Web Analytics"
3. View in Analytics tab

### Monitor Functions
1. Vercel Dashboard → Functions
2. View function invocations
3. Check for errors or timeouts

---

## Cost Estimation

### Free Tier (Hobby)
- **Bandwidth**: 100GB/month
- **Serverless**: 100 hours/month
- **Static**: Unlimited
- **Custom Domain**: Included
- **SSL**: Included

### Pay-as-you-go (Pro)
- **Bandwidth**: $0.02/GB
- **Serverless**: $0.02/100ms
- **Builds**: $0.01/minute

**Hobby project estimate**: $0/month

---

## Security Checklist

- [ ] No secrets in source code
- [ ] Environment variables used for sensitive data
- [ ] CORS properly configured
- [ ] No debug logs in production
- [ ] Error messages don't leak sensitive info

---

## Performance Optimization

1. **Enable compression** (automatic on Vercel)
2. **Cache static assets** (automatic)
3. **Use CDN** (automatic)
4. **Optimize Three.js** (reduce polygon count)
5. **Lazy load components** (optional)

---

## Next Steps

After successful deployment:

1. **Add custom domain** (optional)
2. **Set up preview deploys** (automatic on PR)
3. **Enable analytics** (free in Vercel)
4. **Monitor performance** (Vercel dashboard)
5. **Set up alerts** (optional)

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Serverless Functions**: https://vercel.com/docs/concepts/functions
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Edge Network**: https://vercel.com/docs/concepts/edge-network
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Solana Docs**: https://docs.solana.com

---

## Quick Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment URL
vercel inspect

# Pull environment variables locally
vercel env pull

# List environment variables
vercel env ls

# Delete environment variable
vercel env rm QUICKNODE_RPC_URL

# View logs
vercel logs <url>
```

---

**✅ Deployment Complete!**

Share your live URL: `https://onchain-lego.vercel.app`