/**
 * React hook for blockchain data streaming via polling (Vercel-compatible)
 * Falls back to WebSocket if available
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import type { WorldEvent, Transaction, Block, Wallet } from '../../backend/src/types/blockchain';

interface UseBlockchainDataOptions {
  backendUrl?: string;
  wsPort?: number;
  useWebSocket?: boolean; // Set to true only if WebSocket server is available
  autoConnect?: boolean;
  pollingInterval?: number;
  onTransaction?: (tx: Transaction) => void;
  onBlock?: (block: Block) => void;
  onWalletUpdate?: (wallet: Wallet) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

interface UseBlockchainDataReturn {
  isConnected: boolean;
  connectionType: 'websocket' | 'polling' | 'demo';
  connect: () => Promise<void>;
  disconnect: () => void;
  eventQueue: WorldEvent[];
  clientCount: number;
  messageQueueSize: number;
  lastUpdate: number;
  refresh: () => Promise<void>;
}

/**
 * Hook for connecting to blockchain data stream
 * Uses polling by default for Vercel compatibility
 */
export const useBlockchainData = (
  options: UseBlockchainDataOptions = {}
): UseBlockchainDataReturn => {
  const {
    backendUrl = 'http://localhost:3001',
    wsPort = 4001,
    useWebSocket = false, // Default to polling for Vercel
    autoConnect = true,
    pollingInterval = 5000,
    onTransaction,
    onBlock,
    onWalletUpdate,
    onError,
    onConnected,
    onDisconnected,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'websocket' | 'polling' | 'demo'>('demo');
  const [eventQueue, setEventQueue] = useState<WorldEvent[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [messageQueueSize, setMessageQueueSize] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  /**
   * Fetch data via polling
   */
  const fetchViaPolling = useCallback(async () => {
    try {
      // Fetch current slot
      const slotResponse = await fetch(`${backendUrl}/api/slot`);
      const slotData = await slotResponse.json();

      // Create block event
      const blockEvent: WorldEvent = {
        type: 'block',
        timestamp: Date.now(),
        data: slotData,
      };

      // Fetch transaction info (randomly for demo)
      const wsInfoResponse = await fetch(`${backendUrl}/api/ws-info`);
      const wsInfo = await wsInfoResponse.json();
      setClientCount(wsInfo.clients || 0);
      setMessageQueueSize(wsInfo.queueSize || 0);

      // Add to queue
      setEventQueue((prev) => {
        const updated = [blockEvent, ...prev];
        if (updated.length > 50) { // Reduced for serverless
          updated.pop();
        }
        return updated;
      });

      // Call callbacks
      onBlock?.(slotData as Block);
      setLastUpdate(Date.now());

    } catch (error) {
      console.error('Polling error:', error);
      onError?.(error as Error);
    }
  }, [backendUrl, onBlock, onError]);

  /**
   * Connect via WebSocket
   */
  const connectViaWebSocket = useCallback(async () => {
    if (!useWebSocket) return;

    return new Promise<void>((resolve, reject) => {
      try {
        const host = backendUrl.replace(/^https?:\/\//, '').split(':')[0];
        const wsUrl = `ws://${host}:${wsPort}`;
        
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          setIsConnected(true);
          setConnectionType('websocket');
          onConnected?.();
          resolve();
        };

        wsRef.current.onmessage = (event) => {
          try {
            const worldEvent: WorldEvent = JSON.parse(event.data);
            setEventQueue((prev) => {
              const updated = [worldEvent, ...prev];
              if (updated.length > 50) {
                updated.pop();
              }
              return updated;
            });

            // Call appropriate callback
            switch (worldEvent.type) {
              case 'transaction':
                onTransaction?.(worldEvent.data as Transaction);
                break;
              case 'block':
                onBlock?.(worldEvent.data as Block);
                break;
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        wsRef.current.onclose = () => {
          setIsConnected(false);
          setConnectionType('demo');
          onDisconnected?.();
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          onError?.(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }, [backendUrl, wsPort, useWebSocket, onTransaction, onBlock, onConnected, onDisconnected, onError]);

  /**
   * Connect to blockchain data
   */
  const connect = useCallback(async () => {
    if (useWebSocket) {
      await connectViaWebSocket();
    } else {
      // Use polling
      await fetchViaPolling();
      setIsConnected(true);
      setConnectionType('polling');
      onConnected?.();
    }
  }, [useWebSocket, connectViaWebSocket, fetchViaPolling, onConnected]);

  /**
   * Disconnect
   */
  const disconnect = useCallback(() => {
    // Clear polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionType('demo');
    onDisconnected?.();
  }, [onDisconnected]);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(async () => {
    await fetchViaPolling();
  }, [fetchViaPolling]);

  /**
   * Setup polling interval
   */
  useEffect(() => {
    if (autoConnect && !useWebSocket) {
      connect();
      
      // Start polling
      pollingIntervalRef.current = setInterval(fetchViaPolling, pollingInterval);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [autoConnect, useWebSocket, connect, fetchViaPolling, pollingInterval]);

  return {
    isConnected,
    connectionType,
    connect,
    disconnect,
    eventQueue,
    clientCount,
    messageQueueSize,
    lastUpdate,
    refresh,
  };
};

export default useBlockchainData;