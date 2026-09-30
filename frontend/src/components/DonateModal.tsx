import React, { useState } from 'react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [selectedTier, setSelectedTier] = useState<number>(15);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tiers = [
    { amount: 5, label: '☕ Buy a Coffee', desc: 'Fuel our late night coding sessions' },
    { amount: 15, label: '🍕 Buy a Pizza', desc: 'Cover AI model & edge server costs', popular: true },
    { amount: 50, label: '🚀 Project Sponsor', desc: 'Help us build and ship more free templates' },
  ];

  const handleCopyWallet = () => {
    navigator.clipboard.writeText('0x71C...49A2B (ETH/USDC) or UPI: dev@upi');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="donate-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="donate-header">
          <div className="donate-heart-icon">💖</div>
          <h2>Support This Project</h2>
          <p>
            Portfolio Maker is 100% open-source, private, and free to use. Your support directly funds edge hosting, AI inference, and new templates!
          </p>
        </div>

        {/* Tiers */}
        <div className="donate-tiers">
          {tiers.map((t) => (
            <div
              key={t.amount}
              className={`donate-tier-card ${selectedTier === t.amount ? 'active' : ''}`}
              onClick={() => setSelectedTier(t.amount)}
            >
              {t.popular && <span className="tier-popular-tag">Most Popular</span>}
              <div className="tier-amount">${t.amount}</div>
              <div className="tier-label">{t.label}</div>
              <div className="tier-desc">{t.desc}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="donate-actions">
          <a
            href="https://buymeacoffee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-donate-primary"
          >
            <span>Donate ${selectedTier} via BuyMeACoffee / Stripe</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>

          <button className="btn-donate-secondary" onClick={handleCopyWallet}>
            {copied ? '✓ Copied Wallet Address!' : '📋 Copy Crypto / UPI Address'}
          </button>
        </div>

        <div className="donate-footer-note">
          Every contribution keeps the project independent and free for all developers. Thank you! 🙏
        </div>
      </div>
    </div>
  );
};
