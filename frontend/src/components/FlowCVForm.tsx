import React, { useState } from 'react';
import { ResumeData, ExperienceItem, ProjectItem, EducationItem } from '../types';

interface FlowCVFormProps {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
  onAIEnhance?: (section: string) => void;
}

export const FlowCVForm: React.FC<FlowCVFormProps> = ({ data, onChange, onAIEnhance }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'projects' | 'skills' | 'education' | 'links'>('profile');
  const [newSkillInput, setNewSkillInput] = useState('');

  // ── Profile Updates ──────────────────────────────────────────
  const updateField = (field: keyof ResumeData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const updateContact = (field: string, value: string) => {
    onChange({
      ...data,
      contact: {
        ...data.contact,
        [field]: value,
      },
    });
  };

  const updateLink = (field: string, value: string) => {
    onChange({
      ...data,
      links: {
        ...data.links,
        [field]: value,
      },
    });
  };

  // ── Experience Helpers ───────────────────────────────────────
  const addExperience = () => {
    const newItem: ExperienceItem = {
      company: 'Acme Corp',
      role: 'Full Stack Engineer',
      start: '2023',
      end: 'Present',
      description: 'Engineered high-performance web applications and collaborated with product teams.',
    };
    updateField('experience', [...(data.experience || []), newItem]);
  };

  const updateExperienceItem = (index: number, key: keyof ExperienceItem, val: string) => {
    const list = [...(data.experience || [])];
    list[index] = { ...list[index], [key]: val };
    updateField('experience', list);
  };

  const removeExperience = (index: number) => {
    const list = (data.experience || []).filter((_, i) => i !== index);
    updateField('experience', list);
  };

  // ── Projects Helpers ─────────────────────────────────────────
  const addProject = () => {
    const newItem: ProjectItem = {
      name: 'AI SaaS Platform',
      description: 'Modern full-stack web application built with React, TypeScript, and edge APIs.',
      url: 'https://example.com',
      tech: ['React', 'TypeScript', 'Tailwind'],
    };
    updateField('projects', [...(data.projects || []), newItem]);
  };

  const updateProjectItem = (index: number, key: keyof ProjectItem, val: any) => {
    const list = [...(data.projects || [])];
    list[index] = { ...list[index], [key]: val };
    updateField('projects', list);
  };

  const removeProject = (index: number) => {
    const list = (data.projects || []).filter((_, i) => i !== index);
    updateField('projects', list);
  };

  // ── Skills Helpers ───────────────────────────────────────────
  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (data.skills?.includes(trimmed)) return;
    updateField('skills', [...(data.skills || []), trimmed]);
    setNewSkillInput('');
  };

  const removeSkill = (skill: string) => {
    updateField('skills', (data.skills || []).filter((s) => s !== skill));
  };

  // ── Education Helpers ────────────────────────────────────────
  const addEducation = () => {
    const newItem: EducationItem = {
      school: 'University of Technology',
      degree: 'B.S. in Computer Science',
      start: '2019',
      end: '2023',
    };
    updateField('education', [...(data.education || []), newItem]);
  };

  const updateEducationItem = (index: number, key: keyof EducationItem, val: string) => {
    const list = [...(data.education || [])];
    list[index] = { ...list[index], [key]: val };
    updateField('education', list);
  };

  const removeEducation = (index: number) => {
    const list = (data.education || []).filter((_, i) => i !== index);
    updateField('education', list);
  };

  const popularSkills = [
    'React', 'TypeScript', 'Node.js', 'Next.js', 'Python',
    'PostgreSQL', 'TailwindCSS', 'AWS', 'Docker', 'GraphQL',
    'Figma', 'Cloudflare Workers', 'Git', 'FastAPI'
  ];

  return (
    <div className="flowcv-container">
      {/* Tab Navigation Pill Bar */}
      <div className="flowcv-tabs">
        <button
          className={`flowcv-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span>👤</span>
          <span>Profile</span>
        </button>
        <button
          className={`flowcv-tab ${activeTab === 'experience' ? 'active' : ''}`}
          onClick={() => setActiveTab('experience')}
        >
          <span>💼</span>
          <span>Experience</span>
          <span className="tab-badge">{data.experience?.length || 0}</span>
        </button>
        <button
          className={`flowcv-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <span>🚀</span>
          <span>Projects</span>
          <span className="tab-badge">{data.projects?.length || 0}</span>
        </button>
        <button
          className={`flowcv-tab ${activeTab === 'skills' ? 'active' : ''}`}
          onClick={() => setActiveTab('skills')}
        >
          <span>⚡</span>
          <span>Skills</span>
          <span className="tab-badge">{data.skills?.length || 0}</span>
        </button>
        <button
          className={`flowcv-tab ${activeTab === 'education' ? 'active' : ''}`}
          onClick={() => setActiveTab('education')}
        >
          <span>🎓</span>
          <span>Education</span>
        </button>
        <button
          className={`flowcv-tab ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
        >
          <span>🔗</span>
          <span>Links</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="flowcv-body">
        {/* ── 1. PROFILE SECTION ─────────────────────────────────── */}
        {activeTab === 'profile' && (
          <div className="flowcv-section">
            <div className="section-title-row">
              <div>
                <h3>Personal Information</h3>
                <p>This appears in the hero banner of your portfolio.</p>
              </div>
              {onAIEnhance && (
                <button
                  type="button"
                  className="btn-ai-enhance"
                  onClick={() => onAIEnhance('profile')}
                  title="Enhance headline and bio with AI"
                >
                  <span>✨ AI Polish</span>
                </button>
              )}
            </div>

            <div className="flowcv-grid-2">
              <div className="flowcv-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={data.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="flowcv-field">
                <label>Professional Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack Engineer &amp; Open Source Builder"
                  value={data.headline || ''}
                  onChange={(e) => updateField('headline', e.target.value)}
                />
              </div>
            </div>

            <div className="flowcv-field">
              <label>Elevator Pitch / Bio</label>
              <textarea
                rows={3}
                placeholder="2-3 punchy sentences highlighting your superpowers and what you build..."
                value={data.about || ''}
                onChange={(e) => updateField('about', e.target.value)}
              />
            </div>

            <div className="flowcv-field" style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Profile Photo / Avatar (Optional)</span>
                {data.avatarUrl && (
                  <button
                    type="button"
                    onClick={() => updateField('avatarUrl', '')}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}
                  >
                    ✕ Remove Photo
                  </button>
                )}
              </label>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: data.avatarUrl ? `url(${data.avatarUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 20,
                  border: '2px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {!data.avatarUrl && (data.name ? data.name.charAt(0).toUpperCase() : '👤')}
                </div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or paste image URL"
                  value={data.avatarUrl || ''}
                  onChange={(e) => updateField('avatarUrl', e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="flowcv-grid-2">
              <div className="flowcv-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={data.contact?.email || ''}
                  onChange={(e) => updateContact('email', e.target.value)}
                />
              </div>

              <div className="flowcv-field">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="San Francisco, CA or Remote"
                  value={data.contact?.location || ''}
                  onChange={(e) => updateContact('location', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 2. EXPERIENCE SECTION ──────────────────────────────── */}
        {activeTab === 'experience' && (
          <div className="flowcv-section">
            <div className="section-title-row">
              <div>
                <h3>Work Experience</h3>
                <p>Chronological career journey and notable achievements.</p>
              </div>
              <button type="button" className="btn-add-item" onClick={addExperience}>
                + Add Position
              </button>
            </div>

            {(!data.experience || data.experience.length === 0) ? (
              <div className="flowcv-empty">
                <p>No work experience added yet.</p>
                <button type="button" className="btn-add-item" onClick={addExperience}>
                  + Add First Role
                </button>
              </div>
            ) : (
              <div className="flowcv-cards-list">
                {data.experience.map((exp, idx) => (
                  <div key={idx} className="flowcv-entry-card">
                    <div className="entry-card-header">
                      <span className="entry-card-num">#{idx + 1}</span>
                      <button
                        type="button"
                        className="entry-remove-btn"
                        onClick={() => removeExperience(idx)}
                        title="Remove role"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flowcv-grid-2">
                      <div className="flowcv-field">
                        <label>Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          placeholder="e.g. Stripe"
                          onChange={(e) => updateExperienceItem(idx, 'company', e.target.value)}
                        />
                      </div>
                      <div className="flowcv-field">
                        <label>Role / Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          placeholder="e.g. Lead Frontend Engineer"
                          onChange={(e) => updateExperienceItem(idx, 'role', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flowcv-grid-2">
                      <div className="flowcv-field">
                        <label>Start Date</label>
                        <input
                          type="text"
                          value={exp.start}
                          placeholder="e.g. 2021"
                          onChange={(e) => updateExperienceItem(idx, 'start', e.target.value)}
                        />
                      </div>
                      <div className="flowcv-field">
                        <label>End Date</label>
                        <input
                          type="text"
                          value={exp.end || 'Present'}
                          placeholder="e.g. Present"
                          onChange={(e) => updateExperienceItem(idx, 'end', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flowcv-field">
                      <label>Impact &amp; Key Responsibilities</label>
                      <textarea
                        rows={2}
                        value={exp.description}
                        placeholder="Scaled app architecture, improved core web vitals by 45%..."
                        onChange={(e) => updateExperienceItem(idx, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 3. PROJECTS SECTION ────────────────────────────────── */}
        {activeTab === 'projects' && (
          <div className="flowcv-section">
            <div className="section-title-row">
              <div>
                <h3>Featured Projects</h3>
                <p>Showcase products, apps, libraries, and open-source contributions.</p>
              </div>
              <button type="button" className="btn-add-item" onClick={addProject}>
                + Add Project
              </button>
            </div>

            {(!data.projects || data.projects.length === 0) ? (
              <div className="flowcv-empty">
                <p>No projects added yet.</p>
                <button type="button" className="btn-add-item" onClick={addProject}>
                  + Add First Project
                </button>
              </div>
            ) : (
              <div className="flowcv-cards-list">
                {data.projects.map((proj, idx) => (
                  <div key={idx} className="flowcv-entry-card">
                    <div className="entry-card-header">
                      <span className="entry-card-num">#{idx + 1}</span>
                      <button
                        type="button"
                        className="entry-remove-btn"
                        onClick={() => removeProject(idx)}
                        title="Remove project"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flowcv-grid-2">
                      <div className="flowcv-field">
                        <label>Project Title</label>
                        <input
                          type="text"
                          value={proj.name}
                          placeholder="e.g. DevPulse Analytics"
                          onChange={(e) => updateProjectItem(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="flowcv-field">
                        <label>Live URL / Demo Link</label>
                        <input
                          type="text"
                          value={proj.url || ''}
                          placeholder="https://myproject.com"
                          onChange={(e) => updateProjectItem(idx, 'url', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flowcv-field">
                      <label>Description</label>
                      <textarea
                        rows={2}
                        value={proj.description}
                        placeholder="What problem did you solve and what was the impact?"
                        onChange={(e) => updateProjectItem(idx, 'description', e.target.value)}
                      />
                    </div>

                    <div className="flowcv-field">
                      <label>Technologies Used (comma separated)</label>
                      <input
                        type="text"
                        value={proj.tech?.join(', ') || ''}
                        placeholder="React, TypeScript, Tailwind, Cloudflare D1"
                        onChange={(e) =>
                          updateProjectItem(
                            idx,
                            'tech',
                            e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 4. SKILLS SECTION ──────────────────────────────────── */}
        {activeTab === 'skills' && (
          <div className="flowcv-section">
            <div className="section-title-row">
              <div>
                <h3>Skills &amp; Tech Stack</h3>
                <p>Keywords that highlight your technical proficiency.</p>
              </div>
            </div>

            {/* Quick Add Custom Skill */}
            <div className="flowcv-field">
              <label>Add Skill</label>
              <div className="skill-input-row">
                <input
                  type="text"
                  placeholder="Type a skill (e.g. Next.js, Rust, Docker) and press Enter"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill(newSkillInput);
                    }
                  }}
                />
                <button type="button" className="btn-skill-add" onClick={() => addSkill(newSkillInput)}>
                  Add
                </button>
              </div>
            </div>

            {/* Current Active Skills */}
            <div className="flowcv-skills-chips-wrap">
              <label className="sub-label">Current Skills ({data.skills?.length || 0})</label>
              <div className="skill-badges-container">
                {(!data.skills || data.skills.length === 0) ? (
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>No skills added. Click popular suggestions below!</p>
                ) : (
                  data.skills.map((s) => (
                    <span key={s} className="interactive-skill-chip">
                      {s}
                      <button type="button" onClick={() => removeSkill(s)}>✕</button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Popular Suggestions */}
            <div className="popular-skills-wrap">
              <label className="sub-label">Quick Add Suggestions</label>
              <div className="suggested-chips">
                {popularSkills
                  .filter((ps) => !data.skills?.includes(ps))
                  .map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      className="suggested-chip-btn"
                      onClick={() => addSkill(ps)}
                    >
                      + {ps}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. EDUCATION SECTION ───────────────────────────────── */}
        {activeTab === 'education' && (
          <div className="flowcv-section">
            <div className="section-title-row">
              <div>
                <h3>Education &amp; Degrees</h3>
                <p>Academic background, bootcamps, and certifications.</p>
              </div>
              <button type="button" className="btn-add-item" onClick={addEducation}>
                + Add Degree
              </button>
            </div>

            {(!data.education || data.education.length === 0) ? (
              <div className="flowcv-empty">
                <p>No education records added yet.</p>
                <button type="button" className="btn-add-item" onClick={addEducation}>
                  + Add First Record
                </button>
              </div>
            ) : (
              <div className="flowcv-cards-list">
                {data.education.map((edu, idx) => (
                  <div key={idx} className="flowcv-entry-card">
                    <div className="entry-card-header">
                      <span className="entry-card-num">#{idx + 1}</span>
                      <button
                        type="button"
                        className="entry-remove-btn"
                        onClick={() => removeEducation(idx)}
                        title="Remove education"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flowcv-grid-2">
                      <div className="flowcv-field">
                        <label>School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          placeholder="e.g. Stanford University"
                          onChange={(e) => updateEducationItem(idx, 'school', e.target.value)}
                        />
                      </div>
                      <div className="flowcv-field">
                        <label>Degree / Major</label>
                        <input
                          type="text"
                          value={edu.degree}
                          placeholder="e.g. B.S. in Computer Science"
                          onChange={(e) => updateEducationItem(idx, 'degree', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flowcv-grid-2">
                      <div className="flowcv-field">
                        <label>Start Year</label>
                        <input
                          type="text"
                          value={edu.start || ''}
                          placeholder="2018"
                          onChange={(e) => updateEducationItem(idx, 'start', e.target.value)}
                        />
                      </div>
                      <div className="flowcv-field">
                        <label>End Year</label>
                        <input
                          type="text"
                          value={edu.end || ''}
                          placeholder="2022"
                          onChange={(e) => updateEducationItem(idx, 'end', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 6. SOCIAL LINKS SECTION ────────────────────────────── */}
        {activeTab === 'links' && (
          <div className="flowcv-section">
            <div className="section-title-row">
              <div>
                <h3>Social Profiles &amp; Links</h3>
                <p>Allow visitors and recruiters to discover your code and connect.</p>
              </div>
            </div>

            <div className="flowcv-field">
              <label>GitHub Profile URL</label>
              <input
                type="text"
                placeholder="https://github.com/yourusername"
                value={data.links?.github || ''}
                onChange={(e) => updateLink('github', e.target.value)}
              />
            </div>

            <div className="flowcv-field">
              <label>LinkedIn Profile URL</label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/yourusername"
                value={data.links?.linkedin || ''}
                onChange={(e) => updateLink('linkedin', e.target.value)}
              />
            </div>

            <div className="flowcv-field">
              <label>Personal Website / Blog</label>
              <input
                type="text"
                placeholder="https://yourwebsite.com"
                value={data.links?.website || ''}
                onChange={(e) => updateLink('website', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
