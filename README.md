# Onchain LEGO

Onchain LEGO is an interactive 3D visualization of Solana blockchain activity using familiar LEGO metaphors. Watch wallets as houses, transactions as cars, smart contracts as factories, and token transfers as packages—all animated in a real-time 3D environment.

## Features

- Real-time 3D visualization of Solana blockchain activity
- LEGO-based metaphors: houses for wallets, cars for transactions, factories for smart contracts
- Interactive object selection with detailed blockchain data display
- Playback controls (pause, speed adjustment, filtering)
- WebSocket-based real-time updates with polling fallback for serverless deployments
- Serverless API routes optimized for Vercel deployment
- Full TypeScript implementation with comprehensive documentation

## Project Structure

```
onchain-lego/
├── api/                     # Serverless API routes for Vercel
│   ├── health.ts
│   ├── slot.ts
│   ├── block.ts
│   ├── transaction.ts
│   ├── wallet/[address].ts
│   ├── wallet/[address]/transactions.ts
│   ├── blocks.ts
│   └── ws-info.ts
├── backend/                 # Node.js Express server
│   ├── src/
│   │   ├── services/        # QuickNode, SolanaBridge, TransactionParser, WSManager
│   │   ├── types/           # TypeScript interfaces
│   │   └── server.ts        # Express server setup
│   └── package.json
├── frontend/                # React + Three.js application
│   ├── src/
│   │   ├── components/      # LegoWorld, ObjectDetails, Controls
│   │   ├── engine/          # Three.js renderer and LEGO objects
│   │   ├── hooks/           # useBlockchainData, useLegoWorld
│   │   └── styles/          # CSS styling
│   └── package.json
├── vercel.json              # Vercel configuration
└── README.md                # This file
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- QuickNode account (optional, for live blockchain data)

### Installation

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Environment Configuration

Create `.env` in the project root:

```env
QUICKNODE_RPC_URL=https://your-quicknode.solana-mainnet.quiknode.pro/
QUICKNODE_WS_URL=wss://your-quicknode.solana-mainnet.quiknode.pro/
BACKEND_PORT=3001
FRONTEND_PORT=3000
NODE_ENV=development
```

### Running Locally

```bash
# Terminal 1: Start backend server
cd backend && npm run dev

# Terminal 2: Start frontend development server
cd frontend && npm run dev
```

Access the application at http://localhost:3000

## Deployment

### Vercel (Recommended)

1. Push the repository to GitHub
2. Import the project in Vercel dashboard
3. Configure environment variables (optional)
4. Deploy

Detailed deployment instructions available in [DEPLOYMENT.md](DEPLOYMENT.md)

### Other Platforms

The application can be deployed to any platform supporting:
- Node.js for backend (Express)
- Static site hosting for frontend (React build)
- Serverless functions for API routes

## Architecture

The application follows a clean separation of concerns:

- **Backend**: Node.js with Express, QuickNode SDK, WebSocket server
- **Frontend**: React with TypeScript, Three.js for 3D rendering
- **API**: REST endpoints for blockchain data, WebSocket for real-time events
- **Deployment**: Vercel serverless functions with polling fallback

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md)

## API Reference

### REST Endpoints

- `GET /api/health` - Health check
- `GET /api/slot` - Current blockchain slot
- `GET /api/block/:slot` - Block details
- `GET /api/transaction/:signature` - Transaction details
- `GET /api/wallet/:address` - Wallet information
- `GET /api/wallet/:address/transactions` - Wallet transaction history
- `GET /api/blocks` - Recent blocks

### WebSocket Events

- `transaction` - New transaction detected
- `block` - New block produced
- `wallet_update` - Wallet state change
- `contract_interaction` - Smart contract execution

## Development

For detailed development guide, see [DEVELOPMENT.md](DEVELOPMENT.md)

Key development commands:

```bash
# Backend
cd backend && npm run dev       # Start development server
cd backend && npm run build     # Compile TypeScript
cd backend && npm run lint      # Run ESLint

# Frontend
cd frontend && npm run dev      # Start development server
cd frontend && npm run build    # Build for production
cd frontend && npm run preview  # Preview production build
```

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

## License

MIT License

## Resources

- [Solana Documentation](https://docs.solana.com)
- [QuickNode Documentation](https://www.quicknode.com/docs)
- [Three.js Documentation](https://threejs.org/docs)
- [React Documentation](https://react.dev)
- [Vercel Documentation](https://vercel.com/docs)