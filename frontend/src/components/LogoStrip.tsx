import React from 'react';

export const LogoStrip: React.FC = () => {
  return (
    <div className="logo-strip">
      <div className="logo-track" aria-hidden="true">
        {/* Set 1 */}
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 14.93V17a1 1 0 01-2 0v-.07A8 8 0 014.07 10H5a1 1 0 010-2h-.93A8 8 0 0111 4.07V5a1 1 0 012 0v-.93A8 8 0 0119.93 11H19a1 1 0 010 2h.93A8 8 0 0113 16.93z"/></svg>
          <span>Google</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="12" r="5"/><circle cx="17" cy="12" r="5" opacity="0.6"/></svg>
          <span>Stripe</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>
          <span>Vercel</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 18H3l9-18z"/></svg>
          <span>Linear</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3"/></svg>
          <span>GitHub</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          <span>Supabase</span>
        </div>

        {/* Set 2 (Duplicate for seamless loop) */}
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm1 14.93V17a1 1 0 01-2 0v-.07A8 8 0 014.07 10H5a1 1 0 010-2h-.93A8 8 0 0111 4.07V5a1 1 0 012 0v-.93A8 8 0 0119.93 11H19a1 1 0 010 2h.93A8 8 0 0113 16.93z"/></svg>
          <span>Google</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="12" r="5"/><circle cx="17" cy="12" r="5" opacity="0.6"/></svg>
          <span>Stripe</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>
          <span>Vercel</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 18H3l9-18z"/></svg>
          <span>Linear</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3"/></svg>
          <span>GitHub</span>
        </div>
        <div className="logo-item">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
          <span>Supabase</span>
        </div>
      </div>
    </div>
  );
};
