import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trash2, Search, PlusCircle } from 'lucide-react';
import axios from 'axios';

const History = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this course?')) return;
    try {
      await axios.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
      // Clean up localStorage
      localStorage.removeItem(`progress_${id}`);
      localStorage.removeItem(`course_progress_${id}`);
      localStorage.removeItem(`quiz_${id}`);  // ← ADD THIS
    } catch {
      alert('Error deleting course');
    }
  };

  // Reads the key saved by CourseViewer — "progress_{id}"
  const getProgress = (courseId) => {
    const val = localStorage.getItem(`progress_${courseId}`);
    return val ? parseInt(val) : 0;
  };

  const filteredCourses = courses.filter(c =>
    c.topic?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBadge = (level) => {
    const map = {
      Beginner:     { bg: 'rgba(74,222,128,0.15)',  color: '#4ADE80', border: 'rgba(74,222,128,0.3)'  },
      Intermediate: { bg: 'rgba(250,204,21,0.15)',  color: '#FACC15', border: 'rgba(250,204,21,0.3)'  },
      Advanced:     { bg: 'rgba(248,113,113,0.15)', color: '#F87171', border: 'rgba(248,113,113,0.3)' },
      Generated:    { bg: 'rgba(167,139,250,0.15)', color: '#A78BFA', border: 'rgba(167,139,250,0.3)' },
    };
    return map[level] || map['Generated'];
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.08)', borderTop: '3px solid #6C63FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Course History</h1>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Browse and continue your learning journey</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={17} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6B7280', pointerEvents: 'none' }} />
        <input type="text" value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search courses..."
          style={{
            width: '100%', padding: '12px 14px 12px 44px', fontSize: 14,
            background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.09)',
            borderRadius: 14, color: '#fff', outline: 'none',
            fontFamily: 'Plus Jakarta Sans, sans-serif', boxSizing: 'border-box',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = '#6C63FF'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
        />
      </div>

      {/* Empty state */}
      {filteredCourses.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '64px 32px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(108,99,255,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <BookOpen size={32} color="#6C63FF" />
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No courses yet</h3>
          <p style={{ color: '#9CA3AF', marginBottom: 24, fontSize: 14 }}>Generate your first AI-powered course to get started!</p>
          <button onClick={() => navigate('/')}
            style={{ padding: '12px 28px', background: 'linear-gradient(135deg,#6C63FF,#00D4AA)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <PlusCircle size={18} /> Generate Course
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
          {filteredCourses.map((course, i) => {
            const progress = getProgress(course.id);
            const badge = getBadge(course.level);
            const isComplete = progress >= 100;
            return (
              <motion.div key={course.id}
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isComplete ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderTop: `3px solid ${isComplete ? '#00D4AA' : '#6C63FF'}`,
                  borderRadius: 18, padding: 20, cursor: 'pointer',
                  transition: 'all 0.2s ease', position: 'relative',
                }}
                onClick={() => navigate(`/course/${course.id}`)}>

                {/* Complete badge */}
                {isComplete && (
                  <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,212,170,0.18)', border: '1px solid rgba(0,212,170,0.35)', borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: '#00D4AA' }}>
                    ✓ Complete
                  </div>
                )}

                {/* Title */}
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 10, paddingRight: isComplete ? 80 : 0, lineHeight: 1.4 }}>
                  {course.topic}
                </h3>

                {/* Meta */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                    {course.level}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', fontSize: 12 }}>
                    <Clock size={13} />
                    <span>{course.duration} days</span>
                  </div>
                </div>

                {/* Progress bar — fully inline, no CSS class */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: '#9CA3AF' }}>Progress</span>
                    <span style={{ color: progress >= 100 ? '#00D4AA' : progress > 0 ? '#6C63FF' : '#6B7280', fontWeight: 600 }}>
                      {progress}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, delay: i * 0.06 }}
                      style={{ height: '100%', background: progress >= 100 ? '#00D4AA' : 'linear-gradient(90deg,#6C63FF,#00D4AA)', borderRadius: 99 }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/course/${course.id}`); }}
                    style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#6C63FF,#00D4AA)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {progress > 0 ? 'Continue' : 'Start'}
                  </button>
                  <button
                    onClick={e => deleteCourse(e, course.id)}
                    style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default History;