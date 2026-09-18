# 🧱 Onchain LEGO

> Watch the Solana blockchain come to life through LEGO.

Interactive LEGO-style world that visualizes real blockchain activity on Solana in real-time. See wallets as houses, transactions as cars, smart contracts as factories, and token transfers as packages—all animated in a beautiful 3D environment.

## ✨ Features

- **🏗️ Real-time 3D Visualization** - Watch Solana transactions animate in 3D
- **🏠 Blockchain Metaphors** - Wallets, transactions, contracts, and tokens represented as LEGO objects
- **⚡ Live Updates** - WebSocket-powered real-time blockchain monitoring
- **🎮 Interactive** - Click objects to see detailed blockchain data
- **🎛️ Playback Controls** - Pause, rewind, adjust speed
- **📊 Data Panels** - View transaction details, wallet info, contract interactions
- **🌐 Solana Integration** - Powered by QuickNode for reliable blockchain data

## 🎯 Concept

Blockchain activity represented as familiar LEGO objects:

| Blockchain Component | LEGO Representation |
|---|---|
| **Wallets** | 🏠 LEGO Houses (red, pulsing) |
| **Transactions** | 🚗 LEGO Cars (teal, moving) |
| **Smart Contracts** | 🏭 LEGO Factories (yellow, animated) |
| **Token Transfers** | 📦 LEGO Packages (green, floating) |
| **Network Activity** | 🌍 Continuous movement & change |

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0+
- **npm** 9.0+
- **QuickNode Account** (free at https://quicknode.com)

### Installation

```bash
# Clone and navigate
cd on-chain-lego

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Setup Environment

Create `.env` in project root:

```env
# Get these from https://quicknode.com
QUICKNODE_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/
QUICKNODE_WS_URL=wss://your-endpoint.solana-mainnet.quiknode.pro/

BACKEND_PORT=3001
FRONTEND_PORT=3000
NODE_ENV=development
```

### Run

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` 🎉

## 📚 Documentation

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Detailed setup, scripts, and development guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, data flow, and technical details

## 🏗️ Project Structure

```
on-chain-lego/
├── backend/                          # Node.js + Express server
│   ├── src/
│   │   ├── services/
│   │   │   ├── quicknode.ts          # Solana RPC connection
│   │   │   ├── solanaBridge.ts       # Data normalization
│   │   │   ├── transactionParser.ts  # Insights extraction
│   │   │   └── wsManager.ts          # WebSocket broadcast
│   │   ├── types/
│   │   │   └── blockchain.ts         # Shared types
│   │   └── server.ts
│   ├── dist/
│   └── package.json
│
├── frontend/                         # React + Three.js client
│   ├── src/
│   │   ├── components/
│   │   │   ├── LegoWorld.tsx         # Main 3D canvas
│   │   │   ├── ObjectDetails.tsx     # Data panel
│   │   │   └── Controls.tsx          # Playback controls
│   │   ├── engine/
│   │   │   ├── renderer.ts           # Three.js setup
│   │   │   ├── animations.ts         # Animation system
│   │   │   └── objects/
│   │   │       ├── LegoHouse.ts      # Wallet objects
│   │   │       ├── LegoCar.ts        # Transaction objects
│   │   │       ├── LegoFactory.ts    # Contract objects
│   │   │       ├── LegoPackage.ts    # Transfer objects
│   │   │       └── LegoObject.ts     # Base class
│   │   ├── hooks/
│   │   │   ├── useBlockchainData.ts  # WebSocket hook
│   │   │   └── useLegoWorld.ts       # State management
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
│
├── .env                              # Configuration (create this)
├── .gitignore
├── DEVELOPMENT.md                    # Development guide
├── ARCHITECTURE.md                   # Technical architecture
└── README.md                         # This file
```

## 🎮 How to Use

1. **View the World** - 3D LEGO world shows real-time blockchain activity
2. **Click Objects** - Select any LEGO object to see detailed data
3. **Control Playback** - Use controls panel to pause, adjust speed
4. **Filter Events** - Focus on specific types of blockchain activity
5. **Explore Data** - Expand sections in object details to see transaction info

## 🔌 API Endpoints

### REST API

```
GET  /health                          # Server status
GET  /api/slot                        # Current slot
GET  /api/block/:slot                 # Block details
GET  /api/transaction/:signature      # Transaction details
GET  /api/wallet/:address             # Wallet information
GET  /api/wallet/:address/transactions # Wallet history
GET  /api/blocks?limit=10             # Recent blocks
GET  /api/ws-info                     # WebSocket status
```

### WebSocket Events

Connection: `ws://localhost:4001`

Events:
- `transaction` - New transaction
- `block` - New block
- `wallet_update` - Wallet state change
- `contract_interaction` - Program execution

## 🛠️ Available Commands

### Backend
```bash
npm run dev       # Start with hot reload
npm run build     # Compile TypeScript
npm run start     # Run compiled server
npm run lint      # Lint code
npm run typecheck # Check types
```

### Frontend
```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview build
npm run lint      # Lint code
npm run typecheck # Check types
```

## 💡 Examples

### Adding a New LEGO Object Type

```typescript
// frontend/src/engine/objects/LegoValidator.ts
import { LegoObject } from './LegoObject';

export class LegoValidator extends LegoObject {
  constructor(data: LegoObjectData) {
    super(data);
    this.baseColor = new THREE.Color(0xff8b94);
    this.create();
  }

  create(): void {
    // Build 3D geometry
  }

  update(time: number): void {
    // Animation logic
  }
}
```

### Subscribing to Events

```typescript
const { eventQueue } = useBlockchainData({
  onTransaction: (tx) => {
    console.log('New transaction:', tx);
    // Create animation
  },
  onBlock: (block) => {
    console.log('New block:', block);
  }
});
```

## 🎨 Customization

### Colors
LEGO object colors are defined in their constructors:
- LegoHouse: `0xff6b6b` (red)
- LegoCar: `0x4ecdc4` (teal)
- LegoFactory: `0xffd93d` (yellow)
- LegoPackage: `0xa8e6cf` (green)

### Animations
Modify animation speed and easing in `frontend/src/engine/animations.ts`

### Theme
Update color scheme in `frontend/src/styles/App.css`

## 🚦 Next Steps

- [ ] Connect to production Solana RPC
- [ ] Add more LEGO object types (validators, NFTs)
- [ ] Implement transaction replay mode
- [ ] Add statistics dashboard
- [ ] Enable collaborative viewing
- [ ] Deploy to production

## 📖 Learning Resources

- [Solana Docs](https://docs.solana.com)
- [QuickNode Docs](https://www.quicknode.com/docs)
- [Three.js Docs](https://threejs.org/docs)
- [React Docs](https://react.dev)

## 🤝 Contributing

Contributions welcome! Please feel free to submit PRs or open issues.

## 📄 License

MIT - See LICENSE file for details

## 🙋 Support

- 📖 Check [DEVELOPMENT.md](./DEVELOPMENT.md) for setup help
- 🏗️ Review [ARCHITECTURE.md](./ARCHITECTURE.md) for design details
- 💬 Open an issue for bugs or feature requests

---

**Made with 🧱 and ⚡ for blockchain visualization**
