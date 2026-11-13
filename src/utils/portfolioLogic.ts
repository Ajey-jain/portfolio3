import type { Certificate, CertificateCategory, ContactSubmission, ProfileSettings, Project, BlogPost } from '../types/portfolio';

export const CERTIFICATE_CATEGORY_ORDER: CertificateCategory[] = [
  'Programming',
  'Artificial Intelligence',
  'Database Management',
  'Full Stack Development',
  'Professional Certifications',
  'Other',
];

export function getRelevantCertificateCategories(certificates: Certificate[]): CertificateCategory[] {
  const approved = certificates.filter((cert) => cert.approved);
  const present = new Set(approved.map((cert) => cert.category));
  return CERTIFICATE_CATEGORY_ORDER.filter((cat) => present.has(cat));
}

export function filterCertificates(
  certificates: Certificate[],
  category: 'All' | CertificateCategory,
  searchQuery: string,
  includeUnapproved = false
): Certificate[] {
  const query = searchQuery.trim().toLowerCase();
  return certificates
    .filter((cert) => (includeUnapproved ? true : cert.approved))
    .filter((cert) => (category === 'All' ? true : cert.category === category))
    .filter((cert) => {
      if (!query) return true;
      const haystack = [
        cert.title,
        cert.issuingOrganization,
        cert.certificateId,
        cert.issueDate,
        String(cert.issueYear),
        cert.category,
        ...cert.skills,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => b.issueYear - a.issueYear || a.id - b.id);
}

export interface ContactValidationResult {
  valid: boolean;
  isSpam: boolean;
  errors: Partial<Record<'name' | 'email' | 'subject' | 'message', string>>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContactInput(input: ContactSubmission): ContactValidationResult {
  if (input.website && input.website.trim().length > 0) {
    return { valid: false, isSpam: true, errors: {} };
  }

  const errors: ContactValidationResult['errors'] = {};
  const name = (input.name || '').trim();
  const email = (input.email || '').trim();
  const subject = (input.subject || '').trim();
  const message = (input.message || '').trim();

  if (name.length < 2 || name.length > 100) {
    errors.name = 'Please enter your name (2–100 characters).';
  }
  if (!EMAIL_REGEX.test(email) || email.length > 160) {
    errors.email = 'Please provide a valid email address.';
  }
  if (subject.length < 3 || subject.length > 150) {
    errors.subject = 'Please enter a subject (3–150 characters).';
  }
  if (message.length < 10 || message.length > 3000) {
    errors.message = 'Message must be between 10 and 3000 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    isSpam: false,
    errors,
  };
}

export function sanitizeExternalUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed.toLowerCase().startsWith('placeholder')) {
    return null;
  }
  if (trimmed.startsWith('/')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export interface KnowledgeBaseContext {
  profile: ProfileSettings;
  projects: Project[];
  certificates: Certificate[];
  blogPosts: BlogPost[];
}

export function answerPortfolioQuestion(rawQuestion: string, ctx: KnowledgeBaseContext): string {
  const q = rawQuestion.trim().toLowerCase();
  if (!q) {
    return `Ask me anything about ${ctx.profile.name}'s education, technical skills, JARVIS Voice Assistant project, verified certificates, or AI security focus.`;
  }

  const approvedProjects = ctx.projects.filter((p) => p.approved);
  const approvedCerts = ctx.certificates.filter((c) => c.approved);

  if (/(cgpa|sgpa|gpa|grade|marks|score|percentage|10th|12th|school|academic|education|jain|nalanda|graduat|degree|year)/.test(q)) {
    return [
      `${ctx.profile.name} is a ${ctx.profile.academicStatus} pursuing ${ctx.profile.degree} at ${ctx.profile.university} (Expected Graduation: ${ctx.profile.expectedGraduation}), holding an ${ctx.profile.sgpa} SGPA (Semester Grade Point Average — not CGPA).`,
      `Earlier schooling at Nalanda International Public School: Class XII (CBSE, 2025) with 80.8% and Class X (CBSE, 2023) with 77.8%.`,
    ].join('\n\n');
  }

  if (/(project|jarvis|voice|built|build|github|repo)/.test(q)) {
    if (approvedProjects.length === 0) {
      return `${ctx.profile.name} is currently preparing new project documentation.`;
    }
    const lines = approvedProjects.map(
      (p) => `• ${p.title} (${p.technologies.join(', ')}): ${p.description} Key capabilities: ${p.highlights.join(', ')}.`
    );
    return `Here are ${ctx.profile.name}'s featured projects:\n\n${lines.join('\n')}`;
  }

  if (/(certif|credential|intellipaat|roorkee|iit|sql course|python cert)/.test(q)) {
    if (approvedCerts.length === 0) {
      return `No public certificates are currently listed.`;
    }
    const list = approvedCerts
      .map(
        (c) =>
          `• ${c.title} — ${c.issuingOrganization} (${c.issueDate}, ID: ${c.certificateId})`
      )
      .join('\n');
    return `${ctx.profile.name} holds ${approvedCerts.length} verified certificates:\n\n${list}\n\nYou can view and download each original PDF in the Certificates section.`;
  }

  if (/(skill|stack|tech|python|java|c\+\+|mysql|sql|javascript|web)/.test(q)) {
    return `${ctx.profile.name}'s core technical toolkit includes:\n• Programming: Python, Java, C, C++, JavaScript\n• Database: MySQL\n• Web Development: Full Stack Web Development (In Progress)\n\nHe is actively strengthening his software engineering fundamentals and exploring AI security.`;
  }

  if (/(career|interest|security|goal|objective|ai security|aspire|research|blog)/.test(q)) {
    return `${ctx.profile.careerObjective}\n\nHe also documents his AI security research and development notes in the Research Notes section of this portfolio.`;
  }

  if (/(language|speak|tamil|telugu|kannada|english)/.test(q)) {
    return `${ctx.profile.name} is multilingual and speaks ${ctx.profile.languages.join(', ')}.`;
  }

  if (/(contact|email|phone|reach|hire|intern|location|hosur|connect)/.test(q)) {
    return `You can reach ${ctx.profile.name} (based in ${ctx.profile.location}) at ${ctx.profile.email} or ${ctx.profile.phone}, or use the Contact form at the bottom of the page. He is currently open to learning opportunities and software/AI security internships.`;
  }

  if (/(who is|about|introduce|ajey|hello|hi|hey)/.test(q)) {
    return `${ctx.profile.name} is an aspiring AI Security Engineer and ${ctx.profile.academicStatus} in ${ctx.profile.degree} at ${ctx.profile.university} (8.78 SGPA, expected graduation ${ctx.profile.expectedGraduation}). Based in ${ctx.profile.location}, he builds Python applications like the JARVIS Voice Assistant, holds ${approvedCerts.length} verified certifications (Intellipaat & iHub IIT Roorkee), and explores building trustworthy, secure intelligent systems.`;
  }

  return `I can answer verified questions about ${ctx.profile.name}'s profile — try asking about his education (8.78 SGPA at Jain University), technical skills, the JARVIS Voice Assistant project, his ${approvedCerts.length} certificates, spoken languages, or how to contact him.`;
}
