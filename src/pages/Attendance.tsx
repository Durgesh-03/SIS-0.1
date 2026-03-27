import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, XCircle, MinusCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const COURSES = ['CS-101', 'CS-201', 'CS-301', 'MATH-101', 'PHY-101', 'ENG-101'];
type AttendanceStatus = 'present' | 'absent' | 'leave';

const Attendance: React.FC = () => {
  const { userRole, user } = useAuth();

  // Teacher state
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Student state
  const [studentRecord, setStudentRecord] = useState<any[]>([]);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentPage, setStudentPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (userRole === 'teacher') {
      loadStudents();
    } else {
      loadStudentAttendance();
    }
  }, [userRole, selectedCourse, selectedDate, user]);

  const loadStudents = async () => {
    setLoadingStudents(true);
    const { data } = await supabase.from('students').select('id, name').order('name');
    setStudents(data || demoStudents);
    // Load existing attendance for the date/course
    const { data: existing } = await supabase.from('attendance')
      .select('student_id, status')
      .eq('date', selectedDate);
    const map: Record<string, AttendanceStatus> = {};
    (existing || []).forEach((r: any) => { map[r.student_id] = r.status; });
    setAttendance(map);
    setLoadingStudents(false);
  };

  const loadStudentAttendance = async () => {
    setStudentLoading(true);
    const { data } = await supabase.from('attendance')
      .select('*, students(name)')
      .order('date', { ascending: false });
    setStudentRecord(data || demoAttendanceRecords);
    setStudentLoading(false);
  };

  const setStatus = (id: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const rows = Object.entries(attendance).map(([student_id, status]) => ({
        student_id, date: selectedDate, status
      }));
      const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'student_id,date' });
      if (error) throw error;
      setToast({ message: 'Attendance saved successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to save attendance.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const statusConfig = {
    present: { icon: <CheckCircle size={16} className="text-success" />, label: 'P', color: 'bg-success/20 border-success/30 text-success' },
    absent: { icon: <XCircle size={16} className="text-danger" />, label: 'A', color: 'bg-danger/20 border-danger/30 text-danger' },
    leave: { icon: <MinusCircle size={16} className="text-warning" />, label: 'L', color: 'bg-warning/20 border-warning/30 text-warning' },
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;
  const leaveCount = Object.values(attendance).filter(s => s === 'leave').length;
  const total = students.length || 1;

  // ---- TEACHER VIEW ----
  if (userRole === 'teacher') {
    return (
      <div className="space-y-6 pb-8 animate-fade-in">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Mark Attendance</h1>
            <p className="text-text-secondary text-sm mt-1">Record daily attendance for your students</p>
          </div>
          <button onClick={handleSaveAttendance} disabled={saving} className="btn btn-primary flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        {/* Course & Date Pickers */}
        <div className="card glass p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="input-field text-sm py-2.5">
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field text-sm py-2.5" max={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card glass text-center border-success/20">
            <p className="text-2xl font-bold text-success">{presentCount}</p>
            <p className="text-xs text-text-secondary mt-1">Present</p>
            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full transition-all" style={{ width: `${(presentCount / total) * 100}%` }}></div>
            </div>
          </div>
          <div className="card glass text-center border-danger/20">
            <p className="text-2xl font-bold text-danger">{absentCount}</p>
            <p className="text-xs text-text-secondary mt-1">Absent</p>
            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-danger rounded-full transition-all" style={{ width: `${(absentCount / total) * 100}%` }}></div>
            </div>
          </div>
          <div className="card glass text-center border-warning/20">
            <p className="text-2xl font-bold text-warning">{leaveCount}</p>
            <p className="text-xs text-text-secondary mt-1">On Leave</p>
            <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${(leaveCount / total) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Student attendance list */}
        <div className="card glass overflow-hidden p-0">
          {loadingStudents ? (
            <div className="p-8"><SkeletonRow rows={5} /></div>
          ) : students.length === 0 ? (
            <div className="p-12"><EmptyState title="No Students" description="Add students first to mark attendance." /></div>
          ) : (
            <div className="divide-y divide-white/5">
              {students.map((s: any) => {
                const status = attendance[s.id] || 'present';
                return (
                  <div key={s.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{s.name}</p>
                        <p className="text-xs text-text-secondary">{s.id?.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(['present', 'absent', 'leave'] as AttendanceStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatus(s.id, st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${status === st ? statusConfig[st].color : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'}`}
                        >
                          {statusConfig[st].label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- STUDENT VIEW ----
  const pagedRecords = studentRecord.slice(studentPage * PAGE_SIZE, (studentPage + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(studentRecord.length / PAGE_SIZE);
  const presentPct = studentRecord.length
    ? Math.round((studentRecord.filter(r => r.status === 'present').length / studentRecord.length) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Student header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Attendance</h1>
        <p className="text-text-secondary text-sm mt-1">Track your attendance record</p>
      </div>

      {/* Attendance summary banner */}
      <div className="card glass-panel relative overflow-hidden p-6">
        <div className="absolute right-0 top-0 w-48 h-48 bg-brand-primary rounded-full filter blur-[80px] opacity-10 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-text-secondary text-sm mb-1">Overall Attendance</p>
            <p className="text-4xl font-bold text-white">{presentPct}%</p>
            <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden w-full max-w-xs">
              <div
                className={`h-full rounded-full transition-all duration-700 ${presentPct >= 75 ? 'bg-success' : 'bg-danger'}`}
                style={{ width: `${presentPct}%` }}
              ></div>
            </div>
            <p className={`text-xs mt-1 ${presentPct >= 75 ? 'text-success' : 'text-danger'}`}>
              {presentPct >= 75 ? '✓ Above required threshold' : '⚠ Below 75% required attendance!'}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Present', count: studentRecord.filter(r => r.status === 'present').length, color: 'text-success' },
              { label: 'Absent', count: studentRecord.filter(r => r.status === 'absent').length, color: 'text-danger' },
              { label: 'Leave', count: studentRecord.filter(r => r.status === 'leave').length, color: 'text-warning' },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-xs text-text-secondary">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Log */}
      <div className="card glass overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-base font-semibold text-white">Attendance Log</h3>
        </div>
        {studentLoading ? (
          <div className="p-8"><SkeletonRow rows={5} /></div>
        ) : studentRecord.length === 0 ? (
          <div className="p-12"><EmptyState title="No Records Found" description="Your attendance records will appear here once classes are marked." /></div>
        ) : (
          <>
            <div className="divide-y divide-white/5">
              {pagedRecords.map((r: any, i: number) => {
                const cfg = statusConfig[r.status as AttendanceStatus];
                return (
                  <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">{r.date || '—'}</p>
                      <p className="text-xs text-text-secondary">{r.students?.name || 'Your Record'}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${cfg.color}`}>
                      {cfg.icon}
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
                <p className="text-xs text-text-secondary">Page {studentPage + 1} of {totalPages}</p>
                <div className="flex gap-2">
                  <button disabled={studentPage === 0} onClick={() => setStudentPage(p => p - 1)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary disabled:opacity-30">
                    <ChevronLeft size={16} />
                  </button>
                  <button disabled={studentPage === totalPages - 1} onClick={() => setStudentPage(p => p + 1)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary disabled:opacity-30">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Demo data fallbacks
const demoStudents = [
  { id: 'demo-1', name: 'Alice Johnson' },
  { id: 'demo-2', name: 'Bob Smith' },
  { id: 'demo-3', name: 'Carol Davis' },
  { id: 'demo-4', name: 'David Wilson' },
  { id: 'demo-5', name: 'Emma Thompson' },
];
const demoAttendanceRecords = [
  { date: '2026-03-27', status: 'present', students: { name: 'Self' } },
  { date: '2026-03-26', status: 'present', students: { name: 'Self' } },
  { date: '2026-03-25', status: 'absent', students: { name: 'Self' } },
  { date: '2026-03-24', status: 'leave', students: { name: 'Self' } },
  { date: '2026-03-21', status: 'present', students: { name: 'Self' } },
];

export default Attendance;
