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
    const limit = parseInt(request.query.limit as string) || 10;
    const connection = getConnection();
    
    if (!connection || !address) {
      // Demo mode
      const transactions = Array.from({ length: limit }, (_, i) => ({
        signature: `demo-sig-${Date.now()}-${i}`,
        blockTime: Math.floor(Date.now() / 1000) - i * 60,
        slot: Math.floor(Date.now() / 100) - i,
        fee: 5000,
        success: true,
        mode: 'demo'
      }));
      
      return response.status(200).json(transactions);
    }

    try {
      const pubkey = new PublicKey(address as string);
      const signatures = await connection.getSignaturesForAddress(pubkey, {
        limit,
      });

      const transactions = signatures.map(sig => ({
        signature: sig.signature,
        blockTime: sig.blockTime,
        slot: sig.slot,
        fee: 0,
        success: !sig.err,
        mode: 'live'
      }));

      response.status(200).json(transactions);
    } catch (err) {
      return response.status(400).json({
        error: 'Invalid wallet address',
        address
      });
    }
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    response.status(500).json({
      error: 'Failed to fetch wallet transactions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}