# Home Academy — Backend API

Node.js + Express + SQLite (better-sqlite3) backend for the Home Academy Register & Records Portal.
Replaces the old `localStorage`-based data layer with a real database, JWT auth, and hashed passwords.

## ⚠️ Important: Vercel Deployment

**This backend will NOT work correctly on Vercel** (or any serverless platform) because it uses a
file-based SQLite database. Serverless functions get a fresh, ephemeral filesystem on every
invocation — any data written to the `.db` file disappears almost immediately, and multiple
concurrent requests won't share the same file at all.

**Recommended instead:**
- **Render.com** or **Railway.app** — free tier, persistent disk, works with this code with zero changes.
- If you must use Vercel: swap `better-sqlite3` for **Turso** (`@libsql/client`, SQLite-compatible,
  works over HTTP) or migrate to Postgres (Neon/Supabase) — happy to help with that migration if needed.

## 1. Local Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set a real JWT_SECRET and admin credentials
npm run seed     # creates the DB file and inserts sample students/homework
npm run dev      # starts on http://localhost:4000
```

Sample login after seeding: `laiba@1001` / `laiba321` (student), `admin` / `admin123` (admin, from `.env`).

## 2. Deploying to Render (recommended)

1. Push this `backend/` folder to a GitHub repo.
2. On Render: **New → Web Service** → connect the repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env.example` in the Render dashboard.
6. Add a **Persistent Disk** mounted at `/opt/render/project/src/data` (or wherever `data/` resolves)
   so the SQLite file survives restarts/deploys.
7. Run `npm run seed` once via Render's shell (or let the app create tables and add students through
   the admin panel — schema auto-creates on first boot).

## 3. API Overview

All endpoints are prefixed with `/api`. Protected routes require:
`Authorization: Bearer <token>` header (token comes from login).

### Auth
| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/admin-login` | `{ username, password }` | Returns `{ token, role }` |
| POST | `/auth/student-login` | `{ loginId, password }` | Returns `{ token, role, student }` |

### Students (admin only, except `GET /:id` which self+admin can access)
| Method | Path |
|---|---|
| GET | `/students?className=&search=` |
| GET | `/students/:id` |
| POST | `/students` |
| PUT | `/students/:id` |
| DELETE | `/students/:id` |

### Homework
| Method | Path | Access |
|---|---|---|
| GET | `/homework?className=` | admin (any class) / student (own class, forced) |
| POST | `/homework` | admin |
| PUT | `/homework/:id` | admin |
| DELETE | `/homework/:id` | admin |

### Tests & Questions
| Method | Path | Access |
|---|---|---|
| GET | `/tests?className=` | admin (with answers) / student (no answers) |
| GET | `/tests/:id` | admin (with answers) / student (no answers) |
| POST | `/tests` | admin |
| PUT | `/tests/:id` | admin |
| DELETE | `/tests/:id` | admin |
| POST | `/tests/:id/questions` | admin — `{ text, options: [4 strings], correct: 0-3 }` |
| DELETE | `/tests/:testId/questions/:qId` | admin |

### Results
| Method | Path | Access |
|---|---|---|
| GET | `/results?className=&subject=` | admin (all) / student (own only) |
| POST | `/results` | admin — manually publish a result |
| POST | `/results/submit-test` | student — `{ testId, answers: {questionId: optionIndex} }`, server grades it |
| DELETE | `/results/:id` | admin |

### Roll Slips
| Method | Path | Access |
|---|---|---|
| GET | `/rollslips` | admin (all) / student (own only) |
| POST | `/rollslips` | admin — `{ studentId, examName, examDate, subjects: [] }` |

### Dashboard
| Method | Path | Access |
|---|---|---|
| GET | `/dashboard/admin` | admin summary cards + recent students |
| GET | `/dashboard/student` | student's own summary cards |

## 4. Security notes

- Student & admin passwords are hashed with **bcrypt** — never stored in plain text.
- Auth uses **JWT** tokens (12h expiry). Store the token in `localStorage`/memory on the frontend
  and send it as `Authorization: Bearer <token>` on every request.
- Test **correct answers are never sent to students** — only admins see the `correct` field.
- Test grading happens **server-side** (`/results/submit-test`) so students can't fake their score
  by editing client-side JS.
- CORS is restricted to the origins listed in `CORS_ORIGIN` — update this to your real frontend domain(s).

## 5. Connecting the existing frontend

The current `script.js` reads/writes everything via `localStorage`. To connect it to this API,
each function that touches `students`, `homework`, `tests`, `results`, `rollSlips` needs to become
an `async` function using `fetch()` with the `Authorization` header instead of directly mutating the
in-memory arrays. If you'd like, I can rewrite `script.js` to call this API directly next.
