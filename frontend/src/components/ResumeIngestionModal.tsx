import React, { useState, useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ResumeData } from '../types';
import { uploadResume, parseResumeText } from '../services/api';

interface ResumeIngestionModalProps {
  isOpen: boolean;
  selectedTemplateId: string;
  onClose: () => void;
  onDataParsed: (data: ResumeData, templateId: string) => void;
  sampleData: ResumeData;
}

export const ResumeIngestionModal: React.FC<ResumeIngestionModalProps> = ({
  isOpen,
  selectedTemplateId,
  onClose,
  onDataParsed,
  sampleData,
}) => {
  const { getToken, isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'demo'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('Extracting document contents...');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage('');
    setProcessingStage('Analyzing resume with Groq LLaMA 3.3 AI...');

    try {
      const token = isSignedIn ? await getToken() : null;
      const result = await uploadResume(file, token);
      if (result.data) {
        setProcessingStage('Generating portfolio layout...');
        setTimeout(() => {
          setIsProcessing(false);
          onDataParsed(result.data, selectedTemplateId);
        }, 600);
      } else {
        throw new Error('Could not parse resume data');
      }
    } catch (err: any) {
      console.warn('Upload error, using fallback:', err);
      setIsProcessing(false);
      onDataParsed(sampleData, selectedTemplateId);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedText.trim() || pastedText.length < 15) {
      setErrorMessage('Please paste at least a few lines of resume or profile text.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    setProcessingStage('Parsing profile text with Groq AI...');

    try {
      const token = isSignedIn ? await getToken() : null;
      const parsed = await parseResumeText(pastedText, 'pasted-profile.txt', token);
      setProcessingStage('Formatting portfolio structure...');
      setTimeout(() => {
        setIsProcessing(false);
        onDataParsed(parsed, selectedTemplateId);
      }, 600);
    } catch (err: any) {
      console.warn('Text parse error:', err);
      setIsProcessing(false);
      onDataParsed(sampleData, selectedTemplateId);
    }
  };

  const handleLoadDemo = () => {
    onDataParsed(sampleData, selectedTemplateId);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="ingest-modal-overlay" onClick={onClose}>
      <div className="ingest-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top */}
        <div className="ingest-header">
          <div className="ingest-header-info">
            <span className="ingest-step-badge">Step 2 of 2</span>
            <h3 className="ingest-title">Provide Your Resume or Details</h3>
            <p className="ingest-subtitle">
              Selected template: <strong style={{ textTransform: 'capitalize', color: '#0f172a' }}>{selectedTemplateId}</strong>. Our AI will automatically extract your projects, work experience, and bio.
            </p>
          </div>
          <button className="ingest-close-btn" onClick={onClose} title="Cancel">✕</button>
        </div>

        {/* Tab Switcher */}
        <div className="ingest-tabs">
          <button
            className={`ingest-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => { setActiveTab('upload'); setErrorMessage(''); }}
          >
            <span>📁 Upload File (PDF/DOCX)</span>
          </button>
          <button
            className={`ingest-tab-btn ${activeTab === 'paste' ? 'active' : ''}`}
            onClick={() => { setActiveTab('paste'); setErrorMessage(''); }}
          >
            <span>✍️ Paste Text / LinkedIn</span>
          </button>
          <button
            className={`ingest-tab-btn ${activeTab === 'demo' ? 'active' : ''}`}
            onClick={() => { setActiveTab('demo'); setErrorMessage(''); }}
          >
            <span>⚡ Use Demo Profile</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="ingest-body">
          {errorMessage && (
            <div className="ingest-error-banner">
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          {isProcessing ? (
            <div className="ingest-processing-state">
              <div className="ingest-spinner-ring" />
              <h4 className="ingest-processing-title">{processingStage}</h4>
              <p className="ingest-processing-desc">Powered by Groq High-Speed LLaMA 3.3 Engine</p>
              <div className="ingest-progress-bar">
                <div className="ingest-progress-fill" />
              </div>
            </div>
          ) : activeTab === 'upload' ? (
            <div
              className={`ingest-dropzone ${isDragging ? 'dragover' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
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
              <div className="ingest-drop-icon">📄</div>
              <h4 className="ingest-drop-title">Drop your resume here, or <span className="highlight">browse</span></h4>
              <p className="ingest-drop-subtitle">Supports PDF, Word (.docx), or plain text up to 10MB</p>
              <div className="ingest-drop-pills">
                <span className="drop-pill">✓ Instant AI Extraction</span>
                <span className="drop-pill">✓ Privacy Preserved</span>
                <span className="drop-pill">✓ 1-Click Edit</span>
              </div>
            </div>
          ) : activeTab === 'paste' ? (
            <div className="ingest-paste-wrap">
              <textarea
                className="ingest-textarea"
                rows={8}
                placeholder="Paste your resume text, bio, or LinkedIn profile summary here... (e.g., Name, Experience, Skills, Education)"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
              <div className="ingest-paste-actions">
                <button
                  className="ingest-btn-submit"
                  onClick={handlePasteSubmit}
                  disabled={!pastedText.trim()}
                >
                  Parse with AI & Launch Studio →
                </button>
              </div>
            </div>
          ) : (
            <div className="ingest-demo-wrap">
              <div className="ingest-demo-card">
                <div className="demo-avatar">AR</div>
                <div className="demo-info">
                  <h4>{sampleData.name}</h4>
                  <p>{sampleData.headline}</p>
                  <div className="demo-tags">
                    <span>{sampleData.skills.length} Skills</span>
                    <span>{sampleData.experience.length} Experiences</span>
                    <span>{sampleData.projects.length} Projects</span>
                  </div>
                </div>
              </div>
              <button className="ingest-btn-submit" onClick={handleLoadDemo}>
                Load Demo Profile & Launch Studio →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
