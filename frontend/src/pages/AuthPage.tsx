import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { AnimatedLogo } from '../components/AnimatedLogo';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  const navigate = useNavigate();
  const { login, register, googleLogin } = useAuthStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        // Validate password match for sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await register(email, password, username);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black p-4 pt-20">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Logo - matching HomePage */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AnimatedLogo />
          </div>
          <p className="text-term-gray text-md md:text-2xl">A text-based life simulation</p>
        </div>
        
        <div className="space-y-6">
          {/* Segmented control for Sign In / Sign Up */}
          <div className="flex gap-0 border border-term-gray-dark">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
                setConfirmPassword('');
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-term-white text-term-black' 
                  : 'bg-transparent text-term-gray hover:text-term-white'
              }`}
            >
              SIGN IN
            </button>
            <div className="w-px bg-term-gray-dark"></div>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
                setConfirmPassword('');
              }}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-term-white text-term-black' 
                  : 'bg-transparent text-term-gray hover:text-term-white'
              }`}
            >
              SIGN UP
            </button>
          </div>
          
          {error && (
            <div className="border border-term-red p-3 text-sm text-term-red">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-term-gray">
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border border-term-gray-dark px-3 py-2 text-term-white focus:outline-none focus:border-term-white"
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm text-term-gray">
                  Username:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={30}
                  pattern="^[a-zA-Z0-9_-]+$"
                  className="w-full bg-transparent border border-term-gray-dark px-3 py-2 text-term-white focus:outline-none focus:border-term-white"
                />
                <p className="text-xs text-term-gray/60">
                  3-30 characters, letters, numbers, _ and - only
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm text-term-gray">
                Password:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  minLength={8}
                  className="w-full bg-transparent border border-term-gray-dark px-3 py-2 pr-10 text-term-white focus:outline-none focus:border-term-white"
                />
                {passwordFocused && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-term-gray hover:text-term-white transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                  {showPassword ? (
                    // Eye off icon - clean and simple
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 12C20 12 18 17 12 17C6 17 4 12 4 12C4 12 6 7 12 7C18 7 20 12 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M4 4L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    // Eye on icon
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M20 12C20 12 18 17 12 17C6 17 4 12 4 12C4 12 6 7 12 7C18 7 20 12 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                  </button>
                )}
              </div>
              {!isLogin && (
                <p className="text-xs text-term-gray/60">
                  Minimum 8 characters
                </p>
              )}
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm text-term-gray">
                  Confirm Password:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                    required
                    className="w-full bg-transparent border border-term-gray-dark px-3 py-2 pr-10 text-term-white focus:outline-none focus:border-term-white"
                  />
                  {confirmPasswordFocused && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-term-gray hover:text-term-white transition-colors p-1"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                    {showConfirmPassword ? (
                      // Eye off icon - clean and simple
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 12C20 12 18 17 12 17C6 17 4 12 4 12C4 12 6 7 12 7C18 7 20 12 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M4 4L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : (
                      // Eye on icon
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M20 12C20 12 18 17 12 17C6 17 4 12 4 12C4 12 6 7 12 7C18 7 20 12 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-term-gray/60">
                  Must match your password
                </p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border-simple hover:bg-term-white hover:text-term-black transition-colors disabled:opacity-50"
            >
              {loading ? 'LOADING...' : (isLogin ? 'SIGN IN' : 'CREATE ACCOUNT')}
            </button>
          </form>
          
          <div className="space-y-4">
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-term-gray-dark"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-black text-term-gray uppercase">Or continue with</span>
              </div>
            </div>
            
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
              <div className="google-button-container">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    if (credentialResponse.credential) {
                      try {
                        setLoading(true);
                        setError('');
                        await googleLogin(credentialResponse.credential);
                        navigate('/');
                      } catch (err: any) {
                        setError(err.message || 'Google login failed');
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  onError={() => {
                    setError('Google login failed');
                  }}
                  type="standard"
                  theme="outline"
                  size="large"
                  text={isLogin ? "signin_with" : "signup_with"}
                  width="100%"
                />
              </div>
            </GoogleOAuthProvider>
            
            <style dangerouslySetInnerHTML={{
              __html: `
                .google-button-container {
                  width: 100%;
                }
                
                /* Override Google button styles to match our design */
                .google-button-container iframe {
                  width: 100% !important;
                  height: 40px !important;
                }
                
                /* Style the Google button iframe content if possible */
                .google-button-container > div {
                  width: 100% !important;
                }
                
                /* Add custom styling to make it blend better */
                .google-button-container {
                  position: relative;
                  overflow: hidden;
                  border-radius: 0;
                }
                
                .google-button-container::before {
                  content: '';
                  position: absolute;
                  inset: 0;
                  border: 1px solid rgb(75 85 99);
                  pointer-events: none;
                  z-index: 1;
                  transition: border-color 0.2s;
                }
                
                .google-button-container:hover::before {
                  border-color: rgb(156 163 175);
                }
                
                /* Override Google's blue hover state */
                .google-button-container:hover iframe {
                  opacity: 0.9;
                }
              `
            }} />
          </div>
          
          
          <div className="text-center text-xs text-term-gray space-y-1">
            <p>Your data is secure and encrypted</p>
            <p>Progress is automatically saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}