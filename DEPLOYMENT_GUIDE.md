# 🌐 AI Interview Preparation Assistant - Deployment Guide

This step-by-step guide walks you through deploying your project live to **GitHub**, **Supabase**, **Render**, and **Vercel** so you can share a live working link on your resume and LinkedIn.

---

## 1. Upload Project to GitHub

1. Open your browser and go to [github.com/new](https://github.com/new).
2. Name the repository: `ai-interview-assistant`.
3. Choose **Public** (recommended for portfolio/resume visibility).
4. Do **not** initialize with README or .gitignore (we already created them).
5. Click **Create repository**.
6. In your local terminal, link and push the commits:

```bash
cd C:\Users\ankit\.gemini\antigravity\scratch\ai-interview-assistant

# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-interview-assistant.git

# Push main branch to GitHub
git push -u origin main
```

---

## 2. Set Up Supabase (PostgreSQL Database)

1. Sign up or log in at [supabase.com](https://supabase.com).
2. Click **New Project** and name it `ai-interview-assistant`.
3. Set a database password and select your preferred region (e.g., *Singapore / Mumbai* for India, or *US East*).
4. Once the project finishes provisioning (takes ~1 minute):
   - Go to **SQL Editor** (in the left sidebar).
   - Click **New Query**.
   - Copy the entire contents of [`supabase_schema.sql`](./supabase_schema.sql) and paste it into the editor.
   - Click **Run**. All tables (`profiles`, `resumes`, `job_descriptions`, `skill_matches`, `interview_sessions`, etc.), indexes, and RLS policies will be created automatically.
5. In Supabase, go to **Project Settings** → **API**:
   - Copy your **Project URL** (e.g., `https://xyzcompany.supabase.co`).
   - Copy your **Project API Key (`anon` public or `service_role` secret)**.

---

## 3. Deploy Backend to Render (Free Tier)

1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** → **Web Service**.
3. Select your GitHub repository: `ai-interview-assistant`.
4. Configure the service:
   - **Name**: `ai-interview-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Region**: Oregon or Frankfurt
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. In **Environment Variables**, add the following keys:
   - `SUPABASE_URL`: *(Your Supabase Project URL from Step 2)*
   - `SUPABASE_KEY`: *(Your Supabase API Key from Step 2)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key from https://aistudio.google.com)*
   - `JWT_SECRET`: *(A random 32+ character string, e.g. `sup3rs3cr3tjwtk3y_ai_int3rv13w_2026`)*
   - `ENVIRONMENT`: `production`
6. Click **Create Web Service**.
7. Once deployed, Render will provide your public backend URL (e.g., `https://ai-interview-backend.onrender.com`).
   - Test it by visiting `https://ai-interview-backend.onrender.com/docs` to see the live Swagger UI!

---

## 4. Deploy Frontend to Vercel (Free Tier)

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your `ai-interview-assistant` repository.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click edit and select `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://ai-interview-backend.onrender.com` *(Your live Render backend URL without trailing slash)*
   - `VITE_SUPABASE_URL`: *(Your Supabase Project URL)*
   - `VITE_SUPABASE_ANON_KEY`: *(Your Supabase anon key)*
6. Click **Deploy**.
7. Within 60 seconds, your site will be live at `https://ai-interview-assistant-xxx.vercel.app`!

---

## 5. Final Verification Checklist

- [ ] Visit your Vercel frontend URL.
- [ ] Upload a sample resume on `/resume`.
- [ ] Paste a job description on `/job`.
- [ ] Run the **Skill Match** on `/match` and verify semantic scores.
- [ ] Launch a **Mock Interview** on `/interview`, test microphone audio recording, and submit an answer.
- [ ] Verify that Gemini 3.8 Flash grades the response with strengths, weaknesses, and follow-up challenges.
- [ ] Check `/performance` to see your radar chart and weak skills roadmap.
- [ ] Add the live Vercel URL and GitHub repository link to your resume and LinkedIn!
