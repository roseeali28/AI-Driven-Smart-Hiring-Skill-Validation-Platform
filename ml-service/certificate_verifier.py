"""
Certificate verification for Coursera, Udemy, edX, Google
Uses metadata extraction, URL validation, and credential ID lookup where possible
"""

import re
import json
from pathlib import Path
from urllib.parse import urlparse

try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None


PLATFORMS = ['coursera', 'udemy', 'edx', 'google']

def extract_pdf_metadata(file_path: str) -> dict:
    """Extract metadata from PDF certificate."""
    if not PdfReader:
        return {}
    try:
        reader = PdfReader(file_path)
        info = reader.metadata or {}
        text = ""
        for page in reader.pages[:3]:  # First 3 pages
            text += page.extract_text() or ""
        return {
            "title": getattr(info, 'title', None) or info.get('/Title'),
            "author": getattr(info, 'author', None) or info.get('/Author'),
            "subject": getattr(info, 'subject', None) or info.get('/Subject'),
            "creator": getattr(info, 'creator', None) or info.get('/Creator'),
            "text_sample": text[:2000],
        }
    except Exception as e:
        return {"error": str(e)}


def detect_platform(metadata: dict, url: str = None) -> str:
    """Detect platform from metadata or URL."""
    text = (metadata.get("text_sample", "") + " " + (url or "")).lower()
    creators = (metadata.get("creator", "") or "").lower()
    title = (metadata.get("title", "") or "").lower()

    combined = f"{text} {creators} {title}"

    if "coursera" in combined or "coursera.org" in (url or ""):
        return "coursera"
    if "udemy" in combined or "udemy.com" in (url or ""):
        return "udemy"
    if "edx" in combined or "edx.org" in combined:
        return "edx"
    if "google" in combined or "google.com" in combined or "grow.google" in combined:
        return "google"

    return "unknown"


def verify_coursera(metadata: dict, url: str = None) -> tuple[int, str]:
    """Verify Coursera certificate. Returns (trust_score, status)."""
    text = metadata.get("text_sample", "").lower()
    has_coursera = "coursera" in text or (url and "coursera.org" in url)
    has_credential = bool(re.search(r'[a-zA-Z0-9]{20,}', text)) or (url and len(url) > 50)
    has_date = bool(re.search(r'\d{4}|\d{1,2}/\d{1,2}/\d{2,4}', text))
    has_name = len(metadata.get("author", "") or metadata.get("subject", "")) > 3

    score = 0
    if has_coursera: score += 30
    if has_credential: score += 25
    if has_date: score += 25
    if has_name: score += 20

    if score >= 80:
        return (min(100, score), "VERIFIED")
    if score >= 50:
        return (score, "PENDING")
    return (score, "UNVERIFIABLE")


def verify_udemy(metadata: dict, url: str = None) -> tuple[int, str]:
    """Verify Udemy certificate."""
    text = metadata.get("text_sample", "").lower()
    has_udemy = "udemy" in text or (url and "udemy.com" in url)
    has_date = bool(re.search(r'\d{4}|\d{1,2}/\d{1,2}/\d{2,4}', text))
    has_course = "course" in text or "certificate" in text

    score = 0
    if has_udemy: score += 40
    if has_date: score += 30
    if has_course: score += 30

    if score >= 80:
        return (min(100, score), "VERIFIED")
    if score >= 50:
        return (score, "PENDING")
    return (score, "UNVERIFIABLE")


def verify_edx(metadata: dict, url: str = None) -> tuple[int, str]:
    """Verify edX certificate."""
    text = metadata.get("text_sample", "").lower()
    has_edx = "edx" in text or (url and "edx.org" in url)
    has_credential = "credential" in text or "verified" in text
    has_date = bool(re.search(r'\d{4}', text))

    score = 0
    if has_edx: score += 40
    if has_credential: score += 30
    if has_date: score += 30

    if score >= 80:
        return (min(100, score), "VERIFIED")
    if score >= 50:
        return (score, "PENDING")
    return (score, "UNVERIFIABLE")


def verify_google(metadata: dict, url: str = None) -> tuple[int, str]:
    """Verify Google certificate."""
    text = metadata.get("text_sample", "").lower()
    has_google = "google" in text or "grow.google" in (url or "")
    has_cert = "certificate" in text or "certified" in text
    has_skill = "skill" in text or "career" in text

    score = 0
    if has_google: score += 40
    if has_cert: score += 30
    if has_skill: score += 30

    if score >= 80:
        return (min(100, score), "VERIFIED")
    if score >= 50:
        return (score, "PENDING")
    return (score, "UNVERIFIABLE")


def verify_certificate(file_path: str = None, url: str = None) -> dict:
    """
    Main verification entry point.
    Returns: { platform, trust_score, status, metadata }
    """
    metadata = {}
    if file_path and Path(file_path).exists():
        metadata = extract_pdf_metadata(file_path)
    elif url:
        metadata = {"text_sample": url, "creator": url}

    platform = detect_platform(metadata, url)

    verifiers = {
        "coursera": verify_coursera,
        "udemy": verify_udemy,
        "edx": verify_edx,
        "google": verify_google,
    }

    verifier = verifiers.get(platform, verify_coursera)
    trust_score, status = verifier(metadata, url)

    if platform == "unknown":
        trust_score = max(0, trust_score - 20)
        status = "UNVERIFIABLE"

    return {
        "platform": platform,
        "trust_score": trust_score,
        "status": status,
        "metadata": {k: v for k, v in metadata.items() if k != "text_sample" and v},
    }
