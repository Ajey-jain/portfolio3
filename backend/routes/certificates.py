import json
import re
import time
from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from auth import get_authenticated_admin, require_admin
from database import get_db
from models import Certificate
from schemas import CertificateUpdate
from services.certificate_service import (
    MAX_UPLOAD_BYTES,
    get_upload_dir,
    resolve_certificate_disk_path,
    serialize_certificate,
    validate_upload_extension,
    validate_upload_magic_bytes,
)

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])


@router.get("")
def list_certificates(request: Request, all: int = 0, db: Session = Depends(get_db)):
    include_all = all == 1 and get_authenticated_admin(request) is not None
    q = db.query(Certificate)
    if not include_all:
        q = q.filter(Certificate.approved == True)
    rows = q.order_by(Certificate.issue_year.desc(), Certificate.id.asc()).all()
    return [serialize_certificate(r) for r in rows]


@router.get("/{cert_id}")
def get_certificate(cert_id: int, request: Request, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert or (not cert.approved and get_authenticated_admin(request) is None):
        raise HTTPException(status_code=404, detail="Certificate not found.")
    return serialize_certificate(cert)


@router.get("/{cert_id}/file")
def get_certificate_file(cert_id: int, request: Request, download: int = 0, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert or (not cert.approved and get_authenticated_admin(request) is None):
        raise HTTPException(status_code=404, detail="Certificate file not found.")
    disk_path = resolve_certificate_disk_path(cert.file_path)
    if not disk_path:
        raise HTTPException(status_code=404, detail="Stored certificate file is missing on disk.")
    if download == 1:
        safe_title = re.sub(r"[^a-zA-Z0-9_-]+", "_", cert.title)
        return FileResponse(path=str(disk_path), filename=f"{safe_title}{disk_path.suffix}")
    return FileResponse(path=str(disk_path))


@router.post("/upload", status_code=201)
async def upload_certificate(
    file: UploadFile = File(...),
    title: str = Form(...),
    recipientName: str = Form("AJEY C"),
    issuingOrganization: str = Form(...),
    issueDate: str = Form("2026"),
    issueYear: int = Form(2026),
    certificateId: str = Form("Pending Verification"),
    verificationUrl: str = Form(""),
    verificationNote: str = Form(""),
    category: str = Form("Other"),
    skills: str = Form(""),
    approved: bool = Form(True),
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing certificate filename.")
    try:
        file_type = validate_upload_extension(file.filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    content = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Certificate file exceeds 10 MB limit.")

    try:
        validate_upload_magic_bytes(file_type, content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    safe_stem = re.sub(r"[^a-zA-Z0-9_-]", "_", Path(file.filename).stem)[:48]
    stored_name = f"{int(time.time() * 1000)}_{safe_stem}.{file_type}"
    dest = get_upload_dir() / stored_name
    dest.write_bytes(content)

    skill_list = [s.strip() for s in skills.split(",") if s.strip()]
    cert = Certificate(
        title=title.strip(),
        recipient_name=recipientName.strip(),
        issuing_organization=issuingOrganization.strip(),
        issue_date=issueDate.strip(),
        issue_year=issueYear,
        certificate_id=certificateId.strip(),
        verification_url=verificationUrl.strip(),
        verification_note=verificationNote.strip(),
        category=category.strip(),
        skills_json=json.dumps(skill_list),
        file_path=f"/uploads/certificates/{stored_name}",
        file_type=file_type,
        approved=approved,
        needs_verification=(certificateId.strip() == "Pending Verification"),
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return serialize_certificate(cert)


@router.patch("/{cert_id}")
def update_certificate(
    cert_id: int, payload: CertificateUpdate, db: Session = Depends(get_db), _admin: str = Depends(require_admin)
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    mapping = [
        ("title", "title"),
        ("recipientName", "recipient_name"),
        ("issuingOrganization", "issuing_organization"),
        ("issueDate", "issue_date"),
        ("issueYear", "issue_year"),
        ("certificateId", "certificate_id"),
        ("verificationUrl", "verification_url"),
        ("verificationNote", "verification_note"),
        ("category", "category"),
        ("approved", "approved"),
        ("needsVerification", "needs_verification"),
    ]
    for field, attr in mapping:
        val = getattr(payload, field)
        if val is not None:
            setattr(cert, attr, val.strip() if isinstance(val, str) else val)
    if payload.skills is not None:
        cert.skills_json = json.dumps(payload.skills)
    db.commit()
    db.refresh(cert)
    return serialize_certificate(cert)


@router.delete("/{cert_id}")
def delete_certificate(cert_id: int, db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found.")
    db.delete(cert)
    db.commit()
    return {"deleted": True, "id": cert_id}
