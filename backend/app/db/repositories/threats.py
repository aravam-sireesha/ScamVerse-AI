from bson import ObjectId
from app.db.mongodb import get_database
from datetime import datetime
from typing import List, Dict, Any

class ThreatRepository:
    def __init__(self):
        # We fetch db lazily so that it is initialized after startup event
        pass

    @property
    def _threat_collection(self):
        db = get_database()
        return db["threat_detections"] if db is not None else None

    @property
    def _reports_collection(self):
        db = get_database()
        return db["investigation_reports"] if db is not None else None

    async def save_threat(self, threat_data: Dict[str, Any]) -> str:
        if self._threat_collection is None:
            return "mock-id-fallback"
        
        threat_data["created_at"] = datetime.utcnow()
        threat_data["updated_at"] = datetime.utcnow()
        result = await self._threat_collection.insert_one(threat_data)
        return str(result.inserted_id)

    async def get_threat_by_target(self, target: str) -> Dict[str, Any]:
        if self._threat_collection is None:
            return None
        return await self._threat_collection.find_one({"target_identifier": target})

    async def get_recent_threats(self, limit: int = 50) -> List[Dict[str, Any]]:
        if self._threat_collection is None:
            return []
        cursor = self._threat_collection.find().sort("created_at", -1).limit(limit)
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    async def save_report(self, report_data: Dict[str, Any]) -> str:
        if self._reports_collection is None:
            return "mock-rep-id-fallback"
        report_data["created_at"] = datetime.utcnow()
        result = await self._reports_collection.insert_one(report_data)
        return str(result.inserted_id)

    async def get_reports(self) -> List[Dict[str, Any]]:
        if self._reports_collection is None:
            return []
        cursor = self._reports_collection.find().sort("created_at", -1)
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results

    async def get_report_by_id(self, report_id: str) -> Dict[str, Any]:
        mock_reports = [
            {
                "id": "REP-9001",
                "title": "BEC Attack Campaign Targeting Accounts Payable",
                "created_at": "2026-06-23T12:00:00Z",
                "severity": "high",
                "assigned_analyst": "sec_admin",
                "summary": "Campaign of multiple phishing emails attempting to direct wire transfers to offshore shell accounts. Intercepted via stylistic pattern detection.",
                "findings_count": 3
            },
            {
                "id": "REP-9002",
                "title": "Cloned Bank Domain Phishing Campaign",
                "created_at": "2026-06-23T08:30:00Z",
                "severity": "critical",
                "assigned_analyst": "sec_admin",
                "summary": "Active phishing portal hosted on Bulletproof server matching homograph variants of standard financial portals. Blocked 45 client visits.",
                "findings_count": 12
            },
            {
                "id": "REP-9003",
                "title": "C-Suite Synthetic Audio Impersonation",
                "created_at": "2026-06-22T19:00:00Z",
                "severity": "critical",
                "assigned_analyst": "sec_admin",
                "summary": "Deepfake voice clone of CFO sent via voicemail. Extracted pitch fluctuation anomalies matching generative neural synthesizer.",
                "findings_count": 1
            }
        ]
        
        # Check mock list first if it starts with REP-
        if report_id.startswith("REP-"):
            for r in mock_reports:
                if r["id"] == report_id:
                    return r

        if self._reports_collection is None:
            return None

        try:
            if ObjectId.is_valid(report_id):
                doc = await self._reports_collection.find_one({"_id": ObjectId(report_id)})
                if doc:
                    doc["_id"] = str(doc["_id"])
                    return doc
            else:
                doc = await self._reports_collection.find_one({"id": report_id})
                if doc:
                    doc["_id"] = str(doc["_id"])
                    return doc
        except Exception:
            pass
            
        return None

    # MongoDB Aggregation Pipeline for Executive Analytics
    async def get_aggregated_metrics(self) -> Dict[str, Any]:
        if self._threat_collection is None:
            # Fallback mock calculations if MongoDB is not active
            return {
                "total_scans": 1420,
                "threats_blocked": 341,
                "safe_processed": 1079
            }

        pipeline = [
            {
                "$facet": {
                    "total_counts": [
                        { "$group": { "_id": None, "count": { "$sum": 1 } } }
                    ],
                    "blocked_counts": [
                        { "$match": { "risk_score": { "$gt": 50 } } },
                        { "$group": { "_id": None, "count": { "$sum": 1 } } }
                    ],
                    "distribution": [
                        { "$group": { "_id": "$threat_type", "value": { "$sum": 1 } } }
                    ]
                }
            }
        ]

        cursor = self._threat_collection.aggregate(pipeline)
        async for result in cursor:
            total = result["total_counts"][0]["count"] if result["total_counts"] else 0
            blocked = result["blocked_counts"][0]["count"] if result["blocked_counts"] else 0
            safe = total - blocked
            dist = [{ "name": d["_id"], "value": d["value"] } for d in result["distribution"]]
            
            return {
                "total_scans": total,
                "threats_blocked": blocked,
                "safe_processed": safe,
                "distribution": dist
            }
        
        return {
            "total_scans": 0,
            "threats_blocked": 0,
            "safe_processed": 0
        }
