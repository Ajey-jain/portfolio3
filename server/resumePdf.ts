import PDFDocument from 'pdfkit';
import type { Certificate, ProfileSettings, Project } from '../src/types/portfolio';

export function buildResumePdfBuffer(
  profile: ProfileSettings,
  projects: Project[],
  certificates: Certificate[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 44,
      info: {
        Title: `${profile.name} — Resume`,
        Author: profile.name,
        Subject: 'Aspiring AI Security Engineer & Computer Science Student Resume',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const primary = '#111827';
    const accent = '#2563EB';
    const muted = '#4B5563';
    const divider = '#E5E7EB';

    const drawSectionHeading = (title: string) => {
      doc.moveDown(0.75);
      doc.font('Helvetica-Bold').fontSize(10.5).fillColor(accent).text(title.toUpperCase());
      const y = doc.y + 2;
      doc.moveTo(44, y).lineTo(551, y).strokeColor(divider).lineWidth(0.8).stroke();
      doc.moveDown(0.45);
    };

    // Header
    doc.font('Helvetica-Bold').fontSize(20).fillColor(primary).text(profile.name);
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(muted)
      .text('Aspiring AI Security Engineer  |  Computer Science & AI/ML Student  |  Python Developer');
    doc.moveDown(0.25);

    const contactParts = [
      profile.location,
      profile.email,
      profile.phone,
      profile.githubUrl ? `GitHub: ${profile.githubUrl}` : null,
      profile.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : null,
    ].filter(Boolean);
    doc.font('Helvetica').fontSize(9).fillColor(muted).text(contactParts.join('  •  '));

    // Career Objective
    drawSectionHeading('Career Objective');
    doc.font('Helvetica').fontSize(9.5).fillColor(primary).text(profile.careerObjective, {
      lineGap: 2,
    });

    // Education
    drawSectionHeading('Education');
    doc.font('Helvetica-Bold').fontSize(10).fillColor(primary).text(profile.degree);
    doc
      .font('Helvetica')
      .fontSize(9.5)
      .fillColor(muted)
      .text(
        `${profile.university}  •  ${profile.academicStatus}  •  Expected Graduation: ${profile.expectedGraduation}  •  SGPA: ${profile.sgpa}`
      );
    doc.moveDown(0.35);

    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(primary).text('Class XII — CBSE');
    doc.font('Helvetica').fontSize(9).fillColor(muted).text('Nalanda International Public School  •  2025  •  80.8%');
    doc.moveDown(0.25);

    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(primary).text('Class X — CBSE');
    doc.font('Helvetica').fontSize(9).fillColor(muted).text('Nalanda International Public School  •  2023  •  77.8%');

    // Technical Skills
    drawSectionHeading('Technical Skills');
    doc
      .font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor(primary)
      .text('Programming: ', { continued: true })
      .font('Helvetica')
      .fillColor(muted)
      .text('Python, Java, C, C++, JavaScript');
    doc
      .font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor(primary)
      .text('Database: ', { continued: true })
      .font('Helvetica')
      .fillColor(muted)
      .text('MySQL');
    doc
      .font('Helvetica-Bold')
      .fontSize(9.5)
      .fillColor(primary)
      .text('Web Development: ', { continued: true })
      .font('Helvetica')
      .fillColor(muted)
      .text('Full Stack Web Development (In Progress)');

    // Projects
    drawSectionHeading('Projects');
    const approvedProjects = projects.filter((p) => p.approved);
    for (const proj of approvedProjects) {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(primary)
        .text(`${proj.title} `, { continued: true })
        .font('Helvetica')
        .fontSize(9)
        .fillColor(accent)
        .text(`(${proj.technologies.join(', ')})`);
      doc.font('Helvetica').fontSize(9.2).fillColor(muted).text(proj.description, { lineGap: 1.5 });
      if (proj.highlights.length > 0) {
        doc.font('Helvetica').fontSize(9).fillColor(primary).text(`Highlights: ${proj.highlights.join(' • ')}`);
      }
      doc.moveDown(0.35);
    }

    // Certifications
    drawSectionHeading('Verified Certifications');
    const approvedCerts = certificates.filter((c) => c.approved);
    for (const cert of approvedCerts) {
      doc
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor(primary)
        .text(cert.title);
      doc
        .font('Helvetica')
        .fontSize(8.8)
        .fillColor(muted)
        .text(`${cert.issuingOrganization}  •  Issued: ${cert.issueDate}  •  Certificate ID: ${cert.certificateId}`);
      doc.moveDown(0.25);
    }

    // Languages
    drawSectionHeading('Languages');
    doc.font('Helvetica').fontSize(9.5).fillColor(primary).text(profile.languages.join('  •  '));

    doc.end();
  });
}
