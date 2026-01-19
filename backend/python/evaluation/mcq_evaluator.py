"""
MCQ Evaluator
Evaluates multiple choice question responses
"""

def evaluate_mcq(response, correct_answer):
    """
    Evaluate MCQ response
    
    Args:
        response: Candidate's answer (string)
        correct_answer: Correct answer (string)
    
    Returns:
        Dictionary with evaluation results
    """
    # Normalize for comparison
    response_normalized = response.strip().lower()
    correct_normalized = correct_answer.strip().lower()
    
    is_correct = response_normalized == correct_normalized
    
    return {
        'is_correct': is_correct,
        'response': response,
        'correct_answer': correct_answer,
        'score': 100 if is_correct else 0
    }
