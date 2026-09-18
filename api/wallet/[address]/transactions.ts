import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { address } = request.query;
  const limit = parseInt(request.query.limit as string) || 10;
  
  // Generate mock transactions
  const transactions = Array.from({ length: limit }, (_, i) => ({
    signature: `${Math.random().toString(36).substr(2, 44)}`,
    blockTime: Math.floor(Date.now() / 1000) - i * 60,
    slot: Math.floor(Date.now() / 100) - i,
    fee: 5000,
    success: true
  }));
  
  response.status(200).json(transactions);
}