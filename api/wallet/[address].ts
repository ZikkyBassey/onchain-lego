import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { address } = request.query;
  
  // Mock wallet data
  response.status(200).json({
    address,
    balance: Math.floor(Math.random() * 10000000000),
    totalTransactions: Math.floor(Math.random() * 1000),
    label: address === '11111111111111111111111111111111' ? 'System Program' : 'Wallet'
  });
}