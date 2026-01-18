"""
Scoring Engine
Calculates domain-wise skill scores based on multiple factors
"""

from config import SCORING_WEIGHTS

def calculate_score(responses):
    """
    Calculate skill scores for a candidate based on responses
    
    Args:
        responses: List of response dictionaries
        
    Returns:
        Dictionary with domain-wise scores
    """
    if not responses:
        return {}
    
    # Group responses by domain
    domain_responses = {}
    for response in responses:
        domain = response.get('domain', 'general')
        if domain not in domain_responses:
            domain_responses[domain] = []
        domain_responses[domain].append(response)
    
    scores = {}
    
    for domain, domain_resps in domain_responses.items():
        # Calculate individual components
        task_performance = calculate_task_performance(domain_resps)
        accuracy_score = calculate_accuracy(domain_resps)
        time_score = calculate_time_efficiency(domain_resps)
        learning_score = calculate_learning_indicators(domain_resps)
        
        # Get average difficulty
        avg_difficulty = get_average_difficulty(domain_resps)
        
        # Weighted total score
        total_score = (
            task_performance * SCORING_WEIGHTS['task_performance'] +
            accuracy_score * SCORING_WEIGHTS['accuracy'] +
            time_score * SCORING_WEIGHTS['time_efficiency'] +
            learning_score * SCORING_WEIGHTS['learning_indicators'] +
            avg_difficulty * SCORING_WEIGHTS['difficulty']
        )
        
        scores[domain] = {
            'skill_score': round(task_performance, 2),
            'accuracy_score': round(accuracy_score, 2),
            'time_score': round(time_score, 2),
            'learning_score': round(learning_score, 2),
            'total_score': round(total_score, 2)
        }
    
    return scores

def calculate_task_performance(responses):
    """Calculate task performance score (0-100)"""
    if not responses:
        return 0.0
    
    correct_count = sum(1 for r in responses if r.get('is_correct', False))
    total_count = len(responses)
    
    return (correct_count / total_count) * 100 if total_count > 0 else 0.0

def calculate_accuracy(responses):
    """Calculate accuracy score (0-100)"""
    return calculate_task_performance(responses)  # Same as task performance for now

def calculate_time_efficiency(responses):
    """Calculate time efficiency score (0-100)"""
    if not responses:
        return 0.0
    
    # Get time taken for each response
    times = [r.get('time_taken', 0) for r in responses if r.get('time_taken')]
    
    if not times:
        return 50.0  # Default middle score if no time data
    
    # Normalize: faster = better (inverse relationship)
    # This is a simplified version - can be enhanced with domain-specific benchmarks
    avg_time = sum(times) / len(times)
    
    # Normalize to 0-100 (assuming reasonable time limits)
    # Adjust these thresholds based on actual assessment time limits
    max_reasonable_time = 600  # 10 minutes
    efficiency = max(0, 100 - (avg_time / max_reasonable_time * 100))
    
    return min(100, max(0, efficiency))

def calculate_learning_indicators(responses):
    """Calculate learning indicators score (0-100)"""
    if len(responses) < 2:
        return 50.0  # Not enough data
    
    # Check for improvement trend
    # Sort by submission time if available, otherwise by order
    sorted_responses = sorted(responses, key=lambda x: x.get('submitted_at', ''))
    
    # Calculate improvement: later responses should be better
    first_half = sorted_responses[:len(sorted_responses)//2]
    second_half = sorted_responses[len(sorted_responses)//2:]
    
    first_accuracy = calculate_task_performance(first_half)
    second_accuracy = calculate_task_performance(second_half)
    
    if first_accuracy == 0:
        improvement = 50.0  # Neutral if no baseline
    else:
        improvement = ((second_accuracy - first_accuracy) / first_accuracy) * 100
        # Normalize to 0-100
        improvement = min(100, max(0, 50 + improvement))
    
    return improvement

def get_average_difficulty(responses):
    """Get average difficulty score (0-100)"""
    if not responses:
        return 0.0
    
    difficulty_map = {'easy': 33, 'medium': 66, 'hard': 100}
    difficulties = [difficulty_map.get(r.get('difficulty', 'medium'), 66) for r in responses]
    
    return sum(difficulties) / len(difficulties) if difficulties else 0.0
