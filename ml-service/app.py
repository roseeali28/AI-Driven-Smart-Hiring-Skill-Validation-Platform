"""
SkillFirst Hire - ML Service
Certificate verification, scoring, behavioral analysis
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from certificate_verifier import verify_certificate

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.environ.get('UPLOAD_FOLDER', '/tmp/skillfirst_uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "skillfirst-ml"})


@app.route('/verify/certificate', methods=['POST'])
def verify_cert():
    """Verify certificate from file path or URL."""
    data = request.get_json() or {}
    file_path = data.get('file_path')
    url = data.get('credential_url')

    if not file_path and not url:
        return jsonify({"error": "file_path or credential_url required"}), 400

    try:
        result = verify_certificate(file_path=file_path, url=url)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e), "trust_score": 0, "status": "FAILED"}), 500


@app.route('/verify/certificate/upload', methods=['POST'])
def verify_upload():
    """Verify certificate from uploaded file."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "Only PDF files supported"}), 400

    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tf:
        file.save(tf.name)
        try:
            result = verify_certificate(file_path=tf.name)
            return jsonify(result)
        finally:
            os.unlink(tf.name)


@app.route('/score/credibility', methods=['POST'])
def score_credibility():
    """Compute credibility score from assessment, coding, certificates, learning, skills."""
    from scoring_engine import (
        compute_learning_aptitude,
        compute_skill_relevance,
        compute_credibility_score,
    )

    data = request.get_json() or {}
    assessment_score = data.get('assessment_score')
    coding_score = data.get('coding_score')
    certificate_scores = data.get('certificate_scores') or []
    assessment_scores_list = data.get('assessment_scores_list') or []
    candidate_skills = data.get('candidate_skills') or []
    job_skills = data.get('job_skills') or []

    cert_avg = sum(certificate_scores) / len(certificate_scores) if certificate_scores else 50.0
    learning = compute_learning_aptitude(assessment_scores_list)
    skill_rel = compute_skill_relevance(candidate_skills, job_skills)

    result = compute_credibility_score(
        assessment_score=assessment_score,
        coding_score=coding_score or assessment_score,
        certificate_trust=cert_avg,
        learning_aptitude=learning,
        skill_relevance=skill_rel,
    )
    return jsonify(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
