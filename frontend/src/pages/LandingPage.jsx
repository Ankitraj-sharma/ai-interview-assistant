import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  FileText, 
  Briefcase, 
  GitCompare, 
  Mic, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Database 
} from 'lucide-react';

export default function LandingPage() {
  const steps = [
    { title: "1. Upload Resume", desc: "PyMuPDF parses PDF/DOCX to extract skills, experience, and contact data.", icon: FileText },
    { title: "2. Paste Job Description", desc: "Identifies required tech stack, seniority, and responsibilities.", icon: Briefcase },
    { title: "3. AI Skill Gap Analysis", desc: "Computes exact match % and cosine semantic similarity.", icon: GitCompare },
    { title: "4. Targeted RAG Questions", desc: "Generates role-specific questions prioritizing your missing skills.", icon: Bot },
    { title: "5. Real-Time Mock Interview", desc: "Interactive session with text input and browser voice dictation.", icon: Mic },
    { title: "6. Multi-Metric AI Grading", desc: "Gemini 3.8 Flash grades technical, communication, relevance & depth.", icon: BarChart3 }
  ];

  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-12 sm:pt-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full-Stack AI Portfolio Project • Supabase & Gemini Powered</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Master Your Next Tech Interview with{' '}
          <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            AI Precision
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Upload your resume and target job description. Our AI uncovers your skill gaps, generates personalized RAG mock interviews, and provides instant staff-engineer grade feedback.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/interview"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-base hover:from-teal-400 hover:to-cyan-400 transition-all shadow-lg shadow-teal-500/25 group"
          >
            <span>Start Mock Interview</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/match"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-base hover:bg-slate-800 transition-all"
          >
            <GitCompare className="w-4 h-4 text-teal-400" />
            <span>Analyze Resume vs JD</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <Database className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">Supabase DB</h4>
            <p className="text-xs text-slate-400">PostgreSQL tables, session history & RLS security.</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <Zap className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">Gemini 3.8 Flash</h4>
            <p className="text-xs text-slate-400">Fast, nuanced answer grading & follow-up questions.</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <Mic className="w-5 h-5 text-teal-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">Voice & Speech</h4>
            <p className="text-xs text-slate-400">Speaking pace (WPM) and filler words analysis.</p>
          </div>
          <div className="glass-card p-4 rounded-xl border border-slate-800">
            <ShieldCheck className="w-5 h-5 text-teal-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">RAG Question Bank</h4>
            <p className="text-xs text-slate-400">Curated datasets indexed for precision retrieval.</p>
          </div>
        </div>
      </section>

      {/* Step by step pipeline architecture */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">End-to-End Interview Pipeline</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            From raw document parsing to personalized performance roadmaps, see how each layer works.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-teal-500/30 transition-all hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* College & Resume Portfolio Ready Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-8 sm:p-12 border border-teal-500/20 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-teal-400 text-xs font-mono font-bold tracking-wider uppercase">Viva & Portfolio Ready</span>
            <h3 className="text-2xl sm:text-3xl font-bold text-white mt-2 mb-4">
              Designed to Stand Out on GitHub and Impress Recruiters
            </h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Demonstrates practical machine learning, semantic embeddings, full-stack architecture with FastAPI, Supabase relational data modeling, and modern React dashboard engineering.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm hover:bg-teal-400 transition-colors"
              >
                Explore Dashboard
              </Link>
              <Link
                to="/resume"
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-medium text-sm hover:bg-slate-700 transition-colors"
              >
                Upload Resume First
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
