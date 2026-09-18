# Development Guide

This document provides detailed setup and development instructions for the Onchain LEGO project.

## Prerequisites

- **Node.js**: 18.0 or higher
- **npm**: 9.0 or higher (or yarn/pnpm)
- **Git**: For version control
- **QuickNode Account**: Get a free API key at https://quicknode.com

## Project Structure

```
on-chain-lego/
├── backend/                    # Express server + blockchain services
│   ├── src/
│   │   ├── services/          # Core blockchain services
│   │   ├── types/             # TypeScript type definitions
│   │   └── server.ts          # Express server setup
│   ├── dist/                  # Compiled JavaScript
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React + Three.js client
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── engine/            # Three.js rendering engine
│   │   ├── hooks/             # React hooks
│   │   ├── styles/            # CSS styling
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # React entry point
│   ├── dist/                  # Built frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── .env                       # Environment variables (gitignored)
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Back to root (optional)
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# QuickNode Configuration
QUICKNODE_RPC_URL=https://your-quicknode-url.solana-mainnet.quiknode.pro/
QUICKNODE_WS_URL=wss://your-quicknode-url.solana-mainnet.quiknode.pro/

# Server Configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000

# Environment
NODE_ENV=development
```

**How to get QuickNode credentials:**
1. Go to https://quicknode.com and create an account
2. Create a new endpoint for Solana Mainnet
3. Copy the HTTP and WebSocket URLs
4. Replace the placeholders in `.env`

### 3. Start the Backend

```bash
cd backend
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════╗
║   Onchain LEGO Backend Server         ║
╚═══════════════════════════════════════╝

🚀 Server running on http://localhost:3001
🔌 WebSocket server on ws://localhost:4001
📊 Environment: development
```

### 4. Start the Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

The app will automatically open at `http://localhost:3000`

## Available Scripts

### Backend

```bash
npm run dev       # Start dev server with hot reload
npm run build     # Compile TypeScript to JavaScript
npm run start     # Run compiled server
npm run lint      # Run ESLint
npm run typecheck # Check TypeScript types
```

### Frontend

```bash
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run typecheck # Check TypeScript types
```

## API Endpoints

### REST API (Backend)

- `GET /health` - Health check
- `GET /api/slot` - Current slot number
- `GET /api/block/:slot` - Block details
- `GET /api/transaction/:signature` - Transaction details
- `GET /api/wallet/:address` - Wallet information
- `GET /api/wallet/:address/transactions` - Wallet transaction history
- `GET /api/blocks?limit=10` - Recent blocks
- `GET /api/ws-info` - WebSocket server info

### WebSocket Events

The frontend receives real-time events via WebSocket at `ws://localhost:4001`:

```typescript
interface WorldEvent {
  type: 'transaction' | 'block' | 'wallet_update' | 'contract_interaction';
  timestamp: number;
  data: Transaction | Block | Wallet | SmartContract;
}
```

**Example: Subscribing to events**

```typescript
const ws = new WebSocket('ws://localhost:4001');

ws.onmessage = (event) => {
  const worldEvent = JSON.parse(event.data);
  console.log('Received:', worldEvent);
};

// Subscribe to specific channels
ws.send(JSON.stringify({ type: 'subscribe', channel: 'transactions' }));
```

## Development Workflow

### Making Changes

1. **Backend changes**: Make changes in `backend/src/`, then restart the dev server
2. **Frontend changes**: Make changes in `frontend/src/`, changes auto-reload via Vite
3. **Type changes**: Update types in `backend/src/types/blockchain.ts`

### Adding New LEGO Objects

1. Create a new class extending `LegoObject` in `frontend/src/engine/objects/`
2. Implement the `create()` method to build the 3D geometry
3. Override `update()` for animations
4. Add to renderer in `frontend/src/engine/renderer.ts`

Example:

```typescript
import { LegoObject } from './LegoObject';

export class LegoValidator extends LegoObject {
  constructor(data: LegoObjectData) {
    super(data);
    this.baseColor = new THREE.Color(0xff8b94);
    this.create();
  }

  create(): void {
    // Build your 3D object here
  }

  update(time: number): void {
    // Animation logic
  }
}
```

### Adding New API Endpoints

1. Add endpoint handler in `backend/src/server.ts`
2. Use services from `backend/src/services/`
3. Return JSON response

Example:

```typescript
app.get('/api/custom', async (req: Request, res: Response) => {
  try {
    const data = await someService.getData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
```

## Debugging

### Backend Debugging

Set environment variable for verbose logging:

```bash
DEBUG=* npm run dev
```

### Frontend Debugging

1. Open Chrome DevTools (F12)
2. Check Console tab for errors
3. Use React DevTools extension for component inspection
4. Use Three.js Inspector for 3D scene debugging

### Common Issues

**Issue**: WebSocket connection fails
- **Solution**: Ensure backend is running and WebSocket port (4001) is open

**Issue**: QuickNode API returns errors
- **Solution**: Verify your QuickNode URL is correct and your account has active credits

**Issue**: 3D objects not rendering
- **Solution**: Check browser WebGL support and console for Three.js errors

## Testing

Currently, no automated tests are configured. Consider adding:

- **Backend**: Jest + Supertest for API testing
- **Frontend**: Vitest + React Testing Library for component testing

## Deployment

### Backend Deployment

```bash
# Build
cd backend
npm run build

# Deploy dist/ folder to your server
# Set environment variables
# Start with: npm run start
```

### Frontend Deployment

```bash
# Build
cd frontend
npm run build

# Deploy dist/ folder to CDN or static hosting
# Update API URLs to point to production backend
```

## Performance Optimization

### Backend

- Use database caching for frequently accessed data
- Implement rate limiting
- Use CDN for static assets
- Monitor WebSocket connections

### Frontend

- Lazy load Three.js components
- Optimize texture sizes
- Use WebGL compressed textures
- Implement object pooling for dynamic objects

## Next Steps

1. **Connect to Real Solana Data**: Update `useBlockchainData` hook to listen for actual blockchain events
2. **Add More LEGO Objects**: Create validators, NFT representations, token swaps
3. **Implement Filters**: Allow users to filter by wallet, program, time range
4. **Add Statistics Panel**: Show real-time metrics (TPS, fees, etc.)
5. **Create Replay Mode**: Allow replaying historical transactions
6. **Add Multiplayer**: Use Socket.io for collaborative viewing

## Resources

- [Solana Documentation](https://docs.solana.com)
- [QuickNode Documentation](https://www.quicknode.com/docs)
- [Three.js Documentation](https://threejs.org/docs/)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Support

For issues or questions:

1. Check the [README.md](./README.md) for general information
2. Review the [ARCHITECTURE.md](./ARCHITECTURE.md) for design decisions
3. Check code comments for implementation details

## License

MIT
