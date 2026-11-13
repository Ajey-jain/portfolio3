import io
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer
from sqlalchemy.orm import Session
from models import Certificate, ProfileSettings, Project


def generate_resume_pdf(db: Session) -> bytes:
    profile = db.query(ProfileSettings).filter(ProfileSettings.id == 1).first()
    projects = db.query(Project).filter(Project.approved == True).order_by(Project.sort_order.asc()).all()
    certificates = (
        db.query(Certificate)
        .filter(Certificate.approved == True)
        .order_by(Certificate.issue_year.desc(), Certificate.id.asc())
        .all()
    )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        title=f"{profile.name if profile else 'Ajey C'} — Resume",
    )

    styles = getSampleStyleSheet()
    accent = colors.HexColor("#2563EB")
    dark = colors.HexColor("#111827")
    muted = colors.HexColor("#4B5563")

    name_style = ParagraphStyle("Name", parent=styles["Heading1"], fontSize=20, leading=24, textColor=dark, spaceAfter=2)
    role_style = ParagraphStyle("Role", parent=styles["Normal"], fontSize=10, leading=14, textColor=muted, spaceAfter=4)
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"], fontSize=10.5, leading=14, textColor=accent, spaceBefore=10, spaceAfter=3
    )
    body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=9.5, leading=13.5, textColor=dark)
    muted_style = ParagraphStyle("Muted", parent=styles["Normal"], fontSize=9, leading=12.5, textColor=muted)

    story = []

    if profile:
        story.append(Paragraph(profile.name, name_style))
        story.append(Paragraph("Aspiring AI Security Engineer | Computer Science & AI/ML Student | Python Developer", role_style))
        contact_items = [profile.location, profile.email, profile.phone]
        if profile.github_url:
            contact_items.append(f"GitHub: {profile.github_url}")
        if profile.linkedin_url:
            contact_items.append(f"LinkedIn: {profile.linkedin_url}")
        story.append(Paragraph("  •  ".join(contact_items), muted_style))

        story.append(Paragraph("CAREER OBJECTIVE", section_style))
        story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#E5E7EB"), spaceAfter=5))
        story.append(Paragraph(profile.career_objective, body_style))

        story.append(Paragraph("EDUCATION", section_style))
        story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#E5E7EB"), spaceAfter=5))
        story.append(Paragraph(f"<b>{profile.degree}</b>", body_style))
        story.append(
            Paragraph(
                f"{profile.university} • {profile.academic_status} • Expected Graduation: {profile.expected_graduation} • SGPA: {profile.sgpa}",
                muted_style,
            )
        )
        story.append(Spacer(1, 4))
        story.append(Paragraph("<b>Class XII — CBSE</b> | Nalanda International Public School (2025) • 80.8%", muted_style))
        story.append(Paragraph("<b>Class X — CBSE</b> | Nalanda International Public School (2023) • 77.8%", muted_style))

    story.append(Paragraph("TECHNICAL SKILLS", section_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#E5E7EB"), spaceAfter=5))
    story.append(Paragraph("<b>Programming:</b> Python, Java, C, C++, JavaScript", body_style))
    story.append(Paragraph("<b>Database:</b> MySQL", body_style))
    story.append(Paragraph("<b>Web Development:</b> Full Stack Web Development (In Progress)", body_style))

    story.append(Paragraph("PROJECTS", section_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#E5E7EB"), spaceAfter=5))
    for proj in projects:
        techs = ", ".join(json.loads(proj.technologies_json or "[]"))
        highlights = " • ".join(json.loads(proj.highlights_json or "[]"))
        story.append(Paragraph(f"<b>{proj.title}</b> ({techs})", body_style))
        story.append(Paragraph(proj.description, muted_style))
        if highlights:
            story.append(Paragraph(f"<i>Highlights:</i> {highlights}", muted_style))
        story.append(Spacer(1, 4))

    story.append(Paragraph("VERIFIED CERTIFICATIONS", section_style))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#E5E7EB"), spaceAfter=5))
    for cert in certificates:
        story.append(Paragraph(f"<b>{cert.title}</b>", body_style))
        story.append(
            Paragraph(
                f"{cert.issuing_organization} • Issued: {cert.issue_date} • Certificate ID: {cert.certificate_id}",
                muted_style,
            )
        )
        story.append(Spacer(1, 3))

    if profile:
        langs = ", ".join(json.loads(profile.languages_json or "[]"))
        story.append(Paragraph("LANGUAGES", section_style))
        story.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#E5E7EB"), spaceAfter=5))
        story.append(Paragraph(langs, body_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
