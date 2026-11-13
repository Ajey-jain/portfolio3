from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from auth import require_admin
from database import get_db
from models import AnalyticsEvent, Project
from schemas import AnalyticsEventIn

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])
ALLOWED_EVENTS = {"page_visit", "section_view", "project_interaction", "certificate_view"}


@router.post("/visit", status_code=201)
def record_visit(payload: AnalyticsEventIn, db: Session = Depends(get_db)):
    event_type = payload.eventType if payload.eventType in ALLOWED_EVENTS else "page_visit"
    event = AnalyticsEvent(
        event_type=event_type,
        target=payload.target[:80] or "home",
        visit_date=date.today().isoformat(),
    )
    db.add(event)
    db.commit()
    return {"recorded": True}


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), _admin: str = Depends(require_admin)):
    today_str = date.today().isoformat()
    total_visits = db.query(func.count(AnalyticsEvent.id)).filter(AnalyticsEvent.event_type == "page_visit").scalar() or 0
    today_visits = (
        db.query(func.count(AnalyticsEvent.id))
        .filter(AnalyticsEvent.event_type == "page_visit", AnalyticsEvent.visit_date == today_str)
        .scalar()
        or 0
    )
    daily_rows = (
        db.query(AnalyticsEvent.visit_date, func.count(AnalyticsEvent.id))
        .filter(AnalyticsEvent.event_type == "page_visit")
        .group_by(AnalyticsEvent.visit_date)
        .order_by(AnalyticsEvent.visit_date.desc())
        .limit(14)
        .all()
    )
    section_rows = (
        db.query(AnalyticsEvent.target, func.count(AnalyticsEvent.id))
        .filter(AnalyticsEvent.event_type == "section_view")
        .group_by(AnalyticsEvent.target)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(8)
        .all()
    )
    project_rows = (
        db.query(AnalyticsEvent.target, func.count(AnalyticsEvent.id))
        .filter(AnalyticsEvent.event_type == "project_interaction")
        .group_by(AnalyticsEvent.target)
        .order_by(func.count(AnalyticsEvent.id).desc())
        .limit(8)
        .all()
    )
    project_map = {p.slug: p.title for p in db.query(Project).all()}
    recent = db.query(AnalyticsEvent).order_by(AnalyticsEvent.id.desc()).limit(12).all()

    return {
        "totalVisits": total_visits,
        "todayVisits": today_visits,
        "dailyVisits": [{"date": d, "count": c} for d, c in reversed(daily_rows)],
        "popularSections": [{"section": s, "count": c} for s, c in section_rows],
        "projectInteractions": [
            {"projectSlug": slug, "title": project_map.get(slug, slug), "count": c} for slug, c in project_rows
        ],
        "recentActivity": [
            {
                "id": item.id,
                "eventType": item.event_type,
                "target": item.target,
                "createdAt": item.created_at.isoformat(),
            }
            for item in recent
        ],
    }
