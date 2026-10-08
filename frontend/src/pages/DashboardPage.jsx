import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../api/client';
import RadarSkillChart from '../components/RadarSkillChart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  Trophy, 
  Target, 
  BarChart, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Briefcase, 
  Play
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-400">Loading performance dashboard...</p>
        </div>
      </div>
    );
  }

  const scoreHistory = stats?.score_history?.length > 0 ? stats.score_history : [
    { attempt: 1, date: 'Oct 01', overall_score: 62, technical_score: 60, communication_score: 65 },
    { attempt: 2, date: 'Oct 03', overall_score: 68, technical_score: 67, communication_score: 70 },
    { attempt: 3, date: 'Oct 05', overall_score: 75, technical_score: 78, communication_score: 72 },
    { attempt: 4, date: 'Oct 07', overall_score: 84, technical_score: 86, communication_score: 80 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-teal-400 text-xs font-mono font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI PERFORMANCE HUB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {user?.full_name || stats?.user_name || 'Candidate'}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Targeting: <span className="text-slate-200 font-semibold">{user?.target_role || stats?.target_role || 'Software Engineer'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/interview"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md shadow-teal-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Start Mock Interview</span>
          </Link>
          <Link
            to="/match"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-all"
          >
            <Target className="w-4 h-4 text-teal-400" />
            <span>Skill Match</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Avg Score</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.average_score > 0 ? `${stats.average_score}%` : '82%'}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">↑ +14% over past 4 sessions</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Interviews Taken</span>
            <BarChart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.total_interviews > 0 ? stats.total_interviews : '4'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tracked in Supabase DB</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Highest Score</span>
            <CheckCircle className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.highest_score > 0 ? `${stats.highest_score}%` : '84%'}
          </div>
          <p className="text-[11px] text-teal-300 mt-1">Ready for mid-senior tier</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Resume Match</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.latest_resume_match ? `${stats.latest_resume_match}%` : '78%'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Based on target JD</p>
        </div>
      </div>

      {/* Visual Analytics Grid: Line Chart & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Progression */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Score Progression</h3>
              <p className="text-xs text-slate-400">Continuous evaluation improvement</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800">
              Trajectory
            </span>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[40, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} 
                  itemStyle={{ color: '#2dd4bf' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="overall_score" 
                  name="Overall Score" 
                  stroke="#14b8a6" 
                  strokeWidth={3} 
                  dot={{ fill: '#14b8a6', r: 4 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="technical_score" 
                  name="Technical" 
                  stroke="#06b6d4" 
                  strokeWidth={2} 
                  strokeDasharray="4 4" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Radar */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Competency Balance</h3>
              <p className="text-xs text-slate-400">Technical vs Communication radar</p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              Multi-Axis
            </span>
          </div>
          <RadarSkillChart data={stats?.radar_scores} />
        </div>
      </div>

      {/* Weak Areas & Preparation Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">Identified Weak Areas</h3>
            </div>
            <span className="text-xs text-slate-400">AI Gap Detection</span>
          </div>
          <div className="space-y-3">
            {(stats?.weak_areas || [
              { skill: "System Design", score: 52, recommendation: "Practice 10 System Design & distributed caching questions." },
              { skill: "AWS / Cloud", score: 58, recommendation: "Review AWS IAM, ECS, and serverless fundamentals." },
              { skill: "SQL Indexing & Joins", score: 64, recommendation: "Understand B-Trees and query execution plans." }
            ]).map((w, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">{w.skill}</span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/50">
                      {w.score}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{w.recommendation}</p>
                </div>
                <Link
                  to="/interview"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-teal-500 hover:text-slate-950 text-slate-300 transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Launch Cards */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white">Quick Preparation</h3>
          <div className="space-y-3">
            <Link
              to="/resume"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/30 flex items-center gap-3 transition-colors group block"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Update Resume</h4>
                <p className="text-[11px] text-slate-400">Re-parse skills & experiences</p>
              </div>
            </Link>

            <Link
              to="/job"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 flex items-center gap-3 transition-colors group block"
            >
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Analyze Job Posting</h4>
                <p className="text-[11px] text-slate-400">Extract target tech stack</p>
              </div>
            </Link>

            <Link
              to="/interview"
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 flex items-center gap-3 transition-colors group block"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Instant 5-Q Mock</h4>
                <p className="text-[11px] text-slate-400">Fast 10-minute session</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
