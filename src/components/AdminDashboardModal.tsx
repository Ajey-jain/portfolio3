import { useEffect, useState, type FormEvent } from 'react';
import {
  BarChart3,
  BookOpen,
  Check,
  FolderGit2,
  Lock,
  LogOut,
  Mail,
  Plus,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type {
  AnalyticsDashboard,
  BlogPost,
  Certificate,
  CertificateCategory,
  ContactMessage,
  ProfileSettings,
  Project,
} from '../types/portfolio';
import { apiFetch } from '../utils/api';
import { CERTIFICATE_CATEGORY_ORDER } from '../utils/portfolioLogic';

interface AdminDashboardModalProps {
  open: boolean;
  onClose: () => void;
  onDataChanged: () => void;
}

type AdminTab = 'analytics' | 'certificates' | 'projects' | 'messages' | 'content';

export function AdminDashboardModal({ open, onClose, onDataChanged }: AdminDashboardModalProps) {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<AdminTab>('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Upload certificate form state
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certTitle, setCertTitle] = useState('');
  const [certOrg, setCertOrg] = useState('');
  const [certDate, setCertDate] = useState('');
  const [certYear, setCertYear] = useState('2026');
  const [certId, setCertId] = useState('');
  const [certCat, setCertCat] = useState<CertificateCategory>('Programming');
  const [certSkills, setCertSkills] = useState('');
  const [uploadingCert, setUploadingCert] = useState(false);

  // Add project form state
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Python & AI Security');
  const [projDesc, setProjDesc] = useState('');
  const [projTech, setProjTech] = useState('');
  const [projHighlights, setProjHighlights] = useState('');
  const [projGithub, setProjGithub] = useState('');

  // Add blog post form state
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('AI Security');
  const [postSummary, setPostSummary] = useState('');
  const [postContent, setPostContent] = useState('');

  // Profile edit state
  const [githubInput, setGithubInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [headlineInput, setHeadlineInput] = useState('');
  const [sgpaInput, setSgpaInput] = useState('');

  const loadAdminData = async () => {
    try {
      const [dash, certs, projs, msgs, posts, prof] = await Promise.all([
        apiFetch<AnalyticsDashboard>('/api/analytics/dashboard'),
        apiFetch<Certificate[]>('/api/certificates?all=1'),
        apiFetch<Project[]>('/api/projects?all=1'),
        apiFetch<ContactMessage[]>('/api/contact'),
        apiFetch<BlogPost[]>('/api/blog?all=1'),
        apiFetch<ProfileSettings>('/api/profile'),
      ]);
      setAnalytics(dash);
      setCertificates(certs);
      setProjects(projs);
      setMessages(msgs);
      setBlogPosts(posts);
      setProfile(prof);
      setGithubInput(prof.githubUrl);
      setLinkedinInput(prof.linkedinUrl);
      setHeadlineInput(prof.headline);
      setSgpaInput(prof.sgpa);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to load admin data.');
    }
  };

  useEffect(() => {
    if (!open) return;
    setAuthLoading(true);
    apiFetch<{ authenticated: boolean }>('/api/admin/me')
      .then((res) => {
        setAuthenticated(res.authenticated);
        if (res.authenticated) {
          void loadAdminData();
        }
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthLoading(false));
  }, [open]);

  if (!open) return null;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAuthenticated(true);
      setPassword('');
      await loadAdminData();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await apiFetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setAnalytics(null);
  };

  const handleUploadCert = async (e: FormEvent) => {
    e.preventDefault();
    if (!certFile || !certTitle.trim() || !certOrg.trim()) return;
    setUploadingCert(true);
    setFeedback(null);
    try {
      const formData = new FormData();
      formData.append('file', certFile);
      formData.append('title', certTitle);
      formData.append('recipientName', 'AJEY C');
      formData.append('issuingOrganization', certOrg);
      formData.append('issueDate', certDate || certYear);
      formData.append('issueYear', certYear);
      formData.append('certificateId', certId || 'Pending Verification');
      formData.append('category', certCat);
      formData.append('skills', certSkills);
      formData.append('approved', 'true');

      await apiFetch('/api/certificates/upload', { method: 'POST', body: formData });
      setCertFile(null);
      setCertTitle('');
      setCertOrg('');
      setCertDate('');
      setCertId('');
      setCertSkills('');
      setFeedback('Certificate uploaded successfully.');
      await loadAdminData();
      onDataChanged();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Certificate upload failed.');
    } finally {
      setUploadingCert(false);
    }
  };

  const toggleCertApproval = async (cert: Certificate) => {
    await apiFetch(`/api/certificates/${cert.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved: !cert.approved }),
    });
    await loadAdminData();
    onDataChanged();
  };

  const deleteCert = async (id: number) => {
    await apiFetch(`/api/certificates/${id}`, { method: 'DELETE' });
    await loadAdminData();
    onDataChanged();
  };

  const handleAddProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDesc.trim()) return;
    await apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        title: projTitle,
        category: projCategory,
        description: projDesc,
        technologies: projTech.split(',').map((s) => s.trim()).filter(Boolean),
        highlights: projHighlights.split(',').map((s) => s.trim()).filter(Boolean),
        githubUrl: projGithub,
        approved: true,
        featured: false,
      }),
    });
    setProjTitle('');
    setProjDesc('');
    setProjTech('');
    setProjHighlights('');
    setProjGithub('');
    setFeedback('Project added.');
    await loadAdminData();
    onDataChanged();
  };

  const toggleProjectApproval = async (proj: Project) => {
    await apiFetch(`/api/projects/${proj.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ approved: !proj.approved }),
    });
    await loadAdminData();
    onDataChanged();
  };

  const deleteProject = async (id: number) => {
    await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
    await loadAdminData();
    onDataChanged();
  };

  const markMessageRead = async (id: number, status: 'read' | 'archived') => {
    await apiFetch(`/api/contact/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    await loadAdminData();
  };

  const handleAddBlogPost = async (e: FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    await apiFetch('/api/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: postTitle,
        category: postCategory,
        summary: postSummary || postContent.slice(0, 120),
        content: postContent,
        approved: true,
      }),
    });
    setPostTitle('');
    setPostSummary('');
    setPostContent('');
    setFeedback('Research note published.');
    await loadAdminData();
    onDataChanged();
  };

  const deleteBlogPost = async (id: number) => {
    await apiFetch(`/api/blog/${id}`, { method: 'DELETE' });
    await loadAdminData();
    onDataChanged();
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    await apiFetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({
        githubUrl: githubInput,
        linkedinUrl: linkedinInput,
        headline: headlineInput,
        sgpa: sgpaInput,
      }),
    });
    setFeedback('Profile settings updated.');
    await loadAdminData();
    onDataChanged();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#11131A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#4788FF]" aria-hidden="true" />
            <div>
              <h2 id="admin-modal-title" className="font-display text-lg font-bold text-white">
                Admin Control Center
              </h2>
              <p className="text-xs text-[#A0A4B0]">
                Protected portfolio management &amp; analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authenticated && (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-[#08090D] px-3 text-xs font-medium text-[#A0A4B0] hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Control Center"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#08090D] text-[#A0A4B0] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {authLoading ? (
            <p className="py-12 text-center text-sm text-[#A0A4B0]">Verifying admin session...</p>
          ) : !authenticated ? (
            <form onSubmit={handleLogin} className="mx-auto max-w-sm space-y-4 py-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#08090D] text-[#4788FF]">
                <Lock className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Administrator Sign In</h3>
              <p className="text-xs text-[#A0A4B0]">
                Sign in with your configured server administrator credentials to manage certificates, projects,
                messages, and analytics.
              </p>

              <div>
                <label htmlFor="admin-username" className="block text-xs font-medium text-[#A0A4B0]">
                  Username
                </label>
                <input
                  id="admin-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#08090D] px-3.5 text-sm text-white focus:border-[#4788FF] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-medium text-[#A0A4B0]">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#08090D] px-3.5 text-sm text-white focus:border-[#4788FF] focus:outline-none"
                />
              </div>

              {loginError && (
                <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="h-11 w-full rounded-xl bg-[#4788FF] text-sm font-semibold text-white hover:bg-[#3A77EB] disabled:opacity-60"
              >
                {loggingIn ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-4">
                {(
                  [
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                    { id: 'certificates', label: `Certificates (${certificates.length})`, icon: ShieldCheck },
                    { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
                    { id: 'messages', label: `Messages (${messages.length})`, icon: Mail },
                    { id: 'content', label: 'Profile & Blog', icon: Settings },
                  ] as const
                ).map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                        tab === item.id
                          ? 'bg-[#4788FF] text-white'
                          : 'border border-white/10 bg-[#08090D] text-[#A0A4B0] hover:text-white'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
                  {feedback}
                </div>
              )}

              {/* Tab: Analytics */}
              {tab === 'analytics' && analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5">
                      <p className="text-xs text-[#A0A4B0]">Total Page Visits</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                        {analytics.totalVisits}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5">
                      <p className="text-xs text-[#A0A4B0]">Today&apos;s Visits</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-[#4788FF] tabular-nums">
                        {analytics.todayVisits}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5">
                      <p className="text-xs text-[#A0A4B0]">Unread Messages</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-[#9366FF] tabular-nums">
                        {messages.filter((m) => m.status === 'unread').length}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5">
                      <h3 className="text-sm font-semibold text-white">Popular Sections</h3>
                      <div className="mt-4 space-y-3">
                        {analytics.popularSections.length === 0 ? (
                          <p className="text-xs text-[#A0A4B0]">No section interactions recorded yet.</p>
                        ) : (
                          analytics.popularSections.map((s) => (
                            <div key={s.section} className="flex items-center justify-between text-xs">
                              <span className="capitalize text-white">{s.section}</span>
                              <span className="font-mono text-[#4788FF] tabular-nums">{s.count}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5">
                      <h3 className="text-sm font-semibold text-white">Project Popularity</h3>
                      <div className="mt-4 space-y-3">
                        {analytics.projectInteractions.length === 0 ? (
                          <p className="text-xs text-[#A0A4B0]">No project interactions recorded yet.</p>
                        ) : (
                          analytics.projectInteractions.map((p) => (
                            <div key={p.projectSlug} className="flex items-center justify-between text-xs">
                              <span className="text-white">{p.title}</span>
                              <span className="font-mono text-[#9366FF] tabular-nums">{p.count}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5">
                    <h3 className="text-sm font-semibold text-white">Recent Privacy-Conscious Activity</h3>
                    <div className="mt-3 divide-y divide-white/[0.06]">
                      {analytics.recentActivity.map((act) => (
                        <div key={act.id} className="flex items-center justify-between py-2 text-xs">
                          <span className="text-[#A0A4B0]">
                            <strong className="text-white">{act.eventType}</strong> · {act.target}
                          </span>
                          <span className="font-mono text-[#A0A4B0] tabular-nums">{act.createdAt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Certificates */}
              {tab === 'certificates' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleUploadCert}
                    className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5 space-y-4"
                  >
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Upload className="h-4 w-4 text-[#4788FF]" aria-hidden="true" />
                      <span>Upload Additional Certificate (PDF, PNG, JPG)</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        required
                        placeholder="Certificate Title"
                        value={certTitle}
                        onChange={(e) => setCertTitle(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Issuing Organization"
                        value={certOrg}
                        onChange={(e) => setCertOrg(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Issue Date (e.g. October 12, 2026)"
                        value={certDate}
                        onChange={(e) => setCertDate(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <input
                        type="number"
                        placeholder="Year"
                        value={certYear}
                        onChange={(e) => setCertYear(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Certificate ID"
                        value={certId}
                        onChange={(e) => setCertId(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <select
                        value={certCat}
                        onChange={(e) => setCertCat(e.target.value as CertificateCategory)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      >
                        {CERTIFICATE_CATEGORY_ORDER.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Skills (comma-separated)"
                        value={certSkills}
                        onChange={(e) => setCertSkills(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <input
                        type="file"
                        required
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 py-2 text-xs text-[#A0A4B0]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={uploadingCert}
                      className="rounded-lg bg-[#4788FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A77EB]"
                    >
                      {uploadingCert ? 'Uploading...' : 'Upload Certificate'}
                    </button>
                  </form>

                  <div className="space-y-3">
                    {certificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#08090D] p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{cert.title}</p>
                          <p className="mt-0.5 text-xs text-[#A0A4B0]">
                            {cert.issuingOrganization} · {cert.issueDate} · ID: {cert.certificateId}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void toggleCertApproval(cert)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                              cert.approved
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {cert.approved ? 'Public' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteCert(cert.id)}
                            aria-label={`Delete ${cert.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Projects */}
              {tab === 'projects' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleAddProject}
                    className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5 space-y-3"
                  >
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <Plus className="h-4 w-4 text-[#4788FF]" aria-hidden="true" />
                      <span>Add Project</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        required
                        placeholder="Project Title"
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Category"
                        value={projCategory}
                        onChange={(e) => setProjCategory(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Technologies (comma-separated)"
                        value={projTech}
                        onChange={(e) => setProjTech(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <input
                        type="url"
                        placeholder="GitHub Repository URL (optional)"
                        value={projGithub}
                        onChange={(e) => setProjGithub(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Highlights (comma-separated)"
                      value={projHighlights}
                      onChange={(e) => setProjHighlights(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder="Project Description"
                      value={projDesc}
                      onChange={(e) => setProjDesc(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#11131A] p-3 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-[#4788FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A77EB]"
                    >
                      Save Project
                    </button>
                  </form>

                  <div className="space-y-3">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#08090D] p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{proj.title}</p>
                          <p className="mt-0.5 text-xs text-[#A0A4B0]">
                            {proj.category} · {proj.technologies.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void toggleProjectApproval(proj)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                              proj.approved
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {proj.approved ? 'Approved' : 'Hidden'}
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteProject(proj.id)}
                            aria-label={`Delete ${proj.title}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Messages */}
              {tab === 'messages' && (
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <p className="py-8 text-center text-xs text-[#A0A4B0]">No contact messages received yet.</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="rounded-xl border border-white/[0.08] bg-[#08090D] p-4 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-white">{msg.subject}</p>
                            <p className="text-xs text-[#A0A4B0]">
                              From {msg.name} ({msg.email}) · {msg.createdAt}
                            </p>
                          </div>
                          {msg.status === 'unread' ? (
                            <button
                              type="button"
                              onClick={() => void markMessageRead(msg.id, 'read')}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#4788FF]/40 bg-[#4788FF]/15 px-3 py-1 text-xs text-[#4788FF]"
                            >
                              <Check className="h-3 w-3" />
                              <span>Mark Read</span>
                            </button>
                          ) : (
                            <span className="text-xs text-[#A0A4B0] capitalize">{msg.status}</span>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed text-[#E6E8EE]">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab: Profile & Blog */}
              {tab === 'content' && profile && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleSaveProfile}
                    className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5 space-y-3"
                  >
                    <h3 className="text-sm font-semibold text-white">Profile &amp; Editable Links</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-[#A0A4B0]">GitHub URL</label>
                        <input
                          type="url"
                          value={githubInput}
                          onChange={(e) => setGithubInput(e.target.value)}
                          placeholder="https://github.com/username"
                          className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#A0A4B0]">LinkedIn URL</label>
                        <input
                          type="url"
                          value={linkedinInput}
                          onChange={(e) => setLinkedinInput(e.target.value)}
                          placeholder="https://linkedin.com/in/username"
                          className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#A0A4B0]">Headline</label>
                        <input
                          type="text"
                          value={headlineInput}
                          onChange={(e) => setHeadlineInput(e.target.value)}
                          className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#A0A4B0]">SGPA</label>
                        <input
                          type="text"
                          value={sgpaInput}
                          onChange={(e) => setSgpaInput(e.target.value)}
                          className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#4788FF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3A77EB]"
                    >
                      Save Profile Settings
                    </button>
                  </form>

                  <form
                    onSubmit={handleAddBlogPost}
                    className="rounded-xl border border-white/[0.08] bg-[#08090D] p-5 space-y-3"
                  >
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                      <BookOpen className="h-4 w-4 text-[#9366FF]" aria-hidden="true" />
                      <span>Publish Security Research Note</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        required
                        placeholder="Note Title"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Category (e.g. AI Security)"
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="h-10 rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Short Summary"
                      value={postSummary}
                      onChange={(e) => setPostSummary(e.target.value)}
                      className="h-10 w-full rounded-lg border border-white/10 bg-[#11131A] px-3 text-xs text-white"
                    />
                    <textarea
                      required
                      rows={4}
                      placeholder="Research note content..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#11131A] p-3 text-xs text-white"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-[#9366FF] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                    >
                      Publish Note
                    </button>
                  </form>

                  <div className="space-y-2">
                    {blogPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#08090D] px-4 py-3"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white">{post.title}</p>
                          <p className="text-[11px] text-[#A0A4B0]">{post.category} · {post.publishedAt}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void deleteBlogPost(post.id)}
                          aria-label={`Delete ${post.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
