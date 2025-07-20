import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export function AccountSettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-term-white mb-2">Account Settings</h1>
          <p className="text-term-gray text-sm">Manage your account</p>
        </div>
        
        {/* Account Info */}
        <div className="border border-term-gray-dark rounded p-6 space-y-4">
          {user?.profilePicture && (
            <div className="flex justify-center mb-4">
              <img 
                src={user.profilePicture} 
                alt={user.username} 
                className="w-20 h-20 rounded-full border-2 border-term-gray"
              />
            </div>
          )}
          
          <div>
            <label className="text-xs text-term-gray uppercase tracking-wider">Username</label>
            <p className="text-term-white text-lg">{user?.username}</p>
          </div>
          
          <div>
            <label className="text-xs text-term-gray uppercase tracking-wider">Email</label>
            <p className="text-term-white">{user?.email}</p>
          </div>
          
          <div>
            <label className="text-xs text-term-gray uppercase tracking-wider">Login Method</label>
            <p className="text-term-white capitalize">
              {user?.authProvider === 'google' ? 'Google Account' : 'Email & Password'}
            </p>
          </div>
          
          <div>
            <label className="text-xs text-term-gray uppercase tracking-wider">Account ID</label>
            <p className="text-term-gray text-xs font-mono">{user?.id}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-4">
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-2 px-4 border border-term-red text-term-red hover:bg-term-red hover:text-black transition-colors"
            >
              SIGN OUT
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-term-gray text-sm">Are you sure you want to sign out?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2 px-4 bg-term-red text-black hover:bg-term-red/80 transition-colors"
                >
                  YES, SIGN OUT
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 px-4 border-simple hover:bg-term-white hover:text-term-black transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 px-4 border-simple hover:bg-term-white hover:text-term-black transition-colors"
          >
            BACK TO HOME
          </button>
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-term-gray/50 pt-4">
          <p>Your game progress is automatically saved</p>
          <p>Account data is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
}