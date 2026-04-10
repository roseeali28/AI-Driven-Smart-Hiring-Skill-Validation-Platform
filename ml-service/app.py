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
    """Verify certificate from uploaded file (PDF or Image)."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    ext = file.filename.lower().split('.')[-1]
    if ext not in ['pdf', 'jpg', 'jpeg', 'png']:
        return jsonify({"error": f"Unsupported file type: {ext}"}), 400

    import tempfile
    with tempfile.NamedTemporaryFile(suffix=f'.{ext}', delete=False) as tf:
        file.save(tf.name)
        try:
            result = verify_certificate(file_path=tf.name)
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e), "trust_score": 0, "status": "FAILED"}), 500
        finally:
            if os.path.exists(tf.name):
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


# ─────────────────────────────────────────────
# Known skills list for resume parsing
# ─────────────────────────────────────────────
KNOWN_SKILLS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Rust", "Swift",
    "Kotlin", "PHP", "Ruby", "Scala", "R", "MATLAB", "Dart", "Perl",
    "React", "Vue", "Angular", "Next.js", "Nuxt", "Svelte", "jQuery",
    "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel",
    "Rails", "ASP.NET", "Hibernate", "GraphQL", "REST", "gRPC",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra",
    "Elasticsearch", "DynamoDB", "Firebase", "Supabase",
    "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux", "Git", "GitHub",
    "CI/CD", "Jenkins", "Terraform", "Ansible", "Nginx",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "scikit-learn",
    "NLP", "Computer Vision", "LLM", "Transformers", "Pandas", "NumPy",
    "Matplotlib", "Spark", "Hadoop", "Airflow", "dbt",
    "HTML", "CSS", "Sass", "Tailwind", "Bootstrap", "Figma",
    "Microservices", "Kafka", "RabbitMQ", "WebSockets", "gRPC",
    "Selenium", "Cypress", "Jest", "PyTest", "JUnit", "Testing",
    "Blockchain", "Smart Contracts", "Solidity",
    "Unity", "Unreal Engine", "OpenGL",
    "Excel", "PowerBI", "Tableau", "SQL",
]


def extract_skills(text):
    """Extract skills from text using keyword matching (case-insensitive)."""
    text_lower = text.lower()
    found = []
    for skill in KNOWN_SKILLS:
        if skill.lower() in text_lower and skill not in found:
            found.append(skill)
    return found


# ─────────────────────────────────────────────
# RESUME PARSING
# ─────────────────────────────────────────────
@app.route('/parse/resume', methods=['POST'])
def parse_resume():
    """Parse a PDF resume and extract skills, education, and name."""
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded", "skills": []}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected", "skills": []}), 400

    text = ""
    import tempfile

    with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tf:
        file.save(tf.name)
        tmp_path = tf.name

    try:
        # Try PyPDF2 first
        try:
            import PyPDF2
            with open(tmp_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                text = " ".join(
                    (page.extract_text() or "") for page in reader.pages
                )
        except ImportError:
            pass

        # Fallback: pdfplumber
        if not text.strip():
            try:
                import pdfplumber
                with pdfplumber.open(tmp_path) as pdf:
                    text = " ".join(
                        (page.extract_text() or "") for page in pdf.pages
                    )
            except ImportError:
                pass

        if not text.strip():
            # Neither library available — return empty skills gracefully
            return jsonify({
                "skills": [],
                "education": [],
                "fullName": "",
                "note": "Install PyPDF2 or pdfplumber for full parsing: pip install PyPDF2"
            })

    finally:
        try:
            import os
            os.unlink(tmp_path)
        except Exception:
            pass

    skills = extract_skills(text)

    # Basic name extraction: first non-empty line that looks like a name
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    full_name = ""
    for line in lines[:5]:
        words = line.split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
            full_name = line
            break

    # Education keywords
    edu_keywords = ["B.Tech", "M.Tech", "B.E", "M.E", "BSc", "MSc", "BCA", "MCA",
                    "Bachelor", "Master", "Diploma", "Ph.D", "MBA"]
    education = [l for l in lines if any(k.lower() in l.lower() for k in edu_keywords)][:3]

    return jsonify({
        "skills": skills,
        "education": education,
        "fullName": full_name,
        "raw_text_length": len(text),
    })


# ─────────────────────────────────────────────
# INTERVIEW AI ROUTES
# ─────────────────────────────────────────────
INTERVIEW_QUESTIONS_BANK = {
    "behavioral": [
        "Tell me about a time you had to work with a difficult team member. How did you handle it?",
        "Describe a situation where you had to meet a tight deadline. What was your approach?",
        "Give an example of when you identified and solved a critical problem before it escalated.",
        "Tell me about a project you're most proud of. What was your specific contribution?",
        "Describe a time you received critical feedback. How did you respond and what changed?",
        "Tell me about a time you had to learn a new technology quickly. What was your process?",
        "Give an example of when you had to make a decision with incomplete information.",
        "Describe a situation where you went above and beyond what was expected.",
    ],
    "technical": [
        "Explain the difference between synchronous and asynchronous programming with a real-world example.",
        "How would you design a scalable URL shortening service like bit.ly?",
        "What is the difference between REST and GraphQL? When would you choose one over the other?",
        "Explain SQL vs NoSQL databases and when you would use each.",
        "What is a race condition and how do you prevent it in concurrent code?",
        "How does JWT authentication work and what are its security considerations?",
        "Explain database indexing and when it helps and hurts performance.",
        "What is Docker and how does containerization improve the development workflow?",
    ],
}


@app.route('/api/interview/questions', methods=['POST'])
def generate_questions():
    """Generate interview questions based on role, type, level, and count."""
    data = request.get_json() or {}
    role = data.get('role', 'Software Engineer')
    q_type = data.get('type', 'mixed')
    level = data.get('level', 'mid')
    count = min(int(data.get('count', 5)), 8)

    try:
        # Try Gemini API if key is set
        import google.generativeai as genai
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            return jsonify({"error": "Gemini API key is not configured in the environment. Please add GEMINI_API_KEY to your .env file."}), 400
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = (
            f"Generate exactly {count} {q_type} interview questions for a {level}-level {role}. "
            f"Return ONLY a JSON array of strings, no explanation. Example format:\n"
            f'["Question 1?", "Question 2?"]'
        )
        response = model.generate_content(prompt)
        import json, re
        match = re.search(r'\[.*\]', response.text, re.DOTALL)
        if match:
            raw_qs = json.loads(match.group())
            questions = [{"id": i+1, "text": q, "type": q_type} for i, q in enumerate(raw_qs[:count])]
            return jsonify({"questions": questions, "source": "gemini"})
        else:
            return jsonify({"error": "Failed to parse Gemini response"}), 500
    except Exception as e:
        pass  # Fall through to local bank

    # Fallback: use local bank
    import random
    bank = []
    if q_type in ('behavioral', 'mixed'):
        bank += INTERVIEW_QUESTIONS_BANK['behavioral']
    if q_type in ('technical', 'mixed'):
        bank += INTERVIEW_QUESTIONS_BANK['technical']

    random.shuffle(bank)
    questions = [{"id": i+1, "text": q, "type": q_type} for i, q in enumerate(bank[:count])]
    return jsonify({"questions": questions, "source": "local"})


@app.route('/api/interview/evaluate', methods=['POST'])
def evaluate_answer():
    """Evaluate an interview answer using STAR framework via Gemini or local heuristics."""
    data = request.get_json() or {}
    question = data.get('question', '')
    answer = data.get('answer', '')
    role = data.get('role', 'Software Engineer')

    if not answer or not question:
        return jsonify({"error": "question and answer are required"}), 400

    try:
        import google.generativeai as genai
        api_key = os.environ.get('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""Evaluate this {role} interview answer using the STAR method.

Question: {question}
Answer: {answer}

Return ONLY valid JSON with these exact keys:
{{
  "overallScore": <integer 1-10>,
  "star": {{
    "situation": "<X/10>",
    "task": "<X/10>",
    "action": "<X/10>",
    "result": "<X/10>"
  }},
  "feedback": "<2-3 sentence overall feedback>",
  "strengths": "<what was done well>",
  "improvements": "<specific improvement suggestion>"
}}"""
            import json, re
            response = model.generate_content(prompt)
            match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if match:
                eval_data = json.loads(match.group())
                return jsonify(eval_data)
    except Exception:
        pass

    # Local heuristic fallback
    words = answer.strip().split()
    word_count = len(words)
    has_situation = any(w in answer.lower() for w in ['when', 'situation', 'project', 'team', 'during', 'while'])
    has_task      = any(w in answer.lower() for w in ['task', 'goal', 'objective', 'needed', 'had to', 'responsible'])
    has_action    = any(w in answer.lower() for w in ['implemented', 'built', 'created', 'resolved', 'decided', 'did', 'applied', 'developed'])
    has_result    = any(w in answer.lower() for w in ['result', 'outcome', 'improved', 'achieved', 'increased', 'reduced', 'saved', 'delivered', 'finallyled', 'learned'])

    score_map = {True: 8, False: 4}
    base = (score_map[has_situation] + score_map[has_task] + score_map[has_action] + score_map[has_result]) // 4
    overall = max(min(base + (1 if word_count > 80 else 0), 10), 3)

    return jsonify({
        "overallScore": overall,
        "star": {
            "situation": f"{score_map[has_situation]}/10",
            "task":      f"{score_map[has_task]}/10",
            "action":    f"{score_map[has_action]}/10",
            "result":    f"{score_map[has_result]}/10",
        },
        "feedback": (
            "Good structure! Add quantifiable results to make a stronger impact."
            if overall >= 6 else
            "Try to structure your answer using STAR: Situation, Task, Action, Result."
        ),
        "strengths": "You addressed the core of the question." if overall >= 6 else "You attempted to answer the question.",
        "improvements": (
            "Quantify your results — e.g., 'reduced load time by 40%' is far stronger."
            if has_action else
            "Be more specific about the actions YOU personally took to solve the problem."
        ),
        "source": "local",
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
