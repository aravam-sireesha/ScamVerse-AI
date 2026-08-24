import base64
import io
import logging

from PIL import Image
from app.services.nlp_service import NLPService

logger = logging.getLogger("uvicorn")

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract not installed. Screenshot OCR will use a stub fallback.")


class OCRService:
    @staticmethod
    def _decode_image(image_base64: str) -> Image.Image:
        # Strip a data:image/...;base64, prefix if the frontend sent one
        if "," in image_base64 and image_base64.strip().startswith("data:"):
            image_base64 = image_base64.split(",", 1)[1]
        raw = base64.b64decode(image_base64)
        return Image.open(io.BytesIO(raw)).convert("RGB")

    @classmethod
    def extract_text(cls, image_base64: str) -> str:
        """Image -> OCR -> raw text. This is Step 1 of the pipeline:
        Image -> OCR -> Extract text -> LLM/NLP Analysis -> Risk Score
        """
        image = cls._decode_image(image_base64)

        if not TESSERACT_AVAILABLE:
            # Fallback so the endpoint still works without the system tesseract binary installed.
            return "[OCR unavailable on this server — install tesseract-ocr + pytesseract]"

        try:
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return ""

    @classmethod
    async def analyze_screenshot(cls, image_base64: str, source_hint: str = "unknown") -> dict:
        extracted_text = cls.extract_text(image_base64)

        if not extracted_text:
            return {
                "extracted_text": "",
                "risk_score": 50.0,
                "confidence_score": 0.4,
                "status": "completed",
                "ai_analysis": {
                    "summary": "No readable text found in the screenshot. Try a clearer, higher-resolution image.",
                    "indicators": ["OCR could not extract text"],
                    "suggested_action": "Re-upload a sharper screenshot for accurate scoring."
                }
            }

        # Reuse the same NLP scam-detection heuristics used for pasted email/SMS text.
        result = await NLPService.analyze_email(extracted_text)
        result["extracted_text"] = extracted_text
        result["ai_analysis"]["summary"] = (
            f"[Source: {source_hint}] " + result["ai_analysis"]["summary"]
        )
        return result
