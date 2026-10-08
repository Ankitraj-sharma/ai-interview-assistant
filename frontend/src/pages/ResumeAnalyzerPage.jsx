import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumeAPI } from '../api/client';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF or DOCX file to upload.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await resumeAPI.uploadResume(file);
      setResult(res.data.data);
      localStorage.setItem('current_resume', JSON.stringify(res.data.data));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload and parse resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleResume = () => {
    const sample = {
      id: 'sample-resume-id',
      filename: 'Sample_Ankit_Sharma_Resume.pdf',
      skills: ['Python', 'React', 'FastAPI', 'PostgreSQL', 'Docker', 'REST API', 'JavaScript', 'Git', 'Tailwind CSS', 'SQL'],
      experience: [
        { description: 'Full Stack Developer Intern at TechCorp: Built REST APIs in FastAPI, optimized queries, created React dashboards.' },
        { description: 'Software Development Project: Engineered AI Mock Interviewer with RAG vector search and LLM evaluation.' }
      ],
      education: [
        { detail: 'B.Tech in Computer Science & Engineering (2021-2025) - CGPA: 8.8/10' }
      ],
      contact: {
        email: 'ankit.sharma@example.com',
        phone: '+91 9876543210',
        github: 'github.com/ankit-sharma',
        linkedin: 'linkedin.com/in/ankit-sharma'
      },
      total_words: 420,
      raw_text: 'Experienced in Python, React, FastAPI, Docker, and PostgreSQL...'
    };
    setResult(sample);
    localStorage.setItem('current_resume', JSON.stringify(sample));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-teal-400 text-xs font-mono font-bold uppercase">MODULE 2</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Resume Parser & Skill Extractor</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload your resume in PDF or DOCX format. PyMuPDF and our NLP engine extract skills, experience, and projects.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-teal-500/50 rounded-2xl p-8 text-center transition-colors bg-slate-900/40">
            <UploadCloud className="w-12 h-12 text-teal-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">
              {file ? file.name : 'Choose a file or drag & drop it here'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Supports PDF, DOCX, and TXT files (Max 10MB)</p>
            
            <input
              type="file"
              id="resume-file-input"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="resume-file-input"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Browse File</span>
            </label>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={loadSampleResume}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium hover:bg-teal-500/20 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Sample Resume (Quick Demo)</span>
            </button>

            <button
              type="submit"
              disabled={loading || !file}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              {loading ? 'Analyzing with PyMuPDF & NLP...' : 'Upload & Parse Resume'}
            </button>
          </div>
        </form>
      </div>

      {/* Extracted Data View */}
      {result && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-teal-500/30 space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Resume Successfully Parsed</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Extracted <span className="text-teal-400 font-semibold">{result.skills?.length || 0} skills</span> and {result.total_words} words from {result.filename}.
              </p>
            </div>

            <button
              onClick={() => navigate('/match')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md shadow-teal-500/20"
            >
              <span>Proceed to Job Match</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Contact Details */}
          {result.contact && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">Email</span>
                <span className="text-slate-200 font-mono truncate block">{result.contact.email || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">Phone</span>
                <span className="text-slate-200 font-mono truncate block">{result.contact.phone || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">GitHub</span>
                <span className="text-slate-200 font-mono truncate block">{result.contact.github || 'N/A'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 block mb-1">LinkedIn</span>
                <span className="text-slate-200 font-mono truncate block">{result.contact.linkedin || 'N/A'}</span>
              </div>
            </div>
          )}

          {/* Extracted Skills */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Code2 className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Extracted Technical Skills</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Experience & Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Experience Highlights</h3>
              </div>
              <div className="space-y-2">
                {result.experience?.length > 0 ? (
                  result.experience.map((exp, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300">
                      {exp.description}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No explicit experience section detected.</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Education & Qualifications</h3>
              </div>
              <div className="space-y-2">
                {result.education?.length > 0 ? (
                  result.education.map((edu, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-300">
                      {edu.detail}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No explicit education section detected.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
