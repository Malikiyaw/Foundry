import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store/index';
import { signup, clearError } from '../../store/authSlice';

export default function SignupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { token, loading, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => { if (token) navigate('/projects'); }, [token, navigate]);
  useEffect(() => { dispatch(clearError()); }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(signup({ email, password, displayName }));
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#1e1e1e]">
      <div className="w-full max-w-sm rounded-lg border border-[#3c3c3c] bg-[#252526] p-8">
        <h1 className="mb-6 text-center text-2xl font-semibold text-[#cccccc]">Foundry</h1>
        <h2 className="mb-6 text-center text-sm text-[#858585]">Create your account</h2>

        {error && (
          <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-[#858585]">Display Name</label>
            <input
              type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-[#cccccc] placeholder-[#858585] focus:border-[#0078d4] focus:outline-none"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#858585]">Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-[#cccccc] placeholder-[#858585] focus:border-[#0078d4] focus:outline-none"
              placeholder="you@example.com" required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-[#858585]">Password</label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-[#3c3c3c] bg-[#3c3c3c] px-3 py-2 text-sm text-[#cccccc] placeholder-[#858585] focus:border-[#0078d4] focus:outline-none"
              placeholder="•••••••• (min 8 chars)" required minLength={8}
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full rounded bg-[#0078d4] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e8ae6] disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#858585]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#3794ff] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
