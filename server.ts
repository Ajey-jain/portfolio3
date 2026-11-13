import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  db,
  getBlogPosts,
  getCertificates,
  getContactMessages,
  getProfile,
  getProjects,
  initDatabase,
  mapCertificateRow,
} from './server/db';
import { buildResumePdfBuffer } from './server/resumePdf';
import { answerPortfolioQuestion, validateContactInput } from './src/utils/portfolioLogic';
import type { CertificateCategory } from './src/types/portfolio';

initDatabase();

const PORT = Number(process.env.PORT || 3000);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'ajey_admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AjeyPortfolio#2026';
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  crypto.createHash('sha256').update(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}:ac-portfolio-secret`).digest('hex');

const COOKIE_NAME = 'ac_admin_session';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'public', 'uploads', 'certificates');
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 48);
    cb(null, `${Date.now()}_${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.png', '.jpg', '.jpeg'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, PNG, and JPG certificate files are supported.'));
    }
  },
});

function hashDigest(value: string): Buffer {
  return crypto.createHash('sha256').update(value).digest();
}

function safeEqual(a: string, b: string): boolean {
  return crypto.timingSafeEqual(hashDigest(a), hashDigest(b));
}

function signSessionToken(username: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 12; // 12 hours
  const payload = Buffer.from(JSON.stringify({ sub: username, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined): { sub: string; exp: number } | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  if (!safeEqual(sig, expectedSig)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      sub: string;
      exp: number;
    };
    if (typeof decoded.exp !== 'number' || decoded.exp < Date.now()) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie || '';
  const result: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const key = part.slice(0, idx).trim();
      const val = decodeURIComponent(part.slice(idx + 1).trim());
      result[key] = val;
    }
  }
  return result;
}

function isAdminAuthenticated(req: Request): boolean {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[COOKIE_NAME]) !== null;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }
  next();
}

// Simple privacy-conscious in-memory rate limiter for contact submissions (no IP persisted in DB)
const contactRateMap = new Map<string, number[]>();
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const hits = (contactRateMap.get(key) || []).filter((ts) => now - ts < windowMs);
  if (hits.length >= 6) {
    contactRateMap.set(key, hits);
    return true;
  }
  hits.push(now);
  contactRateMap.set(key, hits);
  return false;
}

function getGeminiClient(): GoogleGenAI | null {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  if (!key || key === 'MY_GEMINI_API_KEY') return null;
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));

  // --- Public Profile ---
  app.get('/api/profile', (_req, res) => {
    res.json(getProfile());
  });

  app.put('/api/profile', requireAdmin, (req, res) => {
    const current = getProfile();
    const body = req.body as Partial<typeof current>;
    const updated = {
      headline: typeof body.headline === 'string' ? body.headline.trim() : current.headline,
      subheadline: typeof body.subheadline === 'string' ? body.subheadline.trim() : current.subheadline,
      careerObjective: typeof body.careerObjective === 'string' ? body.careerObjective.trim() : current.careerObjective,
      githubUrl: typeof body.githubUrl === 'string' ? body.githubUrl.trim() : current.githubUrl,
      linkedinUrl: typeof body.linkedinUrl === 'string' ? body.linkedinUrl.trim() : current.linkedinUrl,
      sgpa: typeof body.sgpa === 'string' ? body.sgpa.trim() : current.sgpa,
      academicStatus: typeof body.academicStatus === 'string' ? body.academicStatus.trim() : current.academicStatus,
    };

    db.prepare(`
      UPDATE profile_settings
      SET headline = ?, subheadline = ?, career_objective = ?, github_url = ?, linkedin_url = ?, sgpa = ?, academic_status = ?
      WHERE id = 1
    `).run(
      updated.headline,
      updated.subheadline,
      updated.careerObjective,
      updated.githubUrl,
      updated.linkedinUrl,
      updated.sgpa,
      updated.academicStatus
    );

    res.json(getProfile());
  });

  // --- Projects ---
  app.get('/api/projects', (req, res) => {
    const includeAll = req.query.all === '1' && isAdminAuthenticated(req);
    res.json(getProjects(includeAll));
  });

  app.post('/api/projects', requireAdmin, (req, res) => {
    const body = req.body as {
      title?: string;
      category?: string;
      summary?: string;
      description?: string;
      highlights?: string[];
      technologies?: string[];
      imageUrl?: string;
      githubUrl?: string;
      liveUrl?: string;
      featured?: boolean;
      approved?: boolean;
    };

    if (!body.title?.trim() || !body.description?.trim()) {
      res.status(400).json({ error: 'Project title and description are required.' });
      return;
    }

    const baseSlug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const info = db
      .prepare(`
        INSERT INTO projects (
          slug, title, category, summary, description, highlights_json, technologies_json,
          image_url, github_url, live_url, featured, approved, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        slug,
        body.title.trim(),
        (body.category || 'Software Engineering').trim(),
        (body.summary || body.description.slice(0, 140)).trim(),
        body.description.trim(),
        JSON.stringify(Array.isArray(body.highlights) ? body.highlights : []),
        JSON.stringify(Array.isArray(body.technologies) ? body.technologies : []),
        (body.imageUrl || '').trim(),
        (body.githubUrl || '').trim(),
        (body.liveUrl || '').trim(),
        body.featured ? 1 : 0,
        body.approved !== false ? 1 : 0,
        10
      );

    const created = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid) as Record<string, unknown>;
    res.status(201).json(getProjects(true).find((p) => p.id === Number(created.id)));
  });

  app.patch('/api/projects/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const existing = getProjects(true).find((p) => p.id === id);
    if (!existing) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }

    const body = req.body as Partial<typeof existing>;
    db.prepare(`
      UPDATE projects
      SET title = ?, category = ?, summary = ?, description = ?,
          highlights_json = ?, technologies_json = ?, github_url = ?, live_url = ?,
          featured = ?, approved = ?
      WHERE id = ?
    `).run(
      typeof body.title === 'string' ? body.title.trim() : existing.title,
      typeof body.category === 'string' ? body.category.trim() : existing.category,
      typeof body.summary === 'string' ? body.summary.trim() : existing.summary,
      typeof body.description === 'string' ? body.description.trim() : existing.description,
      JSON.stringify(Array.isArray(body.highlights) ? body.highlights : existing.highlights),
      JSON.stringify(Array.isArray(body.technologies) ? body.technologies : existing.technologies),
      typeof body.githubUrl === 'string' ? body.githubUrl.trim() : existing.githubUrl,
      typeof body.liveUrl === 'string' ? body.liveUrl.trim() : existing.liveUrl || '',
      typeof body.featured === 'boolean' ? (body.featured ? 1 : 0) : existing.featured ? 1 : 0,
      typeof body.approved === 'boolean' ? (body.approved ? 1 : 0) : existing.approved ? 1 : 0,
      id
    );

    res.json(getProjects(true).find((p) => p.id === id));
  });

  app.delete('/api/projects/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Project not found.' });
      return;
    }
    res.json({ deleted: true, id });
  });

  // --- Certificates ---
  app.get('/api/certificates', (req, res) => {
    const includeAll = req.query.all === '1' && isAdminAuthenticated(req);
    res.json(getCertificates(includeAll));
  });

  app.get('/api/certificates/:id', (req, res) => {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row || (!row.approved && !isAdminAuthenticated(req))) {
      res.status(404).json({ error: 'Certificate not found.' });
      return;
    }
    res.json(mapCertificateRow(row));
  });

  app.get('/api/certificates/:id/file', (req, res) => {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT * FROM certificates WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row || (!row.approved && !isAdminAuthenticated(req))) {
      res.status(404).json({ error: 'Certificate file not found.' });
      return;
    }
    const relPath = String(row.file_path).replace(/^\/+/, '');
    const fullPath = path.resolve(process.cwd(), 'public', relPath);
    if (!fullPath.startsWith(path.resolve(process.cwd(), 'public')) || !fs.existsSync(fullPath)) {
      res.status(404).json({ error: 'Stored certificate asset could not be located on disk.' });
      return;
    }
    if (req.query.download === '1') {
      const ext = path.extname(fullPath);
      const safeName = String(row.title).replace(/[^a-zA-Z0-9_-]+/g, '_') + ext;
      res.download(fullPath, safeName);
      return;
    }
    res.sendFile(fullPath);
  });

  app.post('/api/certificates/upload', requireAdmin, upload.single('file'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'A PDF, PNG, or JPG certificate file is required.' });
      return;
    }

    const body = req.body as {
      title?: string;
      recipientName?: string;
      issuingOrganization?: string;
      issueDate?: string;
      issueYear?: string;
      certificateId?: string;
      verificationUrl?: string;
      verificationNote?: string;
      category?: CertificateCategory;
      skills?: string;
      approved?: string;
    };

    if (!body.title?.trim() || !body.issuingOrganization?.trim()) {
      res.status(400).json({ error: 'Certificate title and issuing organization are required.' });
      return;
    }

    const ext = path.extname(req.file.filename).replace('.', '').toLowerCase();
    const issueYear = Number(body.issueYear) || new Date().getFullYear();
    const skills = (body.skills || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const filePath = `/uploads/certificates/${req.file.filename}`;
    const info = db
      .prepare(`
        INSERT INTO certificates (
          title, recipient_name, issuing_organization, issue_date, issue_year,
          certificate_id, verification_url, verification_note, category,
          skills_json, file_path, file_type, approved, needs_verification
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        body.title.trim(),
        (body.recipientName || 'AJEY C').trim(),
        body.issuingOrganization.trim(),
        (body.issueDate || String(issueYear)).trim(),
        issueYear,
        (body.certificateId || 'Pending Verification').trim(),
        (body.verificationUrl || '').trim(),
        (body.verificationNote || '').trim(),
        body.category || 'Other',
        JSON.stringify(skills),
        filePath,
        ext,
        body.approved === 'false' ? 0 : 1,
        body.certificateId ? 0 : 1
      );

    const row = db.prepare('SELECT * FROM certificates WHERE id = ?').get(info.lastInsertRowid) as Record<string, unknown>;
    res.status(201).json(mapCertificateRow(row));
  });

  app.patch('/api/certificates/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const existing = getCertificates(true).find((c) => c.id === id);
    if (!existing) {
      res.status(404).json({ error: 'Certificate not found.' });
      return;
    }

    const body = req.body as Partial<typeof existing>;
    db.prepare(`
      UPDATE certificates
      SET title = ?, recipient_name = ?, issuing_organization = ?, issue_date = ?, issue_year = ?,
          certificate_id = ?, verification_url = ?, verification_note = ?, category = ?,
          skills_json = ?, approved = ?, needs_verification = ?
      WHERE id = ?
    `).run(
      typeof body.title === 'string' ? body.title.trim() : existing.title,
      typeof body.recipientName === 'string' ? body.recipientName.trim() : existing.recipientName,
      typeof body.issuingOrganization === 'string' ? body.issuingOrganization.trim() : existing.issuingOrganization,
      typeof body.issueDate === 'string' ? body.issueDate.trim() : existing.issueDate,
      typeof body.issueYear === 'number' ? body.issueYear : existing.issueYear,
      typeof body.certificateId === 'string' ? body.certificateId.trim() : existing.certificateId,
      typeof body.verificationUrl === 'string' ? body.verificationUrl.trim() : existing.verificationUrl,
      typeof body.verificationNote === 'string' ? body.verificationNote.trim() : existing.verificationNote,
      body.category || existing.category,
      JSON.stringify(Array.isArray(body.skills) ? body.skills : existing.skills),
      typeof body.approved === 'boolean' ? (body.approved ? 1 : 0) : existing.approved ? 1 : 0,
      typeof body.needsVerification === 'boolean'
        ? body.needsVerification
          ? 1
          : 0
        : existing.needsVerification
          ? 1
          : 0,
      id
    );

    res.json(getCertificates(true).find((c) => c.id === id));
  });

  app.delete('/api/certificates/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const existing = getCertificates(true).find((c) => c.id === id);
    if (!existing) {
      res.status(404).json({ error: 'Certificate not found.' });
      return;
    }
    db.prepare('DELETE FROM certificates WHERE id = ?').run(id);
    if (existing.filePath.startsWith('/uploads/certificates/')) {
      const diskPath = path.resolve(process.cwd(), 'public', existing.filePath.replace(/^\/+/, ''));
      if (diskPath.startsWith(UPLOAD_ROOT) && fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    }
    res.json({ deleted: true, id });
  });

  // --- Blog / Security Research Notes ---
  app.get('/api/blog', (req, res) => {
    const includeAll = req.query.all === '1' && isAdminAuthenticated(req);
    res.json(getBlogPosts(includeAll));
  });

  app.post('/api/blog', requireAdmin, (req, res) => {
    const body = req.body as {
      title?: string;
      category?: string;
      summary?: string;
      content?: string;
      publishedAt?: string;
      readTime?: string;
      approved?: boolean;
    };

    if (!body.title?.trim() || !body.content?.trim()) {
      res.status(400).json({ error: 'Post title and content are required.' });
      return;
    }

    const baseSlug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    const info = db
      .prepare(`
        INSERT INTO blog_posts (slug, title, category, summary, content, published_at, read_time, approved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        slug,
        body.title.trim(),
        (body.category || 'AI Security').trim(),
        (body.summary || body.content.slice(0, 140)).trim(),
        body.content.trim(),
        (body.publishedAt || 'November 2026').trim(),
        (body.readTime || '4 min read').trim(),
        body.approved !== false ? 1 : 0
      );

    res.status(201).json(getBlogPosts(true).find((p) => p.id === Number(info.lastInsertRowid)));
  });

  app.delete('/api/blog/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const result = db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Blog post not found.' });
      return;
    }
    res.json({ deleted: true, id });
  });

  // --- Chatbot ("Ask Ajey") ---
  app.post('/api/chat', async (req, res) => {
    const { message } = req.body as { message?: string };
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Please enter a question.' });
      return;
    }

    const question = message.trim().slice(0, 800);
    const profile = getProfile();
    const projects = getProjects(false);
    const certificates = getCertificates(false);
    const blogPosts = getBlogPosts(false);

    const ai = getGeminiClient();
    if (ai) {
      try {
        const verifiedFacts = JSON.stringify({
          profile: {
            name: profile.name,
            location: profile.location,
            email: profile.email,
            phone: profile.phone,
            university: profile.university,
            degree: profile.degree,
            academicStatus: profile.academicStatus,
            expectedGraduation: profile.expectedGraduation,
            academicPerformance: `${profile.sgpa} SGPA (IMPORTANT: SGPA, never refer to it as CGPA)`,
            schooling: [
              'Class XII — CBSE, Nalanda International Public School, 2025, 80.8%',
              'Class X — CBSE, Nalanda International Public School, 2023, 77.8%',
            ],
            skills: {
              programming: ['Python', 'Java', 'C', 'C++', 'JavaScript'],
              database: ['MySQL'],
              webDevelopment: ['Full Stack Web Development (In Progress)'],
            },
            languages: profile.languages,
            careerObjective: profile.careerObjective,
          },
          projects: projects.map((p) => ({
            title: p.title,
            technologies: p.technologies,
            description: p.description,
            highlights: p.highlights,
          })),
          certificates: certificates.map((c) => ({
            title: c.title,
            issuingOrganization: c.issuingOrganization,
            issueDate: c.issueDate,
            certificateId: c.certificateId,
            category: c.category,
          })),
          researchNotes: blogPosts.map((b) => ({ title: b.title, category: b.category, summary: b.summary })),
        });

        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: question,
          config: {
            systemInstruction: [
              'You are "Ask Ajey", the official portfolio assistant for Ajey C.',
              'Answer concisely and professionally using ONLY the verified portfolio JSON below.',
              'STRICT RULES:',
              '1. NEVER invent projects, certificates, job titles, companies, GPAs, or skills not present in the JSON.',
              '2. Always state 8.78 as SGPA (Semester Grade Point Average), NEVER CGPA.',
              '3. If a visitor asks for something not in the verified JSON (like an external URL not configured), clearly state that it is not yet listed.',
              '4. Keep responses under 140 words and cleanly formatted.',
              `VERIFIED_PORTFOLIO_DATA: ${verifiedFacts}`,
            ].join('\n'),
          },
        });

        const replyText = response.text?.trim();
        if (replyText) {
          res.json({ reply: replyText, source: 'gemini' });
          return;
        }
      } catch (err) {
        console.warn('Gemini fallback triggered:', err instanceof Error ? err.message : String(err));
      }
    }

    const fallbackReply = answerPortfolioQuestion(question, {
      profile,
      projects,
      certificates,
      blogPosts,
    });
    res.json({ reply: fallbackReply, source: 'knowledge_base' });
  });

  // --- Contact Form ---
  app.post('/api/contact', (req, res) => {
    const clientIp = req.ip || 'unknown';
    if (isRateLimited(clientIp)) {
      res.status(429).json({ error: 'Too many messages sent recently. Please wait a few minutes before trying again.' });
      return;
    }

    const body = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
      website?: string;
    };

    const validation = validateContactInput({
      name: body.name || '',
      email: body.email || '',
      subject: body.subject || '',
      message: body.message || '',
      website: body.website || '',
    });

    if (validation.isSpam) {
      // Silently accept honeypot triggers without storing
      res.status(200).json({ success: true, message: 'Message received.' });
      return;
    }

    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed.', errors: validation.errors });
      return;
    }

    const info = db
      .prepare('INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)')
      .run(body.name!.trim(), body.email!.trim(), body.subject!.trim(), body.message!.trim());

    res.status(201).json({
      success: true,
      id: Number(info.lastInsertRowid),
      message: 'Thanks for reaching out! Your message has been saved.',
    });
  });

  app.get('/api/contact', requireAdmin, (_req, res) => {
    res.json(getContactMessages());
  });

  app.patch('/api/contact/:id', requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body as { status?: string };
    if (!status || !['unread', 'read', 'archived'].includes(status)) {
      res.status(400).json({ error: 'Invalid status.' });
      return;
    }
    db.prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(status, id);
    res.json({ updated: true, id, status });
  });

  // --- Privacy-Conscious Analytics ---
  app.post('/api/analytics/visit', (req, res) => {
    const { eventType, target } = req.body as { eventType?: string; target?: string };
    const allowedEvents = new Set(['page_visit', 'section_view', 'project_interaction', 'certificate_view']);
    const safeType = allowedEvents.has(String(eventType)) ? String(eventType) : 'page_visit';
    const safeTarget = String(target || 'home').slice(0, 80);

    db.prepare('INSERT INTO analytics_events (event_type, target) VALUES (?, ?)').run(safeType, safeTarget);
    res.status(201).json({ recorded: true });
  });

  app.get('/api/analytics/dashboard', requireAdmin, (_req, res) => {
    const totalVisits = (
      db.prepare("SELECT COUNT(*) as c FROM analytics_events WHERE event_type = 'page_visit'").get() as { c: number }
    ).c;

    const todayVisits = (
      db
        .prepare(
          "SELECT COUNT(*) as c FROM analytics_events WHERE event_type = 'page_visit' AND visit_date = date('now')"
        )
        .get() as { c: number }
    ).c;

    const dailyVisits = db
      .prepare(
        "SELECT visit_date as date, COUNT(*) as count FROM analytics_events WHERE event_type = 'page_visit' GROUP BY visit_date ORDER BY visit_date DESC LIMIT 14"
      )
      .all() as Array<{ date: string; count: number }>;

    const popularSections = db
      .prepare(
        "SELECT target as section, COUNT(*) as count FROM analytics_events WHERE event_type = 'section_view' GROUP BY target ORDER BY count DESC LIMIT 8"
      )
      .all() as Array<{ section: string; count: number }>;

    const projectRows = db
      .prepare(
        "SELECT target as projectSlug, COUNT(*) as count FROM analytics_events WHERE event_type = 'project_interaction' GROUP BY target ORDER BY count DESC LIMIT 8"
      )
      .all() as Array<{ projectSlug: string; count: number }>;

    const allProjects = getProjects(true);
    const projectInteractions = projectRows.map((row) => ({
      projectSlug: row.projectSlug,
      title: allProjects.find((p) => p.slug === row.projectSlug)?.title || row.projectSlug,
      count: row.count,
    }));

    const recentActivity = db
      .prepare('SELECT id, event_type as eventType, target, created_at as createdAt FROM analytics_events ORDER BY id DESC LIMIT 12')
      .all() as Array<{ id: number; eventType: string; target: string; createdAt: string }>;

    res.json({
      totalVisits,
      todayVisits,
      dailyVisits: dailyVisits.reverse(),
      popularSections,
      projectInteractions,
      recentActivity,
    });
  });

  // --- Dynamic Resume PDF Generator ---
  app.get('/api/resume/download', async (_req, res) => {
    try {
      const profile = getProfile();
      const projects = getProjects(false);
      const certificates = getCertificates(false);
      const pdfBuffer = await buildResumePdfBuffer(profile, projects, certificates);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="Ajey_C_Resume.pdf"');
      res.setHeader('Content-Length', String(pdfBuffer.length));
      res.send(pdfBuffer);
    } catch (err) {
      console.error('Resume PDF generation error:', err);
      res.status(500).json({ error: 'Unable to generate resume PDF.' });
    }
  });

  // --- Admin Auth ---
  app.get('/api/admin/me', (req, res) => {
    const cookies = parseCookies(req);
    const session = verifySessionToken(cookies[COOKIE_NAME]);
    res.json({ authenticated: session !== null, username: session?.sub || null });
  });

  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required.' });
      return;
    }

    const userValid = safeEqual(username.trim(), ADMIN_USERNAME);
    const passValid = safeEqual(password, ADMIN_PASSWORD);
    if (!userValid || !passValid) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    const token = signSessionToken(ADMIN_USERNAME);
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 12,
    });
    res.json({ authenticated: true, username: ADMIN_USERNAME });
  });

  app.post('/api/admin/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ authenticated: false });
  });

  // --- Vite / Static Frontend ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ajey C Portfolio server running on http://0.0.0.0:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
