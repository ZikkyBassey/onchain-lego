import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { query } = request;
  const slot = parseInt(query.slot as string) || Math.floor(Date.now() / 100);

  response.status(200).json({
    slot,
    blockTime: Math.floor(Date.now() / 1000),
    transactionCount: Math.floor(Math.random() * 1000),
    leader: `Validator ${slot % 100}`,
    note: 'Demo mode - set QUICKNODE_RPC_URL for real blockchain data'
  });
}