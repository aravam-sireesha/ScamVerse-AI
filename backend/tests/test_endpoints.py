import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_status_check():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "url-entropy" in data["features_supported"]

def test_scan_url_endpoint():
    payload = {"url": "https://google.com"}
    response = client.post("/api/v1/scan/url", json=payload)
    assert response.status_code == 200
    res_envelope = response.json()
    assert res_envelope["success"] is True
    assert res_envelope["data"]["url"] == payload["url"]
    assert "risk_score" in res_envelope["data"]

def test_scan_email_endpoint():
    payload = {"email_text": "Hello, this is a standard project update email check."}
    response = client.post("/api/v1/scan/email", json=payload)
    assert response.status_code == 200
    res_envelope = response.json()
    assert res_envelope["success"] is True
    assert "risk_score" in res_envelope["data"]

def test_scan_job_endpoint():
    payload = {"job_text": "Hiring a security architect with extensive experience in cloud architecture."}
    response = client.post("/api/v1/scan/job", json=payload)
    assert response.status_code == 200
    res_envelope = response.json()
    assert res_envelope["success"] is True
    assert "risk_score" in res_envelope["data"]

def test_scan_deepfake_endpoint():
    payload = {
        "filename": "fake_cfo_voice.mp3",
        "file_type": "audio",
        "file_size": 14000
    }
    response = client.post("/api/v1/scan/deepfake", json=payload)
    assert response.status_code == 200
    res_envelope = response.json()
    assert res_envelope["success"] is True
    assert "risk_score" in res_envelope["data"]

def test_threat_intel_metrics_endpoint():
    response = client.get("/api/v1/threat-intel/metrics")
    assert response.status_code == 200
    res_envelope = response.json()
    assert res_envelope["success"] is True
    assert "totalScans" in res_envelope["data"]
    assert "weeklyTrend" in res_envelope["data"]

def test_threat_intel_feed_endpoint():
    response = client.get("/api/v1/threat-intel/feed")
    assert response.status_code == 200
    res_envelope = response.json()
    assert res_envelope["success"] is True
    assert isinstance(res_envelope["data"], list)

def test_reports_endpoint():
    response = client.get("/api/v1/reports")
    assert response.status_code == 200
    res_envelope = response.json()
    assert res_envelope["success"] is True
    assert len(res_envelope["data"]) >= 3
    assert res_envelope["data"][0]["id"] == "REP-9001"

def test_get_report_by_id_seeded():
    response = client.get("/api/v1/reports/REP-9001")
    assert response.status_code == 200
    res_envelope = response.json()
    assert res_envelope["success"] is True
    assert res_envelope["data"]["id"] == "REP-9001"
    assert "BEC Attack Campaign" in res_envelope["data"]["title"]

def test_get_report_by_id_not_found():
    response = client.get("/api/v1/reports/REP-9999")
    assert response.status_code == 200
    res_envelope = response.json()
    assert res_envelope["success"] is False
    assert "not found" in res_envelope["error"].lower()
