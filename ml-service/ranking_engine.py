"""
Ranking Engine — Rank candidates by credibility score with justification
"""

from typing import List, Dict, Any


def rank_candidates(
    candidates: List[Dict[str, Any]],
    score_key: str = "total_score",
) -> List[Dict[str, Any]]:
    """
    Rank candidates by score (descending).
    Adds rank and justification.
    """
    if not candidates:
        return []

    sorted_list = sorted(
        candidates,
        key=lambda c: float(c.get(score_key, 0) or 0),
        reverse=True,
    )

    result = []
    for i, c in enumerate(sorted_list):
        rank = i + 1
        justification = _generate_justification(c, rank)
        result.append({
            **c,
            "rank": rank,
            "justification": justification,
        })

    return result


def _generate_justification(candidate: Dict[str, Any], rank: int) -> str:
    """
    Generate human-readable justification for ranking.
    """
    parts = []

    score = float(candidate.get("total_score", 0) or 0)
    parts.append(f"Credibility score: {score:.1f}/100")

    breakdown = candidate.get("breakdown") or {}
    if isinstance(breakdown, dict):
        top_factors = []
        for k, v in breakdown.items():
            if isinstance(v, dict) and "contribution" in v:
                top_factors.append((k.replace("_", " ").title(), v["contribution"]))
        top_factors.sort(key=lambda x: x[1], reverse=True)
        if top_factors:
            parts.append(f"Strongest factor: {top_factors[0][0]} ({top_factors[0][1]:.1f})")

    certs = candidate.get("certificatesVerified", 0)
    if certs > 0:
        parts.append(f"{certs} verified certificate(s)")

    return ". ".join(parts)


def compare_candidates(
    candidate_a: Dict[str, Any],
    candidate_b: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Compare two candidates and return a comparison summary.
    """
    score_a = float(candidate_a.get("total_score", 0) or 0)
    score_b = float(candidate_b.get("total_score", 0) or 0)

    breakdown_a = candidate_a.get("breakdown") or {}
    breakdown_b = candidate_b.get("breakdown") or {}

    comparisons = []
    for key in set(list(breakdown_a.keys()) + list(breakdown_b.keys())):
        va = breakdown_a.get(key, {})
        vb = breakdown_b.get(key, {})
        if isinstance(va, dict) and isinstance(vb, dict):
            ca = va.get("value", va.get("contribution", 0))
            cb = vb.get("value", vb.get("contribution", 0))
            diff = float(ca or 0) - float(cb or 0)
            if abs(diff) > 0.1:
                comparisons.append({
                    "factor": key,
                    "candidate_a": ca,
                    "candidate_b": cb,
                    "difference": round(diff, 1),
                })

    return {
        "candidate_a_score": score_a,
        "candidate_b_score": score_b,
        "score_difference": round(score_a - score_b, 1),
        "factor_comparisons": comparisons,
    }
