import React from 'react';

export const Features: React.FC = () => {
  return (
    <section id="features" className="section-wrap" style={{ paddingTop: 0 }}>
      <div className="section-label">Capabilities</div>
      <h2 className="section-h2">Engineered for seamless execution</h2>
      <p className="section-sub">State of the art portfolio generation without vendor lock-in or recurring hosting fees.</p>

      <div className="feat-grid">
        <div className="feat-card">
          <div className="feat-icon" style={{ background: '#eaf2fe', color: '#2563eb' }}>⚡</div>
          <div className="feat-title">Intelligent Extraction</div>
          <p className="feat-desc">Upload once. Our LLM extracts every skill, metric, and bullet point with extreme precision.</p>
        </div>
        <div className="feat-card">
          <div className="feat-icon" style={{ background: '#eaf8ef', color: '#1f7a43' }}>🐙</div>
          <div className="feat-title">GitHub Pages Automation</div>
          <p className="feat-desc">We initialize the Git repository, push production files, and enable GitHub Pages in seconds.</p>
        </div>
        <div className="feat-card">
          <div className="feat-icon" style={{ background: '#fff1e6', color: '#c2571a' }}>🔒</div>
          <div className="feat-title">Neon DB + Prisma</div>
          <p className="feat-desc">All extracted resume records and email data are persisted securely in your cloud PostgreSQL database.</p>
        </div>
      </div>
    </section>
  );
};
