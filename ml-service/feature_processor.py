"""
Feature Processor — Extract and normalize features for scoring
Prepares raw candidate/job data into model-ready features
"""

from typing import List, Dict, Any, Optional


def extract_assessment_features(
    assessment_scores: List[float],
    time_per_question: Optional[List[int]] = None,
) -> Dict[str, float]:
    """
    Extract features from assessment performance.
    Returns normalized metrics for learning aptitude.
    """
    if not assessment_scores:
        return {"mean_score": 50.0, "variance": 0.0, "consistency": 50.0}

    scores = [float(s) for s in assessment_scores]
    mean = sum(scores) / len(scores)
    variance = sum((s - mean) ** 2 for s in scores) / len(scores) if scores else 0
    consistency = max(0, 100 - variance * 2)  # Lower variance = higher consistency

    return {
        "mean_score": mean,
        "variance": variance,
        "consistency": round(consistency, 1),
    }


def extract_certificate_features(
    certificate_scores: List[int],
    certificate_statuses: Optional[List[str]] = None,
) -> Dict[str, float]:
    """
    Extract features from certificate verification.
    """
    if not certificate_scores:
        return {"trust_avg": 50.0, "verified_count": 0, "trust_score": 50.0}

    scores = [int(s) for s in certificate_scores]
    trust_avg = sum(scores) / len(scores)
    verified = sum(1 for s in (certificate_statuses or []) if str(s).upper() == "VERIFIED") if certificate_statuses else len(scores)

    return {
        "trust_avg": trust_avg,
        "verified_count": verified,
        "trust_score": min(100, trust_avg),
    }


def extract_skill_features(
    candidate_skills: List[str],
    job_skills: List[str],
) -> Dict[str, float]:
    """
    Extract skill relevance features.
    """
    if not job_skills:
        return {"overlap": 1.0, "relevance": 80.0}

    cs = set(s.lower().strip() for s in (candidate_skills or []))
    js = set(s.lower().strip() for s in job_skills)
    overlap = len(cs & js) / len(js) if js else 1.0

    return {
        "overlap": overlap,
        "relevance": round(min(100, overlap * 100), 1),
    }


def process_candidate_features(
    assessment_score: float,
    coding_score: Optional[float],
    certificate_scores: List[int],
    assessment_scores_list: List[float],
    candidate_skills: List[str],
    job_skills: List[str],
    certificate_statuses: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Process all raw inputs into a unified feature dict for scoring.
    """
    features = {}

    # Assessment
    assess_feat = extract_assessment_features(assessment_scores_list)
    features["assessment_mean"] = assessment_score or assess_feat["mean_score"]
    features["coding_score"] = coding_score or assessment_score or 50.0
    features["learning_consistency"] = assess_feat["consistency"]

    # Certificates
    cert_feat = extract_certificate_features(certificate_scores, certificate_statuses)
    features["certificate_trust"] = cert_feat["trust_score"]

    # Skills
    skill_feat = extract_skill_features(candidate_skills, job_skills)
    features["skill_relevance"] = skill_feat["relevance"]

    return features
