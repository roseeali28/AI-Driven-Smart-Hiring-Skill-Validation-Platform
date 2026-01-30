"""
Python AI Service - Flask Application
Main entry point for AI/ML evaluation services
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(__file__))

from config import FLASK_HOST, FLASK_PORT, FLASK_DEBUG
from ai_engine.scoring import calculate_score
from ai_engine.ranking import rank_candidates
from ai_engine.behavioral import analyze_behavior
from evaluation.code_evaluator import evaluate_code
from evaluation.mcq_evaluator import evaluate_mcq

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Evaluation Engine'
    }), 200

@app.route('/ai/evaluate', methods=['POST'])
def evaluate():
    """
    Evaluate candidate responses and generate scores
    Expected JSON:
    {
        "candidate_id": int,
        "responses": [
            {
                "assessment_id": int,
                "response_text": str,
                "is_correct": bool,
                "time_taken": int,
                "difficulty": str,
                "domain": str
            }
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'responses' not in data:
            return jsonify({
                'success': False,
                'message': 'Invalid request data'
            }), 400
        
        candidate_id = data.get('candidate_id')
        responses = data.get('responses', [])
        
        # Calculate scores
        scores = calculate_score(responses)
        
        return jsonify({
            'success': True,
            'candidate_id': candidate_id,
            'scores': scores
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/ai/rank', methods=['POST'])
def rank():
    """
    Generate candidate rankings
    Expected JSON:
    {
        "candidates": [
            {
                "candidate_id": int,
                "scores": {
                    "domain": str,
                    "total_score": float,
                    ...
                }
            }
        ],
        "role_match": str
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'candidates' not in data:
            return jsonify({
                'success': False,
                'message': 'Invalid request data'
            }), 400
        
        candidates = data.get('candidates', [])
        role_match = data.get('role_match', 'General')
        
        # Generate rankings
        rankings = rank_candidates(candidates, role_match)
        
        return jsonify({
            'success': True,
            'rankings': rankings
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/ai/analyze', methods=['POST'])
def analyze():
    """
    Behavioral analysis
    Expected JSON:
    {
        "candidate_id": int,
        "responses": [...]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'responses' not in data:
            return jsonify({
                'success': False,
                'message': 'Invalid request data'
            }), 400
        
        candidate_id = data.get('candidate_id')
        responses = data.get('responses', [])
        
        # Analyze behavior
        analysis = analyze_behavior(candidate_id, responses)
        
        return jsonify({
            'success': True,
            'candidate_id': candidate_id,
            'analysis': analysis
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/ai/explain/<int:candidate_id>', methods=['GET'])
def explain(candidate_id):
    """
    Get explainable insights for a candidate
    """
    try:
        # Placeholder - will be implemented with actual data
        return jsonify({
            'success': True,
            'candidate_id': candidate_id,
            'explanation': 'Score breakdown and ranking explanation will be provided here'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/evaluate/response', methods=['POST'])
def evaluate_response():
    """
    Evaluate a single response (MCQ or Coding)
    Expected JSON:
    {
        "type": "mcq" or "coding",
        "response": "answer text or code",
        "correct_answer": "correct answer" (for MCQ),
        "test_cases": {...} (for coding)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        response_type = data.get('type')
        response_text = data.get('response', '')
        
        if response_type == 'mcq':
            correct_answer = data.get('correct_answer', '')
            result = evaluate_mcq(response_text, correct_answer)
            
        elif response_type == 'coding':
            test_cases = data.get('test_cases', {})
            result = evaluate_code(response_text, test_cases)
            
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid type. Must be "mcq" or "coding"'
            }), 400
        
        return jsonify({
            'success': True,
            'result': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    print(f"Starting AI Service on {FLASK_HOST}:{FLASK_PORT}")
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
