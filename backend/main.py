import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from rate_limiter import limiter
from api import labs, objects, payloads, gadgets, scanner, models, callback, fingerprint, reports

app = FastAPI(
    title="DEHYDRATE API",
    description="Deserialization Security Research Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'none'; "
        "script-src 'none'; "
        "frame-ancestors 'none'; "
        "base-uri 'none';"
    )
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Cross-Origin-Resource-Policy"] = "same-site"
    return response


app.include_router(labs.router, prefix="/api/labs", tags=["Labs"])
app.include_router(objects.router, prefix="/api/object", tags=["Object Inspection"])
app.include_router(payloads.router, prefix="/api/payload", tags=["Payload"])
app.include_router(gadgets.router, prefix="/api/gadgets", tags=["Gadget Chains"])
app.include_router(scanner.router, prefix="/api/scanner", tags=["Scanner"])
app.include_router(models.router, prefix="/api/models", tags=["ML Models"])
app.include_router(callback.router, prefix="/api/callback", tags=["Callback"])
app.include_router(fingerprint.router, prefix="/api/runtime", tags=["Fingerprint"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])


@app.get("/api/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "DEHYDRATE", "mode": "LAB", "version": "1.0.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
