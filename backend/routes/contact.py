import time
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from auth import require_admin
from database import get_db
from models import ContactMessage
from schemas import ContactCreate

router = APIRouter(prefix="/api/contact", tags=["Contact"])
_rate_buckets: dict[str, list[float]] = defaultdict(list)


def _is_rate_limited(client_key: str) -> bool:
    now = time.time()
    window = 900.0
    hits = [ts for ts in _rate_buckets[client_key] if now - ts < window]
    if len(hits) >= 6:
        _rate_buckets[client_key] = hits
        return True
    hits.append(now)
    _rate_buckets[client_key] = hits
    return False


@router.post("", status_code=201)
def submit_contact(payload: ContactCreate, request: Request, db: Session = Depends(get_db)):
    if payload.website and payload.website.strip():
        return {"success": True, "message": "Message received."}

    forwarded_for = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    client_ip = forwarded_for or (request.client.host if request.client else "unknown")
    if _is_rate_limited(client_ip):
        raise HTTPException(status_code=429, detail="Too many messages sent recently. Please wait before trying again.")

    msg = ContactMessage(
        name=payload.name.strip(),
        email=str(payload.email).strip(),
        subject=payload.subject.strip(),
        message=payload.message.strip(),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"success": True, "id": msg.id, "message": "Thanks for reaching out! Your message has been saved."}


@router.get("")
def list_contact_messages(db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    rows = db.query(ContactMessage).order_by(ContactMessage.id.desc()).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "subject": r.subject,
            "message": r.message,
            "status": r.status,
            "createdAt": r.created_at.isoformat(),
        }
        for r in rows
    ]
