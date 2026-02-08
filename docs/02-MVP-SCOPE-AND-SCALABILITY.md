# MVP Scope vs Future Scalability

**Project:** HiredUp
**Version:** 1.0  
**Date:** February 7, 2025

---

## 1. MVP Philosophy

> **Build the smallest version that proves the core value proposition:**  
> "A unified skill-first hiring system that combines real-time skill testing, AI-based learning aptitude analysis, and verified credential authenticity into a single trusted hiring score."

---

## 2. MVP Scope (In Scope for v1)

### 2.1 Authentication & Roles

| Feature | MVP Implementation | Notes |
|---------|---------------------|-------|
| User registration | Email + password | Recruiter / Candidate signup |
| Login | JWT (access + refresh) | Stateless, 15m / 7d tokens |
| Roles | `RECRUITER`, `CANDIDATE` | Fine-grained RBAC deferred |
| Password reset | Email link (optional) | Can defer to post-MVP |

### 2.2 Skill Assessment Engine

| Feature | MVP Implementation | Notes |
|---------|---------------------|-------|
| MCQ | Single & multiple choice | Auto-graded |
| Coding challenges | 3–5 sample problems | Python execution via subprocess |
| Difficulty levels | Easy, Medium, Hard | Weighted scoring |
| Time tracking | Per-question time | Stored for behavioral analysis |
| Attempts | Single attempt per assessment | Multi-attempt tracking deferred |

### 2.3 Behavioral & Learning Aptitude

| Feature | MVP Implementation | Notes |
|---------|---------------------|-------|
| Problem-solving pattern | Time per difficulty level | Simple aggregates |
| Improvement tracking | Score delta (if multi-attempt) | Minimal in MVP |
| Learning indicator | Rule-based score (0–100) | ML-based deferred |

### 2.4 Certificate Verification

| Feature | MVP Implementation | Notes |
|---------|---------------------|-------|
| Upload | PDF or credential URL | Max 2–3 per candidate |
| Platforms | Coursera, Udemy, edX, Google | Metadata + URL validation |
| Verification | Credential ID lookup where possible | Fallback: metadata matching |
| Trust Score | 0–100 per certificate | Simple heuristics |

### 2.5 AI Credibility Scoring

| Feature | MVP Implementation | Notes |
|---------|---------------------|-------|
| Scoring inputs | Assessment, coding, certificates, learning | All four components |
| Model | **Weighted linear (rule-based)** | Transparent, explainable |
| Output | Total score + breakdown | JSON report |
| Explainability | Per-factor contribution | No black box |

### 2.6 Candidate Ranking

| Feature | MVP Implementation | Notes |
|---------|---------------------|-------|
| Ranking | Sort by credibility score | Per job |
| Filtering | By score range, verification status | Basic filters |
| Comparison | Side-by-side top 5 | Simple UI |

### 2.7 Recruiter Dashboard

| Feature | MVP Implementation | Notes |
|---------|---------------------|-------|
| Candidate list | Ranked table | Paginated |
| Score details | Expandable breakdown | Per candidate |
| Certificate status | Verified / Pending / Failed | Badge display |
| Export | CSV | PDF deferred |

### 2.8 Candidate Feedback & Upskilling

| Feature | MVP Implementation | Notes |
|---------|---------------------|-------|
| Performance feedback | Score + breakdown | After assessment |
| Skill gaps | Missing/low areas | Simple list |
| Recommendations | 3–5 curated courses | Static mapping per skill |

---

## 3. Explicitly Out of MVP Scope (Deferred)

| Feature | Reason | Target Phase |
|---------|--------|--------------|
| Social login (Google, LinkedIn) | Adds complexity; email sufficient | Phase 2 |
| Video / behavioral interviews | Different product surface | Phase 3 |
| Real-time proctoring | High infra cost | Phase 3 |
| Multi-language support | English-only for MVP | Phase 2 |
| Advanced RBAC (team, org) | Single recruiter per job | Phase 2 |
| Email notifications | Manual flows acceptable | Phase 2 |
| Mobile app | Web-first | Phase 3 |
| Payment / billing | Free tier only | Phase 2 |
| AI-powered question generation | Use curated question bank | Phase 3 |
| Automated resume parsing | Manual profile entry | Phase 2 |

---

## 4. Scalability Roadmap (Post-MVP)

### 4.1 Phase 2 — Growth & Polish

| Area | Enhancements |
|------|--------------|
| **Auth** | OAuth (Google, LinkedIn), 2FA |
| **Assessment** | More question types, branching logic |
| **Certificate** | More platforms (LinkedIn Learning, etc.) |
| **Scoring** | Optional ML model for adaptive weights |
| **Dashboard** | PDF export, advanced filters, charts |
| **Feedback** | Dynamic course recommendations via API |
| **Infra** | Redis cache, S3 for files |

### 4.2 Phase 3 — Enterprise & Intelligence

| Area | Enhancements |
|------|--------------|
| **Assessment** | Proctoring, video interviews |
| **AI** | NLP for resume parsing, skill extraction |
| **Platform** | Multi-tenant, white-label |
| **Analytics** | Hiring funnel, time-to-hire |
| **Integrations** | ATS APIs (Greenhouse, Lever) |

### 4.3 Phase 4 — Market Expansion

| Area | Enhancements |
|------|--------------|
| **Mobile** | Native / PWA |
| **Localization** | i18n |
| **ML** | Fairness audits, bias detection |
| **Scale** | Microservices, event-driven |

---

## 5. MVP Success Criteria

| Metric | Target |
|--------|--------|
| End-to-end flow | Recruiter creates job → Candidate completes assessment → Score generated → Ranking visible |
| Certificate verification | At least 2 platforms with working validation |
| Explainability | 100% of score components documented |
| Performance | Assessment load < 3s, scoring < 5s |
| Deployability | Single-command deploy (Docker Compose) |

---

## 6. Risk vs Scope Trade-offs

| Risk | Mitigation |
|------|------------|
| Certificate APIs limited | Use metadata + URL validation; document limitations |
| Coding sandbox security | Isolated subprocess; no network; timeout |
| Low candidate volume | Synthetic data for demo |
| Over-engineering | Stick to rule-based scoring; no ML in MVP |

---

*Next: Phased Development Roadmap*
