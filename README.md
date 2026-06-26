# AuraPaper - AI Research Paper Summarizer & Research Assistant

A complete production-ready SaaS application allowing users to upload research papers (PDF), extract text and metadata, generate structured AI summaries, query papers using RAG-based context chat, extract citation lists, and compare papers side-by-side.

---

## Technical Architecture

```
[Next.js 15 App Router Frontend] (Port 3000)
             │
             ▼ (HTTP / REST)
  [NestJS Backend API] (Port 4000) <───────> [PostgreSQL Database] (Port 5432)
             │
             ▼ (HTTP / JSON)
 [FastAPI AI Service] (Port 8000) <───────> [ChromaDB Vector Store] (Local Volume)
             │
             ▼ (LangChain Integrations)
     [Google Gemini API]
```

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, Axios.
- **Backend**: NestJS, TypeScript, JWT (Access & Refresh tokens), Prisma ORM.
- **AI Service**: Python 3.10, FastAPI, LangChain, Google Gemini API (`gemini-1.5-flash`), Sentence Transformers (`all-MiniLM-L6-v2`), ChromaDB, PyMuPDF.
- **Database**: PostgreSQL (Prisma model).
- **Deployment & Infra**: Docker, Docker Compose.

---

## Directory Layout

```
research-paper-ai/
├── docker-compose.yml       # Docker orchestrator
├── .env.example             # Template for variables
├── README.md                # System documentation
├── database/                # Relational schemas
│   └── prisma/
│       └── schema.prisma
├── ai-service/              # FastAPI Python Microservice
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── routers/         # Endpoints (process, summary, chat, compare)
│   │   ├── services/        # PDF extraction, LLM client, vector store
│   │   └── prompts/         # Structured LLM templates
│   ├── requirements.txt
│   └── Dockerfile
├── backend/                 # NestJS Backend API
│   ├── src/                 # Authentication, Users, Papers modules
│   ├── prisma/              # Prisma configuration & schema
│   ├── package.json
│   └── Dockerfile
└── frontend/                # Next.js 15 App Router Frontend
    ├── src/                 # Pages, services, auth hooks, layout, globals
    ├── package.json
    └── Dockerfile
```

---

## Local Setup & Installation

### Prerequisite Checklist
1. **Node.js** v20+ and **npm** installed.
2. **Python** 3.10+ installed.
3. **PostgreSQL** database active (or running via Docker).
4. **Google Gemini API Key** (obtainable from Google AI Studio).

### Step 1: Clone and Configure Environment Variables
Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```
Open `.env` and fill in the following:
* `GEMINI_API_KEY`: Your Gemini API key.
* `DATABASE_URL`: Local or neon database link. (e.g., `postgresql://postgres:password@localhost:5432/paper_summarizer_db?schema=public`).

---

### Run Method A: Docker Compose (Recommended)
Docker will build and deploy all containers (Postgres, FastAPI, NestJS Backend, and Next.js Frontend) inside a unified bridge network:

```bash
docker-compose up --build
```
Once launched:
* Frontend runs on: `http://localhost:3000`
* Backend API runs on: `http://localhost:4000`
* Backend Swagger docs: `http://localhost:4000/api/docs`
* FastAPI AI Service runs on: `http://localhost:8000`

---

### Run Method B: Local Development (Service-by-Service)

If you wish to run without Docker, configure each microservice locally:

#### 1. Setup & Migrate the Database
Initialize tables in your Postgres database:
```bash
cd backend
npm install
# Set your DATABASE_URL in a local .env file in the backend folder
npx prisma migrate dev --name init
```

#### 2. Run the NestJS Backend
Start the NestJS dev server:
```bash
npm run start:dev
```
API launches at `http://localhost:4000`.

#### 3. Run the FastAPI AI Service
Configure a Python virtual environment and run the AI service:
```bash
cd ../ai-service
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
# Run FastAPI via Uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
AI endpoints will launch at `http://localhost:8000`.

#### 4. Run the Next.js Frontend
Start the Next.js hot-reloaded dev server:
```bash
cd ../frontend
npm install
npm run dev
```
Frontend portal launches at `http://localhost:3000`.

---

## Key API Endpoints

### 🔐 Authentication Module
- `POST /auth/register` - Create user. Returns JWT Access Token (15m) + Refresh Token (7d).
- `POST /auth/login` - Validate credentials and issue new tokens.
- `POST /auth/refresh` - Swap a refresh token for a new set of tokens.

### 📚 Papers Module
- `POST /papers/upload` - Upload PDF paper. Parsed metadata (title, authors, DOI) and extracted citations are saved to Postgres, and chunks are saved to ChromaDB.
- `GET /papers` - Return user's library.
- `DELETE /papers/:id` - Delete paper, files, and vector chunks.
- `POST /papers/compare` - Compare multiple papers (requires summaries to be generated).

### 🤖 Summaries & RAG Chat Modules
- `POST /papers/:id/summary` - Triggers Gemini summarization. Caches in Postgres.
- `POST /papers/:id/chat` - Queries paper's vector chunks in ChromaDB, injects context, and answers questions using Gemini.
- `GET /papers/:id/citations` - Fetch scientific references extracted from the paper.
