import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Search, Save, BookOpen, Award, TrendingUp, ChevronDown,
  CheckCircle, AlertCircle, Loader2, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';
import { SkeletonCard } from '../components/ui/Skeleton';

/* ---------- Shared helpers ---------- */
const SUBJECTS = ['Mathematics', 'Physics', 'Computer Science', 'English Literature', 'Chemistry', 'Biology'];

const letterGrade = (score: number) => {
  if (score >= 90) return { letter: 'A+', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 85) return { letter: 'A', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  if (score >= 80) return { letter: 'B+', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
  if (score >= 75) return { letter: 'B', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
  if (score >= 70) return { letter: 'C+', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
  if (score >= 60) return { letter: 'C', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
  if (score >= 50) return { letter: 'D', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' };
  return { letter: 'F', color: 'text-danger', bg: 'bg-danger/10 border-danger/20' };
};

/* ---------- Teacher Grade Entry ---------- */
const demoGradeRows = [
  { id: '1', name: 'Alice Johnson', email: 'alice@sis.edu', midterm: 88, final: 92 },
  { id: '2', name: 'Bob Smith', email: 'bob@sis.edu', midterm: 76, final: 0 },
  { id: '3', name: 'Carol Davis', email: 'carol@sis.edu', midterm: 95, final: 98 },
  { id: '4', name: 'David Wilson', email: 'david@sis.edu', midterm: 62, final: 68 },
  { id: '5', name: 'Emma Thompson', email: 'emma@sis.edu', midterm: 84, final: 89 },
];

const TeacherGrades = () => {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(demoGradeRows);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Try to load from Supabase; fall back to demo data on error
  useEffect(() => {
    supabase.from('students').select('id, name, email').order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRows(data.map((s: any) => ({ ...s, midterm: 0, final: 0 })));
        }
      })
      .catch(() => { /* keep demo */ });
  }, [subject]);

  const updateScore = (id: string, field: 'midterm' | 'final', val: number) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: Math.min(100, Math.max(0, val)) } : r));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = rows.map(r => ({
        student_id: r.id,
        subject,
        marks: Math.round((r.midterm * 0.4) + (r.final * 0.6)),
        grade: letterGrade(Math.round((r.midterm * 0.4) + (r.final * 0.6))).letter,
      }));
      const { error } = await supabase.from('grades').upsert(payload, { onConflict: 'student_id,subject' });
      if (error) throw error;
      setToast({ message: 'Grades saved successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err?.message || 'Grades saved locally (no backend).', type: 'info' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const classAvg = filtered.length
    ? Math.round(filtered.reduce((a, r) => a + (r.midterm * 0.4 + r.final * 0.6), 0) / filtered.length)
    : 0;

  const chartData = SUBJECTS.slice(0, 5).map((s, i) => ({
    name: s.split(' ')[0], avg: [78, 84, 91, 73, 88][i]
  }));

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Grade Management</h1>
          <p className="text-text-secondary text-sm mt-1">Enter and publish student grades per subject</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary flex items-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Grades'}
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Class Average', value: `${classAvg}%`, icon: <BarChart2 size={18} className="text-brand-primary" />, color: 'text-brand-primary' },
          { label: 'Top Grade', value: 'A+', icon: <Award size={18} className="text-warning" />, color: 'text-warning' },
          { label: 'Students', value: `${filtered.length}`, icon: <BookOpen size={18} className="text-purple-400" />, color: 'text-purple-400' },
          { label: 'Pass Rate', value: `${Math.round(filtered.filter(r => (r.midterm * 0.4 + r.final * 0.6) >= 50).length / (filtered.length || 1) * 100)}%`, icon: <TrendingUp size={18} className="text-success" />, color: 'text-success' },
        ].map(s => (
          <div key={s.label} className="card glass text-center cursor-default">
            <div className={`flex items-center justify-center mb-1 ${s.color}`}>{s.icon}</div>
            <p className={`text-xl font-bold text-white`}>{s.value}</p>
            <p className="text-xs text-text-secondary mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Table side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Subject Avg Chart */}
        <div className="card glass p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Subject Averages</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[60, 100]} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff' }}
                  formatter={(v) => [`${v}%`, 'Average']}
                />
                <Bar dataKey="avg" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Input Table */}
        <div className="lg:col-span-2 card glass overflow-hidden p-0">
          {/* Table Controls */}
          <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                className="input-field pl-9 py-2 text-sm" placeholder="Search student..." />
            </div>
            <div className="relative">
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="input-field py-2 text-sm pr-8 appearance-none cursor-pointer">
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3.5 text-xs text-text-secondary uppercase tracking-wider font-medium">Student</th>
                  <th className="text-center px-4 py-3.5 text-xs text-text-secondary uppercase tracking-wider font-medium">Midterm (40%)</th>
                  <th className="text-center px-4 py-3.5 text-xs text-text-secondary uppercase tracking-wider font-medium">Final (60%)</th>
                  <th className="text-center px-4 py-3.5 text-xs text-text-secondary uppercase tracking-wider font-medium">Grade</th>
                  <th className="text-center px-4 py-3.5 text-xs text-text-secondary uppercase tracking-wider font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const total = Math.round(r.midterm * 0.4 + r.final * 0.6);
                  const g = letterGrade(total);
                  const published = r.final > 0 && r.midterm > 0;
                  return (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">{r.name}</p>
                            <p className="text-xs text-text-secondary">{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <input type="number" min={0} max={100} value={r.midterm || ''}
                          onChange={e => updateScore(r.id, 'midterm', Number(e.target.value))}
                          className="w-16 bg-slate-900/70 border border-white/10 rounded-lg py-1.5 text-center text-white text-sm focus:outline-none focus:border-brand-primary/50 transition-colors" />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <input type="number" min={0} max={100} value={r.final || ''}
                          onChange={e => updateScore(r.id, 'final', Number(e.target.value))}
                          placeholder="--"
                          className="w-16 bg-slate-900/70 border border-white/10 rounded-lg py-1.5 text-center text-white text-sm focus:outline-none focus:border-brand-primary/50 transition-colors placeholder-slate-600" />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-base font-bold ${g.color}`}>{published ? g.letter : '–'}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {published ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-success/10 text-success border border-success/20">
                            <CheckCircle size={12} /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-warning/10 text-warning border border-warning/20">
                            <AlertCircle size={12} /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/5 bg-white/[0.01]">
            <span className="text-xs text-text-secondary">
              Class Average: <span className="font-bold text-white">{classAvg}%</span>
            </span>
            <button onClick={handleSave} className="btn btn-primary text-sm py-2">
              Publish All Grades
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- Student Report Card ---------- */
const studentGradeData = [
  { subject: 'Mathematics', code: 'MATH-201', midterm: 88, final: 92, credits: 4, color: 'from-blue-500 to-indigo-600' },
  { subject: 'Physics', code: 'PHY-101', midterm: 74, final: 82, credits: 3, color: 'from-purple-500 to-pink-500' },
  { subject: 'Computer Science', code: 'CS-301', midterm: 95, final: 98, credits: 4, color: 'from-emerald-500 to-green-600' },
  { subject: 'English Literature', code: 'ENG-101', midterm: 72, final: 78, credits: 2, color: 'from-amber-500 to-orange-500' },
];

const StudentGrades = () => {
  const { user } = useAuth();
  const [dbGrades, setDbGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('grades').select('*').order('subject')
      .then(({ data }) => { if (data && data.length > 0) setDbGrades(data); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const grades = dbGrades.length > 0
    ? dbGrades.map(g => ({ subject: g.subject, code: g.subject, midterm: g.marks, final: g.marks, credits: 3, color: 'from-brand-primary to-purple-600' }))
    : studentGradeData;

  const gpa = grades.length
    ? (grades.reduce((a, g) => {
      const score = g.midterm * 0.4 + g.final * 0.6;
      const pts = score >= 90 ? 4.0 : score >= 80 ? 3.5 : score >= 70 ? 3.0 : score >= 60 ? 2.5 : score >= 50 ? 2.0 : 0;
      return a + pts * g.credits;
    }, 0) / grades.reduce((a, g) => a + g.credits, 0)).toFixed(2)
    : '0.00';

  const chartData = grades.map(g => ({
    name: g.subject.split(' ')[0],
    midterm: g.midterm,
    final: g.final,
    overall: Math.round(g.midterm * 0.4 + g.final * 0.6),
  }));

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">My Grades</h1>
        <p className="text-text-secondary text-sm mt-1">Your academic performance report</p>
      </div>

      {/* GPA Banner */}
      <div className="card glass-panel relative overflow-hidden p-6">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-primary rounded-full filter blur-[100px] opacity-10 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-text-secondary text-sm">Current GPA</p>
            <p className="text-5xl font-bold text-white mt-1">{gpa}</p>
            <p className="text-xs text-text-secondary mt-2">Based on {grades.reduce((a, g) => a + g.credits, 0)} credit hours</p>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { label: 'Best Grade', value: 'A+', color: 'text-success' },
              { label: 'Subjects', value: `${grades.length}`, color: 'text-brand-primary' },
              { label: 'Rank', value: '#12', color: 'text-warning' },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-text-secondary mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card glass p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Performance by Subject</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[50, 100]} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
              />
              <Bar dataKey="midterm" name="Midterm" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="final" name="Final" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grades.map((g, i) => {
            const total = Math.round(g.midterm * 0.4 + g.final * 0.6);
            const grade = letterGrade(total);
            return (
              <div key={i} className="card glass overflow-hidden group hover:border-white/15 transition-all">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${g.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{g.subject}</p>
                    <p className="text-xs text-text-secondary">{g.code} · {g.credits} Credits</p>
                  </div>
                  <span className={`text-2xl font-black ${grade.color}`}>{grade.letter}</span>
                </div>

                {/* Score bars */}
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Midterm</span>
                      <span className="text-white font-medium">{g.midterm}/100</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary rounded-full transition-all duration-700"
                        style={{ width: `${g.midterm}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Final</span>
                      <span className="text-white font-medium">{g.final}/100</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all duration-700"
                        style={{ width: `${g.final}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Overall Score</span>
                  <span className={`text-sm font-bold ${grade.color}`}>{total}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ---------- Route by role ---------- */
const Grades: React.FC = () => {
  const { userRole } = useAuth();
  return userRole === 'teacher' ? <TeacherGrades /> : <StudentGrades />;
};

export default Grades;
