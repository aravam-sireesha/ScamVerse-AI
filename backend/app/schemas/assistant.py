from pydantic import BaseModel, Field
from typing import List, Optional, Literal


# ---------- 1. AI Chat Assistant ----------
class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's question, e.g. 'Is this message safe?'", min_length=1)
    history: List[ChatMessage] = Field(default_factory=list, description="Prior turns, oldest first, for memory")
    language: str = Field(default="en", description="ISO code: en, hi, ta, te, kn ...")


class ChatResponse(BaseModel):
    reply: str
    risk_score: Optional[float] = None
    indicators: List[str] = Field(default_factory=list)
    suggested_action: Optional[str] = None


# ---------- 2. Screenshot Scanner (WhatsApp / Email / SMS) ----------
class ScreenshotScanRequest(BaseModel):
    image_base64: str = Field(..., description="Base64-encoded screenshot image (no data: prefix required)")
    source_hint: Optional[str] = Field(default=None, description="whatsapp | email | sms | unknown")


class ScreenshotScanResponse(BaseModel):
    extracted_text: str
    risk_score: float
    confidence_score: float
    status: str
    ai_analysis: dict


# ---------- 3. QR Code Scanner ----------
class QRScanRequest(BaseModel):
    image_base64: str = Field(..., description="Base64-encoded QR code image")


class QRScanResponse(BaseModel):
    decoded_url: Optional[str] = None
    qr_type: str  # payment | url | text | unreadable
    risk_score: float
    confidence_score: float
    status: str
    ai_analysis: dict


# ---------- 4. Voice Scam Detection ----------
class VoiceScanRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64-encoded audio file (mp3/wav/m4a)")
    filename: str = Field(..., description="Original filename, used to infer format")
    language: str = Field(default="en", description="Spoken language hint for speech-to-text")


class VoiceScanResponse(BaseModel):
    transcript: str
    risk_score: float
    confidence_score: float
    status: str
    ai_analysis: dict
