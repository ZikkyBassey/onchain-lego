import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection, PublicKey } from '@solana/web3.js';

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
    const { address } = request.query;
    const connection = getConnection();
    
    if (!connection || !address) {
      // Demo mode
      return response.status(200).json({
        address,
        balance: Math.floor(Math.random() * 10000000000),
        totalTransactions: Math.floor(Math.random() * 1000),
        mode: 'demo',
        message: 'Set QUICKNODE_RPC_URL for live wallet data'
      });
    }

    try {
      const pubkey = new PublicKey(address as string);
      const balance = await connection.getBalance(pubkey);
      const signatures = await connection.getSignaturesForAddress(pubkey, {
        limit: 1,
      });

      response.status(200).json({
        address,
        balance,
        totalTransactions: signatures.length,
        mode: 'live'
      });
    } catch (err) {
      // Invalid address or wallet not found
      return response.status(400).json({
        error: 'Invalid wallet address',
        address
      });
    }
  } catch (error) {
    console.error('Error fetching wallet:', error);
    response.status(500).json({
      error: 'Failed to fetch wallet',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}