import { useCallback, useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { AskAjeyWidget } from './components/AskAjeyWidget';
import { BlogSection } from './components/BlogSection';
import { CertificatesSection } from './components/CertificatesSection';
import { ContactSection } from './components/ContactSection';
import { EducationSection } from './components/EducationSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ProjectsSection } from './components/ProjectsSection';
import { SkillsSection } from './components/SkillsSection';
import type { BlogPost, Certificate, ProfileSettings, Project } from './types/portfolio';
import { apiFetch } from './utils/api';

const DEFAULT_PROFILE: ProfileSettings = {
  name: 'Ajey C',
  headline: 'Building Intelligent Systems. Exploring Secure AI.',
  subheadline:
    'Computer Science Engineering student specializing in AI & ML, passionate about programming, artificial intelligence, and building secure digital experiences.',
  location: 'Hosur, Tamil Nadu, India',
  email: 'ajeychandrasekaran4@gmail.com',
  phone: '+91 7339320177',
  university: 'Jain University',
  degree: 'B.Tech Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
  academicStatus: 'Second-year undergraduate student',
  expectedGraduation: '2029',
  sgpa: '8.78',
  careerObjective:
    'I am a Computer Science engineering student specializing in Artificial Intelligence and Machine Learning, with a foundation in Python, Java, SQL, and programming fundamentals. I am interested in AI security, software development, and building secure, reliable, and trustworthy intelligent systems. My goal is to continuously develop my technical skills and build practical solutions that solve real-world problems.',
  githubUrl: '',
  linkedinUrl: '',
  photoPath: '/assets/aistudio/WhatsApp_Image_2026-11-13_at_3.07.11_PM_65f287e1.jpeg',
  languages: ['Tamil', 'English', 'Telugu', 'Kannada'],
};

export default function App() {
  const [profile, setProfile] = useState<ProfileSettings>(DEFAULT_PROFILE);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadPublicData = useCallback(async () => {
    try {
      setApiError(null);
      const [prof, projs, certs, posts] = await Promise.all([
        apiFetch<ProfileSettings>('/api/profile'),
        apiFetch<Project[]>('/api/projects'),
        apiFetch<Certificate[]>('/api/certificates'),
        apiFetch<BlogPost[]>('/api/blog'),
      ]);
      setProfile(prof);
      setProjects(projs);
      setCertificates(certs);
      setBlogPosts(posts);
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
      setApiError('Unable to sync live portfolio data from the backend API.');
    }
  }, []);

  const trackEvent = useCallback((eventType: string, target: string) => {
    void apiFetch('/api/analytics/visit', {
      method: 'POST',
      body: JSON.stringify({ eventType, target }),
    }).catch(() => {
      // Analytics tracking is non-blocking
    });
  }, []);

  useEffect(() => {
    void loadPublicData();
    trackEvent('page_visit', 'home');

    if (window.location.hash === '#admin' || new URLSearchParams(window.location.search).get('admin') === '1') {
      setAdminOpen(true);
    }
  }, [loadPublicData, trackEvent]);

  const scrollToSection = (id: string) => {
    trackEvent('section_view', id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-white">
      <Navbar onNavigateSection={(id) => trackEvent('section_view', id)} />

      {apiError && (
        <div
          role="alert"
          className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-center text-xs text-amber-200"
        >
          <span>{apiError} </span>
          <button
            type="button"
            onClick={() => void loadPublicData()}
            className="ml-2 underline hover:text-white cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <main>
        <HeroSection
          profile={profile}
          certificateCount={certificates.length}
          onExploreWork={() => scrollToSection('projects')}
          onConnect={() => scrollToSection('contact')}
        />

        <AboutSection profile={profile} />

        <SkillsSection />

        <ProjectsSection
          projects={projects}
          onProjectInteract={(slug) => trackEvent('project_interaction', slug)}
          onOpenAdmin={() => setAdminOpen(true)}
        />

        <CertificatesSection
          certificates={certificates}
          onCertificateView={(certId) => trackEvent('certificate_view', String(certId))}
        />

        <EducationSection profile={profile} />

        <BlogSection posts={blogPosts} />

        <ContactSection profile={profile} onOpenAdmin={() => setAdminOpen(true)} />
      </main>

      <Footer profile={profile} onOpenAdmin={() => setAdminOpen(true)} />

      <AskAjeyWidget />

      <AdminDashboardModal
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        onDataChanged={() => void loadPublicData()}
      />
    </div>
  );
}
