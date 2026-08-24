import base64
import io
import logging

import numpy as np
from PIL import Image
from app.services.phishing_service import PhishingService

logger = logging.getLogger("uvicorn")

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    logger.warning("opencv-python not installed. QR decoding will use a stub fallback.")

# Common fake-payment / UPI-fraud keyword signals seen in QR-code scams (India-focused)
PAYMENT_KEYWORDS = ["upi://", "pay?", "paytm", "gpay", "phonepe", "bhim", "amount=", "am="]


class QRService:
    @staticmethod
    def _decode_image(image_base64: str) -> np.ndarray:
        if "," in image_base64 and image_base64.strip().startswith("data:"):
            image_base64 = image_base64.split(",", 1)[1]
        raw = base64.b64decode(image_base64)
        pil_img = Image.open(io.BytesIO(raw)).convert("RGB")
        return np.array(pil_img)

    @classmethod
    def decode_qr(cls, image_base64: str) -> str:
        if not OPENCV_AVAILABLE:
            return ""
        img = cls._decode_image(image_base64)
        detector = cv2.QRCodeDetector()
        data, points, _ = detector.detectAndDecode(img)
        return data or ""

    @classmethod
    async def analyze_qr(cls, image_base64: str) -> dict:
        decoded = cls.decode_qr(image_base64)

        if not decoded:
            return {
                "decoded_url": None,
                "qr_type": "unreadable",
                "risk_score": 55.0,
                "confidence_score": 0.5,
                "status": "completed",
                "ai_analysis": {
                    "summary": "Could not decode this QR code. It may be damaged, low-resolution, or intentionally obfuscated.",
                    "indicators": ["QR decode failed"],
                    "suggested_action": "Do not scan this code with your payment app. Ask the sender for a verified link instead."
                }
            }

        is_payment = any(k in decoded.lower() for k in PAYMENT_KEYWORDS)
        qr_type = "payment" if is_payment else ("url" if decoded.lower().startswith("http") else "text")

        if qr_type in ("url", "payment"):
            url_for_check = decoded if decoded.lower().startswith("http") else f"https://{decoded}"
            phishing_result = PhishingService.analyze_url(url_for_check)
            risk_score = phishing_result["risk_score"]
            confidence = phishing_result["confidence_score"]
            indicators = list(phishing_result["ai_analysis"]["indicators"])
            summary = phishing_result["ai_analysis"]["summary"]
        else:
            risk_score, confidence = 15.0, 0.7
            indicators = ["Plain text payload, no URL or payment intent detected"]
            summary = "QR code contains plain text with no obvious scam pattern."

        if is_payment:
            risk_score = min(risk_score + 10.0, 99.0)
            indicators.append("Encodes a UPI/payment deep link — verify payee name before confirming payment")

        suggested_action = (
            "Do NOT complete this payment or open this link. Verify with the merchant directly."
            if risk_score > 60 else
            "Looks fine, but always confirm the payee name shown in your app before paying."
        )

        return {
            "decoded_url": decoded,
            "qr_type": qr_type,
            "risk_score": risk_score,
            "confidence_score": confidence,
            "status": "completed",
            "ai_analysis": {
                "summary": summary,
                "indicators": indicators,
                "suggested_action": suggested_action
            }
        }
