import pytest
from app.services.deepfake_service import DeepfakeService

def test_analyze_media_audio_safe():
    filename = "weekly_update_project.mp3"
    result = DeepfakeService.analyze_media(filename, "audio", 204859) # Size not divisible by 7
    
    assert result["filename"] == filename
    assert result["status"] == "completed"
    assert result["risk_score"] < 50
    assert "Organic voice signature verified" in result["ai_analysis"]["summary"]
    assert result["ai_analysis"]["spectral_anomalies"] == "None detected."

def test_analyze_media_audio_suspicious():
    filename = "cfo_urgent_wire_voice.wav"
    result = DeepfakeService.analyze_media(filename, "audio", 70000) # Size divisible by 7, suspicious CEO/CFO words
    
    assert result["filename"] == filename
    assert result["risk_score"] > 50
    assert "Synthetic voice replication" in result["ai_analysis"]["summary"]
    assert "ElevenLabs" in result["ai_analysis"]["spectral_anomalies"]

def test_analyze_media_video_safe():
    filename = "team_meeting_recap.mp4"
    result = DeepfakeService.analyze_media(filename, "video", 1048591)
    
    assert result["filename"] == filename
    assert result["risk_score"] < 50
    assert "Organic camera video capture" in result["ai_analysis"]["summary"]

def test_analyze_media_video_suspicious():
    filename = "president_announcement_fake.mp4"
    result = DeepfakeService.analyze_media(filename, "video", 70007) # divisible by 7 and suspicious name
    
    assert result["filename"] == filename
    assert result["risk_score"] > 50
    assert "Neural video face mesh manipulation" in result["ai_analysis"]["summary"]
