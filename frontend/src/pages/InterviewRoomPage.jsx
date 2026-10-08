import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { interviewAPI, voiceAPI } from '../api/client';
import AudioRecorder from '../components/AudioRecorder';
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
  RotateCcw 
} from 'lucide-react';

export default function InterviewRoomPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [speakingDuration, setSpeakingDuration] = useState(0);
  const [speechMetrics, setSpeechMetrics] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(180); // 3 minutes per question

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
          expected_keywords: ['seo', 'hydration', 'initial load', 'react', 'next.js']
        },
        {
          id: 'q2-default',
          session_id: sessionId,
          question_order: 2,
          question_text: 'How do you handle authentication and authorization in a modern web application using JWT? What are the common security vulnerabilities such as XSS and CSRF?',
          category: 'Technical',
          difficulty: 'Intermediate',
          expected_keywords: ['jwt', 'token', 'http-only cookie', 'xss', 'csrf']
        },
        {
          id: 'q3-default',
          session_id: sessionId,
          question_order: 3,
          question_text: 'Your production backend API response time spikes from 150ms to 4 seconds during peak traffic hours. Walk me through your step-by-step diagnostic and remediation process.',
          category: 'Scenario',
          difficulty: 'Advanced',
          expected_keywords: ['indexing', 'redis', 'caching', 'apm', 'database query']
        }
      ]);
    }
  }, [sessionId, location.state]);

  // Countdown timer per question
  useEffect(() => {
    if (evalResult) return; // Pause timer when reviewing result
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [evalResult]);

  const currentQ = questions[currentIdx] || null;

  const handleTranscriptUpdate = (text) => {
    setUserAnswer(text);
  };

  const handleDurationUpdate = (secs) => {
    setSpeakingDuration(secs);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      // Analyze voice metrics if user spoke
      let metrics = null;
      if (speakingDuration > 0) {
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
        user_answer: userAnswer,
        speaking_metrics: metrics,
      });

      setEvalResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to evaluate answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setEvalResult(null);
    setUserAnswer('');
    setShowModelAnswer(false);
    setSpeechMetrics(null);
    setSpeakingDuration(0);
    setTimer(180);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Session Progress Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {location.state?.role || 'Interview Session'}
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span className={timer < 30 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-300'}>
            {formatTimer(timer)}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            {currentQ.category || 'Technical'}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Tier: {currentQ.difficulty || 'Intermediate'}
          </span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {currentQ.question_text}
        </h2>
      </div>

      {/* Answer Submission or Evaluation Card */}
      {!evalResult ? (
        <form onSubmit={handleSubmitAnswer} className="space-y-4">
          {/* Audio Recorder Toolbar */}
          <AudioRecorder
            onTranscriptUpdate={handleTranscriptUpdate}
            onDurationUpdate={handleDurationUpdate}
            disabled={submitting}
          />

          <div>
            <textarea
              rows={7}
              required
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your structured answer here, or click 'Voice Answer' to speak using your microphone..."
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 font-sans focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              {userAnswer.split(/\s+/).filter(Boolean).length} words entered
            </span>

            <button
              type="submit"
              disabled={submitting || !userAnswer.trim()}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-extrabold text-sm hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              {submitting ? 'Gemini 3.8 Evaluating Answer...' : 'Submit Answer'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
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

          {/* Speech Metrics Banner if present */}
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

          {/* Suggested Model Answer toggle */}
          {evalResult.suggested_model_answer && (
            <div>
              <button
                type="button"
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{showModelAnswer ? 'Hide Ideal Model Answer' : 'Reveal Ideal Model Answer'}</span>
              </button>
              {showModelAnswer && (
                <div className="mt-2 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                  {evalResult.suggested_model_answer}
                </div>
              )}
            </div>
          )}

          {/* Next Question / Finish Action */}
          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
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
  );
}
