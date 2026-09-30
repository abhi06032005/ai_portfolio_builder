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
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const cleanSlug = (username || 'alex-rivera').toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const fullUrl = `https://${cleanSlug}.livefolio.me`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenNewTab = () => {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>${data.name || 'Developer'} — Portfolio</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;700&family=Newsreader:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              ${getThemeStyles(theme, data.accentColor)}
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
          <span className="url-prefix">https://</span>
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
              title="Click to customize your Livefolio link"
              onClick={() => setIsEditingSlug(true)}
            >
              {cleanSlug}
              <span className="url-suffix">.livefolio.me</span>
              <span className="slug-edit-pen">✏️</span>
            </span>
          )}

          <button
            className={`btn-copy-url ${copied ? 'copied' : ''}`}
            onClick={handleCopyLink}
            title="Copy Public Link"
          >
            {copied ? '✓ Copied' : 'Copy'}
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </button>
            <button
              className={`device-btn ${deviceView === 'tablet' ? 'active' : ''}`}
              onClick={() => setDeviceView('tablet')}
              title="Tablet View"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </button>
            <button
              className={`device-btn ${deviceView === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceView('mobile')}
              title="Mobile View"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </button>
          </div>

          {/* Theme Quick Selector */}
          <select
            className="chrome-theme-select"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
          >
            <option value="minimal">Minimal (Livefolio)</option>
            <option value="modern">Modern (Dark Grid)</option>
            <option value="retro">Retro (Neubrutalism)</option>
            <option value="blueprint">Blueprint (Tech Grid)</option>
          </select>

          {/* Open in new tab */}
          <button
            className="chrome-popout-btn"
            onClick={handleOpenNewTab}
            title="Open in new window"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>
        </div>
      </div>

      {/* Preview Viewport */}
      <div className={`preview-viewport-wrap view-${deviceView}`}>
        {deviceView === 'mobile' ? (
          <div className="phone-mockup-frame">
            <div className="phone-dynamic-island" />
            <div className="phone-screen-content">
              <PortfolioBodyContent data={data} theme={theme} isMobileView={true} />
            </div>
          </div>
        ) : deviceView === 'tablet' ? (
          <div className="tablet-mockup-frame">
            <div className="tablet-screen-content">
              <PortfolioBodyContent data={data} theme={theme} isMobileView={false} />
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
  const gh = data.integrations?.github;
  const lc = data.integrations?.leetcode;
  const med = data.integrations?.medium;

  return (
    <div className={`rendered-portfolio-body theme-${theme} ${isMobileView ? 'is-phone' : ''}`}>
      {/* Blueprint Header Decor */}
      {theme === 'blueprint' && (
        <div className="bp-grid-header">
          <span className="bp-code">// SPEC_VERSION: 4.2.0</span>
          <span className="bp-code">STATUS: DEPLOYED</span>
          <span className="bp-code">SCHEMATIC: DEVELOPER_PORTFOLIO</span>
        </div>
      )}

      {/* Retro Neubrutalist Banner Decor */}
      {theme === 'retro' && (
        <div className="retro-banner-strip">
          <span>★ LIVEFOLIO VERIFIED ★ BUILDER ★ OPEN TO WORK ★</span>
        </div>
      )}

      {/* Hero Section */}
      <header className="rf-hero">
        {data.avatarUrl && (
          <div className="rf-avatar-wrapper">
            <img
              src={data.avatarUrl}
              alt={data.name || 'Profile'}
              className="rf-avatar-img"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
          </div>
        )}

        <div className="rf-hero-tag">
          <span className="rf-status-dot" />
          <span>Available for opportunities</span>
        </div>

        <h1 className="rf-name">{data.name || 'Your Name'}</h1>
        <p className="rf-headline">{data.headline || 'Software Engineer & Full-Stack Builder'}</p>
        <p className="rf-about">{data.about || 'Passionate developer crafting modern, high-converting digital experiences.'}</p>

        <div className="rf-cta-row">
          {data.contact?.email && (
            <a href={`mailto:${data.contact.email}`} className="rf-btn-primary">
              <span>Get in Touch</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
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
          {data.contact?.location && (
            <span className="rf-location-chip">
              📍 {data.contact.location}
            </span>
          )}
        </div>
      </header>

      {/* ── LIVEFOLIO INTEGRATIONS HUB (GitHub, LeetCode, Medium) ── */}
      {(gh?.isConnected || lc?.isConnected || med?.isConnected) && (
        <section className="rf-section rf-integrations-section">
          <div className="rf-section-header">
            <h2>Live Activity &amp; Stats</h2>
            <span className="rf-section-count">Live Sync</span>
          </div>

          <div className="rf-integrations-grid">
            {/* GitHub Card */}
            {gh?.isConnected && (
              <div className="rf-integration-card gh-card">
                <div className="ic-header">
                  <div className="ic-title">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                    <span>GitHub Activity</span>
                  </div>
                  <span className="ic-badge">@{gh.username}</span>
                </div>

                <div className="ic-stats-row">
                  <div className="ic-stat-item">
                    <span className="stat-num">{gh.totalStars ?? 142}</span>
                    <span className="stat-label">Stars</span>
                  </div>
                  <div className="ic-stat-item">
                    <span className="stat-num">{gh.repos?.length ?? 6}</span>
                    <span className="stat-label">Public Repos</span>
                  </div>
                  {gh.topLanguages && gh.topLanguages.length > 0 && (
                    <div className="ic-stat-item">
                      <span className="stat-num">{gh.topLanguages[0]}</span>
                      <span className="stat-label">Primary Lang</span>
                    </div>
                  )}
                </div>

                {gh.repos && gh.repos.length > 0 && (
                  <div className="ic-sub-repos">
                    {gh.repos.slice(0, 2).map((r, ri) => (
                      <div key={ri} className="ic-repo-mini">
                        <div className="mini-name">
                          <a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a>
                          <span className="mini-stars">★ {r.stars}</span>
                        </div>
                        <p className="mini-desc">{r.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LeetCode Card */}
            {lc?.isConnected && (
              <div className="rf-integration-card lc-card">
                <div className="ic-header">
                  <div className="ic-title">
                    <span className="lc-icon">⚡</span>
                    <span>LeetCode Stats</span>
                  </div>
                  <span className="ic-badge">Rank: {lc.ranking ?? 'Top 10%'}</span>
                </div>

                <div className="lc-breakdown-row">
                  <div className="lc-total-box">
                    <span className="lc-total-num">{lc.totalSolved || 248}</span>
                    <span className="lc-total-label">Solved</span>
                  </div>
                  <div className="lc-bars-box">
                    <div className="lc-bar-item easy">
                      <span>Easy</span>
                      <span className="val">{lc.easySolved || 94}</span>
                    </div>
                    <div className="lc-bar-item med">
                      <span>Medium</span>
                      <span className="val">{lc.mediumSolved || 122}</span>
                    </div>
                    <div className="lc-bar-item hard">
                      <span>Hard</span>
                      <span className="val">{lc.hardSolved || 32}</span>
                    </div>
                  </div>
                </div>

                <div className="lc-rate-pill">
                  <span>Acceptance Rate: {lc.acceptanceRate || 64}%</span>
                </div>
              </div>
            )}

            {/* Medium / Dev.to Articles Card */}
            {med?.isConnected && med.articles && med.articles.length > 0 && (
              <div className="rf-integration-card med-card">
                <div className="ic-header">
                  <div className="ic-title">
                    <span>✍️</span>
                    <span>Published Articles</span>
                  </div>
                  <span className="ic-badge">@{med.username}</span>
                </div>

                <div className="ic-articles-list">
                  {med.articles.slice(0, 3).map((art, aidx) => (
                    <a
                      key={aidx}
                      href={art.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ic-article-row"
                    >
                      <div className="art-info">
                        <span className="art-title">{art.title}</span>
                        <span className="art-meta">{art.pubDate} • {art.readTime || '5 min read'}</span>
                      </div>
                      <span className="art-arrow">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Projects Grid */}
      {data.projects && data.projects.length > 0 && (
        <section className="rf-section" id="projects">
          <div className="rf-section-header">
            <h2>{theme === 'blueprint' ? '[01] DEPLOYED_PROJECTS' : 'Featured Projects'}</h2>
            <span className="rf-section-count">{data.projects.length} Works</span>
          </div>

          <div className="rf-projects-grid">
            {data.projects.map((proj, idx) => (
              <div key={idx} className="rf-project-card">
                <div className="rf-project-top">
                  <h3>{proj.name || 'Project Title'}</h3>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="rf-link-icon" title="Open Project">
                      ↗
                    </a>
                  )}
                </div>
                <p className="rf-project-desc">{proj.description || 'Project description demonstrating technical engineering solutions and impact.'}</p>

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
            <h2>{theme === 'blueprint' ? '[02] CORE_COMPETENCIES' : 'Skills & Technologies'}</h2>
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

      {/* Work Experience Timeline */}
      {data.experience && data.experience.length > 0 && (
        <section className="rf-section" id="experience">
          <div className="rf-section-header">
            <h2>{theme === 'blueprint' ? '[03] PROFESSIONAL_LOG' : 'Work Experience'}</h2>
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
            <h2>{theme === 'blueprint' ? '[04] ACADEMIC_CREDENTIALS' : 'Education'}</h2>
          </div>
          <div className="rf-edu-grid">
            {data.education.map((edu, eduidx) => (
              <div key={eduidx} className="rf-edu-card">
                <h4>{edu.degree || 'Degree / Major'}</h4>
                <div className="rf-edu-school">{edu.school || 'University'}</div>
                <div className="rf-edu-period">{edu.start} — {edu.end}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Livefolio Signature Footer */}
      <footer className="rf-footer">
        <div className="rf-footer-brand">
          <span className="live-pill">● Published with Livefolio</span>
        </div>
        {data.contact?.location && <small className="rf-footer-loc">{data.contact.location}</small>}
      </footer>
    </div>
  );
};

export function getThemeStyles(theme: string, accentColor?: string): string {
  const accent = accentColor || '#E06D53';

  // 1. MODERN THEME (Dark Grid)
  if (theme === 'modern') {
    return `
      body { background: #0B0F17; color: #F3F4F6; font-family: 'Plus Jakarta Sans', sans-serif; padding: 2.5rem 1.5rem; margin: 0; }
      .rf-hero { text-align: center; padding: 3rem 1rem 2.5rem; }
      .rf-name { font-size: 2.75rem; font-weight: 800; margin: 0.5rem 0; color: #FFFFFF; letter-spacing: -0.03em; }
      .rf-headline { font-size: 1.15rem; color: #94A3B8; font-weight: 500; }
      .rf-about { max-width: 600px; margin: 1rem auto 1.5rem; color: #64748B; line-height: 1.6; }
      .rf-hero-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(16, 185, 129, 0.12); color: #34D399; border-radius: 999px; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; margin-bottom: 1rem; border: 1px solid rgba(16, 185, 129, 0.25); }
      .rf-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; }
      .rf-cta-row { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 1.25rem; }
      .rf-btn-primary { background: ${accent}; color: #FFF; padding: 10px 20px; border-radius: 10px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
      .rf-btn-secondary { background: rgba(255,255,255,0.06); color: #E2E8F0; padding: 10px 18px; border-radius: 10px; text-decoration: none; border: 1px solid rgba(255,255,255,0.1); }
      .rf-section { margin-top: 3.5rem; max-width: 820px; margin-left: auto; margin-right: auto; }
      .rf-section-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
      .rf-section-header h2 { font-size: 1.35rem; font-weight: 700; color: #FFF; }
      .rf-section-count { font-size: 0.8rem; color: #64748B; font-family: 'JetBrains Mono', monospace; }
      .rf-project-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.5rem; margin-bottom: 1rem; transition: transform 0.2s; }
      .rf-project-card:hover { border-color: rgba(255,255,255,0.18); transform: translateY(-2px); }
      .rf-project-top { display: flex; justify-content: space-between; align-items: center; }
      .rf-project-top h3 { font-size: 1.2rem; color: #FFF; margin: 0; }
      .rf-project-desc { color: #94A3B8; font-size: 0.95rem; margin: 0.6rem 0 1rem; line-height: 1.5; }
      .rf-chip { background: rgba(255,255,255,0.06); color: #CBD5E1; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; margin-right: 6px; font-family: 'JetBrains Mono', monospace; }
      .rf-skill-badge { background: rgba(255,255,255,0.05); color: #E2E8F0; padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); margin: 4px; display: inline-block; font-size: 0.85rem; }
      .rf-timeline-item { border-left: 2px solid rgba(255,255,255,0.1); padding-left: 1.5rem; margin-bottom: 1.75rem; position: relative; }
      .rf-timeline-dot { position: absolute; left: -5px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: ${accent}; }
      .rf-timeline-role-row { display: flex; justify-content: space-between; align-items: baseline; }
      .rf-timeline-role-row h4 { font-size: 1.05rem; color: #FFF; margin: 0; }
      .rf-timeline-period { font-size: 0.8rem; color: #64748B; font-family: 'JetBrains Mono', monospace; }
      .rf-company-name { color: ${accent}; font-size: 0.9rem; font-weight: 600; margin: 0.2rem 0 0.5rem; }
      .rf-exp-desc { color: #94A3B8; font-size: 0.9rem; line-height: 1.5; }
      .rf-integrations-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
      .rf-integration-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.25rem; }
      .ic-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
      .ic-title { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #FFF; font-size: 0.95rem; }
      .ic-badge { font-size: 0.75rem; color: #94A3B8; font-family: 'JetBrains Mono', monospace; background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 6px; }
      .ic-stats-row { display: flex; gap: 16px; margin-bottom: 0.75rem; }
      .stat-num { font-size: 1.4rem; font-weight: 700; color: #FFF; display: block; }
      .stat-label { font-size: 0.75rem; color: #64748B; }
      .rf-footer { text-align: center; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.06); color: #64748B; font-size: 0.85rem; }
      .live-pill { display: inline-flex; align-items: center; gap: 6px; color: #10B981; font-weight: 500; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
    `;
  }

  // 2. RETRO THEME (Neubrutalism / Pop-Art)
  if (theme === 'retro') {
    return `
      body { background: #FFFDF5; color: #18181B; font-family: 'Space Grotesk', sans-serif; padding: 2.5rem 1.5rem; margin: 0; }
      .retro-banner-strip { background: #FEF08A; border: 3px solid #18181B; padding: 6px; text-align: center; font-weight: 800; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; margin-bottom: 2rem; box-shadow: 4px 4px 0 #18181B; }
      .rf-hero { background: #FBCFE8; border: 3px solid #18181B; box-shadow: 6px 6px 0 #18181B; padding: 2.5rem 1.5rem; text-align: center; margin-bottom: 2.5rem; }
      .rf-name { font-size: 3rem; font-weight: 900; margin: 0.5rem 0; text-transform: uppercase; letter-spacing: -0.02em; }
      .rf-headline { font-size: 1.2rem; font-weight: 700; color: #374151; }
      .rf-about { max-width: 620px; margin: 1rem auto; font-size: 1rem; line-height: 1.6; }
      .rf-hero-tag { display: inline-block; background: #BBF7D0; border: 2px solid #18181B; padding: 4px 12px; font-weight: 700; font-size: 0.85rem; margin-bottom: 1rem; box-shadow: 2px 2px 0 #18181B; }
      .rf-cta-row { display: flex; justify-content: center; gap: 12px; margin-top: 1.5rem; flex-wrap: wrap; }
      .rf-btn-primary { background: #18181B; color: #FFF; border: 2px solid #18181B; padding: 10px 22px; font-weight: 700; text-decoration: none; box-shadow: 4px 4px 0 #FEF08A; }
      .rf-btn-secondary { background: #FFF; color: #18181B; border: 2px solid #18181B; padding: 10px 20px; font-weight: 700; text-decoration: none; box-shadow: 3px 3px 0 #18181B; }
      .rf-section { max-width: 820px; margin: 2.5rem auto; }
      .rf-section-header { border-bottom: 3px solid #18181B; padding-bottom: 0.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
      .rf-section-header h2 { font-size: 1.5rem; font-weight: 900; text-transform: uppercase; }
      .rf-project-card { background: #FFF; border: 3px solid #18181B; box-shadow: 5px 5px 0 #18181B; padding: 1.5rem; margin-bottom: 1.5rem; }
      .rf-chip { background: #FEF08A; border: 2px solid #18181B; color: #18181B; padding: 2px 8px; font-weight: 700; font-size: 0.75rem; margin-right: 6px; box-shadow: 2px 2px 0 #18181B; display: inline-block; margin-bottom: 4px; }
      .rf-skill-badge { background: #A5F3FC; border: 2px solid #18181B; padding: 6px 14px; font-weight: 700; margin: 4px; display: inline-block; box-shadow: 3px 3px 0 #18181B; }
      .rf-integration-card { background: #FFF; border: 3px solid #18181B; box-shadow: 4px 4px 0 #18181B; padding: 1.25rem; margin-bottom: 1rem; }
      .rf-footer { text-align: center; border-top: 3px solid #18181B; padding-top: 1.5rem; margin-top: 3rem; font-weight: 700; }
    `;
  }

  // 3. BLUEPRINT THEME (Technical CAD & Architecture Grid)
  if (theme === 'blueprint') {
    return `
      body {
        background-color: #0B192C;
        background-image: linear-gradient(rgba(56, 189, 248, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.08) 1px, transparent 1px);
        background-size: 24px 24px;
        color: #E2E8F0;
        font-family: 'JetBrains Mono', monospace;
        padding: 2.5rem 1.5rem;
        margin: 0;
      }
      .bp-grid-header { display: flex; justify-content: space-between; border-bottom: 1px dashed rgba(56, 189, 248, 0.3); padding-bottom: 0.5rem; margin-bottom: 2rem; font-size: 0.75rem; color: #38BDF8; }
      .rf-hero { border: 1px solid rgba(56, 189, 248, 0.25); background: rgba(11, 25, 44, 0.8); padding: 3rem 1.5rem; text-align: center; margin-bottom: 2.5rem; position: relative; }
      .rf-hero::before { content: '+'; position: absolute; top: -8px; left: -8px; color: #38BDF8; font-size: 16px; }
      .rf-hero::after { content: '+'; position: absolute; bottom: -8px; right: -8px; color: #38BDF8; font-size: 16px; }
      .rf-name { font-size: 2.6rem; font-weight: 700; color: #FFF; margin: 0.5rem 0; letter-spacing: -0.02em; }
      .rf-headline { font-size: 1rem; color: #38BDF8; text-transform: uppercase; }
      .rf-about { max-width: 600px; margin: 1rem auto; color: #94A3B8; font-size: 0.85rem; line-height: 1.6; }
      .rf-hero-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border: 1px solid #38BDF8; color: #38BDF8; font-size: 0.75rem; margin-bottom: 1rem; }
      .rf-cta-row { display: flex; justify-content: center; gap: 10px; margin-top: 1.5rem; }
      .rf-btn-primary { background: #38BDF8; color: #0B192C; padding: 8px 18px; font-weight: 700; text-decoration: none; font-size: 0.85rem; }
      .rf-btn-secondary { background: transparent; color: #38BDF8; border: 1px solid #38BDF8; padding: 8px 16px; text-decoration: none; font-size: 0.85rem; }
      .rf-section { max-width: 820px; margin: 2.5rem auto; }
      .rf-section-header { border-bottom: 1px dashed rgba(56, 189, 248, 0.3); padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
      .rf-section-header h2 { font-size: 1.1rem; color: #38BDF8; margin: 0; }
      .rf-project-card { border: 1px solid rgba(56, 189, 248, 0.2); background: rgba(15, 23, 42, 0.6); padding: 1.25rem; margin-bottom: 1rem; }
      .rf-chip { border: 1px solid rgba(56, 189, 248, 0.3); color: #7DD3FC; padding: 2px 6px; font-size: 0.7rem; margin-right: 6px; display: inline-block; }
      .rf-skill-badge { border: 1px solid rgba(56, 189, 248, 0.25); background: rgba(56, 189, 248, 0.05); color: #E2E8F0; padding: 4px 10px; margin: 4px; font-size: 0.8rem; display: inline-block; }
      .rf-integration-card { border: 1px solid rgba(56, 189, 248, 0.2); background: rgba(15, 23, 42, 0.6); padding: 1rem; margin-bottom: 1rem; }
      .rf-footer { text-align: center; border-top: 1px dashed rgba(56, 189, 248, 0.25); padding-top: 1.5rem; margin-top: 3rem; color: #64748B; font-size: 0.75rem; }
    `;
  }

  // 4. MINIMAL THEME (Default Livefolio signature warm cream aesthetic)
  return `
    body { background: #F9F8F6; color: #1E1E1E; font-family: 'Plus Jakarta Sans', sans-serif; padding: 2.5rem 1.5rem; margin: 0; }
    .rf-hero { text-align: center; padding: 3rem 1rem 2.5rem; }
    .rf-name { font-size: 2.75rem; font-weight: 800; margin: 0.5rem 0; color: #1E1E1E; letter-spacing: -0.03em; }
    .rf-headline { font-size: 1.15rem; color: #52525B; font-weight: 500; }
    .rf-about { max-width: 600px; margin: 1rem auto 1.5rem; color: #71717A; line-height: 1.6; font-size: 1rem; }
    .rf-hero-tag { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(224, 109, 83, 0.08); color: ${accent}; border-radius: 999px; font-size: 0.8rem; font-family: 'JetBrains Mono', monospace; margin-bottom: 1rem; border: 1px solid rgba(224, 109, 83, 0.2); }
    .rf-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; }
    .rf-cta-row { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 1.25rem; }
    .rf-btn-primary { background: ${accent}; color: #FFF; padding: 10px 20px; border-radius: 10px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(224, 109, 83, 0.2); }
    .rf-btn-secondary { background: #FFF; color: #1E1E1E; padding: 10px 18px; border-radius: 10px; text-decoration: none; border: 1px solid #E5E5E5; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .rf-location-chip { display: inline-flex; align-items: center; padding: 10px 16px; background: #FFF; border: 1px solid #E5E5E5; border-radius: 10px; font-size: 0.85rem; color: #71717A; }
    .rf-section { margin-top: 3.5rem; max-width: 820px; margin-left: auto; margin-right: auto; }
    .rf-section-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EAEAEA; padding-bottom: 0.75rem; margin-bottom: 1.5rem; }
    .rf-section-header h2 { font-size: 1.35rem; font-weight: 700; color: #1E1E1E; }
    .rf-section-count { font-size: 0.8rem; color: #A1A1AA; font-family: 'JetBrains Mono', monospace; }
    .rf-project-card { background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 14px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: transform 0.2s; }
    .rf-project-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.05); }
    .rf-project-top { display: flex; justify-content: space-between; align-items: center; }
    .rf-project-top h3 { font-size: 1.2rem; color: #1E1E1E; margin: 0; }
    .rf-link-icon { color: ${accent}; font-weight: 700; text-decoration: none; }
    .rf-project-desc { color: #52525B; font-size: 0.95rem; margin: 0.6rem 0 1rem; line-height: 1.5; }
    .rf-chip { background: #F4F4F5; color: #52525B; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; margin-right: 6px; font-family: 'JetBrains Mono', monospace; }
    .rf-skill-badge { background: #FFFFFF; color: #1E1E1E; padding: 6px 14px; border-radius: 8px; border: 1px solid #EAEAEA; margin: 4px; display: inline-block; font-size: 0.85rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
    .rf-timeline-item { border-left: 2px solid #EAEAEA; padding-left: 1.5rem; margin-bottom: 1.75rem; position: relative; }
    .rf-timeline-dot { position: absolute; left: -5px; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: ${accent}; }
    .rf-timeline-role-row { display: flex; justify-content: space-between; align-items: baseline; }
    .rf-timeline-role-row h4 { font-size: 1.05rem; color: #1E1E1E; margin: 0; }
    .rf-timeline-period { font-size: 0.8rem; color: #71717A; font-family: 'JetBrains Mono', monospace; }
    .rf-company-name { color: ${accent}; font-size: 0.9rem; font-weight: 600; margin: 0.2rem 0 0.5rem; }
    .rf-exp-desc { color: #52525B; font-size: 0.9rem; line-height: 1.5; }
    .rf-integrations-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
    .rf-integration-card { background: #FFFFFF; border: 1px solid #EAEAEA; border-radius: 12px; padding: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
    .ic-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .ic-title { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #1E1E1E; font-size: 0.95rem; }
    .ic-badge { font-size: 0.75rem; color: #71717A; font-family: 'JetBrains Mono', monospace; background: #F4F4F5; padding: 2px 8px; border-radius: 6px; }
    .ic-stats-row { display: flex; gap: 16px; margin-bottom: 0.75rem; }
    .stat-num { font-size: 1.4rem; font-weight: 700; color: #1E1E1E; display: block; }
    .stat-label { font-size: 0.75rem; color: #71717A; }
    .rf-footer { text-align: center; margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #EAEAEA; color: #71717A; font-size: 0.85rem; }
    .live-pill { display: inline-flex; align-items: center; gap: 6px; color: #10B981; font-weight: 500; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }
  `;
}

function renderPortfolioMarkup(data: ResumeData, _theme: string): string {
  const gh = data.integrations?.github;
  const lc = data.integrations?.leetcode;

  return `
    <div style="max-width: 820px; margin: 0 auto;">
      <header class="rf-hero">
        ${data.avatarUrl ? `<div style="margin-bottom: 1.25rem;"><img src="${data.avatarUrl}" alt="${data.name || 'Profile'}" style="width: 84px; height: 84px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(128,128,128,0.2);" /></div>` : ''}
        <div class="rf-hero-tag">● Available for opportunities</div>
        <h1 class="rf-name">${data.name || 'Developer'}</h1>
        <p class="rf-headline">${data.headline || ''}</p>
        <p class="rf-about">${data.about || ''}</p>

        <div class="rf-cta-row">
          ${data.contact?.email ? `<a href="mailto:${data.contact.email}" class="rf-btn-primary">Get in Touch</a>` : ''}
          ${data.links?.github ? `<a href="${data.links.github}" target="_blank" class="rf-btn-secondary">GitHub ↗</a>` : ''}
          ${data.links?.linkedin ? `<a href="${data.links.linkedin}" target="_blank" class="rf-btn-secondary">LinkedIn ↗</a>` : ''}
        </div>
      </header>

      ${(gh?.isConnected || lc?.isConnected) ? `
        <section class="rf-section">
          <div class="rf-section-header">
            <h2>Live Activity &amp; Stats</h2>
            <span class="rf-section-count">Live Sync</span>
          </div>
          <div class="rf-integrations-grid">
            ${gh?.isConnected ? `
              <div class="rf-integration-card">
                <div class="ic-header">
                  <div class="ic-title">GitHub Activity</div>
                  <span class="ic-badge">@${gh.username}</span>
                </div>
                <div class="ic-stats-row">
                  <div><span class="stat-num">${gh.totalStars || 142}</span><span class="stat-label">Stars</span></div>
                  <div><span class="stat-num">${gh.repos?.length || 6}</span><span class="stat-label">Repositories</span></div>
                </div>
              </div>
            ` : ''}
            ${lc?.isConnected ? `
              <div class="rf-integration-card">
                <div class="ic-header">
                  <div class="ic-title">LeetCode Stats</div>
                  <span class="ic-badge">${lc.ranking || 'Top 10%'}</span>
                </div>
                <div class="ic-stats-row">
                  <div><span class="stat-num">${lc.totalSolved || 248}</span><span class="stat-label">Solved</span></div>
                  <div><span class="stat-num">${lc.acceptanceRate || 64}%</span><span class="stat-label">Acceptance</span></div>
                </div>
              </div>
            ` : ''}
          </div>
        </section>
      ` : ''}

      ${data.projects && data.projects.length > 0 ? `
        <section class="rf-section">
          <div class="rf-section-header">
            <h2>Featured Projects</h2>
            <span class="rf-section-count">${data.projects.length} Works</span>
          </div>
          <div class="rf-projects-grid">
            ${data.projects.map(p => `
              <div class="rf-project-card">
                <div class="rf-project-top">
                  <h3>${p.name}</h3>
                  ${p.url ? `<a href="${p.url}" target="_blank" class="rf-link-icon">↗</a>` : ''}
                </div>
                <p class="rf-project-desc">${p.description}</p>
                <div class="rf-tech-chips">
                  ${(p.tech || []).map(t => `<span class="rf-chip">${t}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      ${data.skills && data.skills.length > 0 ? `
        <section class="rf-section">
          <div class="rf-section-header">
            <h2>Skills &amp; Technologies</h2>
          </div>
          <div>
            ${data.skills.map(s => `<span class="rf-skill-badge">${s}</span>`).join('')}
          </div>
        </section>
      ` : ''}

      ${data.experience && data.experience.length > 0 ? `
        <section class="rf-section">
          <div class="rf-section-header">
            <h2>Work Experience</h2>
          </div>
          <div>
            ${data.experience.map(e => `
              <div class="rf-timeline-item">
                <div class="rf-timeline-dot"></div>
                <div class="rf-timeline-role-row">
                  <h4>${e.role}</h4>
                  <span class="rf-timeline-period">${e.start} — ${e.end || 'Present'}</span>
                </div>
                <div class="rf-company-name">${e.company}</div>
                <p class="rf-exp-desc">${e.description}</p>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <footer class="rf-footer">
        <p class="live-pill">● Published with Livefolio</p>
      </footer>
    </div>
  `;
}
