from fastapi import APIRouter
import logging

from app.schemas.assistant import (
    ChatRequest, ChatResponse,
    ScreenshotScanRequest,
    QRScanRequest,
    VoiceScanRequest,
)
from app.schemas.scans import ResponseEnvelope
from app.services.chat_service import ChatService
from app.services.ocr_service import OCRService
from app.services.qr_service import QRService
from app.services.voice_service import VoiceService
from app.db.repositories.threats import ThreatRepository

logger = logging.getLogger("uvicorn")
router = APIRouter()
threat_repo = ThreatRepository()


@router.post("/chat", response_model=ResponseEnvelope)
async def chat_with_assistant(payload: ChatRequest):
    """AI Chat Assistant — 'Is this message safe?', 'Can I trust this website?', 'Should I click this link?'"""
    try:
        history_dicts = [h.model_dump() for h in payload.history]
        result = await ChatService.answer(payload.message, history_dicts, payload.language)
        return ResponseEnvelope(success=True, data=result, error=None)
    except Exception as e:
        logger.error(f"Chat assistant failure: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))


@router.post("/screenshot", response_model=ResponseEnvelope)
async def scan_screenshot(payload: ScreenshotScanRequest):
    """Screenshot Scanner — WhatsApp / Email / SMS screenshot -> OCR -> NLP -> Risk Score"""
    try:
        result = await OCRService.analyze_screenshot(payload.image_base64, payload.source_hint or "unknown")

        threat_doc = {
            "threat_type": "screenshot",
            "target_identifier": (result["extracted_text"][:60] + "...") if result["extracted_text"] else "unreadable-image",
            "risk_score": result["risk_score"],
            "confidence_score": result["confidence_score"],
            "status": "completed",
            "ai_analysis": result["ai_analysis"]
        }
        await threat_repo.save_threat(threat_doc)

        return ResponseEnvelope(success=True, data=result, error=None)
    except Exception as e:
        logger.error(f"Screenshot scan failure: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))


@router.post("/qr", response_model=ResponseEnvelope)
async def scan_qr(payload: QRScanRequest):
    """QR Code Scanner — detects malicious URLs, phishing links, and fake payment QR codes."""
    try:
        result = await QRService.analyze_qr(payload.image_base64)

        threat_doc = {
            "threat_type": "qr",
            "target_identifier": result["decoded_url"] or "unreadable-qr",
            "risk_score": result["risk_score"],
            "confidence_score": result["confidence_score"],
            "status": "completed",
            "ai_analysis": result["ai_analysis"]
        }
        await threat_repo.save_threat(threat_doc)

        return ResponseEnvelope(success=True, data=result, error=None)
    except Exception as e:
        logger.error(f"QR scan failure: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))


@router.post("/voice", response_model=ResponseEnvelope)
async def scan_voice(payload: VoiceScanRequest):
    """Voice Scam Detection — Upload -> Speech-to-text -> NLP -> Detect scam -> Highlight suspicious sentences"""
    try:
        result = await VoiceService.analyze_voice(payload.audio_base64, payload.filename, payload.language)

        threat_doc = {
            "threat_type": "voice",
            "target_identifier": payload.filename,
            "risk_score": result["risk_score"],
            "confidence_score": result["confidence_score"],
            "status": "completed",
            "ai_analysis": result["ai_analysis"]
        }
        await threat_repo.save_threat(threat_doc)

        return ResponseEnvelope(success=True, data=result, error=None)
    except Exception as e:
        logger.error(f"Voice scan failure: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))
