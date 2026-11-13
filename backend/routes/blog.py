import re
import time
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from auth import get_authenticated_admin, require_admin
from database import get_db
from models import BlogPost
from schemas import BlogPostCreate

router = APIRouter(prefix="/api/blog", tags=["Blog"])


def _serialize(post: BlogPost) -> dict:
    return {
        "id": post.id,
        "slug": post.slug,
        "title": post.title,
        "category": post.category,
        "summary": post.summary,
        "content": post.content,
        "publishedAt": post.published_at,
        "readTime": post.read_time,
        "approved": post.approved,
    }


@router.get("")
def list_posts(request: Request, all: int = 0, db: Session = Depends(get_db)):
    include_all = all == 1 and get_authenticated_admin(request) is not None
    q = db.query(BlogPost)
    if not include_all:
        q = q.filter(BlogPost.approved == True)
    return [_serialize(p) for p in q.order_by(BlogPost.id.desc()).all()]


@router.post("", status_code=201)
def create_post(payload: BlogPostCreate, db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    base_slug = re.sub(r"[^a-z0-9]+", "-", payload.title.lower()).strip("-")
    slug = f"{base_slug}-{int(time.time())}"
    post = BlogPost(
        slug=slug,
        title=payload.title.strip(),
        category=payload.category.strip(),
        summary=(payload.summary or payload.content[:140]).strip(),
        content=payload.content.strip(),
        published_at=payload.publishedAt.strip(),
        read_time=payload.readTime.strip(),
        approved=payload.approved,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _serialize(post)


@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found.")
    db.delete(post)
    db.commit()
    return {"deleted": True, "id": post_id}
