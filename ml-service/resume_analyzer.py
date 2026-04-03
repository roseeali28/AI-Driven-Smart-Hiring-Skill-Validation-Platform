"""
AI Resume Analyzer — SkillFirst Hire
======================================
Full-spectrum analysis engine:
  1. Resume Parsing & Keyword Extraction
  2. AI Performance Analysis
  3. Job Matching & Skill Gap Analysis
  4. Resume Optimization Engine
  5. AI Recruiter Insights
  6. Smart Scoring System

Returns structured JSON ready for recruiter dashboards.
"""

import re
import math
from typing import List, Dict, Any, Optional


# ---------------------------------------------------------------------------
# 1. SKILL NORMALIZATION MAP
# ---------------------------------------------------------------------------
SKILL_NORMALIZATION: Dict[str, str] = {
    # Backend
    "node.js": "Node.js / Backend",
    "nodejs": "Node.js / Backend",
    "express": "Node.js / Backend",
    "express.js": "Node.js / Backend",
    "fastapi": "Python / Backend",
    "flask": "Python / Backend",
    "django": "Python / Backend",
    "spring boot": "Java / Backend",
    "spring": "Java / Backend",
    "laravel": "PHP / Backend",
    # Frontend
    "react": "React.js / Frontend",
    "react.js": "React.js / Frontend",
    "reactjs": "React.js / Frontend",
    "next.js": "Next.js / Frontend",
    "nextjs": "Next.js / Frontend",
    "vue": "Vue.js / Frontend",
    "vue.js": "Vue.js / Frontend",
    "angular": "Angular / Frontend",
    "svelte": "Svelte / Frontend",
    # Databases
    "mongodb": "MongoDB / NoSQL",
    "mongoose": "MongoDB / NoSQL",
    "postgres": "PostgreSQL / SQL",
    "postgresql": "PostgreSQL / SQL",
    "mysql": "MySQL / SQL",
    "redis": "Redis / Caching",
    "elasticsearch": "Elasticsearch / Search",
    # DevOps / Cloud
    "docker": "Docker / Containerization",
    "kubernetes": "Kubernetes / Orchestration",
    "k8s": "Kubernetes / Orchestration",
    "aws": "AWS / Cloud",
    "gcp": "GCP / Cloud",
    "azure": "Azure / Cloud",
    "ci/cd": "CI/CD / DevOps",
    "github actions": "CI/CD / DevOps",
    "jenkins": "CI/CD / DevOps",
    # ML / AI
    "tensorflow": "TensorFlow / ML",
    "pytorch": "PyTorch / ML",
    "scikit-learn": "Scikit-learn / ML",
    "sklearn": "Scikit-learn / ML",
    "nlp": "NLP / AI",
    "machine learning": "Machine Learning / AI",
    "deep learning": "Deep Learning / AI",
    "llm": "LLMs / GenAI",
    "langchain": "LangChain / GenAI",
    # Languages
    "python": "Python",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "java": "Java",
    "go": "Golang",
    "golang": "Golang",
    "rust": "Rust",
    "c++": "C++",
    "c#": "C#",
    "ruby": "Ruby",
    "php": "PHP",
    # Soft skills
    "leadership": "Leadership",
    "communication": "Communication",
    "problem solving": "Problem Solving",
    "critical thinking": "Critical Thinking",
    "teamwork": "Teamwork",
    "agile": "Agile / Scrum",
    "scrum": "Agile / Scrum",
}

# Common ATS-critical keywords for software roles
COMMON_ATS_KEYWORDS = [
    "rest api", "microservices", "system design", "data structures",
    "algorithms", "unit testing", "agile", "git", "linux", "sql",
    "api design", "object-oriented", "oop", "design patterns",
    "scalability", "performance optimization", "security", "authentication",
    "authorization", "jwt", "oauth", "graphql", "grpc",
]

# Weak resume phrases to flag
WEAK_PHRASES = [
    "responsible for", "worked on", "helped with", "assisted in",
    "was involved in", "participated in", "familiar with", "knowledge of",
    "exposure to", "good understanding", "proficient in various",
    "etc.", "and more", "various tasks",
]

# Strong action verbs for resume rewrites
ACTION_VERBS = [
    "Architected", "Built", "Designed", "Developed", "Implemented",
    "Optimized", "Engineered", "Delivered", "Led", "Launched",
    "Automated", "Reduced", "Increased", "Improved", "Scaled",
    "Migrated", "Integrated", "Deployed", "Mentored", "Owned",
]

# Technical depth signals
ADVANCED_SIGNALS = [
    "system design", "distributed systems", "microservices", "kubernetes",
    "kafka", "grpc", "llm", "transformer", "neural network", "optimization",
    "scalability", "sharding", "load balancing", "caching", "cdn",
    "ci/cd", "devops", "infra", "terraform", "prometheus", "grafana",
]
INTERMEDIATE_SIGNALS = [
    "rest api", "docker", "sql", "nosql", "react", "node.js", "express",
    "unit testing", "git", "agile", "oauth", "jwt", "aws", "mongodb",
]
BEGINNER_SIGNALS = [
    "html", "css", "basic python", "hello world", "beginner",
    "introductory", "learning", "currently studying",
]

# Global salary bands (USD / year) by skill tier
SALARY_BANDS = {
    "Advanced": {"min": 120000, "max": 200000},
    "Intermediate": {"min": 75000, "max": 120000},
    "Beginner": {"min": 45000, "max": 75000},
}


# ---------------------------------------------------------------------------
# 2. TEXT UTILITIES
# ---------------------------------------------------------------------------

def tokenize(text: str) -> List[str]:
    """Lowercase, strip punctuation, split into words."""
    text = text.lower()
    text = re.sub(r"[^\w\s\.\+#/]", " ", text)
    return text.split()


def extract_years_experience(text: str) -> float:
    """Parse 'X years of experience' patterns from text."""
    patterns = [
        r"(\d+)\+?\s+years?\s+of\s+(?:professional\s+)?experience",
        r"(\d+)\+?\s+years?\s+(?:in|of)\s+(?:the\s+)?(?:industry|field|software|development)",
        r"experience[:\s]+(\d+)\+?\s+years?",
        r"(\d+)\+?\s+yrs?\s+exp",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return float(m.group(1))
    return 0.0


def extract_sections(resume_text: str) -> Dict[str, str]:
    """Split resume into known sections."""
    section_headers = [
        "summary", "objective", "experience", "work experience",
        "employment", "education", "skills", "technical skills",
        "projects", "certifications", "certificates", "achievements",
        "awards", "publications",
    ]
    text_lower = resume_text.lower()
    sections: Dict[str, str] = {}
    positions = []

    for header in section_headers:
        idx = text_lower.find(header)
        if idx != -1:
            positions.append((idx, header))

    positions.sort()
    for i, (start, header) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(resume_text)
        sections[header] = resume_text[start:end].strip()

    return sections


# ---------------------------------------------------------------------------
# 3. KEYWORD EXTRACTION
# ---------------------------------------------------------------------------

def extract_keywords(resume_text: str, top_n: int = 15) -> Dict[str, Any]:
    """
    Extract top N meaningful keywords + normalize skill aliases.
    Returns:
      - keywords: list of top N extracted
      - normalized_skills: dict alias→canonical
      - raw_skills: all matched skills
    """
    text_lower = resume_text.lower()
    found: Dict[str, int] = {}

    # Match from skill normalization map (multi-word first, single-word after)
    all_aliases = sorted(SKILL_NORMALIZATION.keys(), key=lambda x: -len(x))
    for alias in all_aliases:
        if alias in text_lower:
            canonical = SKILL_NORMALIZATION[alias]
            found[canonical] = found.get(canonical, 0) + 1

    # Match common ATS keywords not already captured
    for kw in COMMON_ATS_KEYWORDS:
        if kw in text_lower and kw not in found:
            found[kw] = found.get(kw, 0) + 1

    # Frequency rank — pick top N by count, then alphabetical
    ranked = sorted(found.items(), key=lambda x: (-x[1], x[0]))
    top_keywords = [k for k, _ in ranked[:top_n]]

    return {
        "top_keywords": top_keywords,
        "total_matched": len(found),
        "raw_skills_map": dict(ranked),
    }


def compute_keyword_match_score(
    resume_keywords: List[str],
    jd_keywords: List[str],
) -> float:
    """Exact + partial overlap keyword match score (0–100)."""
    if not jd_keywords:
        return 80.0
    rk_lower = {k.lower() for k in resume_keywords}
    jd_lower = [j.lower() for j in jd_keywords]
    matched = sum(
        1 for jk in jd_lower
        if any(jk in rk or rk in jk for rk in rk_lower)
    )
    return round(min(100.0, (matched / len(jd_lower)) * 100), 1)


# ---------------------------------------------------------------------------
# 4. SEMANTIC JOB MATCHING
# ---------------------------------------------------------------------------

_SEMANTIC_BRIDGE: Dict[str, List[str]] = {
    "machine learning": ["python", "data science", "scikit-learn", "tensorflow", "pytorch", "statistics"],
    "backend development": ["rest api", "node.js", "fastapi", "django", "flask", "spring boot", "databases", "sql"],
    "frontend development": ["react", "vue", "angular", "html", "css", "javascript", "typescript", "ui/ux"],
    "devops": ["docker", "kubernetes", "ci/cd", "terraform", "aws", "gcp", "linux", "monitoring"],
    "data engineering": ["spark", "hadoop", "sql", "etl", "airflow", "kafka", "data pipeline"],
    "full stack": ["react", "node.js", "mongodb", "postgresql", "rest api", "javascript"],
    "security": ["authentication", "oauth", "jwt", "penetration testing", "owasp", "cryptography"],
    "cloud": ["aws", "gcp", "azure", "serverless", "lambda", "s3", "ec2"],
}


def semantic_match(resume_text: str, jd_text: str) -> Dict[str, Any]:
    """
    Semantic matching: goes beyond keyword overlap.
    Uses concept bridging and contextual inference.
    """
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    # Direct skill overlap
    jd_skill_list = [alias for alias in SKILL_NORMALIZATION if alias in jd_lower]
    resume_skill_list = [alias for alias in SKILL_NORMALIZATION if alias in resume_lower]

    jd_canonical = {SKILL_NORMALIZATION[s] for s in jd_skill_list}
    resume_canonical = {SKILL_NORMALIZATION[s] for s in resume_skill_list}

    direct_match = jd_canonical & resume_canonical
    missing = jd_canonical - resume_canonical

    # Semantic bridge: does the resume prove the concept even without the exact keyword?
    semantically_filled = set()
    for concept, related in _SEMANTIC_BRIDGE.items():
        concept_mentioned_in_jd = any(concept in jd_lower or r in jd_lower for r in related)
        resume_has_evidence = sum(1 for r in related if r in resume_lower)
        if concept_mentioned_in_jd and resume_has_evidence >= 2:
            semantically_filled.add(concept)

    effective_match = len(direct_match) + len(semantically_filled) * 0.7
    total_jd_skills = max(len(jd_canonical), 1)
    semantic_score = round(min(100.0, (effective_match / total_jd_skills) * 100), 1)

    missing_skills = [s for s in missing if s.split(" / ")[0].lower() not in semantically_filled]

    return {
        "match_score": semantic_score,
        "matching_skills": list(direct_match),
        "missing_skills": missing_skills[:10],
        "semantically_inferred": list(semantically_filled),
        "skill_gap_explanation": _build_gap_explanation(missing_skills, direct_match),
    }


def _build_gap_explanation(missing: List[str], matching: List[str]) -> str:
    if not missing:
        return "This candidate is an excellent skill match for the role."
    top_missing = missing[:3]
    return (
        f"Candidate demonstrates {len(matching)} matching competency areas. "
        f"Primary gaps are in: {', '.join(top_missing)}. "
        "These may be bridgeable through short upskilling tracks."
    )


def top_skills_to_learn(missing_skills: List[str], jd_text: str) -> List[str]:
    """Suggest top 5 skills the candidate should learn to qualify."""
    jd_lower = jd_text.lower()
    # Prioritize missing skills that appear most prominently in JD
    scored = []
    for skill in missing_skills:
        base_name = skill.split(" / ")[0].lower()
        freq = jd_lower.count(base_name)
        scored.append((freq, skill))
    scored.sort(reverse=True)
    return [s for _, s in scored[:5]] or missing_skills[:5]


# ---------------------------------------------------------------------------
# 5. PERFORMANCE ANALYSIS
# ---------------------------------------------------------------------------

def analyze_technical_depth(resume_text: str, coding_score: Optional[float] = None) -> Dict[str, Any]:
    """
    Determine technical depth level and performance metrics.
    """
    text_lower = resume_text.lower()
    adv_count = sum(1 for sig in ADVANCED_SIGNALS if sig in text_lower)
    int_count = sum(1 for sig in INTERMEDIATE_SIGNALS if sig in text_lower)
    beg_count = sum(1 for sig in BEGINNER_SIGNALS if sig in text_lower)

    # Determine level
    if adv_count >= 4 or (adv_count >= 2 and int_count >= 5):
        level = "Advanced"
        base_score = 80 + min(20, adv_count * 2.5)
    elif int_count >= 4 or (int_count >= 2 and adv_count >= 1):
        level = "Intermediate"
        base_score = 58 + min(22, int_count * 3)
    else:
        level = "Beginner"
        base_score = 30 + min(25, int_count * 4 + adv_count * 2)

    # Blend with coding_score if provided
    if coding_score is not None:
        base_score = round(base_score * 0.5 + float(coding_score) * 0.5, 1)
    else:
        base_score = round(min(100, base_score), 1)

    years = extract_years_experience(resume_text)

    # Learning curve potential (proxy: diversity of tech stack)
    unique_techs = len(set(s for s in SKILL_NORMALIZATION if s in text_lower))
    learning_potential = "High" if unique_techs >= 10 else ("Moderate" if unique_techs >= 5 else "Low")

    # Code quality signal
    code_quality_notes = []
    if "unit test" in text_lower or "tdd" in text_lower:
        code_quality_notes.append("Evidence of test-driven development")
    if "code review" in text_lower:
        code_quality_notes.append("Participates in code reviews")
    if "optimization" in text_lower or "performance" in text_lower:
        code_quality_notes.append("Performance & optimization awareness")
    if "design pattern" in text_lower or "solid" in text_lower:
        code_quality_notes.append("Applies design patterns / SOLID principles")
    if not code_quality_notes:
        code_quality_notes.append("No explicit code quality indicators found")

    return {
        "technical_level": level,
        "performance_score": base_score,
        "years_experience": years,
        "learning_curve_potential": learning_potential,
        "code_quality_signals": code_quality_notes,
        "advanced_signals_found": adv_count,
        "intermediate_signals_found": int_count,
    }


def derive_strengths_weaknesses(
    resume_text: str,
    tech_analysis: Dict,
    match_result: Dict,
) -> Dict[str, List[str]]:
    """Derive actionable strengths and weaknesses."""
    strengths = []
    weaknesses = []
    risk_factors = []

    level = tech_analysis["technical_level"]
    years = tech_analysis["years_experience"]
    match_score = match_result["match_score"]

    # Strengths
    if level == "Advanced":
        strengths.append(f"Demonstrates advanced technical depth across {tech_analysis['advanced_signals_found']} complex domains")
    elif level == "Intermediate":
        strengths.append(f"Solid intermediate skill set across {tech_analysis['intermediate_signals_found']} core technologies")
    if years >= 5:
        strengths.append(f"{int(years)}+ years of industry experience — proven track record")
    elif years >= 2:
        strengths.append(f"{int(years)} years of hands-on experience showing progressive growth")
    if match_score >= 75:
        strengths.append(f"Strong job fit ({match_score}% skill alignment with role)")
    if match_result.get("semantically_inferred"):
        strengths.append("Demonstrates transferable concepts beyond listed keywords")
    for sig in tech_analysis.get("code_quality_signals", []):
        if "No explicit" not in sig:
            strengths.append(sig)

    # Weaknesses
    if level == "Beginner":
        weaknesses.append("Technical depth is limited — advanced system design concepts absent")
    if years < 1:
        weaknesses.append("No detectable professional experience — entry-level profile")
    if match_score < 50:
        weaknesses.append(f"Significant skill mismatch ({100 - match_score:.0f}% gap) with job requirements")
    missing = match_result.get("missing_skills", [])
    if missing:
        weaknesses.append(f"Missing key required skills: {', '.join(missing[:3])}")
    weak_found = [p for p in WEAK_PHRASES if p in resume_text.lower()]
    if weak_found:
        weaknesses.append(f"Resume uses {len(weak_found)} passive/weak phrases — reduces ATS impact")

    # Risk factors
    if years < 1 and level not in ["Intermediate", "Advanced"]:
        risk_factors.append("Entry-level candidate with no verifiable work history")
    if match_score < 40:
        risk_factors.append("Low role alignment — may struggle to meet minimum requirements")
    if not match_result.get("matching_skills"):
        risk_factors.append("No direct skill matches with the job description found")

    return {
        "strengths": strengths if strengths else ["Candidate profile requires deeper data to extract strengths"],
        "weaknesses": weaknesses if weaknesses else ["No critical weaknesses detected — further assessment recommended"],
        "risk_factors": risk_factors,
    }


# ---------------------------------------------------------------------------
# 6. RESUME OPTIMIZATION ENGINE
# ---------------------------------------------------------------------------

def optimize_resume(
    resume_text: str,
    missing_skills: List[str],
    sections: Dict[str, str],
) -> Dict[str, Any]:
    """
    ATS + recruiter optimization: bullet rewrites, keyword injection,
    phrasing improvements, weak phrase removal.
    """
    summary_section = sections.get("summary") or sections.get("objective") or ""
    projects_section = sections.get("projects", "")
    exp_section = sections.get("experience") or sections.get("work experience") or ""

    # Build improved summary
    years = extract_years_experience(resume_text)
    yrs_phrase = f"{int(years)}-year" if years >= 1 else "results-driven"
    top_skills = list(SKILL_NORMALIZATION.values())[:5]
    improved_summary = (
        f"A {yrs_phrase} software engineer with proven expertise in "
        f"{', '.join(top_skills[:3])} and a strong track record of delivering "
        f"scalable, production-grade systems. Adept at cross-functional collaboration, "
        f"performance optimization, and system design. Seeking to leverage deep technical "
        f"skills to drive high-impact outcomes."
    )

    # Detect and rewrite weak bullet points
    lines = resume_text.split("\n")
    rewrites = []
    for line in lines:
        stripped = line.strip()
        if stripped and len(stripped) > 20:
            weak_hit = next((p for p in WEAK_PHRASES if p in stripped.lower()), None)
            if weak_hit:
                verb = ACTION_VERBS[len(rewrites) % len(ACTION_VERBS)]
                rewritten = re.sub(
                    re.escape(weak_hit), verb.lower(), stripped, count=1, flags=re.IGNORECASE
                )
                rewrites.append({
                    "original": stripped,
                    "improved": rewritten.capitalize(),
                    "issue": f"Passive phrase: '{weak_hit}'",
                })
            if len(rewrites) >= 5:
                break

    # Keyword injection suggestions
    keyword_additions = []
    for skill in missing_skills[:5]:
        base = skill.split(" / ")[0]
        keyword_additions.append({
            "keyword": base,
            "suggestion": f"Add '{base}' naturally to your Skills or Projects section to improve ATS ranking.",
        })

    # Improved project bullets (generic template)
    improved_projects = (
        "• Architected and deployed [ProjectName] — a [type] system handling "
        "[X]K+ requests/day, reducing latency by [Y]% using [TechStack].\n"
        "• Implemented real-time [feature] with [technology], improving [metric] by [%].\n"
        "• Led a team of [N] engineers to deliver [project] on schedule, cutting infra costs by [$X]."
    )

    return {
        "improved_summary": improved_summary,
        "bullet_rewrites": rewrites,
        "keyword_additions": keyword_additions,
        "improved_project_template": improved_projects,
        "weak_phrases_found": [p for p in WEAK_PHRASES if p in resume_text.lower()],
    }


# ---------------------------------------------------------------------------
# 7. RECRUITER INSIGHTS
# ---------------------------------------------------------------------------

def generate_recruiter_insights(
    tech_analysis: Dict,
    match_result: Dict,
    final_score: float,
) -> Dict[str, Any]:
    """Generate recruiter-facing summary with hire recommendation."""
    score = final_score
    level = tech_analysis["technical_level"]
    match = match_result["match_score"]
    years = tech_analysis["years_experience"]

    # Hire recommendation
    if score >= 80:
        recommendation = "Strong Yes"
    elif score >= 65:
        recommendation = "Yes"
    elif score >= 45:
        recommendation = "Maybe"
    else:
        recommendation = "No"

    # Ideal role fit
    matching = match_result.get("matching_skills", [])
    if "Machine Learning / AI" in matching or "TensorFlow / ML" in matching:
        ideal_role = "ML Engineer / AI Engineer"
    elif "React.js / Frontend" in matching and "Node.js / Backend" in matching:
        ideal_role = "Full Stack Developer"
    elif "React.js / Frontend" in matching or "Angular / Frontend" in matching:
        ideal_role = "Frontend / UI Engineer"
    elif "Node.js / Backend" in matching or "Python / Backend" in matching:
        ideal_role = "Backend Engineer"
    elif "Docker / Containerization" in matching or "Kubernetes / Orchestration" in matching:
        ideal_role = "DevOps / Platform Engineer"
    elif "AWS / Cloud" in matching or "GCP / Cloud" in matching:
        ideal_role = "Cloud / Infrastructure Engineer"
    else:
        ideal_role = f"{level} Software Engineer"

    # Salary estimation
    band = SALARY_BANDS.get(level, SALARY_BANDS["Intermediate"])
    # Adjust for experience
    exp_bonus = min(40000, int(years) * 5000)
    salary_range = f"${band['min'] + exp_bonus:,} – ${band['max'] + exp_bonus:,} / yr (USD)"

    # Interview focus areas
    focus_areas = []
    if match_result.get("missing_skills"):
        focus_areas.append(f"Assess depth on: {', '.join(match_result['missing_skills'][:2])}")
    if level == "Advanced":
        focus_areas.append("System design & architectural decision-making")
        focus_areas.append("Trade-off analysis in distributed systems")
    elif level == "Intermediate":
        focus_areas.append("Data structures, algorithms, and problem-solving efficiency")
        focus_areas.append("REST API design and database modeling")
    else:
        focus_areas.append("Fundamentals: OOP, data structures, debugging")
        focus_areas.append("Review pair programming & collaborative coding")
    if years < 2:
        focus_areas.append("Cultural fit and growth mindset evaluation")

    return {
        "recommendation": recommendation,
        "ideal_role_fit": ideal_role,
        "salary_range_estimate": salary_range,
        "interview_focus_areas": focus_areas[:4],
    }


# ---------------------------------------------------------------------------
# 8. SMART SCORING SYSTEM
# ---------------------------------------------------------------------------

def compute_final_score(
    resume_quality: float,
    skill_match: float,
    performance: float,
    experience_relevance: float,
) -> Dict[str, Any]:
    """
    Final Score = (Resume Quality * 0.25) + (Skill Match * 0.30) +
                  (Performance * 0.30) + (Experience Relevance * 0.15)
    """
    score = (
        resume_quality * 0.25
        + skill_match * 0.30
        + performance * 0.30
        + experience_relevance * 0.15
    )
    score = round(min(100.0, score), 1)

    if score >= 80:
        grade = "A"
        justification = "Exceptional candidate — strong technical depth, high job alignment, and polished resume."
    elif score >= 65:
        grade = "B"
        justification = "Solid candidate — meets most requirements with minor skill gaps that are bridgeable."
    elif score >= 50:
        grade = "C"
        justification = "Moderate candidate — relevant fundamentals exist but gaps in key technical areas."
    elif score >= 35:
        grade = "D"
        justification = "Below-par candidate — significant skill mismatch and limited experience relevance."
    else:
        grade = "F"
        justification = "Not a fit for this role — profile does not meet minimum requirements."

    return {
        "final_score": score,
        "grade": grade,
        "justification": justification,
        "breakdown": {
            "resume_quality": {"score": round(resume_quality, 1), "weight": 0.25, "contribution": round(resume_quality * 0.25, 1)},
            "skill_match": {"score": round(skill_match, 1), "weight": 0.30, "contribution": round(skill_match * 0.30, 1)},
            "performance": {"score": round(performance, 1), "weight": 0.30, "contribution": round(performance * 0.30, 1)},
            "experience_relevance": {"score": round(experience_relevance, 1), "weight": 0.15, "contribution": round(experience_relevance * 0.15, 1)},
        },
    }


def _resume_quality_score(resume_text: str, sections: Dict) -> float:
    """Heuristic resume quality: section completeness, length, weak phrase density."""
    score = 40.0  # base

    # Section coverage
    key_sections = ["summary", "experience", "education", "skills", "projects"]
    present = sum(1 for s in key_sections if s in sections)
    score += present * 8  # up to +40

    # Length signal
    word_count = len(resume_text.split())
    if 300 <= word_count <= 800:
        score += 10
    elif word_count > 800:
        score += 5

    # Weak phrase penalty
    weak_count = sum(1 for p in WEAK_PHRASES if p in resume_text.lower())
    score -= weak_count * 3

    # Certification bonus
    if "certif" in resume_text.lower():
        score += 5

    return round(min(100.0, max(0.0, score)), 1)


def _experience_relevance(years: float, match_score: float) -> float:
    """Experience relevance = years factor + match alignment."""
    years_score = min(100.0, years * 12)  # 8+ years → 100
    relevance = (years_score * 0.4) + (match_score * 0.6)
    return round(min(100.0, relevance), 1)


# ---------------------------------------------------------------------------
# 9. MAIN ANALYSIS ENTRY POINT
# ---------------------------------------------------------------------------

def analyze(
    resume_text: str,
    job_description: str = "",
    coding_score: Optional[float] = None,
    assessment_score: Optional[float] = None,
    candidate_name: str = "Candidate",
) -> Dict[str, Any]:
    """
    Master analysis function. Orchestrates all modules and returns
    the complete structured JSON payload.

    Args:
        resume_text: Full text content of the resume
        job_description: Full text of the job description
        coding_score: Optional coding challenge score (0-100)
        assessment_score: Optional MCQ assessment score (0-100)
        candidate_name: Candidate's display name

    Returns:
        Structured analysis JSON matching the platform's output schema
    """
    jd_text = job_description or ""

    # --- Phase 1: Parse & Extract ---
    sections = extract_sections(resume_text)
    kw_result = extract_keywords(resume_text, top_n=15)
    jd_keywords = list(SKILL_NORMALIZATION.keys()) if not jd_text else [
        alias for alias in SKILL_NORMALIZATION if alias in jd_text.lower()
    ]
    keyword_match_score = compute_keyword_match_score(kw_result["top_keywords"], jd_keywords)

    # --- Phase 2: Performance Analysis ---
    tech = analyze_technical_depth(resume_text, coding_score)

    # Blend assessment score if provided
    if assessment_score is not None:
        tech["performance_score"] = round(
            tech["performance_score"] * 0.6 + float(assessment_score) * 0.4, 1
        )

    # --- Phase 3: Job Matching ---
    match = semantic_match(resume_text, jd_text) if jd_text else {
        "match_score": keyword_match_score,
        "matching_skills": kw_result["top_keywords"][:5],
        "missing_skills": [],
        "semantically_inferred": [],
        "skill_gap_explanation": "No JD provided — keyword-based match used.",
    }

    learn_skills = top_skills_to_learn(match["missing_skills"], jd_text)

    # --- Phase 4: Strengths / Weaknesses ---
    sw = derive_strengths_weaknesses(resume_text, tech, match)

    # --- Phase 5: Resume Optimization ---
    opt = optimize_resume(resume_text, match["missing_skills"], sections)

    # --- Phase 6: Scoring ---
    rq_score = _resume_quality_score(resume_text, sections)
    exp_rel = _experience_relevance(tech["years_experience"], match["match_score"])
    final = compute_final_score(
        resume_quality=rq_score,
        skill_match=match["match_score"],
        performance=tech["performance_score"],
        experience_relevance=exp_rel,
    )

    # --- Phase 7: Recruiter Insights ---
    insights = generate_recruiter_insights(tech, match, final["final_score"])

    # --- Build Output ---
    return {
        # Metadata
        "candidate_name": candidate_name,
        "analysis_version": "2.0.0",

        # Section 1 — Keywords
        "keywords": kw_result["top_keywords"],
        "keyword_match_score": f"{keyword_match_score}%",
        "total_skills_detected": kw_result["total_matched"],

        # Section 2 — Performance
        "technical_level": tech["technical_level"],
        "performance_score": f"{tech['performance_score']}/100",
        "years_experience": tech["years_experience"],
        "learning_curve_potential": tech["learning_curve_potential"],
        "code_quality_signals": tech["code_quality_signals"],

        # Section 3 — Job Matching
        "match_score": f"{match['match_score']}%",
        "matching_skills": match["matching_skills"],
        "missing_skills": match["missing_skills"],
        "skill_gap_explanation": match["skill_gap_explanation"],
        "top_5_skills_to_learn": learn_skills,

        # Section 4 — Strengths / Weaknesses
        "strengths": sw["strengths"],
        "weaknesses": sw["weaknesses"],
        "risk_factors": sw["risk_factors"],

        # Section 5 — Resume Optimization
        "resume_improvements": {
            "improved_summary": opt["improved_summary"],
            "bullet_rewrites": opt["bullet_rewrites"],
            "keyword_additions": opt["keyword_additions"],
            "improved_project_template": opt["improved_project_template"],
            "weak_phrases_found": opt["weak_phrases_found"],
        },

        # Section 6 — Recruiter Insights
        "recommendation": insights["recommendation"],
        "ideal_role_fit": insights["ideal_role_fit"],
        "salary_range_estimate": insights["salary_range_estimate"],
        "interview_focus_areas": insights["interview_focus_areas"],

        # Section 7 — Final Score
        "final_score": f"{final['final_score']}/100",
        "grade": final["grade"],
        "summary": final["justification"],
        "score_breakdown": final["breakdown"],

        # Skill gaps
        "skill_gaps": match["missing_skills"],
    }


# ---------------------------------------------------------------------------
# 10. QUICK SELF-TEST (run directly)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import json

    sample_resume = """
    John Doe | john@example.com | github.com/johndoe

    SUMMARY
    Software Engineer with 5 years of experience building scalable web applications.
    Responsible for backend APIs, helped with DevOps, and worked on React frontends.

    SKILLS
    Python, FastAPI, Node.js, React, PostgreSQL, MongoDB, Docker, AWS, Git, REST API,
    unit testing, agile, code review, design patterns

    EXPERIENCE
    Senior Software Engineer — TechCorp (2021–Present)
    - Responsible for microservices architecture using Python and FastAPI
    - Worked on React dashboard with 50k+ daily users
    - Assisted in migrating systems to AWS, reducing costs by 30%

    PROJECTS
    Real-Time Chat App
    - Built a WebSocket-based chat system with Node.js, Redis pub/sub, 10k concurrent users.

    AI Resume Screener
    - Implemented NLP pipeline using Python, scikit-learn, achieving 88% classification accuracy.

    EDUCATION
    B.S. Computer Science — State University, 2019

    CERTIFICATIONS
    AWS Certified Developer – Associate
    """

    sample_jd = """
    We are looking for a Senior Backend Engineer with experience in:
    Python, FastAPI, Docker, Kubernetes, PostgreSQL, Redis, microservices,
    system design, REST API, CI/CD, AWS, performance optimization.
    Experience with machine learning pipelines is a plus.
    5+ years required.
    """

    result = analyze(
        resume_text=sample_resume,
        job_description=sample_jd,
        coding_score=78,
        assessment_score=82,
        candidate_name="John Doe",
    )
    print(json.dumps(result, indent=2))
