import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/StudentManagement';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: ('student' | 'teacher')[] }) => {
  const { user, userRole, loading, demoMode } = useAuth();
  if (loading) return null;

  // In demo mode, always allow access (demo user is always logged in)
  if (!demoMode && !user) return <Navigate to="/login" replace />;
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

function AppRoutes() {
  const { user, demoMode, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      {/* In demo mode, login/forgot-password redirect to dashboard directly */}
      <Route path="/login" element={user || demoMode ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/forgot-password" element={demoMode ? <Navigate to="/" replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={demoMode ? <Navigate to="/" replace /> : <ResetPassword />} />

      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="students" element={<ProtectedRoute allowedRoles={['teacher']}><StudentManagement /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['teacher']}><div className="p-8 text-text-secondary">Reports coming soon…</div></ProtectedRoute>} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="grades" element={<Grades />} />
        <Route path="profile" element={<ProtectedRoute allowedRoles={['student']}><div className="p-8 text-text-secondary">Profile page coming soon…</div></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
