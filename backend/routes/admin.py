import json
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from auth import (
    COOKIE_NAME,
    MAX_AGE_SECONDS,
    create_session_token,
    get_authenticated_admin,
    is_https_request,
    require_admin,
    verify_credentials,
)
from database import get_db
from models import ProfileSettings
from schemas import AdminLoginIn, ProfileUpdate

router = APIRouter(prefix="/api", tags=["Profile & Admin"])


def _serialize_profile(p: ProfileSettings) -> dict:
    return {
        "name": p.name,
        "headline": p.headline,
        "subheadline": p.subheadline,
        "location": p.location,
        "email": p.email,
        "phone": p.phone,
        "university": p.university,
        "degree": p.degree,
        "academicStatus": p.academic_status,
        "expectedGraduation": p.expected_graduation,
        "sgpa": p.sgpa,
        "careerObjective": p.career_objective,
        "githubUrl": p.github_url,
        "linkedinUrl": p.linkedin_url,
        "photoPath": p.photo_path,
        "languages": json.loads(p.languages_json or "[]"),
    }


@router.get("/profile")
def get_profile(db: Session = Depends(get_db)):
    p = db.query(ProfileSettings).filter(ProfileSettings.id == 1).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not initialized.")
    return _serialize_profile(p)


@router.put("/profile")
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    p = db.query(ProfileSettings).filter(ProfileSettings.id == 1).first()
    if not p:
        raise HTTPException(status_code=404, detail="Profile not initialized.")
    for field, attr in [
        ("headline", "headline"),
        ("subheadline", "subheadline"),
        ("careerObjective", "career_objective"),
        ("githubUrl", "github_url"),
        ("linkedinUrl", "linkedin_url"),
        ("sgpa", "sgpa"),
        ("academicStatus", "academic_status"),
    ]:
        val = getattr(payload, field)
        if val is not None:
            setattr(p, attr, val.strip())
    db.commit()
    db.refresh(p)
    return _serialize_profile(p)


@router.get("/admin/me")
def admin_me(request: Request):
    username = get_authenticated_admin(request)
    return {"authenticated": username is not None, "username": username}


@router.post("/admin/login")
def admin_login(payload: AdminLoginIn, request: Request, response: Response):
    if not verify_credentials(payload.username, payload.password):
        raise HTTPException(status_code=401, detail="Invalid administrator credentials.")
    token = create_session_token(payload.username.strip())
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=is_https_request(request),
        samesite="lax",
        max_age=MAX_AGE_SECONDS,
        path="/",
    )
    return {"authenticated": True, "username": payload.username.strip()}


@router.post("/admin/logout")
def admin_logout(request: Request, response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/", secure=is_https_request(request), samesite="lax")
    return {"authenticated": False}
