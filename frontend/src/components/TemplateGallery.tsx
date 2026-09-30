import React, { useState } from 'react';
import { TemplateDefinition, TemplatePreviewModal } from './TemplatePreviewModal';
import { ResumeData } from '../types';

export const CURATED_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'minimal',
    name: 'Minimal Developer',
    category: 'Engineer',
    description: 'Clean, high-contrast monochrome design. Puts your code, architecture, and projects front and center.',
    accentColor: '#0f172a',
    badge: 'Popular',
    features: ['Instant P99 Load Time', 'Clean Monospace Accents', 'Responsive Project Cards'],
  },
  {
    id: 'modern',
    name: 'Modern Executive',
    category: 'Executive',
    description: 'Sophisticated glassmorphism aesthetic with subtle glow accents and prominent career metrics.',
    accentColor: '#3b82f6',
    badge: 'Premium',
    features: ['Dark Mode Contrast', 'Interactive Timeline', 'Executive Metrics Grid'],
  },
  {
    id: 'bento',
    name: 'Aeline Bento Grid',
    category: 'Designer',
    description: 'Modern Apple-inspired asymmetric bento cards, showcasing projects, skill chips, and visual assets.',
    accentColor: '#6366f1',
    badge: 'Trending',
    features: ['Asymmetric Grid', 'Visual Avatar Spotlight', 'Social Badge Dock'],
  },
  {
    id: 'terminal',
    name: 'Tech Terminal',
    category: 'Engineer',
    description: 'Hacker-chic CLI-inspired interface with interactive prompt status and JetBrains Mono typography.',
    accentColor: '#10b981',
    badge: 'Developer',
    features: ['Shell Prompt Header', 'Syntax Highlights', 'Keyboard Navigation'],
  },
  {
    id: 'editorial',
    name: 'Creative Editorial',
    category: 'Designer',
    description: 'Bold typography and editorial layout tailored for product designers, architects, and writers.',
    accentColor: '#ec4899',
    badge: 'Creative',
    features: ['Serif Headlines', 'Case Study Focus', 'Image Carousel'],
  },
  {
    id: 'memphis',
    name: 'Memphis Pop',
    category: 'Minimal',
    description: 'Vibrant geometric accents with playful micro-interactions and high-conversion contact pills.',
    accentColor: '#f59e0b',
    badge: 'Playful',
    features: ['Geometric Motifs', 'High-Visibility CTAs', 'Fun Micro-animations'],
  },
];

interface TemplateGalleryProps {
  onSelectTemplate: (templateId: string) => void;
  sampleData: ResumeData;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  onSelectTemplate,
  sampleData,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewingTemplate, setPreviewingTemplate] = useState<TemplateDefinition | null>(null);

  const categories = ['All', 'Engineer', 'Designer', 'Executive', 'Minimal'];

  const filtered = selectedCategory === 'All'
    ? CURATED_TEMPLATES
    : CURATED_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <section className="template-gallery-section" id="templates">
      <div className="tg-container">
        {/* Section Header */}
        <div className="tg-header">
          <div className="tg-pill-tag">
            <span className="tg-dot" />
            <span>Step 1: Choose Your Aesthetic</span>
          </div>
          <h2 className="tg-title">Pick a Template to Preview & Start</h2>
          <p className="tg-subtitle">
            Every template is fully responsive, SEO-optimized, and automatically populated by AI in seconds.
          </p>

          {/* Category Filter Chips */}
          <div className="tg-filter-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`tg-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="tg-grid">
          {filtered.map((t) => (
            <div key={t.id} className="tg-card">
              {/* Card Header & Preview Mockup */}
              <div className="tg-card-preview" onClick={() => setPreviewingTemplate(t)}>
                <div className="tg-preview-inner">
                  <div className="tg-mockup-browser">
                    <div className="tg-browser-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                    <div className="tg-mockup-body theme-preview-box">
                      <div className="tmb-name" style={{ color: t.accentColor }}>{sampleData.name || 'Alex Rivera'}</div>
                      <div className="tmb-title">{sampleData.headline || 'Full-Stack Software Engineer'}</div>
                      <div className="tmb-chips">
                        <span className="tmb-chip">React</span>
                        <span className="tmb-chip">TypeScript</span>
                        <span className="tmb-chip">Node.js</span>
                      </div>
                      <div className="tmb-project">
                        <div className="tmb-proj-title">Featured Project</div>
                        <div className="tmb-proj-bar" />
                      </div>
                    </div>
                  </div>
                  <div className="tg-preview-overlay">
                    <span className="tg-preview-text">👁️ Click to Full Preview</span>
                  </div>
                </div>

                {t.badge && (
                  <span className="tg-badge" style={{ backgroundColor: t.accentColor + '18', color: t.accentColor }}>
                    {t.badge}
                  </span>
                )}
              </div>

              {/* Card Meta & Actions */}
              <div className="tg-card-info">
                <div className="tg-info-top">
                  <h3 className="tg-card-name">{t.name}</h3>
                  <span className="tg-card-cat">{t.category}</span>
                </div>
                <p className="tg-card-desc">{t.description}</p>

                <div className="tg-features-list">
                  {t.features.map((f, idx) => (
                    <div key={idx} className="tg-feature-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="tg-card-actions">
                  <button
                    className="tg-btn-preview"
                    onClick={() => setPreviewingTemplate(t)}
                    title="Preview with sample data"
                  >
                    Live Preview
                  </button>
                  <button
                    className="tg-btn-select"
                    onClick={() => onSelectTemplate(t.id)}
                  >
                    Select Template →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modal */}
      <TemplatePreviewModal
        template={previewingTemplate}
        sampleData={sampleData}
        isOpen={Boolean(previewingTemplate)}
        onClose={() => setPreviewingTemplate(null)}
        onSelectTemplate={onSelectTemplate}
      />
    </section>
  );
};
