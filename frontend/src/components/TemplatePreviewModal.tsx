import React, { useState } from 'react';
import { ResumeData } from '../types';

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  badge?: string;
  features: string[];
}

interface TemplatePreviewModalProps {
  template: TemplateDefinition | null;
  sampleData: ResumeData;
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  template,
  sampleData,
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen || !template) return null;

  return (
    <div className="template-modal-overlay" onClick={onClose}>
      <div className="template-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="template-modal-header">
          <div className="tm-header-left">
            <span className="tm-template-badge" style={{ backgroundColor: template.accentColor + '18', color: template.accentColor }}>
              {template.badge || template.category}
            </span>
            <h3 className="tm-template-title">{template.name}</h3>
          </div>

          {/* Device Controls */}
          <div className="tm-device-switch">
            <button
              className={`tm-dev-btn ${device === 'desktop' ? 'active' : ''}`}
              onClick={() => setDevice('desktop')}
              title="Desktop View"
            >
              🖥️ Desktop
            </button>
            <button
              className={`tm-dev-btn ${device === 'tablet' ? 'active' : ''}`}
              onClick={() => setDevice('tablet')}
              title="Tablet View"
            >
              💻 Tablet
            </button>
            <button
              className={`tm-dev-btn ${device === 'mobile' ? 'active' : ''}`}
              onClick={() => setDevice('mobile')}
              title="Mobile View"
            >
              📱 Mobile
            </button>
          </div>

          {/* Action Buttons */}
          <div className="tm-header-right">
            <button
              className="tm-btn-select"
              onClick={() => {
                onSelectTemplate(template.id);
                onClose();
              }}
            >
              Use This Template →
            </button>
            <button className="tm-btn-close" onClick={onClose} title="Close Preview">
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body / Iframe Sandbox */}
        <div className="template-modal-body">
          <div className={`tm-viewport-container ${device}`}>
            <div className="tm-browser-frame">
              <div className="tm-browser-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
                <span className="tm-browser-url">preview.portfoliocraft.dev/{template.id}</span>
              </div>
              <div className="tm-browser-canvas">
                <iframe
                  title={`${template.name} Preview`}
                  className="tm-iframe"
                  srcDoc={generateSampleTemplateHTML(template.id, sampleData)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Generates an interactive preview HTML document for the given template and sample data.
 */
function generateSampleTemplateHTML(theme: string, data: ResumeData): string {
  const isDark = theme === 'modern' || theme === 'terminal';
  const bgColor = theme === 'terminal' ? '#0d1117' : isDark ? '#090d16' : '#ffffff';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc';
  const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bgColor};
      color: ${textColor};
      font-family: ${theme === 'terminal' ? "'JetBrains Mono', monospace" : "'Plus Jakarta Sans', system-ui, sans-serif"};
      padding: 3rem 1.5rem;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper { max-width: 780px; margin: 0 auto; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 9999px;
      background: ${isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(15, 23, 42, 0.06)'};
      color: ${isDark ? '#38bdf8' : '#0f172a'};
      margin-bottom: 1.25rem;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin-bottom: 0.5rem;
      line-height: 1.15;
    }
    .headline {
      font-size: 1.25rem;
      font-weight: 500;
      color: ${isDark ? '#94a3b8' : '#64748b'};
      margin-bottom: 1.25rem;
    }
    .bio {
      font-size: 1.05rem;
      color: ${isDark ? '#cbd5e1' : '#334155'};
      margin-bottom: 2rem;
      line-height: 1.65;
    }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 3rem; }
    .btn {
      padding: 0.65rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary {
      background: ${isDark ? '#38bdf8' : '#0f172a'};
      color: ${isDark ? '#090d16' : '#ffffff'};
    }
    .btn-secondary {
      background: ${cardBg};
      border: 1px solid ${border};
      color: ${textColor};
    }
    .section-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 1.25rem;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .skills-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 3rem; }
    .skill-pill {
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 500;
      background: ${cardBg};
      border: 1px solid ${border};
    }
    .card-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 3rem; }
    .card {
      background: ${cardBg};
      border: 1px solid ${border};
      padding: 1.5rem;
      border-radius: 12px;
    }
    .card-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem; }
    .card-title { font-weight: 700; font-size: 1.1rem; }
    .card-meta { font-size: 0.85rem; color: ${isDark ? '#94a3b8' : '#64748b'}; }
    .card-desc { font-size: 0.95rem; color: ${isDark ? '#cbd5e1' : '#475569'}; margin-bottom: 0.75rem; }
    .tech-row { display: flex; gap: 6px; flex-wrap: wrap; }
    .tech-chip { font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; background: ${border}; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="badge">✦ Available for hire</div>
    <h1>${data.name || 'Alex Rivera'}</h1>
    <div class="headline">${data.headline || 'Staff Full-Stack Engineer'}</div>
    <p class="bio">${data.about || 'Crafting resilient distributed systems and delightful web products.'}</p>

    <div class="actions">
      <a href="mailto:${data.contact?.email || 'hello@example.com'}" class="btn btn-primary">Get in Touch →</a>
      <a href="${data.links?.github || '#'}" class="btn btn-secondary">GitHub ↗</a>
      <a href="${data.links?.linkedin || '#'}" class="btn btn-secondary">LinkedIn ↗</a>
    </div>

    <div class="section-title">Core Technologies</div>
    <div class="skills-grid">
      ${(data.skills || ['TypeScript', 'React', 'Next.js', 'PostgreSQL', 'Docker']).map((s) => `<span class="skill-pill">${s}</span>`).join('')}
    </div>

    <div class="section-title">Featured Projects</div>
    <div class="card-list">
      ${(data.projects || []).slice(0, 2).map((p) => `
        <div class="card">
          <div class="card-top">
            <span class="card-title">${p.name}</span>
            ${p.url ? `<span class="card-meta">↗</span>` : ''}
          </div>
          <p class="card-desc">${p.description}</p>
          <div class="tech-row">
            ${(p.tech || []).map((t) => `<span class="tech-chip">${t}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>
  `;
}
