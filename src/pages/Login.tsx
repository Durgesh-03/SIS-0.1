import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Mail, CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [signupDone, setSignupDone] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsUnconfirmed(false);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // Detect "Email not confirmed" specifically
          if (
            signInError.message.toLowerCase().includes('email not confirmed') ||
            signInError.message.toLowerCase().includes('email_not_confirmed')
          ) {
            setIsUnconfirmed(true);
            return;
          }
          throw signInError;
        }
        navigate('/');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { role } }
        });
        if (signUpError) throw signUpError;
        // Show "check your email" after signup
        setSignupDone(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResendLoading(true);
    try {
      await supabase.auth.resend({ type: 'signup', email });
      setResendSent(true);
    } catch {
      // silent
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden p-4">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-primary rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md glass-panel card shadow-2xl relative z-10 animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-purple-500 mb-4 shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">SIS Pro</h1>
          <p className="text-text-secondary mt-2">{isLogin ? 'Sign in to your account' : 'Create a new account'}</p>
        </div>

        {/* Sign-up success */}
        {signupDone ? (
          <div className="text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email!</h2>
            <p className="text-text-secondary text-sm mb-6">
              We've sent a confirmation link to <span className="text-white font-medium">{email}</span>.<br />
              Click the link to verify your account, then come back to log in.
            </p>
            <button
              onClick={() => { setSignupDone(false); setIsLogin(true); setError(''); }}
              className="btn btn-primary w-full py-3"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <>
            {/* Generic error */}
            {error && !isUnconfirmed && (
              <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center animate-fade-in">
                {error}
              </div>
            )}

            {/* Email not confirmed banner */}
            {isUnconfirmed && (
              <div className="mb-5 p-4 rounded-xl bg-warning/10 border border-warning/20 animate-fade-in">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-warning font-semibold text-sm">Email not confirmed</p>
                    <p className="text-warning/80 text-xs mt-1">
                      Please verify your email address first. Check your inbox for a confirmation link.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  {resendSent ? (
                    <div className="flex items-center gap-2 text-success text-xs">
                      <CheckCircle size={14} />
                      Confirmation email resent! Check your inbox.
                    </div>
                  ) : (
                    <button
                      onClick={handleResendConfirmation}
                      disabled={resendLoading}
                      className="w-full py-2 px-4 text-xs font-medium bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30 rounded-lg transition-colors"
                    >
                      {resendLoading ? 'Sending...' : '📨 Resend Confirmation Email'}
                    </button>
                  )}
                  <p className="text-xs text-text-secondary text-center">
                    Or disable email confirmation in{' '}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-primary underline"
                    >
                      Supabase Dashboard → Auth → Settings
                    </a>
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {/* Role Selection (Sign Up only) */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3 mb-2">
                  {(['student', 'teacher'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                        role === r
                          ? 'bg-brand-primary/20 border-brand-primary text-white shadow-inner shadow-brand-primary/20'
                          : 'bg-slate-900/50 border-slate-700 text-text-secondary hover:bg-slate-800'
                      }`}
                    >
                      {r === 'student' ? <GraduationCap className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                      <span className="text-sm font-medium capitalize">{r}</span>
                    </button>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@university.edu"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-text-secondary">Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-sm text-brand-primary hover:text-indigo-400 transition-colors">
                      Forgot Password?
                    </Link>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3.5 mt-2"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-7 text-center text-sm text-text-secondary">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(''); setIsUnconfirmed(false); }}
                className="text-brand-primary font-medium hover:text-indigo-400 transition-colors ml-1"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
