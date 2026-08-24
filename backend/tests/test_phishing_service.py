import pytest
from app.services.phishing_service import PhishingService

def test_analyze_url_safe():
    url = "https://google.com"
    result = PhishingService.analyze_url(url)
    
    assert result["url"] == url
    assert result["status"] == "completed"
    assert result["risk_score"] < 35
    assert "Standard SSL Verified" in result["ai_analysis"]["indicators"]
    assert "Clean domain authority" in result["ai_analysis"]["indicators"]
    assert result["ai_analysis"]["shap_values"]["ssl_security_layer"] == -0.25

def test_analyze_url_phishing_critical():
    # Suspicious domain, no https, long domain
    url = "http://chase-bank-verify-security-login-update-account.net"
    result = PhishingService.analyze_url(url)
    
    assert result["url"] == url
    assert result["risk_score"] > 70
    assert "Target keywords matched" in result["ai_analysis"]["indicators"]
    assert "Missing verified SSL" in result["ai_analysis"]["indicators"]
    assert result["ai_analysis"]["shap_values"]["ssl_security_layer"] == 0.3
    assert result["ai_analysis"]["shap_values"]["suspicious_keyword_match"] == 0.45
