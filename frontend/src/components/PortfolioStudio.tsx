import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ResumeData } from '../types';
import { FlowCVForm } from './FlowCVForm';
import { LivePortfolioPreview } from './LivePortfolioPreview';
import { AIPipelineModal } from './AIPipelineModal';
import { PublishModal } from './PublishModal';
import { uploadResume } from '../services/api';

interface PortfolioStudioProps {
  onBackToHome: () => void;
  initialMode?: 'upload' | 'manual';
}

const SAMPLE_DEVELOPER_DATA: ResumeData = {
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
  initialMode = 'upload',
}) => {
  const { getToken, isSignedIn } = useAuth();

  const [inputMode, setInputMode] = useState<'upload' | 'manual'>(initialMode);
  const [data, setData] = useState<ResumeData>(SAMPLE_DEVELOPER_DATA);
  const [theme, setTheme] = useState<string>('minimal');
  const [username, setUsername] = useState<string>('alex-rivera');
  const [isAIPipelineActive, setIsAIPipelineActive] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploadedFileName(file.name);
    setIsAIPipelineActive(true);

    try {
      const token = isSignedIn ? await getToken() : null;
      const res = await uploadResume(file, token);
      if (res.data) {
        setData(res.data);
        if (res.data.name) {
          setUsername(res.data.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
        }
      }
    } catch {
      // Fallback: If backend is offline in local dev mode, parse mock name from filename
      const derivedName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setData((prev) => ({
        ...prev,
        name: derivedName.length > 3 ? derivedName : prev.name,
      }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    setData(SAMPLE_DEVELOPER_DATA);
    setUsername('alex-rivera');
  };

  const handleAIEnhanceSection = (_section: string) => {
    setIsAIPipelineActive(true);
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
            <span className="studio-brand-name">PortfolioCraft Studio</span>
          </div>
        </div>

        {/* Center: Mode Toggles */}
        <div className="studio-mode-switch">
          <button
            className={`mode-switch-btn ${inputMode === 'upload' ? 'active' : ''}`}
            onClick={() => setInputMode('upload')}
          >
            <span>📄 Upload Resume</span>
          </button>
          <button
            className={`mode-switch-btn ${inputMode === 'manual' ? 'active' : ''}`}
            onClick={() => setInputMode('manual')}
          >
            <span>✏️ Fill Manually (FlowCV)</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="studio-topbar-right">
          <button className="btn-load-sample" onClick={handleLoadSample} title="Load pre-filled sample developer data">
            ⚡ Sample Data
          </button>
          <button className="btn-publish-shiny" onClick={() => setIsPublishModalOpen(true)}>
            <span>🚀 Publish Live</span>
          </button>
        </div>
      </header>

      {/* Mobile Top View Switcher (Visible on Phones Only) */}
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
      <main className="studio-split-workspace">
        {/* ── LEFT PANE: EDITOR & RESUME INPUT ─────────────────── */}
        <div className={`studio-editor-pane ${mobileTab === 'editor' ? 'mobile-visible' : 'mobile-hidden'}`}>
          {inputMode === 'upload' && (
            <div className="resume-upload-hero-card">
              <div
                className={`dropzone-box ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />

                <div className="dropzone-icon">📥</div>
                <h3>Drag &amp; Drop your resume file here</h3>
                <p>Supports PDF, DOCX, or TXT (Max 10MB)</p>
                <div className="dropzone-btn-wrap">
                  <button type="button" className="btn-browse-file">
                    Browse File from Computer
                  </button>
                </div>
              </div>

              <div className="upload-or-divider">
                <span>OR</span>
              </div>

              <div className="quick-switch-card">
                <div>
                  <h4>Prefer to enter details step-by-step?</h4>
                  <p>Use our FlowCV-style modular form to build section by section.</p>
                </div>
                <button
                  type="button"
                  className="btn-switch-manual"
                  onClick={() => setInputMode('manual')}
                >
                  Switch to Manual Form →
                </button>
              </div>
            </div>
          )}

          {/* FlowCV Manual Input Form */}
          <div className={inputMode === 'upload' ? 'mt-form-wrap' : ''}>
            <div className="flowcv-header-strip">
              <h3>Content &amp; Section Editor</h3>
              <p>Edits update the live preview instantaneously on the right.</p>
            </div>
            <FlowCVForm
              data={data}
              onChange={setData}
              onAIEnhance={handleAIEnhanceSection}
            />
          </div>
        </div>

        {/* ── RIGHT PANE: LIVE INTERACTIVE PREVIEW ──────────────── */}
        <div className={`studio-preview-pane ${mobileTab === 'preview' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <LivePortfolioPreview
            data={data}
            theme={theme}
            onThemeChange={setTheme}
            username={username}
            onUsernameChange={setUsername}
          />
        </div>
      </main>

      {/* AI Processing Animation Modal */}
      <AIPipelineModal
        isOpen={isAIPipelineActive}
        filename={uploadedFileName}
        onComplete={() => {
          setIsAIPipelineActive(false);
          setInputMode('manual');
        }}
      />

      {/* Celebratory Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        slug={username}
        data={data}
        theme={theme}
      />
    </div>
  );
};
