import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

load_dotenv()

from database import Base, IS_SQLITE, SessionLocal, engine  # noqa: E402
from routes import admin, analytics, blog, certificates, chatbot, contact, projects, resume  # noqa: E402
from seed import seed_database  # noqa: E402

_db_initialized = False


def ensure_db_initialized() -> None:
    global _db_initialized
    if _db_initialized:
        return
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        _db_initialized = True
    finally:
        db.close()


def _resolve_cors_origins() -> list[str]:
    origins = {
        o.strip().rstrip("/")
        for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
        if o.strip()
    }
    for env_key in ("APP_URL", "VERCEL_URL", "VERCEL_BRANCH_URL", "VERCEL_PROJECT_PRODUCTION_URL"):
        val = os.getenv(env_key, "").strip().rstrip("/")
        if not val or val == "MY_APP_URL":
            continue
        if val.startswith("http://") or val.startswith("https://"):
            origins.add(val)
        else:
            origins.add(f"https://{val}")
    return sorted(origins)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    ensure_db_initialized()
    yield


app = FastAPI(
    title="Ajey C Portfolio API",
    description="Python FastAPI + SQLAlchemy + ReportLab backend for Ajey C's personal portfolio.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_resolve_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def _init_db_middleware(request: Request, call_next):
    ensure_db_initialized()
    try:
        return await call_next(request)
    except Exception:
        return JSONResponse(status_code=500, content={"error": "Internal server error."})


app.include_router(admin.router)
app.include_router(projects.router)
app.include_router(certificates.router)
app.include_router(blog.router)
app.include_router(chatbot.router)
app.include_router(contact.router)
app.include_router(analytics.router)
app.include_router(resume.router)


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "ajey-portfolio-fastapi",
        "database": "sqlite" if IS_SQLITE else "postgresql",
        "ephemeralStorage": bool(os.getenv("VERCEL")) and IS_SQLITE,
    }
