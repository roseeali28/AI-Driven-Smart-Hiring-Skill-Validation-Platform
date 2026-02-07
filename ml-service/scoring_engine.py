"""
AI Credibility Scoring Engine
Hybrid rule-based + transparent scoring
"""

def compute_learning_aptitude(assessment_scores: list, time_per_question: list = None) -> float:
    """
    Simple learning aptitude from consistency and time patterns.
    Returns 0-100.
    """
    if not assessment_scores:
        return 50.0  # Neutral

    avg = sum(assessment_scores) / len(assessment_scores)
    # Consistency: lower variance = higher aptitude
    variance = sum((s - avg) ** 2 for s in assessment_scores) / len(assessment_scores)
    consistency_bonus = max(0, 20 - variance * 0.5)

    score = min(100, avg * 0.8 + consistency_bonus)
    return round(score, 1)


def compute_skill_relevance(candidate_skills: list, job_skills: list) -> float:
    """Keyword overlap for skill-job relevance. Returns 0-100."""
    if not job_skills:
        return 80.0  # No requirements = assume fit

    cs = set(s.lower().strip() for s in (candidate_skills or []))
    js = set(s.lower().strip() for s in job_skills)
    overlap = len(cs & js) / len(js) if js else 1.0
    return round(min(100, overlap * 100), 1)


def compute_credibility_score(
    assessment_score: float,
    coding_score: float,
    certificate_trust: float,
    learning_aptitude: float,
    skill_relevance: float,
    weights: dict = None,
) -> dict:
    """
    Weighted linear combination for explainable scoring.
    weights: assessment, coding, certificate, learning, skill_relevance
    """
    w = weights or {
        "assessment": 0.35,
        "coding": 0.25,
        "certificate": 0.20,
        "learning": 0.10,
        "skill_relevance": 0.10,
    }

    def contrib(val, key):
        v = float(val) if val is not None else 50.0
        return round(v * w[key], 1)

    c_assess = contrib(assessment_score, "assessment")
    c_coding = contrib(coding_score, "coding")
    c_cert = contrib(certificate_trust, "certificate")
    c_learn = contrib(learning_aptitude, "learning")
    c_skill = contrib(skill_relevance, "skill_relevance")

    total = c_assess + c_coding + c_cert + c_learn + c_skill

    return {
        "total_score": round(total, 1),
        "breakdown": {
            "assessment_score": {"value": assessment_score or 0, "weight": w["assessment"], "contribution": c_assess},
            "coding_score": {"value": coding_score or 0, "weight": w["coding"], "contribution": c_coding},
            "certificate_trust": {"value": certificate_trust or 0, "weight": w["certificate"], "contribution": c_cert},
            "learning_aptitude": {"value": learning_aptitude or 0, "weight": w["learning"], "contribution": c_learn},
            "skill_relevance": {"value": skill_relevance or 0, "weight": w["skill_relevance"], "contribution": c_skill},
        },
    }
