# Phased Development Roadmap

**Project:** HiredUp
**Version:** 1.0  
**Date:** February 7, 2025

---

## Overview

The roadmap is divided into **6 phases** aligned with the MVP and post-MVP scalability plan. Each phase ends with a deliverable and approval checkpoint.

---

## Phase 0: Foundation (Days 1–2)

**Goal:** Project setup, database schema, and basic auth.

### Tasks

| # | Task | Owner | Est. |
|---|------|-------|------|
| 1 | Initialize project structure (Node.js + Python) | Dev | 2h |
| 2 | PostgreSQL schema (users, roles, jobs) | Dev | 2h |
| 3 | JWT auth (register, login, middleware) | Dev | 3h |
| 4 | Frontend: landing, login, signup pages | Dev | 3h |
| 5 | Basic routing and role guards | Dev | 2h |

### Deliverables

- [ ] Users can register (Recruiter / Candidate)
- [ ] Users can login and receive JWT
- [ ] Protected routes redirect unauthenticated users

### Approval Gate

**→ Proceed to Phase 1 after approval**

---

## Phase 1: Assessment Engine (Days 3–5)

**Goal:** MCQ + coding challenges, automated evaluation, difficulty-weighted scoring.

### Tasks

| # | Task | Owner | Est. |
|---|------|-------|------|
| 1 | Question model (MCQ, difficulty, points) | Dev | 2h |
| 2 | MCQ assessment flow (create, take, grade) | Dev | 4h |
| 3 | Coding challenge model + test cases | Dev | 2h |
| 4 | Python sandbox for code execution | Dev | 4h |
| 5 | Coding assessment UI (editor, run, submit) | Dev | 4h |
| 6 | Difficulty-weighted scoring logic | Dev | 2h |
| 7 | Time tracking per question | Dev | 1h |

### Deliverables

- [ ] Recruiter can create assessments (MCQ + coding)
- [ ] Candidate can take assessments
- [ ] Automated grading with weighted scores
- [ ] Time-per-question stored

### Approval Gate

**→ Proceed to Phase 2 after approval**

---

## Phase 2: Certificate Verification (Days 6–7)

**Goal:** Upload certificates, verify via platform APIs/metadata, Trust Score.

### Tasks

| # | Task | Owner | Est. |
|---|------|-------|------|
| 1 | Certificate model (platform, credential_id, file) | Dev | 2h |
| 2 | File upload (PDF) + URL input | Dev | 2h |
| 3 | Python: metadata extraction (PyPDF2) | Dev | 2h |
| 4 | Verification modules: Coursera, Udemy, edX, Google | Dev | 6h |
| 5 | Trust Score calculation (0–100) | Dev | 2h |
| 6 | Certificate status (Verified / Pending / Failed) | Dev | 1h |
| 7 | Candidate UI: upload, view status | Dev | 2h |

### Deliverables

- [ ] Candidates can upload certificates
- [ ] At least 2 platforms with working verification
- [ ] Trust Score per certificate
- [ ] Status visible in candidate profile

### Approval Gate

**→ Proceed to Phase 3 after approval**

---

## Phase 3: AI Scoring & Behavioral Analysis (Days 8–10)

**Goal:** Hybrid scoring engine, learning aptitude, explainable breakdown.

### Tasks

| # | Task | Owner | Est. |
|---|------|-------|------|
| 1 | Behavioral metrics (time patterns, consistency) | Dev | 3h |
| 2 | Learning aptitude rule-based score | Dev | 2h |
| 3 | Skill-job relevance (keyword overlap) | Dev | 2h |
| 4 | Credibility Score formula (weighted linear) | Dev | 3h |
| 5 | Explainability: per-factor contribution | Dev | 2h |
| 6 | Python API: POST /score, returns breakdown | Dev | 2h |
| 7 | Node.js integration with Python scorer | Dev | 2h |
| 8 | Candidate ranking and filtering | Dev | 3h |

### Deliverables

- [ ] Credibility Score (0–100) per candidate per job
- [ ] Full explainable breakdown
- [ ] Ranked candidate list

### Approval Gate

**→ Proceed to Phase 4 after approval**

---

## Phase 4: Recruiter Dashboard & Candidate Feedback (Days 11–13)

**Goal:** Full recruiter UX, candidate feedback, upskilling recommendations.

### Tasks

| # | Task | Owner | Est. |
|---|------|-------|------|
| 1 | Recruiter dashboard: job list, candidate pipeline | Dev | 4h |
| 2 | Candidate ranking table (sort, filter) | Dev | 3h |
| 3 | Score breakdown modal / expandable row | Dev | 2h |
| 4 | Certificate verification status display | Dev | 2h |
| 5 | CSV export | Dev | 2h |
| 6 | Candidate feedback page (score, gaps) | Dev | 3h |
| 7 | Skill gap → course recommendations (static map) | Dev | 2h |
| 8 | UI polish and responsive layout | Dev | 3h |

### Deliverables

- [ ] Recruiter can view ranked candidates, scores, certificates
- [ ] CSV export works
- [ ] Candidate sees feedback and recommendations

### Approval Gate

**→ Proceed to Phase 5 after approval**

---

## Phase 5: Integration, Testing & Deployment (Days 14–16)

**Goal:** End-to-end flow, synthetic data, deployment-ready build.

### Tasks

| # | Task | Owner | Est. |
|---|------|-------|------|
| 1 | Synthetic data: 5 jobs, 20 candidates, assessments | Dev | 4h |
| 2 | E2E flow testing (manual + basic automation) | Dev | 4h |
| 3 | Docker Compose (Node, Python, PostgreSQL) | Dev | 3h |
| 4 | Environment config (.env.example) | Dev | 1h |
| 5 | README: setup, run, demo credentials | Dev | 2h |
| 6 | Fix critical bugs and edge cases | Dev | 4h |

### Deliverables

- [ ] Full demo flow works
- [ ] `docker-compose up` runs the app
- [ ] Documentation complete

### Approval Gate

**→ Proceed to Phase 6 (Business Deliverables)**

---

## Phase 6: Business & Documentation (Days 17–18)

**Goal:** Business Model Canvas, market analysis, pitch deck, technical docs.

### Tasks

| # | Task | Owner | Est. |
|---|------|-------|------|
| 1 | Business Model Canvas | Founder | 2h |
| 2 | Market analysis (SME hiring, competitors) | Founder | 2h |
| 3 | Startup pitch deck outline (10–12 slides) | Founder | 2h |
| 4 | Technical documentation (API, architecture) | Dev | 3h |
| 5 | Final review and handoff | Team | 2h |

### Deliverables

- [ ] Business Model Canvas
- [ ] Market analysis document
- [ ] Pitch deck outline
- [ ] Technical documentation

---

## Timeline Summary

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 0: Foundation | 2 days | Day 2 |
| 1: Assessment Engine | 3 days | Day 5 |
| 2: Certificate Verification | 2 days | Day 7 |
| 3: AI Scoring & Behavioral | 3 days | Day 10 |
| 4: Dashboard & Feedback | 3 days | Day 13 |
| 5: Integration & Deployment | 2–3 days | Day 16 |
| 6: Business Deliverables | 2 days | Day 18 |

**Total MVP estimate:** ~18 working days

---

## Risk Buffer

- Add 2–3 days for unknown blockers (certificate APIs, sandbox issues)
- Parallel work: Frontend and backend can overlap where possible

---

## Approval Checklist (Per Phase)

Before moving to the next phase:

- [ ] All deliverables for the phase completed
- [ ] No critical bugs in core flow
- [ ] Code reviewed (or self-reviewed)
- [ ] Stakeholder sign-off (or self-approval for solo project)

---

*Ready to proceed with Phase 0 implementation upon approval.*
