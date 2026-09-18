import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock slot data for demo
export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const mockSlot = Math.floor(Date.now() / 100);
  
  response.status(200).json({
    slot: mockSlot,
    note: 'Demo mode - set QUICKNODE_RPC_URL for real blockchain data'
  });
}