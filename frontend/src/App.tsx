import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { LogoStrip } from './components/LogoStrip';
import { AboutSection } from './components/AboutSection';
import { BentoGrid } from './components/BentoGrid';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { PortfoliosDrawer } from './components/PortfoliosDrawer';
import { PortfolioStudio } from './components/PortfolioStudio';
import { DonateModal } from './components/DonateModal';

export const App: React.FC = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioInitialMode, setStudioInitialMode] = useState<'upload' | 'manual'>('upload');
  const [isPortfoliosOpen, setIsPortfoliosOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  const handleOpenStudio = (mode: 'upload' | 'manual' = 'upload') => {
    setStudioInitialMode(mode);
    setIsStudioOpen(true);
  };

  const handleOpenDonate = () => setIsDonateOpen(true);
  const handleCloseDonate = () => setIsDonateOpen(false);

  const handleOpenPortfolios = () => setIsPortfoliosOpen(true);
  const handleClosePortfolios = () => setIsPortfoliosOpen(false);

  // If Studio view is active, render the full-screen split editor
  if (isStudioOpen) {
    return (
      <>
        <PortfolioStudio
          onBackToHome={() => setIsStudioOpen(false)}
          initialMode={studioInitialMode}
        />
        <DonateModal isOpen={isDonateOpen} onClose={handleCloseDonate} />
      </>
    );
  }

  return (
    <div className="app-root">
      {/* Hero Section with Full-Bleed Aesthetics, Punchlines & Action Buttons */}
      <Hero
        onOpenUpload={() => handleOpenStudio('upload')}
        onOpenPortfolios={handleOpenPortfolios}
        onViewDemo={() => handleOpenStudio('manual')}
        onOpenDonate={handleOpenDonate}
      />

      {/* Brand Logos Marquee */}
      <LogoStrip />

      {/* About Partner Section */}
      <AboutSection />

      {/* Bento Grid (120+, 100%, 520k+) */}
      <BentoGrid onOpenUpload={() => handleOpenStudio('upload')} />

      {/* How it works */}
      <HowItWorks />

      {/* Capabilities / Features */}
      <Features />

      {/* Testimonials */}
      <Testimonials />

      {/* Bottom CTA Card */}
      <div className="section-wrap" style={{ paddingTop: 0 }}>
        <div className="bottom-cta">
          <h2>Ready to build your live portfolio?</h2>
          <p>
            Upload your resume, let AI extract your story, and deploy to your personal edge-cached link in seconds.
          </p>
          <div className="bottom-cta-btns">
            <button className="btn-view-demo" onClick={() => handleOpenStudio('manual')}>
              Launch Studio Form
            </button>
            <button className="btn-get-started btn-shiny" onClick={() => handleOpenStudio('upload')}>
              <span>Get Started</span>
              <div className="btn-arrow-circle">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.5 11.5L11.5 4.5M5.5 4.5h6v6" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* My Portfolios Drawer */}
      <PortfoliosDrawer
        isOpen={isPortfoliosOpen}
        onClose={handleClosePortfolios}
        onNewPortfolio={() => handleOpenStudio('upload')}
      />

      {/* Donate / Project Support Modal */}
      <DonateModal isOpen={isDonateOpen} onClose={handleCloseDonate} />
    </div>
  );
};

export default App;
