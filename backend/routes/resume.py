from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from database import get_db
from services.resume_service import generate_resume_pdf

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.get("/download")
def download_resume(db: Session = Depends(get_db)):
    pdf_bytes = generate_resume_pdf(db)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="Ajey_C_Resume.pdf"'},
    )
