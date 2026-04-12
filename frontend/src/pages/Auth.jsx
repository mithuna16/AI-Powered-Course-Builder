import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          navigate('/');
        } else {
          setError(result.message || 'Invalid credentials');
        }
      } else {
        const result = await register(email, password);
        if (result.success) {
          setError('');
          alert('Registered successfully! Now login.');
          setIsLogin(true);
          setPassword('');
        } else {
          setError(result.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', top: 80, left: 80,
        width: 320, height: 320,
        background: '#6C63FF', borderRadius: '50%',
        filter: 'blur(90px)', opacity: 0.15,
        animation: 'pulse 4s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: 80, right: 80,
        width: 280, height: 280,
        background: '#00D4AA', borderRadius: '50%',
        filter: 'blur(90px)', opacity: 0.12,
        animation: 'pulse 4s ease-in-out infinite 1.5s'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}
      >
        {/* Logo + Branding */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: 36 }}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 22,
            background: 'linear-gradient(135deg, #6C63FF, #00D4AA)',
            marginBottom: 18, boxShadow: '0 8px 32px rgba(108,99,255,0.45)'
          }}>
            <Sparkles size={34} color="#fff" />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            AI Course Builder
          </h1>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>Learn smarter, not harder</p>
        </motion.div>

        {/* Auth Card */}
        <div className="auth-card">
          {/* Tab Switcher */}
          <div style={{
            display: 'flex', gap: 6, marginBottom: 32,
            padding: 5, background: 'rgba(0,0,0,0.25)', borderRadius: 14
          }}>
            {['Login', 'Register'].map((tab) => {
              const active = (tab === 'Login') === isLogin;
              return (
                <button
                  key={tab}
                  onClick={() => setIsLogin(tab === 'Login')}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                    cursor: 'pointer', fontWeight: 700, fontSize: 14,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    background: active
                      ? 'linear-gradient(135deg, #6C63FF, #00D4AA)'
                      : 'transparent',
                    color: active ? '#fff' : '#9CA3AF',
                    boxShadow: active ? '0 4px 16px rgba(108,99,255,0.35)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#D1D5DB', marginBottom: 8 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} color="#6B7280" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)'
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#D1D5DB', marginBottom: 8 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} color="#6B7280" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)'
                }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#F87171', padding: '12px 16px', borderRadius: 10, fontSize: 13
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '15px', fontSize: 15, marginTop: 4 }}
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? 'Login' : 'Register'}
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.22; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default Auth;