import { PortfolioContent } from '../types/portfolio';
import { sanitizeUrl } from '../utils/security';

export interface RenderOptions {
  theme?: string;
  slug?: string;
}

export class PortfolioRenderer {
  /**
   * Renders the stored PortfolioContent JSON into high-speed, SEO-optimized,
   * modern responsive HTML for edge caching (Section 18).
   */
  static renderHTML(content: PortfolioContent, options: RenderOptions = {}): string {
    const theme = options.theme || content.meta?.theme || 'minimal';
    const title = content.meta?.title || `${content.hero?.name || 'Developer'} - Portfolio`;
    const description = content.meta?.description || content.about?.summary || '';
    const hero = content.hero || { name: 'Developer', headline: 'Software Engineer', subheadline: '', ctaText: 'View Work', secondaryCtaText: 'Contact Me' };
    const about = content.about || { summary: '', highlights: [] };
    const skills = content.skills || [];
    const projects = content.projects || [];
    const experience = content.experience || [];
    const education = content.education || [];
    const contact = content.contact || { email: '', location: '', links: {} };

    // CSS Themes
    const isDark = theme === 'dark' || theme === 'modern' || theme === 'terminal';
    const bgGrad = isDark
      ? 'background: radial-gradient(circle at 50% 0%, #1a1e2e 0%, #0b0d14 100%); color: #f3f4f6;'
      : 'background: radial-gradient(circle at 50% 0%, #f9fafb 0%, #edf2f7 100%); color: #111827;';
    const cardBg = isDark
      ? 'background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1);'
      : 'background: rgba(255, 255, 255, 0.85); border: 1px solid rgba(229, 231, 235, 0.8);';
    const accentColor = isDark ? '#60a5fa' : '#2563eb';
    const badgeBg = isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.1)';
    const textMuted = isDark ? '#9ca3af' : '#6b7280';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src * data:; connect-src 'none'; frame-ancestors 'self';">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      ${bgGrad}
      min-height: 100vh;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    h1, h2, h3, h4 { font-family: 'Outfit', sans-serif; font-weight: 700; letter-spacing: -0.02em; }
    .container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
    
    /* Hero */
    header { padding: 6rem 0 4rem; text-align: center; }
    .greeting { font-size: 1.1rem; font-weight: 600; color: ${accentColor}; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .hero-name { font-size: 3.5rem; line-height: 1.1; margin-bottom: 1rem; }
    .tagline { font-size: 1.5rem; color: ${textMuted}; font-weight: 400; max-width: 650px; margin: 0 auto 1.5rem; }
    .subheadline { font-size: 1.1rem; color: ${textMuted}; max-width: 600px; margin: 0 auto 2rem; }
    
    /* Buttons */
    .cta-group { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 0.85rem 1.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.95rem;
      text-decoration: none; transition: all 0.2s ease; cursor: pointer;
    }
    .btn-primary { background: ${accentColor}; color: #ffffff; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3); }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
    .btn-secondary { ${cardBg} color: inherit; }
    .btn-secondary:hover { transform: translateY(-2px); }

    /* Sections */
    section { padding: 4rem 0; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}; }
    .section-title { font-size: 2rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; }

    /* Cards */
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .card {
      ${cardBg}
      border-radius: 16px; padding: 1.75rem; backdrop-filter: blur(12px);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .card:hover { transform: translateY(-3px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
    .card-title { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .card-meta { font-size: 0.875rem; color: ${textMuted}; margin-bottom: 0.75rem; }
    .card-desc { font-size: 0.95rem; color: ${textMuted}; margin-bottom: 1.25rem; }

    /* Badges */
    .badge-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .badge {
      font-size: 0.8rem; font-weight: 600; padding: 0.35rem 0.75rem;
      border-radius: 9999px; background: ${badgeBg}; color: ${accentColor};
    }

    /* Experience */
    .timeline { display: flex; flex-direction: column; gap: 2rem; }
    .timeline-item { position: relative; padding-left: 1.5rem; border-left: 2px solid ${accentColor}; }
    .timeline-bullet { position: absolute; left: -6px; top: 6px; width: 10px; height: 10px; border-radius: 50%; background: ${accentColor}; }
    .highlights-list { list-style: disc; margin-left: 1.25rem; margin-top: 0.5rem; color: ${textMuted}; font-size: 0.95rem; }

    /* Footer */
    footer { text-align: center; padding: 4rem 0 2rem; color: ${textMuted}; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="greeting">Hello, I'm</div>
      <h1 class="hero-name">${escapeHtml(hero.name || 'Developer')}</h1>
      ${hero.headline ? `<div class="tagline">${escapeHtml(hero.headline)}</div>` : ''}
      ${hero.subheadline ? `<div class="subheadline">${escapeHtml(hero.subheadline)}</div>` : ''}
      <div class="cta-group">
        <a href="#projects" class="btn btn-primary">${escapeHtml(hero.ctaText || 'View Work')}</a>
        <a href="#contact" class="btn btn-secondary">${escapeHtml(hero.secondaryCtaText || 'Contact')}</a>
      </div>
    </header>

    ${about.summary ? `
    <section id="about">
      <h2 class="section-title">About</h2>
      <div class="card">
        <p class="card-desc" style="font-size: 1.05rem; line-height: 1.7;">${escapeHtml(about.summary)}</p>
        ${about.highlights && about.highlights.length > 0 ? `
          <ul class="highlights-list" style="margin-top: 1rem;">
            ${about.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    </section>
    ` : ''}

    ${skills.length > 0 ? `
    <section id="skills">
      <h2 class="section-title">Skills & Expertise</h2>
      <div class="grid">
        ${skills.map((group) => `
          <div class="card">
            <h3 class="card-title">${escapeHtml(group.category)}</h3>
            <div class="badge-list" style="margin-top: 1rem;">
              ${group.items.map((item) => `<span class="badge">${escapeHtml(item)}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${projects.length > 0 ? `
    <section id="projects">
      <h2 class="section-title">Featured Projects</h2>
      <div class="grid">
        ${projects.map((proj) => {
          const safeLive = sanitizeUrl(proj.liveUrl);
          const safeSource = sanitizeUrl(proj.sourceUrl);
          return `
          <div class="card">
            <h3 class="card-title">${escapeHtml(proj.title)}</h3>
            <p class="card-desc">${escapeHtml(proj.description)}</p>
            <div class="badge-list" style="margin-bottom: 1.25rem;">
              ${(proj.technologies || []).map((t) => `<span class="badge">${escapeHtml(t)}</span>`).join('')}
            </div>
            <div style="display: flex; gap: 0.75rem;">
              ${safeLive ? `<a href="${escapeHtml(safeLive)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Live Demo</a>` : ''}
              ${safeSource ? `<a href="${escapeHtml(safeSource)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">GitHub</a>` : ''}
            </div>
          </div>
        `;
        }).join('')}
      </div>
    </section>
    ` : ''}

    ${experience.length > 0 ? `
    <section id="experience">
      <h2 class="section-title">Experience</h2>
      <div class="timeline">
        ${experience.map((exp) => `
          <div class="timeline-item">
            <div class="timeline-bullet"></div>
            <h3 class="card-title">${escapeHtml(exp.role)} &middot; <span style="color: ${accentColor};">${escapeHtml(exp.company)}</span></h3>
            <div class="card-meta">${escapeHtml(exp.period || '')}</div>
            <p class="card-desc">${escapeHtml(exp.description || '')}</p>
            ${exp.keyAchievements && exp.keyAchievements.length > 0 ? `
              <ul class="highlights-list">
                ${exp.keyAchievements.map((hl: string) => `<li>${escapeHtml(hl)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${education.length > 0 ? `
    <section id="education">
      <h2 class="section-title">Education</h2>
      <div class="grid">
        ${education.map((edu) => `
          <div class="card">
            <h3 class="card-title">${escapeHtml(edu.degree || 'Degree')}</h3>
            <div class="card-meta">${escapeHtml(edu.institution)} &middot; ${escapeHtml(edu.period || '')}</div>
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    <section id="contact">
      <h2 class="section-title">Get In Touch</h2>
      <div class="card" style="text-align: center; padding: 3rem 1.5rem;">
        <p class="card-desc" style="font-size: 1.1rem; margin-bottom: 2rem;">Interested in working together or have any questions? Feel free to reach out!</p>
        ${contact.email && sanitizeUrl(`mailto:${contact.email}`) ? `<a href="${escapeHtml(sanitizeUrl(`mailto:${contact.email}`))}" class="btn btn-primary" style="font-size: 1.05rem;">Email Me (${escapeHtml(contact.email)})</a>` : ''}
      </div>
    </section>

    <footer>
      <p>Powered by Cloudflare-first Portfolio Maker</p>
    </footer>
  </div>
</body>
</html>`;
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
