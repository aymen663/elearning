<div align="center">

<img src="https://img.shields.io/badge/EduAI-E--Learning%20Platform-6366f1?style=for-the-badge&logoColor=white" alt="EduAI" height="32"/>

# 🎓 EduAI — AI-Powered E-Learning Platform

**A next-generation e-learning platform supercharged by Generative AI.**  
Built with a RAG-powered personal tutor, adaptive AI quizzes, real-time messaging, community forums, and automated certifications — all secured by Keycloak SSO.

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Keycloak](https://img.shields.io/badge/Keycloak-SSO-4D629B?style=flat-square&logo=keycloak&logoColor=white)](https://www.keycloak.org/)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-FF6B35?style=flat-square)](https://langchain.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F55036?style=flat-square)](https://groq.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [API Reference](#-api-reference)
- [User Roles](#-user-roles)
- [Teacher Onboarding Flow](#-teacher-onboarding-flow)
- [RAG Architecture](#-rag-architecture-deep-dive)
- [Author](#-author)

---

## 🌟 Overview

**EduAI** is a full-stack e-learning platform built as a Final Year Project (PFE), designed to demonstrate the real-world integration of **Generative AI** into online education. It goes beyond a standard CRUD application by embedding a **RAG (Retrieval-Augmented Generation)** AI tutor directly into every course — providing students with accurate, context-aware answers grounded in the actual course material.

The platform supports three distinct user roles:

| Role | Description |
|---|---|
| 🎓 **Student** | Browse & enroll in courses, complete lessons, take AI quizzes, chat with the AI tutor, earn certificates |
| 🧑‍🏫 **Instructor** | Create and manage courses & lessons, upload PDFs, view student analytics |
| 🛡️ **Admin** | Full platform control — user management, course oversight, global statistics |

---

## ✨ Features

### 🤖 AI & Intelligence
| Feature | Details |
|---|---|
| **RAG AI Tutor** | Per-course chatbot trained on lesson content using LangChain + Groq (Llama 3.3 70B) |
| **Adaptive AI Quizzes** | Auto-generated multiple-choice quizzes tailored to lesson content and difficulty level |
| **AI Translation** | Translate any lesson into 6 languages (FR, EN, AR, ES, DE, ZH) via Groq API |
| **Auto-Ingestion** | Course content is automatically indexed into the vector store at server startup |

### 📚 Courses & Learning
| Feature | Details |
|---|---|
| **Course Catalog** | Browse by category, level, and keyword with full-text search & pagination |
| **Multi-format Lessons** | Rich text content + PDF upload with automatic text extraction |
| **Progress Tracking** | Lesson-by-lesson advancement with completion percentage |
| **Enrollment Management** | One-click enroll/unenroll with persistent state |
| **Auto Certification** | Completion certificate with QR code generated at 100% course progress |

### 👨‍🏫 Instructor Dashboard
- Create, edit, and delete courses and individual lessons
- Upload PDFs — text is automatically extracted and indexed for the RAG tutor
- Analytics dashboard: enrolled students, lesson completion rates, published courses
- Detailed per-student progress view

### 🛡️ Admin Panel
- Full user management (students & instructors)
- Course moderation (publish, delete, review)
- Global platform statistics dashboard

### 💬 Community & Social
| Feature | Details |
|---|---|
| **Discussion Forum** | Course-linked threads with posts and replies |
| **Direct Messaging** | Real-time user-to-user messaging |
| **AI Chat Interface** | Dedicated chat page for the course AI tutor |

### 🔐 Authentication & Security
| Feature | Details |
|---|---|
| **Keycloak SSO** | Centralized identity management with custom EduAI theme |
| **Google OAuth** | One-click social login via Keycloak Identity Provider |
| **GitHub OAuth** | One-click social login via Keycloak Identity Provider |
| **JWT (RS256)** | Tokens verified via JWKS endpoint (RS256) — stateless and secure |
| **PKCE S256** | Secure Authorization Code flow with code challenge |
| **JWKS Caching** | Public keys cached for 10 min to avoid redundant Keycloak calls |
| **Silent SSO Check** | `check-sso` on app load — seamless session restore without redirect |
| **Role-based Access** | Fine-grained route protection with `protect()` + `restrictTo()` middleware |
| **Zustand Auth Store** | Client-side auth state with localStorage caching (`eduai_user_cache`) |
| **Teacher Invitation** | Admin creates teacher accounts → email verification → password setup → KC sync |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                       │
│                    Next.js 14  (Port 3000)                  │
│          App Router · Tailwind CSS · Framer Motion          │
└────────────────────────┬────────────────────────────────────┘
                         │  REST API (Axios)
                         │  JWT Bearer (RS256)
┌────────────────────────▼────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                       │
│                       (Port 5000)                           │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  /auth   │  │ /courses │  │  /quiz   │  │  /chat   │   │
│  │  /forum  │  │/progress │  │ /admin   │  │/messages │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌───────────────────────────────────────┐                 │
│  │          RAG Tutor Service            │                 │
│  │  LangChain · MemoryVectorStore        │                 │
│  │  Groq API (Llama 3.3 70B)            │                 │
│  └───────────────────────────────────────┘                 │
└────────────┬────────────────────────┬───────────────────────┘
             │                        │
    ┌────────▼───────┐      ┌─────────▼─────────┐
    │  MongoDB Atlas │      │      Keycloak      │
    │  (Data + Auth) │      │   (Port 8080)      │
    │                │      │  SSO · Roles · IDP │
    └────────────────┘      └───────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| **Next.js** | 14.0.4 | React framework (App Router, SSR, Client Components) |
| **Tailwind CSS** | 3.3+ | Utility-first styling |
| **Framer Motion** | 12+ | UI animations & transitions |
| **Radix UI** | Latest | Accessible headless components (Dialog, Tabs, Select…) |
| **Lucide React** | 0.303 | Icon system |
| **Recharts** | 3+ | Analytics charts & graphs |
| **Zustand** | 4.4 | Global auth state management |
| **Axios** | 1.6 | HTTP client for API calls |
| **keycloak-js** | 26.2 | Keycloak client-side integration |
| **react-hot-toast** | 2.6 | Toast notifications |
| **react-markdown** | 9.0 | Render AI Markdown responses |
| **qrcode.react** | 4.2 | QR code generation for certificates |

### Backend

| Technology | Version | Role |
|---|---|---|
| **Node.js + Express** | 4.18 | REST API server |
| **MongoDB + Mongoose** | 8.0 | NoSQL database & ODM |
| **LangChain** | 0.1 | RAG orchestration pipeline |
| **Groq API** | — | Llama 3.3 70B inference (quiz, chat, translation) |
| **OpenAI SDK** | 4.20 | Text embeddings for RAG |
| **pdf-parse** | 1.1 | PDF text extraction |
| **jsonwebtoken + jwks-rsa** | — | Keycloak JWT verification (RS256) |
| **bcryptjs** | 2.4 | Local password hashing |
| **multer** | 1.4 | File upload handling (PDF) |
| **Cloudinary** | — | Cloud image storage (course thumbnails) |

### Infrastructure & Auth

| Technology | Role |
|---|---|
| **Keycloak** | Identity Provider (SSO, roles, social login, custom theme) |
| **Docker Compose** | Containerized Keycloak deployment |
| **MongoDB Atlas** | Cloud database |

---

## 📁 Project Structure

```
elearning-pfe/
├── frontend/                        # Next.js 14 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.jsx             # Landing page
│   │   │   ├── layout.js            # Global layout (Keycloak Provider)
│   │   │   ├── globals.css          # Global styles & design system
│   │   │   ├── dashboard/           # Student dashboard
│   │   │   ├── courses/             # Course catalog + [id] detail page
│   │   │   ├── instructor/          # Instructor space (courses, analytics)
│   │   │   ├── admin/               # Admin panel (users, courses, stats)
│   │   │   ├── chat/                # AI tutor chat interface
│   │   │   ├── forum/               # Community forum
│   │   │   ├── messages/            # Direct messaging
│   │   │   ├── certificates/        # Completion certificates
│   │   │   ├── profile/             # User profile
│   │   │   ├── login/               # Login page
│   │   │   ├── register/            # Registration page
│   │   │   └── auth/callback/       # Keycloak OAuth callback
│   │   ├── components/
│   │   │   ├── layout/              # Sidebar, Navbar
│   │   │   ├── chat/                # AI chat components
│   │   │   ├── quiz/                # Quiz UI components
│   │   │   └── ui/                  # Reusable UI components
│   │   └── lib/
│   │       ├── keycloak.js          # Keycloak singleton instance
│   │       ├── KeycloakProvider.jsx # Keycloak React provider
│   │       ├── authStore.js         # Zustand auth store (+ localStorage cache)
│   │       ├── api.js               # Axios client (all API endpoints)
│   │       ├── githubAuth.js        # GitHub login helper
│   │       └── socialAuth.js        # Social auth helpers
│   ├── .env.local                   # Frontend environment variables
│   └── package.json
│
├── backend/                         # Express.js API
│   ├── src/
│   │   ├── server.js                # Entry point + RAG auto-ingest on startup
│   │   ├── routes/
│   │   │   ├── auth.js              # POST /api/auth/keycloak-sync
│   │   │   ├── courses.js           # CRUD, PDF upload, AI translation
│   │   │   ├── quiz.js              # AI quiz generation
│   │   │   ├── progress.js          # Lesson progress tracking
│   │   │   ├── chat.js              # RAG tutor endpoint
│   │   │   ├── admin.js             # Admin routes
│   │   │   ├── students.js          # Student management
│   │   │   ├── messages.js          # Direct messaging
│   │   │   └── forum.js             # Forum posts & replies
│   │   ├── models/
│   │   │   ├── User.js              # User model (multi-provider support)
│   │   │   ├── Course.js            # Course + lessons + RAG vector IDs
│   │   │   ├── Progress.js          # Per-student progress
│   │   │   ├── Message.js           # Direct messages
│   │   │   ├── ForumPost.js         # Forum posts
│   │   │   └── ForumReply.js        # Forum replies
│   │   ├── middleware/
│   │   │   └── auth.js              # protect() + restrictTo() (Keycloak JWKS)
│   │   └── services/
│   │       └── rag/
│   │           └── tutorService.js  # RAG ingest + query pipeline (LangChain)
│   ├── .env                         # Backend environment variables
│   └── package.json
│
├── infra/
│   ├── docker-compose.yml           # Keycloak container definition
│   └── keycloak/                    # Keycloak realm & theme config
│
└── keycloak/
    └── themes/                      # Custom EduAI Keycloak login theme
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18 — [Download](https://nodejs.org/)
- **npm** ≥ 9
- **Docker** + **Docker Compose** — [Download](https://www.docker.com/)
- **MongoDB Atlas** account (or local MongoDB) — [Get started free](https://www.mongodb.com/atlas)
- **Groq API Key** (free) — [console.groq.com](https://console.groq.com)
- *(Optional)* **Cloudinary** account for image uploads

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/aymen663/elearning-pfe.git
cd elearning-pfe
```

---

### Step 2 — Start Keycloak

```bash
cd infra
docker compose up -d
```

Keycloak will be available at [http://localhost:8080](http://localhost:8080).

> **Default credentials:** `admin` / `admin`

---

### Step 3 — Configure Keycloak

In the Keycloak Admin Console ([http://localhost:8080](http://localhost:8080)):

1. **Create a Realm** named `elearning`
2. **Create a Client** named `elearning-frontend`:
   - Client type: `Public`
   - Valid Redirect URIs: `http://localhost:3000/*`
   - Web Origins: `http://localhost:3000`
3. *(Optional)* Add **Identity Providers** for Google and GitHub
4. The custom **EduAI theme** is already included in `keycloak/themes/` — mount it via Docker volume (already configured in `docker-compose.yml`)

---

### Step 4 — Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#-environment-variables)):

```bash
npm install
```

---

### Step 5 — Configure the Frontend

```bash
cd frontend
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=elearning
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=elearning-frontend
```

```bash
npm install
```

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

| Variable | Description | Required |
|---|---|---|
| `PORT` | Express server port (default: `5000`) | ✅ |
| `MONGODB_URI` | MongoDB Atlas connection URI | ✅ |
| `JWT_SECRET` | Secret key for local JWT signing | ✅ |
| `KEYCLOAK_URL` | Keycloak base URL (e.g. `http://localhost:8080`) | ✅ |
| `KEYCLOAK_REALM` | Keycloak realm name (`elearning`) | ✅ |
| `KEYCLOAK_CLIENT_ID` | Keycloak client ID (`elearning-frontend`) | ✅ |
| `KEYCLOAK_ADMIN_USER` | Keycloak admin username | ✅ |
| `KEYCLOAK_ADMIN_PASS` | Keycloak admin password | ✅ |
| `GROQ_API_KEY` | Groq API key for Llama 3.3 inference | ✅ |
| `OPENAI_API_KEY` | OpenAI API key (used for embeddings) | ⚡ |
| `FRONTEND_URL` | Frontend base URL (`http://localhost:3000`) | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ⚡ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ⚡ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ⚡ |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | ⚡ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ⚡ |

> ✅ Required &nbsp;·&nbsp; ⚡ Optional (feature is disabled if not set)

**Example `backend/.env`:**

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/?appName=Cluster0
JWT_SECRET=your_long_random_jwt_secret_here
JWT_EXPIRES_IN=7d

KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=elearning
KEYCLOAK_CLIENT_ID=elearning-frontend
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASS=admin

GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx

FRONTEND_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

---

### Frontend — `frontend/.env.local`

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | ✅ |
| `NEXT_PUBLIC_KEYCLOAK_URL` | Keycloak server URL | ✅ |
| `NEXT_PUBLIC_KEYCLOAK_REALM` | Keycloak realm name | ✅ |
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Keycloak client ID | ✅ |

---

## ▶️ Running the App

### Development Mode

Open **3 separate terminals**:

**Terminal 1 — Keycloak (if not already running):**
```bash
cd infra
docker compose up -d
```
> Keycloak available at [http://localhost:8080](http://localhost:8080)

**Terminal 2 — Backend API:**
```bash
cd backend
npm run dev
```
> API available at [http://localhost:5000](http://localhost:5000)

**Terminal 3 — Frontend:**
```bash
cd frontend
npm run dev
```
> App available at [http://localhost:3000](http://localhost:3000)

---

### Production Mode

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend
npm run build
npm start
```

---

### Health Check

Verify the backend is connected and healthy:

```
GET http://localhost:5000/api/health
→ { "status": "OK", "db": "connected" }
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/auth/me` | ✅ Bearer | Retourne le profil de l'utilisateur connecté |
| `POST` | `/api/auth/keycloak-sync` | ✅ Bearer | Synchronise le compte Keycloak ↔ MongoDB après login |
| `POST` | `/api/auth/verify-email` | — | Vérifie le token d'email et délivre un `setPasswordToken` (1h) |
| `POST` | `/api/auth/set-password` | — | Définit le mot de passe, active le compte et synchronise Keycloak |

### Courses
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/courses` | — | List all courses (supports `?category`, `?level`, `?search`, `?page`) |
| `GET` | `/api/courses/:id` | — | Get course details + student progress |
| `POST` | `/api/courses` | Instructor | Create a new course |
| `PUT` | `/api/courses/:id` | Instructor | Update a course |
| `DELETE` | `/api/courses/:id` | Instructor/Admin | Delete a course |
| `POST` | `/api/courses/:id/enroll` | Student | Enroll in a course |
| `DELETE` | `/api/courses/:id/enroll` | Student | Unenroll from a course |
| `POST` | `/api/courses/:id/lessons/:lid/upload-pdf` | Instructor | Upload PDF, extract text, ingest into RAG |
| `POST` | `/api/courses/:id/lessons/:lid/translate` | Student | AI-translate a lesson |

### AI Features
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chat` | Student | Ask a question to the RAG AI tutor |
| `POST` | `/api/quiz/generate` | Student | Generate an adaptive AI quiz for a lesson |

### Progress & Certificates
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/progress/:courseId` | Student | Get lesson progress for a course |
| `POST` | `/api/progress/:courseId/lessons/:lid` | Student | Mark a lesson as complete |

### Community
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/forum` | Student | List forum posts |
| `POST` | `/api/forum` | Student | Create a forum post |
| `POST` | `/api/forum/:id/replies` | Student | Reply to a post |
| `GET` | `/api/messages` | Student | Get direct message threads |
| `POST` | `/api/messages` | Student | Send a direct message |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Global platform statistics |
| `GET` | `/api/admin/users` | Admin | List all users |
| `PATCH` | `/api/admin/users/:id/role` | Admin | Update a user's role |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete a user |
| `POST` | `/api/admin/teachers` | Admin | Create a teacher account and send email invitation |
| `POST` | `/api/admin/resend-verification/:id` | Admin | Resend the verification email to a teacher |

---

## 👤 User Roles

Roles are stored in MongoDB and assigned by admins. To promote a user programmatically:

```http
PATCH /api/admin/users/:id/role
Authorization: Bearer <admin_jwt>
Content-Type: application/json

{ "role": "instructor" }
```

| Role | Accessible Features |
|---|---|
| `student` | Course catalog, lessons, AI tutor, adaptive quizzes, forum, DMs, certificates, profile |
| `instructor` | All student features + course creation/editing, PDF uploads, student analytics |
| `admin` | All instructor features + platform-wide user & course management, global stats |

---

## 👩‍🏫 Teacher Onboarding Flow

When an admin creates a teacher account, the following process is triggered automatically:

```
1. Admin  →  POST /api/admin/teachers
              └─ MongoDB: User created (isActive: false, emailVerified: false)
              └─ Keycloak Admin API: user created, keycloakId stored
              └─ Email Service: invitation email sent with a signed token

2. Teacher opens the email link  →  /verify-email?token=<raw_token>
              └─ POST /api/auth/verify-email
              └─ SHA-256(token) matched in DB
              └─ emailVerified = true
              └─ New setPasswordToken generated (1h TTL)

3. Teacher sets password  →  /set-password
              └─ POST /api/auth/set-password { token, password, confirmPassword }
              └─ Password hashed via bcrypt hook → saved to MongoDB
              └─ isActive = true
              └─ Keycloak Admin API: password synced (PUT /reset-password)
              └─ Keycloak Admin API: profile updated + requiredActions cleared
              └─ Account is now fully active ✅
```

> **Token security:** All email tokens are stored as `SHA-256` hashes in MongoDB — the raw token is only ever sent by email and never stored in plain text.

---

## 🧠 RAG Architecture Deep Dive

The AI tutor uses **Retrieval-Augmented Generation (RAG)** to provide accurate, grounded answers:

```
┌─────────────────── INDEXING PIPELINE ────────────────────────┐
│                                                               │
│  Instructor uploads PDF / lesson text                         │
│         ↓                                                     │
│  pdf-parse extracts raw text                                  │
│         ↓                                                     │
│  LangChain RecursiveCharacterTextSplitter                     │
│  → creates overlapping chunks (e.g. 500 tokens, 50 overlap)  │
│         ↓                                                     │
│  OpenAI Embeddings API → vector representations              │
│         ↓                                                     │
│  MemoryVectorStore (per-course, keyed by courseId)           │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌─────────────────── QUERY PIPELINE ───────────────────────────┐
│                                                               │
│  Student sends a question via /chat                           │
│         ↓                                                     │
│  Embed the question with OpenAI Embeddings                    │
│         ↓                                                     │
│  Semantic similarity search in course's vector store         │
│         ↓                                                     │
│  Top-k relevant chunks retrieved as context                  │
│         ↓                                                     │
│  Context + question injected into system prompt              │
│         ↓                                                     │
│  Groq API → Llama 3.3 70B generates a grounded response      │
│         ↓                                                     │
│  Response streamed back to the student                       │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

> **Auto-ingestion:** On every server startup, all published course content is automatically re-ingested into the vector store — ensuring the AI tutor is always up to date without manual intervention.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

---

## 👤 Author

**Aymen Ben Salah**

> 🎓 Final Year Project (PFE) — AI-Powered E-Learning Platform with Generative AI  
> Built with ❤️ using Next.js, Express, LangChain, and Keycloak

---

<div align="center">

**© 2026 EduAI** &nbsp;·&nbsp; Powered by Llama 3.3 70B & LangChain &nbsp;·&nbsp; Secured by Keycloak

</div>
