# RescueAI — Emergency Response System for South Sudan

AI-powered emergency triage that bypasses the police-document bottleneck by generating
incident reports in parallel while dispatching medical help immediately.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Anthropic API key (get one at console.anthropic.com)
- Cloudinary account (free tier — for photo uploads)

### 1. Clone & install

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Fill in your keys (see .env.example)
```

### 3. Set up the database

```bash
cd server
psql -U postgres -c "CREATE DATABASE rescueai;"
psql -U postgres -d rescueai -f db/schema.sql
psql -U postgres -d rescueai -f db/seed-hospitals.sql
```

### 4. Run

```bash
# Terminal 1 — backend (port 5000)
cd server && npm run dev

# Terminal 2 — frontend (port 5173)
cd client && npm run dev
```

Open http://localhost:5173

---

## Demo flow (for judges)

1. Open the app → click **"Report Emergency"**
2. Describe the incident, drop a pin on the map, upload a photo
3. Hit **Submit** — within seconds you see:
   - Severity score (1–5) with colour coding
   - Step-by-step first aid instructions
   - Nearest hospital with route on map
4. Click **"Download Police Report"** — gets a PDF ready to send to authorities
   (this happens in parallel, not as a blocker)

---

## Project structure

```
rescue-ai/
├── server/
│   ├── index.js
│   ├── .env.example
│   ├── routes/
│   │   ├── incidents.js
│   │   ├── triage.js
│   │   ├── hospitals.js
│   │   └── reports.js
│   ├── controllers/
│   │   ├── aiController.js
│   │   └── pdfController.js
│   ├── db/
│   │   ├── index.js
│   │   ├── schema.sql
│   │   └── seed-hospitals.sql
│   └── middleware/
│       └── upload.js
└── client/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── ReportPage.jsx
        │   └── TriageResultPage.jsx
        ├── components/
        │   ├── SeverityBadge.jsx
        │   ├── FirstAidPanel.jsx
        │   ├── HospitalCard.jsx
        │   └── EmergencyMap.jsx
        └── lib/
            └── api.js
```

## Deploy to Render (free)

1. Push to GitHub
2. render.com → New Web Service → connect repo → set env vars
3. New PostgreSQL → copy connection string to DATABASE_URL

## Tech stack

| Layer | Tool |
|-------|------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| AI | Claude API (claude-sonnet-4-5) |
| Database | PostgreSQL |
| Maps | Leaflet.js + OpenStreetMap (free) |
| Routing | OSRM public API (free) |
| Photos | Cloudinary (free tier) |
| PDF | pdfkit |
| Deploy | Render.com (free tier) |
