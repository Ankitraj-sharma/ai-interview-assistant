import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Sparkles, 
  Trophy, 
  TrendingUp, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  AlertTriangle 
} from 'lucide-react';

export default function PerformancePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardAPI.getStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const toggleTask = (task) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [task]: !prev[task],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const scoreHistory = stats?.score_history?.length > 0 ? stats.score_history : [
    { attempt: 1, date: 'Oct 01', overall_score: 61, technical_score: 58, communication_score: 65 },
    { attempt: 2, date: 'Oct 03', overall_score: 68, technical_score: 66, communication_score: 70 },
    { attempt: 3, date: 'Oct 05', overall_score: 75, technical_score: 77, communication_score: 74 },
    { attempt: 4, date: 'Oct 07', overall_score: 84, technical_score: 86, communication_score: 82 },
  ];

  const preparationTasks = [
    'Review System Design distributed rate limiter architectures',
    'Practice explaining B-Tree indexing and query plans out loud',
    'Rehearse STAR framework for behavioral team conflict scenarios',
    'Master JWT refresh token expiration and HttpOnly security',
    'Review Docker multi-stage builds and Kubernetes pod lifecycle'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-teal-400 text-xs font-mono font-bold uppercase">MODULE 7</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Candidate Performance & Progress</h1>
        <p className="text-sm text-slate-400 mt-1">
          Historical score trajectories, skill balance, and actionable interview preparation roadmap.
        </p>
      </div>

      {/* Trajectory & Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Line */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Score Progression Over Time
              </h3>
              <p className="text-xs text-slate-400">Mock interview attempts</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              +23% Total Gain
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
                  name="Overall" 
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
                <Line 
                  type="monotone" 
                  dataKey="communication_score" 
                  name="Communication" 
                  stroke="#a855f7" 
                  strokeWidth={2} 
                  strokeDasharray="2 2" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Radar */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Competency Radar</h3>
              <p className="text-xs text-slate-400">Current skill footprint</p>
            </div>
            <span className="text-xs font-mono text-teal-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              5 Vectors
            </span>
          </div>
          <RadarSkillChart data={stats?.radar_scores} />
        </div>
      </div>

      {/* Weak Areas Detection & Roadmap Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Skill Detector */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-base font-bold text-white">Weak Skill Detection Matrix</h3>
          </div>
          <p className="text-xs text-slate-400">
            Identified by correlating recurring gaps across multiple interview evaluations:
          </p>

          <div className="space-y-3">
            {(stats?.weak_areas || [
              { skill: 'System Design', score: 52, recommendation: 'Practice 10 System Design questions' },
              { skill: 'AWS / Cloud Architecture', score: 58, recommendation: 'Study AWS fundamentals and VPC basics' },
              { skill: 'Database Indexing & Normalization', score: 64, recommendation: 'Practice SQL joins and B-Tree indexing' }
            ]).map((area, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{area.skill}</span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                    {area.score}% Mastery
                  </span>
                </div>
                <p className="text-xs text-slate-400">{area.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Preparation Checklist */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-bold text-white">Recommended Preparation Tasks</h3>
          </div>
          <p className="text-xs text-slate-400">
            Check off items as you study to systematically improve your readiness:
          </p>

          <div className="space-y-2.5">
            {preparationTasks.map((task, idx) => {
              const isChecked = !!completedTasks[task];
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => toggleTask(task)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-colors ${
                    isChecked
                      ? 'bg-teal-950/20 border-teal-500/30 text-teal-300 line-through'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-xs font-medium">{task}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
