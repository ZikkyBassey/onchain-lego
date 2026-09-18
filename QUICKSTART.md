# ⚡ Quick Start Guide

Get Onchain LEGO running in 5 minutes.

## Step 1: Get QuickNode API Key (2 min)

1. Go to https://quicknode.com
2. Sign up and create free account
3. Create new endpoint for Solana Mainnet
4. Copy your HTTP and WebSocket URLs

## Step 2: Setup Environment (1 min)

Create `.env` file in project root:

```env
QUICKNODE_RPC_URL=https://your-key.solana-mainnet.quiknode.pro/
QUICKNODE_WS_URL=wss://your-key.solana-mainnet.quiknode.pro/
BACKEND_PORT=3001
FRONTEND_PORT=3000
NODE_ENV=development
```

## Step 3: Install & Run (2 min)

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend (in new terminal)
cd frontend
npm run dev
```

## 🎉 Done!

Open `http://localhost:3000` and watch the Solana blockchain come to life!

---

## 🎮 First Time Using?

### What You'll See
- 3D LEGO world with demo objects
- Houses represent wallets
- Cars represent transactions
- Factories represent smart contracts
- Packages represent token transfers

### Try These
1. **Click on objects** - See their blockchain data
2. **Use playback controls** - Pause, adjust speed
3. **Filter events** - Show only specific types
4. **Expand sections** - See detailed transaction info

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
lsof -i :3001

# Try different port in .env
BACKEND_PORT=3002
```

### Frontend won't connect
```bash
# Make sure backend is running
curl http://localhost:3001/health

# Check WebSocket connection
# Open browser console (F12) and look for WebSocket errors
```

### No blockchain data showing
- Verify QuickNode URL is correct
- Check `.env` file has correct credentials
- Look at browser console for errors
- Check backend logs for connection issues

### 3D objects not rendering
- Enable WebGL in browser
- Try different browser (Chrome recommended)
- Check browser console for Three.js errors

---

## 📚 Next Steps

- Read [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed setup
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Explore code comments for implementation details
- Review existing LEGO objects and create new ones

---

## 💡 Quick Commands

```bash
# Backend
cd backend
npm run dev          # Start with hot reload
npm run build        # Compile
npm run lint         # Check code style

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview build locally
```

---

## 🎯 What Happens Next

1. Backend connects to Solana via QuickNode
2. Blockchain events are normalized and parsed
3. Events broadcast to frontend via WebSocket
4. Frontend creates LEGO animations
5. Click objects to see raw blockchain data

---

## 📝 Need Help?

1. Check console (browser F12 or terminal)
2. Review error messages
3. See [DEVELOPMENT.md](./DEVELOPMENT.md) troubleshooting section
4. Check code comments
5. Open an issue on GitHub

**Happy visualizing! 🧱⚡**
