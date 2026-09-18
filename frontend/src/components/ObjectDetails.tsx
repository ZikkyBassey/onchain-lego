/**
 * Object Details panel - displays blockchain data for selected object
 */

import React, { useState, useMemo } from 'react';
import type { LegoObjectData, Transaction, Wallet } from '../../backend/src/types/blockchain';
import '../styles/ObjectDetails.css';

interface ObjectDetailsProps {
  object: LegoObjectData | null;
  onClose?: () => void;
}

export const ObjectDetails: React.FC<ObjectDetailsProps> = ({ object, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']));

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  if (!object) {
    return (
      <div className="object-details closed">
        <div className="details-placeholder">
          Click on a LEGO object to see blockchain data
        </div>
      </div>
    );
  }

  const isExpanded = (section: string) => expandedSections.has(section);

  return (
    <div className="object-details">
      <div className="details-header">
        <h2 className={`object-type object-type-${object.type}`}>
          {object.type.toUpperCase()}
        </h2>
        <div className="details-label">{object.label}</div>
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="details-content">
        {/* Main Data Section */}
        <div className="details-section">
          <button
            className={`section-header ${isExpanded('main') ? 'expanded' : ''}`}
            onClick={() => toggleSection('main')}
          >
            <span className="section-icon">📊</span>
            <span className="section-title">Object Information</span>
            <span className="section-toggle">{isExpanded('main') ? '−' : '+'}</span>
          </button>

          {isExpanded('main') && (
            <div className="section-content">
              <div className="data-row">
                <span className="data-label">Type:</span>
                <span className="data-value">{object.type}</span>
              </div>
              <div className="data-row">
                <span className="data-label">ID:</span>
                <code className="data-value short-hash">{object.id}</code>
              </div>
              <div className="data-row">
                <span className="data-label">Position:</span>
                <span className="data-value">
                  ({object.position.x.toFixed(2)}, {object.position.y.toFixed(2)},
                  {object.position.z.toFixed(2)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Blockchain Data Section */}
        {object.blockchainData && (
          <>
            {object.type === 'car' && (
              <TransactionDetails data={object.blockchainData} expanded={isExpanded('tx')} onToggle={() => toggleSection('tx')} />
            )}

            {object.type === 'house' && (
              <WalletDetails data={object.blockchainData} expanded={isExpanded('wallet')} onToggle={() => toggleSection('wallet')} />
            )}

            {object.type === 'factory' && (
              <ContractDetails data={object.blockchainData} expanded={isExpanded('contract')} onToggle={() => toggleSection('contract')} />
            )}
          </>
        )}

        {/* Raw JSON Section */}
        <div className="details-section">
          <button
            className={`section-header ${isExpanded('raw') ? 'expanded' : ''}`}
            onClick={() => toggleSection('raw')}
          >
            <span className="section-icon">⚙️</span>
            <span className="section-title">Raw Data</span>
            <span className="section-toggle">{isExpanded('raw') ? '−' : '+'}</span>
          </button>

          {isExpanded('raw') && (
            <div className="section-content">
              <pre className="raw-json">
                {JSON.stringify(object.blockchainData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Transaction Details Sub-component
 */
const TransactionDetails: React.FC<{
  data: Transaction;
  expanded: boolean;
  onToggle: () => void;
}> = ({ data, expanded, onToggle }) => (
  <div className="details-section">
    <button
      className={`section-header ${expanded ? 'expanded' : ''}`}
      onClick={onToggle}
    >
      <span className="section-icon">🚗</span>
      <span className="section-title">Transaction Details</span>
      <span className="section-toggle">{expanded ? '−' : '+'}</span>
    </button>

    {expanded && (
      <div className="section-content">
        <div className="data-row">
          <span className="data-label">Signature:</span>
          <code className="data-value short-hash">{data.signature}</code>
        </div>
        <div className="data-row">
          <span className="data-label">Status:</span>
          <span className={`data-value status-${data.success ? 'success' : 'failed'}`}>
            {data.success ? '✓ Success' : '✗ Failed'}
          </span>
        </div>
        <div className="data-row">
          <span className="data-label">Fee:</span>
          <span className="data-value">{(data.fee / 1e9).toFixed(6)} SOL</span>
        </div>
        <div className="data-row">
          <span className="data-label">Slot:</span>
          <span className="data-value">{data.slot}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Programs:</span>
          <span className="data-value">{data.programs.length}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Accounts:</span>
          <span className="data-value">{data.accounts.length}</span>
        </div>
        {data.tokenTransfers.length > 0 && (
          <div className="subsection">
            <h4>Token Transfers ({data.tokenTransfers.length})</h4>
            {data.tokenTransfers.map((transfer, idx) => (
              <div key={idx} className="transfer-item">
                <div className="transfer-arrow">→</div>
                <div className="transfer-from short-hash">{transfer.from}</div>
                <div className="transfer-to short-hash">{transfer.to}</div>
                <div className="transfer-amount">{transfer.amount}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

/**
 * Wallet Details Sub-component
 */
const WalletDetails: React.FC<{
  data: Wallet;
  expanded: boolean;
  onToggle: () => void;
}> = ({ data, expanded, onToggle }) => (
  <div className="details-section">
    <button
      className={`section-header ${expanded ? 'expanded' : ''}`}
      onClick={onToggle}
    >
      <span className="section-icon">🏠</span>
      <span className="section-title">Wallet Details</span>
      <span className="section-toggle">{expanded ? '−' : '+'}</span>
    </button>

    {expanded && (
      <div className="section-content">
        <div className="data-row">
          <span className="data-label">Address:</span>
          <code className="data-value short-hash">{data.address}</code>
        </div>
        <div className="data-row">
          <span className="data-label">Balance:</span>
          <span className="data-value">{(data.balance / 1e9).toFixed(6)} SOL</span>
        </div>
        <div className="data-row">
          <span className="data-label">Total Transactions:</span>
          <span className="data-value">{data.totalTransactions}</span>
        </div>
        {data.label && (
          <div className="data-row">
            <span className="data-label">Label:</span>
            <span className="data-value">{data.label}</span>
          </div>
        )}
      </div>
    )}
  </div>
);

/**
 * Contract Details Sub-component
 */
const ContractDetails: React.FC<{
  data: any;
  expanded: boolean;
  onToggle: () => void;
}> = ({ data, expanded, onToggle }) => (
  <div className="details-section">
    <button
      className={`section-header ${expanded ? 'expanded' : ''}`}
      onClick={onToggle}
    >
      <span className="section-icon">🏭</span>
      <span className="section-title">Contract Details</span>
      <span className="section-toggle">{expanded ? '−' : '+'}</span>
    </button>

    {expanded && (
      <div className="section-content">
        <div className="data-row">
          <span className="data-label">Address:</span>
          <code className="data-value short-hash">{data.address}</code>
        </div>
        {data.name && (
          <div className="data-row">
            <span className="data-label">Name:</span>
            <span className="data-value">{data.name}</span>
          </div>
        )}
        <div className="data-row">
          <span className="data-label">Transaction Count:</span>
          <span className="data-value">{data.transactionCount}</span>
        </div>
        <div className="data-row">
          <span className="data-label">Last Interaction:</span>
          <span className="data-value">
            {new Date(data.lastInteraction * 1000).toLocaleString()}
          </span>
        </div>
      </div>
    )}
  </div>
);

export default ObjectDetails;
