# 🚀 LogClassify AI — Intelligent Log Classification System

> Multi-model AI-powered log analysis platform that combines **Regex**, **NLP**, and **Gemini LLM** to automatically classify, analyze, and fix errors in your application logs.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![Gemini AI](https://img.shields.io/badge/Gemini-AI-blue?style=flat-square&logo=google)

---

## ✨ Features

### 🧠 Multi-Model Classification Engine
- **Regex Classifier** — 40+ patterns for Apache, Nginx, Syslog, Java, Python, Node.js, Kubernetes
- **NLP Classifier** — Sentiment analysis, keyword extraction, entity recognition
- **Gemini LLM** — Deep AI analysis with root cause detection and code fix suggestions
- **Ensemble Voting** — Weighted combination of all classifiers for maximum accuracy

### 📊 Classification Comparison
Visual side-by-side comparison table showing how each classifier performed:
| Method | Category | Confidence | Time |
|--------|----------|------------|------|
| 🔍 Regex | ERROR | 92% | 1ms |
| 📝 NLP | ERROR | 87% | 3ms |
| 🤖 Gemini | ERROR | 96% | 1200ms |
| ⚡ Combined | ERROR | 94% | 1204ms |

### 📁 Bulk Log Processing
Upload entire `.log` files → classify hundreds of entries → get summary reports with export.

### 📈 Analytics Dashboard
- Error trends (7-day line chart)
- Category distribution (pie chart)
- Severity distribution (donut chart)
- Top error patterns (bar chart)
- Real-time live log feed
- Advanced filtering, sorting, and pagination

### 🎯 Severity Scoring (1-10)
- 🔴 **Critical (9-10)**: System crashes, data loss
- 🟠 **High (7-8)**: Service downtime, auth failures
- 🟡 **Medium (4-6)**: Performance degradation
- 🟢 **Low (1-3)**: Informational events

### 📥 Export Reports
- **CSV** — Tabular data export
- **JSON** — Raw structured data
- **PDF** — Formatted report with charts and metadata

### 🔐 Authentication
- JWT-based login/signup
- User-scoped log history
- Developer API key management
- Profile with image upload

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4 |
| **Backend** | Next.js API Routes (Node.js) |
| **Database** | MongoDB Atlas |
| **AI/ML** | Google Gemini API, Custom NLP, Regex Engine |
| **Charts** | Recharts |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **Export** | jsPDF, html2canvas |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd log-classification-system

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` with:

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📡 API Documentation

### Analyze a Log (Full AI Analysis)
```bash
curl -X POST http://localhost:3000/api/logs/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "logData": "TypeError: Cannot read properties of undefined",
    "sourceCode": "const result = data.items.map(i => i.name);"
  }'
```

### Quick Classify (Regex + NLP only, fast)
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"log": "ERROR: Connection refused to database at 10.0.1.45:5432"}'
```

### Bulk Process
```bash
curl -X POST http://localhost:3000/api/logs/bulk \
  -H "Content-Type: application/json" \
  -d '{"logText": "ERROR line1\nWARNING line2\nINFO line3"}'
```

### Get Logs
```bash
curl http://localhost:3000/api/logs \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Get Stats
```bash
curl http://localhost:3000/api/logs/stats \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 📂 Project Structure

```
app/
├── api/
│   ├── auth/          # Login, signup, profile
│   ├── classify/      # Quick classify endpoint
│   ├── logs/
│   │   ├── analyze/   # Full AI analysis
│   │   ├── bulk/      # Bulk processing
│   │   ├── stats/     # Chart data
│   │   └── [id]/      # Log detail
│   ├── user/          # API key management
│   └── v1/            # Developer API
├── components/
│   ├── Layout/Navbar  # Navigation
│   └── ExportButtons  # CSV/JSON/PDF export
├── contexts/
│   └── AuthContext     # JWT auth state
├── lib/
│   ├── classifiers/
│   │   ├── regexClassifier.js    # Pattern matching
│   │   ├── nlpClassifier.js      # NLP analysis
│   │   ├── severityScorer.js     # 1-10 scoring
│   │   └── ensembleClassifier.js # Weighted voting
│   ├── sampleLogs.js  # Demo templates
│   ├── mongodb.js     # DB connection
│   └── utils/auth.js  # JWT verification
├── (auth)/
│   ├── dashboard/     # Analytics dashboard
│   │   └── logs/[id]/ # Log detail page
│   ├── login/         # Login page
│   ├── signup/        # Signup page
│   └── profile/       # User settings
├── upload/            # Log analysis page
└── page.jsx           # Landing page
```

---

## 📄 License

MIT License — Built for Practicum Project

---

> **Made with ❤️ using Next.js, MongoDB, and Google Gemini AI**
