"""
Ranking Engine
Generates candidate rankings with explainable reasoning
"""

def rank_candidates(candidates, role_match='General'):
    """
    Rank candidates based on their scores
    
    Args:
        candidates: List of candidate dictionaries with scores
        role_match: Role/job title being matched
        
    Returns:
        List of ranked candidates with explanations
    """
    if not candidates:
        return []
    
    # Calculate ranking score for each candidate
    ranked_candidates = []
    
    for candidate in candidates:
        candidate_id = candidate.get('candidate_id')
        scores = candidate.get('scores', {})
        
        # Calculate overall score (average of domain scores)
        domain_scores = []
        for domain, score_data in scores.items():
            if isinstance(score_data, dict):
                domain_scores.append(score_data.get('total_score', 0))
            else:
                domain_scores.append(score_data)
        
        overall_score = sum(domain_scores) / len(domain_scores) if domain_scores else 0
        
        # Generate explanation
        explanation = generate_explanation(candidate, scores, role_match)
        
        ranked_candidates.append({
            'candidate_id': candidate_id,
            'overall_score': round(overall_score, 2),
            'rank_position': 0,  # Will be set after sorting
            'explanation': explanation,
            'scores': scores
        })
    
    # Sort by overall score (descending)
    ranked_candidates.sort(key=lambda x: x['overall_score'], reverse=True)
    
    # Assign rank positions
    for idx, candidate in enumerate(ranked_candidates, start=1):
        candidate['rank_position'] = idx
    
    return ranked_candidates

def generate_explanation(candidate, scores, role_match):
    """
    Generate explainable ranking reason
    """
    explanations = []
    
    # Overall performance
    domain_scores = []
    for domain, score_data in scores.items():
        if isinstance(score_data, dict):
            domain_scores.append(score_data.get('total_score', 0))
        else:
            domain_scores.append(score_data)
    
    avg_score = sum(domain_scores) / len(domain_scores) if domain_scores else 0
    
    if avg_score >= 80:
        explanations.append(f"Excellent overall performance ({avg_score:.1f}%)")
    elif avg_score >= 60:
        explanations.append(f"Good overall performance ({avg_score:.1f}%)")
    else:
        explanations.append(f"Average performance ({avg_score:.1f}%)")
    
    # Domain strengths
    strong_domains = []
    for domain, score_data in scores.items():
        if isinstance(score_data, dict):
            domain_score = score_data.get('total_score', 0)
        else:
            domain_score = score_data
        
        if domain_score >= 75:
            strong_domains.append(domain.replace('_', ' ').title())
    
    if strong_domains:
        explanations.append(f"Strong in: {', '.join(strong_domains)}")
    
    # Role match
    explanations.append(f"Evaluated for: {role_match}")
    
    return ". ".join(explanations) + "."
