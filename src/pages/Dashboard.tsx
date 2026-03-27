import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

const Dashboard: React.FC = () => {
  const { userRole } = useAuth();
  return userRole === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />;
};

export default Dashboard;
