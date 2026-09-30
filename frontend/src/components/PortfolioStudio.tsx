import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ResumeData } from '../types';
import { FlowCVForm } from './FlowCVForm';
import { LivePortfolioPreview } from './LivePortfolioPreview';
import { PublishModal } from './PublishModal';
import { uploadResume, parseResumeText } from '../services/api';
import JSZip from 'jszip';

interface PortfolioStudioProps {
  onBackToHome: () => void;
  initialMode?: 'upload' | 'manual';
  initialTemplate?: string;
  initialData?: ResumeData;
}

export const SAMPLE_DEVELOPER_DATA: ResumeData = {
  name: 'Alex Rivera',
  headline: 'Staff Full-Stack Engineer & Distributed Systems Architect',
  about: 'Crafting high-throughput distributed systems and delightful web applications. Obsessed with clean UI, zero-latency edge computing, and developer ergonomics.',
  contact: {
    email: 'alex.rivera@example.com',
    location: 'San Francisco, CA / Remote',
    phone: '+1 (555) 349-2910',
  },
  links: {
    github: 'https://github.com/alexrivera',
    linkedin: 'https://linkedin.com/in/alexrivera-dev',
    website: 'https://alexrivera.dev',
  },
  skills: [
    'React', 'TypeScript', 'Next.js', 'Node.js', 'Cloudflare Workers',
    'PostgreSQL', 'TailwindCSS', 'Go', 'Docker', 'GraphQL', 'AWS', 'Redis'
  ],
  experience: [
    {
      company: 'Vercel',
      role: 'Senior Staff Engineer',
      start: '2023',
      end: 'Present',
      description: 'Architected edge caching layer reducing median P99 latency by 38% across 100M+ monthly requests.',
    },
    {
      company: 'Stripe',
      role: 'Full Stack Engineer',
      start: '2020',
      end: '2023',
      description: 'Built merchant onboarding flows and real-time fraud telemetry dashboards handling $10M+ daily volume.',
    },
  ],
  projects: [
    {
      name: 'Turbopack Edge Analytics',
      description: 'Real-time telemetry and distributed tracing dashboard built on top of Cloudflare D1 and WebSockets.',
      url: 'https://github.com/alexrivera/edge-analytics',
      tech: ['React', 'TypeScript', 'Cloudflare D1', 'Tailwind'],
    },
    {
      name: 'OmniUI Component System',
      description: 'Headless, accessible React component library with 12k+ GitHub stars and zero runtime CSS overhead.',
      url: 'https://github.com/alexrivera/omni-ui',
      tech: ['TypeScript', 'React', 'Framer Motion'],
    },
    {
      name: 'FastKV Distributed Cache',
      description: 'Lightweight in-memory key-value store with raft consensus written in Go and compiled to WASM.',
      url: 'https://github.com/alexrivera/fast-kv',
      tech: ['Go', 'WASM', 'Distributed Systems'],
    },
  ],
  education: [
    {
      school: 'University of California, Berkeley',
      degree: 'B.S. in Electrical Engineering & Computer Science',
      start: '2016',
      end: '2020',
    },
  ],
  sections: {
    showProjects: true,
    showExperience: true,
    showSkills: true,
    showEducation: true,
  },
};

export const PortfolioStudio: React.FC<PortfolioStudioProps> = ({
  onBackToHome,
  initialTemplate = 'minimal',
  initialData,
}) => {
  const { getToken, isSignedIn } = useAuth();

  const [data, setData] = useState<ResumeData>(initialData || SAMPLE_DEVELOPER_DATA);
  const [theme, setTheme] = useState<string>(initialTemplate);
  const [username, setUsername] = useState<string>(
    (initialData?.name || 'alex-rivera').toLowerCase().replace(/[^a-z0-9-_]/g, '-')
  );
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [pasteInputText, setPasteInputText] = useState<string>('');
  const [isPastingText, setIsPastingText] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTemplates = [
    { id: 'minimal', label: 'Minimal' },
    { id: 'modern', label: 'Modern' },
    { id: 'bento', label: 'Bento' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'editorial', label: 'Editorial' },
    { id: 'memphis', label: 'Memphis' },
  ];

  const handleFileUpload = async (file: File) => {
    setIsProcessingAI(true);
    try {
      const token = isSignedIn ? await getToken() : null;
      const res = await uploadResume(file, token);
      if (res.data) {
        setData(res.data);
        if (res.data.name) {
          setUsername(res.data.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
        }
      }
    } catch (err) {
      console.warn('File upload fallback:', err);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pasteInputText.trim()) return;
    setIsProcessingAI(true);
    try {
      const token = isSignedIn ? await getToken() : null;
      const parsed = await parseResumeText(pasteInputText, 'pasted-resume.txt', token);
      setData(parsed);
      if (parsed.name) {
        setUsername(parsed.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
      }
      setIsPastingText(false);
      setPasteInputText('');
    } catch (err) {
      console.warn('Paste parse error:', err);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.name || 'Portfolio'} - Personal Website</title>
  <link rel="stylesheet" href="style.css" />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
</head>
<body class="theme-${theme}">
  <div class="site-container">
    <header class="site-hero">
      <div class="hero-badge">✦ Available for opportunities</div>
      <h1 class="hero-name">${data.name || 'Your Name'}</h1>
      <p class="hero-headline">${data.headline || 'Software Engineer'}</p>
      <p class="hero-about">${data.about || ''}</p>
      <div class="hero-links">
        ${data.contact?.email ? `<a href="mailto:${data.contact.email}" class="btn-primary">Email Me</a>` : ''}
        ${data.links?.github ? `<a href="${data.links.github}" target="_blank" class="btn-secondary">GitHub</a>` : ''}
        ${data.links?.linkedin ? `<a href="${data.links.linkedin}" target="_blank" class="btn-secondary">LinkedIn</a>` : ''}
      </div>
    </header>

    ${data.skills && data.skills.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Skills &amp; Technologies</h2>
      <div class="skills-grid">
        ${data.skills.map((s) => `<span class="skill-tag">${s}</span>`).join('')}
      </div>
    </section>` : ''}

    ${data.projects && data.projects.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Featured Projects</h2>
      <div class="projects-grid">
        ${data.projects.map((p) => `
          <div class="project-card">
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            ${p.tech ? `<div class="tech-row">${p.tech.map((t) => `<span class="tech-tag">${t}</span>`).join('')}</div>` : ''}
            ${p.url ? `<a href="${p.url}" target="_blank" class="project-link">View Project ↗</a>` : ''}
          </div>
        `).join('')}
      </div>
    </section>` : ''}

    ${data.experience && data.experience.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Experience</h2>
      <div class="experience-list">
        ${data.experience.map((e) => `
          <div class="exp-card">
            <div class="exp-header">
              <span class="exp-company">${e.company}</span>
              <span class="exp-dates">${e.start} – ${e.end || 'Present'}</span>
            </div>
            <div class="exp-role">${e.role}</div>
            <p class="exp-desc">${e.description}</p>
          </div>
        `).join('')}
      </div>
    </section>` : ''}
  </div>
</body>
</html>`;

      const cssContent = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: #ffffff;
  color: #0f172a;
  line-height: 1.6;
  padding: 4rem 1.5rem;
}
.site-container { max-width: 820px; margin: 0 auto; }
.hero-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(15, 23, 42, 0.05);
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
}
.hero-name { font-size: 2.75rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.5rem; line-height: 1.1; }
.hero-headline { font-size: 1.25rem; color: #64748b; font-weight: 500; margin-bottom: 1.25rem; }
.hero-about { font-size: 1.05rem; color: #334155; margin-bottom: 2rem; max-width: 680px; }
.hero-links { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 3.5rem; }
.btn-primary { padding: 0.65rem 1.35rem; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.95rem; }
.btn-secondary { padding: 0.65rem 1.35rem; background: #f8fafc; border: 1px solid #e2e8f0; color: #0f172a; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.95rem; }
.section { margin-bottom: 3.5rem; }
.section-title { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 1.25rem; }
.skills-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.skill-tag { padding: 6px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 9999px; font-size: 0.85rem; font-weight: 500; }
.projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; }
.project-card { padding: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; }
.project-card h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
.project-card p { font-size: 0.9rem; color: #475569; margin-bottom: 1rem; }
.tech-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 1rem; }
.tech-tag { font-size: 0.75rem; padding: 2px 8px; background: #f1f5f9; border-radius: 4px; color: #475569; }
.project-link { font-size: 0.85rem; font-weight: 600; color: #0f172a; text-decoration: none; }
.experience-list { display: flex; flex-direction: column; gap: 1.25rem; }
.exp-card { padding: 1.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
.exp-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 1.05rem; }
.exp-dates { font-size: 0.85rem; color: #64748b; font-weight: normal; }
.exp-role { font-size: 0.95rem; color: #64748b; margin-bottom: 0.75rem; }
.exp-desc { font-size: 0.9rem; color: #334155; }
`;

      zip.file('index.html', htmlContent);
      zip.file('style.css', cssContent);
      zip.file('data.json', JSON.stringify(data, null, 2));

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username || 'portfolio'}-site.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('ZIP generation error:', e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleLoadSample = () => {
    setData(SAMPLE_DEVELOPER_DATA);
    setUsername('alex-rivera');
  };

  return (
    <div className="studio-fullscreen-root">
      {/* Studio Top Navigation Bar */}
      <header className="studio-topbar">
        <div className="studio-topbar-left">
          <button className="btn-studio-back" onClick={onBackToHome} title="Return to Landing Page">
            ← Home
          </button>
          <div className="studio-brand-badge">
            <span className="studio-logo-icon">✦</span>
            <span className="studio-brand-name">Portfolio Studio</span>
          </div>
        </div>

        {/* Center: Live Template Switcher Pills */}
        <div className="studio-template-pills">
          <span className="stp-label">Theme:</span>
          {availableTemplates.map((t) => (
            <button
              key={t.id}
              className={`stp-btn ${theme === t.id ? 'active' : ''}`}
              onClick={() => setTheme(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="studio-topbar-right">
          <button
            className="btn-studio-action"
            onClick={handleLoadSample}
            title="Load sample developer data"
          >
            <span>⚡ Sample</span>
          </button>
          <button
            className="btn-studio-action"
            onClick={() => fileInputRef.current?.click()}
            title="Upload another resume file"
          >
            <span>📁 Upload File</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <button
            className="btn-studio-action"
            onClick={() => setIsPastingText(!isPastingText)}
            title="Paste text / LinkedIn summary"
          >
            <span>✍️ Paste Text</span>
          </button>

          <button
            className="btn-studio-action"
            onClick={handleDownloadZip}
            disabled={isDownloadingZip}
            title="Download full static HTML/CSS/JSON zip package"
          >
            <span>{isDownloadingZip ? 'Zipping...' : '📥 Download ZIP'}</span>
          </button>

          <button className="btn-publish-shiny" onClick={() => setIsPublishModalOpen(true)}>
            <span>🚀 Publish Live</span>
          </button>
        </div>
      </header>

      {/* Optional Paste Text Dropdown Drawer */}
      {isPastingText && (
        <div className="studio-paste-banner">
          <div className="spb-inner">
            <div className="spb-header">
              <span>Paste Resume or Profile Text (Instant AI Parse)</span>
              <button className="spb-close" onClick={() => setIsPastingText(false)}>✕</button>
            </div>
            <textarea
              className="spb-textarea"
              rows={4}
              placeholder="Paste your resume text here to re-extract with Groq LLaMA 3.3..."
              value={pasteInputText}
              onChange={(e) => setPasteInputText(e.target.value)}
            />
            <div className="spb-actions">
              <button
                className="spb-submit-btn"
                onClick={handlePasteSubmit}
                disabled={!pasteInputText.trim() || isProcessingAI}
              >
                {isProcessingAI ? 'AI Extracting...' : 'Parse & Update Studio →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Processing Bar */}
      {isProcessingAI && (
        <div className="studio-ai-loader">
          <span className="loader-pulse" />
          <span>Groq AI is analyzing your resume and updating live sections...</span>
        </div>
      )}

      {/* Mobile Top View Switcher */}
      <div className="mobile-view-tabs">
        <button
          className={`mobile-tab-btn ${mobileTab === 'editor' ? 'active' : ''}`}
          onClick={() => setMobileTab('editor')}
        >
          ✏️ Edit Details
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileTab('preview')}
        >
          👁️ Live Website Preview
        </button>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="studio-workspace">
        {/* Left Pane: FlowCV Form Editor */}
        <div className={`studio-left-pane ${mobileTab === 'editor' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="editor-scrollable">
            <FlowCVForm
              data={data}
              onChange={(updatedData) => setData(updatedData)}
              onAIEnhance={(_section) => setIsProcessingAI(true)}
            />
          </div>
        </div>

        {/* Right Pane: Live Interactive Device Preview */}
        <div className={`studio-right-pane ${mobileTab === 'preview' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <LivePortfolioPreview
            data={data}
            theme={theme}
            onThemeChange={(newTheme) => setTheme(newTheme)}
            username={username}
            onUsernameChange={(newUsername) => setUsername(newUsername)}
          />
        </div>
      </div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        data={data}
        theme={theme}
        slug={username}
      />
    </div>
  );
};
