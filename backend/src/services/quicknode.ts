/**
 * QuickNode RPC and WebSocket connection management for live Solana data
 */

import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';

export type TransactionCallback = (signature: string, transaction: ParsedTransactionWithMeta) => void;
export type BlockCallback = (slot: number, transactionCount: number) => void;

export class QuickNodeService {
  private connection: Connection;
  private wsUrl: string;
  private rpcUrl: string;
  private lastProcessedSlot: number = 0;
  private transactionCallbacks: TransactionCallback[] = [];
  private blockCallbacks: BlockCallback[] = [];
  private isMonitoring: boolean = false;
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(rpcUrl: string, wsUrl: string) {
    this.rpcUrl = rpcUrl;
    this.wsUrl = wsUrl;
    this.connection = new Connection(rpcUrl, 'confirmed');
    console.log('QuickNode service initialized for', rpcUrl);
  }

  /**
   * Start monitoring for new blocks and transactions
   * This is the key method that enables live transaction streaming
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting real-time transaction monitoring...');
    
    // Poll for new blocks every 400ms (Solana target block time)
    this.monitorInterval = setInterval(async () => {
      try {
        const currentSlot = await this.connection.getSlot();
        
        // Only process new blocks
        if (currentSlot > this.lastProcessedSlot) {
          const block = await this.connection.getBlock(currentSlot, {
            maxSupportedTransactionVersion: 0,
          });
          
          if (block && block.transactions) {
            // Notify block callbacks
            this.blockCallbacks.forEach(cb => cb(currentSlot, block.transactions.length));
            
            // Process all transactions in the block
            for (const tx of block.transactions) {
              if (tx.transaction.signature) {
                // Fetch full transaction details
                const fullTx = await this.connection.getParsedTransaction(
                  tx.transaction.signature,
                  { maxSupportedTransactionVersion: 0 }
                );
                
                if (fullTx) {
                  // Notify transaction callbacks
                  this.transactionCallbacks.forEach(cb => 
                    cb(tx.transaction.signature, fullTx)
                  );
                }
              }
            }
            
            this.lastProcessedSlot = currentSlot;
          }
        }
      } catch (error) {
        console.error('Error in monitoring loop:', error);
      }
    }, 400);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
    console.log('Transaction monitoring stopped');
  }

  /**
   * Subscribe to new transactions
   */
  onTransaction(callback: TransactionCallback): () => void {
    this.transactionCallbacks.push(callback);
    // Return unsubscribe function
    return () => {
      this.transactionCallbacks = this.transactionCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to new blocks
   */
  onBlock(callback: BlockCallback): () => void {
    this.blockCallbacks.push(callback);
    // Return unsubscribe function
    return () => {
      this.blockCallbacks = this.blockCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Get the current slot number
   */
  async getCurrentSlot(): Promise<number> {
    return this.connection.getSlot();
  }

  /**
   * Get block information
   */
  async getBlock(slot: number) {
    try {
      return await this.connection.getBlock(slot, {
        maxSupportedTransactionVersion: 0,
      });
    } catch (error) {
      console.error(`Error fetching block ${slot}:`, error);
      return null;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string) {
    try {
      return await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
    } catch (error) {
      console.error(`Error fetching transaction ${signature}:`, error);
      return null;
    }
  }

  /**
   * Get wallet balance and transaction count
   */
  async getWalletInfo(address: string) {
    try {
      const pubkey = new PublicKey(address);
      const balance = await this.connection.getBalance(pubkey);

      const signatures = await this.connection.getSignaturesForAddress(pubkey, {
        limit: 1,
      });

      return {
        address,
        balance,
        totalTransactions: signatures.length,
      };
    } catch (error) {
      console.error(`Error fetching wallet info for ${address}:`, error);
      return null;
    }
  }

  /**
   * Get recent transactions for a wallet
   */
  async getWalletTransactions(address: string, limit: number = 10) {
    try {
      const pubkey = new PublicKey(address);
      return await this.connection.getSignaturesForAddress(pubkey, {
        limit,
      });
    } catch (error) {
      console.error(`Error fetching transactions for ${address}:`, error);
      return [];
    }
  }

  /**
   * Get token supply and information
   */
  async getTokenInfo(mint: string) {
    try {
      const pubkey = new PublicKey(mint);
      return await this.connection.getParsedAccountInfo(pubkey);
    } catch (error) {
      console.error(`Error fetching token info for ${mint}:`, error);
      return null;
    }
  }

  /**
   * Get recent confirmed blocks
   */
  async getRecentBlocks(limit: number = 10): Promise<number[]> {
    try {
      const slot = await this.connection.getSlot();
      const slots: number[] = [];

      for (let i = 0; i < limit; i++) {
        slots.push(slot - i);
      }

      return slots;
    } catch (error) {
      console.error('Error fetching recent blocks:', error);
      return [];
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.connection !== null;
  }

  /**
   * Close connections
   */
  close() {
    this.stopMonitoring();
  }
}

export default QuickNodeService;