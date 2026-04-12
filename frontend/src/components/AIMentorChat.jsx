import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Bot } from 'lucide-react';
import axios from 'axios';
import API from "../api";

const AIMentorChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm your AI Mentor. Ask me anything about your courses, programming concepts, or learning tips!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setLoading(true);

    try {
      // Use your Spring Boot backend which calls Groq AI
      const response = await API.post('/api/chat', {
        message: userText,
        context: 'AI Course Builder learning assistant. Help with programming, courses, and learning tips.'
      });

      const reply = response.data?.response
        || (typeof response.data === 'string' ? response.data : null)
        || "I'm here to help! Could you rephrase that?";

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      let errMsg = "⚠️ I'm having trouble connecting right now.";
      if (error.response?.status === 503 || error.code === 'ERR_NETWORK') {
        errMsg = "⚠️ Backend is not running. Please start your Spring Boot server on port 8080.";
      } else if (error.response?.status === 500) {
        errMsg = "⚠️ AI service error. Please check your Groq API key in application.properties.";
      }
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            style={{
              position: 'fixed', bottom: 24, right: 24,
              width: 52, height: 52, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
              border: 'none', cursor: 'pointer', zIndex: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 28px rgba(108,99,255,0.5)',
            }}
          >
            <MessageCircle size={24} color="#fff" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="drawer"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0,
              width: 400, zIndex: 50,
              display: 'flex', flexDirection: 'column',
              background: 'rgba(19,19,42,0.97)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '-12px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 13,
                  background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
                }}>
                  <Sparkles size={20} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>AI Mentor</div>
                  <div style={{ fontSize: 11, color: '#00D4AA', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00D4AA', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
                    Online
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9CA3AF', cursor: 'pointer', padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#9CA3AF'; }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg,#6C63FF,#00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={14} color="#fff" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '78%', padding: '11px 14px', borderRadius: 16,
                    fontSize: 13.5, lineHeight: 1.55,
                    background: msg.role === 'user' ? 'linear-gradient(135deg,#6C63FF,#00D4AA)' : 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                    borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6C63FF,#00D4AA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={14} color="#fff" />
                  </div>
                  <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.08)', borderRadius: '16px 16px 16px 4px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CA3AF', animation: `bounce-dot 1.2s ease-in-out ${delay}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  rows={1}
                  style={{
                    flex: 1, padding: '12px 14px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, color: '#fff', fontSize: 13.5,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    outline: 'none', resize: 'none', lineHeight: 1.5,
                    transition: 'border-color 0.2s', maxHeight: 100, overflowY: 'auto',
                  }}
                  onFocus={e => e.target.style.borderColor = '#6C63FF'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button onClick={handleSend} disabled={!input.trim() || loading}
                  style={{
                    width: 44, height: 44, borderRadius: 12, border: 'none',
                    background: input.trim() && !loading ? 'linear-gradient(135deg,#6C63FF,#00D4AA)' : 'rgba(255,255,255,0.08)',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s', flexShrink: 0,
                  }}
                >
                  <Send size={17} color={input.trim() && !loading ? '#fff' : '#4B5563'} />
                </button>
              </div>
              <div style={{ fontSize: 10.5, color: '#4B5563', marginTop: 8, textAlign: 'center' }}>
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce-dot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
      `}</style>
    </>
  );
};

export default AIMentorChat;
