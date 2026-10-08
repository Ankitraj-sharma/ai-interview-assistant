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
  Sliders 
} from 'lucide-react';

export default function MockInterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const prefilledRole = location.state?.prefilledRole || 'Full Stack Developer';
  const prefilledMissingSkills = location.state?.missingSkills || [];

  const [role, setRole] = useState(prefilledRole);
  const [customRole, setCustomRole] = useState('');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [numQuestions, setNumQuestions] = useState(5);
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

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const selectedRole = role === 'Custom Role' ? (customRole || 'Software Engineer') : role;

    try {
      const res = await interviewAPI.startInterview({
        role: selectedRole,
        difficulty: difficulty,
        num_questions: parseInt(numQuestions),
        missing_skills: prefilledMissingSkills,
      });

      const { session_id, questions } = res.data;
      navigate(`/interview/room/${session_id}`, {
        state: {
          sessionData: res.data,
          role: selectedRole,
          difficulty: difficulty,
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
          Select target role, difficulty, and question format. Questions are generated dynamically with Gemini 3.8 Flash & RAG retrieval.
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

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Difficulty Tier</label>
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

          {/* Number of Questions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Interview Length</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { count: 3, label: 'Express (3 Qs)', time: '~5 mins' },
                { count: 5, label: 'Standard (5 Qs)', time: '~12 mins' },
                { count: 10, label: 'In-Depth (10 Qs)', time: '~25 mins' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.count}
                  onClick={() => setNumQuestions(item.count)}
                  className={`p-3.5 rounded-xl text-left border transition-all ${
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
              {loading ? 'Retrieving Dataset Questions & Initializing Session...' : 'Enter Interview Room'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
