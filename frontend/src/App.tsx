import React, { useState } from 'react';
import { Hero } from './components/Hero';
import { TemplateGallery } from './components/TemplateGallery';
import { ResumeIngestionModal } from './components/ResumeIngestionModal';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { PortfoliosDrawer } from './components/PortfoliosDrawer';
import { PortfolioStudio, SAMPLE_DEVELOPER_DATA } from './components/PortfolioStudio';
import { DonateModal } from './components/DonateModal';
import { ResumeData } from './types';

export const App: React.FC = () => {
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState('minimal');
  const [activeResumeData, setActiveResumeData] = useState<ResumeData>(SAMPLE_DEVELOPER_DATA);
  const [isIngestionModalOpen, setIsIngestionModalOpen] = useState(false);
  const [isPortfoliosOpen, setIsPortfoliosOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  // When a user selects a template from the gallery or hero
  const handleSelectTemplate = (templateId: string) => {
    setActiveTemplate(templateId);
    setIsIngestionModalOpen(true);
  };

  // When resume data is extracted by AI or chosen from demo
  const handleResumeDataParsed = (data: ResumeData, templateId: string) => {
    setActiveResumeData(data);
    setActiveTemplate(templateId);
    setIsIngestionModalOpen(false);
    setIsStudioOpen(true);
  };

  const handleOpenPortfolios = () => setIsPortfoliosOpen(true);
  const handleClosePortfolios = () => setIsPortfoliosOpen(false);

  const handleOpenDonate = () => setIsDonateOpen(true);
  const handleCloseDonate = () => setIsDonateOpen(false);

  // Direct demo studio launch
  const handleLaunchDemoStudio = () => {
    setActiveResumeData(SAMPLE_DEVELOPER_DATA);
    setActiveTemplate('minimal');
    setIsStudioOpen(true);
  };

  // If Studio view is active, render full-screen split editor
  if (isStudioOpen) {
    return (
      <>
        <PortfolioStudio
          onBackToHome={() => setIsStudioOpen(false)}
          initialTemplate={activeTemplate}
          initialData={activeResumeData}
        />
        <DonateModal isOpen={isDonateOpen} onClose={handleCloseDonate} />
      </>
    );
  }

  return (
    <div className="app-root sleek-white-theme">
      {/* Sleek Minimalist Hero */}
      <Hero
        onExploreTemplates={() => {
          const el = document.getElementById('templates');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            handleSelectTemplate('minimal');
          }
        }}
        onOpenPortfolios={handleOpenPortfolios}
        onViewDemo={handleLaunchDemoStudio}
        onOpenDonate={handleOpenDonate}
      />

      {/* Step 1: Interactive Template Gallery & Live Preview */}
      <TemplateGallery
        onSelectTemplate={handleSelectTemplate}
        sampleData={activeResumeData}
      />

      {/* How It Works */}
      <HowItWorks />

      {/* Features & Capabilities */}
      <Features />

      {/* Testimonials */}
      <Testimonials />

      {/* Bottom Sleek CTA */}
      <section className="sleek-bottom-cta">
        <div className="bottom-cta-card">
          <span className="bcta-badge">✦ Instant Generation</span>
          <h2 className="bcta-title">Ready to launch your executive portfolio?</h2>
          <p className="bcta-desc">
            Choose a template, drop your resume, and let Groq AI build your portfolio site in under 30 seconds.
          </p>
          <div className="bcta-actions">
            <button
              className="btn-bcta-primary"
              onClick={() => handleSelectTemplate('minimal')}
            >
              <span>Get Started Now</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 8h9M8.5 3.5L13 8l-4.5 4.5" />
              </svg>
            </button>
            <button className="btn-bcta-secondary" onClick={handleLaunchDemoStudio}>
              Launch Studio Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Step 2: Ingestion Modal (File upload, text paste, demo profile) */}
      <ResumeIngestionModal
        isOpen={isIngestionModalOpen}
        selectedTemplateId={activeTemplate}
        onClose={() => setIsIngestionModalOpen(false)}
        onDataParsed={handleResumeDataParsed}
        sampleData={SAMPLE_DEVELOPER_DATA}
      />

      {/* Portfolios Drawer */}
      <PortfoliosDrawer
        isOpen={isPortfoliosOpen}
        onClose={handleClosePortfolios}
        onNewPortfolio={() => handleSelectTemplate('minimal')}
      />

      {/* Donate Modal */}
      <DonateModal isOpen={isDonateOpen} onClose={handleCloseDonate} />
    </div>
  );
};

export default App;
