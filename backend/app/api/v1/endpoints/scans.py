from fastapi import APIRouter, HTTPException, Depends
from app.schemas.scans import (
    URLScanRequest, 
    EmailScanRequest, 
    JobScanRequest, 
    DeepfakeScanRequest, 
    ResponseEnvelope
)
from app.services.phishing_service import PhishingService
from app.services.nlp_service import NLPService
from app.services.deepfake_service import DeepfakeService
from app.db.repositories.threats import ThreatRepository
import logging

logger = logging.getLogger("uvicorn")
router = APIRouter()
threat_repo = ThreatRepository()

@router.post("/url", response_model=ResponseEnvelope)
async def scan_url(payload: URLScanRequest):
    try:
        # Perform phishing check
        result = PhishingService.analyze_url(payload.url)
        
        # Save threat history to Mongo async repository
        threat_doc = {
            "threat_type": "url",
            "target_identifier": payload.url,
            "risk_score": result["risk_score"],
            "confidence_score": result["confidence_score"],
            "status": "completed",
            "ai_analysis": result["ai_analysis"]
        }
        await threat_repo.save_threat(threat_doc)
        
        return ResponseEnvelope(success=True, data=result, error=None)
    except Exception as e:
        logger.error(f"URL scan endpoint failure: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))

@router.post("/email", response_model=ResponseEnvelope)
async def scan_email(payload: EmailScanRequest):
    try:
        result = await NLPService.analyze_email(payload.email_text)
        
        threat_doc = {
            "threat_type": "email",
            "target_identifier": payload.email_text[:60] + "...",
            "risk_score": result["risk_score"],
            "confidence_score": result["confidence_score"],
            "status": "completed",
            "ai_analysis": result["ai_analysis"]
        }
        await threat_repo.save_threat(threat_doc)
        
        return ResponseEnvelope(success=True, data=result, error=None)
    except Exception as e:
        logger.error(f"Email scan endpoint failure: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))

@router.post("/job", response_model=ResponseEnvelope)
async def scan_job(payload: JobScanRequest):
    try:
        result = await NLPService.analyze_job(payload.job_text)
        
        threat_doc = {
            "threat_type": "job",
            "target_identifier": payload.job_text[:60] + "...",
            "risk_score": result["risk_score"],
            "confidence_score": result["confidence_score"],
            "status": "completed",
            "ai_analysis": result["ai_analysis"]
        }
        await threat_repo.save_threat(threat_doc)
        
        return ResponseEnvelope(success=True, data=result, error=None)
    except Exception as e:
        logger.error(f"Job scan endpoint failure: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))

@router.post("/deepfake", response_model=ResponseEnvelope)
async def scan_deepfake(payload: DeepfakeScanRequest):
    try:
        result = DeepfakeService.analyze_media(payload.filename, payload.file_type, payload.file_size)
        
        threat_doc = {
            "threat_type": "deepfake",
            "target_identifier": payload.filename,
            "risk_score": result["risk_score"],
            "confidence_score": result["confidence_score"],
            "status": "completed",
            "ai_analysis": result["ai_analysis"]
        }
        await threat_repo.save_threat(threat_doc)
        
        return ResponseEnvelope(success=True, data=result, error=None)
    except Exception as e:
        logger.error(f"Deepfake scan endpoint failure: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))
