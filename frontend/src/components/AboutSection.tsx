import React from 'react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="about-section">
      <div className="badge-pill">
        <div className="badge-dot" />
        About Us
      </div>

      <h2 className="about-h2">
        A personal branding partner<br />
        dedicated to building
        <span className="inline-icon-badge badge-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </span>
        smarter<br />
        and
        <span className="inline-icon-badge badge-lime">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.2L12 16.8 5.7 21.2 8 14 2 9.4h7.6z" />
          </svg>
        </span>
        more adaptive portfolios
      </h2>
    </section>
  );
};
