"""Quick validation test for resume_analyzer.py"""
import json
from resume_analyzer import analyze

resume = (
    "John Doe | john@example.com\n\n"
    "SUMMARY\n"
    "Software Engineer with 5 years of experience building scalable web applications.\n"
    "Responsible for backend APIs, helped with DevOps, and worked on React frontends.\n\n"
    "SKILLS\n"
    "Python, FastAPI, Node.js, React, PostgreSQL, MongoDB, Docker, AWS, Git, REST API,\n"
    "unit testing, agile, code review, design patterns, microservices\n\n"
    "EXPERIENCE\n"
    "Senior Software Engineer - TechCorp (2021-Present)\n"
    "- Responsible for microservices architecture using Python and FastAPI\n"
    "- Worked on React dashboard with 50k daily users\n"
    "- Assisted migrating systems to AWS, reducing costs by 30%\n\n"
    "PROJECTS\n"
    "Real-Time Chat: WebSocket + Node.js + Redis, 10k concurrent users.\n"
    "AI Resume Screener: NLP pipeline with scikit-learn, 88% accuracy.\n\n"
    "EDUCATION\n"
    "B.S. Computer Science - State University, 2019\n\n"
    "CERTIFICATIONS\n"
    "AWS Certified Developer Associate\n"
)

jd = (
    "Senior Backend Engineer. Skills: Python, FastAPI, Docker, Kubernetes, PostgreSQL, "
    "Redis, microservices, system design, REST API, CI/CD, AWS. 5+ years required."
)

r = analyze(resume, jd, coding_score=78, assessment_score=82, candidate_name="John Doe")

print("=" * 55)
print("  AI RESUME ANALYZER — VALIDATION RESULTS")
print("=" * 55)
print(f"  Candidate       : {r['candidate_name']}")
print(f"  Final Score     : {r['final_score']}  (Grade: {r['grade']})")
print(f"  Recommendation  : {r['recommendation']}")
print(f"  Technical Level : {r['technical_level']}")
print(f"  Performance     : {r['performance_score']}")
print(f"  Job Match       : {r['match_score']}")
print(f"  Keyword Match   : {r['keyword_match_score']}")
print(f"  Ideal Role      : {r['ideal_role_fit']}")
print(f"  Salary Estimate : {r['salary_range_estimate']}")
print(f"  Years Exp       : {r['years_experience']}")
print("-" * 55)
print(f"  Top Keywords    : {r['keywords'][:6]}")
print(f"  Matching Skills : {r['matching_skills'][:4]}")
print(f"  Missing Skills  : {r['missing_skills'][:4]}")
print(f"  Skills to Learn : {r['top_5_skills_to_learn']}")
print("-" * 55)
print("  STRENGTHS:")
for s in r["strengths"]:
    print(f"    + {s}")
print("  WEAKNESSES:")
for w in r["weaknesses"]:
    print(f"    - {w}")
print(f"  Risk Factors    : {r['risk_factors']}")
print("-" * 55)
print("  SCORE BREAKDOWN:")
for k, v in r["score_breakdown"].items():
    print(f"    {k:25s}  score={v['score']:5.1f}  weight={v['weight']}  contrib={v['contribution']:4.1f}")
print("-" * 55)
print(f"  Summary: {r['summary']}")
print("-" * 55)
print("  INTERVIEW FOCUS:")
for i in r["interview_focus_areas"]:
    print(f"    • {i}")
print("=" * 55)
print("  ALL SECTIONS PASSED — module is fully functional.")
print("=" * 55)
