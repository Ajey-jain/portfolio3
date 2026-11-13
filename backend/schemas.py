from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class ProfileOut(BaseModel):
    name: str
    headline: str
    subheadline: str
    location: str
    email: str
    phone: str
    university: str
    degree: str
    academicStatus: str
    expectedGraduation: str
    sgpa: str
    careerObjective: str
    githubUrl: str
    linkedinUrl: str
    photoPath: str
    languages: List[str]


class ProfileUpdate(BaseModel):
    headline: Optional[str] = None
    subheadline: Optional[str] = None
    careerObjective: Optional[str] = None
    githubUrl: Optional[str] = None
    linkedinUrl: Optional[str] = None
    sgpa: Optional[str] = None
    academicStatus: Optional[str] = None


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    category: str = Field(default="Software Engineering", max_length=100)
    summary: Optional[str] = None
    description: str = Field(..., min_length=10, max_length=4000)
    highlights: List[str] = []
    technologies: List[str] = []
    imageUrl: str = ""
    githubUrl: str = ""
    liveUrl: str = ""
    featured: bool = False
    approved: bool = True


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    highlights: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    githubUrl: Optional[str] = None
    liveUrl: Optional[str] = None
    featured: Optional[bool] = None
    approved: Optional[bool] = None


class CertificateOut(BaseModel):
    id: int
    title: str
    recipientName: str
    issuingOrganization: str
    issueDate: str
    issueYear: int
    certificateId: str
    verificationUrl: str
    verificationNote: str
    category: str
    skills: List[str]
    filePath: str
    fileType: str
    approved: bool
    needsVerification: bool
    createdAt: str


class CertificateUpdate(BaseModel):
    title: Optional[str] = None
    recipientName: Optional[str] = None
    issuingOrganization: Optional[str] = None
    issueDate: Optional[str] = None
    issueYear: Optional[int] = None
    certificateId: Optional[str] = None
    verificationUrl: Optional[str] = None
    verificationNote: Optional[str] = None
    category: Optional[str] = None
    skills: Optional[List[str]] = None
    approved: Optional[bool] = None
    needsVerification: Optional[bool] = None


class BlogPostCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=240)
    category: str = Field(default="AI Security", max_length=100)
    summary: Optional[str] = None
    content: str = Field(..., min_length=20)
    publishedAt: str = "November 2026"
    readTime: str = "4 min read"
    approved: bool = True


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=3, max_length=150)
    message: str = Field(..., min_length=10, max_length=3000)
    website: Optional[str] = None


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=800)


class AnalyticsEventIn(BaseModel):
    eventType: str = Field(default="page_visit", max_length=60)
    target: str = Field(default="home", max_length=80)


class AdminLoginIn(BaseModel):
    username: str
    password: str
