import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PlayPage } from './pages/PlayPage';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { IconLibraryPage } from './pages/IconLibraryPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';

function App() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          <Route path="/auth" element={
            isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/play/:gameId" element={
            <ProtectedRoute>
              <PlayPage />
            </ProtectedRoute>
          } />
          <Route path="/icon" element={
            <ProtectedRoute>
              <IconLibraryPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={
            <Navigate to={isAuthenticated ? "/" : "/auth"} replace />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;