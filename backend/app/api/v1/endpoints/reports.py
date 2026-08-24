from fastapi import APIRouter, HTTPException
from app.schemas.scans import ResponseEnvelope
from app.db.repositories.threats import ThreatRepository
import logging

logger = logging.getLogger("uvicorn")
router = APIRouter()
threat_repo = ThreatRepository()

@router.get("", response_model=ResponseEnvelope)
async def list_reports():
    try:
        reports = await threat_repo.get_reports()
        if not reports:
            # Seed mock reports if database is fresh
            reports = [
                {
                    "id": "REP-9001",
                    "title": "BEC Attack Campaign Targeting Accounts Payable",
                    "created_at": "2026-06-23T12:00:00Z",
                    "severity": "high",
                    "assigned_analyst": "sec_admin",
                    "summary": "Campaign of multiple phishing emails attempting to direct wire transfers to offshore shell accounts. Intercepted via stylistic pattern detection.",
                    "findings_count": 3
                },
                {
                    "id": "REP-9002",
                    "title": "Cloned Bank Domain Phishing Campaign",
                    "created_at": "2026-06-23T08:30:00Z",
                    "severity": "critical",
                    "assigned_analyst": "sec_admin",
                    "summary": "Active phishing portal hosted on Bulletproof server matching homograph variants of standard financial portals. Blocked 45 client visits.",
                    "findings_count": 12
                },
                {
                    "id": "REP-9003",
                    "title": "C-Suite Synthetic Audio Impersonation",
                    "created_at": "2026-06-22T19:00:00Z",
                    "severity": "critical",
                    "assigned_analyst": "sec_admin",
                    "summary": "Deepfake voice clone of CFO sent via voicemail. Extracted pitch fluctuation anomalies matching generative neural synthesizer.",
                    "findings_count": 1
                }
            ]
        return ResponseEnvelope(success=True, data=reports, error=None)
    except Exception as e:
        logger.error(f"Failed to query reports: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))

@router.get("/{report_id}", response_model=ResponseEnvelope)
async def get_report(report_id: str):
    try:
        report = await threat_repo.get_report_by_id(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Incident report not found")
        return ResponseEnvelope(success=True, data=report, error=None)
    except Exception as e:
        logger.error(f"Failed to query report {report_id}: {e}")
        return ResponseEnvelope(success=False, data=None, error=str(e))
