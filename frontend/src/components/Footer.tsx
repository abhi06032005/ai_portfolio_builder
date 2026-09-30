import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">PortfolioCraft</div>
        <ul className="footer-links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Process</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
        <span className="footer-copy">© 2026 PortfolioCraft. All rights reserved. Powered by Clerk, Neon DB & Prisma.</span>
      </div>
    </footer>
  );
};
