# Architecture Overview

## System Design

Onchain LEGO is a full-stack application that visualizes Solana blockchain activity in real-time using LEGO metaphors. The system consists of three main layers:

```
┌─────────────────────────────────────────┐
│         Solana Blockchain               │
│     (Mainnet via QuickNode)             │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Backend Services (Node.js)         │
│  - QuickNode RPC/WebSocket Connection   │
│  - Solana Data Normalization            │
│  - Transaction Parsing                  │
│  - Event Broadcasting (WebSocket)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Frontend (React + Three.js)        │
│  - 3D World Rendering                   │
│  - Real-time Event Processing           │
│  - User Interaction & Visualization     │
└─────────────────────────────────────────┘
```

## Backend Architecture

### Layer 1: QuickNode Service
**File**: `backend/src/services/quicknode.ts`

Handles direct communication with Solana blockchain via QuickNode.

**Responsibilities**:
- Fetch current slot and block information
- Retrieve transaction details
- Query wallet balance and transaction history
- Manage WebSocket subscriptions for slot updates and account changes

**Key Methods**:
- `getCurrentSlot()` - Get latest blockchain slot
- `getBlock(slot)` - Fetch block data
- `getTransaction(signature)` - Get transaction details
- `getWalletInfo(address)` - Get wallet balance and tx count
- `onSlotUpdate(callback)` - Subscribe to slot changes

### Layer 2: Solana Bridge Service
**File**: `backend/src/services/solanaBridge.ts`

Normalizes raw Solana data into consistent formats.

**Responsibilities**:
- Convert Solana transactions to normalized format
- Extract wallets from transactions
- Extract smart contracts/programs
- Classify transaction types
- Format token amounts

**Key Methods**:
- `normalizeTransaction(parsedTx, signature)` - Convert to Transaction type
- `extractWalletsFromTransaction(tx)` - Get all wallets
- `extractContractsFromTransaction(tx)` - Get all programs
- `classifyTransaction(tx)` - Determine transaction type

### Layer 3: Transaction Parser Service
**File**: `backend/src/services/transactionParser.ts`

Extracts meaningful insights from transactions.

**Responsibilities**:
- Parse transactions and extract entities
- Generate human-readable insights
- Calculate transaction complexity
- Build transaction flow diagrams
- Estimate network impact

**Key Methods**:
- `parseTransaction(tx)` - Full parsing with insights
- `categorizeTransaction(tx)` - Get transaction category
- `calculateComplexity(tx)` - Complexity score (0-100)
- `estimateNetworkImpact(tx)` - Network metrics

### Layer 4: WebSocket Manager Service
**File**: `backend/src/services/wsManager.ts`

Manages real-time communication with frontend clients.

**Responsibilities**:
- Handle WebSocket connections from clients
- Broadcast blockchain events to all connected clients
- Maintain message queue for late-joining clients
- Handle client subscriptions/filtering

**Key Methods**:
- `broadcast(event)` - Send event to all clients
- `broadcastTransaction(tx)` - Send transaction event
- `broadcastBlock(block)` - Send block event
- `subscribe(channel)` - Client subscription

### Express Server
**File**: `backend/src/server.ts`

Main HTTP server with REST API and WebSocket integration.

**Features**:
- Health check endpoint
- RESTful API for data queries
- WebSocket server integration
- Real-time blockchain monitoring
- Graceful shutdown handling

**Endpoints**:
- `GET /health` - Server status
- `GET /api/slot` - Current slot
- `GET /api/block/:slot` - Block details
- `GET /api/transaction/:signature` - Transaction details
- `GET /api/wallet/:address` - Wallet info
- `GET /api/ws-info` - WebSocket status

## Frontend Architecture

### Layer 1: 3D Engine
**File**: `frontend/src/engine/renderer.ts`

Three.js-based 3D rendering engine.

**Responsibilities**:
- Initialize Three.js scene with lighting
- Manage object lifecycle (add/remove)
- Handle camera and viewport
- Process mouse interactions (raycasting)
- Render frame loop

**Key Methods**:
- `addObject(object)` - Add LEGO object to scene
- `removeObject(id)` - Remove object from scene
- `update(deltaTime)` - Update scene each frame
- `getObjectAtMouse(x, y)` - Pick object under cursor

### Layer 2: LEGO Objects
**Base Class**: `frontend/src/engine/objects/LegoObject.ts`

Abstract base class for all LEGO representations.

**Subclasses**:
- **LegoHouse** - Wallet representation (red, pulsing)
- **LegoCar** - Transaction representation (teal, moving)
- **LegoFactory** - Smart contract representation (yellow, animated)
- **LegoPackage** - Token transfer representation (green, floating)

**Common Features**:
- Shadow casting
- Emission/glow effects
- Animation support
- Click interaction

### Layer 3: Animation System
**File**: `frontend/src/engine/animations.ts`

Handles all object animations with easing functions.

**Supported Animations**:
- Position/movement
- Rotation
- Scale
- Color transitions

**Easing Functions**:
- `easeInOutCubic` - Smooth cubic easing
- `easeInOutQuad` - Smooth quadratic easing
- `easeOutBounce` - Bouncy exit animation

### Layer 4: React Components

#### LegoWorld Component
**File**: `frontend/src/components/LegoWorld.tsx`

Main 3D canvas container.

**Props**:
- `onObjectClick` - Callback when object is clicked
- `isPaused` - Animation pause state
- `animationSpeed` - Playback speed multiplier

#### ObjectDetails Component
**File**: `frontend/src/components/ObjectDetails.tsx`

Displays blockchain data for selected object.

**Features**:
- Expandable sections for data categories
- Transaction details (status, fee, programs)
- Wallet details (balance, transaction count)
- Contract details (interactions, type)
- Raw JSON viewer

#### Controls Component
**File**: `frontend/src/components/Controls.tsx`

Playback and visualization controls.

**Features**:
- Play/pause toggle
- Speed adjustment
- Event filtering
- Advanced visualization options
- Live status indicators

### Layer 5: React Hooks

#### useBlockchainData Hook
**File**: `frontend/src/hooks/useBlockchainData.ts`

WebSocket connection management and event streaming.

**Features**:
- Auto-connect with reconnection logic
- Event queue management
- Typed event callbacks
- Connection status tracking

**Returns**:
- `isConnected` - Connection status
- `eventQueue` - Recent events buffer
- `sendMessage(message)` - Send to backend
- `subscribe/unsubscribe` - Channel management

#### useLegoWorld Hook
**File**: `frontend/src/hooks/useLegoWorld.ts`

World state management (objects, selections, controls).

**State**:
- `objects` - Map of all LEGO objects
- `selectedObject` - Currently selected object
- `isPaused` - Animation pause state
- `animationSpeed` - Playback speed
- `filterType` - Current event filter

## Data Flow

### Real-time Event Flow

```
1. Blockchain Event
   ↓
2. QuickNode Service (fetch data)
   ↓
3. Solana Bridge (normalize)
   ↓
4. Transaction Parser (extract insights)
   ↓
5. WebSocket Manager (broadcast)
   ↓
6. Frontend useBlockchainData Hook (receive)
   ↓
7. React State Update (useLegoWorld)
   ↓
8. Add LEGO Object (Renderer)
   ↓
9. Animate Object (Animation System)
   ↓
10. Render Frame (Three.js)
```

## Type System

### Core Types
**File**: `backend/src/types/blockchain.ts`

```typescript
interface Transaction {
  signature: string;
  blockTime: number;
  slot: number;
  feePayer: string;
  programs: string[];
  accounts: string[];
  instructions: Instruction[];
  fee: number;
  success: boolean;
  tokenTransfers: TokenTransfer[];
}

interface Wallet {
  address: string;
  balance: number;
  totalTransactions: number;
  label?: string;
}

interface LegoObjectData {
  id: string;
  type: 'house' | 'car' | 'factory' | 'package' | 'station';
  position: Vector3;
  blockchainData: any;
}

interface WorldEvent {
  type: 'transaction' | 'block' | 'wallet_update' | 'contract_interaction';
  timestamp: number;
  data: Transaction | Block | Wallet | SmartContract;
}
```

## Communication Protocols

### REST API
- Synchronous request/response
- Used for initial data fetches and status queries
- Example: `GET /api/wallet/:address`

### WebSocket
- Bidirectional real-time communication
- Push-based event streaming
- Used for live blockchain updates
- Connection URL: `ws://localhost:4001`

## Performance Considerations

### Backend
- **Caching**: Store frequently accessed data (wallets, programs)
- **Rate Limiting**: Prevent excessive QuickNode API calls
- **Connection Pooling**: Manage WebSocket connections efficiently
- **Event Batching**: Combine multiple events before broadcasting

### Frontend
- **Object Pooling**: Reuse LEGO objects instead of creating/destroying
- **Frustum Culling**: Only render visible objects
- **Level of Detail (LOD)**: Simplify distant objects
- **Lazy Loading**: Load Three.js assets on demand

## Scalability

### Current Limitations
- Single backend instance
- In-memory WebSocket client tracking
- No database for historical data

### Future Improvements
- Load balancing with multiple backend instances
- Redis for client session management
- PostgreSQL for historical blockchain data
- Caching layer (Memcached/Redis)

## Security Considerations

1. **Input Validation**: Validate all wallet addresses and signatures
2. **Rate Limiting**: Prevent API abuse
3. **CORS**: Configure CORS properly for production
4. **WebSocket Authentication**: Add auth tokens for production
5. **Error Handling**: Don't leak sensitive information in errors

## Error Handling

### Backend
- Try/catch blocks around external API calls
- Graceful degradation when QuickNode is unavailable
- Clear error messages for debugging

### Frontend
- User-friendly error notifications
- Automatic reconnection with exponential backoff
- Fallback UI states (loading, error, disconnected)

## Testing Strategy

### Unit Tests
- Service layer logic (parsing, normalization)
- React hook behavior
- Animation calculations

### Integration Tests
- Backend API endpoints
- WebSocket message flow
- Full data pipeline

### E2E Tests
- User interactions (clicking objects, changing controls)
- Real-time updates from backend
- Disconnection/reconnection scenarios
