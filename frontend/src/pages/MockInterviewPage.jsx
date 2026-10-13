import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { interviewAPI } from '../api/client';
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Layers, 
  HelpCircle, 
  Mic, 
  Code2,
  Building2,
  Zap,
  Cpu
} from 'lucide-react';

export default function MockInterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const prefilledRole = location.state?.prefilledRole || 'Full Stack Developer';
  const prefilledMissingSkills = location.state?.missingSkills || [];

  const [role, setRole] = useState(prefilledRole);
  const [customRole, setCustomRole] = useState('');
  const [companyMode, setCompanyMode] = useState('General Tech');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
  const [includeCoding, setIncludeCoding] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const commonRoles = [
    'Full Stack Developer',
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Machine Learning Engineer',
    'Data Scientist',
    'DevOps Engineer',
    'Custom Role',
  ];

  const companyPersonas = [
    {
      name: 'Google',
      tagline: 'Scale & Algorithmic Rigor',
      description: 'Focuses on Big-O algorithmic optimality, distributed system architecture, and clean abstractions.',
      color: 'border-blue-500/30 hover:border-blue-500/60 bg-blue-500/10 text-blue-400',
      activeColor: 'bg-blue-500/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/20'
    },
    {
      name: 'Amazon',
      tagline: '16 Leadership Principles',
      description: 'Evaluates Customer Obsession, Ownership, Bias for Action, and operational excellence under load.',
      color: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-500/10 text-amber-400',
      activeColor: 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
    },
    {
      name: 'Fast-Paced Startup',
      tagline: 'Velocity & Pragmatism',
      description: 'Tests scrappy execution, rapid full-stack delivery, product ownership, and real-world trade-offs.',
      color: 'border-purple-500/30 hover:border-purple-500/60 bg-purple-500/10 text-purple-400',
      activeColor: 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/20'
    },
    {
      name: 'Meta',
      tagline: 'Product Sense & Fast Iteration',
      description: 'Prioritizes high-throughput client/server pipelines, Move Fast mental models, and metrics.',
      color: 'border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/10 text-cyan-400',
      activeColor: 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20'
    },
    {
      name: 'General Tech',
      tagline: 'Industry Standard Foundations',
      description: 'Comprehensive software engineering fundamentals, clear communication, and modern tech stacks.',
      color: 'border-teal-500/30 hover:border-teal-500/60 bg-teal-500/10 text-teal-400',
      activeColor: 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-md shadow-teal-500/20'
    }
  ];

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const selectedRole = role === 'Custom Role' ? (customRole || 'Software Engineer') : role;

    try {
      const res = await interviewAPI.startInterview({
        role: selectedRole,
        difficulty: difficulty,
        company_mode: companyMode,
        num_questions: parseInt(numQuestions),
        include_coding_challenge: includeCoding,
        missing_skills: prefilledMissingSkills,
      });

      const { session_id, questions } = res.data;
      navigate(`/interview/room/${session_id}`, {
        state: {
          sessionData: res.data,
          role: selectedRole,
          difficulty: difficulty,
          company_mode: companyMode,
        }
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start interview session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-teal-400 text-xs font-mono font-bold uppercase">MODULE 6</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Configure Mock Interview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select target role, company persona, and challenge format. Powered by Gemini 3.8 AI & Supabase pgvector retrieval.
        </p>
      </div>

      {prefilledMissingSkills.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Targeting Identified Skill Gaps:</span>
            <span>Your interview will prioritize questions assessing: {prefilledMissingSkills.join(', ')}.</span>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <form onSubmit={handleStart} className="space-y-6">
          {/* Target Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Target Interview Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {commonRoles.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-xl text-xs font-medium text-left border transition-all ${
                    role === r
                      ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {role === 'Custom Role' && (
              <input
                type="text"
                required
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter specific role (e.g. Distributed Systems Engineer)"
                className="mt-3 w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
              />
            )}
          </div>

          {/* Company Persona Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Target Company Persona</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Calibrates interviewer personality, evaluation criteria, and follow-up style.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {companyPersonas.map((cp) => {
                const isSelected = companyMode === cp.name;
                return (
                  <button
                    type="button"
                    key={cp.name}
                    onClick={() => setCompanyMode(cp.name)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? cp.activeColor
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center justify-between">
                        <span>{cp.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">{cp.tagline}</div>
                    </div>
                    <div className="text-[9px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {cp.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Initial Difficulty Tier (CAT Adaptive)</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Beginner', desc: 'Core fundamentals & syntax' },
                { name: 'Intermediate', desc: 'Real-world patterns & trade-offs' },
                { name: 'Advanced', desc: 'System design, scale & edge cases' },
              ].map((d) => (
                <button
                  type="button"
                  key={d.name}
                  onClick={() => setDifficulty(d.name)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
                    difficulty === d.name
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-bold text-xs">{d.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{d.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interview Length & Format Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Interview Length</label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { count: 3, label: 'Express (3)', time: '~5 mins' },
                  { count: 5, label: 'Standard (5)', time: '~12 mins' },
                  { count: 10, label: 'In-Depth (10)', time: '~25 mins' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.count}
                    onClick={() => setNumQuestions(item.count)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      numQuestions === item.count
                        ? 'bg-teal-500/15 border-teal-500 text-teal-300 shadow-md shadow-teal-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Coding Challenge Round Toggle */}
            <div className="flex flex-col justify-end">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Challenge Options</label>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCoding}
                  onChange={(e) => setIncludeCoding(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-500 focus:ring-teal-400 focus:ring-offset-slate-900 bg-slate-800 border-slate-700"
                />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Include Monaco Live Code Sandbox</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Includes algorithmic problem solving with real-time runner and Big-O evaluation.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-400 text-slate-950 font-extrabold text-sm hover:opacity-95 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Initializing RAG Session & Calibrating Persona...' : 'Enter AI Interview Room'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
