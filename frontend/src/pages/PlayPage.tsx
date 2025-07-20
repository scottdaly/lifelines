import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TerminalFeed } from '../components/TerminalFeed';
import { ChoiceList } from '../components/ChoiceList';
import { StatsPanel } from '../components/StatsPanel';
import { RelationshipsPanel } from '../components/RelationshipsPanel';
import { TimelineMini } from '../components/TimelineMini';
import { CoreMemoriesPanel } from '../components/CoreMemoriesPanel';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';

export function PlayPage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, initializeGame } = useGameStore();
  const { tokens } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    loadGame();
  }, [gameId]);
  
  const loadGame = async () => {
    if (!gameId) {
      navigate('/dashboard');
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/games/${gameId}`, {
        headers: {
          'Authorization': `Bearer ${tokens?.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load game');
      }
      
      const data = await response.json();
      initializeGame(data.gameState);
    } catch (error) {
      console.error('Failed to load game:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-term-gray">Loading...</div>
      </div>
    );
  }
  
  if (!gameState) return null;
  
  const age = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
  
  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-term-gray-dark md:hidden">
        <h1 className="text-lg text-term-white font-logo">Lifelines</h1>
        <div className="text-xs text-term-gray">
          {gameState.character.name} | Age {age}
          {gameState.currentSubTurn && (
            <span className="ml-1 text-term-yellow">• {gameState.currentSubTurn}</span>
          )}
        </div>
      </div>
      
      {/* Main Area */}
      <div className="flex-1 flex flex-col p-4 md:p-6">
        <div className="hidden md:flex items-center justify-between mb-4">
          <h1 className="text-2xl text-term-white font-logo">Lifelines</h1>
          <div className="text-sm text-term-gray">
            {gameState.character.name} | Age {age} | Year {gameState.currentYear}
            {gameState.currentSubTurn && (
              <span className="ml-2 text-term-yellow">• {gameState.currentSubTurn}</span>
            )}
          </div>
        </div>
        
        <div className="flex-1 border-simple mb-4 overflow-hidden">
          <TerminalFeed />
        </div>
        
        <div className="border-simple p-4">
          <ChoiceList />
        </div>
      </div>
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed bottom-0 left-0 right-0' : 'w-80'} 
        bg-term-black border-l border-term-gray-dark p-4 space-y-4
        ${isMobile ? 'max-h-[40vh] overflow-y-auto' : ''}
      `}>
        <StatsPanel />
        <RelationshipsPanel />
        <CoreMemoriesPanel />
        
        <TimelineMini />
      </div>
    </div>
  );
}