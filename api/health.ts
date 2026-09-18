import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock response for demo mode
export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: 'demo',
    message: 'Backend is running. Set QUICKNODE_RPC_URL for real data.'
  });
}