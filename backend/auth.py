import hashlib
import hmac
import os
from fastapi import HTTPException, Request, status
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "ajey_admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "AjeyPortfolio#2026")
SESSION_SECRET = os.getenv(
    "ADMIN_SESSION_SECRET",
    hashlib.sha256(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}:ac-portfolio".encode()).hexdigest(),
)
COOKIE_NAME = "ac_admin_session"
MAX_AGE_SECONDS = 60 * 60 * 12

_serializer = URLSafeTimedSerializer(SESSION_SECRET, salt="admin-session")


def is_https_request(request: Request) -> bool:
    proto = request.headers.get("x-forwarded-proto", "")
    return request.url.scheme == "https" or proto.split(",")[0].strip().lower() == "https" or bool(os.getenv("VERCEL"))


def verify_credentials(username: str, password: str) -> bool:
    u_ok = hmac.compare_digest(username.strip().encode(), ADMIN_USERNAME.encode())
    p_ok = hmac.compare_digest(password.encode(), ADMIN_PASSWORD.encode())
    return u_ok and p_ok


def create_session_token(username: str) -> str:
    return _serializer.dumps({"sub": username})


def get_authenticated_admin(request: Request) -> str | None:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    try:
        data = _serializer.loads(token, max_age=MAX_AGE_SECONDS)
        return data.get("sub")
    except (BadSignature, SignatureExpired):
        return None


def require_admin(request: Request) -> str:
    admin_user = get_authenticated_admin(request)
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required.",
        )
    return admin_user
