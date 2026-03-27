import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, GraduationCap, Clock, TrendingUp, MoreVertical, BookOpen,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { supabase } from '../../lib/supabase';

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.FC<any>;
  color: string;
  bg: string;
}> = ({ title, value, change, isPositive, icon: Icon, color, bg }) => (
  <div className="card glass relative overflow-hidden group cursor-default">
    <div className={`absolute -right-8 -top-8 w-32 h-32 ${bg} rounded-full filter blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color} shadow-lg`}>
        <Icon size={22} className="opacity-90" />
      </div>
    </div>
    <div className="flex items-center text-sm mt-4 pt-3 border-t border-white/5">
      <span className={`inline-flex items-center gap-1 font-semibold px-2 py-1 rounded-lg text-xs ${isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
        {isPositive ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
        {change}
      </span>
      <span className="text-text-secondary ml-2 text-xs">vs last month</span>
    </div>
  </div>
);

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { count } = await supabase.from('students').select('*', { count: 'exact', head: true });
        setStudentCount(count || 0);
      } catch (err) {
        setStudentCount(156);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const attendanceData = [
    { name: 'Mon', present: 95, absent: 5 },
    { name: 'Tue', present: 92, absent: 8 },
    { name: 'Wed', present: 98, absent: 2 },
    { name: 'Thu', present: 99, absent: 1 },
    { name: 'Fri', present: 90, absent: 10 },
  ];

  const performanceData = [
    { month: 'Jan', avgGrade: 72 },
    { month: 'Feb', avgGrade: 78 },
    { month: 'Mar', avgGrade: 76 },
    { month: 'Apr', avgGrade: 83 },
    { month: 'May', avgGrade: 88 },
    { month: 'Jun', avgGrade: 91 },
  ];

  const gradeDistribution = [
    { name: 'A', value: 35, color: '#22C55E' },
    { name: 'B', value: 30, color: '#4F46E5' },
    { name: 'C', value: 20, color: '#F59E0B' },
    { name: 'D', value: 10, color: '#EF4444' },
    { name: 'F', value: 5, color: '#64748b' },
  ];

  const recentActivities = [
    { id: 1, text: "Alice Johnson submitted Math assignment", time: "30 min ago", color: "bg-brand-primary" },
    { id: 2, text: "Physics semester grades uploaded", time: "2 hours ago", color: "bg-success" },
    { id: 3, text: "Bob Smith marked absent in CS-101", time: "4 hours ago", color: "bg-danger" },
    { id: 4, text: "New student Carol Davis enrolled", time: "1 day ago", color: "bg-warning" },
  ];

  const firstName = user?.email?.split('@')[0] || 'Professor';

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, <span className="text-brand-primary capitalize">{firstName}</span> 👋
          </h1>
          <p className="text-text-secondary mt-1 text-sm">Here's what's happening in your institution today.</p>
        </div>
        <button className="btn btn-primary group flex items-center space-x-2">
          <TrendingUp size={16} />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={loading ? "..." : studentCount > 0 ? studentCount.toString() : "156"}
          change="3.2%" isPositive={true} icon={Users} color="text-brand-primary" bg="bg-indigo-600" />
        <StatCard title="Avg Attendance" value="94.2%" change="1.1%" isPositive={true}
          icon={Clock} color="text-success" bg="bg-green-600" />
        <StatCard title="Overall Grade" value="B+" change="0.5 pts" isPositive={true}
          icon={GraduationCap} color="text-warning" bg="bg-yellow-600" />
        <StatCard title="Active Courses" value="12" change="2 new" isPositive={true}
          icon={BookOpen} color="text-purple-400" bg="bg-purple-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance Bar Chart */}
        <div className="lg:col-span-2 card glass p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Weekly Attendance</h3>
              <p className="text-text-secondary text-xs mt-1">Present vs Absent rates</p>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-xl text-text-secondary transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
                <Bar dataKey="present" name="Present %" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={28} />
                <Bar dataKey="absent" name="Absent %" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Pie */}
        <div className="card glass p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Grade Distribution</h3>
              <p className="text-text-secondary text-xs mt-1">Current semester</p>
            </div>
          </div>
          <div className="h-[180px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gradeDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {gradeDistribution.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {gradeDistribution.map((g) => (
              <div key={g.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: g.color }}></div>
                  <span className="text-text-secondary">Grade {g.name}</span>
                </div>
                <span className="font-semibold text-white">{g.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Trend + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card glass p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Performance Trend</h3>
              <p className="text-text-secondary text-xs mt-1">Average grade over time</p>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[60, 100]} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="avgGrade" name="Avg Grade" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorGrade)" dot={{ fill: '#4F46E5', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card glass p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-white">Recent Activity</h3>
            <span className="text-xs text-text-secondary bg-white/5 px-2 py-1 rounded-lg">Today</span>
          </div>
          <div className="space-y-4">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 group">
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${a.color}`}></div>
                <div className="flex-1 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors">
                  <p className="text-sm text-white font-medium">{a.text}</p>
                  <span className="text-xs text-text-secondary mt-0.5 block">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
