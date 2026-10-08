import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../api/client';
import { 
  Briefcase, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Code2, 
  ArrowRight, 
  Building2, 
  Clock 
} from 'lucide-react';

export default function JobAnalyzerPage() {
  const [jobTitle, setJobTitle] = useState('Full Stack Developer');
  const [companyName, setCompanyName] = useState('Tech Innovations Inc.');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError('Please provide a job description to analyze.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await jobAPI.analyzeJob({
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
      });
      setResult(res.data);
      localStorage.setItem('current_job', JSON.stringify(res.data));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze job description.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleJD = () => {
    setJobTitle('Senior Full Stack Engineer');
    setCompanyName('ScaleCloud Systems');
    setJobDescription(`We are looking for a Senior Full Stack Engineer to scale our cloud platform.
Responsibilities:
- Build high-throughput microservices using Python, FastAPI, and PostgreSQL.
- Design responsive frontend dashboards using React, TypeScript, and Tailwind CSS.
- Deploy containerized services on Docker, Kubernetes, and AWS (ECS, S3).
- Implement robust authentication with JWT, OAuth2, and RBAC.
- Optimize database queries and setup Redis caching for sub-100ms API latency.

Requirements:
- 3+ years experience with React, Python, and modern REST APIs.
- Deep understanding of SQL indexing, relational database schema design, and Docker.
- Experience with AWS cloud infrastructure and CI/CD pipelines.
- Excellent communication and problem-solving abilities.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-cyan-400 text-xs font-mono font-bold uppercase">MODULE 3</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Job Description Analyzer</h1>
        <p className="text-sm text-slate-400 mt-1">
          Paste the job requirements to extract required technologies, expected seniority, and key responsibilities.
        </p>
      </div>

      {/* Input Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Title</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name (Optional)</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Startup"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Job Description Text</label>
              <button
                type="button"
                onClick={loadSampleJD}
                className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample JD</span>
              </button>
            </div>
            <textarea
              rows={8}
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job requirements, qualifications, and role responsibilities here..."
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? 'Analyzing with NLP Taxonomy...' : 'Analyze Job Description'}
            </button>
          </div>
        </form>
      </div>

      {/* Extracted JD Data */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Target Role Analyzed</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Extracted <span className="text-cyan-400 font-semibold">{result.required_skills?.length || 0} required skills</span> for {result.job_title} at {result.company_name}.
              </p>
            </div>

            <button
              onClick={() => navigate('/match')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-teal-400 transition-all shadow-md shadow-cyan-500/20"
            >
              <span>Compare with Resume</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Seniority:</span>
              <span className="text-slate-200 font-semibold">{result.experience_level}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Target Required Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.required_skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {result.key_responsibilities?.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2">Key Extracted Responsibilities</h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {result.key_responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
