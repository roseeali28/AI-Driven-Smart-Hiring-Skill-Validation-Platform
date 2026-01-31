# AI Skill Verification Hiring Platform

A startup-ready AI-powered hiring platform that evaluates real candidate skills, verifies learning credentials, reduces hiring bias, and enables faster, more reliable recruitment for startups and SMEs.

This system replaces resume-based hiring with a skill-first, data-driven recruitment pipeline.

---

## 🚀 Key Features

### 👨‍💼 Recruiter (Admin) Module
- Secure authentication and role-based access
- Job role creation and candidate assignment
- Automated candidate ranking
- Skill credibility dashboards
- Certificate verification status
- Hiring pipeline management
- Export reports (CSV / PDF)

### 👩‍💻 Candidate Module
- Secure registration and login
- Skill assessments (MCQ + coding challenges)
- Certificate upload and verification
- Transparent performance feedback
- Skill gap analysis
- Personalized learning recommendations

### 🧠 AI & Analytics Engine
- Hybrid scoring system (ML + rule-based)
- Learning aptitude analysis
- Behavioral performance tracking
- Bias reduction normalization
- Explainable candidate credibility scores
- Role-based candidate ranking

---

## 🏗️ System Architecture
Frontend (HTML/CSS/JS)
|
↓
Node.js API Gateway (Express)
|
┌──────┼─────────┬─────────┐
↓ ↓ ↓ ↓
Auth Assessment Certificate Analytics
Service Engine Verification AI Engine
| | |
└──── PostgreSQL / MySQL Database ────┘

---

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- JWT Authentication

### AI Services
- Python
- FastAPI
- scikit-learn
- spaCy
- Transformers (optional)

### Database
- PostgreSQL (recommended)
- MySQL (supported)

### DevOps
- REST APIs
- Docker-ready structure
- Environment variable configuration

---

## 📁 Project Folder Structure
/ai-services
/scoring_engine
/behavior_analysis
/certificate_verifier

/backend
/controllers
/routes
/middleware
/models
/utils
app.js
server.js

/frontend
/assets
/pages
/js

/database
schema.sql

/docs
api_docs.md
architecture.md

README.md

---

## ⚙️ Installation Guide

### 1️⃣ Clone Repository
git clone <your-repo-url>
cd ai-hiring-platform

---

### 2️⃣ Backend Setup (Node.js)
cd backend
npm install
npm start

Backend runs on:
http://localhost:5000

---

### 3️⃣ AI Services Setup (Python)
cd ai-services
pip install -r requirements.txt
uvicorn main:app --reload

AI services run on:
http://localhost:8000

---

### 4️⃣ Frontend

Simply open:
frontend/index.html

Or serve using Live Server / local HTTP server.

---

## 🔐 Environment Variables

Create a `.env` file inside `/backend`:
DB_URL=postgresql://username:password@localhost:5432/hiring_db
JWT_SECRET=your_secret_key
AI_SERVICE_URL=http://localhost:8000

---

## 📊 AI Skill Credibility Scoring Model

Final Candidate Score is computed using a weighted hybrid model:
Final Score =

(Assessment Performance × 40%)

(Coding Challenge Score × 30%)

(Certificate Trust Score × 15%)

(Learning Aptitude Score × 15%)

### Explanation Components

- Assessment Performance → Accuracy + difficulty weighting + time efficiency
- Coding Score → Test case success + runtime performance
- Certificate Trust → QR verification + metadata validation + issuer trust level
- Learning Aptitude → Improvement trend + retry behavior + consistency score

All scores are normalized and bias-adjusted.

---

## 🛡️ Security Features

- JWT-based authentication
- Role-based authorization
- Password hashing
- Input validation
- File type validation
- Secure sandboxed code execution
- API rate limiting ready

---

## 📈 MVP Scope

This project delivers a functional MVP including:

- Authentication system
- Skill assessment engine
- Coding evaluation system
- Certificate verification module
- AI scoring and ranking engine
- Recruiter dashboard
- Candidate feedback module

---

## 🌍 Use Cases

- Startup hiring automation
- Campus recruitment platforms
- EdTech placement systems
- Bootcamp skill verification
- Internship screening tools

---

## 🚀 Future Roadmap

- Video interview AI analysis
- Online proctoring system
- SaaS subscription billing
- ATS integration
- Blockchain credential verification
- Enterprise dashboard analytics
- Mobile app support

---

## 🧪 Synthetic Data & Testing

Synthetic candidate data is used for:

- Model training
- Scoring simulation
- Ranking validation
- Bias testing

This ensures reproducibility and safe experimentation.

---

## 📜 License

MIT License

---

## 🤝 Contribution Guidelines

1. Fork repository
2. Create feature branch
3. Commit clean code
4. Submit pull request

---

## ⭐ Why This Platform Matters

Traditional hiring relies on resumes.

This platform verifies:

- What candidates actually know  
- What they actually practiced  
- How fast they can learn  
- How reliable their credentials are  

This enables fair, fast, and data-driven hiring.


