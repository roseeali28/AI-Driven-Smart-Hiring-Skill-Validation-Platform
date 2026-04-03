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

# Exact JSON shape the user requested
output = {
    "keywords": r["keywords"][:10],
    "match_score": r["match_score"],
    "strengths": r["strengths"],
    "weaknesses": r["weaknesses"],
    "skill_gaps": r["skill_gaps"],
    "resume_improvements": r["resume_improvements"],
    "final_score": r["final_score"],
    "recommendation": r["recommendation"],
    "performance_score": r["performance_score"],
    "summary": r["summary"],
}

with open("_output.json", "w") as f:
    json.dump(output, f, indent=2)
print(json.dumps(output, indent=2))
