import React, { useState } from 'react';
import { ResumeData } from '../types';

interface LivePortfolioPreviewProps {
  data: ResumeData;
  theme: string;
  onThemeChange: (theme: string) => void;
  username: string;
  onUsernameChange: (username: string) => void;
}

export const LivePortfolioPreview: React.FC<LivePortfolioPreviewProps> = ({
  data,
  theme,
  onThemeChange,
  username,
  onUsernameChange,
}) => {
  const [deviceView, setDeviceView] = useState<'desktop' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const cleanSlug = (username || 'developer').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const fullUrl = `https://portfoliomaker.dev/${cleanSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenNewTab = () => {
    // Open a blob preview or local route
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${data.name || 'Portfolio'} - Preview</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
            <style>
              ${getThemeStyles(theme)}
            </style>
          </head>
          <body>
            ${renderPortfolioMarkup(data, theme)}
          </body>
        </html>
      `);
      w.document.close();
    }
  };

  return (
    <div className="preview-pane-container">
      {/* Browser Chrome Header */}
      <div className="preview-chrome-bar">
        {/* Window controls */}
        <div className="chrome-dots">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
        </div>

        {/* Editable Custom URL Pill */}
        <div className="chrome-url-box">
          <span className="url-prefix">portfoliomaker.dev/</span>
          {isEditingSlug ? (
            <input
              type="text"
              className="url-slug-input"
              value={cleanSlug}
              autoFocus
              onChange={(e) => onUsernameChange(e.target.value)}
              onBlur={() => setIsEditingSlug(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingSlug(false)}
            />
          ) : (
            <span
              className="url-slug-badge"
              title="Click to customize your URL"
              onClick={() => setIsEditingSlug(true)}
            >
              {cleanSlug}
              <span className="slug-edit-pen">✏️</span>
            </span>
          )}

          <button
            className={`btn-copy-url ${copied ? 'copied' : ''}`}
            onClick={handleCopyLink}
            title="Copy Public Link"
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>

        {/* Controls: Device & Theme */}
        <div className="chrome-actions">
          {/* Device toggle */}
          <div className="device-switcher">
            <button
              className={`device-btn ${deviceView === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceView('desktop')}
              title="Desktop View"
            >
              🖥️
            </button>
            <button
              className={`device-btn ${deviceView === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceView('mobile')}
              title="Phone View"
            >
              📱
            </button>
          </div>

          {/* Theme Quick Selector */}
          <select
            className="chrome-theme-select"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
          >
            <option value="minimal">Minimal Light</option>
            <option value="modern">Modern Dark</option>
            <option value="bento">Aeline Bento</option>
            <option value="terminal">Tech Terminal</option>
          </select>

          {/* Open in new tab */}
          <button
            className="chrome-popout-btn"
            onClick={handleOpenNewTab}
            title="Open in new window"
          >
            ↗
          </button>
        </div>
      </div>

      {/* Preview Content Area */}
      <div className={`preview-viewport-wrap ${deviceView === 'mobile' ? 'mobile-mode' : 'desktop-mode'}`}>
        {deviceView === 'mobile' ? (
          <div className="phone-mockup-frame">
            <div className="phone-dynamic-island" />
            <div className="phone-screen-content">
              <PortfolioBodyContent data={data} theme={theme} isMobileView={true} />
            </div>
          </div>
        ) : (
          <div className="desktop-screen-content">
            <PortfolioBodyContent data={data} theme={theme} isMobileView={false} />
          </div>
        )}
      </div>
    </div>
  );
};

interface PortfolioBodyContentProps {
  data: ResumeData;
  theme: string;
  isMobileView: boolean;
}

const PortfolioBodyContent: React.FC<PortfolioBodyContentProps> = ({ data, theme, isMobileView }) => {
  return (
    <div className={`rendered-portfolio-body theme-${theme} ${isMobileView ? 'is-phone' : ''}`}>
      {/* Hero Section */}
      <header className="rf-hero">
        {data.avatarUrl && (
          <div className="rf-avatar-wrapper" style={{ marginBottom: '1.25rem' }}>
            <img
              src={data.avatarUrl}
              alt={data.name || 'Profile'}
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255,255,255,0.2)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                display: 'inline-block',
              }}
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
          </div>
        )}
        <div className="rf-hero-tag">👋 Available for opportunities</div>
        <h1 className="rf-name">{data.name || 'Your Name'}</h1>
        <p className="rf-headline">{data.headline || 'Software Engineer & Builder'}</p>
        <p className="rf-about">{data.about || 'Passionate developer crafting modern, high-converting digital experiences.'}</p>

        <div className="rf-cta-row">
          {data.contact?.email && (
            <a href={`mailto:${data.contact.email}`} className="rf-btn-primary">
              Get in Touch
            </a>
          )}
          {data.links?.github && (
            <a href={data.links.github} target="_blank" rel="noopener noreferrer" className="rf-btn-secondary">
              GitHub ↗
            </a>
          )}
          {data.links?.linkedin && (
            <a href={data.links.linkedin} target="_blank" rel="noopener noreferrer" className="rf-btn-secondary">
              LinkedIn ↗
            </a>
          )}
        </div>
      </header>

      {/* Projects Grid */}
      {data.projects && data.projects.length > 0 && (
        <section className="rf-section" id="projects">
          <div className="rf-section-header">
            <h2>Featured Projects</h2>
            <span className="rf-section-count">{data.projects.length} Built</span>
          </div>

          <div className="rf-projects-grid">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="rf-project-card">
                <div className="rf-project-top">
                  <h3>{proj.name || 'Project Title'}</h3>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="rf-link-icon">
                      ↗
                    </a>
                  )}
                </div>
                <p className="rf-project-desc">{proj.description || 'Project description showing key technical challenges and results.'}</p>

                {proj.tech && proj.tech.length > 0 && (
                  <div className="rf-tech-chips">
                    {proj.tech.map((t, tidx) => (
                      <span key={tidx} className="rf-chip">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills Section */}
      {data.skills && data.skills.length > 0 && (
        <section className="rf-section" id="skills">
          <div className="rf-section-header">
            <h2>Skills & Technologies</h2>
          </div>
          <div className="rf-skills-wrap">
            {data.skills.map((skill, sidx) => (
              <span key={sidx} className="rf-skill-badge">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience Timeline */}
      {data.experience && data.experience.length > 0 && (
        <section className="rf-section" id="experience">
          <div className="rf-section-header">
            <h2>Work Experience</h2>
          </div>
          <div className="rf-timeline">
            {data.experience.map((exp, eidx) => (
              <div key={eidx} className="rf-timeline-item">
                <div className="rf-timeline-dot" />
                <div className="rf-timeline-role-row">
                  <h4>{exp.role || 'Job Role'}</h4>
                  <span className="rf-timeline-period">
                    {exp.start} — {exp.end || 'Present'}
                  </span>
                </div>
                <div className="rf-company-name">{exp.company || 'Company'}</div>
                <p className="rf-exp-desc">{exp.description || 'Summary of responsibilities and achievements.'}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="rf-section" id="education">
          <div className="rf-section-header">
            <h2>Education</h2>
          </div>
          <div className="rf-edu-grid">
            {data.education.map((edu, eduidx) => (
              <div key={eduidx} className="rf-edu-card">
                <h4>{edu.degree || 'Degree / Certification'}</h4>
                <div className="rf-edu-school">{edu.school || 'University'}</div>
                <div className="rf-edu-period">{edu.start} — {edu.end}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer / Contact */}
      <footer className="rf-footer">
        <p>Built &amp; Hosted with Portfolio Maker Edge</p>
        {data.contact?.location && <small>{data.contact.location}</small>}
      </footer>
    </div>
  );
};

function getThemeStyles(theme: string): string {
  if (theme === 'modern' || theme === 'terminal') {
    return `
      body { background: #0b0f19; color: #f3f4f6; font-family: 'Plus Jakarta Sans', sans-serif; padding: 2rem; margin: 0; }
      .rf-hero { text-align: center; padding: 4rem 1rem; }
      .rf-name { font-size: 3rem; font-weight: 800; margin: 0.5rem 0; color: #ffffff; }
      .rf-headline { font-size: 1.25rem; color: #60a5fa; }
      .rf-about { max-width: 600px; margin: 1rem auto; color: #9ca3af; line-height: 1.6; }
      .rf-project-card { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; }
      .rf-chip { background: rgba(96, 165, 250, 0.15); color: #93c5fd; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; margin: 2px; }
      .rf-skill-badge { background: rgba(255,255,255,0.08); color: #fff; padding: 6px 14px; border-radius: 9999px; margin: 4px; display: inline-block; }
    `;
  }
  return `
    body { background: #fafafa; color: #111827; font-family: 'Plus Jakarta Sans', sans-serif; padding: 2rem; margin: 0; }
    .rf-hero { text-align: center; padding: 4rem 1rem; }
    .rf-name { font-size: 3rem; font-weight: 800; margin: 0.5rem 0; color: #111827; }
    .rf-headline { font-size: 1.25rem; color: #2563eb; }
    .rf-about { max-width: 600px; margin: 1rem auto; color: #4b5563; line-height: 1.6; }
    .rf-project-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .rf-chip { background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 9999px; font-size: 0.8rem; margin: 2px; }
    .rf-skill-badge { background: #f3f4f6; color: #374151; padding: 6px 14px; border-radius: 9999px; margin: 4px; display: inline-block; }
  `;
}

function renderPortfolioMarkup(data: ResumeData, _theme: string): string {
  return `
    <div style="max-width: 800px; margin: 0 auto;">
      <header style="text-align: center; margin-bottom: 3rem;">
        ${data.avatarUrl ? `<div style="margin-bottom: 1.5rem;"><img src="${data.avatarUrl}" alt="${data.name || 'Profile'}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(128,128,128,0.3); box-shadow: 0 4px 16px rgba(0,0,0,0.15);" /></div>` : ''}
        <h1 style="font-size: 2.8rem; margin-bottom: 0.5rem;">${data.name || 'Developer'}</h1>
        <p style="font-size: 1.2rem; opacity: 0.8;">${data.headline || ''}</p>
        <p style="margin-top: 1rem; line-height: 1.6;">${data.about || ''}</p>
      </header>

      ${data.projects && data.projects.length > 0 ? `
        <section style="margin-bottom: 3rem;">
          <h2>Projects</h2>
          ${data.projects.map((p) => `
            <div style="padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid rgba(128,128,128,0.2);">
              <h3>${p.name}</h3>
              <p>${p.description}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}

      ${data.skills && data.skills.length > 0 ? `
        <section style="margin-bottom: 3rem;">
          <h2>Skills</h2>
          <div>
            ${data.skills.map((s) => `<span style="display: inline-block; padding: 4px 12px; margin: 4px; border-radius: 999px; background: rgba(128,128,128,0.15);">${s}</span>`).join('')}
          </div>
        </section>
      ` : ''}
    </div>
  `;
}
