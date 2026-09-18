/**
 * WebSocket manager for pushing live blockchain events to frontend
 */

import { WebSocket, WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import type { WorldEvent, Transaction, Block } from '../types/blockchain.js';

export class WSManager extends EventEmitter {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();
  private messageQueue: WorldEvent[] = [];
  private maxQueueSize = 100;

  constructor(port: number) {
    super();
    this.wss = new WebSocketServer({ port });
    this.setupServer();
  }

  /**
   * Setup WebSocket server and handle connections
   */
  private setupServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket client connected');
      this.clients.add(ws);

      // Send queued events to new client
      this.messageQueue.forEach((event) => {
        this.sendToClient(ws, event);
      });

      // Handle incoming messages
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          this.emit('client-message', data, ws);
        } catch (error) {
          console.error('Invalid message:', error);
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    console.log(`WebSocket server listening on port ${(this.wss as any)._server.address().port}`);
  }

  /**
   * Send event to a single client
   */
  private sendToClient(ws: WebSocket, event: WorldEvent) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(event: WorldEvent) {
    // Add to queue
    this.messageQueue.push(event);
    if (this.messageQueue.length > this.maxQueueSize) {
      this.messageQueue.shift();
    }

    // Send to all clients
    this.clients.forEach((client) => {
      this.sendToClient(client, event);
    });
  }

  /**
   * Broadcast transaction event
   */
  broadcastTransaction(tx: Transaction) {
    this.broadcast({
      type: 'transaction',
      timestamp: Date.now(),
      data: tx,
    });
  }

  /**
   * Broadcast block event
   */
  broadcastBlock(block: Block) {
    this.broadcast({
      type: 'block',
      timestamp: Date.now(),
      data: block,
    });
  }

  /**
   * Broadcast wallet update
   */
  broadcastWalletUpdate(wallet: any) {
    this.broadcast({
      type: 'wallet_update',
      timestamp: Date.now(),
      data: wallet,
    });
  }

  /**
   * Broadcast contract interaction
   */
  broadcastContractInteraction(contract: any) {
    this.broadcast({
      type: 'contract_interaction',
      timestamp: Date.now(),
      data: contract,
    });
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get message queue
   */
  getMessageQueue(): WorldEvent[] {
    return [...this.messageQueue];
  }

  /**
   * Clear message queue
   */
  clearQueue() {
    this.messageQueue = [];
  }

  /**
   * Close server and disconnect all clients
   */
  close() {
    this.clients.forEach((client) => {
      client.close();
    });
    this.wss.close();
  }

  /**
   * Send a specific message type to all clients
   */
  sendMessage(type: string, data: any) {
    const event: WorldEvent = {
      type: type as any,
      timestamp: Date.now(),
      data,
    };

    this.broadcast(event);
  }

  /**
   * Subscribe to specific event types (for internal use)
   */
  onTransaction(callback: (tx: Transaction) => void) {
    this.on('transaction', callback);
  }

  onBlock(callback: (block: Block) => void) {
    this.on('block', callback);
  }

  onClientMessage(callback: (data: any, ws: WebSocket) => void) {
    this.on('client-message', callback);
  }
}

export default WSManager;
