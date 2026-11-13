import json
import re
import time
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from auth import get_authenticated_admin, require_admin
from database import get_db
from models import Project
from schemas import ProjectCreate, ProjectUpdate

router = APIRouter(prefix="/api/projects", tags=["Projects"])


def _serialize(p: Project) -> dict:
    return {
        "id": p.id,
        "slug": p.slug,
        "title": p.title,
        "category": p.category,
        "summary": p.summary,
        "description": p.description,
        "highlights": json.loads(p.highlights_json or "[]"),
        "technologies": json.loads(p.technologies_json or "[]"),
        "imageUrl": p.image_url,
        "githubUrl": p.github_url,
        "liveUrl": p.live_url,
        "featured": p.featured,
        "approved": p.approved,
        "sortOrder": p.sort_order,
        "createdAt": p.created_at.isoformat(),
    }


@router.get("")
def list_projects(request: Request, all: int = 0, db: Session = Depends(get_db)):
    include_all = all == 1 and get_authenticated_admin(request) is not None
    q = db.query(Project)
    if not include_all:
        q = q.filter(Project.approved == True)
    rows = q.order_by(Project.sort_order.asc(), Project.id.desc()).all()
    return [_serialize(r) for r in rows]


@router.post("", status_code=201)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    base_slug = re.sub(r"[^a-z0-9]+", "-", payload.title.lower()).strip("-")
    slug = f"{base_slug}-{int(time.time())}"
    proj = Project(
        slug=slug,
        title=payload.title.strip(),
        category=payload.category.strip(),
        summary=(payload.summary or payload.description[:140]).strip(),
        description=payload.description.strip(),
        highlights_json=json.dumps(payload.highlights),
        technologies_json=json.dumps(payload.technologies),
        image_url=payload.imageUrl.strip(),
        github_url=payload.githubUrl.strip(),
        live_url=payload.liveUrl.strip(),
        featured=payload.featured,
        approved=payload.approved,
        sort_order=10,
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return _serialize(proj)


@router.patch("/{project_id}")
def update_project(
    project_id: int, payload: ProjectUpdate, db: Session = Depends(get_db), _admin: str = Depends(require_admin)
):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")
    for field, attr in [
        ("title", "title"),
        ("category", "category"),
        ("summary", "summary"),
        ("description", "description"),
        ("githubUrl", "github_url"),
        ("liveUrl", "live_url"),
        ("featured", "featured"),
        ("approved", "approved"),
    ]:
        val = getattr(payload, field)
        if val is not None:
            setattr(proj, attr, val.strip() if isinstance(val, str) else val)
    if payload.highlights is not None:
        proj.highlights_json = json.dumps(payload.highlights)
    if payload.technologies is not None:
        proj.technologies_json = json.dumps(payload.technologies)
    db.commit()
    db.refresh(proj)
    return _serialize(proj)


@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.delete(proj)
    db.commit()
    return {"deleted": True, "id": project_id}
