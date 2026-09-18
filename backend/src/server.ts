/**
 * Express server setup with WebSocket integration
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import QuickNodeService from './services/quicknode.js';
import SolanaBridgeService from './services/solanaBridge.js';
import TransactionParserService from './services/transactionParser.js';
import WSManager from './services/wsManager.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const WS_PORT = (parseInt(process.env.BACKEND_PORT as string) || 3001) + 1000;

// Initialize services
let quicknode: QuickNodeService | null = null;

if (process.env.QUICKNODE_RPC_URL && process.env.QUICKNODE_WS_URL) {
  try {
    quicknode = new QuickNodeService(
      process.env.QUICKNODE_RPC_URL,
      process.env.QUICKNODE_WS_URL
    );
  } catch (error) {
    console.warn('⚠️  QuickNode service initialization failed:', error);
    console.warn('ℹ️  Running in demo mode without live blockchain data');
  }
} else {
  console.log('ℹ️  No QuickNode credentials provided - running in demo mode');
  console.log('ℹ️  To enable live blockchain data, set QUICKNODE_RPC_URL and QUICKNODE_WS_URL in .env');
}

const solanaBridge = new SolanaBridgeService();
const transactionParser = new TransactionParserService();
const wsManager = new WSManager(WS_PORT as number);

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes

/**
 * Health check
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    wsClients: wsManager.getClientCount(),
  });
});

/**
 * Get current slot
 */
app.get('/api/slot', async (req: Request, res: Response) => {
  try {
    const slot = await quicknode.getCurrentSlot();
    res.json({ slot });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current slot' });
  }
});

/**
 * Get block details
 */
app.get('/api/block/:slot', async (req: Request, res: Response) => {
  try {
    const { slot } = req.params;
    const block = await quicknode.getBlock(parseInt(slot));

    if (!block) {
      return res.status(404).json({ error: 'Block not found' });
    }

    const normalized = solanaBridge.normalizeBlock(block, parseInt(slot));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch block' });
  }
});

/**
 * Get transaction details
 */
app.get('/api/transaction/:signature', async (req: Request, res: Response) => {
  try {
    const { signature } = req.params;
    const tx = await quicknode.getTransaction(signature);

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const normalized = solanaBridge.normalizeTransaction(tx, signature);
    const parsed = transactionParser.parseTransaction(normalized!);

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

/**
 * Get wallet information
 */
app.get('/api/wallet/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const walletInfo = await quicknode.getWalletInfo(address);

    if (!walletInfo) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json(walletInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

/**
 * Get wallet transactions
 */
app.get('/api/wallet/:address/transactions', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const transactions = await quicknode.getWalletTransactions(address, limit);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet transactions' });
  }
});

/**
 * Get recent blocks
 */
app.get('/api/blocks', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const slots = await quicknode.getRecentBlocks(limit);

    const blocks = await Promise.all(
      slots.map(async (slot) => {
        const block = await quicknode.getBlock(slot);
        return solanaBridge.normalizeBlock(block, slot);
      })
    );

    res.json(blocks.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

/**
 * Get WebSocket connection info
 */
app.get('/api/ws-info', (req: Request, res: Response) => {
  res.json({
    wsPort: WS_PORT,
    clients: wsManager.getClientCount(),
    queueSize: wsManager.getMessageQueue().length,
  });
});

/**
 * Listen for WebSocket events from frontend and process
 */
wsManager.onClientMessage((data, ws) => {
  if (data.type === 'subscribe') {
    console.log(`Client subscribed to ${data.channel}`);
  } else if (data.type === 'unsubscribe') {
    console.log(`Client unsubscribed from ${data.channel}`);
  }
});

/**
 * Start monitoring blockchain for events
 */
async function startBlockchainMonitoring() {
  if (!quicknode) {
    console.log('ℹ️  Blockchain monitoring skipped (not connected)');
    return;
  }

  console.log('Starting blockchain monitoring...');

  // Monitor slot changes
  if (quicknode.isConnected()) {
    quicknode.onSlotUpdate((slot: number) => {
      console.log(`New slot: ${slot}`);

      // Broadcast to frontend
      wsManager.broadcast({
        type: 'block',
        timestamp: Date.now(),
        data: {
          slot,
          blockTime: Math.floor(Date.now() / 1000),
          transactionCount: 0,
          leader: `Validator ${slot % 100}`,
        },
      });
    });
  }
}

/**
 * Error handling middleware
 */
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

/**
 * Start server
 */
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║   Onchain LEGO Backend Server         ║
╚═══════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}
🔌 WebSocket server on ws://localhost:${WS_PORT}
📊 Environment: ${process.env.NODE_ENV || 'development'}
  `);

  startBlockchainMonitoring();
});

/**
 * Graceful shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    wsManager.close();
    quicknode.close();
    process.exit(0);
  });
});

export default app;
