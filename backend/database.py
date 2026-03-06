import os
import sqlite3
import re
from typing import Dict, List

from models import ScamReport, DistrictThreat

DEFAULT_DISTRICTS = [
    {"name": "Delhi (NCR)", "lat": 28.6139, "lng": 77.2090, "level": "critical", "reports": 850},
    {"name": "Mumbai", "lat": 19.0760, "lng": 72.8777, "level": "critical", "reports": 742},
    {"name": "Bangalore", "lat": 12.9716, "lng": 77.5946, "level": "critical", "reports": 618},
    {"name": "Hyderabad", "lat": 17.3850, "lng": 78.4867, "level": "high", "reports": 467},
    {"name": "Chennai", "lat": 13.0827, "lng": 80.2707, "level": "high", "reports": 389},
    {"name": "Kolkata", "lat": 22.5726, "lng": 88.3639, "level": "high", "reports": 314},
    {"name": "Ahmedabad", "lat": 23.0225, "lng": 72.5714, "level": "medium", "reports": 256},
    {"name": "Pune", "lat": 18.5204, "lng": 73.8567, "level": "medium", "reports": 298},
    {"name": "Jaipur", "lat": 26.9124, "lng": 75.7873, "level": "medium", "reports": 112},
    {"name": "Lucknow", "lat": 26.8467, "lng": 80.9462, "level": "medium", "reports": 167},
    {"name": "Patna", "lat": 25.5941, "lng": 85.1376, "level": "medium", "reports": 143},
    {"name": "Srinagar", "lat": 34.0837, "lng": 74.7973, "level": "low", "reports": 89},
    {"name": "Guwahati", "lat": 26.1445, "lng": 91.7362, "level": "low", "reports": 54},
    {"name": "Bhopal", "lat": 23.2599, "lng": 77.4126, "level": "medium", "reports": 101},
    {"name": "Bhubaneswar", "lat": 20.2961, "lng": 85.8245, "level": "low", "reports": 43},
    {"name": "Ranchi", "lat": 23.3441, "lng": 85.3096, "level": "low", "reports": 78},
    {"name": "Chandigarh", "lat": 30.7333, "lng": 76.7794, "level": "low", "reports": 38},
    {"name": "Kochi", "lat": 9.9312, "lng": 76.2673, "level": "low", "reports": 49},
    {"name": "Thiruvananthapuram", "lat": 8.5241, "lng": 76.9366, "level": "low", "reports": 41},
    {"name": "Indore", "lat": 22.7196, "lng": 75.8577, "level": "medium", "reports": 93},
]

_sqlite_db_path = ""


def _load_local_env_file():
    env_file = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_file):
        return

    try:
        with open(env_file, "r", encoding="utf-8") as file:
            for raw_line in file:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except Exception:
        pass


def _sqlite_settings() -> Dict[str, str]:
    _load_local_env_file()
    return {
        "db_file": os.getenv("SQLITE_DB_FILE", "auth.db").strip() or "auth.db",
    }


async def initialize_storage():
    global _sqlite_db_path
    settings = _sqlite_settings()
    _sqlite_db_path = os.path.join(os.path.dirname(__file__), settings["db_file"])

    conn = sqlite3.connect(_sqlite_db_path)
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                created_at TEXT,
                updated_at TEXT,
                last_login_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS user_logins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                login_time TEXT,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS admins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                created_at TEXT,
                updated_at TEXT,
                last_login_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS admin_logins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                login_time TEXT,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scam_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                description TEXT NOT NULL,
                district TEXT NOT NULL,
                ref_id TEXT UNIQUE,
                timestamp TEXT,
                severity TEXT DEFAULT 'medium',
                status TEXT DEFAULT 'under_investigation',
                source_value TEXT,
                reviewed_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scam_sources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_type TEXT NOT NULL,
                source_value TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL,
                severity TEXT NOT NULL,
                blocked INTEGER DEFAULT 0,
                notes TEXT,
                created_at TEXT,
                updated_at TEXT
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS scam_alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                trend_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                created_at TEXT
            )
            """
        )
        # Safe migrations for existing databases
        for migration_sql in [
            "ALTER TABLE scam_reports ADD COLUMN severity TEXT DEFAULT 'medium'",
            "ALTER TABLE scam_reports ADD COLUMN status TEXT DEFAULT 'under_investigation'",
            "ALTER TABLE scam_reports ADD COLUMN source_value TEXT",
            "ALTER TABLE scam_reports ADD COLUMN reviewed_at TEXT",
        ]:
            try:
                conn.execute(migration_sql)
            except sqlite3.OperationalError:
                pass
        conn.commit()
    finally:
        conn.close()


async def close_storage():
    return


def _normalize_report(report_row: dict):
    normalized_type = report_row.get("type") or report_row.get("category") or "Other"
    normalized_district = report_row.get("district") or report_row.get("location") or "Unknown"
    return {
        "type": normalized_type,
        "description": report_row.get("description", ""),
        "district": normalized_district,
        "ref_id": report_row.get("ref_id"),
        "timestamp": report_row.get("timestamp"),
    }

INITIAL_REPORTS = [
    {"category": "UPI Fraud", "location": "Delhi", "description": "Fake payment request", "timestamp": "2026-03-05 14:30:00", "ref_id": "REF-123456", "reported_by": "Citizen"},
    {"category": "Phishing Link", "location": "Mumbai", "description": "Fake KYC update link", "timestamp": "2026-03-05 15:45:00", "ref_id": "REF-234567", "reported_by": "Citizen"},
    {"category": "Fraudulent Call", "location": "Bangalore", "description": "Impersonating bank official", "timestamp": "2026-03-05 16:20:00", "ref_id": "REF-345678", "reported_by": "Citizen"},
    {"category": "Scam SMS", "location": "Chennai", "description": "Lucky draw winner SMS", "timestamp": "2026-03-05 17:10:00", "ref_id": "REF-456789", "reported_by": "Citizen"},
    {"category": "Fake Website", "location": "Hyderabad", "description": "Fake e-commerce site", "timestamp": "2026-03-05 18:05:00", "ref_id": "REF-567890", "reported_by": "Citizen"},
]


def _get_conn():
    if not _sqlite_db_path:
        db_file = _sqlite_settings()["db_file"]
        db_path = os.path.join(os.path.dirname(__file__), db_file)
    else:
        db_path = _sqlite_db_path
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


async def get_storage_status():
    conn = _get_conn()
    try:
        users_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        admins_count = conn.execute("SELECT COUNT(*) FROM admins").fetchone()[0]
        reports_count = conn.execute("SELECT COUNT(*) FROM scam_reports").fetchone()[0]
        user_logins_count = conn.execute("SELECT COUNT(*) FROM user_logins").fetchone()[0]
        admin_logins_count = conn.execute("SELECT COUNT(*) FROM admin_logins").fetchone()[0]
        scam_sources_count = conn.execute("SELECT COUNT(*) FROM scam_sources").fetchone()[0]
        scam_alerts_count = conn.execute("SELECT COUNT(*) FROM scam_alerts").fetchone()[0]
    finally:
        conn.close()

    return {
        "storage": "sqlite3",
        "persistence": True,
        "sqlite_db_path": _sqlite_db_path,
        "users_count": users_count,
        "admins_count": admins_count,
        "reports_count": reports_count,
        "user_logins_count": user_logins_count,
        "admin_logins_count": admin_logins_count,
        "scam_sources_count": scam_sources_count,
        "scam_alerts_count": scam_alerts_count,
    }


def _extract_source_value(text: str) -> str:
    raw = (text or "").strip()
    if not raw:
        return ""

    url_match = re.search(r"(https?://\S+|www\.\S+)", raw, re.IGNORECASE)
    if url_match:
        return url_match.group(1).strip('.,;')

    email_match = re.search(r"([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})", raw)
    if email_match:
        return email_match.group(1)

    phone_match = re.search(r"(?:\+?\d[\d\-\s]{8,}\d)", raw)
    if phone_match:
        return re.sub(r"\s+", "", phone_match.group(0))

    return ""


def _default_report_severity(report_type: str) -> str:
    type_lower = (report_type or "").lower()
    if "phishing" in type_lower or "upi" in type_lower or "fraud" in type_lower:
        return "high"
    if "fake" in type_lower or "sms" in type_lower or "call" in type_lower:
        return "medium"
    return "low"


async def add_user_account(user_account: dict):
    account_payload = {
        "name": user_account.get("name"),
        "email": user_account.get("email", "").lower(),
        "created_at": user_account.get("created_at"),
        "updated_at": user_account.get("updated_at"),
    }

    conn = _get_conn()
    try:
        conn.execute(
            """
            INSERT INTO users (name, email, created_at, updated_at, last_login_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                account_payload["name"],
                account_payload["email"],
                account_payload["created_at"],
                account_payload["updated_at"],
                None,
            ),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise ValueError("User account already exists")
    finally:
        conn.close()


async def get_user_account_by_email(email: str):
    conn = _get_conn()
    try:
        row = conn.execute(
            "SELECT id, name, email, created_at, updated_at, last_login_at FROM users WHERE email = ?",
            (email.lower(),),
        ).fetchone()
    finally:
        conn.close()

    return dict(row) if row else None


async def update_user_last_login(email: str, last_login_at: str):
    conn = _get_conn()
    try:
        conn.execute(
            "UPDATE users SET last_login_at = ?, updated_at = ? WHERE email = ?",
            (last_login_at, last_login_at, email.lower()),
        )
        conn.commit()
    finally:
        conn.close()


async def get_reports(limit: int = 10):
    conn = _get_conn()
    try:
        rows = conn.execute(
            "SELECT type, description, district, ref_id, timestamp FROM scam_reports ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    finally:
        conn.close()

    reports = [dict(row) for row in rows]
    reports.reverse()
    return reports


async def add_report(report: ScamReport):
    report_payload = {
        "type": report.type,
        "description": report.description,
        "district": report.district,
        "ref_id": report.ref_id,
        "timestamp": report.timestamp,
        "severity": _default_report_severity(report.type),
        "status": "under_investigation",
        "source_value": _extract_source_value(report.description),
    }
    conn = _get_conn()
    try:
        conn.execute(
            """
            INSERT INTO scam_reports (type, description, district, ref_id, timestamp, severity, status, source_value)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                report_payload["type"],
                report_payload["description"],
                report_payload["district"],
                report_payload["ref_id"],
                report_payload["timestamp"],
                report_payload["severity"],
                report_payload["status"],
                report_payload["source_value"],
            ),
        )
        conn.commit()
    finally:
        conn.close()


async def add_user_login(user_login: dict):
    login_payload = {
        "name": user_login.get("name"),
        "email": user_login.get("email", "").lower(),
        "login_time": user_login.get("login_time"),
        "created_at": user_login.get("created_at"),
        "updated_at": user_login.get("updated_at"),
    }

    conn = _get_conn()
    try:
        conn.execute(
            """
            INSERT INTO user_logins (name, email, login_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                login_payload["name"],
                login_payload["email"],
                login_payload["login_time"],
                login_payload["created_at"],
                login_payload["updated_at"],
            ),
        )
        conn.commit()
    finally:
        conn.close()


async def get_user_logins(limit: int = 20):
    conn = _get_conn()
    try:
        rows = conn.execute(
            "SELECT id, name, email, login_time, created_at, updated_at FROM user_logins ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    finally:
        conn.close()

    return [dict(row) for row in rows]


async def add_admin_account(admin_account: dict):
    account_payload = {
        "name": admin_account.get("name"),
        "email": admin_account.get("email", "").lower(),
        "created_at": admin_account.get("created_at"),
        "updated_at": admin_account.get("updated_at"),
    }

    conn = _get_conn()
    try:
        conn.execute(
            """
            INSERT INTO admins (name, email, created_at, updated_at, last_login_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                account_payload["name"],
                account_payload["email"],
                account_payload["created_at"],
                account_payload["updated_at"],
                None,
            ),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise ValueError("Admin account already exists")
    finally:
        conn.close()


async def get_admin_account_by_email(email: str):
    conn = _get_conn()
    try:
        row = conn.execute(
            "SELECT id, name, email, created_at, updated_at, last_login_at FROM admins WHERE email = ?",
            (email.lower(),),
        ).fetchone()
    finally:
        conn.close()

    return dict(row) if row else None


async def update_admin_last_login(email: str, last_login_at: str):
    conn = _get_conn()
    try:
        conn.execute(
            "UPDATE admins SET last_login_at = ?, updated_at = ? WHERE email = ?",
            (last_login_at, last_login_at, email.lower()),
        )
        conn.commit()
    finally:
        conn.close()


async def add_admin_login(admin_login: dict):
    login_payload = {
        "name": admin_login.get("name"),
        "email": admin_login.get("email", "").lower(),
        "login_time": admin_login.get("login_time"),
        "created_at": admin_login.get("created_at"),
        "updated_at": admin_login.get("updated_at"),
    }

    conn = _get_conn()
    try:
        conn.execute(
            """
            INSERT INTO admin_logins (name, email, login_time, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                login_payload["name"],
                login_payload["email"],
                login_payload["login_time"],
                login_payload["created_at"],
                login_payload["updated_at"],
            ),
        )
        conn.commit()
    finally:
        conn.close()


async def get_admin_logins(limit: int = 20):
    conn = _get_conn()
    try:
        rows = conn.execute(
            "SELECT id, name, email, login_time, created_at, updated_at FROM admin_logins ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    finally:
        conn.close()

    return [dict(row) for row in rows]


async def get_admin_reports(filters: dict, limit: int = 250):
    query = """
        SELECT id, type, description, district, ref_id, timestamp, severity, status, source_value, reviewed_at
        FROM scam_reports
        WHERE 1=1
    """
    params = []

    if filters.get("scam_type"):
        query += " AND lower(type) = lower(?)"
        params.append(filters["scam_type"])
    if filters.get("severity"):
        query += " AND lower(severity) = lower(?)"
        params.append(filters["severity"])
    if filters.get("status"):
        query += " AND lower(status) = lower(?)"
        params.append(filters["status"])
    if filters.get("date_from"):
        query += " AND substr(timestamp, 1, 10) >= ?"
        params.append(filters["date_from"])
    if filters.get("date_to"):
        query += " AND substr(timestamp, 1, 10) <= ?"
        params.append(filters["date_to"])

    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)

    conn = _get_conn()
    try:
        rows = conn.execute(query, tuple(params)).fetchall()
    finally:
        conn.close()

    return [dict(row) for row in rows]


async def update_report_review(report_id: int, status: str, severity: str = None):
    conn = _get_conn()
    try:
        reviewed_at = __import__("time").strftime("%Y-%m-%d %H:%M:%S")
        if severity:
            conn.execute(
                "UPDATE scam_reports SET status = ?, severity = ?, reviewed_at = ? WHERE id = ?",
                (status, severity, reviewed_at, report_id),
            )
        else:
            conn.execute(
                "UPDATE scam_reports SET status = ?, reviewed_at = ? WHERE id = ?",
                (status, reviewed_at, report_id),
            )
        conn.commit()
    finally:
        conn.close()


async def analyze_threat_patterns(input_text: str, input_type: str):
    text = (input_text or "").strip()
    lowered = text.lower()
    matched_patterns = []

    pattern_rules = [
        ("shortened_link", r"bit\.ly|tinyurl|goo\.gl"),
        ("urgency_phrase", r"urgent|immediate|act now|verify now|suspended"),
        ("otp_request", r"otp|pin|cvv"),
        ("reward_bait", r"winner|reward|prize|cashback"),
    ]

    for label, pattern in pattern_rules:
        if re.search(pattern, lowered, re.IGNORECASE):
            matched_patterns.append(label)

    source_value = _extract_source_value(text)
    conn = _get_conn()
    try:
        repeated_count = 0
        if source_value:
            repeated_count = conn.execute(
                "SELECT COUNT(*) FROM scam_reports WHERE lower(source_value) = lower(?)",
                (source_value,),
            ).fetchone()[0]

        common_sources = conn.execute(
            """
            SELECT source_value, COUNT(*) AS hits
            FROM scam_reports
            WHERE source_value IS NOT NULL AND source_value <> ''
            GROUP BY source_value
            ORDER BY hits DESC
            LIMIT 5
            """
        ).fetchall()
    finally:
        conn.close()

    risk_score = min(100, len(matched_patterns) * 22 + (15 if repeated_count > 1 else 0))
    risk_level = "high" if risk_score >= 60 else "medium" if risk_score >= 30 else "low"

    return {
        "input_type": input_type,
        "input_text": text,
        "source_value": source_value,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "matched_patterns": matched_patterns,
        "repeated_source_count": repeated_count,
        "common_scam_sources": [dict(row) for row in common_sources],
    }


async def add_scam_source(payload: dict):
    conn = _get_conn()
    try:
        conn.execute(
            """
            INSERT INTO scam_sources (source_type, source_value, status, severity, blocked, notes, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.get("source_type"),
                payload.get("source_value"),
                payload.get("status"),
                payload.get("severity"),
                1 if payload.get("blocked") else 0,
                payload.get("notes") or "",
                payload.get("created_at"),
                payload.get("updated_at"),
            ),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise ValueError("Source already exists in scam database")
    finally:
        conn.close()


async def update_scam_source(source_id: int, payload: dict):
    update_fields = []
    params = []

    if payload.get("status") is not None:
        update_fields.append("status = ?")
        params.append(payload["status"])
    if payload.get("severity") is not None:
        update_fields.append("severity = ?")
        params.append(payload["severity"])
    if payload.get("blocked") is not None:
        update_fields.append("blocked = ?")
        params.append(1 if payload["blocked"] else 0)
    if payload.get("notes") is not None:
        update_fields.append("notes = ?")
        params.append(payload["notes"])

    update_fields.append("updated_at = ?")
    params.append(payload.get("updated_at"))
    params.append(source_id)

    conn = _get_conn()
    try:
        conn.execute(f"UPDATE scam_sources SET {', '.join(update_fields)} WHERE id = ?", tuple(params))
        conn.commit()
    finally:
        conn.close()


async def get_scam_sources(status: str = None):
    conn = _get_conn()
    try:
        if status:
            rows = conn.execute(
                "SELECT id, source_type, source_value, status, severity, blocked, notes, created_at, updated_at FROM scam_sources WHERE lower(status)=lower(?) ORDER BY id DESC",
                (status,),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT id, source_type, source_value, status, severity, blocked, notes, created_at, updated_at FROM scam_sources ORDER BY id DESC"
            ).fetchall()
    finally:
        conn.close()

    records = [dict(row) for row in rows]
    for record in records:
        record["blocked"] = bool(record.get("blocked"))
    return records


async def add_scam_alert(payload: dict):
    conn = _get_conn()
    try:
        conn.execute(
            """
            INSERT INTO scam_alerts (title, message, trend_type, severity, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                payload.get("title"),
                payload.get("message"),
                payload.get("trend_type"),
                payload.get("severity"),
                payload.get("created_at"),
            ),
        )
        conn.commit()
    finally:
        conn.close()


async def get_scam_alerts(limit: int = 30):
    conn = _get_conn()
    try:
        rows = conn.execute(
            "SELECT id, title, message, trend_type, severity, created_at FROM scam_alerts ORDER BY id DESC LIMIT ?",
            (limit,),
        ).fetchall()
    finally:
        conn.close()

    return [dict(row) for row in rows]


async def check_source_protection(source_value: str):
    normalized = (source_value or "").strip()
    conn = _get_conn()
    try:
        row = conn.execute(
            """
            SELECT id, source_type, source_value, status, severity, blocked, notes
            FROM scam_sources
            WHERE lower(source_value) = lower(?)
            LIMIT 1
            """,
            (normalized,),
        ).fetchone()
    finally:
        conn.close()

    if not row:
        return {
            "known_scam": False,
            "warning": "No known scam data found for this source.",
            "source_value": normalized,
        }

    record = dict(row)
    is_blocked = bool(record.get("blocked"))
    record["blocked"] = is_blocked
    return {
        "known_scam": True,
        "blocked": is_blocked,
        "status": record.get("status"),
        "severity": record.get("severity"),
        "warning": "Dangerous source detected. Users should avoid this source immediately.",
        "source": record,
    }


async def get_security_analytics():
    conn = _get_conn()
    try:
        trend_rows = conn.execute(
            """
            SELECT substr(timestamp, 1, 10) AS day, COUNT(*) AS count
            FROM scam_reports
            WHERE timestamp IS NOT NULL AND timestamp <> ''
            GROUP BY substr(timestamp, 1, 10)
            ORDER BY day DESC
            LIMIT 10
            """
        ).fetchall()

        type_rows = conn.execute(
            """
            SELECT type, COUNT(*) AS count
            FROM scam_reports
            GROUP BY type
            ORDER BY count DESC
            LIMIT 8
            """
        ).fetchall()

        region_rows = conn.execute(
            """
            SELECT district, COUNT(*) AS count
            FROM scam_reports
            GROUP BY district
            ORDER BY count DESC
            LIMIT 8
            """
        ).fetchall()

        summary = {
            "total_reports": conn.execute("SELECT COUNT(*) FROM scam_reports").fetchone()[0],
            "verified_reports": conn.execute("SELECT COUNT(*) FROM scam_reports WHERE lower(status)='verified'").fetchone()[0],
            "under_investigation": conn.execute("SELECT COUNT(*) FROM scam_reports WHERE lower(status)='under_investigation'").fetchone()[0],
            "blocked_sources": conn.execute("SELECT COUNT(*) FROM scam_sources WHERE blocked=1").fetchone()[0],
        }
    finally:
        conn.close()

    return {
        "summary": summary,
        "scam_trends": [dict(row) for row in reversed(list(trend_rows))],
        "common_scam_types": [dict(row) for row in type_rows],
        "high_risk_regions": [dict(row) for row in region_rows],
    }


async def get_data_snapshot(limit_per_table: int = 200):
    limit = min(max(int(limit_per_table or 1), 1), 2000)
    table_queries = {
        "users": "SELECT * FROM users ORDER BY id DESC LIMIT ?",
        "admins": "SELECT * FROM admins ORDER BY id DESC LIMIT ?",
        "user_logins": "SELECT * FROM user_logins ORDER BY id DESC LIMIT ?",
        "admin_logins": "SELECT * FROM admin_logins ORDER BY id DESC LIMIT ?",
        "scam_reports": "SELECT * FROM scam_reports ORDER BY id DESC LIMIT ?",
        "scam_sources": "SELECT * FROM scam_sources ORDER BY id DESC LIMIT ?",
        "scam_alerts": "SELECT * FROM scam_alerts ORDER BY id DESC LIMIT ?",
    }

    conn = _get_conn()
    try:
        data = {}
        counts = {}
        for table_name, query in table_queries.items():
            rows = conn.execute(query, (limit,)).fetchall()
            data[table_name] = [dict(row) for row in rows]
            counts[table_name] = conn.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
    finally:
        conn.close()

    return {
        "storage": "sqlite3",
        "db_file": _sqlite_db_path,
        "limit_per_table": limit,
        "counts": counts,
        "tables": data,
    }


def get_districts() -> List[DistrictThreat]:
    return DEFAULT_DISTRICTS
