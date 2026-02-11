# Technical Documentation — SkillFirst Hire

## API Reference

### Authentication
- `POST /api/auth/register` — Register (body: email, password, role, fullName?, companyName?)
- `POST /api/auth/login` — Login (body: email, password)
- `POST /api/auth/refresh` — Refresh token (body: refreshToken)
- `GET /api/auth/me` — Current user (Bearer token)

### Jobs (Recruiter)
- `GET /api/jobs` — List jobs
- `POST /api/jobs` — Create (body: title, description?, skillsRequired?)
- `GET /api/jobs/:id` — Get job with assessments
- `DELETE /api/jobs/:id` — Delete job

### Assessments (Recruiter)
- `GET /api/assessments?jobId=` — List assessments
- `POST /api/assessments` — Create (body: jobId, name, type, questions[])
- `GET /api/assessments/:id` — Get assessment with questions

### Take (Candidate)
- `GET /api/take/jobs` — List jobs
- `GET /api/take/assessments?jobId=` — List assessments for job
- `GET /api/take/assessment/:id?jobId=` — Get assessment for taking
- `POST /api/take/start` — Start (body: assessmentId, jobId)
- `POST /api/take/submit` — Submit (body: candidateAssessmentId, answers[])

### Certificates (Candidate)
- `GET /api/certificates` — List certificates
- `POST /api/certificates/upload` — Upload PDF (multipart/form-data)
- `POST /api/certificates/url` — Verify by URL (body: credentialUrl)

### Scoring (Recruiter)
- `GET /api/scoring/rankings/:jobId` — Ranked candidates
- `POST /api/scoring/compute` — Compute score (body: candidateId, jobId)

## ML Service (Python)
- `GET /health` — Health check
- `POST /verify/certificate` — Verify (body: file_path or credential_url)
- `POST /verify/certificate/upload` — Upload PDF
- `POST /score/credibility` — Compute credibility score

## Database Schema
See `database/schema.sql`.

## Deployment
```bash
docker-compose up -d
# API: http://localhost:3000
# ML: http://localhost:5000
```
