-- =======================================================================
-- AI INTERVIEW PREPARATION ASSISTANT - SUPABASE DATABASE SCHEMA
-- =======================================================================
-- PostgreSQL Schema with Row Level Security (RLS) & Indexes for Supabase
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =======================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Candidate User Information)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT, -- Used if self-managed JWT auth is enabled
    full_name TEXT NOT NULL,
    target_role TEXT DEFAULT 'Full Stack Developer',
    experience_years INT DEFAULT 1,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESUMES TABLE (Uploaded Resumes & Parsed Data)
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_url TEXT,
    parsed_text TEXT,
    extracted_skills JSONB DEFAULT '[]'::jsonb,
    extracted_experience JSONB DEFAULT '[]'::jsonb,
    extracted_education JSONB DEFAULT '[]'::jsonb,
    extracted_projects JSONB DEFAULT '[]'::jsonb,
    raw_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOB DESCRIPTIONS TABLE (Parsed Target Roles)
CREATE TABLE IF NOT EXISTS public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company_name TEXT DEFAULT 'Target Company',
    raw_text TEXT NOT NULL,
    extracted_skills JSONB DEFAULT '[]'::jsonb,
    experience_required TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SKILL MATCHES TABLE (Resume vs Job Comparison & Gap Analysis)
CREATE TABLE IF NOT EXISTS public.skill_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    match_percentage NUMERIC(5,2) NOT NULL,
    semantic_similarity NUMERIC(5,2) DEFAULT 0.0,
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INTERVIEW SESSIONS TABLE (Mock Interview Header)
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced
    num_questions INT DEFAULT 5,
    status TEXT DEFAULT 'in_progress',     -- in_progress, completed, abandoned
    overall_score NUMERIC(5,2) DEFAULT 0.0,
    technical_score NUMERIC(5,2) DEFAULT 0.0,
    communication_score NUMERIC(5,2) DEFAULT 0.0,
    relevance_score NUMERIC(5,2) DEFAULT 0.0,
    completeness_score NUMERIC(5,2) DEFAULT 0.0,
    summary_feedback TEXT,
    weak_areas JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 6. INTERVIEW QUESTIONS TABLE (Generated/Retrieved Questions per session)
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT DEFAULT 'Technical', -- Technical, HR, Scenario, System Design
    difficulty TEXT DEFAULT 'Intermediate',
    expected_keywords JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INTERVIEW ANSWERS TABLE (User Answers & Multi-Dimensional AI Evaluations)
CREATE TABLE IF NOT EXISTS public.interview_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.interview_questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    audio_url TEXT,
    technical_score NUMERIC(5,2) DEFAULT 0.0,
    communication_score NUMERIC(5,2) DEFAULT 0.0,
    relevance_score NUMERIC(5,2) DEFAULT 0.0,
    completeness_score NUMERIC(5,2) DEFAULT 0.0,
    overall_score NUMERIC(5,2) DEFAULT 0.0,
    feedback TEXT,
    strengths JSONB DEFAULT '[]'::jsonb,
    weaknesses JSONB DEFAULT '[]'::jsonb,
    follow_up_question TEXT,
    speaking_metrics JSONB DEFAULT '{}'::jsonb, -- {wpm, duration_sec, filler_words_count}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================================
-- INDEXES FOR PERFORMANCE
-- =======================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON public.job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_matches_user_id ON public.skill_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_session_id ON public.interview_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_session_id ON public.interview_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_question_id ON public.interview_answers(question_id);

-- =======================================================================
-- STORAGE BUCKETS SETUP (Supabase Storage for Resumes & Audio)
-- =======================================================================
-- Note: You can create buckets via Supabase dashboard -> Storage -> New Bucket:
-- 1. 'resumes' (Private or Public depending on preference)
-- 2. 'interview-audio' (Public or Private)

-- =======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;

-- Allow read/write access for authenticated users or API service role
CREATE POLICY "Profiles access policy" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Resumes access policy" ON public.resumes FOR ALL USING (true);
CREATE POLICY "Job descriptions access policy" ON public.job_descriptions FOR ALL USING (true);
CREATE POLICY "Skill matches access policy" ON public.skill_matches FOR ALL USING (true);
CREATE POLICY "Interview sessions access policy" ON public.interview_sessions FOR ALL USING (true);
CREATE POLICY "Interview questions access policy" ON public.interview_questions FOR ALL USING (true);
CREATE POLICY "Interview answers access policy" ON public.interview_answers FOR ALL USING (true);
