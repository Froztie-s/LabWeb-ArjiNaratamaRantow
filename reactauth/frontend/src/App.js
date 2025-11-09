import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MockDataBanner from './components/MockDataBanner';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import CourseDetailPage from './pages/CourseDetailPage';
import LecturerDashboard from './pages/LecturerDashboard';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import './App.css';

const LandingRedirect = () => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Navigate to={user.role === 'lecturer' ? '/dashboard/lecturer' : '/dashboard/student'} replace />;
};

const App = () => (
  <div className="app-shell">
    <MockDataBanner />
    <Routes>
      <Route path="/" element={<LandingRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/lecturer"
        element={
          <ProtectedRoute allowedRoles={['lecturer']}>
            <LecturerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute allowedRoles={['lecturer']}>
            <CourseDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </div>
);

export default App;
