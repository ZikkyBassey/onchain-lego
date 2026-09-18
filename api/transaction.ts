import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const { query } = request;
  const signature = query.signature as string || 'demo-sig';

  response.status(200).json({
    transaction: {
      signature: signature,
      blockTime: Math.floor(Date.now() / 1000),
      slot: Math.floor(Date.now() / 100),
      feePayer: '11111111111111111111111111111111',
      programs: ['System Program', 'Token Program'],
      accounts: ['11111111111111111111111111111111', 'TokenkegQfeZyiNwAJsyFbPKLrRQQj6R82cLrTmUu6'],
      instructions: [
        { program: 'System Program', data: '01', keys: ['from', 'to'] }
      ],
      fee: 5000,
      success: true,
      tokenTransfers: []
    },
    insights: [
      '✓ Demo transaction successful',
      '⚙️ Simple transfer (no complex programs)',
      '💸 Fee: 0.000005 SOL',
      '👥 Direct transfer between accounts'
    ],
    note: 'Demo mode - set QUICKNODE_RPC_URL for real blockchain data'
  });
}