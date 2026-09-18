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
    const { query } = request;
    const slot = parseInt(query.slot as string) || Math.floor(Date.now() / 100);
    
    const connection = getConnection();
    
    if (!connection) {
      // Demo mode
      return response.status(200).json({
        slot,
        blockTime: Math.floor(Date.now() / 1000),
        transactionCount: Math.floor(Math.random() * 1000),
        leader: `Validator ${slot % 100}`,
        mode: 'demo',
        message: 'Set QUICKNODE_RPC_URL environment variable for live data'
      });
    }

    const block = await connection.getBlock(slot, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!block) {
      return response.status(404).json({
        error: 'Block not found',
        slot
      });
    }

    response.status(200).json({
      slot: block.parentSlot + 1,
      blockTime: block.blockTime,
      transactionCount: block.transactions?.length || 0,
      leader: `Validator ${(block.parentSlot + 1) % 100}`,
      mode: 'live'
    });
  } catch (error) {
    console.error('Error fetching block:', error);
    response.status(500).json({
      error: 'Failed to fetch block',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}