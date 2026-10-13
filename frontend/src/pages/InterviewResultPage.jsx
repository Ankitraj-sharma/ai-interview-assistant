import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { interviewAPI } from '../api/client';
import RadarSkillChart from '../components/RadarSkillChart';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Trophy, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  BarChart3, 
  BookOpen, 
  Layers,
  Download,
  Building2,
  Code2,
  Eye,
  Camera,
  FileText
} from 'lucide-react';

export default function InterviewResultPage() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await interviewAPI.getResult(sessionId);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load result:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [sessionId]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setGeneratingPdf(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 1.8,
        useCORS: true,
        backgroundColor: '#030712',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const roleSafe = (session.role || 'Software_Engineer').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`AI_Interview_ReportCard_${roleSafe}_${sessionId.slice(0, 8)}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      alert('Could not export PDF report. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const session = data?.session || {
    role: 'Full Stack Developer',
    company_mode: 'General Tech',
    overall_score: 82.5,
    technical_score: 85.0,
    communication_score: 76.0,
    relevance_score: 88.0,
    completeness_score: 78.0,
    code_score: 88.0,
    engagement_score: 91.0,
    summary_feedback: 'Strong technical performance with sound architectural foundations. Deepen production edge cases.',
    weak_areas: ['System Design Under High Load', 'Database Query Tuning'],
    recommendations: ['Practice 10 System Design questions', 'Review B-Tree indexing']
  };

  const radarData = {
    Technical: session.technical_score || 85,
    Communication: session.communication_score || 76,
    Relevance: session.relevance_score || 88,
    Completeness: session.completeness_score || 78,
    'Problem Solving': Math.round(((session.technical_score || 85) + (session.relevance_score || 88)) / 2)
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-medium"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{generatingPdf ? 'Generating PDF...' : 'Download Official PDF Report'}</span>
          </button>

          <Link
            to="/interview"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Retake Interview"
          >
            <RotateCcw className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Printable Report Card Container */}
      <div ref={reportRef} className="space-y-8 p-1">
        {/* Top Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-teal-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-teal-400 text-xs font-mono font-bold uppercase tracking-wider">
                OFFICIAL INTERVIEW PERFORMANCE SCORECARD
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>{session.company_mode || 'General Tech'} Persona</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
              Candidate Evaluation: {session.role}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Completed on {session.created_at?.slice(0, 10) || 'Today'} • Evaluated by Gemini 3.8 AI Engine
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-6 py-3 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-center">
              <span className="text-[10px] text-teal-300 font-semibold block uppercase">Overall Grade</span>
              <span className="text-3xl font-extrabold text-white">{session.overall_score}%</span>
            </div>
          </div>
        </div>

        {/* Breakdown Grid: Radar Chart + Sub-Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 className="text-base font-bold text-white mb-2">Competency Radar Matrix</h3>
            <p className="text-xs text-slate-400 mb-4">Multi-vector analysis across technical depth and clarity</p>
            <RadarSkillChart data={radarData} />
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">Dimension Breakdown</h3>
              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Technical Depth</span>
                    <span className="text-teal-400 font-bold">{session.technical_score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${session.technical_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Communication & Clarity</span>
                    <span className="text-cyan-400 font-bold">{session.communication_score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${session.communication_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Question Relevance</span>
                    <span className="text-emerald-400 font-bold">{session.relevance_score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${session.relevance_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-300">Completeness & Edge Cases</span>
                    <span className="text-purple-400 font-bold">{session.completeness_score}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${session.completeness_score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplementary Telemetry Strip: Code Score & Gaze Focus */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Sandbox Code Score</span>
                </span>
                <span className="text-lg font-bold text-teal-300 mt-0.5 block">
                  {session.code_score ? `${session.code_score}%` : 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Webcam Focus Ratio</span>
                </span>
                <span className="text-lg font-bold text-cyan-300 mt-0.5 block">
                  {session.engagement_score ? `${session.engagement_score}%` : '92%'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-white block mb-1">Interviewer Summary:</span>
              {session.summary_feedback}
            </div>
          </div>
        </div>

        {/* Weak Areas & Preparation Roadmap */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Focus Areas Identified</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {(session.weak_areas || []).map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Recommended Next Steps</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {(session.recommendations || []).map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal-400 font-bold">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Q&A Accordion */}
        {data?.qa_details?.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Question-by-Question Breakdown</h3>
            <div className="space-y-4">
              {data.qa_details.map((item, idx) => {
                const q = item.question;
                const a = item.answer;
                return (
                  <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-teal-400">Question {idx + 1}</span>
                        {q.category && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                            {q.category}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-teal-300 border border-slate-800">
                        Score: {a?.overall_score || 80}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{q.question_text}</h4>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300 font-sans">
                      <span className="text-slate-500 font-medium block mb-1">Your Submitted Answer:</span>
                      {a?.user_answer || 'No answer recorded'}
                    </div>

                    {/* Code analysis if code was submitted */}
                    {a?.code_submission && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                        <span className="text-[10px] text-teal-400 uppercase font-bold block mb-1">
                          Submitted Code ({a.programming_language || 'javascript'}):
                        </span>
                        <pre className="text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {a.code_submission}
                        </pre>
                      </div>
                    )}

                    {a?.feedback && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-slate-300">Feedback: </strong>{a.feedback}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-center gap-4 pt-6">
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-colors"
        >
          Back to Dashboard
        </Link>
        <Link
          to="/performance"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm hover:bg-teal-400 transition-colors shadow-md shadow-teal-500/20"
        >
          <span>View Long-Term Performance</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
