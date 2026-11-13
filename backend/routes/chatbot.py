from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import ChatRequest
from services.chatbot_service import generate_chat_reply

router = APIRouter(prefix="/api", tags=["Chatbot"])


@router.post("/chat")
def chat_with_assistant(payload: ChatRequest, db: Session = Depends(get_db)):
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Please enter a question.")
    reply, source = generate_chat_reply(payload.message.strip(), db)
    return {"reply": reply, "source": source}
