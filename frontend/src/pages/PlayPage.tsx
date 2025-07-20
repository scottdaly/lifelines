import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TerminalFeed } from '../components/TerminalFeed';
import { ChoiceList } from '../components/ChoiceList';
import { StatsPanel } from '../components/StatsPanel';
import { RelationshipsPanel } from '../components/RelationshipsPanel';
import { TimelineMini } from '../components/TimelineMini';
import { CoreMemoriesPanel } from '../components/CoreMemoriesPanel';
import { useGameStore } from '../store/gameStore';

export function PlayPage() {
  const navigate = useNavigate();
  const { gameState, saveGame } = useGameStore();
  const [showSaveId, setShowSaveId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    if (!gameState) {
      navigate('/');
    }
  }, [gameState, navigate]);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Save game on ESC
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const saveId = await saveGame();
        if (saveId) {
          setShowSaveId(saveId);
          setTimeout(() => setShowSaveId(null), 5000);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveGame]);
  
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
      
      {/* Save notification */}
      {showSaveId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-term-black border border-term-yellow p-4"
        >
          <p className="text-sm text-term-yellow mb-1">Game saved!</p>
          <p className="text-xs text-term-gray">ID: {showSaveId}</p>
        </motion.div>
      )}
    </div>
  );
}