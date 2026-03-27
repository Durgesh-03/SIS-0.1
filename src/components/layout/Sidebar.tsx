import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, GraduationCap, LogOut, FileText, UserCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const Sidebar: React.FC = () => {
  const { user, userRole } = useAuth();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = userRole === 'teacher' 
    ? [
        { to: "/", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/students", icon: Users, label: "Students" },
        { to: "/attendance", icon: Clock, label: "Attendance" },
        { to: "/grades", icon: GraduationCap, label: "Grades" },
        { to: "/reports", icon: FileText, label: "Reports" }
      ]
    : [
        { to: "/", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/attendance", icon: Clock, label: "My Attendance" },
        { to: "/grades", icon: GraduationCap, label: "My Grades" },
        { to: "/profile", icon: UserCircle, label: "Profile" }
      ];

  const roleLabel = userRole === 'teacher' ? 'Faculty Member' : 'Student';

  return (
    <aside className="w-64 border-r border-border-color bg-bg-secondary flex flex-col z-20 shadow-2xl overflow-hidden glass rounded-r-2xl m-2 my-4">
      <div className="p-6 pb-2 border-b border-white/5 flex items-center space-x-3">
        <div className="bg-gradient-to-tr from-brand-primary to-indigo-400 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">SIS Pro</span>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/30" 
                  : "text-text-secondary hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-color">
        <div className="flex items-center p-3 mb-3 bg-white/5 rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.email || 'user@sis.edu'}</p>
            <p className="text-xs text-brand-primary capitalize">{roleLabel}</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-2.5 text-danger hover:bg-danger/10 rounded-xl transition-all group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
