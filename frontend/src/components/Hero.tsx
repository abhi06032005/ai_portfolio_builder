import React from 'react';
import { Header } from './Header';

interface HeroProps {
  onExploreTemplates: () => void;
  onOpenPortfolios: () => void;
  onViewDemo: () => void;
  onOpenDonate: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreTemplates,
  onOpenPortfolios,
  onViewDemo,
}) => {
  return (
    <div className="hero-outer" id="home">
      {/* Top Header */}
      <Header
        onOpenUpload={onExploreTemplates}
        onOpenPortfolios={onOpenPortfolios}
      />

      {/* Hero Content Section */}
      <div className="hero-inner">
        {/* Sleek Pill Badge */}
        <div className="hero-badge-pill" onClick={onExploreTemplates}>
          <span className="badge-sparkle">✨</span>
          <span className="badge-text">Next-Gen AI Portfolio Builder</span>
          <span className="badge-arrow">→</span>
        </div>

        {/* Primary Headline */}
        <h1 className="hero-heading">
          Select your aesthetic.<br />
          <span className="hero-heading-gradient">Deploy your live portfolio in seconds.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtext">
          Browse handcrafted modern templates, drop your resume or LinkedIn, and let ultra-fast Groq AI generate a stunning personal website ready for production.
        </p>

        {/* CTA Buttons */}
        <div className="hero-actions">
          <button className="btn-hero-primary" onClick={onExploreTemplates}>
            <span>Browse Templates & Start</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 8h9M8.5 3.5L13 8l-4.5 4.5" />
            </svg>
          </button>
          <button className="btn-hero-secondary" onClick={onViewDemo}>
            <span>Launch Live Studio</span>
          </button>
        </div>

        {/* Trust & Spec Badges */}
        <div className="hero-trust-bar">
          <div className="trust-item">
            <span className="trust-check">✓</span>
            <span>6 Curated Themes</span>
          </div>
          <div className="trust-item">
            <span className="trust-check">✓</span>
            <span>Groq LLaMA 3.3 Engine</span>
          </div>
          <div className="trust-item">
            <span className="trust-check">✓</span>
            <span>Instant ZIP Download</span>
          </div>
          <div className="trust-item">
            <span className="trust-check">✓</span>
            <span>Cloudflare Edge Delivery</span>
          </div>
        </div>

        {/* Interactive Floating Preview Teaser */}
        <div className="hero-preview-frame" onClick={onExploreTemplates}>
          <div className="hpf-header">
            <div className="hpf-dots">
              <span className="hpf-dot red" />
              <span className="hpf-dot yellow" />
              <span className="hpf-dot green" />
            </div>
            <div className="hpf-url-bar">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              <span>alexrivera.portfolio.dev</span>
            </div>
            <div className="hpf-tag">Preview Mode</div>
          </div>
          <div className="hpf-content">
            <div className="hpf-mockup-header">
              <div className="hpf-avatar">AR</div>
              <div>
                <div className="hpf-mockup-name">Alex Rivera</div>
                <div className="hpf-mockup-role">Staff Distributed Systems Engineer</div>
              </div>
            </div>
            <div className="hpf-mockup-chips">
              <span className="hpf-chip">TypeScript</span>
              <span className="hpf-chip">React</span>
              <span className="hpf-chip">Cloudflare Workers</span>
              <span className="hpf-chip">Go</span>
              <span className="hpf-chip">PostgreSQL</span>
            </div>
          </div>
          <div className="hpf-floating-banner">
            <span>🎨 Click to choose template and customize live</span>
          </div>
        </div>
      </div>
    </div>
  );
};
