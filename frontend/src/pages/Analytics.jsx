import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Award, Target, AlertCircle, BookOpen, Clock } from 'lucide-react';
import API from "../api";

const Analytics = () => {
  const [courses, setCourses]         = useState([]);
  const [quizScoreData, setQuizScoreData] = useState([]);
  const [activityData, setActivityData]   = useState([]);
  const [weakTopics, setWeakTopics]       = useState([]);
  const [stats, setStats]             = useState({ totalCourses: 0, totalQuizzes: 0, averageScore: 0, totalXP: 0, learningMins: 0 });

  useEffect(() => {
    buildAnalytics();
  }, []);

  const buildAnalytics = async () => {
    // ── 1. Fetch real courses from backend ──────────────────────────────────
    let realCourses = [];
    try {
      const res = await API.get('/courses');
      realCourses = res.data || [];
    } catch (e) { console.error('Courses fetch failed', e); }
    setCourses(realCourses);

    // ── 2. Quiz scores from localStorage ────────────────────────────────────
    const quizScores   = JSON.parse(localStorage.getItem('quizScores')   || '[]');
    const quizTopics   = JSON.parse(localStorage.getItem('quizTopics')   || '[]');
    const quizzesTaken = parseInt(localStorage.getItem('quizzesTaken')   || '0');
    const xp           = parseInt(localStorage.getItem('userXp')         || '0');
    const totalSeconds = parseInt(localStorage.getItem('learningSeconds') || '0');

    const avgScore = quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 0;

    setStats({
      totalCourses:  realCourses.length,
      totalQuizzes:  quizzesTaken,
      averageScore:  avgScore,
      totalXP:       xp,
      learningMins:  Math.floor(totalSeconds / 60),
    });

    // ── 3. Bar chart: quiz scores per topic ─────────────────────────────────
    if (quizTopics.length > 0 && quizScores.length > 0) {
      // Pair topics with their scores
      const paired = quizTopics.map((topic, i) => ({
        course: topic.length > 10 ? topic.substring(0, 10) + '…' : topic,
        fullTopic: topic,
        score: quizScores[i] ?? 0,
      }));
      setQuizScoreData(paired.slice(-6)); // show last 6
    } else if (realCourses.length > 0) {
      // Fallback: show course topics with 0 score (not yet quizzed)
      setQuizScoreData(
        realCourses.slice(0, 6).map(c => ({
          course: c.topic.length > 10 ? c.topic.substring(0, 10) + '…' : c.topic,
          fullTopic: c.topic,
          score: 0,
        }))
      );
    } else {
      setQuizScoreData([]);
    }

    // ── 4. Line chart: 7-day activity from localStorage ─────────────────────
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const dailySeconds = JSON.parse(localStorage.getItem('dailySeconds') || '{}');

    const activity = Array.from({ length: 7 }, (_, i) => {
      const dayIdx = (today - 6 + i + 7) % 7;
      const dayKey = new Date(Date.now() - (6 - i) * 86400000)
        .toISOString().split('T')[0];
      const secs = dailySeconds[dayKey] || 0;
      return { day: days[dayIdx], mins: Math.floor(secs / 60) };
    });
    setActivityData(activity);

    // ── 5. Areas for improvement: topics with lowest quiz scores ────────────
    if (quizTopics.length > 0 && quizScores.length > 0) {
      const paired = quizTopics.map((topic, i) => ({
        topic,
        score: quizScores[i] ?? 0,
      }));
      // Sort ascending — lowest scores are weak areas
      const sorted = [...paired].sort((a, b) => a.score - b.score);
      setWeakTopics(sorted.slice(0, 4));
    } else if (realCourses.length > 0) {
      // No quizzes yet — show courses with 0% progress as areas to study
      const withProgress = realCourses.map(c => {
        const pct = parseInt(localStorage.getItem(`progress_${c.id}`) || '0');
        return { topic: c.topic, score: pct };
      });
      const sorted = [...withProgress].sort((a, b) => a.score - b.score);
      setWeakTopics(sorted.slice(0, 4));
    } else {
      setWeakTopics([]);
    }
  };

  const card = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20, padding: '22px 24px',
  };

  const tooltipStyle = {
    background: '#1A1A2E',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, color: '#fff', fontSize: 13,
  };

  const weakColors = ['#F87171', '#FB923C', '#FACC15', '#A78BFA'];

  const statCards = [
    { icon: Award,      label: 'Total XP',         value: stats.totalXP,            color: '#6C63FF', bg: 'rgba(108,99,255,0.15)' },
    { icon: BookOpen,   label: 'Courses Generated', value: stats.totalCourses,       color: '#00D4AA', bg: 'rgba(0,212,170,0.15)'  },
    { icon: Target,     label: 'Quizzes Taken',     value: stats.totalQuizzes,       color: '#FF6B6B', bg: 'rgba(255,107,107,0.15)' },
    { icon: Clock,      label: 'Learning Mins',     value: stats.learningMins,       color: '#FFB800', bg: 'rgba(255,184,0,0.15)'  },
  ];

  const isEmpty = courses.length === 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Analytics Dashboard</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Track your learning progress and performance</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} style={card}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }} whileHover={{ y: -3 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color={s.color} />
                </div>
                <TrendingUp size={16} color="#4ADE80" />
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 4, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {isEmpty ? (
        /* ── Empty state ── */
        <motion.div style={{ ...card, textAlign: 'center', padding: '64px 32px' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No data yet</h3>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>
            Generate some courses and take quizzes — your analytics will appear here automatically.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

            {/* Bar chart — quiz scores by topic */}
            <motion.div style={card}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Quiz Performance</h3>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>
                {quizScoreData.some(d => d.score > 0) ? 'Your scores by topic' : 'Take quizzes to see scores'}
              </p>
              {quizScoreData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={quizScoreData} barCategoryGap="30%">
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6C63FF" />
                        <stop offset="100%" stopColor="#00D4AA" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="course" stroke="#6B7280" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#6B7280" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                      formatter={(v, _, props) => [`${v}%`, props.payload.fullTopic || 'Score']} />
                    <Bar dataKey="score" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: 13 }}>
                  Generate courses and take quizzes to see data
                </div>
              )}
            </motion.div>

            {/* Line chart — daily activity in minutes */}
            <motion.div style={card}
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 4 }}>7-Day Activity</h3>
              <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 16 }}>Minutes spent learning per day</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="day" stroke="#6B7280" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#6B7280" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} min`, 'Time']} />
                  <Line type="monotone" dataKey="mins" stroke="#00D4AA" strokeWidth={2.5}
                    dot={{ fill: '#00D4AA', r: 5, strokeWidth: 2, stroke: '#0F0F1A' }}
                    activeDot={{ r: 7, fill: '#00D4AA' }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Areas for improvement */}
          <motion.div style={card}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(251,146,60,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={18} color="#FB923C" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>Areas for Improvement</h3>
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0 }}>
                  {weakTopics.some(t => t.score > 0 && t.score < 100)
                    ? 'Topics where you scored lowest — focus here next'
                    : 'Courses with least progress — start learning these'}
                </p>
              </div>
            </div>

            {weakTopics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#6B7280', fontSize: 13 }}>
                Generate courses and take quizzes to see improvement areas
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                {weakTopics.map((t, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: '#E5E7EB' }}>{t.topic}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: weakColors[i] }}>{t.score}%</span>
                    </div>
                    <div style={{ width: '100%', height: 7, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${t.score}%` }}
                        transition={{ duration: 0.8, delay: i * 0.15 }}
                        style={{ height: '100%', background: weakColors[i], borderRadius: 99 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Analytics;