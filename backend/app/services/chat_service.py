import logging
from typing import List
from app.services.nlp_service import NLPService
from app.services.phishing_service import PhishingService

logger = logging.getLogger("uvicorn")

# Basic localized fallback strings so the assistant still responds
# in the user's language when Ollama is offline.
FALLBACK_GREETING = {
    "en": "I can help you check if a message, link, or call is a scam. Paste the text or link and ask away.",
    "hi": "मैं आपको यह जांचने में मदद कर सकता हूं कि कोई संदेश, लिंक या कॉल धोखाधड़ी है या नहीं। पाठ या लिंक भेजें।",
    "ta": "ஒரு செய்தி, இணைப்பு அல்லது அழைப்பு மோசடியா என்பதை சரிபார்க்க நான் உதவ முடியும். உரையை அனுப்பவும்.",
    "te": "ఒక సందేశం, లింక్ లేదా కాల్ మోసమా అని తనిఖీ చేయడంలో నేను సహాయపడగలను. వచనం పంపండి.",
    "kn": "ಸಂದೇಶ, ಲಿಂಕ್ ಅಥವಾ ಕರೆ ವಂಚನೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಪಠ್ಯವನ್ನು ಕಳುಹಿಸಿ.",
}


class ChatService:
    @staticmethod
    def _looks_like_url(text: str) -> bool:
        t = text.lower()
        return t.startswith("http://") or t.startswith("https://") or ("." in t and " " not in t.strip())

    @classmethod
    async def answer(cls, message: str, history: List[dict], language: str = "en") -> dict:
        logger.info("Chat assistant handling a new message.")
        text = message.strip()

        # Route to the right existing detector so answers are backed by real scoring,
        # instead of the LLM guessing without evidence.
        if cls._looks_like_url(text):
            result = PhishingService.analyze_url(text if text.startswith("http") else f"https://{text}")
            risk = result["risk_score"]
            indicators = result["ai_analysis"]["indicators"]
            suggested_action = "Do not click or enter credentials." if risk > 60 else "Looks safe, but always double check the sender."
        else:
            result = await NLPService.analyze_email(text)
            risk = result["risk_score"]
            indicators = result["ai_analysis"]["indicators"]
            suggested_action = result["ai_analysis"].get("suggested_action")

        # Build a short conversational reply, optionally enriched by Ollama with
        # the running chat history so follow-up questions stay in context.
        history_prompt = "\n".join(f"{h['role']}: {h['content']}" for h in history[-6:])
        prompt = (
            f"You are a scam-detection assistant. Conversation so far:\n{history_prompt}\n"
            f"User just sent: '{text}'\n"
            f"Our detector scored this {risk:.0f}/100 risk with indicators: {indicators}.\n"
            f"Reply in {language} language, in 2-3 short sentences, plain and reassuring but honest."
        )
        ollama_reply = await NLPService._query_ollama(prompt)

        if ollama_reply:
            reply = ollama_reply
        else:
            if risk > 60:
                reply = f"⚠️ This looks risky ({risk:.0f}/100). {suggested_action or ''}"
            else:
                reply = f"✅ This looks reasonably safe ({risk:.0f}/100), but stay cautious with personal or financial details."
            if language in FALLBACK_GREETING and not history:
                reply = f"{FALLBACK_GREETING[language]}\n\n{reply}"

        return {
            "reply": reply,
            "risk_score": risk,
            "indicators": indicators,
            "suggested_action": suggested_action,
        }
