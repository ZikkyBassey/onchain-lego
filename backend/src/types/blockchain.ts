/**
 * Shared blockchain types for Solana data structures
 */

export interface Wallet {
  address: string;
  balance: number; // in lamports
  totalTransactions: number;
  label?: string;
}

export interface Transaction {
  signature: string;
  blockTime: number;
  slot: number;
  feePayer: string;
  programs: string[];
  accounts: string[];
  instructions: Instruction[];
  fee: number;
  success: boolean;
  tokenTransfers: TokenTransfer[];
}

export interface Instruction {
  program: string;
  data: string;
  keys: string[];
}

export interface TokenTransfer {
  from: string;
  to: string;
  mint: string;
  amount: string;
  decimals: number;
}

export interface SmartContract {
  address: string;
  name?: string;
  type: 'program' | 'token';
  transactionCount: number;
  lastInteraction: number;
}

export interface Block {
  slot: number;
  blockTime: number;
  transactionCount: number;
  leader: string;
}

export interface WorldEvent {
  type: 'transaction' | 'block' | 'wallet_update' | 'contract_interaction';
  timestamp: number;
  data: Transaction | Block | Wallet | SmartContract;
}

export interface LegoObjectData {
  id: string;
  type: 'house' | 'car' | 'factory' | 'package' | 'station';
  position: Vector3;
  rotation?: Vector3;
  scale?: number;
  label: string;
  blockchainData: any;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface WorldState {
  blocks: Block[];
  wallets: Map<string, Wallet>;
  contracts: Map<string, SmartContract>;
  transactions: Transaction[];
  activeTransactions: Map<string, Transaction>;
}
