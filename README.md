# Pulse Survey Portal

## What Is This?

The **Pulse Survey Portal** is an internal tool that helps your organisation regularly check in on how employees feel about different areas of their work — such as their skills in specific technologies, their experience with their team, or their professional growth.

Think of it as a periodic "health check" for the organisation, where employees answer a short set of questions. Their responses are collected, analysed, and presented to the right people (HR, Business Unit heads, administrators) so that meaningful action can be taken.

---

## Who Uses It?

There are four types of users in the system:

### 1. Administrator (ADMIN)
The most powerful role. Usually the HR or IT team managing the portal.

**What they can do:**
- Create, edit, publish, and delete surveys
- Add or remove questions from surveys
- Manage all employee accounts and assign roles
- Assign each employee to a Business Unit and an HRBP
- View the complete analytics for the entire organisation
- Filter analytics by Business Unit or by Technology Competency (e.g. Java, JavaScript)

---

### 2. Business Unit Head (BU Head)
A leader who oversees a specific department or team in the organisation.

**What they can do:**
- View all active and past surveys
- See how their own Business Unit's employees responded — broken down by question and category
- Track participation rates (how many people in their BU have completed the survey)

---

### 3. HRBP (Human Resources Business Partner)
An HR professional who is directly responsible for a specific group of employees.

**What they can do:**
- View survey responses from employees directly assigned to them
- View the same analytics for their employees' full reporting hierarchy — all levels down the chain (like zooming out on a family tree to see all branches)
- This is useful when an HRBP manages not just a flat list of people, but a team where some employees also have their own direct reports

---

### 4. Employee
A regular team member who takes the survey.

**What they can do:**
- Log in using their company Google account
- See the currently active survey
- Fill in ratings (1–5) and optional comments for each question
- Save their progress as a draft and return to complete it later
- Submit the final response when ready

---

## How Does Login Work?

This portal uses **Google Sign-In** exclusively. There is no username/password to remember.

1. Visit the portal link
2. Click **"Sign in with Google"**
3. Choose your company Google account
4. You are automatically taken to the right section based on your role

> **Important:** Only employees whose accounts have been set up in the system by an Administrator can access the portal — even if you have a valid company Google account.

---

## How Does a Survey Work?

### Step 1 — Admin Creates the Survey
The Administrator logs in and creates a new survey. They:
- Give it a title and description
- Set a start and end date
- Add questions, grouping each under a category (e.g. *Java Skills*, *Communication*, *Leadership*)
- Save it as a **Draft** while building it

### Step 2 — Admin Publishes the Survey
When ready, the Admin clicks **Publish**. The survey becomes active and is visible to all employees.

### Step 3 — Employees Complete the Survey
Employees log in and see the active survey. They:
- Rate each question from **1 (Strongly Disagree)** to **5 (Strongly Agree)**
- Optionally add a comment explaining their rating
- Can save their progress and return later
- Submit when all questions are answered

### Step 4 — Admin Closes the Survey
Once the deadline passes, the Admin closes the survey. No more responses are accepted.

### Step 5 — Analytics Are Available
All roles (Admin, BU Head, HRBP) can now view reports filtered to their level of access.

---

## What Do the Analytics Show?

Analytics are presented as visual charts and tables. Here is what each role sees:

| What is measured | Admin | BU Head | HRBP |
|---|---|---|---|
| Organisation-wide average scores per category | ✅ | — | — |
| Business Unit scores per category | ✅ | ✅ (own BU only) | — |
| Competency group scores (e.g. all Java developers) | ✅ | — | — |
| Direct assigned employees' scores | — | — | ✅ |
| Full team hierarchy scores (all levels) | — | — | ✅ |

**Categories** are topic areas that group related questions — for example:
- *Java Skills* — questions about Java programming knowledge
- *JavaScript Skills* — questions about frontend development
- *Team Collaboration* — questions about how well teams work together
- *Communication* — questions about clarity and openness in communication

The score for each category is the **average rating** given by all eligible employees to all questions in that category.

---

## What Is the Hierarchy Feature for HRBPs?

An HRBP may be responsible for a team that looks like a tree:

```
HRBP Sarah
├── Team Lead A
│   ├── Developer 1
│   ├── Developer 2
│   └── Developer 3
└── Team Lead B
    ├── Developer 4
    └── Developer 5
```

The **Hierarchy View** lets HRBP Sarah see analytics not just for Team Lead A and Team Lead B directly, but for *all employees at every level beneath her* — Developers 1 through 5 included.

This gives a complete picture of how her entire part of the organisation responded to the survey.

---

## Key Concepts at a Glance

| Term | Plain English Meaning |
|---|---|
| Survey | A set of questions sent to employees at a point in time |
| Question | A single statement that employees rate from 1 to 5 |
| Category | A topic group that questions belong to (e.g. Java, Leadership) |
| Rating | A number from 1 to 5 given by an employee to a question |
| Comment | An optional written explanation for a rating |
| Draft | A partially completed survey response, saved but not yet submitted |
| Business Unit (BU) | A department or team in the organisation |
| HRBP | An HR person assigned to support a specific group of employees |
| Competency | A technology or skill area (e.g. Java, JavaScript) |
| Analytics | Charts and summaries showing how employees responded overall |

---

## Data Privacy

- Individual employee responses are **not shown** to BU Heads or HRBPs by name — only aggregated scores and averages are visible to them.
- Only **Administrators** can access individual response details.
- All data is stored securely within the organisation's infrastructure.

---

## For Developers — Getting Started

### Prerequisites
- Docker & Docker Compose
- A Google Cloud project with OAuth 2.0 credentials

### Setup

```bash
# 1. Clone / copy the project
cd pulse-survey

# 2. Create your environment file
cp .env.example .env
# Edit .env and fill in your Google Client ID, allowed domain, and JWT secret

# 3. Start everything
docker compose up --build

# Frontend:  http://localhost:3000
# Backend:   http://localhost:8080
# Database:  localhost:5432 (postgres / postgres)
```

### Local Development (without Docker)

**Backend:**
```bash
cd backend
./gradlew bootRun
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console | `123456.apps.googleusercontent.com` |
| `GOOGLE_ALLOWED_DOMAIN` | Only users from this domain can log in | `tothenew.com` |
| `JWT_SECRET` | Secret key for signing internal tokens (min 32 chars) | `a-long-random-secret-string` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Recharts |
| Backend | Spring Boot 3.2, Java 17, Gradle |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Auth | Google OAuth 2.0 SSO + Internal JWT |
| Infrastructure | Docker, Docker Compose, Flyway (DB migrations) |

---

## Getting Help

If you cannot log in, cannot see the survey, or have any questions about how the system works, please contact your HR Administrator or the team managing this portal.
# NPS-Portal
