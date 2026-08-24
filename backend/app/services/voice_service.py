import base64
import io
import logging
import tempfile
import os

from app.services.nlp_service import NLPService

logger = logging.getLogger("uvicorn")

try:
    import speech_recognition as sr
    from pydub import AudioSegment
    SPEECH_AVAILABLE = True
except ImportError:
    SPEECH_AVAILABLE = False
    logger.warning("speech_recognition/pydub not installed. Voice transcription will use a stub fallback.")

# Google Speech API language codes for the Indian-language toggle
LANGUAGE_CODES = {
    "en": "en-IN",
    "hi": "hi-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "kn": "kn-IN",
}


class VoiceService:
    @staticmethod
    def _to_wav(audio_bytes: bytes, filename: str) -> str:
        """Convert uploaded mp3/m4a/wav to a temp WAV file speech_recognition can read."""
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "wav"
        suffix_in = f".{ext}"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix_in) as tmp_in:
            tmp_in.write(audio_bytes)
            tmp_in_path = tmp_in.name

        wav_path = tmp_in_path + ".wav"
        audio = AudioSegment.from_file(tmp_in_path)
        audio.export(wav_path, format="wav")
        os.remove(tmp_in_path)
        return wav_path

    @classmethod
    def transcribe(cls, audio_base64: str, filename: str, language: str = "en") -> str:
        """Pipeline Step 1-2: Upload -> Speech-to-text"""
        if not SPEECH_AVAILABLE:
            return "[Speech-to-text unavailable on this server — install SpeechRecognition + pydub + ffmpeg]"

        audio_bytes = base64.b64decode(audio_base64)
        wav_path = None
        try:
            wav_path = cls._to_wav(audio_bytes, filename)
            recognizer = sr.Recognizer()
            with sr.AudioFile(wav_path) as source:
                audio_data = recognizer.record(source)
            lang_code = LANGUAGE_CODES.get(language, "en-IN")
            transcript = recognizer.recognize_google(audio_data, language=lang_code)
            return transcript
        except sr.UnknownValueError:
            return ""
        except Exception as e:
            logger.error(f"Voice transcription failed: {e}")
            return ""
        finally:
            if wav_path and os.path.exists(wav_path):
                os.remove(wav_path)

    @staticmethod
    def _highlight_sentences(transcript: str) -> list:
        """Pipeline Step 4: Highlight suspicious sentences."""
        scam_phrases = [
            "otp", "one time password", "urgent", "your account is blocked", "kyc",
            "arrest", "police", "customs", "lottery", "prize", "refund", "wire transfer",
            "gift card", "bank details", "pin number", "verify your account", "suspended"
        ]
        sentences = [s.strip() for s in transcript.replace("!", ".").split(".") if s.strip()]
        highlighted = []
        for s in sentences:
            hit = [p for p in scam_phrases if p in s.lower()]
            if hit:
                highlighted.append({"sentence": s, "flagged": True, "matched_terms": hit})
            else:
                highlighted.append({"sentence": s, "flagged": False, "matched_terms": []})
        return highlighted

    @classmethod
    async def analyze_voice(cls, audio_base64: str, filename: str, language: str = "en") -> dict:
        transcript = cls.transcribe(audio_base64, filename, language)

        if not transcript:
            return {
                "transcript": "",
                "risk_score": 50.0,
                "confidence_score": 0.4,
                "status": "completed",
                "ai_analysis": {
                    "summary": "Could not transcribe the audio clearly. Try a cleaner recording with less background noise.",
                    "indicators": ["Speech-to-text produced no usable transcript"],
                    "highlighted_sentences": []
                }
            }

        # Pipeline Step 3: NLP scam detection, reusing the existing email/message heuristics.
        nlp_result = await NLPService.analyze_email(transcript)
        highlighted = cls._highlight_sentences(transcript)

        nlp_result["transcript"] = transcript
        nlp_result["ai_analysis"]["highlighted_sentences"] = highlighted
        return nlp_result
