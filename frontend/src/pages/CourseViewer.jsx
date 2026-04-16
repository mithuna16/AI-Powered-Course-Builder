import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Circle, ArrowLeft, Trophy } from 'lucide-react';
import API from "../api";

// ─── Extract module titles from content ────────────────────────────────────
const extractModules = (content) => {
  if (!content) return [];
  const lines = content.split('\n');
  const modules = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const isModuleLine =
      /^(module|day|week|section|part|unit|chapter|lesson|topic|step)\s*\d+/i.test(trimmed) ||
      /^#{1,4}\s+.{3,}/.test(trimmed) ||
      /^(overview|introduction|conclusion|summary|prerequisites|getting\s+started|what\s+is)/i.test(trimmed) ||
      /^\*\*(module|day|week|section|part|unit|chapter|lesson)\s*\d+/i.test(trimmed);
    if (isModuleLine) {
      const label = trimmed
        .replace(/^#{1,4}\s*/, '')
        .replace(/\*\*/g, '')
        .trim();
      if (label.length > 2 && label.length < 100) modules.push(label);
    }
    if (modules.length >= 15) break;
  }

  // Fallback: if still no modules found, grab bold lines or heading-like lines
  if (modules.length === 0) {
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (
        /^#{1,4}\s+.{3,}/.test(trimmed) ||
        /^\*\*.{5,}\*\*$/.test(trimmed) ||
        /^[A-Z][^.!?]{10,60}:$/.test(trimmed)
      ) {
        const label = trimmed.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '').replace(/:$/, '').trim();
        if (label.length > 4 && label.length < 100) modules.push(label);
      }
      if (modules.length >= 12) break;
    }
  }

  const seen = new Set();
  return modules.filter(m => {
    const key = m.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// ─── Format content into React elements ────────────────────────────────────
const formatContent = (content) => {
  if (!content) return null;
  return content.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={i} style={{ height: 8 }} />;
    if (trimmed.startsWith('### ')) return (
      <h4 key={i} style={{ fontSize: 15, fontWeight: 700, color: '#A78BFA', marginTop: 20, marginBottom: 8 }}>
        {trimmed.replace('### ', '')}
      </h4>
    );
    if (trimmed.startsWith('## ')) return (
      <h3 key={i} style={{ fontSize: 19, fontWeight: 800, color: '#fff', marginTop: 28, marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
        {trimmed.replace('## ', '')}
      </h3>
    );
    if (trimmed.startsWith('# ')) return (
      <h2 key={i} style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 32, marginBottom: 12 }}>
        {trimmed.replace('# ', '')}
      </h2>
    );
    if (/^(Module|Day|Week|Section|Part|Unit|Chapter|Lesson)\s*\d+/i.test(trimmed) || trimmed.startsWith('**')) {
      return (
        <h3 key={i} style={{ fontSize: 17, fontWeight: 800, color: '#A78BFA', marginTop: 24, marginBottom: 8 }}>
          {trimmed.replace(/\*\*/g, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) return (
      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, paddingLeft: 8 }}>
        <span style={{ color: '#6C63FF', marginTop: 2, flexShrink: 0 }}>•</span>
        <p style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 1.7, margin: 0 }}>
          {trimmed.replace(/^[*\-]\s/, '')}
        </p>
      </div>
    );
    if (/^\d+\.\s/.test(trimmed)) return (
      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6, paddingLeft: 8 }}>
        <span style={{ color: '#00D4AA', fontWeight: 700, fontSize: 13, marginTop: 2, flexShrink: 0 }}>
          {trimmed.match(/^\d+/)[0]}.
        </span>
        <p style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 1.7, margin: 0 }}>
          {trimmed.replace(/^\d+\.\s/, '')}
        </p>
      </div>
    );
    return (
      <p key={i} style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 1.75, marginBottom: 6 }}>
        {trimmed}
      </p>
    );
  });
};

// ─── Video Section Component (frontend-only, no API key needed) ──────────────
const VideoSection = ({ courseId, courseTopic }) => {
  const [videos, setVideos] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Build 4 search-based video cards from the topic — no API call needed
  useEffect(() => {
    if (!courseTopic) return;
    const queries = [
      `${courseTopic} tutorial for beginners`,
      `${courseTopic} full course`,
      `${courseTopic} explained`,
      `${courseTopic} crash course`,
    ];
    // Generate deterministic fake-stable video IDs by fetching YouTube search
    // Since we can't embed search, we create clickable search cards instead
    setVideos(queries.map((q, i) => ({
      id: i,
      label: q,
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      icon: ['🎓', '📚', '💡', '⚡'][i],
    })));
  }, [courseTopic]);

  const searchQuery = encodeURIComponent((courseTopic || 'programming') + ' tutorial');
  const mainSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

  return (
    <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        🎬 Related Videos
      </h3>

      {/* Main CTA banner */}
      <a
        href={mainSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}
      >
        <div style={{
          borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,0,0,0.3)',
          background: 'linear-gradient(135deg, rgba(255,0,0,0.12), rgba(108,99,255,0.12))',
          padding: '14px 12px', textAlign: 'center', cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          <div style={{ fontSize: 22, marginBottom: 4 }}>▶</div>
          <p style={{ color: '#fff', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>
            {courseTopic} Tutorials
          </p>
          <p style={{ color: '#9CA3AF', fontSize: 10 }}>Search on YouTube →</p>
        </div>
      </a>

      {/* Quick search links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {videos.map(v => (
          <a
            key={v.id}
            href={v.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                background: selectedIdx === v.id ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedIdx === v.id ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(108,99,255,0.12)'; setSelectedIdx(v.id); }}
              onMouseLeave={e => { e.currentTarget.style.background = selectedIdx === v.id ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)'; }}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>{v.icon}</span>
              <span style={{
                fontSize: 10.5, color: '#D1D5DB', lineHeight: 1.4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {v.label}
              </span>
              <span style={{ color: '#6B7280', fontSize: 10, marginLeft: 'auto', flexShrink: 0 }}>↗</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const CourseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [checkedModules, setCheckedModules] = useState({});
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => { fetchCourse(); }, [id]);

  useEffect(() => {
    if (!course) return;
    const saved = localStorage.getItem(`course_progress_${id}`);
    if (saved) {
      try {
        const { checked } = JSON.parse(saved);
        setCheckedModules(checked || {});
      } catch (e) {}
    }
  }, [course, id]);

  useEffect(() => {
    if (!course || modules.length === 0) return;
    const checkedCount = Object.values(checkedModules).filter(Boolean).length;
    const pct = Math.round((checkedCount / modules.length) * 100);
    localStorage.setItem(`course_progress_${id}`, JSON.stringify({
      checked: checkedModules, total: modules.length, checkedCount,
    }));
    localStorage.setItem(`progress_${id}`, pct.toString());
  }, [checkedModules, modules, id, course]);

// ─── Track time spent on this course page ───────────────────────────────────
useEffect(() => {
  let lastSaved = Date.now(); // track from last save point, not from mount
  const saveTime = () => {
    const now = Date.now();
    const secondsSpent = Math.floor((now - lastSaved) / 1000);
    if (secondsSpent > 0) {
      // Total seconds
      const existing = parseInt(localStorage.getItem('learningSeconds') || '0');
      localStorage.setItem('learningSeconds', (existing + secondsSpent).toString());

      // ← ADD: daily seconds keyed by date (for 7-day chart)
      const dateKey = new Date().toISOString().split('T')[0];
      const daily = JSON.parse(localStorage.getItem('dailySeconds') || '{}');
      daily[dateKey] = (daily[dateKey] || 0) + secondsSpent;
      localStorage.setItem('dailySeconds', JSON.stringify(daily));

      lastSaved = now;
    }
  };

  // Save every 10 seconds while on the page
 const interval = setInterval(saveTime, 3000); // every 3 seconds

  // Save immediately when tab becomes hidden
  const handleVisibility = () => {
    if (document.hidden) saveTime();
  };
  document.addEventListener('visibilitychange', handleVisibility);

  // Save on unmount (navigate away)
  return () => {
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibility);
    saveTime();
  };
}, []); // runs once on mount, cleanup runs on unmount (when user leaves page)

  const fetchCourse = async () => {
    try {
      const response = await API.get(`/courses/${id}`);
      setCourse(response.data);
      setModules(extractModules(response.data.content));
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Error loading course');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = useCallback((index) => {
    setCheckedModules(prev => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const completedCount = Object.values(checkedModules).filter(Boolean).length;
  const progress = modules.length > 0 ? (completedCount / modules.length) * 100 : 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #6C63FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!course) return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
      <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 16 }}>Course not found</h3>
      <button onClick={() => navigate('/history')}
        style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#6C63FF,#00D4AA)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        Back to History
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Back + Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => navigate('/history')}
          style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', marginBottom: 16, padding: 0, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
        >
          <ArrowLeft size={16} /> Back to History
        </button>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{course.topic}</h1>
              <p style={{ fontSize: 13, color: '#9CA3AF' }}>
                Level: {course.level || 'Generated'} &nbsp;•&nbsp; Duration: {course.duration} days
                &nbsp;•&nbsp; {modules.length} modules
              </p>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/quiz')}
              style={{ padding: '11px 20px', fontSize: 13, background: 'linear-gradient(135deg,#6C63FF,#00D4AA)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'Plus Jakarta Sans, sans-serif', boxShadow: '0 4px 16px rgba(108,99,255,0.35)' }}>
              <Trophy size={16} /> Take Quiz
            </motion.button>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>
              <span>Overall Progress</span>
              <span style={{ color: progress >= 100 ? '#00D4AA' : '#fff', fontWeight: 700 }}>
                {Math.round(progress)}%{progress >= 100 && ' 🎉'}
              </span>
            </div>
            <div style={{ width: '100%', height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}
                style={{ height: '100%', background: progress >= 100 ? '#00D4AA' : 'linear-gradient(90deg,#6C63FF,#00D4AA)', borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>
              {completedCount} of {modules.length} modules completed
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        gap: 20,
        alignItems: 'flex-start'
      }}>

        {/* ── Sidebar ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
          style={{
            width: window.innerWidth < 768 ? '100%' : 280, flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '20px 16px',
            position: window.innerWidth < 768 ? 'relative' : 'sticky',
            top: window.innerWidth < 768 ? 'auto' : 20,
            maxHeight: 'calc(100vh - 120px)', overflowY: 'auto'
          }}
        >
          {modules.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <BookOpen size={16} color="#6C63FF" /> Topics
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {modules.map((mod, index) => {
                  const isChecked = !!checkedModules[index];
                  const isActive = index === activeModule;
                  return (
                    <div key={index}
                      onClick={() => { setActiveModule(index); toggleModule(index); }}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        background: isChecked ? 'rgba(0,212,170,0.1)' : isActive ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
                        border: isChecked ? '1px solid rgba(0,212,170,0.25)' : isActive ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
                      }}
                      onMouseEnter={e => { if (!isChecked && !isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                      onMouseLeave={e => { if (!isChecked && !isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    >
                      {isChecked
                        ? <CheckCircle2 size={16} color="#00D4AA" style={{ flexShrink: 0, marginTop: 1 }} />
                        : <Circle size={16} color={isActive ? '#6C63FF' : '#4B5563'} style={{ flexShrink: 0, marginTop: 1 }} />
                      }
                      <span style={{ fontSize: 12.5, lineHeight: 1.45, fontWeight: isChecked || isActive ? 600 : 400, color: isChecked ? '#6EE7B7' : isActive ? '#C4B5FD' : '#9CA3AF', textDecoration: isChecked ? 'line-through' : 'none', wordBreak: 'break-word' }}>
                        {mod}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mini progress bar */}
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 6 }}>
                  <span>Progress</span>
                  <span style={{ color: '#00D4AA', fontWeight: 700 }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                  <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg,#6C63FF,#00D4AA)', borderRadius: 99 }} />
                </div>
              </div>
            </>
          )}

          {/* ── Video Section ── */}
          <VideoSection courseId={id} courseTopic={course?.topic} />

        </motion.div>

        {/* Main content */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
         style={{
           flex: 1,
           minWidth: 0,
           width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 32px' }}>
          <div style={{ lineHeight: 1.7 }}>
            {formatContent(course.content)}
          </div>
        </motion.div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default CourseViewer;