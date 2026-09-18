/**
 * Control panel - playback controls, filters, and settings
 */

import React, { useState } from 'react';
import '../styles/Controls.css';

interface ControlsProps {
  onPauseToggle?: (paused: boolean) => void;
  onSpeedChange?: (speed: number) => void;
  onFilterChange?: (filter: string) => void;
  isPaused?: boolean;
  currentSpeed?: number;
  activeClients?: number;
  messageQueueSize?: number;
}

export const Controls: React.FC<ControlsProps> = ({
  onPauseToggle,
  onSpeedChange,
  onFilterChange,
  isPaused = false,
  currentSpeed = 1,
  activeClients = 0,
  messageQueueSize = 0,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const handleFilterChange = (type: string) => {
    setFilterType(type);
    onFilterChange?.(type);
  };

  const speedOptions = [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
    { label: '4x', value: 4 },
  ];

  return (
    <div className="controls-panel">
      {/* Header */}
      <div className="controls-header">
        <h3>🎮 Controls</h3>
        <button
          className="toggle-advanced"
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="Toggle advanced options"
        >
          {showAdvanced ? '−' : '+'}
        </button>
      </div>

      {/* Main Controls */}
      <div className="controls-section">
        {/* Playback Controls */}
        <div className="control-group">
          <label>Playback</label>
          <div className="button-group">
            <button
              className={`control-btn ${isPaused ? 'active' : ''}`}
              onClick={() => onPauseToggle?.(!isPaused)}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? '▶️ Play' : '⏸️ Pause'}
            </button>
          </div>
        </div>

        {/* Speed Controls */}
        <div className="control-group">
          <label>Speed</label>
          <div className="speed-controls">
            <select
              value={currentSpeed}
              onChange={(e) => onSpeedChange?.(parseFloat(e.target.value))}
              className="speed-select"
            >
              {speedOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="speed-display">{currentSpeed.toFixed(1)}x</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="control-group">
          <label>Filter Events</label>
          <div className="filter-buttons">
            {['all', 'transactions', 'blocks', 'wallets'].map((type) => (
              <button
                key={type}
                className={`filter-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => handleFilterChange(type)}
              >
                {type === 'transactions' && '🚗'}
                {type === 'blocks' && '📦'}
                {type === 'wallets' && '🏠'}
                {type === 'all' && '🌍'}
                <span className="filter-label">{type}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="controls-section advanced">
          <div className="control-group">
            <label>Display Options</label>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked />
                Show labels
              </label>
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked />
                Show connections
              </label>
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked />
                Auto-follow
              </label>
            </div>
          </div>

          <div className="control-group">
            <label>Visualization</label>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input type="checkbox" defaultChecked />
                3D view
              </label>
              <label className="checkbox-item">
                <input type="checkbox" />
                Grid
              </label>
              <label className="checkbox-item">
                <input type="checkbox" />
                Particles
              </label>
            </div>
          </div>

          <div className="control-group">
            <label>Camera</label>
            <div className="button-group">
              <button className="control-btn small">Reset View</button>
              <button className="control-btn small">Zoom Fit</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="controls-status">
        <div className="status-item">
          <span className="status-icon">🔌</span>
          <span className="status-label">Clients:</span>
          <span className="status-value">{activeClients}</span>
        </div>
        <div className="status-item">
          <span className="status-icon">📨</span>
          <span className="status-label">Queue:</span>
          <span className="status-value">{messageQueueSize}</span>
        </div>
        <div className="status-item">
          <span className="status-icon">{isPaused ? '⏸️' : '▶️'}</span>
          <span className="status-label">Status:</span>
          <span className="status-value">{isPaused ? 'Paused' : 'Running'}</span>
        </div>
      </div>

      {/* Quick Help */}
      <div className="controls-help">
        <details>
          <summary>📖 Help</summary>
          <ul>
            <li><strong>Click</strong> on LEGO objects to see data</li>
            <li><strong>Drag</strong> to rotate the world</li>
            <li><strong>Scroll</strong> to zoom in/out</li>
            <li><strong>Pause</strong> to examine events</li>
            <li><strong>Speed</strong> to watch activity faster</li>
          </ul>
        </details>
      </div>
    </div>
  );
};

export default Controls;
