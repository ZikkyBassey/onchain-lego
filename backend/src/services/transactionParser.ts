/**
 * Transaction parsing and extraction of blockchain insights
 */

import type { Transaction, Wallet, SmartContract, TokenTransfer } from '../types/blockchain.js';

export class TransactionParserService {
  /**
   * Parse a transaction and extract all relevant entities
   */
  parseTransaction(tx: Transaction) {
    return {
      transaction: tx,
      wallets: this.extractWallets(tx),
      contracts: this.extractContracts(tx),
      tokenTransfers: this.extractTokenTransfers(tx),
      transactionFlow: this.buildTransactionFlow(tx),
      insights: this.generateInsights(tx),
    };
  }

  /**
   * Extract unique wallets involved in transaction
   */
  private extractWallets(tx: Transaction): Map<string, Wallet> {
    const wallets = new Map<string, Wallet>();

    // Add fee payer
    wallets.set(tx.feePayer, {
      address: tx.feePayer,
      balance: 0,
      totalTransactions: 1,
      label: 'Fee Payer',
    });

    // Add all accounts
    tx.accounts.forEach((account) => {
      if (!wallets.has(account)) {
        wallets.set(account, {
          address: account,
          balance: 0,
          totalTransactions: 1,
        });
      } else {
        const wallet = wallets.get(account)!;
        wallet.totalTransactions++;
      }
    });

    // Add token transfer participants
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

    return wallets;
  }

  /**
   * Extract smart contracts/programs
   */
  private extractContracts(tx: Transaction): Map<string, SmartContract> {
    const contracts = new Map<string, SmartContract>();

    tx.programs.forEach((program) => {
      contracts.set(program, {
        address: program,
        name: this.getProgramName(program),
        type: 'program',
        transactionCount: 1,
        lastInteraction: tx.blockTime,
      });
    });

    return contracts;
  }

  /**
   * Extract token transfers
   */
  private extractTokenTransfers(tx: Transaction): TokenTransfer[] {
    return tx.tokenTransfers;
  }

  /**
   * Build a flow diagram of transaction movement
   */
  private buildTransactionFlow(tx: Transaction) {
    const flows: Array<{
      from: string;
      to: string;
      type: string;
      amount?: string;
      mint?: string;
    }> = [];

    // Token transfers
    tx.tokenTransfers.forEach((transfer) => {
      flows.push({
        from: transfer.from,
        to: transfer.to,
        type: 'token_transfer',
        amount: transfer.amount,
        mint: transfer.mint,
      });
    });

    // If no token transfers, show instruction flow
    if (flows.length === 0 && tx.instructions.length > 0) {
      // Simplified flow: first account to last account through programs
      const firstAccount = tx.accounts[0];
      const lastAccount = tx.accounts[tx.accounts.length - 1];

      if (firstAccount && lastAccount && firstAccount !== lastAccount) {
        flows.push({
          from: firstAccount,
          to: lastAccount,
          type: 'instruction_flow',
        });
      }
    }

    return flows;
  }

  /**
   * Generate human-readable insights about transaction
   */
  private generateInsights(tx: Transaction) {
    const insights: string[] = [];

    // Transaction status
    if (tx.success) {
      insights.push('✓ Transaction successful');
    } else {
      insights.push('✗ Transaction failed');
    }

    // Program count
    if (tx.programs.length > 1) {
      insights.push(`⚙️ Involves ${tx.programs.length} programs`);
    } else if (tx.programs.length === 1) {
      insights.push(`⚙️ Single program: ${this.getProgramName(tx.programs[0])}`);
    }

    // Token transfers
    if (tx.tokenTransfers.length > 0) {
      insights.push(`💰 ${tx.tokenTransfers.length} token transfer(s)`);
    }

    // Fee
    const solFee = tx.fee / 1e9;
    if (solFee > 0.01) {
      insights.push(`💸 High fee: ${solFee} SOL`);
    } else {
      insights.push(`💸 Fee: ${solFee} SOL`);
    }

    // Account count
    if (tx.accounts.length > 5) {
      insights.push(`👥 Complex: ${tx.accounts.length} accounts involved`);
    }

    return insights;
  }

  /**
   * Get friendly name for a program
   */
  private getProgramName(programId: string): string | undefined {
    const knownPrograms: Record<string, string> = {
      '11111111111111111111111111111111': 'System Program',
      'TokenkegQfeZyiNwAJsyFbPKLrRQQj6R82cLrTmUu6': 'Token Program',
      '5Q544fKrFoe6tsEbD7K5DKibxD87djqN84Q6BTnSMwV': 'Raydium',
      'JUP4Fb2cqiRUcaTHwUnocjXXjof5DAe4vqNLznEFJsw': 'Jupiter',
      'EPjFWaLb3odccccccccccccccccccccccbonkbonk': 'USDC Token',
      'metaqbxxUerdq28cj1RbAqoQq/Khs5UqvKH5THrJ55': 'Metaplex',
    };

    return knownPrograms[programId];
  }

  /**
   * Categorize transaction by type
   */
  categorizeTransaction(tx: Transaction): string {
    if (tx.tokenTransfers.length > 0) {
      return 'token_transfer';
    }

    const hasSwap = tx.programs.some((p) =>
      ['Raydium', 'Jupiter', 'Orca'].some((name) => p.toLowerCase().includes(name.toLowerCase()))
    );
    if (hasSwap) return 'swap';

    const hasNFT = tx.programs.some((p) => p.includes('Metaplex'));
    if (hasNFT) return 'nft';

    return 'system_transaction';
  }

  /**
   * Calculate transaction complexity score (0-100)
   */
  calculateComplexity(tx: Transaction): number {
    let score = 0;

    // Program count
    score += Math.min(tx.programs.length * 10, 30);

    // Account count
    score += Math.min(tx.accounts.length * 2, 30);

    // Instructions
    score += Math.min(tx.instructions.length * 5, 20);

    // Token transfers
    score += Math.min(tx.tokenTransfers.length * 10, 20);

    return Math.min(score, 100);
  }

  /**
   * Estimate network impact (gas, propagation time, etc.)
   */
  estimateNetworkImpact(tx: Transaction) {
    return {
      fee: tx.fee,
      feePerByte: tx.fee / (tx.instructions.length * 100 + 1),
      complexity: this.calculateComplexity(tx),
      programCount: tx.programs.length,
      accountCount: tx.accounts.length,
    };
  }
}

export default TransactionParserService;
