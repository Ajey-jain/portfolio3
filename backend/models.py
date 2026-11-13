from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from database import Base


class ProfileSettings(Base):
    __tablename__ = "profile_settings"

    id = Column(Integer, primary_key=True, default=1)
    name = Column(String(120), nullable=False)
    headline = Column(String(240), nullable=False)
    subheadline = Column(Text, nullable=False)
    location = Column(String(160), nullable=False)
    email = Column(String(160), nullable=False)
    phone = Column(String(40), nullable=False)
    university = Column(String(160), nullable=False)
    degree = Column(String(240), nullable=False)
    academic_status = Column(String(120), nullable=False)
    expected_graduation = Column(String(20), nullable=False)
    sgpa = Column(String(20), nullable=False)
    career_objective = Column(Text, nullable=False)
    github_url = Column(String(300), default="", nullable=False)
    linkedin_url = Column(String(300), default="", nullable=False)
    photo_path = Column(String(300), nullable=False)
    languages_json = Column(Text, nullable=False)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(160), unique=True, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    category = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    highlights_json = Column(Text, nullable=False, default="[]")
    technologies_json = Column(Text, nullable=False, default="[]")
    image_url = Column(String(300), nullable=False, default="")
    github_url = Column(String(300), nullable=False, default="")
    live_url = Column(String(300), nullable=False, default="")
    featured = Column(Boolean, default=False, nullable=False)
    approved = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(240), nullable=False)
    recipient_name = Column(String(120), nullable=False)
    issuing_organization = Column(String(200), nullable=False)
    issue_date = Column(String(80), nullable=False)
    issue_year = Column(Integer, nullable=False)
    certificate_id = Column(String(120), nullable=False)
    verification_url = Column(String(300), default="", nullable=False)
    verification_note = Column(Text, default="", nullable=False)
    category = Column(String(120), nullable=False)
    skills_json = Column(Text, nullable=False, default="[]")
    file_path = Column(String(300), nullable=False)
    file_type = Column(String(20), nullable=False)
    approved = Column(Boolean, default=True, nullable=False)
    needs_verification = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(160), unique=True, nullable=False, index=True)
    title = Column(String(240), nullable=False)
    category = Column(String(100), nullable=False)
    summary = Column(Text, nullable=False)
    content = Column(Text, nullable=False)
    published_at = Column(String(60), nullable=False)
    read_time = Column(String(40), nullable=False)
    approved = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False)
    subject = Column(String(180), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default="unread", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(60), nullable=False, index=True)
    target = Column(String(120), nullable=False)
    visit_date = Column(String(20), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
