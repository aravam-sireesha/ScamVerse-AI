from pydantic import BaseModel, Field, HttpUrl
from typing import Dict, Any, List, Optional
from datetime import datetime

# Input Schemas
class URLScanRequest(BaseModel):
    url: str = Field(..., description="The target URL or domain to evaluate", min_length=4)

class EmailScanRequest(BaseModel):
    email_text: str = Field(..., description="The raw contents or SMTP payload of the email to scan", min_length=10)

class JobScanRequest(BaseModel):
    job_text: str = Field(..., description="The job posting description text to verify", min_length=15)

class DeepfakeScanRequest(BaseModel):
    filename: str = Field(..., description="Uploaded media file name")
    file_type: str = Field(..., description="File type classification (audio | video)")
    file_size: int = Field(..., description="Size of the file in bytes")

# Output Schemas
class AIAnalysisResponse(BaseModel):
    summary: str
    indicators: List[str]
    shap_values: Optional[Dict[str, float]] = None
    suggested_action: Optional[str] = None

class ScanResponse(BaseModel):
    url: Optional[str] = None
    filename: Optional[str] = None
    risk_score: float
    confidence_score: float
    status: str
    ai_analysis: AIAnalysisResponse

# Standard Response Envelope
class ResponseEnvelope(BaseModel):
    success: bool = True
    data: Any
    error: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
