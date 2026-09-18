/**
 * Main App component - brings everything together
 */

import React, { useEffect, useState } from 'react';
import { LegoWorld } from './components/LegoWorld';
import { ObjectDetails } from './components/ObjectDetails';
import { Controls } from './components/Controls';
import { useBlockchainData } from './hooks/useBlockchainData';
import { useLegoWorld } from './hooks/useLegoWorld';
import type { LegoObjectData } from '../backend/src/types/blockchain';
import './styles/App.css';

export const App: React.FC = () => {
  const {
    objects,
    selectedObject,
    isPaused,
    animationSpeed,
    filterType,
    addObject,
    removeObject,
    selectObject,
    setPaused,
    setAnimationSpeed,
    setFilterType,
  } = useLegoWorld();

  const {
    isConnected,
    connectionType,
    connect,
    disconnect,
    eventQueue,
    clientCount,
    messageQueueSize,
    lastUpdate,
    refresh,
  } = useBlockchainData({
    backendUrl: 'http://localhost:3001',
    wsPort: 4001,
    autoConnect: true,
    useWebSocket: false,
    onTransaction: (tx) => {
      console.log('Transaction received:', tx);
      // TODO: Create LegoCar animation
    },
    onBlock: (block) => {
      console.log('Block received:', block);
      // TODO: Create block visualization
    },
    onError: (error) => {
      console.error('Blockchain data error:', error);
    },
  });

  const [showDetails, setShowDetails] = useState(true);

  const handleObjectClick = (object: LegoObjectData) => {
    selectObject(object);
    setShowDetails(true);
  };

  const handleObjectDetailsClose = () => {
    selectObject(null);
    setShowDetails(false);
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">
            <span className="title-icon">🧱</span>
            Onchain LEGO
          </h1>
          <p className="app-subtitle">Visualizing Solana blockchain activity</p>
        </div>

        <div className="header-status">
          <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="indicator-dot"></span>
            <span className="indicator-text">
              {isConnected 
                ? `${connectionType.charAt(0).toUpperCase() + connectionType.slice(1)}` 
                : 'Disconnected'}
            </span>
          </div>

          {isConnected && connectionType === 'polling' && (
            <button 
              className="refresh-btn" 
              onClick={() => refresh()}
              title="Refresh data"
            >
              ↻
            </button>
          )}

          {!isConnected && (
            <button className="reconnect-btn" onClick={connect}>
              Connect
            </button>
          )}
        </div>
        {isConnected && (
          <div className="last-update">
            Last update: {Math.floor((Date.now() - lastUpdate) / 1000)}s ago
          </div>
        )}
      </header>

      {/* Main content area */}
      <div className="app-container">
        {/* 3D World */}
        <div className="world-container">
          <LegoWorld
            onObjectClick={handleObjectClick}
            isPaused={isPaused}
            animationSpeed={animationSpeed}
          />

          {/* Loading indicator */}
          {!isConnected && (
            <div className="connection-warning">
              <div className="warning-content">
                <span className="warning-icon">⚠️</span>
                <div>
                  <p className="warning-title">Not Connected</p>
                  <p className="warning-text">Waiting for blockchain connection...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel */}
        <Controls
          onPauseToggle={setPaused}
          onSpeedChange={setAnimationSpeed}
          onFilterChange={setFilterType}
          isPaused={isPaused}
          currentSpeed={animationSpeed}
          activeClients={clientCount}
          messageQueueSize={messageQueueSize}
        />

        {/* Object Details Panel */}
        {showDetails && (
          <ObjectDetails
            object={selectedObject}
            onClose={handleObjectDetailsClose}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p className="footer-text">
            Real-time visualization of Solana blockchain activity via QuickNode
          </p>
          <div className="footer-stats">
            <span className="stat-item">
              <span className="stat-label">Objects:</span>
              <span className="stat-value">{objects.size}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">Events:</span>
              <span className="stat-value">{eventQueue.length}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">Speed:</span>
              <span className="stat-value">{animationSpeed.toFixed(1)}x</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
