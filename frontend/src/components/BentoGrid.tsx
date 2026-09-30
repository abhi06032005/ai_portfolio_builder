import React from 'react';

interface BentoGridProps {
  onOpenUpload: () => void;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ onOpenUpload }) => {
  return (
    <div className="bento-section">
      <div className="bento-grid">
        {/* Card 1: Blue photo card (120+ / Visit site) */}
        <div className="bento-card-1">
          <img
            className="bento-1-img"
            src="https://framerusercontent.com/images/JGdNRl6jQUnlEAMYGOue2qDYts.png?width=2464"
            alt="Developer looking at sky"
          />
          <div className="bento-1-top">
            <span className="bento-1-brand">PORTFOLIOCRAFT</span>
            <div className="bento-1-lock">
              <svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </div>
          </div>

          <div className="bento-1-pill">
            <div className="bento-1-num">2,400+</div>
            <div className="bento-1-link" style={{ cursor: 'pointer' }} onClick={onOpenUpload}>
              <span>↗ Build yours now</span>
            </div>
          </div>
        </div>

        {/* Card 2: 100% Client Satisfaction */}
        <div className="bento-card-2">
          <div>
            <div className="bento-2-sub">Client Satisfaction</div>
            <div className="bento-2-val">100%</div>
          </div>

          <div className="bento-2-bottom">
            <div className="bento-avatars">
              <div className="bento-avatar"><img src="https://framerusercontent.com/images/dygDLHKhVToFdtrq6rEFXJbkAE.jpg?width=1080" alt="Client 1" /></div>
              <div className="bento-avatar"><img src="https://framerusercontent.com/images/xMf7dsUjzyk9nMiYVF8tRvYd4.jpg?width=1080" alt="Client 2" /></div>
              <div className="bento-avatar"><img src="https://framerusercontent.com/images/ZiZBgEiO0p4WsVrevTH2ZuRO0.jpg?width=1080" alt="Client 3" /></div>
              <div className="bento-avatar"><img src="https://framerusercontent.com/images/dygDLHKhVToFdtrq6rEFXJbkAE.jpg?width=1080" alt="Client 4" /></div>
            </div>
            <p className="bento-quote">
              “The AI parsed my 8-page resume in 5 seconds and deployed it to GitHub Pages. Landed 3 interviews in a week.”
            </p>
          </div>
        </div>

        {/* Column 3: Lime 520k+ & Dark Activity Bar */}
        <div className="bento-col-3">
          <div className="bento-card-3">
            <div className="bento-3-top">
              <div className="bento-3-val">520k+</div>
              <div className="bento-3-expand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              </div>
            </div>
            <p className="bento-3-desc">
              Skills, projects, and work history data points extracted accurately by our LLM pipeline.
            </p>
          </div>

          <div className="bento-card-4">
            <span className="bento-4-label">Neon DB & Prisma Active</span>
            <div className="bento-4-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
