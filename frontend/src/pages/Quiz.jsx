import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from "../api";


const Quiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [topic, setTopic] = useState('');

  const loadQuiz = async () => {
    if (!topic.trim()) { alert('Please enter a topic!'); return; }
    setLoading(true);
    try {
      const response = await API.post('/quiz', { topic: topic.trim() });
      const parsedQuestions = parseQuiz(response.data);
      if (parsedQuestions.length === 0) {
        alert('Could not parse quiz. Please try again.');
        return;
      }
      setQuestions(parsedQuestions);
      setQuizStarted(true);
      setCurrentQuestion(0);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (error) {
      console.error('Quiz error:', error);
      alert('Error loading quiz. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const parseQuiz = (text) => {
    const clean = text.replace(/\*\*/g, '').replace(/#{1,6}\s/g, '').replace(/\r\n/g, '\n');
    const blocks = clean.split(/\n(?=Q\d+:)/).filter(b => b.trim());

    return blocks.map((block, index) => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      const qLine = lines.find(l => /^Q\d+:/.test(l));
      const questionText = qLine ? qLine.replace(/^Q\d+:\s*/, '').trim() : `Question ${index + 1}`;

      const options = lines
        .filter(l => /^[A-D]\)/.test(l))
        .map(opt => ({
          letter: opt.charAt(0),
          text: opt.substring(3).trim()
        }));

      // FIX: Extract ONLY first character after "Answer:"
      const answerLine = lines.find(l => /^Answer:/i.test(l));
      const correctAnswer = answerLine
        ? answerLine.replace(/^Answer:\s*/i, '').trim().charAt(0).toUpperCase()
        : 'A';

      return { id: index, question: questionText, options, correctAnswer };
    }).filter(q => q.options.length >= 2);
  };

  const handleSelectAnswer = (letter) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion]: letter }));
  };

const handleNext = () => {
  if (currentQuestion < questions.length - 1) {
    setCurrentQuestion(prev => prev + 1);
  } else {
    setShowResults(true);

    const correctAnswers = questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length;

    const earnedXP = correctAnswers * 10;
   const prevXP = parseInt(localStorage.getItem('userXp') || '0');
   localStorage.setItem('userXp', (prevXP + earnedXP).toString());

    const quizCount = parseInt(localStorage.getItem('quizzesTaken') || '0');
    localStorage.setItem('quizzesTaken', (quizCount + 1).toString());

    const pct = Math.round((correctAnswers / questions.length) * 100);
    const scores = JSON.parse(localStorage.getItem('quizScores') || '[]');
    const topics = JSON.parse(localStorage.getItem('quizTopics') || '[]');

    scores.push(pct);
    topics.push(topic);

    localStorage.setItem('quizScores', JSON.stringify(scores));
    localStorage.setItem('quizTopics', JSON.stringify(topics));
  }
};

  const score = questions.filter((q, i) => selectedAnswers[i] === q.correctAnswer).length;
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const getBadge = () => {
    if (percentage >= 80) return { text: 'Excellent!', color: '#4ADE80', emoji: '🎉' };
    if (percentage >= 60) return { text: 'Good Job!', color: '#FACC15', emoji: '😊' };
    return { text: 'Keep Practicing!', color: '#FB923C', emoji: '💪' };
  };

  const card = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '32px',
    backdropFilter: 'blur(12px)',
  };

  if (!quizStarted) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ ...card, textAlign: 'center', padding: '56px 40px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(108,99,255,0.4)'
          }}>
            <Trophy size={36} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: '32px', fontWeight: 800, marginBottom: '10px' }}>Test Your Knowledge</h1>
          <p style={{ color: '#9CA3AF', marginBottom: '32px', fontSize: '15px' }}>Enter a topic to generate an AI-powered quiz</p>
          <input
            type="text" value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && loadQuiz()}
            placeholder="e.g., Spring Boot, React, Python..."
            style={{
              width: '100%', padding: '16px 20px', fontSize: '15px', marginBottom: '16px',
              background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '14px', color: '#fff', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'Plus Jakarta Sans, sans-serif', textAlign: 'center',
            }}
          />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={loadQuiz} disabled={loading}
            style={{
              padding: '16px 40px', fontSize: '16px', fontWeight: 700,
              background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
              border: 'none', borderRadius: '14px', color: '#fff',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            }}>
            {loading
              ? <><div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating...</>
              : <><Sparkles size={20} /> Generate Quiz</>}
          </motion.button>
        </motion.div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (showResults) {
    const badge = getBadge();
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ ...card, textAlign: 'center' }}>
          <div style={{
            width: '88px', height: '88px', borderRadius: '24px',
            background: 'linear-gradient(135deg,#6C63FF,#00D4AA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(108,99,255,0.4)'
          }}>
            <Trophy size={40} color="#fff" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '48px', fontWeight: 800, marginBottom: '8px' }}>{score}/{questions.length}</h2>
          <p style={{ color: badge.color, fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>{badge.emoji} {badge.text}</p>
          <p style={{ color: '#9CA3AF', marginBottom: '28px' }}>You scored {percentage}% on {topic}</p>
          <div style={{ textAlign: 'left', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questions.map((q, i) => {
              const correct = selectedAnswers[i] === q.correctAnswer;
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '14px', padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {correct
                    ? <CheckCircle2 size={20} color="#4ADE80" style={{ flexShrink: 0, marginTop: 2 }} />
                    : <XCircle size={20} color="#F87171" style={{ flexShrink: 0, marginTop: 2 }} />}
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600, marginBottom: '4px', fontSize: '14px' }}>Q{i + 1}: {q.question}</p>
                    <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                      Your answer: <span style={{ color: correct ? '#4ADE80' : '#F87171' }}>{selectedAnswers[i] || '—'}</span>
                      {!correct && <> &bull; Correct: <span style={{ color: '#4ADE80' }}>{q.correctAnswer}</span></>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => { setQuizStarted(false); setShowResults(false); setTopic(''); }}
              style={{ padding: '12px 24px', fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#00D4AA)', border: 'none', borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <RotateCcw size={18} /> New Quiz
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/')}
              style={{ padding: '12px 24px', fontWeight: 700, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <Home size={18} /> Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9CA3AF', fontSize: '13px', marginBottom: '8px' }}>
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg,#6C63FF,#00D4AA)', borderRadius: '999px' }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion}
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
          style={card}>
          <p style={{ color: '#6C63FF', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Topic: {topic}</p>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '24px', lineHeight: 1.5 }}>{currentQ.question}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {currentQ.options.map(opt => {
              const selected = selectedAnswers[currentQuestion] === opt.letter;
              return (
                <motion.button key={opt.letter}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => handleSelectAnswer(opt.letter)}
                  style={{
                    width: '100%', padding: '16px 20px', textAlign: 'left',
                    background: selected ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `2px solid ${selected ? '#6C63FF' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    boxShadow: selected ? '0 4px 20px rgba(108,99,255,0.2)' : 'none',
                    fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.15s ease',
                  }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                    background: selected ? '#6C63FF' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '14px', color: selected ? '#fff' : '#9CA3AF'
                  }}>{opt.letter}</div>
                  <span style={{ fontSize: '15px' }}>{opt.text}</span>
                </motion.button>
              );
            })}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleNext} disabled={!selectedAnswers[currentQuestion]}
            style={{
              width: '100%', padding: '16px', fontWeight: 700, fontSize: '15px',
              background: selectedAnswers[currentQuestion] ? 'linear-gradient(135deg,#6C63FF,#00D4AA)' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: '14px', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: selectedAnswers[currentQuestion] ? 'pointer' : 'not-allowed',
              opacity: selectedAnswers[currentQuestion] ? 1 : 0.4,
              fontFamily: 'Plus Jakarta Sans, sans-serif', transition: 'all 0.2s ease',
            }}>
            {currentQuestion < questions.length - 1
              ? <> Next Question <ArrowRight size={18} /></>
              : <> Submit Quiz <Trophy size={18} /></>}
          </motion.button>
        </motion.div>
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Quiz;
