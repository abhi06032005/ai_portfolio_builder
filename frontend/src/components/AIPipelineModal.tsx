import React, { useEffect, useState } from 'react';

interface AIPipelineModalProps {
  isOpen: boolean;
  onComplete: () => void;
  filename?: string;
}

export const AIPipelineModal: React.FC<AIPipelineModalProps> = ({
  isOpen,
  onComplete,
  filename,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Reading Document & Extracting Text',
      desc: filename ? `Parsing structure from ${filename}...` : 'Extracting text and career milestones...',
      icon: '📄',
    },
    {
      title: 'AI Analyzing Experience & Metrics',
      desc: 'Identifying technical stack, key projects, and leadership roles...',
      icon: '🧠',
    },
    {
      title: 'Drafting High-Impact Portfolio Copy',
      desc: 'Generating punchy headlines, value propositions, and project highlights...',
      icon: '✨',
    },
    {
      title: 'Configuring Theme & Components',
      desc: 'Assembling glassmorphic cards, typography hierarchy, and badges...',
      icon: '🎨',
    },
    {
      title: 'Portfolio Ready!',
      desc: 'Opening live interactive split-screen editor...',
      icon: '🚀',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return prev;
        }
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [isOpen, onComplete, steps.length]);

  if (!isOpen) return null;

  const progressPercent = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="modal-backdrop">
      <div className="ai-pipeline-card">
        {/* Glow halo */}
        <div className="ai-pulse-halo" />

        <div className="ai-pipeline-header">
          <div className="ai-wand-badge">
            <span className="ai-sparkle">✦</span>
            <span>AI Resume-to-Portfolio Engine</span>
          </div>
          <h2>Building Your Live Portfolio</h2>
          <p>Sit back while our AI analyzes your experience and constructs your custom website.</p>
        </div>

        {/* Progress Bar */}
        <div className="pipeline-progress-track">
          <div
            className="pipeline-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="pipeline-progress-meta">
          <span>Processing Step {currentStep + 1} of {steps.length}</span>
          <span className="pipeline-pct">{progressPercent}%</span>
        </div>

        {/* Step Items List */}
        <div className="pipeline-steps-list">
          {steps.map((s, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isPending = idx > currentStep;

            return (
              <div
                key={s.title}
                className={`pipeline-step-item ${isDone ? 'done' : ''} ${isCurrent ? 'current' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="step-icon-wrap">
                  {isDone ? (
                    <span className="step-check">✓</span>
                  ) : isCurrent ? (
                    <div className="step-spinner" />
                  ) : (
                    <span className="step-static-icon">{s.icon}</span>
                  )}
                </div>
                <div className="step-text-wrap">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
