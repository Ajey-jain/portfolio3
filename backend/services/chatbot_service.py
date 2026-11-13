import json
import os
import re
from typing import Tuple
from sqlalchemy.orm import Session
from models import Certificate, ProfileSettings, Project


def _keyword_fallback(
    question: str,
    profile: ProfileSettings,
    projects: list[Project],
    certificates: list[Certificate],
) -> str:
    q = question.strip().lower()
    if re.search(r"(cgpa|sgpa|gpa|grade|marks|education|jain|nalanda|graduat|degree|school|year)", q):
        return (
            f"{profile.name} is a {profile.academic_status} pursuing {profile.degree} at {profile.university} "
            f"(Expected Graduation: {profile.expected_graduation}), holding an {profile.sgpa} SGPA "
            "(Semester Grade Point Average — not CGPA).\n\n"
            "Earlier schooling at Nalanda International Public School: Class XII (CBSE, 2025) with 80.8% "
            "and Class X (CBSE, 2023) with 77.8%."
        )
    if re.search(r"(project|jarvis|voice|built|build|github)", q):
        lines = [
            f"• {p.title} ({', '.join(json.loads(p.technologies_json))}): {p.description}"
            for p in projects
        ]
        return f"Here are {profile.name}'s verified projects:\n\n" + "\n".join(lines)
    if re.search(r"(certif|credential|intellipaat|roorkee|iit|sql course|python cert)", q):
        lines = [
            f"• {c.title} — {c.issuing_organization} ({c.issue_date}, ID: {c.certificate_id})"
            for c in certificates
        ]
        return f"{profile.name} holds {len(certificates)} verified certificates:\n\n" + "\n".join(lines)
    if re.search(r"(skill|stack|tech|python|java|c\+\+|mysql|sql|javascript|web)", q):
        return (
            f"{profile.name}'s technical skills:\n"
            "• Programming: Python, Java, C, C++, JavaScript\n"
            "• Database: MySQL\n"
            "• Web Development: Full Stack Web Development (In Progress)"
        )
    if re.search(r"(career|interest|security|goal|objective|ai security)", q):
        return profile.career_objective
    if re.search(r"(language|speak|tamil|telugu|kannada|english)", q):
        langs = json.loads(profile.languages_json)
        return f"{profile.name} speaks {', '.join(langs)}."
    if re.search(r"(contact|email|phone|reach|location|hosur)", q):
        return (
            f"You can contact {profile.name} ({profile.location}) at {profile.email} or {profile.phone}, "
            "or via the Contact form."
        )
    if re.search(r"(who is|about|introduce|ajey|hello|hi|hey)", q):
        return (
            f"{profile.name} is an aspiring AI Security Engineer and {profile.academic_status} in {profile.degree} "
            f"at {profile.university} ({profile.sgpa} SGPA, expected graduation {profile.expected_graduation})."
        )
    return (
        f"Ask me about {profile.name}'s education (8.78 SGPA at Jain University), skills, "
        f"the JARVIS Voice Assistant project, his {len(certificates)} verified certificates, or contact details."
    )


def generate_chat_reply(message: str, db: Session) -> Tuple[str, str]:
    profile = db.query(ProfileSettings).filter(ProfileSettings.id == 1).first()
    projects = db.query(Project).filter(Project.approved == True).all()
    certificates = db.query(Certificate).filter(Certificate.approved == True).all()

    if not profile:
        return "Portfolio profile is currently unavailable.", "knowledge_base"

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if api_key and api_key != "MY_GEMINI_API_KEY":
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            facts = json.dumps({
                "profile": {
                    "name": profile.name,
                    "location": profile.location,
                    "email": profile.email,
                    "phone": profile.phone,
                    "university": profile.university,
                    "degree": profile.degree,
                    "academicStatus": profile.academic_status,
                    "expectedGraduation": profile.expected_graduation,
                    "academicPerformance": f"{profile.sgpa} SGPA (never label as CGPA)",
                    "languages": json.loads(profile.languages_json),
                    "careerObjective": profile.career_objective,
                },
                "projects": [
                    {
                        "title": p.title,
                        "technologies": json.loads(p.technologies_json),
                        "description": p.description,
                        "highlights": json.loads(p.highlights_json),
                    }
                    for p in projects
                ],
                "certificates": [
                    {
                        "title": c.title,
                        "issuingOrganization": c.issuing_organization,
                        "issueDate": c.issue_date,
                        "certificateId": c.certificate_id,
                    }
                    for c in certificates
                ],
            })
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=message,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        'You are "Ask Ajey", the official assistant for Ajey C. '
                        "Answer concisely using ONLY the verified portfolio JSON. "
                        "Never invent facts. Always label 8.78 as SGPA, never CGPA.\n"
                        f"VERIFIED_DATA: {facts}"
                    )
                ),
            )
            if response.text:
                return response.text.strip(), "gemini"
        except Exception:
            pass

    return _keyword_fallback(message, profile, projects, certificates), "knowledge_base"
