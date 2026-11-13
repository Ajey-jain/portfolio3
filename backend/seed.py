import json
from sqlalchemy.orm import Session
from models import BlogPost, Certificate, ProfileSettings, Project


def seed_database(db: Session) -> None:
    if not db.query(ProfileSettings).filter(ProfileSettings.id == 1).first():
        db.add(
            ProfileSettings(
                id=1,
                name="Ajey C",
                headline="Building Intelligent Systems. Exploring Secure AI.",
                subheadline=(
                    "Computer Science Engineering student specializing in AI & ML, "
                    "passionate about programming, artificial intelligence, and building secure digital experiences."
                ),
                location="Hosur, Tamil Nadu, India",
                email="ajeychandrasekaran4@gmail.com",
                phone="+91 7339320177",
                university="Jain University",
                degree="B.Tech Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
                academic_status="Second-year undergraduate student",
                expected_graduation="2029",
                sgpa="8.78",
                career_objective=(
                    "I am a Computer Science engineering student specializing in Artificial Intelligence and Machine Learning, "
                    "with a foundation in Python, Java, SQL, and programming fundamentals. I am interested in AI security, "
                    "software development, and building secure, reliable, and trustworthy intelligent systems. My goal is to "
                    "continuously develop my technical skills and build practical solutions that solve real-world problems."
                ),
                github_url="",
                linkedin_url="",
                photo_path="/assets/aistudio/WhatsApp_Image_2026-11-13_at_3.07.11_PM_65f287e1.jpeg",
                languages_json=json.dumps(["Tamil", "English", "Telugu", "Kannada"]),
            )
        )

    if db.query(Project).count() == 0:
        db.add(
            Project(
                slug="jarvis-voice-assistant",
                title="JARVIS — Voice Assistant",
                category="Python & Automation",
                summary="Python-based voice assistant with spoken command processing and external API integration.",
                description=(
                    "Developed a Python-based voice assistant capable of listening to spoken commands and responding to users. "
                    "Integrated external APIs through API calls to fetch information and perform tasks."
                ),
                highlights_json=json.dumps([
                    "Voice command interaction",
                    "Spoken command processing",
                    "API integration",
                    "Information retrieval",
                ]),
                technologies_json=json.dumps(["Python", "Speech Recognition", "REST APIs", "Task Automation"]),
                image_url="/src/assets/images/jarvis_voice_assistant_1794563508136.jpg",
                github_url="",
                live_url="",
                featured=True,
                approved=True,
                sort_order=1,
            )
        )

    if db.query(Certificate).count() == 0:
        db.add_all([
            Certificate(
                title="SQL Course",
                recipient_name="AJEY C",
                issuing_organization="Intellipaat",
                issue_date="December 30, 2025",
                issue_year=2025,
                certificate_id="31679-913167-314664",
                verification_url="",
                verification_note="Certificate ID 31679-913167-314664 printed on document; no external verification URL printed on file.",
                category="Database Management",
                skills_json=json.dumps(["SQL", "Relational Databases", "Querying"]),
                file_path="/assets/aistudio/intellipaat-certificate__3__3a23faa5.pdf",
                file_type="pdf",
                approved=True,
                needs_verification=False,
            ),
            Certificate(
                title="Python Certification Course",
                recipient_name="AJEY C",
                issuing_organization="Intellipaat",
                issue_date="May 9, 2026",
                issue_year=2026,
                certificate_id="31679-912380-314664",
                verification_url="",
                verification_note="Certificate ID 31679-912380-314664 printed on document; no external verification URL printed on file.",
                category="Programming",
                skills_json=json.dumps(["Python", "Programming Fundamentals", "Scripting"]),
                file_path="/assets/aistudio/intellipaat-certificate__2__6df9d5f1.pdf",
                file_type="pdf",
                approved=True,
                needs_verification=False,
            ),
            Certificate(
                title="Professional Certification Program in Computer Science Engineering – iHub, IIT Roorkee",
                recipient_name="AJEY C",
                issuing_organization="Intellipaat · iHub, IIT Roorkee",
                issue_date="September 18, 2026",
                issue_year=2026,
                certificate_id="31679-1085116-314664",
                verification_url="",
                verification_note="Certificate ID 31679-1085116-314664 printed on document; no external verification URL printed on file.",
                category="Professional Certifications",
                skills_json=json.dumps(["Computer Science Engineering", "Software Foundations", "Problem Solving"]),
                file_path="/assets/aistudio/intellipaat-certificate__1__799ca59b.pdf",
                file_type="pdf",
                approved=True,
                needs_verification=False,
            ),
        ])

    if db.query(BlogPost).count() == 0:
        db.add_all([
            BlogPost(
                slug="securing-python-voice-assistants",
                title="Input Validation Boundaries in Python Voice Assistants",
                category="AI Security",
                summary="Architectural lessons from building JARVIS: separating spoken intent parsing from external API execution.",
                content=(
                    "When building a Python voice assistant like JARVIS, speech-to-text transcripts should never be treated as trusted system instructions.\n\n"
                    "1. Intent Allow-Listing\nMap transcripts into an explicit dictionary of supported intents and validate arguments before invoking external APIs.\n\n"
                    "2. API Response Sanitization\nValidate external JSON schemas so malformed payloads fail gracefully without interrupting the assistant loop.\n\n"
                    "3. Least-Privilege Execution\nSeparating intent parsing from privileged OS actions creates a clean security boundary."
                ),
                published_at="October 2026",
                read_time="4 min read",
                approved=True,
            ),
            BlogPost(
                slug="parameterized-sql-defense",
                title="Defensive Query Design: Parameterized SQL from Day One",
                category="Database Security",
                summary="Notes from applying SQL fundamentals to prevent injection vulnerabilities in full-stack backends.",
                content=(
                    "Secure data layers depend on strict separation between query structure and user-supplied values.\n\n"
                    "1. Prepared Statements Everywhere\nBind parameters via placeholders so input is always treated as data.\n\n"
                    "2. Schema Constraints\nUse NOT NULL, CHECK constraints, and strict types at the database layer."
                ),
                published_at="September 2026",
                read_time="3 min read",
                approved=True,
            ),
            BlogPost(
                slug="grounded-ai-assistants",
                title="Why Trustworthy AI Assistants Need Grounded Knowledge Boundaries",
                category="AI Engineering",
                summary="Designing portfolio assistants that stick strictly to verified facts with deterministic fallbacks.",
                content=(
                    "Fabrication is a primary reliability risk in LLM applications.\n\n"
                    "1. Grounded Context Injection\nSupply structured, verified facts so answers stay anchored to real records.\n\n"
                    "2. Deterministic Fallback Engines\nKeep assistants reliable with keyword-matched FAQ routing when no LLM key is configured."
                ),
                published_at="November 2026",
                read_time="4 min read",
                approved=True,
            ),
        ])

    db.commit()
