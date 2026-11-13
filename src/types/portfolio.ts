export interface ProfileSettings {
  name: string;
  headline: string;
  subheadline: string;
  location: string;
  email: string;
  phone: string;
  university: string;
  degree: string;
  academicStatus: string;
  expectedGraduation: string;
  sgpa: string;
  careerObjective: string;
  githubUrl: string;
  linkedinUrl: string;
  photoPath: string;
  languages: string[];
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  highlights: string[];
  technologies: string[];
  imageUrl: string;
  githubUrl: string;
  liveUrl?: string;
  featured: boolean;
  approved: boolean;
  sortOrder: number;
  createdAt: string;
}

export type CertificateCategory =
  | 'Programming'
  | 'Artificial Intelligence'
  | 'Database Management'
  | 'Full Stack Development'
  | 'Professional Certifications'
  | 'Other';

export interface Certificate {
  id: number;
  title: string;
  recipientName: string;
  issuingOrganization: string;
  issueDate: string;
  issueYear: number;
  certificateId: string;
  verificationUrl: string;
  verificationNote: string;
  category: CertificateCategory;
  skills: string[];
  filePath: string;
  fileType: 'pdf' | 'png' | 'jpg' | 'jpeg';
  approved: boolean;
  needsVerification: boolean;
  createdAt: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  publishedAt: string;
  readTime: string;
  approved: boolean;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // honeypot field
}

export interface ContactMessage extends ContactSubmission {
  id: number;
  createdAt: string;
  status: 'unread' | 'read' | 'archived';
}

export interface AnalyticsDashboard {
  totalVisits: number;
  todayVisits: number;
  dailyVisits: Array<{ date: string; count: number }>;
  popularSections: Array<{ section: string; count: number }>;
  projectInteractions: Array<{ projectSlug: string; title: string; count: number }>;
  recentActivity: Array<{
    id: number;
    eventType: string;
    target: string;
    createdAt: string;
  }>;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
  source?: 'gemini' | 'knowledge_base';
}
