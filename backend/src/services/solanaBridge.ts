/**
 * Solana data normalization and transformation
 */

import { Transaction as SolanaTransaction, ParsedTransactionWithMeta } from '@solana/web3.js';
import type { Block, Transaction, Wallet, SmartContract, TokenTransfer, Instruction } from '../types/blockchain.js';

export class SolanaBridgeService {
  /**
   * Normalize a parsed Solana transaction to our Transaction type
   */
  normalizeTransaction(
    parsedTx: ParsedTransactionWithMeta | null,
    signature: string
  ): Transaction | null {
    if (!parsedTx || !parsedTx.transaction) {
      return null;
    }

    const tx = parsedTx.transaction;
    const meta = parsedTx.meta;

    const accounts = tx.message.getAccountKeys().keys.map((key) => key.toBase58());
    const feePayer = accounts[0];
    const programs: string[] = [];
    const tokenTransfers: TokenTransfer[] = [];
    const instructions: Instruction[] = [];

    // Extract programs and instructions
    if (tx.message.instructions) {
      tx.message.instructions.forEach((instruction) => {
        const programId = accounts[instruction.programIdIndex];
        if (programId && !programs.includes(programId)) {
          programs.push(programId);
        }

        instructions.push({
          program: programId,
          data: instruction.data?.toString() || '',
          keys: instruction.accounts.map((idx) => accounts[idx]),
        });
      });
    }

    // Extract token transfers from inner instructions
    if (meta?.innerInstructions) {
      meta.innerInstructions.forEach((inner) => {
        inner.instructions.forEach((instruction: any) => {
          if (instruction.parsed?.type === 'transfer' && instruction.parsed?.info) {
            const info = instruction.parsed.info;
            tokenTransfers.push({
              from: info.source,
              to: info.destination,
              mint: info.mint || 'SOL',
              amount: info.tokenAmount?.amount || '0',
              decimals: info.tokenAmount?.decimals || 9,
            });
          }
        });
      });
    }

    return {
      signature,
      blockTime: parsedTx.blockTime || Math.floor(Date.now() / 1000),
      slot: parsedTx.slot || 0,
      feePayer,
      programs,
      accounts,
      instructions,
      fee: meta?.fee || 5000,
      success: meta?.err === null,
      tokenTransfers,
    };
  }

  /**
   * Extract wallets from a transaction
   */
  extractWalletsFromTransaction(tx: Transaction): Wallet[] {
    const wallets: Map<string, Wallet> = new Map();

    // Add fee payer
    if (tx.feePayer) {
      wallets.set(tx.feePayer, {
        address: tx.feePayer,
        balance: 0,
        totalTransactions: 1,
        label: 'Fee Payer',
      });
    }

    // Add all accounts involved
    tx.accounts.forEach((account) => {
      if (!wallets.has(account)) {
        wallets.set(account, {
          address: account,
          balance: 0,
          totalTransactions: 1,
        });
      }
    });

    // Add sender and receiver from token transfers
    tx.tokenTransfers.forEach((transfer) => {
      if (!wallets.has(transfer.from)) {
        wallets.set(transfer.from, {
          address: transfer.from,
          balance: 0,
          totalTransactions: 1,
          label: 'Token Sender',
        });
      }
      if (!wallets.has(transfer.to)) {
        wallets.set(transfer.to, {
          address: transfer.to,
          balance: 0,
          totalTransactions: 1,
          label: 'Token Receiver',
        });
      }
    });

    return Array.from(wallets.values());
  }

  /**
   * Extract smart contracts/programs from a transaction
   */
  extractContractsFromTransaction(tx: Transaction): SmartContract[] {
    const knownPrograms: Record<string, string> = {
      '11111111111111111111111111111111': 'System Program',
      'TokenkegQfeZyiNwAJsyFbPKLrRQQj6R82cLrTmUu6': 'Token Program',
      '5Q544fKrFoe6tsEbD7K5DKibxD87djqN84Q6BTnSMwV': 'Raydium',
      'JUP4Fb2cqiRUcaTHwUnocjXXjof5DAe4vqNLznEFJsw': 'Jupiter',
      'EPjFWaLb3odccccccccccccccccccccccbonkbonk': 'USDC Token',
    };

    return tx.programs.map((programId) => ({
      address: programId,
      name: knownPrograms[programId],
      type: 'program',
      transactionCount: 1,
      lastInteraction: tx.blockTime,
    }));
  }

  /**
   * Normalize a Solana block
   */
  normalizeBlock(
    block: any,
    slot: number
  ): Block | null {
    if (!block) {
      return null;
    }

    return {
      slot,
      blockTime: block.blockTime || Math.floor(Date.now() / 1000),
      transactionCount: block.transactions?.length || 0,
      leader: block.parentSlot ? `Validator ${slot % 100}` : 'Genesis',
    };
  }

  /**
   * Classify transaction type based on programs involved
   */
  classifyTransaction(tx: Transaction): string {
    if (tx.programs.length === 0) {
      return 'transfer';
    }

    // Check for specific program types
    const hasTokenProgram = tx.programs.some(
      (p) => p === 'TokenkegQfeZyiNwAJsyFbPKLrRQQj6R82cLrTmUu6'
    );
    const hasSystemProgram = tx.programs.some(
      (p) => p === '11111111111111111111111111111111'
    );

    if (hasTokenProgram) return 'token_transfer';
    if (tx.programs.some((p) => p.includes('Raydium'))) return 'swap';
    if (tx.programs.some((p) => p.includes('Jupiter'))) return 'aggregator';
    if (hasSystemProgram) return 'system';

    return 'contract_interaction';
  }

  /**
   * Get a friendly name for a wallet address
   */
  getFriendlyWalletName(address: string): string {
    // Known wallets
    const knownWallets: Record<string, string> = {
      '11111111111111111111111111111111': 'System Program',
      'TokenkegQfeZyiNwAJsyFbPKLrRQQj6R82cLrTmUu6': 'Token Program',
    };

    if (knownWallets[address]) {
      return knownWallets[address];
    }

    // Return shortened address
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }

  /**
   * Format lamports to SOL
   */
  formatSol(lamports: number): number {
    return lamports / 1e9;
  }

  /**
   * Format token amount based on decimals
   */
  formatTokenAmount(amount: string, decimals: number): string {
    const num = BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const quotient = num / divisor;
    const remainder = num % divisor;

    if (remainder === 0n) {
      return quotient.toString();
    }

    const paddedRemainder = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
    return `${quotient}.${paddedRemainder}`;
  }
}

export default SolanaBridgeService;
