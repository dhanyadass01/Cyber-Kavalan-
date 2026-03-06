import random
import time
import re
import os
import hmac
from fastapi import FastAPI, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from models import (
    URLAnalysisRequest,
    MessageAnalysisRequest,
    AnalysisResponse,
    FlagExplanation,
    ScamReport,
    DistrictThreat,
    UserLoginRequest,
    UserRegisterRequest,
    AdminLoginRequest,
    AdminRegisterRequest,
    AdminReportFilterRequest,
    ReportStatusUpdateRequest,
    ThreatAnalyzeRequest,
    ScamSourceCreateRequest,
    ScamSourceUpdateRequest,
    ScamAlertCreateRequest,
    ProtectionCheckRequest,
)
import database

app = FastAPI(title="Cyber Kavalan Backend")

ADMIN_PORTAL_PASSWORD = os.getenv("ADMIN_PORTAL_PASSWORD", "ccpmds@4")
ADMIN_DEFAULT_NAME = "Admin"
ADMIN_DEFAULT_EMAIL = "admin@cyberkavalan.local"


def require_admin_access(provided_password: Optional[str]):
    password_value = (provided_password or "").strip()
    if not password_value:
        raise HTTPException(status_code=403, detail="Admin password is required")
    if not hmac.compare_digest(password_value, ADMIN_PORTAL_PASSWORD):
        raise HTTPException(status_code=403, detail="Invalid admin password")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PHISHING_KEYWORDS = [
    "free-reward", "lucky-winner", "bank-secure", "verify-account",
    "kyc-update", "claim-prize", "login-update", "account-suspended",
    "bit.ly", "goo.gl", "tinyurl", "paytm-secure", "sbi-alert",
    "hdfc-verify", "upi-reward", "aadhaar-update",
]

URL_FLAG_EXPLANATIONS = {
    'No HTTPS': 'This URL uses HTTP, not HTTPS. Legitimate banks and payment sites always use HTTPS (the padlock). Without it, your data travels unencrypted and can be intercepted by attackers.',
    'IP-based URL': 'Real websites use domain names (like sbi.co.in), not raw IP addresses. Scammers use IP-based URLs to avoid domain registration that could expose their identity.',
    'Too many hyphens': 'Fraudulent URLs pack multiple hyphens to mimic legitimate domains (e.g. "sbi-bank-login-verify.com"). Genuine sites rarely use more than one hyphen.',
    'Suspicious TLD': 'Top-level domains like .xyz, .tk, .top, .ml are frequently used by scammers because they are free or very cheap. Banks and government sites use .gov, .co.in, .com.',
    'Unusually long URL': 'Long URLs can be used to hide the real destination or embed confusing parameters. Scammers make URLs long to distract you from spotting the fake domain.',
    'Too many subdomains': 'A URL like "login.verify.bank.secure.xyz" uses subdomains to trick you into thinking the main domain is a trusted brand.',
}

KEYWORD_EXPLANATIONS = {
    'free-reward': 'Scammers lure victims with fake rewards. No legitimate company sends surprise free rewards via unknown links.',
    'lucky-winner': 'Classic "lottery scam" language. You cannot win a contest you did not enter.',
    'bank-secure': 'Fraudsters impersonate banks by mixing "bank" and "secure" in URLs to look official.',
    'verify-account': 'A common trick to push you to a fake login page to steal your credentials.',
    'kyc-update': 'KYC scams create panic that your account will be blocked unless you share documents immediately.',
    'claim-prize': 'Prize claim links are almost always designed to harvest personal information.',
    'login-update': 'Suggests your login is outdated, pushing you to a fake portal to capture your password.',
    'account-suspended': 'Creates fear that your account is suspended to get you to act quickly without verifying.',
    'bit.ly': 'URL shorteners hide the real destination. A scammer can mask a dangerous link behind a short URL.',
    'goo.gl': 'URL shorteners hide the real destination. A scammer can mask a dangerous link behind a short URL.',
    'tinyurl': 'URL shorteners hide the real destination. A scammer can mask a dangerous link behind a short URL.',
    'paytm-secure': 'Scammers fake payment platform names in URLs to steal UPI credentials.',
    'sbi-alert': 'Fake SBI alerts are extremely common. SBI never sends security alerts via random SMS links.',
    'hdfc-verify': 'HDFC impersonation. Legitimate HDFC communications never ask you to click a link to verify.',
    'upi-reward': 'UPI reward scams trick users into scanning QR codes or clicking links that drain accounts.',
    'aadhaar-update': 'Aadhaar update scams claim your ID will be cancelled unless you submit data immediately.',
}

SCAM_PHRASES = [
    {"phrase": 'won a prize',           "why": 'Prize-win tricks are the oldest scam method.'},
    {"phrase": 'click here to claim',   "why": 'Urgency + link combo. Pushes you to click immediately.'},
    {"phrase": 'your account has been', "why": 'Account status manipulation — creates fear that your account is locked, blocked, or compromised.'},
    {"phrase": 'send your otp',         "why": 'No bank will EVER ask you to share your OTP.'},
    {"phrase": 'kyc update',            "why": 'KYC scams claim your account will be blocked.'},
    {"phrase": 'verify now',            "why": 'Creates pressure to do something immediately.'},
    {"phrase": 'limited time',          "why": 'Artificial time pressure prevents careful thinking.'},
]

PATTERN_EXPLANATIONS = {
    'link': {
        'label': 'Contains Suspicious Link',
        'why': 'The message contains a URL. Scammers embed links to direct you to fake login pages or malware downloads.',
        'severity': 'high'
    },
    'money': {
        'label': 'Money / Amount Mentioned',
        'why': 'Financial figures in unsolicited messages are used to tempt victims or make scams feel real.',
        'severity': 'medium'
    },
    'urgency': {
        'label': 'Creates Urgency / Pressure',
        'why': 'Psychological pressure tactics like "urgent" or "immediately" are used to stop you from thinking clearly.',
        'severity': 'high'
    }
}


@app.on_event("startup")
async def startup_event():
    await database.initialize_storage()


@app.on_event("shutdown")
async def shutdown_event():
    await database.close_storage()

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": time.time()}


@app.get("/storage/status")
async def storage_status():
    return await database.get_storage_status()


@app.post("/user/login")
async def user_login(request: UserLoginRequest):
    name = request.name.strip()
    email = request.email.strip().lower()

    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters long")

    if not re.fullmatch(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", email or ""):
        raise HTTPException(status_code=400, detail="Invalid email address")

    existing_user = await database.get_user_account_by_email(email)
    if not existing_user:
        raise HTTPException(status_code=404, detail="Account not found. Please create an account first.")

    login_time = time.strftime("%Y-%m-%d %H:%M:%S")
    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    account_name = existing_user.get("name") or name

    await database.update_user_last_login(email, created_at)
    await database.add_user_login({
        "name": account_name,
        "email": email,
        "login_time": login_time,
        "created_at": created_at,
        "updated_at": created_at,
    })

    return {"status": "success", "message": "Login successful", "name": account_name, "email": email, "login_time": login_time}


@app.post("/user/register")
async def user_register(request: UserRegisterRequest):
    name = request.name.strip()
    email = request.email.strip().lower()

    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters long")

    if not re.fullmatch(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", email or ""):
        raise HTTPException(status_code=400, detail="Invalid email address")

    existing_user = await database.get_user_account_by_email(email)
    if existing_user:
        raise HTTPException(status_code=409, detail="Account already exists for this email")

    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    try:
        await database.add_user_account({
            "name": name,
            "email": email,
            "created_at": created_at,
            "updated_at": created_at,
        })
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    return {"status": "success", "message": "Account created successfully", "name": name, "email": email}


@app.get("/user/logins")
async def user_logins():
    return await database.get_user_logins(20)


@app.post("/admin/login")
async def admin_login(request: AdminLoginRequest):
    password = request.password

    require_admin_access(password)

    email = ADMIN_DEFAULT_EMAIL
    account_name = ADMIN_DEFAULT_NAME
    existing_admin = await database.get_admin_account_by_email(email)
    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    if not existing_admin:
        try:
            await database.add_admin_account({
                "name": account_name,
                "email": email,
                "created_at": created_at,
                "updated_at": created_at,
            })
        except ValueError:
            pass
    else:
        account_name = existing_admin.get("name") or account_name

    login_time = time.strftime("%Y-%m-%d %H:%M:%S")

    await database.update_admin_last_login(email, created_at)
    await database.add_admin_login({
        "name": account_name,
        "email": email,
        "login_time": login_time,
        "created_at": created_at,
        "updated_at": created_at,
    })

    return {
        "status": "success",
        "message": "Admin login successful",
        "name": account_name,
        "email": email,
        "login_time": login_time,
    }


@app.post("/admin/register")
async def admin_register(request: AdminRegisterRequest):
    name = request.name.strip()
    email = request.email.strip().lower()

    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters long")

    if not re.fullmatch(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", email or ""):
        raise HTTPException(status_code=400, detail="Invalid email address")

    existing_admin = await database.get_admin_account_by_email(email)
    if existing_admin:
        raise HTTPException(status_code=409, detail="Admin account already exists for this email")

    created_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    try:
        await database.add_admin_account({
            "name": name,
            "email": email,
            "created_at": created_at,
            "updated_at": created_at,
        })
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    return {"status": "success", "message": "Admin account created successfully", "name": name, "email": email}


@app.get("/admin/logins")
async def admin_logins(x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password")):
    require_admin_access(x_admin_password)
    return await database.get_admin_logins(20)


@app.get("/admin/reports")
async def admin_reports(
    scam_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 250,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    filters = AdminReportFilterRequest(
        scam_type=scam_type,
        severity=severity,
        status=status,
        date_from=date_from,
        date_to=date_to,
    )
    return await database.get_admin_reports(filters.model_dump(exclude_none=True), limit=min(max(limit, 1), 500))


@app.patch("/admin/reports/{report_id}/status")
async def admin_update_report_status(
    report_id: int,
    request: ReportStatusUpdateRequest,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    normalized_status = request.status.strip().lower().replace(" ", "_")
    allowed_statuses = {"verified", "false", "under_investigation"}
    if normalized_status not in allowed_statuses:
        raise HTTPException(status_code=400, detail="Invalid status. Use verified, false, or under_investigation")

    severity = request.severity.strip().lower() if request.severity else None
    if severity and severity not in {"low", "medium", "high", "critical"}:
        raise HTTPException(status_code=400, detail="Invalid severity. Use low, medium, high, or critical")

    await database.update_report_review(report_id, normalized_status, severity)
    return {"status": "success", "message": "Report review updated"}


@app.post("/admin/analyze-threat")
async def admin_analyze_threat(
    request: ThreatAnalyzeRequest,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    input_text = request.input_text.strip()
    input_type = request.input_type.strip().lower()
    if not input_text:
        raise HTTPException(status_code=400, detail="input_text is required")
    if input_type not in {"link", "email", "message"}:
        raise HTTPException(status_code=400, detail="input_type must be one of link, email, message")

    pattern_snapshot = await database.analyze_threat_patterns(input_text, input_type)

    if input_type == "link":
        analysis = await analyze_link(URLAnalysisRequest(url=input_text))
    else:
        analysis = await analyze_message(MessageAnalysisRequest(message=input_text))

    risk_score = max(int(pattern_snapshot.get("risk_score", 0)), int(analysis.score))
    if risk_score >= 60:
        risk_level = "high"
    elif risk_score >= 30:
        risk_level = "medium"
    else:
        risk_level = "low"

    combined_patterns = []
    combined_patterns.extend(pattern_snapshot.get("matched_patterns", []))
    combined_patterns.extend(analysis.flags or [])
    deduped_patterns = list(dict.fromkeys(combined_patterns))

    return {
        "input_type": input_type,
        "input_text": input_text,
        "source_value": pattern_snapshot.get("source_value"),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "matched_patterns": deduped_patterns,
        "repeated_source_count": pattern_snapshot.get("repeated_source_count", 0),
        "common_scam_sources": pattern_snapshot.get("common_scam_sources", []),
        "title": analysis.title,
        "subtitle": analysis.subtitle,
        "rating_reason": analysis.rating_reason,
    }


@app.get("/admin/scam-sources")
async def admin_get_scam_sources(
    status: Optional[str] = None,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    return await database.get_scam_sources(status=status)


@app.post("/admin/scam-sources")
async def admin_add_scam_source(
    request: ScamSourceCreateRequest,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    source_value = request.source_value.strip()
    source_type = request.source_type.strip().lower()
    status = request.status.strip().lower().replace(" ", "_")
    severity = request.severity.strip().lower()

    if source_type not in {"link", "phone", "email", "message", "other"}:
        raise HTTPException(status_code=400, detail="source_type must be one of link, phone, email, message, other")
    if status not in {"verified", "false", "under_investigation"}:
        raise HTTPException(status_code=400, detail="status must be verified, false, or under_investigation")
    if severity not in {"low", "medium", "high", "critical"}:
        raise HTTPException(status_code=400, detail="severity must be low, medium, high, or critical")
    if not source_value:
        raise HTTPException(status_code=400, detail="source_value is required")

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    try:
        await database.add_scam_source(
            {
                "source_type": source_type,
                "source_value": source_value,
                "status": status,
                "severity": severity,
                "blocked": request.blocked,
                "notes": request.notes or "",
                "created_at": now_iso,
                "updated_at": now_iso,
            }
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc))

    return {"status": "success", "message": "Source added to scam database"}


@app.patch("/admin/scam-sources/{source_id}")
async def admin_update_scam_source(
    source_id: int,
    request: ScamSourceUpdateRequest,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    payload = request.model_dump(exclude_none=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No update fields provided")

    if "status" in payload:
        payload["status"] = payload["status"].strip().lower().replace(" ", "_")
        if payload["status"] not in {"verified", "false", "under_investigation"}:
            raise HTTPException(status_code=400, detail="Invalid status")
    if "severity" in payload:
        payload["severity"] = payload["severity"].strip().lower()
        if payload["severity"] not in {"low", "medium", "high", "critical"}:
            raise HTTPException(status_code=400, detail="Invalid severity")

    payload["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    await database.update_scam_source(source_id, payload)
    return {"status": "success", "message": "Scam source updated"}


@app.get("/admin/alerts")
async def admin_get_alerts(
    limit: int = 30,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    return await database.get_scam_alerts(limit=min(max(limit, 1), 100))


@app.post("/admin/alerts")
async def admin_create_alert(
    request: ScamAlertCreateRequest,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    title = request.title.strip()
    message = request.message.strip()
    trend_type = request.trend_type.strip().lower()
    severity = request.severity.strip().lower()

    if not title or not message:
        raise HTTPException(status_code=400, detail="title and message are required")
    if severity not in {"low", "medium", "high", "critical"}:
        raise HTTPException(status_code=400, detail="severity must be low, medium, high, or critical")

    created_at = time.strftime("%Y-%m-%d %H:%M:%S")
    await database.add_scam_alert(
        {
            "title": title,
            "message": message,
            "trend_type": trend_type,
            "severity": severity,
            "created_at": created_at,
        }
    )
    return {"status": "success", "message": "Alert sent to users", "created_at": created_at}


@app.post("/protection/check")
async def protection_check(
    request: ProtectionCheckRequest,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    source_value = request.source_value.strip()
    if not source_value:
        raise HTTPException(status_code=400, detail="source_value is required")

    return await database.check_source_protection(source_value)


@app.get("/admin/analytics")
async def admin_security_analytics(x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password")):
    require_admin_access(x_admin_password)
    return await database.get_security_analytics()


@app.get("/admin/data-snapshot")
async def admin_data_snapshot(
    limit_per_table: int = 200,
    x_admin_password: Optional[str] = Header(default=None, alias="x-admin-password"),
):
    require_admin_access(x_admin_password)
    return await database.get_data_snapshot(limit_per_table=limit_per_table)

@app.post("/analyze/link", response_model=AnalysisResponse)
async def analyze_link(request: URLAnalysisRequest):
    url = request.url.lower()
    flags = []
    indicators = []
    
    if not url.startswith("https"):
        flags.append("No HTTPS")
        indicators.append(FlagExplanation(flag="No HTTPS", severity="high", why=URL_FLAG_EXPLANATIONS['No HTTPS']))
    
    # Simple IP check
    import re
    if re.search(r'\d{2,}\.\d{1,3}\.\d{1,3}', url):
        flags.append("IP-based URL")
        indicators.append(FlagExplanation(flag="IP-based URL", severity="high", why=URL_FLAG_EXPLANATIONS['IP-based URL']))
        
    for kw in PHISHING_KEYWORDS:
        if kw in url:
            flags.append(f"Keyword: \"{kw}\"")
            indicators.append(FlagExplanation(flag=f"Keyword: \"{kw}\"", severity="high", why=KEYWORD_EXPLANATIONS.get(kw, "Common phishing keyword detected.")))

    score = min(100, len(flags) * 20 + random.randint(0, 15))
    
    if score >= 60:
        res_type, title, subtitle = "danger", "⚠️ HIGH RISK — Phishing Detected", "This URL shows multiple characteristics of a phishing/scam link."
    elif score >= 25:
        res_type, title, subtitle = "warning", "⚡ SUSPICIOUS — Proceed with Caution", "This URL has some suspicious indicators."
    else:
        res_type, title, subtitle = "safe", "✅ SAFE — No Threats Detected", "No known phishing patterns found."

    return AnalysisResponse(
        score=score,
        type=res_type,
        title=title,
        subtitle=subtitle,
        rating_reason=f"Rated {res_type} based on {len(flags)} indicators.",
        flags=flags,
        indicators=indicators
    )

@app.post("/analyze/message", response_model=AnalysisResponse)
async def analyze_message(request: MessageAnalysisRequest):
    msg = request.message.lower()
    flags = []
    indicators = []
    
    import re
    # Pattern Detection
    has_link = bool(re.search(r'https?://\S+|www\.\S+|\S+\.\w{2,4}/\S*', msg))
    has_money = bool(re.search(r'(₹|\$|rs\.?|lakh|crore)\s*\d+', msg))
    has_urgency = any(u in msg for u in ['urgent', 'immediate', 'expire', 'limited', 'hurry', 'action required'])
    
    if has_link:
        flags.append("Suspicious Link")
        indicators.append(FlagExplanation(flag="Suspicious Link", severity="high", why=PATTERN_EXPLANATIONS['link']['why']))
    if has_money:
        flags.append("Money Mention")
        indicators.append(FlagExplanation(flag="Money Mention", severity="medium", why=PATTERN_EXPLANATIONS['money']['why']))
    if has_urgency:
        flags.append("Urgency/Pressure")
        indicators.append(FlagExplanation(flag="Urgency/Pressure", severity="high", why=PATTERN_EXPLANATIONS['urgency']['why']))
        
    for item in SCAM_PHRASES:
        if item["phrase"] in msg:
            flags.append(f"Scam Phrase: \"{item['phrase']}\"")
            indicators.append(FlagExplanation(flag=f"Scam Phrase: \"{item['phrase']}\"", severity="high", why=item["why"]))

    score = min(100, len(flags) * 25 + random.randint(0, 10))
    
    if score >= 60:
        res_type, title, subtitle = "danger", "🚨 HIGH LIKELIHOOD — Scam Message", "This message follows classic social engineering patterns used by scammers."
    elif score >= 30:
        res_type, title, subtitle = "warning", "⚠️ SUSPICIOUS — Potential Fraud", "This message has some characteristics often seen in phishing or marketing scams."
    else:
        res_type, title, subtitle = "safe", "✅ PROBABLY SAFE — No Direct Threats", "No obvious scam patterns detected in this message text."

    return AnalysisResponse(
        score=score,
        type=res_type,
        title=title,
        subtitle=subtitle,
        rating_reason=f"Calculated {score}% scam likelihood based on {len(flags)} indicators.",
        flags=flags,
        indicators=indicators
    )

SCREENSHOT_SCENARIOS = [
    {
        "type": "danger",
        "title": "🚨 Fake Payment Screenshot Detected",
        "subtitle": "This screenshot shows strong signs of digital manipulation.",
        "flags": ["Metadata Mismatch", "Font Inconsistency", "QR Code Suspicious"],
        "score": 87,
        "rating_reason": "Rated High Risk because multiple manipulation signals were detected. Fake screenshots are common in UPI fraud.",
        "indicators": [
            {"flag": "Metadata Mismatch", "severity": "high", "why": "The image metadata doesn't reflect a native screenshot, suggesting it was created in a photo editor."},
            {"flag": "Font Inconsistency", "severity": "high", "why": "The fonts used for the amount and date do not match the official app design."},
            {"flag": "QR Code Suspicious", "severity": "high", "why": "The embedded QR code reveals an unverified or blacklisted merchant identity."}
        ]
    },
    {
        "type": "warning",
        "title": "⚡ Screenshot Requires Manual Review",
        "subtitle": "Some indicators suggest this may not be authentic.",
        "flags": ["Unusual Amount Format", "Low Resolution"],
        "score": 52,
        "rating_reason": "Rated Suspicious because anomalies were detected. Check the transaction in your bank app directly.",
        "indicators": [
            {"flag": "Unusual Amount Format", "severity": "medium", "why": "The spacing and alignment of the rupee symbol are slightly off."},
            {"flag": "Low Resolution", "severity": "medium", "why": "Low resolution is often used to mask blending artifacts in edited images."}
        ]
    },
    {
        "type": "safe",
        "title": "✅ Screenshot Appears Genuine",
        "subtitle": "No obvious manipulation detected in this payment screenshot.",
        "flags": ["Standard Format", "Metadata Consistent"],
        "score": 12,
        "rating_reason": "Rated Low Risk. The visual patterns and metadata match standard mobile app behavior.",
        "indicators": [
            {"flag": "Standard Format", "severity": "low", "why": "The layout perfectly matches the official UPI application theme and fonts."},
            {"flag": "Metadata Consistent", "severity": "low", "why": "No traces of editing software or inconsistent timestamps were found."}
        ]
    }
]

@app.post("/analyze/screenshot", response_model=AnalysisResponse)
async def analyze_screenshot():
    # Simulation: In a real app, we'd use OpenCV/PIL here to analyze the image
    time.sleep(1.5) # Simulate processing
    scenario = random.choice(SCREENSHOT_SCENARIOS)
    
    return AnalysisResponse(
        score=scenario["score"],
        type=scenario["type"],
        title=scenario["title"],
        subtitle=scenario["subtitle"],
        rating_reason=scenario["rating_reason"],
        flags=scenario["flags"],
        indicators=[FlagExplanation(**i) for i in scenario["indicators"]]
    )

@app.get("/districts", response_model=List[DistrictThreat])
async def get_districts():
    return database.get_districts()

@app.get("/reports", response_model=List[ScamReport])
async def get_reports():
    return await database.get_reports(10)

@app.post("/report")
async def submit_report(report: dict = Body(...)):
    report_type = str((report.get("type") or report.get("category") or "")).strip()
    district = str((report.get("district") or report.get("location") or "")).strip()
    description = str((report.get("description") or "")).strip()

    if not report_type or not district or not description:
        raise HTTPException(status_code=400, detail="type/category, district/location, and description are required")

    normalized_report = ScamReport(
        type=report_type,
        district=district,
        description=description,
        ref_id=f"REF-{random.randint(100000, 999999)}",
        timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
    )

    await database.add_report(normalized_report)
    return {"status": "success", "ref_id": normalized_report.ref_id}

@app.get("/stats/hourly")
async def get_hourly_stats():
    # Return hourly report counts for the last 24 hours
    # Simulation: Mix of random data and actual report counts
    current_hour = int(time.strftime("%H"))
    stats = []
    
    # Generate labels for last 24 hours
    for i in range(23, -1, -1):
        hour = (current_hour - i) % 24
        label = f"{hour}:00"
        # Simulate base counts (random but realistic)
        # Higher activity in the afternoon/evening
        base = 5 + random.randint(0, 15)
        if 10 <= hour <= 20:
            base += random.randint(10, 30)
            
        stats.append({
            "hour": label,
            "phishing": base + random.randint(2, 10),
            "fraud": base + random.randint(5, 15),
            "other": base // 2 + random.randint(0, 5)
        })
        
    return stats
