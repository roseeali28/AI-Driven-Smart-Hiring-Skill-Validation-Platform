# System Architecture — AI-Powered Hiring Platform

**Project:** HiredUp  
**Version:** 1.0  
**Date:** February 7, 2025

---

## 1. Executive Summary

HiredUp is a full-stack AI-powered hiring platform that combines **skill-based assessment**, **certificate verification**, and **behavioral learning aptitude analysis** into a unified, explainable credibility score for technical talent.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │   Recruiter Portal  │  │   Candidate Portal  │  │   Auth / Landing    │           │
│  │   (HTML/CSS/JS)     │  │   (HTML/CSS/JS)     │  │   (HTML/CSS/JS)     │           │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘           │
└─────────────┼─────────────────────────┼─────────────────────────┼─────────────────────┘
              │                         │                         │
              └─────────────────────────┼─────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY (Node.js)                                    │
│  ┌───────────────────────────────────────────────────────────────────────────────┐   │
│  │  REST API  │  Auth Middleware  │  Rate Limiting  │  Request Validation         │   │
│  └───────────────────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────┬───────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              BUSINESS LOGIC LAYER                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │   Auth       │ │  Assessment  │ │  Certificate │ │  AI Scoring  │ │  Candidate │ │
│  │   Service    │ │  Engine      │ │  Verifier    │ │  Engine      │ │  Ranking   │ │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ │
│         │                │                │                │                │        │
└─────────┼────────────────┼────────────────┼────────────────┼────────────────┼────────┘
          │                │                │                │                │
          ▼                ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              AI/ML LAYER (Python)                                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                │
│  │  Behavioral  │ │  Learning    │ │  Skill       │ │  Explainable │                │
│  │  Analysis    │ │  Aptitude    │ │  Matching    │ │  Scoring     │                │
│  │  (spaCy)     │ │  (scikit)    │ │  (Rules+ML)  │ │  (SHAP-like) │                │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │  PostgreSQL         │  │  File Storage       │  │  Redis (optional)   │           │
│  │  (Users, Jobs,      │  │  (Certificates,     │  │  (Sessions, Cache)  │           │
│  │   Assessments,      │  │   Reports)          │  │                     │           │
│  │   Scores)           │  │                     │  │                     │           │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘           │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture

### 3.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | HTML5, CSS3, vanilla JavaScript | Lightweight, no build complexity; can migrate to React/Vue later |
| **API Server** | Node.js + Express | Fast, async, easy REST API development |
| **AI/ML Services** | Python (Flask/FastAPI) | spaCy, scikit-learn, transformers ecosystem |
| **Database** | PostgreSQL | Robust, JSON support, ACID compliant |
| **Auth** | JWT (access + refresh) | Stateless, scalable, industry standard |
| **File Storage** | Local filesystem → S3-compatible | MVP: local; production: cloud storage |

### 3.2 Inter-Service Communication

- **Node.js ↔ Python**: REST calls or message queue (RabbitMQ/Redis) for async scoring
- **MVP**: Synchronous HTTP calls from Node to Python ML microservice
- **Scalability**: Introduce queue for batch scoring and certificate verification

---

## 4. Core Modules

### 4.1 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│  Auth Module                                                      │
│  • JWT-based auth (access: 15m, refresh: 7d)                      │
│  • Roles: RECRUITER, CANDIDATE                                    │
│  • Middleware: protect routes, attach user to request             │
│  • Password: bcrypt hashing                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Skill Assessment Engine

```
┌─────────────────────────────────────────────────────────────────┐
│  Assessment Engine (Node.js + Python)                             │
│                                                                   │
│  Question Types:                                                  │
│  • MCQ (single/multiple) — auto-graded                            │
│  • Coding challenges — test-case execution via Python sandbox     │
│  • Practical tasks — file upload + manual/auto review             │
│                                                                   │
│  Evaluation Logic:                                                │
│  • Difficulty weight: Easy=1, Medium=2, Hard=3                    │
│  • Time penalty: optional, configurable                           │
│  • Attempt bonus: first attempt preferred                         │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 Certificate Verification System

```
┌─────────────────────────────────────────────────────────────────┐
│  Certificate Verifier (Python)                                    │
│                                                                   │
│  Input: PDF upload OR credential URL/ID                          │
│                                                                   │
│  Verification Methods:                                            │
│  • Coursera: Credential ID lookup (public APIs / scraping*)      │
│  • Udemy: Certificate URL validation                              │
│  • edX: Credential ID / verify URL                                │
│  • Google: Skills for Business credential verification           │
│                                                                   │
│  Fallback: Metadata extraction (institution, date, candidate name) │
│  Output: Trust Score (0-100) + Verification Status                │
└─────────────────────────────────────────────────────────────────┘
```

*Note: Some platforms have limited public APIs; verification may use metadata + heuristics in MVP.*

### 4.4 AI Scoring Engine

```
┌─────────────────────────────────────────────────────────────────┐
│  AI Scoring Engine (Python)                                       │
│                                                                   │
│  Inputs:                                                          │
│  • Test scores (weighted by difficulty)                           │
│  • Coding assessment results                                      │
│  • Certificate Trust Score                                       │
│  • Behavioral metrics (time per question, retry patterns)         │
│  • Skill-job relevance (keyword overlap)                          │
│                                                                   │
│  Model: Hybrid (Rule-based + ML)                                  │
│  • Weighted linear combination for baseline                       │
│  • Optional: LightGBM/scikit for adaptive weights                 │
│  • Explainability: per-factor contribution breakdown              │
│                                                                   │
│  Output: Credibility Score (0-100) + Explainable Report            │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 Behavioral & Learning Aptitude

```
┌─────────────────────────────────────────────────────────────────┐
│  Behavioral Analysis (Python)                                     │
│                                                                   │
│  Metrics:                                                         │
│  • Problem-solving pattern: time spent per difficulty level       │
│  • Improvement: score delta across attempts                       │
│  • Consistency: variance in scores across similar questions       │
│  • Adaptability: performance on new/unseen question types          │
│                                                                   │
│  Output: Learning Potential Indicator (0-100)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Model (Conceptual)

### 5.1 Core Entities

```
User (id, email, password_hash, role, created_at)
  ├── Recruiter (profile, company)
  └── Candidate (profile, resume_url)

Job (id, title, description, skills_required, recruiter_id)

Assessment (id, job_id, name, type, config)
  ├── Question (id, assessment_id, type, content, difficulty, points)
  └── TestCase (id, question_id, input, expected_output)

CandidateAssessment (id, candidate_id, assessment_id, started_at, completed_at)
  └── Answer (id, question_id, response, is_correct, time_spent)

Certificate (id, candidate_id, platform, credential_id, file_url, trust_score, status)

CredibilityScore (id, candidate_id, job_id, total_score, breakdown_json, created_at)
```

### 5.2 Score Breakdown Schema

```json
{
  "total": 78,
  "breakdown": {
    "assessment_score": { "value": 82, "weight": 0.4, "contribution": 32.8 },
    "coding_score": { "value": 75, "weight": 0.25, "contribution": 18.75 },
    "certificate_trust": { "value": 90, "weight": 0.2, "contribution": 18 },
    "learning_aptitude": { "value": 70, "weight": 0.15, "contribution": 10.5 }
  }
}
```

---

## 6. Security Considerations

| Concern | Mitigation |
|---------|------------|
| Auth | JWT + refresh rotation, secure cookies for web |
| SQL Injection | Parameterized queries (ORM/Prisma) |
| XSS | Escape output, CSP headers |
| File Upload | Validate type, size; store outside webroot |
| Rate Limiting | Express rate-limiter |
| API Keys | Env vars; never in code |

---

## 7. Deployment Architecture (Target)

```
                    ┌─────────────┐
                    │   Nginx     │
                    │  (Reverse   │
                    │   Proxy)    │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │  Node.js │ │  Python  │ │ Static   │
       │  API     │ │  ML API  │ │  Assets  │
       └────┬─────┘ └────┬─────┘ └──────────┘
            │            │
            └─────┬──────┘
                  ▼
            ┌──────────┐
            │PostgreSQL│
            └──────────┘
```

---

## 8. Assumptions & Constraints

1. **Certificate APIs**: Coursera, Udemy, edX have varying API support; MVP may use metadata + URL validation.
2. **Coding Sandbox**: Use restricted Python subprocess or container (Docker) for safe execution.
3. **Synthetic Data**: Generate candidates, jobs, assessments for demo if real data unavailable.
4. **Fairness**: No demographic features in scoring; skill-only inputs.

---

*Next: MVP Scope Definition*
