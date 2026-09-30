import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { fetchPortfolios } from '../services/api';
import { PortfolioRecord } from '../types';

interface PortfoliosDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNewPortfolio: () => void;
}

export const PortfoliosDrawer: React.FC<PortfoliosDrawerProps> = ({
  isOpen,
  onClose,
  onNewPortfolio,
}) => {
  const { getToken } = useAuth();
  const [portfolios, setPortfolios] = useState<PortfolioRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const data = await fetchPortfolios(token);
        setPortfolios(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load portfolios');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isOpen, getToken]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">My Saved Portfolios (Neon DB)</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 18, fontSize: 13.5 }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="ai-spinner" />
              <div style={{ color: '#64748b' }}>Loading records from Neon PostgreSQL...</div>
            </div>
          ) : portfolios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>No portfolios saved yet</div>
              <div style={{ fontSize: 13.5, color: '#64748b', marginBottom: 20 }}>
                Upload your resume and let AI generate your first live portfolio.
              </div>
              <button
                className="btn-primary"
                onClick={() => {
                  onClose();
                  onNewPortfolio();
                }}
              >
                + Upload Resume Now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {portfolios.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#ffffff',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: '#131313' }}>
                        {p.data?.name || 'Untitled Portfolio'}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 999,
                          background: p.status === 'DEPLOYED' ? '#dcfce7' : p.status === 'PREVIEW' ? '#e0f2fe' : '#f1f5f9',
                          color: p.status === 'DEPLOYED' ? '#15803d' : p.status === 'PREVIEW' ? '#0369a1' : '#475569',
                          textTransform: 'uppercase',
                        }}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>
                      Template: <strong>{p.templateId}</strong> • Created: {new Date(p.createdAt).toLocaleDateString()}
                      {p.resume?.email && (
                        <span> • Extracted email: <strong>{p.resume.email}</strong></span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {p.previewToken && (
                      <a
                        href={`/preview/${p.previewToken}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ fontSize: 12.5, padding: '7px 14px' }}
                      >
                        View Preview ↗
                      </a>
                    )}
                    {p.githubRepo && (
                      <a
                        href={`https://github.com/${p.githubRepo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ fontSize: 12.5, padding: '7px 14px' }}
                      >
                        GitHub Repo ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
