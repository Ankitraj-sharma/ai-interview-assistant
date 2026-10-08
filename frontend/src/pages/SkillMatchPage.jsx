import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchAPI } from '../api/client';
import { 
  GitCompare, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  Lightbulb, 
  Zap, 
  Target
} from 'lucide-react';

export default function SkillMatchPage() {
  const [resumeData, setResumeData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Load stored resume and job data if available
    const savedResume = localStorage.getItem('current_resume');
    const savedJob = localStorage.getItem('current_job');

    if (savedResume) {
      try { setResumeData(JSON.parse(savedResume)); } catch {}
    }
    if (savedJob) {
      try { setJobData(JSON.parse(savedJob)); } catch {}
    }
  }, []);

  const handleRunMatch = async () => {
    setError('');
    setLoading(true);

    const resumeSkills = resumeData?.skills || ['Python', 'React', 'FastAPI', 'PostgreSQL', 'Docker', 'REST API', 'Git'];
    const jobSkills = jobData?.required_skills || ['React', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Redis', 'CI/CD'];

    try {
      const res = await matchAPI.analyzeMatch({
        resume_id: resumeData?.id,
        resume_skills: resumeSkills,
        job_id: jobData?.job_id,
        job_skills: jobSkills,
        resume_text: resumeData?.raw_text || '',
        job_text: jobData?.raw_text || '',
      });
      setResult(res.data);
      localStorage.setItem('current_match', JSON.stringify(res.data));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze skill match.');
    } finally {
      setLoading(false);
    }
  };

  const startTargetedInterview = () => {
    const role = jobData?.job_title || 'Full Stack Developer';
    const missing = result?.missing_skills || [];
    navigate('/interview', {
      state: {
        prefilledRole: role,
        missingSkills: missing,
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-teal-400 text-xs font-mono font-bold uppercase">MODULE 4</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Resume vs Job Description Skill Match
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Semantic comparison and skill gap identification powered by Scikit-Learn Cosine Similarity and Gemini NLP.
        </p>
      </div>

      {/* Pre-Match Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resume Box */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-teal-400">YOUR RESUME</span>
            <span className="text-xs text-slate-400">
              {resumeData?.skills?.length || 7} skills detected
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            {resumeData?.filename || 'Sample Full-Stack Candidate Resume'}
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {(resumeData?.skills || ['Python', 'React', 'FastAPI', 'PostgreSQL', 'Docker', 'REST API', 'Git']).map((s, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-md bg-teal-500/10 text-teal-300 text-xs border border-teal-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Job Description Box */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-cyan-400">TARGET JOB DESCRIPTION</span>
            <span className="text-xs text-slate-400">
              {jobData?.required_skills?.length || 8} skills required
            </span>
          </div>
          <h3 className="text-base font-bold text-white mb-2">
            {jobData?.job_title || 'Senior Full Stack Engineer'}
          </h3>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {(jobData?.required_skills || ['React', 'FastAPI', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Redis', 'CI/CD']).map((s, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-xs border border-cyan-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Match Trigger Button */}
      <div className="text-center">
        <button
          onClick={handleRunMatch}
          disabled={loading}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-400 text-slate-950 font-extrabold text-sm hover:opacity-95 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50"
        >
          <GitCompare className="w-5 h-5 text-slate-950" />
          <span>{loading ? 'Calculating Semantic Similarity & Gaps...' : 'Compute Skill Match & Gap Analysis'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-teal-500/30 space-y-8 animate-fade-in">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-800">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Direct Skill Match</span>
              <span className="text-3xl font-extrabold text-teal-400">{result.match_percentage}%</span>
              <span className="text-[11px] text-slate-400 block mt-1">Exact keyword intersection</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Semantic Similarity</span>
              <span className="text-3xl font-extrabold text-cyan-400">{result.semantic_similarity}%</span>
              <span className="text-[11px] text-slate-400 block mt-1">TF-IDF Vector Cosine metric</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <span className="text-xs text-slate-400 block mb-1">Readiness Tier</span>
              <span className="text-lg font-bold text-emerald-400 block mt-1">{result.readiness_status}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Based on role criteria</span>
            </div>
          </div>

          {/* Matched vs Missing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-300">
                  Matched Skills ({result.matched_skills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing */}
            <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/40">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-rose-300">
                  Missing Skills Gap ({result.missing_skills.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    ✗ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">AI Actionable Recommendations</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom Action CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div>
              <h4 className="text-sm font-semibold text-white">Ready to test these skills?</h4>
              <p className="text-xs text-slate-400">Launch a mock interview focused on your missing skill gaps.</p>
            </div>
            <button
              onClick={startTargetedInterview}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-extrabold text-sm hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md shadow-teal-500/20"
            >
              <span>Start Targeted Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
