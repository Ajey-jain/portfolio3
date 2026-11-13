import json
import os
from pathlib import Path
from models import Certificate
from schemas import CertificateOut

MAX_UPLOAD_BYTES = 10 * 1024 * 1024  # 10 MB

_BACKEND_DIR = Path(__file__).resolve().parent.parent
_REPO_ROOT = _BACKEND_DIR.parent


def _resolve_public_dir() -> Path:
    env_dir = os.getenv("PUBLIC_ASSETS_DIR", "").strip()
    if env_dir:
        candidate = Path(env_dir)
        if not candidate.is_absolute():
            candidate = (_BACKEND_DIR / candidate).resolve()
        return candidate
    if (_REPO_ROOT / "public").exists():
        return (_REPO_ROOT / "public").resolve()
    return (_BACKEND_DIR / "public").resolve()


PUBLIC_ASSETS_DIR = _resolve_public_dir()


def get_upload_dir() -> Path:
    """Resolve a writable upload directory lazily (avoiding import-time mkdir on read-only Vercel)."""
    if os.getenv("VERCEL") or not os.access(str(PUBLIC_ASSETS_DIR), os.W_OK):
        upload_dir = Path("/tmp/uploads/certificates")
    else:
        upload_dir = PUBLIC_ASSETS_DIR / "uploads" / "certificates"
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def serialize_certificate(cert: Certificate) -> CertificateOut:
    return CertificateOut(
        id=cert.id,
        title=cert.title,
        recipientName=cert.recipient_name,
        issuingOrganization=cert.issuing_organization,
        issueDate=cert.issue_date,
        issueYear=cert.issue_year,
        certificateId=cert.certificate_id,
        verificationUrl=cert.verification_url,
        verificationNote=cert.verification_note,
        category=cert.category,
        skills=json.loads(cert.skills_json or "[]"),
        filePath=cert.file_path,
        fileType=cert.file_type,
        approved=cert.approved,
        needsVerification=cert.needs_verification,
        createdAt=cert.created_at.isoformat(),
    )


def resolve_certificate_disk_path(file_path: str) -> Path | None:
    rel = file_path.lstrip("/")

    # Check ephemeral /tmp uploads first if the path is an uploaded certificate
    if rel.startswith("uploads/certificates/"):
        tmp_candidate = (Path("/tmp") / rel).resolve()
        if str(tmp_candidate).startswith("/tmp/uploads/certificates") and tmp_candidate.is_file():
            return tmp_candidate

    # Check bundled public assets directory
    candidate = (PUBLIC_ASSETS_DIR / rel).resolve()
    if str(candidate).startswith(str(PUBLIC_ASSETS_DIR)) and candidate.is_file():
        return candidate

    return None


def validate_upload_extension(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in {".pdf", ".png", ".jpg", ".jpeg"}:
        raise ValueError("Only PDF, PNG, and JPG files are allowed.")
    return ext.lstrip(".")


def validate_upload_magic_bytes(file_type: str, content: bytes) -> None:
    if len(content) == 0:
        raise ValueError("Uploaded file is empty.")
    if len(content) > MAX_UPLOAD_BYTES:
        raise ValueError("Uploaded file exceeds the 10 MB size limit.")

    if file_type == "pdf" and not content.startswith(b"%PDF-"):
        raise ValueError("Invalid PDF file signature.")
    if file_type == "png" and not content.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("Invalid PNG file signature.")
    if file_type in {"jpg", "jpeg"} and not content.startswith(b"\xff\xd8\xff"):
        raise ValueError("Invalid JPEG file signature.")
