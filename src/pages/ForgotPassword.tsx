import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
      
      <div className="w-full max-w-md glass-panel card shadow-2xl relative z-10 animate-slide-up">
        
        <Link to="/login" className="inline-flex items-center text-text-secondary hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Link>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-purple-500 mb-4 shadow-lg shadow-indigo-500/30">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Recover Password</h1>
          <p className="text-text-secondary mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center animate-fade-in">
            {error}
          </div>
        )}

        {success ? (
          <div className="mb-6 p-6 rounded-xl bg-success/10 border border-success/20 text-center animate-fade-in">
            <Mail className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">Check your email</h3>
            <p className="text-sm text-success/80">We have sent a password recovery link to {email}.</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
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
            
            <button 
              type="submit" 
              disabled={loading || !email}
              className="btn btn-primary w-full py-3.5 mt-4"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
