import React, { useState } from 'react';
import JSZip from 'jszip';
import { ResumeData } from '../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  data: ResumeData;
  theme: string;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  slug,
  data,
  theme,
}) => {
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  if (!isOpen) return null;

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  const liveUrl = `https://portfoliomaker.dev/${cleanSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateFullHtml = () => {
    const initials = (data.name || 'Dev')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name || 'Developer'} - Portfolio</title>
  <meta name="description" content="${data.headline || 'Personal portfolio website'}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; scroll-padding-top: 80px; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0b0f19;
      color: #f1f5f9;
      line-height: 1.6;
      min-height: 100vh;
    }
    a { color: inherit; text-decoration: none; }

    /* Sticky Nav */
    .site-nav {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.25rem; color: #fff; }
    .brand span { color: #60a5fa; }
    .nav-links { display: flex; gap: 1.5rem; list-style: none; }
    .nav-links a { font-size: 0.9rem; color: #94a3b8; font-weight: 600; transition: color 0.2s; }
    .nav-links a:hover { color: #60a5fa; }

    /* Container */
    .container { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem 5rem; }

    /* Hero */
    .hero {
      text-align: center;
      padding: 5rem 1rem 4rem;
      position: relative;
    }
    .avatar-wrap {
      width: 120px;
      height: 120px;
      margin: 0 auto 1.75rem;
      border-radius: 50%;
      padding: 4px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
      box-shadow: 0 12px 32px rgba(59, 130, 246, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      display: block;
      background: #1e293b;
    }
    .avatar-initials {
      background: #1e293b;
      color: #60a5fa;
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 2.2rem;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34d399;
      font-size: 0.85rem;
      font-weight: 700;
      padding: 5px 14px;
      border-radius: 9999px;
      margin-bottom: 1.25rem;
    }
    .hero-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
    h1 {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.02em;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .headline {
      font-size: clamp(1.15rem, 2.5vw, 1.4rem);
      color: #60a5fa;
      font-weight: 600;
      margin-bottom: 1.25rem;
    }
    .about-text {
      max-width: 680px;
      margin: 0 auto 2rem;
      color: #94a3b8;
      font-size: 1.05rem;
      line-height: 1.7;
    }
    .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn-main {
      background: #2563eb;
      color: #fff;
      font-weight: 700;
      padding: 0.75rem 1.75rem;
      border-radius: 9999px;
      transition: all 0.2s;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
    }
    .btn-main:hover { background: #1d4ed8; transform: translateY(-2px); }
    .btn-outline {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f1f5f9;
      font-weight: 600;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      transition: all 0.2s;
    }
    .btn-outline:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.3); }

    /* Section Headers */
    .section-title {
      font-family: 'Outfit', sans-serif;
      font-size: 2rem;
      font-weight: 800;
      margin-bottom: 1.75rem;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
    }

    /* Projects Grid */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 4rem;
    }
    .project-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1.75rem;
      transition: all 0.3s;
      display: flex;
      flex-direction: column;
    }
    .project-card:hover {
      border-color: rgba(96, 165, 250, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
    }
    .project-title { font-size: 1.3rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
    .project-desc { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem; flex: 1; }
    .tech-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1.25rem; }
    .badge {
      background: rgba(96, 165, 250, 0.12);
      color: #93c5fd;
      border: 1px solid rgba(96, 165, 250, 0.2);
      font-size: 0.78rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 9999px;
    }
    .project-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #60a5fa;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .project-link:hover { text-decoration: underline; }

    /* Skills Grid */
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 4rem; }
    .skill-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px 18px;
      border-radius: 12px;
      font-size: 0.92rem;
      font-weight: 600;
      color: #e2e8f0;
      transition: all 0.2s;
    }
    .skill-tag:hover {
      background: rgba(96, 165, 250, 0.15);
      border-color: rgba(96, 165, 250, 0.3);
      color: #93c5fd;
    }

    /* Experience */
    .exp-list { display: flex; flex-direction: column; gap: 1.25rem; margin-bottom: 4rem; }
    .exp-item {
      background: rgba(30, 41, 59, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.5rem;
    }
    .exp-header { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; margin-bottom: 0.5rem; }
    .exp-role { font-size: 1.15rem; font-weight: 700; color: #fff; }
    .exp-company { color: #60a5fa; font-weight: 600; }
    .exp-period { font-size: 0.85rem; color: #64748b; font-family: 'JetBrains Mono', monospace; }
    .exp-desc { color: #94a3b8; font-size: 0.95rem; }

    /* Contact / Footer */
    .footer-card {
      background: linear-gradient(180deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 3rem 2rem;
      text-align: center;
    }
    .footer-card h2 { font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 800; margin-bottom: 0.75rem; }
    .footer-card p { color: #94a3b8; max-width: 500px; margin: 0 auto 1.75rem; }
    .footer-links { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem; }
    .social-pill {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #e2e8f0;
      transition: all 0.2s;
    }
    .social-pill:hover { background: #2563eb; color: #fff; border-color: #2563eb; }
    .copyright { color: #475569; font-size: 0.85rem; }
  </style>
</head>
<body>
  <!-- Navigation Bar -->
  <nav class="site-nav">
    <a href="#" class="brand">${data.name || 'Portfolio'}<span>.</span></a>
    <ul class="nav-links">
      <li><a href="#about">About</a></li>
      ${data.projects && data.projects.length > 0 ? '<li><a href="#projects">Projects</a></li>' : ''}
      ${data.skills && data.skills.length > 0 ? '<li><a href="#skills">Skills</a></li>' : ''}
      ${data.experience && data.experience.length > 0 ? '<li><a href="#experience">Experience</a></li>' : ''}
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>

  <div class="container">
    <!-- Hero Section -->
    <header class="hero" id="about">
      <div class="avatar-wrap">
        ${
          data.avatarUrl
            ? `<img src="${data.avatarUrl}" alt="${data.name || 'Profile'}" class="avatar-img" onerror="this.parentElement.innerHTML='<div class=\\'avatar-initials\\'>${initials}</div>';" />`
            : `<div class="avatar-initials">${initials}</div>`
        }
      </div>
      <div class="hero-badge">
        <span class="hero-dot"></span> Available for Opportunities
      </div>
      <h1>${data.name || 'Developer'}</h1>
      <p class="headline">${data.headline || 'Software Engineer & Builder'}</p>
      <p class="about-text">${data.about || 'Passionate developer focused on building intuitive, high-performance web experiences and software applications.'}</p>
      <div class="hero-cta">
        ${data.contact?.email ? `<a href="mailto:${data.contact.email}" class="btn-main">Get in Touch</a>` : ''}
        ${data.links?.github ? `<a href="${data.links.github}" target="_blank" rel="noopener noreferrer" class="btn-outline">GitHub ↗</a>` : ''}
        ${data.links?.linkedin ? `<a href="${data.links.linkedin}" target="_blank" rel="noopener noreferrer" class="btn-outline">LinkedIn ↗</a>` : ''}
      </div>
    </header>

    <!-- Projects Section -->
    ${
      data.projects && data.projects.length > 0
        ? `
    <section id="projects">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        ${data.projects
          .map(
            (p) => `
          <div class="project-card">
            <h3 class="project-title">${p.name || 'Project'}</h3>
            <p class="project-desc">${p.description || ''}</p>
            ${
              p.tech && p.tech.length > 0
                ? `<div class="tech-badges">
                    ${p.tech.map((t) => `<span class="badge">${t}</span>`).join('')}
                  </div>`
                : ''
            }
            ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener noreferrer" class="project-link">View Project ↗</a>` : ''}
          </div>
        `,
          )
          .join('')}
      </div>
    </section>
    `
        : ''
    }

    <!-- Skills Section -->
    ${
      data.skills && data.skills.length > 0
        ? `
    <section id="skills">
      <h2 class="section-title">Skills & Technologies</h2>
      <div class="skills-wrap">
        ${data.skills.map((s) => `<span class="skill-tag">${s}</span>`).join('')}
      </div>
    </section>
    `
        : ''
    }

    <!-- Experience Section -->
    ${
      data.experience && data.experience.length > 0
        ? `
    <section id="experience">
      <h2 class="section-title">Work Experience</h2>
      <div class="exp-list">
        ${data.experience
          .map(
            (e) => `
          <div class="exp-item">
            <div class="exp-header">
              <div>
                <span class="exp-role">${e.role || 'Role'}</span> at <span class="exp-company">${e.company || 'Company'}</span>
              </div>
              <span class="exp-period">${e.start ? `${e.start} - ${e.end || 'Present'}` : ''}</span>
            </div>
            <p class="exp-desc">${e.description || ''}</p>
          </div>
        `,
          )
          .join('')}
      </div>
    </section>
    `
        : ''
    }

    <!-- Contact & Footer -->
    <footer class="footer-card" id="contact">
      <h2>Let's Build Something Great Together</h2>
      <p>Have an exciting project, job opportunity, or just want to connect? My inbox is always open.</p>
      <div class="footer-links">
        ${data.contact?.email ? `<a href="mailto:${data.contact.email}" class="social-pill">✉️ ${data.contact.email}</a>` : ''}
        ${data.links?.github ? `<a href="${data.links.github}" target="_blank" rel="noopener noreferrer" class="social-pill">GitHub</a>` : ''}
        ${data.links?.linkedin ? `<a href="${data.links.linkedin}" target="_blank" rel="noopener noreferrer" class="social-pill">LinkedIn</a>` : ''}
        ${data.links?.twitter ? `<a href="${data.links.twitter}" target="_blank" rel="noopener noreferrer" class="social-pill">Twitter / X</a>` : ''}
      </div>
      <p class="copyright">Designed and exported with PortfolioCraft</p>
    </footer>
  </div>
</body>
</html>`;
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const html = generateFullHtml();

      const readme = `# Portfolio Website - ${data.name || 'Developer'}

This complete static portfolio website was created with **PortfolioCraft**.

## Files Included:
- \`index.html\`: Complete, fully styled, standalone responsive website with all sections, styles, avatar support, and smooth navigation.

## Deployment Options:
1. **GitHub Pages (Free)**:
   - Create a repository on GitHub (e.g. \`${cleanSlug}.github.io\`).
   - Push \`index.html\` to the \`main\` branch.
   - Go to Settings > Pages > Select "Deploy from a branch (main)".

2. **Vercel or Netlify (Free & Instant)**:
   - Simply drag-and-drop this entire unzipped folder into [Netlify Drop](https://app.netlify.com/drop) or import to [Vercel](https://vercel.com/new).

3. **Any Static Host**:
   - Works on Apache, Nginx, AWS S3, Cloudflare Pages, Firebase Hosting, or any web server without extra build steps.
`;

      zip.file('index.html', html);
      zip.file('README.md', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cleanSlug}-portfolio-website.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadHtml = () => {
    const htmlContent = generateFullHtml();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanSlug}-portfolio.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareText = encodeURIComponent(`Check out my new developer portfolio built with Portfolio Maker! ${liveUrl}`);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="publish-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Confetti Animation Elements */}
        <div className="confetti-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`confetti-piece p-${i % 5}`} />
          ))}
        </div>

        <div className="publish-header">
          <div className="celebrate-badge">🎉 Congratulations!</div>
          <h2>Your Portfolio is Ready!</h2>
          <p>Your portfolio is customized with the <strong>{theme}</strong> theme, complete with your photo, projects, and contact info.</p>
        </div>

        {/* Live URL Card */}
        <div className="published-url-card">
          <div className="url-indicator">
            <span className="live-dot" />
            <span className="live-label">LIVE AT</span>
          </div>
          <div className="published-link-row">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="published-link-anchor"
            >
              {liveUrl}
            </a>
            <button
              className={`btn-copy-live ${copied ? 'copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
        </div>

        {/* Share & Export Buttons */}
        <div className="publish-action-grid">
          <button
            className="btn-download-zip"
            onClick={handleDownloadZip}
            disabled={isZipping}
          >
            <span>{isZipping ? '⏳ Bundling Zip...' : '📦 Download Website (.zip)'}</span>
          </button>

          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-share-social x-share"
          >
            <span>Share on X</span>
            <span>↗</span>
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(liveUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-share-social linkedin-share"
          >
            <span>Share on LinkedIn</span>
            <span>↗</span>
          </a>

          <button className="btn-export-html" onClick={handleDownloadHtml}>
            <span>⬇ Download HTML</span>
          </button>

          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-visit-site"
          >
            <span>Visit Live Site ↗</span>
          </a>
        </div>
      </div>
    </div>
  );
};
