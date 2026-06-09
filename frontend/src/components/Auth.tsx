import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store/index';
import { login, register } from '../store/authSlice';

export function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password })).unwrap().then(() => navigate('/projects')).catch(() => {});
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0078d4] to-[#1e8ae6]">
            <span className="text-xl font-bold text-white">F</span>
          </div>
          <h1 className="text-xl font-bold text-white">Welcome to Foundry</h1>
          <p className="mt-1 text-sm text-[#858585]">Sign in to start building games</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#858585] mb-1">Email</label>
            <input className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Password</label>
            <input className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-[#0078d4] py-2 text-sm font-medium text-white hover:bg-[#1e8ae6] disabled:opacity-50 transition-colors">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#3c3c3c]" /></div>
          <div className="relative flex justify-center"><span className="bg-[#1e1e1e] px-2 text-xs text-[#858585]">or continue with</span></div>
        </div>
        <button className="w-full rounded border border-[#3c3c3c] bg-[#252526] py-2 text-sm text-[#cccccc] hover:bg-[#3c3c3c] transition-colors" onClick={() => window.location.href = '/api/auth/google'}>
          Sign in with Google
        </button>
        <p className="mt-6 text-center text-xs text-[#858585]">
          Don't have an account? <Link to="/register" className="text-blue-400 hover:underline">Sign up</Link>
        </p>
        <p className="mt-2 text-center text-[10px] text-[#858585]">
          Demo: demo@foundry.gg / password123
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register({ email, password, name })).unwrap().then(() => navigate('/projects')).catch(() => {});
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0078d4] to-[#1e8ae6]">
            <span className="text-xl font-bold text-white">F</span>
          </div>
          <h1 className="text-xl font-bold text-white">Create Account</h1>
          <p className="mt-1 text-sm text-[#858585]">Start building games with AI</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-[#858585] mb-1">Name</label>
            <input className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Email</label>
            <input className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-[#858585] mb-1">Password</label>
            <input className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-white outline-none focus:border-[#0078d4] placeholder-[#858585]" type="password" placeholder="At least 6 characters" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded bg-[#0078d4] py-2 text-sm font-medium text-white hover:bg-[#1e8ae6] disabled:opacity-50 transition-colors">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-[#858585]">
          Already have an account? <Link to="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
