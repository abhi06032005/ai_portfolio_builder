import { ResumeData, PortfolioRecord } from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

export async function uploadResume(
  file: File,
  token?: string | null,
): Promise<{ resumeId: string; email?: string; data: ResumeData }> {
  const formData = new FormData();
  formData.append('resume', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/resumes/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to upload and parse resume');
  }

  return json.data;
}

export async function createPortfolio(
  payload: {
    resumeId?: string;
    templateId: string;
    data: ResumeData;
  },
  token?: string | null,
): Promise<PortfolioRecord> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/portfolios`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to create portfolio');
  }

  return json.data;
}

export async function generatePreviewUrl(
  portfolioId: string,
  token?: string | null,
): Promise<{ previewToken: string; previewUrl: string; portfolio: PortfolioRecord }> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/portfolios/${portfolioId}/preview`, {
    method: 'POST',
    headers,
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to generate preview');
  }

  return json.data;
}

export async function deployPortfolio(
  portfolioId: string,
  repoName: string,
  token?: string | null,
): Promise<{ repoUrl: string; pagesUrl: string; portfolio: PortfolioRecord }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/portfolios/${portfolioId}/deploy`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ repoName }),
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to deploy to GitHub');
  }

  return json.data;
}

export async function fetchPortfolios(token?: string | null): Promise<PortfolioRecord[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/portfolios`, {
    method: 'GET',
    headers,
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to fetch portfolios');
  }

  return json.data;
}
