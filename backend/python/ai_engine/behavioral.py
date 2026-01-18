"""
Behavioral Analysis Engine
Analyzes response patterns and learning trends
"""

def analyze_behavior(candidate_id, responses):
    """
    Analyze candidate behavior and learning patterns
    
    Args:
        candidate_id: Candidate ID
        responses: List of response dictionaries
        
    Returns:
        Dictionary with behavioral analysis results
    """
    if not responses:
        return {
            'candidate_id': candidate_id,
            'improvement_trend': 0.0,
            'adaptability_score': 50.0,
            'learning_curve': 50.0,
            'response_pattern': {}
        }
    
    # Sort responses by time (if available)
    sorted_responses = sorted(responses, key=lambda x: x.get('submitted_at', ''))
    
    # Calculate improvement trend
    improvement_trend = calculate_improvement_trend(sorted_responses)
    
    # Calculate adaptability (how well they adapt to different difficulty levels)
    adaptability_score = calculate_adaptability(responses)
    
    # Calculate learning curve
    learning_curve = calculate_learning_curve(sorted_responses)
    
    # Analyze response patterns
    response_pattern = analyze_response_patterns(responses)
    
    return {
        'candidate_id': candidate_id,
        'improvement_trend': round(improvement_trend, 2),
        'adaptability_score': round(adaptability_score, 2),
        'learning_curve': round(learning_curve, 2),
        'response_pattern': response_pattern
    }

def calculate_improvement_trend(responses):
    """Calculate improvement percentage over time"""
    if len(responses) < 2:
        return 0.0
    
    # Split into halves
    mid = len(responses) // 2
    first_half = responses[:mid]
    second_half = responses[mid:]
    
    first_correct = sum(1 for r in first_half if r.get('is_correct', False))
    second_correct = sum(1 for r in second_half if r.get('is_correct', False))
    
    first_rate = first_correct / len(first_half) if first_half else 0
    second_rate = second_correct / len(second_half) if second_half else 0
    
    if first_rate == 0:
        return 0.0
    
    improvement = ((second_rate - first_rate) / first_rate) * 100
    return improvement

def calculate_adaptability(responses):
    """Calculate adaptability score based on performance across difficulty levels"""
    difficulty_performance = {'easy': [], 'medium': [], 'hard': []}
    
    for response in responses:
        difficulty = response.get('difficulty', 'medium')
        is_correct = response.get('is_correct', False)
        difficulty_performance[difficulty].append(1 if is_correct else 0)
    
    # Calculate performance per difficulty
    performance_scores = []
    for difficulty, results in difficulty_performance.items():
        if results:
            performance_scores.append(sum(results) / len(results) * 100)
    
    if not performance_scores:
        return 50.0
    
    # Adaptability = consistency across difficulty levels
    # Lower variance = higher adaptability
    avg_performance = sum(performance_scores) / len(performance_scores)
    variance = sum((s - avg_performance) ** 2 for s in performance_scores) / len(performance_scores)
    
    # Convert variance to adaptability score (inverse relationship)
    adaptability = max(0, 100 - (variance * 10))
    return adaptability

def calculate_learning_curve(responses):
    """Calculate learning curve steepness"""
    if len(responses) < 3:
        return 50.0
    
    # Calculate accuracy for each third
    third_size = len(responses) // 3
    thirds = [
        responses[:third_size],
        responses[third_size:2*third_size],
        responses[2*third_size:]
    ]
    
    accuracies = []
    for third in thirds:
        if third:
            correct = sum(1 for r in third if r.get('is_correct', False))
            accuracies.append(correct / len(third) * 100)
    
    if len(accuracies) < 2:
        return 50.0
    
    # Calculate slope (steepness)
    if len(accuracies) == 3:
        slope = (accuracies[2] - accuracies[0]) / 2
    else:
        slope = accuracies[-1] - accuracies[0]
    
    # Normalize to 0-100
    learning_curve = min(100, max(0, 50 + slope))
    return learning_curve

def analyze_response_patterns(responses):
    """Analyze response patterns"""
    patterns = {
        'total_responses': len(responses),
        'correct_responses': sum(1 for r in responses if r.get('is_correct', False)),
        'average_time': 0,
        'difficulty_distribution': {}
    }
    
    # Calculate average time
    times = [r.get('time_taken', 0) for r in responses if r.get('time_taken')]
    if times:
        patterns['average_time'] = sum(times) / len(times)
    
    # Difficulty distribution
    for response in responses:
        difficulty = response.get('difficulty', 'medium')
        patterns['difficulty_distribution'][difficulty] = \
            patterns['difficulty_distribution'].get(difficulty, 0) + 1
    
    return patterns
