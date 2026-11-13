import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


def _resolve_database_url() -> str:
    raw = (
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or os.getenv("POSTGRES_PRISMA_URL")
        or ""
    ).strip()

    if raw:
        if raw.startswith("postgres://"):
            return "postgresql://" + raw[len("postgres://"):]
        return raw

    # Vercel serverless filesystem (/var/task) is read-only; /tmp is writable per instance.
    # For persistent production storage on Vercel, configure DATABASE_URL to PostgreSQL (Neon/Supabase/Vercel Postgres).
    if os.getenv("VERCEL") or not os.access(os.getcwd(), os.W_OK):
        return "sqlite:////tmp/portfolio.db"

    return "sqlite:///./portfolio.db"


DATABASE_URL = _resolve_database_url()
IS_SQLITE = DATABASE_URL.startswith("sqlite")

connect_args = {"check_same_thread": False} if IS_SQLITE else {}
engine_kwargs = {"connect_args": connect_args, "future": True}
if not IS_SQLITE:
    engine_kwargs["pool_pre_ping"] = True

engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
