import React from 'react';

export const Testimonials: React.FC = () => {
  return (
    <section className="section-wrap" style={{ paddingTop: 0 }}>
      <div className="section-label">Endorsements</div>
      <h2 className="section-h2">Trusted by builders & engineers</h2>
      <p className="section-sub">Here is what developers say about their live portfolios created with PortfolioCraft.</p>

      <div className="t-grid">
        <div className="t-card">
          <div className="t-stars">★★★★★</div>
          <p className="t-text">“Uploaded my resume at 9pm and had a live GitHub Pages portfolio by 9:08pm. The design quality blew my interviewers away.”</p>
          <div className="t-author">
            <div className="t-av" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>AK</div>
            <div>
              <div className="t-name">Alexandre K.</div>
              <div className="t-role">Senior Full-Stack Engineer · Stripe</div>
            </div>
          </div>
        </div>

        <div className="t-card">
          <div className="t-stars">★★★★★</div>
          <p className="t-text">“The AI parsed my 6-year work history without missing a single framework or metric. Everything was stored right in my database.”</p>
          <div className="t-author">
            <div className="t-av" style={{ background: 'linear-gradient(135deg,#f59e0b,#ef4444)' }}>MS</div>
            <div>
              <div className="t-name">Marcella S.</div>
              <div className="t-role">ML Engineer · Horizon AI</div>
            </div>
          </div>
        </div>

        <div className="t-card">
          <div className="t-stars">★★★★★</div>
          <p className="t-text">“Finally a portfolio tool that actually outputs code I own in my GitHub repo. No proprietary monthly subscriptions.”</p>
          <div className="t-author">
            <div className="t-av" style={{ background: 'linear-gradient(135deg,#10b981,#3b82f6)' }}>DL</div>
            <div>
              <div className="t-name">David L.</div>
              <div className="t-role">Backend Architect · Open Source</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
