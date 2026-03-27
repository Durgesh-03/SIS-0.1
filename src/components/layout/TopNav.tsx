import React, { useState } from 'react';
import { Search, Bell, GraduationCap, ShieldCheck, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TopNav: React.FC = () => {
  const { user, userRole, demoMode, setDemoRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleRoleSwitch = (role: 'student' | 'teacher') => {
    setDemoRole(role);
    setShowRoleMenu(false);
  };

  return (
    <>
      {/* Demo mode notice bar */}
      {demoMode && (
        <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex items-center justify-between text-xs text-warning">
          <span>⚡ <strong>Demo Mode</strong> — No Supabase connected. Add your credentials to <code className="bg-black/20 px-1 rounded">.env.local</code> to use a real backend.</span>
          <div className="relative flex-shrink-0 ml-4">
            <button
              onClick={() => setShowRoleMenu(v => !v)}
              className="flex items-center gap-1.5 bg-warning/10 border border-warning/30 rounded-lg px-3 py-1 hover:bg-warning/20 transition-colors"
            >
              {userRole === 'teacher'
                ? <ShieldCheck size={12} className="text-warning" />
                : <GraduationCap size={12} className="text-warning" />}
              <span className="capitalize">{userRole || 'none'}</span>
              <ChevronDown size={12} />
            </button>
            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 glass-panel card !p-2 shadow-xl z-50 animate-slide-up">
                <p className="text-xs text-text-secondary px-2 py-1 mb-1 font-medium">Switch Demo Role</p>
                {(['teacher', 'student'] as const).map(r => (
                  <button key={r} onClick={() => handleRoleSwitch(r)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${userRole === r ? 'bg-brand-primary/20 text-brand-primary' : 'text-text-secondary hover:bg-white/5 hover:text-white'}`}>
                    {r === 'teacher' ? <ShieldCheck size={14} /> : <GraduationCap size={14} />}
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <header className="h-16 flex items-center justify-between px-6 z-10 sticky top-0 bg-bg-primary/80 backdrop-blur-xl border-b border-border-color">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-800/50 border border-slate-700/50 text-white pl-9 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button className="relative p-2 text-text-secondary hover:text-white transition-colors rounded-xl hover:bg-white/5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-bg-primary"></span>
          </button>

          {/* User info pill */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-white leading-none">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-brand-primary capitalize mt-0.5">{userRole || 'Guest'}</p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNav;
