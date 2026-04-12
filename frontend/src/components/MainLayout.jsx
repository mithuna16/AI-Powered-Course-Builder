import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Award, Flame, History, BarChart3, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AIMentorChat from './AIMentorChat';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem('userXp') || '0');
    setXp(stored);
    setLevel(Math.floor(stored / 100) + 1);
  }, []);

  const handleLogout = () => { logout(); navigate('/auth'); };

  const navItems = [
    { name: 'Generate',  icon: Sparkles,  path: '/'          },
    { name: 'History',   icon: History,   path: '/history'   },
    { name: 'Quiz',      icon: BookOpen,  path: '/quiz'      },
    { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  ];

  return (
    <div style={{ display:'flex', height:'100vh', background:'#0F0F1A', overflow:'hidden' }}>

      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="sidebar"
            style={{ flexShrink: 0, overflow: 'hidden' }}
          >
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <Sparkles size={20} color="#fff" />
              </div>
              <div>
                <h2 style={{ fontSize:15, fontWeight:800, color:'#fff', lineHeight:1.1 }}>AI Course</h2>
                <p style={{ fontSize:11, color:'#6B7280' }}>Builder</p>
              </div>
            </div>

            <nav className="sidebar-nav">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}
                    className={`nav-item ${active ? 'active' : ''}`}>
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="sidebar-bottom">
              <div className="xp-card">
                <div className="xp-row">
                  <span className="xp-level">Level {level}</span>
                  <span className="xp-value">{xp % 100}/100 XP</span>
                </div>
                <div className="xp-bar">
                  <motion.div className="xp-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${xp % 100}%` }} />
                </div>
                <div className="xp-hint">
                  <Flame size={13} color="#F97316" />
                  <span>Keep learning!</span>
                </div>
              </div>

              <div className="user-card">
                <div className="user-avatar">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="user-name">{user?.email?.split('@')[0] || 'User'}</div>
                  <div className="user-email">{user?.email}</div>
                </div>
                <button className="logout-btn" onClick={handleLogout} title="Logout">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN AREA */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <header className="topbar">
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <button className="topbar-toggle" onClick={() => setSidebarOpen(p => !p)}>
              {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div>
              <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>Welcome back!</div>
              <div style={{ fontSize:12, color:'#6B7280' }}>Ready to learn something new?</div>
            </div>
          </div>
          <div className="xp-badge">
            <Award size={16} color="#00D4AA" />
            <span>{xp} XP</span>
          </div>
        </header>

        <main style={{ flex:1, overflowY:'auto', padding:'28px' }}>
          <Outlet />
        </main>
      </div>

      <AIMentorChat />
    </div>
  );
};

export default MainLayout;
