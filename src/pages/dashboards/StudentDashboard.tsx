import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Clock, Award, BookOpen, Bell, TrendingUp, CheckCircle, XCircle, MinusCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const firstName = user?.email?.split('@')[0] || 'Student';

  const attendanceData = [
    { month: 'Jan', rate: 85 },
    { month: 'Feb', rate: 92 },
    { month: 'Mar', rate: 88 },
    { month: 'Apr', rate: 95 },
    { month: 'May', rate: 91 },
    { month: 'Jun', rate: 97 },
  ];

  const courses = [
    { name: 'Mathematics', code: 'MATH-201', grade: 'A', marks: 92, color: 'from-blue-500 to-indigo-600' },
    { name: 'Physics', code: 'PHY-101', grade: 'B+', marks: 84, color: 'from-purple-500 to-pink-500' },
    { name: 'Computer Science', code: 'CS-301', grade: 'A+', marks: 97, color: 'from-emerald-500 to-green-600' },
    { name: 'English Literature', code: 'ENG-101', grade: 'B', marks: 79, color: 'from-amber-500 to-orange-500' },
  ];

  const notifications = [
    { id: 1, text: 'New assignment posted in CS-301', time: '1 hr ago', type: 'info' },
    { id: 2, text: 'Math quiz results are available', time: '3 hrs ago', type: 'success' },
    { id: 3, text: 'Attendance warning: Physics below 75%', time: '1 day ago', type: 'warning' },
  ];

  const notifColors: Record<string, string> = {
    info: 'border-brand-primary/30 bg-brand-primary/10',
    success: 'border-success/30 bg-success/10',
    warning: 'border-warning/30 bg-warning/10',
  };
  const notifIcons: Record<string, React.ReactNode> = {
    info: <Bell size={14} className="text-brand-primary" />,
    success: <CheckCircle size={14} className="text-success" />,
    warning: <Bell size={14} className="text-warning" />,
  };



  const recentAttendance = [
    { date: 'Mon, Mar 24', subject: 'Mathematics', status: 'present' },
    { date: 'Mon, Mar 24', subject: 'Physics', status: 'absent' },
    { date: 'Tue, Mar 25', subject: 'CS-301', status: 'present' },
    { date: 'Wed, Mar 26', subject: 'English', status: 'leave' },
    { date: 'Thu, Mar 27', subject: 'Mathematics', status: 'present' },
  ];

  const statusConfig = {
    present: { icon: <CheckCircle size={16} className="text-success" />, label: 'Present', cls: 'bg-success/10 text-success' },
    absent: { icon: <XCircle size={16} className="text-danger" />, label: 'Absent', cls: 'bg-danger/10 text-danger' },
    leave: { icon: <MinusCircle size={16} className="text-warning" />, label: 'Leave', cls: 'bg-warning/10 text-warning' },
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Personal Header Card */}
      <div className="card glass-panel relative overflow-hidden p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-primary rounded-full filter blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/30 flex-shrink-0">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white capitalize">Welcome, {firstName} 👋</h1>
            <p className="text-text-secondary text-sm">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs px-2 py-1 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/30">Year 2</span>
              <span className="text-xs px-2 py-1 rounded-lg bg-white/5 text-text-secondary border border-white/10">Computer Science</span>
              <span className="text-xs px-2 py-1 rounded-lg bg-success/10 text-success border border-success/20">Active</span>
            </div>
          </div>
          <div className="text-center bg-white/5 rounded-2xl p-4 border border-white/10">
            <p className="text-3xl font-bold text-white">3.8</p>
            <p className="text-xs text-text-secondary mt-1">Current GPA</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance', value: '91%', icon: <Clock size={18} className="text-brand-primary" />, color: 'text-brand-primary' },
          { label: 'Courses', value: '4', icon: <BookOpen size={18} className="text-purple-400" />, color: 'text-purple-400' },
          { label: 'Best Grade', value: 'A+', icon: <Award size={18} className="text-warning" />, color: 'text-warning' },
          { label: 'Rank', value: '#12', icon: <TrendingUp size={18} className="text-success" />, color: 'text-success' },
        ].map((s) => (
          <div key={s.label} className="card glass text-center group cursor-default">
            <div className={`flex items-center justify-center mb-2 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-secondary mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 card glass p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Attendance Trend</h3>
              <p className="text-text-secondary text-xs mt-1">Monthly attendance percentage</p>
            </div>
            <span className="text-xs text-success bg-success/10 border border-success/20 px-2 py-1 rounded-lg font-medium">91% Avg</span>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[70, 100]} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                  formatter={(v) => [`${v}%`, 'Attendance']}
                />
                <Area type="monotone" dataKey="rate" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#attendanceGrad)" dot={{ fill: '#4F46E5', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Notifications */}
        <div className="card glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-white">Notifications</h3>
            <span className="w-5 h-5 rounded-full bg-danger flex items-center justify-center text-white text-xs font-bold">{notifications.length}</span>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className={`p-3 rounded-xl border ${notifColors[n.type]} transition-all hover:opacity-80`}>
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex-shrink-0">{notifIcons[n.type]}</div>
                  <div>
                    <p className="text-sm text-white font-medium leading-snug">{n.text}</p>
                    <p className="text-xs text-text-secondary mt-1">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enrolled Courses + Attendance Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Courses */}
        <div className="card glass p-6">
          <h3 className="text-base font-semibold text-white mb-5">Enrolled Courses</h3>
          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c.code} className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                  <BookOpen size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{c.name}</p>
                  <p className="text-xs text-text-secondary">{c.code}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-white">{c.grade}</p>
                  <p className="text-xs text-text-secondary">{c.marks}/100</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance Log */}
        <div className="card glass p-6">
          <h3 className="text-base font-semibold text-white mb-5">Recent Attendance</h3>
          <div className="space-y-3">
            {recentAttendance.map((entry, i) => {
              const cfg = statusConfig[entry.status as keyof typeof statusConfig];
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/5">
                  <div className="flex-shrink-0">{cfg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{entry.subject}</p>
                    <p className="text-xs text-text-secondary">{entry.date}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-lg ${cfg.cls}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
