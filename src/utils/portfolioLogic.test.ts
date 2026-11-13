import test from 'node:test';
import assert from 'node:assert/strict';
import { apiUrl } from './api';
import {
  answerPortfolioQuestion,
  filterCertificates,
  getRelevantCertificateCategories,
  sanitizeExternalUrl,
  validateContactInput,
  type KnowledgeBaseContext,
} from './portfolioLogic';
import type { Certificate } from '../types/portfolio';

const sampleCertificates: Certificate[] = [
  {
    id: 1,
    title: 'SQL Course',
    recipientName: 'AJEY C',
    issuingOrganization: 'Intellipaat',
    issueDate: 'December 30, 2025',
    issueYear: 2025,
    certificateId: '31679-913167-314664',
    verificationUrl: '',
    verificationNote: 'Verify via Certificate ID 31679-913167-314664',
    category: 'Database Management',
    skills: ['SQL', 'MySQL'],
    filePath: '/assets/aistudio/intellipaat-certificate__3__3a23faa5.pdf',
    fileType: 'pdf',
    approved: true,
    needsVerification: false,
    createdAt: '2026-01-01',
  },
  {
    id: 2,
    title: 'Python Certification Course',
    recipientName: 'AJEY C',
    issuingOrganization: 'Intellipaat',
    issueDate: 'May 9, 2026',
    issueYear: 2026,
    certificateId: '31679-912380-314664',
    verificationUrl: '',
    verificationNote: 'Verify via Certificate ID 31679-912380-314664',
    category: 'Programming',
    skills: ['Python'],
    filePath: '/assets/aistudio/intellipaat-certificate__2__6df9d5f1.pdf',
    fileType: 'pdf',
    approved: true,
    needsVerification: false,
    createdAt: '2026-05-10',
  },
  {
    id: 3,
    title: 'Professional Certification Program in Computer Science Engineering – iHub, IIT Roorkee',
    recipientName: 'AJEY C',
    issuingOrganization: 'Intellipaat · iHub, IIT Roorkee',
    issueDate: 'September 18, 2026',
    issueYear: 2026,
    certificateId: '31679-1085116-314664',
    verificationUrl: '',
    verificationNote: 'Verify via Certificate ID 31679-1085116-314664',
    category: 'Professional Certifications',
    skills: ['Computer Science Engineering'],
    filePath: '/assets/aistudio/intellipaat-certificate__1__799ca59b.pdf',
    fileType: 'pdf',
    approved: true,
    needsVerification: false,
    createdAt: '2026-09-19',
  },
  {
    id: 4,
    title: 'Draft Unapproved Cert',
    recipientName: 'AJEY C',
    issuingOrganization: 'Test Org',
    issueDate: 'January 1, 2026',
    issueYear: 2026,
    certificateId: '000',
    verificationUrl: '',
    verificationNote: '',
    category: 'Artificial Intelligence',
    skills: ['AI'],
    filePath: '/assets/aistudio/draft.pdf',
    fileType: 'pdf',
    approved: false,
    needsVerification: true,
    createdAt: '2026-01-01',
  },
];

const kbContext: KnowledgeBaseContext = {
  profile: {
    name: 'Ajey C',
    headline: 'Building Intelligent Systems. Exploring Secure AI.',
    subheadline: 'Computer Science Engineering student specializing in AI & ML.',
    location: 'Hosur, Tamil Nadu, India',
    email: 'ajeychandrasekaran4@gmail.com',
    phone: '+91 7339320177',
    university: 'Jain University',
    degree: 'B.Tech Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
    academicStatus: 'Second-year undergraduate student',
    expectedGraduation: '2029',
    sgpa: '8.78',
    careerObjective: 'Interested in AI security, software development, and building trustworthy intelligent systems.',
    githubUrl: '',
    linkedinUrl: '',
    photoPath: '/assets/aistudio/WhatsApp_Image_2026-11-13_at_3.07.11_PM_65f287e1.jpeg',
    languages: ['Tamil', 'English', 'Telugu', 'Kannada'],
  },
  projects: [
    {
      id: 1,
      slug: 'jarvis-voice-assistant',
      title: 'JARVIS — Voice Assistant',
      category: 'Python & APIs',
      summary: 'Python voice assistant with external API integration.',
      description: 'Developed a Python-based voice assistant capable of listening to spoken commands and responding to users.',
      highlights: ['Voice command interaction', 'API integration'],
      technologies: ['Python', 'Speech Recognition', 'REST APIs'],
      imageUrl: '/src/assets/images/jarvis.jpg',
      githubUrl: '',
      featured: true,
      approved: true,
      sortOrder: 1,
      createdAt: '2026-05-01',
    },
  ],
  certificates: sampleCertificates,
  blogPosts: [],
};

test('getRelevantCertificateCategories omits empty and unapproved categories', () => {
  const categories = getRelevantCertificateCategories(sampleCertificates);
  assert.deepEqual(categories, [
    'Programming',
    'Database Management',
    'Professional Certifications',
  ]);
});

test('filterCertificates filters by category, search query, and approval status', () => {
  const allApproved = filterCertificates(sampleCertificates, 'All', '');
  assert.equal(allApproved.length, 3);

  const dbOnly = filterCertificates(sampleCertificates, 'Database Management', '');
  assert.equal(dbOnly.length, 1);
  assert.equal(dbOnly[0].title, 'SQL Course');

  const searchRoorkee = filterCertificates(sampleCertificates, 'All', 'Roorkee');
  assert.equal(searchRoorkee.length, 1);
  assert.equal(searchRoorkee[0].certificateId, '31679-1085116-314664');
});

test('validateContactInput validates fields and rejects honeypot spam', () => {
  const validResult = validateContactInput({
    name: 'Recruiter One',
    email: 'recruiter@example.com',
    subject: 'Internship Inquiry',
    message: 'Hello Ajey, we would love to discuss an AI security internship.',
  });
  assert.equal(validResult.valid, true);
  assert.equal(validResult.isSpam, false);

  const invalidResult = validateContactInput({
    name: 'A',
    email: 'bad-email',
    subject: 'Hi',
    message: 'short',
  });
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.name);
  assert.ok(invalidResult.errors.email);
  assert.ok(invalidResult.errors.subject);
  assert.ok(invalidResult.errors.message);

  const spamResult = validateContactInput({
    name: 'Bot',
    email: 'bot@example.com',
    subject: 'Promo',
    message: 'Buy something right now from our link.',
    website: 'http://spam.example.com',
  });
  assert.equal(spamResult.valid, false);
  assert.equal(spamResult.isSpam, true);
});

test('answerPortfolioQuestion accurately reports 8.78 SGPA (not CGPA) and verified projects/certs', () => {
  const eduAnswer = answerPortfolioQuestion('What is his CGPA and university?', kbContext);
  assert.match(eduAnswer, /8\.78 SGPA/);
  assert.match(eduAnswer, /Jain University/);

  const projAnswer = answerPortfolioQuestion('What projects has Ajey built?', kbContext);
  assert.match(projAnswer, /JARVIS/);

  const certAnswer = answerPortfolioQuestion('List his certificates', kbContext);
  assert.match(certAnswer, /3 verified certificates/);
  assert.match(certAnswer, /IIT Roorkee/);
});

test('sanitizeExternalUrl blocks unsafe schemes and placeholders', () => {
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeExternalUrl('placeholder'), null);
  assert.equal(sanitizeExternalUrl('https://github.com/ajeyc'), 'https://github.com/ajeyc');
  assert.equal(sanitizeExternalUrl('/assets/aistudio/file.pdf'), '/assets/aistudio/file.pdf');
});

test('apiUrl resolves relative /api routes without hardcoded localhost and preserves full URLs', () => {
  assert.equal(apiUrl('/api/health'), '/api/health');
  assert.equal(apiUrl('api/profile'), '/api/profile');
  assert.equal(apiUrl('https://example.com/api/health'), 'https://example.com/api/health');
});
