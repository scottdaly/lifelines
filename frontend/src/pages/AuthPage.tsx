import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, username);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-term-yellow mb-8 text-center font-bungee-hairline">
          LIFELINES
        </h1>
        
        <div className="bg-term-black border border-term-gray rounded-lg p-8">
          <h2 className="text-2xl font-bold text-term-gray mb-6">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          
          {error && (
            <div className="mb-4 p-3 border border-red-500 rounded bg-red-500/10 text-red-500">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-term-gray mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black border border-term-gray rounded px-3 py-2 text-term-gray focus:outline-none focus:border-term-yellow"
              />
            </div>
            
            {!isLogin && (
              <div>
                <label className="block text-term-gray mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="^[a-zA-Z0-9_-]+$"
                  className="w-full bg-black border border-term-gray rounded px-3 py-2 text-term-gray focus:outline-none focus:border-term-yellow"
                />
                <p className="text-xs text-term-gray/60 mt-1">
                  3-30 characters, letters, numbers, _ and - only
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-term-gray mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-black border border-term-gray rounded px-3 py-2 text-term-gray focus:outline-none focus:border-term-yellow"
              />
              {!isLogin && (
                <p className="text-xs text-term-gray/60 mt-1">
                  Minimum 8 characters
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-term-yellow text-black font-bold py-3 rounded hover:bg-term-yellow/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-term-gray hover:text-term-yellow"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}