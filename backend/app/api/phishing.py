from fastapi import APIRouter
from app.services.feature_extractor import extract_features

router = APIRouter()

@router.post("/url-check")
def check_url(data: dict):

    url = data["url"]

    features = extract_features(url)

    score = min(len(url), 100)

    return {
        "url": url,
        "features": features,
        "risk_score": score,
        "status": "analyzed"
    }