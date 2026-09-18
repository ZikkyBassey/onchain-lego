import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Connection } from '@solana/web3.js';

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
    const { query } = request;
    const signature = query.signature as string;
    
    const connection = getConnection();
    
    if (!connection || !signature) {
      // Demo mode
      return response.status(200).json({
        transaction: {
          signature: signature || 'demo-signature-' + Date.now(),
          blockTime: Math.floor(Date.now() / 1000),
          slot: Math.floor(Date.now() / 100),
          feePayer: '11111111111111111111111111111111',
          programs: ['System Program', 'Token Program'],
          accounts: ['11111111111111111111111111111111'],
          instructions: [],
          fee: 5000,
          success: true,
          tokenTransfers: []
        },
        insights: [
          'Transaction successful',
          'Simple transfer',
          'Fee: 0.000005 SOL'
        ],
        mode: 'demo',
        message: 'Set QUICKNODE_RPC_URL for live transaction data'
      });
    }

    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!tx) {
      return response.status(404).json({
        error: 'Transaction not found',
        signature
      });
    }

    // Extract basic info
    const accounts = tx.transaction.message.getAccountKeys().keys.map(k => k.toBase58());
    const feePayer = accounts[0];
    
    const result = {
      transaction: {
        signature,
        blockTime: tx.blockTime,
        slot: tx.slot,
        feePayer,
        programs: [...new Set(tx.transaction.message.instructions.map(i => accounts[i.programIdIndex]))],
        accounts,
        instructions: tx.transaction.message.instructions.map(i => ({
          program: accounts[i.programIdIndex],
          data: i.data?.toString() || '',
          keys: i.accounts.map(idx => accounts[idx])
        })),
        fee: tx.meta?.fee || 5000,
        success: tx.meta?.err === null,
        tokenTransfers: []
      },
      insights: [
        tx.meta?.err === null ? 'Transaction successful' : 'Transaction failed',
        `Fee: ${(tx.meta?.fee || 5000) / 1e9} SOL`,
        `${accounts.length} accounts involved`
      ],
      mode: 'live'
    };

    response.status(200).json(result);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    response.status(500).json({
      error: 'Failed to fetch transaction',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}