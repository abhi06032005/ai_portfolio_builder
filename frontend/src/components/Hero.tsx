import React, { useRef, useEffect } from 'react';
import { Header } from './Header';

interface HeroProps {
  onOpenUpload: () => void;
  onOpenPortfolios: () => void;
  onViewDemo: () => void;
  onOpenDonate: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenUpload,
  onOpenPortfolios,
  onViewDemo,
  onOpenDonate,
}) => {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!stageRef.current) return;
      const xRatio = e.clientX / window.innerWidth - 0.5;
      const yRatio = e.clientY / window.innerHeight;
      stageRef.current.style.transform = `rotateX(${8 - yRatio * 4}deg) rotateY(${xRatio * 14}deg)`;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="hero-outer" id="home">
      <div className="hero-card">
        {/* Navigation with Clerk Auth */}
        <Header onOpenUpload={onOpenUpload} onOpenPortfolios={onOpenPortfolios} />

        {/* Center Headline & Action Buttons */}
        <div className="hero-center">
          <h1 className="hero-h1">
            Get your portfolio done in seconds.<br />
            Add your resume &amp; get started.
          </h1>

          <p className="hero-sub">
            Turn your PDF resume or work history into a stunning, high-converting developer portfolio. AI extracts your story, designs a custom website, and deploys it live at your personal link.
          </p>

          <div className="hero-cta-row">
            <button className="btn-get-started btn-shiny" onClick={onOpenUpload}>
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

            <button className="btn-donate-hero" onClick={onOpenDonate} title="Support this open source project">
              <span>☕ Donate to this project</span>
            </button>

            <button className="btn-view-demo" onClick={onViewDemo}>
              View Live Studio
            </button>
          </div>
        </div>

        {/* 3D Cylindrical Cards Arc */}
        <div className="hero-carousel-wrap">
          <div className="carousel-stage" ref={stageRef}>
            {/* Card 1: Intelligence in Every Decision (Bar Graph) */}
            <div className="float-card card-pos-1" title="Intelligence in Every Decision" onClick={onViewDemo}>
              <img
                src="https://framerusercontent.com/images/6CIbzpanm9QwttboqUvfD3LJr94.png?width=630"
                alt="Intelligence in Every Decision"
              />
            </div>

            {/* Card 2: Calendar & Messages Live Pill Badges */}
            <div className="float-card card-pos-2" title="Calendar & Messages Live" onClick={onViewDemo}>
              <img
                src="https://framerusercontent.com/images/fIybNZHyBu72xfFTdyUzRgab0Mc.png?width=630"
                alt="Calendar and Messages Live"
              />
            </div>

            {/* Card 3: Performance 49% Business Growth */}
            <div className="float-card card-pos-3" title="Performance 49% Growth" onClick={onViewDemo}>
              <img
                src="https://framerusercontent.com/images/Xs5D1qDo4uJKopeDuIyOE87MqPw.png?width=630"
                alt="Performance 49% Growth"
              />
            </div>

            {/* Card 4 (Center): Data Points 520k+ */}
            <div className="float-card card-pos-4" title="Data Points 520k+" onClick={onOpenUpload}>
              <img
                src="https://framerusercontent.com/images/9OmbiS9xjEf1LBFWMnuglmayMKk.png?width=630"
                alt="Data Points 520k+"
              />
            </div>

            {/* Card 5: Data Training Upload Content (Cyan Glow) */}
            <div className="float-card card-pos-5" title="Data Training Upload Content" onClick={onOpenUpload}>
              <img
                src="https://framerusercontent.com/images/DJtFCnryarmP1ZSHtWkVN0XYXuM.png?width=630"
                alt="Data Training"
              />
            </div>

            {/* Card 6: Expertise Combining Strategy & Data */}
            <div className="float-card card-pos-6" title="Strategy and Data Expertise" onClick={onViewDemo}>
              <img
                src="https://framerusercontent.com/images/wAB2rKVe4BkrVIHZAOdZS3FE6Tw.png?width=630"
                alt="Expertise"
              />
            </div>

            {/* Card 7: Analytics Overview */}
            <div className="float-card card-pos-7" title="Analytics Overview" onClick={onViewDemo}>
              <img
                src="https://framerusercontent.com/images/sO1jgMhBr28EnEhgtxehLBQaFI.png?width=630"
                alt="Analytics"
              />
            </div>
          </div>
        </div>

        {/* Bottom Rating */}
        <div className="hero-rating-box">
          <div className="rating-label">Rated 4.9/5 by 4.900+ developers</div>
          <div className="rating-stars">★★★★★</div>
        </div>
      </div>
    </div>
  );
};
