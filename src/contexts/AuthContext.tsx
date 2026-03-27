import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isDemoMode } from '../lib/supabase';

export type UserRole = 'student' | 'teacher' | null;

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  loading: boolean;
  demoMode: boolean;
  setDemoRole: (role: UserRole) => void; // allow switching role in demo
};

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, userRole: null, loading: true, demoMode: false,
  setDemoRole: () => {}
});

// A fake "demo" user object that looks like a real Supabase User
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@sis.edu',
  user_metadata: { role: 'teacher' },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as unknown as User;

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  // In demo mode, auto-login with a demo teacher account
  useEffect(() => {
    if (isDemoMode) {
      setUser(DEMO_USER);
      setUserRole('teacher');
      setLoading(false);
      return;
    }

    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) console.error('Supabase getSession error:', error);
        setSession(session);
        setUser(session?.user ?? null);
        setUserRole((session?.user?.user_metadata?.role as UserRole) || null);
      })
      .catch((err) => console.error('Failed to get session:', err))
      .finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setUserRole((session?.user?.user_metadata?.role as UserRole) || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Demo mode: allow toggling role without auth
  const setDemoRole = (role: UserRole) => {
    if (!isDemoMode) return;
    setUserRole(role);
    setUser({ ...DEMO_USER, user_metadata: { role }, email: role === 'teacher' ? 'teacher@sis.edu' : 'student@sis.edu' } as unknown as User);
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, loading, demoMode: isDemoMode, setDemoRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
