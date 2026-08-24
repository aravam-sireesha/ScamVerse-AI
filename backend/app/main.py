from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.mongodb import db_manager
from app.api.v1.router import api_router
import uvicorn
import logging

# Configure uvicorn console logging format
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise Zero-Trust AI Scam & Phishing Analysis Gateway",
    version="1.1.0"
)

# Set up CORS origins for development (Vite standard ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB connection lifecycle hooks
@app.on_event("startup")
async def startup_db_client():
    logger.info("Initializing ScamShield backend services...")
    await db_manager.connect_to_db()

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Terminating ScamShield backend services...")
    await db_manager.close_db_connection()

# Include versioned master router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["status"])
async def status_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "api_version": "v1",
        "features_supported": [
            "url-entropy", "email-nlp-coercion", "job-fraud-vetting", "deepfake-biometrics",
            "chat-assistant", "screenshot-ocr-scanner", "qr-code-scanner", "voice-scam-detection"
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)