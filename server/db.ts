import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type {
  BlogPost,
  Certificate,
  CertificateCategory,
  ContactMessage,
  ProfileSettings,
  Project,
} from '../src/types/portfolio';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads', 'certificates');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'portfolio.db');
export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      headline TEXT NOT NULL,
      subheadline TEXT NOT NULL,
      location TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      university TEXT NOT NULL,
      degree TEXT NOT NULL,
      academic_status TEXT NOT NULL,
      expected_graduation TEXT NOT NULL,
      sgpa TEXT NOT NULL,
      career_objective TEXT NOT NULL,
      github_url TEXT NOT NULL DEFAULT '',
      linkedin_url TEXT NOT NULL DEFAULT '',
      photo_path TEXT NOT NULL,
      languages_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      description TEXT NOT NULL,
      highlights_json TEXT NOT NULL,
      technologies_json TEXT NOT NULL,
      image_url TEXT NOT NULL DEFAULT '',
      github_url TEXT NOT NULL DEFAULT '',
      live_url TEXT NOT NULL DEFAULT '',
      featured INTEGER NOT NULL DEFAULT 0,
      approved INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      issuing_organization TEXT NOT NULL,
      issue_date TEXT NOT NULL,
      issue_year INTEGER NOT NULL,
      certificate_id TEXT NOT NULL,
      verification_url TEXT NOT NULL DEFAULT '',
      verification_note TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      skills_json TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 1,
      needs_verification INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      published_at TEXT NOT NULL,
      read_time TEXT NOT NULL,
      approved INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      target TEXT NOT NULL,
      visit_date TEXT NOT NULL DEFAULT (date('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedInitialData();
}

function seedInitialData(): void {
  const existingProfile = db.prepare('SELECT id FROM profile_settings WHERE id = 1').get();
  if (!existingProfile) {
    db.prepare(`
      INSERT INTO profile_settings (
        id, name, headline, subheadline, location, email, phone,
        university, degree, academic_status, expected_graduation, sgpa,
        career_objective, github_url, linkedin_url, photo_path, languages_json
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `).run(
      'Ajey C',
      'Building Intelligent Systems. Exploring Secure AI.',
      'Computer Science Engineering student specializing in AI & ML, passionate about programming, artificial intelligence, and building secure digital experiences.',
      'Hosur, Tamil Nadu, India',
      'ajeychandrasekaran4@gmail.com',
      '+91 7339320177',
      'Jain University',
      'B.Tech Computer Science and Engineering (Artificial Intelligence and Machine Learning)',
      'Second-year undergraduate student',
      '2029',
      '8.78',
      'I am a Computer Science engineering student specializing in Artificial Intelligence and Machine Learning, with a foundation in Python, Java, SQL, and programming fundamentals. I am interested in AI security, software development, and building secure, reliable, and trustworthy intelligent systems. My goal is to continuously develop my technical skills and build practical solutions that solve real-world problems.',
      '',
      '',
      '/assets/aistudio/WhatsApp_Image_2026-11-13_at_3.07.11_PM_65f287e1.jpeg',
      JSON.stringify(['Tamil', 'English', 'Telugu', 'Kannada'])
    );
  }

  const projectCount = (db.prepare('SELECT COUNT(*) as c FROM projects').get() as { c: number }).c;
  if (projectCount === 0) {
    db.prepare(`
      INSERT INTO projects (
        slug, title, category, summary, description,
        highlights_json, technologies_json, image_url, github_url, live_url,
        featured, approved, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'jarvis-voice-assistant',
      'JARVIS — Voice Assistant',
      'Python & Automation',
      'Python-based voice assistant with spoken command processing and external API integration.',
      'Developed a Python-based voice assistant capable of listening to spoken commands and responding to users. Integrated external APIs through API calls to fetch information and perform tasks.',
      JSON.stringify([
        'Voice command interaction',
        'Spoken command processing',
        'API integration',
        'Information retrieval',
      ]),
      JSON.stringify(['Python', 'Speech Recognition', 'REST APIs', 'Task Automation']),
      '/src/assets/images/jarvis_voice_assistant_1794563508136.jpg',
      '',
      '',
      1,
      1,
      1
    );
  }

  const certCount = (db.prepare('SELECT COUNT(*) as c FROM certificates').get() as { c: number }).c;
  if (certCount === 0) {
    const insertCert = db.prepare(`
      INSERT INTO certificates (
        title, recipient_name, issuing_organization, issue_date, issue_year,
        certificate_id, verification_url, verification_note, category,
        skills_json, file_path, file_type, approved, needs_verification
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCert.run(
      'SQL Course',
      'AJEY C',
      'Intellipaat',
      'December 30, 2025',
      2025,
      '31679-913167-314664',
      '',
      'Certificate ID 31679-913167-314664 printed on document; no external verification URL printed on file.',
      'Database Management',
      JSON.stringify(['SQL', 'Relational Databases', 'Querying']),
      '/assets/aistudio/intellipaat-certificate__3__3a23faa5.pdf',
      'pdf',
      1,
      0
    );

    insertCert.run(
      'Python Certification Course',
      'AJEY C',
      'Intellipaat',
      'May 9, 2026',
      2026,
      '31679-912380-314664',
      '',
      'Certificate ID 31679-912380-314664 printed on document; no external verification URL printed on file.',
      'Programming',
      JSON.stringify(['Python', 'Programming Fundamentals', 'Scripting']),
      '/assets/aistudio/intellipaat-certificate__2__6df9d5f1.pdf',
      'pdf',
      1,
      0
    );

    insertCert.run(
      'Professional Certification Program in Computer Science Engineering – iHub, IIT Roorkee',
      'AJEY C',
      'Intellipaat · iHub, IIT Roorkee',
      'September 18, 2026',
      2026,
      '31679-1085116-314664',
      '',
      'Certificate ID 31679-1085116-314664 printed on document; no external verification URL printed on file.',
      'Professional Certifications',
      JSON.stringify(['Computer Science Engineering', 'Software Foundations', 'Problem Solving']),
      '/assets/aistudio/intellipaat-certificate__1__799ca59b.pdf',
      'pdf',
      1,
      0
    );
  }

  const blogCount = (db.prepare('SELECT COUNT(*) as c FROM blog_posts').get() as { c: number }).c;
  if (blogCount === 0) {
    const insertPost = db.prepare(`
      INSERT INTO blog_posts (
        slug, title, category, summary, content, published_at, read_time, approved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPost.run(
      'securing-python-voice-assistants',
      'Input Validation Boundaries in Python Voice Assistants',
      'AI Security',
      'Architectural lessons from building JARVIS: separating spoken intent parsing from external API execution.',
      `When building a Python voice assistant like JARVIS, speech-to-text transcripts should never be treated as trusted system instructions.\n\n1. Intent Allow-Listing\nInstead of passing raw recognized text directly into shell or system evaluators, map transcripts into a strict dictionary of explicit intents. Each command route validates required arguments before calling external APIs.\n\n2. API Response Sanitization\nExternal API payloads are untrusted input. Schema validation ensures unexpected response shapes fail safely without crashing the speech synthesis loop.\n\n3. Least-Privilege Execution\nSeparating conversational parsing from privileged OS operations creates a clear security boundary—an essential habit for building trustworthy AI tools.`,
      'October 2026',
      '4 min read',
      1
    );

    insertPost.run(
      'parameterized-sql-defense',
      'Defensive Query Design: Parameterized SQL from Day One',
      'Database Security',
      'Notes from applying SQL fundamentals to prevent injection vulnerabilities in full-stack backends.',
      `Learning SQL goes beyond writing SELECT and JOIN queries—secure data layers depend on strict separation between query structure and user-supplied values.\n\n1. Prepared Statements Everywhere\nWhether using SQLite in Python or MySQL in web applications, binding parameters via placeholders ensures user input is always interpreted as data, never executable SQL tokens.\n\n2. Schema Constraints as Guardrails\nDefining NOT NULL, CHECK constraints, and explicit types at the database layer prevents malformed records even when upstream validation is bypassed.\n\n3. Minimal Surface Exposure\nReturning only public fields from queries keeps internal records and moderation flags decoupled from public API responses.`,
      'September 2026',
      '3 min read',
      1
    );

    insertPost.run(
      'grounded-ai-assistants',
      'Why Trustworthy AI Assistants Need Grounded Knowledge Boundaries',
      'AI Engineering',
      'Designing portfolio assistants that stick strictly to verified facts with deterministic fallbacks.',
      `One of the biggest reliability risks in modern LLM integrations is fabrication—a model inventing credentials, metrics, or dates when a prompt is ambiguous.\n\n1. Grounded Context Injection\nBy supplying the assistant with a structured snapshot of verified education, projects, and certificate IDs, responses stay anchored to real records.\n\n2. Deterministic Fallback Engines\nAn AI assistant should remain functional even without an external LLM key. Pairing keyword-matched FAQ routing with grounded context ensures predictable behavior in offline or key-restricted environments.\n\n3. Explicit Uncertainty\nWhen requested details are absent from the verified profile, the safest response is to state what is unknown rather than guessing.`,
      'November 2026',
      '4 min read',
      1
    );
  }
}

export function getProfile(): ProfileSettings {
  const row = db.prepare('SELECT * FROM profile_settings WHERE id = 1').get() as Record<string, unknown>;
  return {
    name: String(row.name),
    headline: String(row.headline),
    subheadline: String(row.subheadline),
    location: String(row.location),
    email: String(row.email),
    phone: String(row.phone),
    university: String(row.university),
    degree: String(row.degree),
    academicStatus: String(row.academic_status),
    expectedGraduation: String(row.expected_graduation),
    sgpa: String(row.sgpa),
    careerObjective: String(row.career_objective),
    githubUrl: String(row.github_url || ''),
    linkedinUrl: String(row.linkedin_url || ''),
    photoPath: String(row.photo_path),
    languages: JSON.parse(String(row.languages_json || '[]')) as string[],
  };
}

export function mapProjectRow(row: Record<string, unknown>): Project {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    category: String(row.category),
    summary: String(row.summary),
    description: String(row.description),
    highlights: JSON.parse(String(row.highlights_json || '[]')) as string[],
    technologies: JSON.parse(String(row.technologies_json || '[]')) as string[],
    imageUrl: String(row.image_url || ''),
    githubUrl: String(row.github_url || ''),
    liveUrl: String(row.live_url || ''),
    featured: Boolean(row.featured),
    approved: Boolean(row.approved),
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
  };
}

export function getProjects(includeUnapproved = false): Project[] {
  const sql = includeUnapproved
    ? 'SELECT * FROM projects ORDER BY sort_order ASC, id DESC'
    : 'SELECT * FROM projects WHERE approved = 1 ORDER BY sort_order ASC, id DESC';
  const rows = db.prepare(sql).all() as Record<string, unknown>[];
  return rows.map(mapProjectRow);
}

export function mapCertificateRow(row: Record<string, unknown>): Certificate {
  return {
    id: Number(row.id),
    title: String(row.title),
    recipientName: String(row.recipient_name),
    issuingOrganization: String(row.issuing_organization),
    issueDate: String(row.issue_date),
    issueYear: Number(row.issue_year),
    certificateId: String(row.certificate_id),
    verificationUrl: String(row.verification_url || ''),
    verificationNote: String(row.verification_note || ''),
    category: String(row.category) as CertificateCategory,
    skills: JSON.parse(String(row.skills_json || '[]')) as string[],
    filePath: String(row.file_path),
    fileType: String(row.file_type) as Certificate['fileType'],
    approved: Boolean(row.approved),
    needsVerification: Boolean(row.needs_verification),
    createdAt: String(row.created_at),
  };
}

export function getCertificates(includeUnapproved = false): Certificate[] {
  const sql = includeUnapproved
    ? 'SELECT * FROM certificates ORDER BY issue_year DESC, id ASC'
    : 'SELECT * FROM certificates WHERE approved = 1 ORDER BY issue_year DESC, id ASC';
  const rows = db.prepare(sql).all() as Record<string, unknown>[];
  return rows.map(mapCertificateRow);
}

export function mapBlogPostRow(row: Record<string, unknown>): BlogPost {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    title: String(row.title),
    category: String(row.category),
    summary: String(row.summary),
    content: String(row.content),
    publishedAt: String(row.published_at),
    readTime: String(row.read_time),
    approved: Boolean(row.approved),
  };
}

export function getBlogPosts(includeUnapproved = false): BlogPost[] {
  const sql = includeUnapproved
    ? 'SELECT * FROM blog_posts ORDER BY id DESC'
    : 'SELECT * FROM blog_posts WHERE approved = 1 ORDER BY id DESC';
  const rows = db.prepare(sql).all() as Record<string, unknown>[];
  return rows.map(mapBlogPostRow);
}

export function getContactMessages(): ContactMessage[] {
  const rows = db.prepare('SELECT * FROM contact_messages ORDER BY id DESC').all() as Record<string, unknown>[];
  return rows.map((row) => ({
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    subject: String(row.subject),
    message: String(row.message),
    status: String(row.status) as ContactMessage['status'],
    createdAt: String(row.created_at),
  }));
}
