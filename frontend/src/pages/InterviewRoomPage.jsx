import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { interviewAPI, voiceAPI } from '../api/client';
import AudioRecorder from '../components/AudioRecorder';
import InterviewerSpeaker from '../components/InterviewerSpeaker';
import WebcamEngagement from '../components/WebcamEngagement';
import CodeEditorSandbox from '../components/CodeEditorSandbox';
import { 
  Bot, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight, 
  Check, 
  ChevronRight, 
  BookOpen, 
  RotateCcw,
  Code2,
  Mic,
  Building2,
  Cpu,
  Layers,
  Zap
} from 'lucide-react';

export default function InterviewRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [codeSubmission, setCodeSubmission] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [activeTab, setActiveTab] = useState('verbal'); // 'verbal' | 'code'
  const [speakingDuration, setSpeakingDuration] = useState(0);
  const [speechMetrics, setSpeechMetrics] = useState(null);
  const [engagementMetrics, setEngagementMetrics] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [adaptiveStatus, setAdaptiveStatus] = useState('Standard');
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(240); // 4 minutes per question

  const companyMode = location.state?.company_mode || location.state?.sessionData?.company_mode || 'General Tech';
  const roleName = location.state?.role || 'Full Stack Developer';

  useEffect(() => {
    // If questions were passed via navigate state, use them
    if (location.state?.sessionData?.questions) {
      setQuestions(location.state.sessionData.questions);
    } else {
      // Fallback questions if navigated directly
      setQuestions([
        {
          id: 'q1-default',
          session_id: sessionId,
          question_order: 1,
          question_text: 'Explain the difference between client-side rendering (CSR) and server-side rendering (SSR). In what scenarios would you choose one over the other?',
          category: 'Technical',
          difficulty: 'Intermediate',
          expected_keywords: ['seo', 'hydration', 'initial load', 'react', 'next.js'],
          is_coding_challenge: false
        },
        {
          id: 'q2-default',
          session_id: sessionId,
          question_order: 2,
          question_text: 'Two Sum Problem: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Optimize for O(N) time complexity.',
          category: 'Coding Sandbox',
          difficulty: 'Intermediate',
          expected_keywords: ['hash map', 'o(n)', 'complement', 'dictionary'],
          is_coding_challenge: true,
          code_starter_template: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log("Result:", twoSum([2, 7, 11, 15], 9));`
        },
        {
          id: 'q3-default',
          session_id: sessionId,
          question_order: 3,
          question_text: 'Your production backend API response time spikes from 150ms to 4 seconds during peak traffic hours. Walk me through your step-by-step diagnostic and remediation process.',
          category: 'Scenario',
          difficulty: 'Advanced',
          expected_keywords: ['indexing', 'redis', 'caching', 'apm', 'database query'],
          is_coding_challenge: false
        }
      ]);
    }
  }, [sessionId, location.state]);

  const currentQ = questions[currentIdx] || null;

  // Set active tab based on question type
  useEffect(() => {
    if (currentQ?.is_coding_challenge) {
      setActiveTab('code');
      if (currentQ.code_starter_template) {
        setCodeSubmission(currentQ.code_starter_template);
      }
    } else {
      setActiveTab('verbal');
    }
  }, [currentIdx, currentQ]);

  // Countdown timer per question
  useEffect(() => {
    if (evalResult) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [evalResult]);

  const handleTranscriptUpdate = (text) => {
    setUserAnswer(text);
  };

  const handleDurationUpdate = (secs) => {
    setSpeakingDuration(secs);
  };

  const handleEngagementMetrics = (metrics) => {
    setEngagementMetrics(metrics);
  };

  const handleSubmitAnswer = async (e) => {
    e?.preventDefault?.();
    const finalAnswer = userAnswer.trim() || (codeSubmission.trim() ? `Code submission in ${codeLanguage}:\n${codeSubmission}` : '');
    if (!finalAnswer) {
      setError('Please provide an answer or write code in the sandbox before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      // Analyze voice metrics if user spoke
      let metrics = null;
      if (speakingDuration > 0 && userAnswer.trim()) {
        try {
          const vRes = await voiceAPI.analyzeMetrics({
            transcript: userAnswer,
            duration_seconds: speakingDuration,
          });
          metrics = vRes.data;
          setSpeechMetrics(metrics);
        } catch {}
      }

      // Submit answer to backend evaluation engine
      const res = await interviewAPI.submitAnswer({
        session_id: sessionId,
        question_id: currentQ.id,
        user_answer: finalAnswer,
        code_submission: codeSubmission.trim() || null,
        programming_language: codeLanguage,
        speaking_metrics: metrics,
        engagement_metrics: engagementMetrics,
      });

      setEvalResult(res.data);
      if (res.data.adaptive_difficulty_status) {
        setAdaptiveStatus(res.data.adaptive_difficulty_status);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to evaluate answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setEvalResult(null);
    setUserAnswer('');
    setCodeSubmission('');
    setShowModelAnswer(false);
    setSpeechMetrics(null);
    setSpeakingDuration(0);
    setTimer(240);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    try {
      await interviewAPI.finishInterview(sessionId);
    } catch {}
    navigate(`/interview/result/${sessionId}`);
  };

  const formatTimer = (t) => {
    const mins = Math.floor(t / 60);
    const secs = t % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentQ) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Session Progress Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>{companyMode} Persona</span>
          </span>
          <span className="text-xs text-slate-400">• {roleName}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Dynamic CAT Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">CAT Adaptive:</span>
            <span className={
              adaptiveStatus.includes('Hard')
                ? 'text-rose-400 font-bold'
                : adaptiveStatus.includes('Foundations')
                ? 'text-cyan-400 font-bold'
                : 'text-teal-400 font-bold'
            }>
              {adaptiveStatus}
            </span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className={timer < 45 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}>
              {formatTimer(timer)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Question & Answering Workspace, Right Engagement Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column (Question + Answer Sandbox) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Question Card */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {currentQ.category || 'Technical'}
                </span>
                {currentQ.is_coding_challenge && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                    <Code2 className="w-3 h-3" />
                    <span>Coding Sandbox</span>
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Difficulty: {currentQ.difficulty || 'Intermediate'}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.question_text}
            </h2>

            {/* AI Voice Speaker */}
            <InterviewerSpeaker textToSpeak={currentQ.question_text} autoPlay={false} />
          </div>

          {/* Answer Workspace (Verbal or Code Sandbox) */}
          {!evalResult ? (
            <div className="space-y-4">
              {/* Mode Selector Tabs */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('verbal')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'verbal'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Verbal & Microphone Answer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'code'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Live Monaco Code Sandbox</span>
                  {currentQ.is_coding_challenge && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  )}
                </button>
              </div>

              {/* Tab 1: Verbal Answer */}
              {activeTab === 'verbal' && (
                <div className="space-y-4">
                  <AudioRecorder
                    onTranscriptUpdate={handleTranscriptUpdate}
                    onDurationUpdate={handleDurationUpdate}
                    disabled={submitting}
                  />

                  <textarea
                    rows={7}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your structured explanation here, or click 'Start Voice Answer' above to speak with real-time speech-to-text..."
                    className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 font-sans focus:outline-none focus:border-teal-500 transition-colors"
                  />
                </div>
              )}

              {/* Tab 2: Code Sandbox */}
              {activeTab === 'code' && (
                <div className="space-y-3">
                  <CodeEditorSandbox
                    starterTemplate={currentQ.code_starter_template || ''}
                    initialCode={codeSubmission}
                    language={codeLanguage}
                    onCodeChange={(newCode, newLang) => {
                      setCodeSubmission(newCode);
                      setCodeLanguage(newLang);
                    }}
                    onLanguageChange={(newLang) => setCodeLanguage(newLang)}
                  />

                  {/* Optional reasoning text alongside code */}
                  <textarea
                    rows={2}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Optional: Brief thought process / algorithmic explanation to accompany your code..."
                    className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>
              )}

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {userAnswer.split(/\s+/).filter(Boolean).length} words • {codeSubmission ? 'Code provided' : 'Verbal only'}
                </span>

                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={submitting || (!userAnswer.trim() && !codeSubmission.trim())}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-extrabold text-sm hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Gemini 3.8 Evaluating Answer...' : 'Submit Answer'}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Evaluation Feedback Drawer */
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-teal-500/30 space-y-6 animate-fade-in">
              {/* Top Score Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-500/30 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-teal-300 font-semibold uppercase block">Overall</span>
                  <span className="text-2xl font-extrabold text-white">{evalResult.overall_score}%</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-medium block">Technical</span>
                  <span className="text-lg font-bold text-teal-400">{evalResult.technical_score}%</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-medium block">Communication</span>
                  <span className="text-lg font-bold text-cyan-400">{evalResult.communication_score}%</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-medium block">Relevance</span>
                  <span className="text-lg font-bold text-emerald-400">{evalResult.relevance_score}%</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-medium block">Completeness</span>
                  <span className="text-lg font-bold text-purple-400">{evalResult.completeness_score}%</span>
                </div>
              </div>

              {/* Company Persona Assessment */}
              {evalResult.company_feedback && (
                <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/40 space-y-1">
                  <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{companyMode} Persona Criterion Feedback</span>
                  </span>
                  <p className="text-xs text-teal-200 leading-relaxed font-sans">{evalResult.company_feedback}</p>
                </div>
              )}

              {/* Code Big-O Complexity Analysis if code was evaluated */}
              {evalResult.code_analysis && (
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-teal-400" />
                      <span>Algorithmic Complexity & Big-O Analysis</span>
                    </span>
                    {evalResult.code_score !== null && (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        Code Score: {evalResult.code_score}%
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Time Complexity</span>
                      <span className="font-mono font-bold text-teal-300">{evalResult.code_analysis.time_complexity || 'O(N)'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Space Complexity</span>
                      <span className="font-mono font-bold text-cyan-300">{evalResult.code_analysis.space_complexity || 'O(1)'}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Syntactic Correctness</span>
                      <span className="font-mono font-bold text-emerald-300">{evalResult.code_analysis.syntax_correctness ? 'Clean' : 'Needs Check'}</span>
                    </div>
                  </div>

                  {evalResult.code_analysis.suggestions && (
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-300">Optimization Note: </strong>{evalResult.code_analysis.suggestions}
                    </p>
                  )}
                </div>
              )}

              {/* Communication Telemetry */}
              {speechMetrics && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="text-slate-300 font-medium">Communication Telemetry:</div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>Pace: <strong className="text-teal-400">{speechMetrics.wpm} WPM ({speechMetrics.speaking_speed})</strong></span>
                    <span>Filler Words: <strong className="text-amber-400">{speechMetrics.filler_words_count} detected</strong></span>
                    <span>Clarity: <strong className="text-emerald-400">{speechMetrics.clarity_score}%</strong></span>
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                  <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {evalResult.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
                  <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Areas to Sharpen
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {evalResult.weaknesses?.map((w, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Constructive Feedback */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Interviewer Evaluation Feedback
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">{evalResult.feedback}</p>
              </div>

              {/* Dynamic Follow-Up Question */}
              {evalResult.follow_up_question && (
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    Dynamic Follow-Up Challenge
                  </span>
                  <p className="text-xs font-semibold text-white">"{evalResult.follow_up_question}"</p>
                </div>
              )}

              {/* Official Ideal Expected Model Answer - Always Visible */}
              {evalResult.suggested_model_answer && (
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-sm font-bold text-emerald-300">
                        Official Expected Answer & Model Solution
                      </h4>
                    </div>
                    {evalResult.overall_score < 75 && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Score: {evalResult.overall_score}% — Study Expected Real Answer Below
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                    {evalResult.suggested_model_answer}
                  </div>

                  {currentQ.expected_keywords && currentQ.expected_keywords.length > 0 && (
                    <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="font-semibold text-emerald-400">Required Technical Concepts:</span>
                      {currentQ.expected_keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-mono text-[10px] border border-emerald-500/20">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Next Question / Finish Action */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-extrabold text-sm hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md shadow-teal-500/20"
                >
                  <span>{currentIdx + 1 < questions.length ? 'Next Question' : 'Finish & View Complete Report'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Webcam Engagement & Session Sidebar */}
        <div className="space-y-4">
          <WebcamEngagement onMetricsUpdate={handleEngagementMetrics} />

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2.5">
            <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
              Interview Guidelines
            </span>
            <ul className="space-y-1.5 text-slate-400 text-[11px] leading-relaxed">
              <li>• Speak clearly using the STAR methodology for behavioral questions.</li>
              <li>• For code challenges, state your initial time & space complexity before submitting.</li>
              <li>• Dynamic CAT adapts questions according to real-time performance.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
