import React from 'react';
import { Github, Heart, Database, Cpu, Code2, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/60 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>AI Interview Preparation Assistant</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for College & Portfolio Excellence
          </span>
        </div>

        {/* Tech Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-teal-400">
            <Cpu className="w-3 h-3" /> Gemini 3.8 Flash
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-400">
            <Database className="w-3 h-3" /> Supabase PostgreSQL
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-400">
            <Code2 className="w-3 h-3" /> FastAPI Python
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-sky-400">
            <Layers className="w-3 h-3" /> React + Tailwind
          </span>
        </div>
      </div>
    </footer>
  );
}
