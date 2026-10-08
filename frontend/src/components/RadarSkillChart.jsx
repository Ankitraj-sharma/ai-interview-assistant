import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
} from 'recharts';

export default function RadarSkillChart({ data }) {
  // Transform dictionary { Technical: 85, Communication: 76, ... } to array format
  const chartData = [
    { subject: 'Technical', score: data?.Technical || 75, fullMark: 100 },
    { subject: 'Communication', score: data?.Communication || 70, fullMark: 100 },
    { subject: 'Relevance', score: data?.Relevance || 80, fullMark: 100 },
    { subject: 'Completeness', score: data?.Completeness || 68, fullMark: 100 },
    { subject: 'Problem Solving', score: data?.['Problem Solving'] || 78, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
          <Radar
            name="Competency"
            dataKey="score"
            stroke="#14b8a6"
            fill="#14b8a6"
            fillOpacity={0.45}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
