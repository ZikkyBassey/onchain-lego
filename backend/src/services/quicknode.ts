/**
 * QuickNode RPC and WebSocket connection management
 */

import { Connection, PublicKey, ConfirmedSignatureInfo } from '@solana/web3.js';

export class QuickNodeService {
  private connection: Connection;
  private wsUrl: string;
  private rpcUrl: string;

  constructor(rpcUrl: string, wsUrl: string) {
    this.rpcUrl = rpcUrl;
    this.wsUrl = wsUrl;
    this.connection = new Connection(rpcUrl, 'confirmed');
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
   * Subscribe to slot notifications
   */
  onSlotUpdate(callback: (slot: number) => void) {
    return this.connection.onSlotChange((slotInfo) => {
      callback(slotInfo.slot);
    });
  }

  /**
   * Subscribe to account changes
   */
  onAccountChange(address: string, callback: (account: any) => void) {
    try {
      const pubkey = new PublicKey(address);
      return this.connection.onAccountChange(pubkey, callback);
    } catch (error) {
      console.error(`Error subscribing to account changes for ${address}:`, error);
      return null;
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
    // Connection is stateless, nothing to close
  }
}

export default QuickNodeService;
