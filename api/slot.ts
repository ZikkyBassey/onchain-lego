import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection } from '@solana/web3.js';

// Initialize connection for serverless function
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
    const connection = getConnection();
    
    if (!connection) {
      // Return demo mode response
      return response.status(200).json({
        slot: Math.floor(Date.now() / 100),
        mode: 'demo',
        message: 'Set QUICKNODE_RPC_URL environment variable for live data'
      });
    }

    const slot = await connection.getSlot();
    
    response.status(200).json({
      slot,
      mode: 'live',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error fetching slot:', error);
    response.status(500).json({
      error: 'Failed to fetch slot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}