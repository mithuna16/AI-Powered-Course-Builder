import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import CourseViewer from './pages/CourseViewer';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/" element={<PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><MainLayout><History /></MainLayout></PrivateRoute>} />
          <Route path="/course/:id" element={<PrivateRoute><MainLayout><CourseViewer /></MainLayout></PrivateRoute>} />
          <Route path="/quiz" element={<PrivateRoute><MainLayout><Quiz /></MainLayout></PrivateRoute>} />
          <Route path="/analytics" element={<PrivateRoute><MainLayout><Analytics /></MainLayout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;