import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="services" className="section-wrap" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="section-label">Intelligent Process</div>
      <h2 className="section-h2">From raw resume to live portfolio</h2>
      <p className="section-sub">A four-step automated pipeline built with OpenAI, Neon PostgreSQL, and GitHub Pages.</p>

      <div className="how-grid">
        <div className="how-card">
          <div className="how-num">01 / PARSE</div>
          <div className="how-title">Raw Text Extraction</div>
          <p className="how-desc">Upload your PDF or DOCX. Mammoth and pdf-parse extract all textual content without artifacts.</p>
        </div>
        <div className="how-card">
          <div className="how-num">02 / EXTRACT</div>
          <div className="how-title">LLM Semantic Mapping</div>
          <p className="how-desc">GPT-4o-mini identifies roles, achievements, skills, and projects, mapping them to structured JSON.</p>
        </div>
        <div className="how-card">
          <div className="how-num">03 / PERSIST</div>
          <div className="how-title">Neon DB & Prisma</div>
          <p className="how-desc">Your raw resume text, contact email, and structured data are safely stored in Postgres with Prisma ORM.</p>
        </div>
        <div className="how-card">
          <div className="how-num">04 / DEPLOY</div>
          <div className="how-title">1-Click GitHub Pages</div>
          <p className="how-desc">Pick your favorite template, preview it instantly, and publish directly to your personal GitHub repo.</p>
        </div>
      </div>
    </section>
  );
};
