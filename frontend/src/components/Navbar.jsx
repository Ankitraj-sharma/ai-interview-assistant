import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  FileText, 
  Briefcase, 
  GitCompare, 
  Mic, 
  BarChart3, 
  LogOut, 
  User, 
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Resume', path: '/resume', icon: FileText },
    { name: 'Job Analyzer', path: '/job', icon: Briefcase },
    { name: 'Skill Match', path: '/match', icon: GitCompare },
    { name: 'Mock Interview', path: '/interview', icon: Mic },
    { name: 'Performance', path: '/performance', icon: Sparkles },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Bot className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <span className="text-lg font-bold bg-gradient-to-r from-teal-300 via-cyan-200 to-white bg-clip-text text-transparent">
              Interviewer.ai
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-400 border border-teal-800/50">
              Supabase + Gemini 3.8
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active 
                    ? 'text-teal-300 bg-teal-500/10 border border-teal-500/20' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-teal-400' : 'text-slate-400'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User profile / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <User className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-slate-300 font-medium truncate max-w-[120px]">{user?.full_name || 'Candidate'}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-semibold hover:from-teal-400 hover:to-cyan-400 transition-all shadow-md shadow-teal-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
