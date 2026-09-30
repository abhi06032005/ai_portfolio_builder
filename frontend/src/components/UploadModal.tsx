import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { uploadResume, createPortfolio, generatePreviewUrl, deployPortfolio } from '../services/api';
import { ResumeData } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplate?: string;
}

type Step = 'upload' | 'parsing' | 'review' | 'template' | 'success';

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, initialTemplate = 'minimal' }) => {
  const { getToken, isSignedIn } = useAuth();

  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplate);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deployResult, setDeployResult] = useState<{ repoUrl: string; pagesUrl: string } | null>(null);
  const [githubRepoName, setGithubRepoName] = useState<string>('my-portfolio');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError(null);
    setStep('parsing');
    setLoading(true);

    try {
      const token = isSignedIn ? await getToken() : null;
      // Upload file -> Backend extracts raw text -> LLM parses -> Neon DB stores raw text + email + parsed data
      const result = await uploadResume(file, token);
      setResumeId(result.resumeId);
      setResumeData(result.data);
      setStep('review');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to extract resume data. Please try another file.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleCreatePortfolioAndPreview = async () => {
    if (!resumeData) return;
    setLoading(true);
    setError(null);

    try {
      const token = isSignedIn ? await getToken() : null;
      // 1. Create portfolio record in Neon DB with Prisma
      const portfolio = await createPortfolio(
        {
          resumeId: resumeId || undefined,
          templateId: selectedTemplate,
          data: resumeData,
        },
        token,
      );
      setPortfolioId(portfolio.id);

      // 2. Generate preview site
      const preview = await generatePreviewUrl(portfolio.id, token);
      setPreviewUrl(preview.previewUrl);
      setStep('success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate portfolio preview');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployToGitHub = async () => {
    if (!portfolioId) return;
    setLoading(true);
    setError(null);

    try {
      const token = isSignedIn ? await getToken() : null;
      const res = await deployPortfolio(portfolioId, githubRepoName, token);
      setDeployResult({ repoUrl: res.repoUrl, pagesUrl: res.pagesUrl });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'GitHub deployment failed. Please ensure your GitHub account is linked.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {step === 'upload' && 'Upload Your Resume'}
            {step === 'parsing' && 'AI Extraction in Progress...'}
            {step === 'review' && 'Review & Edit Extracted Data'}
            {step === 'template' && 'Choose Your Template'}
            {step === 'success' && 'Your Portfolio is Ready!'}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 18, fontSize: 13.5 }}>
              ⚠️ {error}
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div>
              <div
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="drop-icon">📄</div>
                <div className="drop-title">Click to upload or drag & drop your resume</div>
                <div className="drop-sub">PDF or DOCX (Max 10MB)</div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </div>

              <div style={{ marginTop: 24, padding: '16px 20px', background: '#f8fafc', borderRadius: 12, fontSize: 13, color: '#475569' }}>
                💡 <strong>What happens next:</strong>
                <ul style={{ paddingLeft: 18, marginTop: 8, lineHeight: 1.6 }}>
                  <li>Our parser extracts raw text from your resume.</li>
                  <li>Our LLM structure pipeline maps your work experience, skills, and projects.</li>
                  <li>All extracted data is stored in Neon PostgreSQL via Prisma.</li>
                  <li>You review, pick a design, and deploy to GitHub Pages with 1 click.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 2: PARSING */}
          {step === 'parsing' && (
            <div className="ai-processing">
              <div className="ai-spinner" />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#131313', marginBottom: 8 }}>
                AI is reading & organizing your resume...
              </div>
              <div style={{ fontSize: 14, color: '#64748b' }}>
                {selectedFile ? `Processing "${selectedFile.name}"...` : 'Extracting contact info, work history, projects, and skills.'}
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & EDIT */}
          {step === 'review' && resumeData && (
            <div>
              <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 20 }}>
                Verify and tweak your information before generating the site. All changes save directly to your portfolio.
              </p>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={resumeData.name}
                    onChange={(e) => setResumeData({ ...resumeData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    value={resumeData.contact?.email || ''}
                    onChange={(e) => setResumeData({
                      ...resumeData,
                      contact: { ...resumeData.contact, email: e.target.value },
                    })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Professional Headline</label>
                <input
                  className="form-input"
                  value={resumeData.headline}
                  onChange={(e) => setResumeData({ ...resumeData, headline: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">About / Bio</label>
                <textarea
                  className="form-textarea"
                  value={resumeData.about}
                  onChange={(e) => setResumeData({ ...resumeData, about: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Profile Photo / Avatar (Optional)</span>
                  {resumeData.avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setResumeData({ ...resumeData, avatarUrl: '' })}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: resumeData.avatarUrl ? `url(${resumeData.avatarUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 16,
                    border: '2px solid rgba(0,0,0,0.1)',
                    flexShrink: 0
                  }}>
                    {!resumeData.avatarUrl && (resumeData.name ? resumeData.name.charAt(0).toUpperCase() : '👤')}
                  </div>
                  <input
                    className="form-input"
                    type="url"
                    placeholder="https://... or paste your profile photo URL"
                    value={resumeData.avatarUrl || ''}
                    onChange={(e) => setResumeData({ ...resumeData, avatarUrl: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Key Skills (comma separated)</label>
                <input
                  className="form-input"
                  value={resumeData.skills.join(', ')}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
                <div className="tags-box">
                  {resumeData.skills.slice(0, 10).map((skill, i) => (
                    <span key={i} className="tag-chip">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: TEMPLATE SELECTOR */}
          {step === 'template' && (
            <div>
              <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 16 }}>
                Choose the visual aesthetic for your live portfolio:
              </p>

              <div className="template-grid">
                <div
                  className={`template-card ${selectedTemplate === 'template1' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('template1')}
                >
                  <div className="template-thumb" style={{ background: '#f5efe2', color: '#17140d', border: '2px solid #17140d', fontWeight: 800 }}>
                    🎨 Memphis Pop
                  </div>
                  <div className="template-name">Memphis Pop</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Playful postmodern aesthetic with animated confetti &amp; 3D shadows</div>
                </div>

                <div
                  className={`template-card ${selectedTemplate === 'template2' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('template2')}
                >
                  <div className="template-thumb" style={{ background: '#f1f5f9', color: '#0f172a', fontWeight: 800 }}>
                    📰 Typefolio
                  </div>
                  <div className="template-name">Typefolio</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Clean modern editorial layout with hero banner &amp; project cards</div>
                </div>

                <div
                  className={`template-card ${selectedTemplate === 'template3' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('template3')}
                >
                  <div className="template-thumb" style={{ background: '#0e0e11', color: '#f59e0b', border: '1px solid #333', fontWeight: 800 }}>
                    🎸 Grunge Editorial
                  </div>
                  <div className="template-name">Grunge</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Distressed aesthetic with vinyl disc hover animations &amp; noise texture</div>
                </div>

                <div
                  className={`template-card ${selectedTemplate === 'template4' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('template4')}
                >
                  <div className="template-thumb" style={{ background: '#08080a', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)', fontWeight: 800 }}>
                    ✨ Dark Minimalist
                  </div>
                  <div className="template-name">Dark Minimal</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Ultra-sleek monochrome dark mode with glowing accents &amp; logo marquee</div>
                </div>

                <div
                  className={`template-card ${selectedTemplate === 'template5' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('template5')}
                >
                  <div className="template-thumb" style={{ background: '#07080d', color: '#38bdf8', border: '1px solid #1e293b', fontWeight: 800 }}>
                    🌌 3D Cyber Canvas
                  </div>
                  <div className="template-name">3D Cyber</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Interactive constellation particle canvas &amp; edge outline typography</div>
                </div>

                <div
                  className={`template-card ${selectedTemplate === 'template6' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('template6')}
                >
                  <div className="template-thumb" style={{ background: '#050816', color: '#915eff', border: '1px solid #915eff', fontWeight: 800 }}>
                    🚀 Dev Studio 3D
                  </div>
                  <div className="template-name">Studio 3D</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Cosmic starfield, glowing hero lines, service cards &amp; tech ball chips</div>
                </div>

                <div
                  className={`template-card ${selectedTemplate === 'template7' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('template7')}
                >
                  <div className="template-thumb" style={{ background: '#000717', color: '#ff4d88', border: '1px solid #ff4d88', fontWeight: 800 }}>
                    ⚡ Brayden Modern
                  </div>
                  <div className="template-name">Brayden Modern</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Playful hand-drawn doodles, hot pink rules &amp; modular grid cards</div>
                </div>

                <div
                  className={`template-card ${selectedTemplate === 'template8' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('template8')}
                >
                  <div className="template-thumb" style={{ background: '#000000', color: '#fcf6f4', border: '1px solid #444', fontWeight: 800 }}>
                    ☯ Spaceman Creative
                  </div>
                  <div className="template-name">Spaceman</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Artistic split yin-yang layout with floating astronaut illustrations</div>
                </div>

                <div
                  className={`template-card ${selectedTemplate === 'template9' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('template9')}
                >
                  <div className="template-thumb" style={{ background: '#09090b', color: '#f97316', border: '1px solid #27272a', fontWeight: 800 }}>
                    🔥 Zolt Shadcn
                  </div>
                  <div className="template-name">Zolt Shadcn</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Zinc-950 panels, case study cards, and sleek typography</div>
                </div>

                <div
                  className={`template-card ${selectedTemplate === 'minimal' ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate('minimal')}
                >
                  <div className="template-thumb" style={{ background: '#0a0a0f', border: '1px solid #222' }}>
                    Dark Minimalist
                  </div>
                  <div className="template-name">Minimal</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Clean, high contrast, typography focused</div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SUCCESS / DEPLOY */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: '#131313', marginBottom: 8 }}>
                Your Portfolio is Live!
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                Preview your portfolio right now or publish it to your GitHub Pages repository.
              </p>

              {previewUrl && (
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, padding: '12px 28px' }}
                  >
                    <span>👁️ Open Live Preview</span>
                    <span>↗</span>
                  </a>

                  <a
                    href={previewUrl.endsWith('/') ? `${previewUrl}download` : `${previewUrl}/download`}
                    download
                    className="btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 15,
                      padding: '12px 24px',
                      background: '#ffffff',
                      border: '2px solid #cbd5e1',
                      borderRadius: 9999,
                      fontWeight: 700,
                      color: '#0f172a',
                      textDecoration: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span>📦 Download Website (.zip)</span>
                  </a>
                </div>
              )}

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, textAlign: 'left', maxWidth: 500, margin: '0 auto' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#131313', marginBottom: 10 }}>
                  Deploy to GitHub Pages
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    className="form-input"
                    style={{ flex: 1 }}
                    value={githubRepoName}
                    placeholder="repository-name"
                    onChange={(e) => setGithubRepoName(e.target.value)}
                  />
                  <button
                    className="btn-primary"
                    disabled={loading}
                    onClick={handleDeployToGitHub}
                  >
                    {loading ? 'Deploying...' : 'Deploy'}
                  </button>
                </div>

                {deployResult && (
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, fontSize: 13, color: '#065f46' }}>
                    ✅ Deployed successfully!
                    <div style={{ marginTop: 4 }}>
                      <a href={deployResult.pagesUrl} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                        Visit {deployResult.pagesUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER CONTROLS */}
        <div className="modal-footer">
          {step === 'review' && (
            <>
              <button className="btn-secondary" onClick={() => setStep('upload')}>Back</button>
              <button className="btn-primary" onClick={() => setStep('template')}>Next: Choose Template →</button>
            </>
          )}

          {step === 'template' && (
            <>
              <button className="btn-secondary" onClick={() => setStep('review')}>Back</button>
              <button className="btn-primary" disabled={loading} onClick={handleCreatePortfolioAndPreview}>
                {loading ? 'Building Site...' : 'Generate Portfolio ✨'}
              </button>
            </>
          )}

          {step === 'success' && (
            <button className="btn-secondary" onClick={onClose}>Done</button>
          )}
        </div>
      </div>
    </div>
  );
};
