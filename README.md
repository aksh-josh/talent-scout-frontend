# TalentScout AI — Frontend

> React frontend for the AI-Powered Talent Scouting Agent  
> Built for **Catalyst Hackathon by Deccan AI** · April 2026  
> By **Akshat Joshi**

[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://talent-scout-frontend-pi.vercel.app)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)

**Live URL:** https://talent-scout-frontend-pi.vercel.app

---

## What This Does

A clean recruiter dashboard that connects to the TalentScout AI backend. Recruiters can:

- **Paste or upload** a Job Description (supports .txt, .pdf, .docx)
- **Configure** how many candidates to retrieve and how many to run outreach on
- **View** a ranked shortlist with Match Score, Interest Score, and Combined Score
- **Expand** each candidate to see: why they matched, their skills, the simulated conversation, and interest analysis
- **Export** the full shortlist as a CSV
- **Toggle** between dark and light mode

---

## Features

| Feature | Description |
|---|---|
| File Upload | Drag & drop or browse — supports .txt, .pdf, .docx |
| Dark/Light Mode | Toggle between themes |
| Score Rings | Animated circular scores for Match, Interest, Combined |
| Candidate Cards | Expandable cards with 4 tabs: Overview, Skills, Conversation, Analysis |
| Stats Bar | Live stats: candidates scanned, shortlisted, avg match, strong yes count |
| CSV Export | Download full shortlist as spreadsheet |
| Pipeline Loader | Step-by-step progress animation during analysis |
| JD Caching | Cached badge shown when result comes from cache (instant) |

---

## Local Setup

### Prerequisites
- Node.js 18+
- Backend running (see talent-scout-backend repo)

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/aksh-josh/talent-scout-frontend.git
cd talent-scout-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# 4. Start development server
npm start
```

Opens at `http://localhost:3000`

### Connect to live backend instead

```bash
echo "REACT_APP_API_URL=https://web-production-c301c.up.railway.app" > .env
npm start
```

---

## Project Structure

```
talent-scout-frontend/
├── src/
│   └── App.jsx              # Complete single-file React app
├── public/
│   └── index.html
├── package.json
└── vercel.json              # Vercel deployment config
```

---

## How It Works

1. User pastes JD text or uploads a file
2. Frontend sends `POST /analyze` to the backend
3. Backend runs the 4-agent AI pipeline (~30-60 seconds)
4. Frontend renders the ranked shortlist with scores and details
5. User can expand each candidate to view conversation and analysis

---

## Environment Variables

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend URL (Railway or localhost) |

---

## Deployment

Deployed on Vercel. Push to `main` branch triggers automatic redeploy.

**Live URL:** `https://talent-scout-frontend-pi.vercel.app`
**Backend:** `https://web-production-c301c.up.railway.app/docs`
