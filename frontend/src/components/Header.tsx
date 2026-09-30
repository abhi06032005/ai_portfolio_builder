import React from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react';

interface HeaderProps {
  onOpenUpload: () => void;
  onOpenPortfolios: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  onOpenPortfolios,
}) => {
  return (
    <header className="sleek-header">
      <div className="header-container">
        {/* Brand */}
        <a className="header-brand" href="#home">
          <div className="brand-logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="brand-name">PortfolioCraft</span>
        </a>

        {/* Center Nav */}
        <nav className="header-nav">
          <a href="#templates" className="nav-link">Templates</a>
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#features" className="nav-link">Features</a>
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn-signin-ghost">Sign In</button>
            </SignInButton>
            <button className="btn-header-cta" onClick={onOpenUpload}>
              Get Started →
            </button>
          </SignedOut>

          <SignedIn>
            <button className="btn-signin-ghost" onClick={onOpenPortfolios}>
              My Portfolios
            </button>
            <button className="btn-header-cta" onClick={onOpenUpload}>
              + Create Portfolio
            </button>
            <div className="header-user-btn">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
};
