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
    <header className="hero-nav">
      <a className="nav-brand" href="#home">
        <div className="brand-icon">
          {/* Folded ribbon mark */}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19.5h5.5l2.2-4.2h8.6l2.2 4.2H22L12 2zm0 6.5l3 5.8H9l3-5.8z" />
          </svg>
        </div>
        PortfolioCraft
      </a>

      <ul className="nav-menu">
        <li className="nav-item"><a href="#home">Home</a></li>
        <li className="nav-item"><a href="#about">About Us</a></li>
        <li className="nav-item"><a href="#services">Services</a></li>
        <li className="nav-item"><a href="#features">Features</a></li>
      </ul>

      <div className="nav-actions">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="nav-btn-login">Sign In</button>
          </SignInButton>
          <button className="nav-btn-contact" onClick={onOpenUpload}>
            Create Portfolio
          </button>
        </SignedOut>

        <SignedIn>
          <button className="nav-btn-login" onClick={onOpenPortfolios}>
            My Portfolios
          </button>
          <button className="nav-btn-contact" onClick={onOpenUpload}>
            + Upload Resume
          </button>
          <div style={{ marginLeft: 6 }}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </header>
  );
};
