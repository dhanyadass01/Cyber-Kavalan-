from pydantic import BaseModel
from typing import List, Optional

class URLAnalysisRequest(BaseModel):
    url: str

class MessageAnalysisRequest(BaseModel):
    message: str

class FlagExplanation(BaseModel):
    flag: str
    severity: str
    why: str

class AnalysisResponse(BaseModel):
    score: int
    type: str # 'safe', 'warning', 'danger'
    title: str
    subtitle: str
    rating_reason: str
    flags: List[str]
    indicators: List[FlagExplanation]

class ScamReport(BaseModel):
    type: str
    description: str
    district: str
    ref_id: Optional[str] = None
    timestamp: Optional[str] = None

class DistrictThreat(BaseModel):
    name: str
    level: str
    reports: int
    lat: float
    lng: float


class UserLoginRequest(BaseModel):
    name: str
    email: str


class UserRegisterRequest(BaseModel):
    name: str
    email: str


class AdminLoginRequest(BaseModel):
    password: str


class AdminRegisterRequest(BaseModel):
    name: str
    email: str


class AdminReportFilterRequest(BaseModel):
    scam_type: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class ReportStatusUpdateRequest(BaseModel):
    status: str
    severity: Optional[str] = None


class ThreatAnalyzeRequest(BaseModel):
    input_text: str
    input_type: str


class ScamSourceCreateRequest(BaseModel):
    source_type: str
    source_value: str
    status: str = "under_investigation"
    severity: str = "medium"
    blocked: bool = False
    notes: Optional[str] = ""


class ScamSourceUpdateRequest(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    blocked: Optional[bool] = None
    notes: Optional[str] = None


class ScamAlertCreateRequest(BaseModel):
    title: str
    message: str
    trend_type: str
    severity: str = "high"


class ProtectionCheckRequest(BaseModel):
    source_value: str
