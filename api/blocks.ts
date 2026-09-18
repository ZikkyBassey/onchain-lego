import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection } from '@solana/web3.js';

const getConnection = () => {
  const rpcUrl = process.env.QUICKNODE_RPC_URL;
  if (!rpcUrl) {
    return null;
  }
  return new Connection(rpcUrl, 'confirmed');
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const limit = parseInt(request.query.limit as string) || 10;
    const connection = getConnection();
    
    if (!connection) {
      // Demo mode
      const currentSlot = Math.floor(Date.now() / 100);
      const blocks = Array.from({ length: limit }, (_, i) => ({
        slot: currentSlot - i,
        blockTime: Math.floor(Date.now() / 1000) - i * 400,
        transactionCount: Math.floor(Math.random() * 1000),
        leader: `Validator ${(currentSlot - i) % 100}`,
        mode: 'demo'
      }));
      
      return response.status(200).json(blocks);
    }

    const currentSlot = await connection.getSlot();
    const blocks = [];
    
    for (let i = 0; i < limit; i++) {
      const slot = currentSlot - i;
      try {
        const block = await connection.getBlock(slot, {
          maxSupportedTransactionVersion: 0,
        });
        
        blocks.push({
          slot,
          blockTime: block?.blockTime || Math.floor(Date.now() / 1000) - i * 400,
          transactionCount: block?.transactions?.length || 0,
          leader: `Validator ${slot % 100}`,
          mode: 'live'
        });
      } catch {
        blocks.push({
          slot,
          blockTime: Math.floor(Date.now() / 1000) - i * 400,
          transactionCount: 0,
          leader: `Validator ${slot % 100}`,
          mode: 'live'
        });
      }
    }

    response.status(200).json(blocks);
  } catch (error) {
    console.error('Error fetching blocks:', error);
    response.status(500).json({
      error: 'Failed to fetch blocks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}