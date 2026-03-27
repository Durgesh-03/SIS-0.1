import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Loader2, Users } from 'lucide-react';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';
import { SkeletonRow } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  year: number;
}

const DEPARTMENTS = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'English', 'Biology', 'Economics'];
const YEARS = [1, 2, 3, 4];
const PAGE_SIZE = 8;

const StudentManagement: React.FC = () => {
  const { userRole } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', department: '', year: 1 });
  const [saving, setSaving] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let query = supabase.from('students').select('*', { count: 'exact' });
      if (search) query = query.ilike('name', `%${search}%`);
      if (deptFilter) query = query.eq('department', deptFilter);
      if (yearFilter) query = query.eq('year', Number(yearFilter));
      query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1).order('name');

      const { data, count, error } = await query;
      if (error) throw error;
      setStudents(data || []);
      setTotalCount(count || 0);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [search, deptFilter, yearFilter, page]);

  const openAdd = () => {
    setEditingStudent(null);
    setForm({ name: '', email: '', department: '', year: 1 });
    setIsModalOpen(true);
  };
  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setForm({ name: s.name, email: s.email, department: s.department, year: s.year });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStudent) {
        const { error } = await supabase.from('students').update(form).eq('id', editingStudent.id);
        if (error) throw error;
        setToast({ message: 'Student updated successfully!', type: 'success' });
      } else {
        const { error } = await supabase.from('students').insert(form);
        if (error) throw error;
        setToast({ message: 'Student added successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setToast({ message: err.message || 'Error saving student.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      setToast({ message: 'Student deleted.', type: 'success' });
      fetchStudents();
    } catch (err: any) {
      setToast({ message: err.message || 'Error deleting student.', type: 'error' });
    } finally {
      setDeleting(null);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const yearColors: Record<number, string> = {
    1: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    2: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    3: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    4: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  if (userRole !== 'teacher') {
    return (
      <div className="flex items-center justify-center h-64">
        <EmptyState title="Access Restricted" description="Only faculty members can manage students." icon={<Users className="w-12 h-12 text-slate-600" />} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Management</h1>
          <p className="text-text-secondary text-sm mt-1">{totalCount} students enrolled</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card glass p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="input-field pl-9 py-2.5 text-sm" placeholder="Search students..." />
        </div>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(0); }}
          className="input-field py-2.5 text-sm w-full sm:w-auto">
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(0); }}
          className="input-field py-2.5 text-sm w-full sm:w-auto">
          <option value="">All Years</option>
          {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card glass overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-xs text-text-secondary uppercase tracking-wider font-medium">Student</th>
                <th className="text-left px-6 py-4 text-xs text-text-secondary uppercase tracking-wider font-medium hidden md:table-cell">Department</th>
                <th className="text-left px-6 py-4 text-xs text-text-secondary uppercase tracking-wider font-medium hidden lg:table-cell">Year</th>
                <th className="text-right px-6 py-4 text-xs text-text-secondary uppercase tracking-wider font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-8"><SkeletonRow rows={5} /></td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={4} className="p-12">
                  <EmptyState title="No Students Found" description="Try adjusting your search or filters, or add a new student."
                    action={<button onClick={openAdd} className="btn btn-primary">Add Student</button>} />
                </td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{s.name}</p>
                          <p className="text-xs text-text-secondary">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary hidden md:table-cell">{s.department}</td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg border ${yearColors[s.year] || 'bg-white/5 text-text-secondary'}`}>
                        Year {s.year}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                          className="p-2 rounded-lg hover:bg-danger/10 text-text-secondary hover:text-danger transition-colors">
                          {deleting === s.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-xs text-text-secondary">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white disabled:opacity-30 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-white px-2">{page + 1} / {totalPages}</span>
              <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white disabled:opacity-30 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="glass-panel card w-full max-w-md mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-text-secondary hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Full Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Email Address</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field" placeholder="john@university.edu" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Department</label>
                <select required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="input-field">
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">Year</label>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  className="input-field">
                  {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                  {saving ? 'Saving...' : editingStudent ? 'Update' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
