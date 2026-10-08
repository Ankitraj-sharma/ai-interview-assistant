import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import JobAnalyzerPage from './pages/JobAnalyzerPage';
import SkillMatchPage from './pages/SkillMatchPage';
import MockInterviewPage from './pages/MockInterviewPage';
import InterviewRoomPage from './pages/InterviewRoomPage';
import InterviewResultPage from './pages/InterviewResultPage';
import PerformancePage from './pages/PerformancePage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/resume" element={<ResumeAnalyzerPage />} />
              <Route path="/job" element={<JobAnalyzerPage />} />
              <Route path="/match" element={<SkillMatchPage />} />
              <Route path="/interview" element={<MockInterviewPage />} />
              <Route path="/interview/room/:sessionId" element={<InterviewRoomPage />} />
              <Route path="/interview/result/:sessionId" element={<InterviewResultPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
