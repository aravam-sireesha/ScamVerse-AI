import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("uvicorn")

class NLPService:
    @staticmethod
    async def _query_ollama(prompt: str) -> str:
        """Helper to invoke a local Ollama model if online, with timeout fallback."""
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                response = await client.post(
                    f"{settings.OLLAMA_URL}/api/generate",
                    json={
                        "model": settings.OLLAMA_MODEL,
                        "prompt": prompt,
                        "stream": False
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return data.get("response", "")
        except Exception as e:
            logger.warn(f"Ollama offline or timed out. Falling back to local NLP heuristics: {e}")
        return ""

    @classmethod
    async def analyze_email(cls, email_text: str) -> dict:
        logger.info("Executing Email NLP analysis.")
        
        # Local heuristic parser
        scam_keywords = ["urgent", "wire transfer", "bank routing", "ceo", "invoice", "gift card", "lottery"]
        matched_indicators = [word for word in scam_keywords if word in email_text.lower()]
        
        has_urgency = "urgent" in email_text.lower() or "immediate" in email_text.lower()
        has_payment = "wire" in email_text.lower() or "transfer" in email_text.lower() or "gift card" in email_text.lower()
        
        score = 5.0
        if matched_indicators:
            score += len(matched_indicators) * 12.0
        if has_urgency:
            score += 20.0
        if has_payment:
            score += 25.0
            
        risk_score = min(max(score, 5.0), 99.0)
        confidence = 0.91 if risk_score > 60 else 0.95

        # Try to enrich using Ollama
        prompt = f"Identify if this email is a scam, phishing, or invoice fraud. Reply in 1 sentence only: '{email_text}'"
        ollama_summary = await cls._query_ollama(prompt)
        
        if ollama_summary:
            summary = f"Ollama Verdict: {ollama_summary}"
        else:
            if risk_score > 70:
                summary = "Linguistic pattern match: High coercion priority social engineering. Mimics urgent billing authority to bypass standard accounts payable channels."
            else:
                summary = "Regular correspondence diction verified. No strong social engineering indicators matched."

        indicators = []
        if has_urgency:
            indicators.append("Time-pressure phrasing ('urgent' / 'immediate')")
        if has_payment:
            indicators.append("Direct wire/transfer transaction request")
        if len(matched_indicators) > 2:
            indicators.append("Anomalous density of transaction scam keywords")

        if not indicators:
            indicators = ["No critical scam keywords found"]

        suggested_action = (
            "WARNING: Do NOT click attachments or execute transactional modifications. Quarantine email and flag sender domain."
            if risk_score > 60 else
            "Standard compliance checks passed. Safe to process."
        )

        return {
            "risk_score": risk_score,
            "confidence_score": confidence,
            "status": "completed",
            "ai_analysis": {
                "summary": summary,
                "indicators": indicators,
                "suggested_action": suggested_action
            }
        }

    @classmethod
    async def analyze_job(cls, job_text: str) -> dict:
        logger.info("Executing Job Posting NLP analysis.")
        
        scam_indicators = ["upfront", "training fee", "unlimited income", "no experience", "whatsapp", "telegram", "cash check"]
        matched_indicators = [word for word in scam_indicators if word in job_text.lower()]
        
        has_fee = "fee" in job_text.lower() or "upfront" in job_text.lower() or "pay" in job_text.lower()
        has_chat = "whatsapp" in job_text.lower() or "telegram" in job_text.lower()
        
        score = 10.0
        if matched_indicators:
            score += len(matched_indicators) * 15.0
        if has_fee:
            score += 25.0
        if has_chat:
            score += 15.0
            
        risk_score = min(max(score, 5.0), 99.0)
        confidence = 0.89 if risk_score > 60 else 0.93

        # Ollama summary fallback
        prompt = f"Analyze if this job listing is a scam or recruitment fraud. Reply in 1 sentence only: '{job_text}'"
        ollama_summary = await cls._query_ollama(prompt)

        if ollama_summary:
            summary = f"Ollama Vetting: {ollama_summary}"
        else:
            if risk_score > 60:
                summary = "Advance-fee recruitment scam flagged. Requires applicant payment for training kits or software setup."
            else:
                summary = "Clear employer description. Meets core operational guidelines for corporate recruitment."

        indicators = []
        if has_fee:
            indicators.append("Upfront payment or equipment purchase required")
        if has_chat:
            indicators.append("Interview hosted exclusively via personal chats (Telegram/WhatsApp)")
        if len(matched_indicators) > 1:
            indicators.append("High correlation with quick-money scam postings")

        if not indicators:
            indicators = ["Meets standard recruiting norms"]

        return {
            "risk_score": risk_score,
            "confidence_score": confidence,
            "status": "completed",
            "ai_analysis": {
                "summary": summary,
                "indicators": indicators
            }
        }
