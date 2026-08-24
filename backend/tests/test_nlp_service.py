import pytest
from app.services.nlp_service import NLPService

@pytest.mark.asyncio
async def test_analyze_email_safe():
    email_text = "Hi team, please find attached the monthly project progress presentation slides for review. Thanks."
    result = await NLPService.analyze_email(email_text)
    
    assert result["status"] == "completed"
    assert result["risk_score"] <= 30
    assert "No critical scam keywords found" in result["ai_analysis"]["indicators"]
    assert "Regular correspondence diction verified." in result["ai_analysis"]["summary"]

@pytest.mark.asyncio
async def test_analyze_email_coercion_scam():
    email_text = "URGENT: Please execute a wire transfer of $45,000 immediately to invoice #49281. CEO authorization verified."
    result = await NLPService.analyze_email(email_text)
    
    assert result["status"] == "completed"
    assert result["risk_score"] > 60
    assert any("urgent" in ind.lower() or "time-pressure" in ind.lower() for ind in result["ai_analysis"]["indicators"])
    assert any("wire" in ind.lower() or "transaction" in ind.lower() for ind in result["ai_analysis"]["indicators"])
    assert "Do NOT click attachments or execute transactional modifications" in result["ai_analysis"]["suggested_action"]

@pytest.mark.asyncio
async def test_analyze_job_safe():
    job_text = "We are seeking a Senior Full-Stack Engineer with 5+ years of experience in React and Node.js. Position is full-time in San Francisco."
    result = await NLPService.analyze_job(job_text)
    
    assert result["status"] == "completed"
    assert result["risk_score"] < 40
    assert "Meets standard recruiting norms" in result["ai_analysis"]["indicators"]

@pytest.mark.asyncio
async def test_analyze_job_scam():
    job_text = "Work from home! Unlimited income potential, no experience required. Candidates must pay an upfront $50 training fee. Interviews on Telegram."
    result = await NLPService.analyze_job(job_text)
    
    assert result["status"] == "completed"
    assert result["risk_score"] > 60
    assert any("fee" in ind.lower() or "payment" in ind.lower() for ind in result["ai_analysis"]["indicators"])
    assert any("telegram" in ind.lower() or "chat" in ind.lower() for ind in result["ai_analysis"]["indicators"])
