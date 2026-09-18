import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const limit = parseInt(request.query.limit as string) || 10;
  const currentSlot = Math.floor(Date.now() / 100);
  
  // Generate mock blocks
  const blocks = Array.from({ length: limit }, (_, i) => ({
    slot: currentSlot - i,
    blockTime: Math.floor(Date.now() / 1000) - i * 0.4,
    transactionCount: Math.floor(Math.random() * 1000),
    leader: `Validator ${(currentSlot - i) % 100}`
  }));
  
  response.status(200).json(blocks);
}