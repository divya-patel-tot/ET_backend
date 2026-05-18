# SpendSmart — Backend API

**AI-Powered Expense Tracker | Node.js + Express + MongoDB**

> 🔗 **Live API:** _https://your-backend.onrender.com_ ← update after deploy  
> 🔗 **Frontend Repo:** [github.com/divya-patel-tot/et_frontend](https://github.com/divya-patel-tot/et_frontend)

---

## Project Overview

RESTful Express API powering SpendSmart — an AI-powered expense tracker. Handles authentication, expense management, budget alerts, dashboard analytics, CSV export, and Gemini AI-based expense extraction.

---

## Tech Stack

| | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| AI | Google Gemini 2.5 Flash |
| Dev Tools | nodemon + ts-node |

---

## Folder Structure

```
src/
├── controllers/
│   ├── authController.ts       ← register, login, logout, getMe
│   ├── expenseController.ts    ← CRUD + CSV export
│   ├── budgetController.ts     ← budget CRUD
│   ├── dashboardController.ts  ← summary stats + monthly trend
│   └── aiController.ts         ← Gemini text extraction
├── middleware/
│   ├── authMiddleware.ts       ← JWT verification
│   └── errorHandler.ts         ← global error handler
├── models/
│   ├── User.ts                 ← bcrypt password hashing
│   ├── Expense.ts
│   └── Budget.ts
├── routes/
│   ├── auth.ts
│   ├── expenses.ts
│   ├── budget.ts
│   ├── dashboard.ts
│   └── ai.ts
├── utils/
│   ├── gemini.ts               ← Gemini API client + prompt
│   └── keepAlive.ts            ← Render free-tier ping
└── server.ts                   ← Entry point
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster ([free tier](https://www.mongodb.com/cloud/atlas))
- Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### Steps

```bash
# 1. Clone
git clone https://github.com/divya-patel-tot/et_backend.git
cd et_backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your real values

# 4. Run development server
npm run dev
# API running at http://localhost:5000
```

---

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/spendsmart
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
RENDER_URL=https://your-backend.onrender.com/api/health
```

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | Secret key for signing JWTs (min 32 chars) | ✅ |
| `GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `PORT` | Port to run the server | Optional (default: 5000) |
| `NODE_ENV` | `development` or `production` | Optional |
| `CLIENT_URL` | Frontend origin for CORS | ✅ |
| `RENDER_URL` | Backend health endpoint (keep-alive ping) | Optional |

---

## API Reference

### Auth — `/api/auth`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login, returns JWT |
| POST | `/logout` | ❌ | Clear auth cookie |
| GET | `/me` | ✅ | Get current user |

**Register / Login request body:**
```json
{
  "name": "Arjun Sharma",
  "email": "arjun@example.com",
  "password": "Secure@123"
}
```

**Password rules:** min 8 chars, at least 1 number, at least 1 special character.

---

### Expenses — `/api/expenses`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | List expenses (query: `category`, `month`, `page`) |
| POST | `/` | ✅ | Create expense |
| PUT | `/:id` | ✅ | Update expense |
| DELETE | `/:id` | ✅ | Delete expense |
| GET | `/export` | ✅ | Download CSV (query: `month`) |

**Expense body:**
```json
{
  "amount": 1499.00,
  "category": "Food",
  "date": "2024-01-15T00:00:00.000Z",
  "note": "BigBasket groceries"
}
```

**Categories:** `Food` · `Transport` · `Shopping` · `Health` · `Entertainment` · `Bills` · `Other`

---

### Budget — `/api/budget`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get budgets (query: `month`) |
| POST | `/` | ✅ | Set budget limit |
| PUT | `/:id` | ✅ | Update limit |
| DELETE | `/:id` | ✅ | Delete budget |

---

### Dashboard — `/api/dashboard`

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/summary` | ✅ | Monthly total, by-category, 6-month trend, recent expenses |

---

### AI — `/api/ai`

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/extract` | ✅ | Extract expense from raw text using Gemini |

**Request:**
```json
{ "text": "Swiggy order ₹340 on Jan 16, biryani" }
```

**Response:**
```json
{
  "extracted": {
    "amount": 340,
    "category": "Food",
    "date": "2024-01-16T00:00:00.000Z",
    "note": "Swiggy order biryani"
  }
}
```

---

### Health — `/api/health`

```
GET /api/health → { "status": "ok", "uptime": 123, "timestamp": "..." }
```

---

## Security

- Passwords hashed with **bcryptjs** (10 salt rounds)
- JWTs signed with `JWT_SECRET`, expire in 7 days
- Tokens sent as **HTTP-only cookies** + `Authorization` header
- All protected routes check JWT via `authMiddleware`
- CORS restricted to `CLIENT_URL` origin only
- No secrets in source code — `.env` is in `.gitignore`

---

## Deployment — Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect `et_backend`
3. Settings:
   - **Build command:** `npm install && npx tsc`
   - **Start command:** `node dist/server.js`
4. Add all environment variables from `.env.example`
5. Deploy

> The `keepAlive` util pings `RENDER_URL` every 14 minutes to prevent the free-tier instance from sleeping.

---

## Related

- **Frontend App:** [github.com/divya-patel-tot/et_frontend](https://github.com/divya-patel-tot/et_frontend)
