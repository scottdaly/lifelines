import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../utils/sound';

export function ChoiceList() {
  const { gameState, processTurn, isLoading, isTyping, addNarrativeLine } = useGameStore();
  const choices = gameState?.pendingChoices || [];
  
  const handleChoice = async (choice: typeof choices[0]) => {
    if (isLoading || isTyping) return;
    
    // Play click sound
    soundManager.playClickSound();
    
    // Optimistic echo
    addNarrativeLine(`> ${choice.label}`);
    
    await processTurn({
      id: choice.id,
      label: choice.label
    });
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isLoading || isTyping) return;
      
      const num = parseInt(e.key);
      if (num >= 1 && num <= choices.length) {
        handleChoice(choices[num - 1]);
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [choices, isLoading, isTyping]);
  
  if (choices.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <div className="text-xs text-term-gray mb-2">What will you do?</div>
      {choices.map((choice, index) => (
        <motion.button
          key={choice.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => handleChoice(choice)}
          disabled={isLoading || isTyping}
          className="w-full text-left hover:bg-term-white hover:text-term-black transition-colors py-1 px-2 group"
        >
          <span className="text-term-yellow group-hover:text-term-black">[{index + 1}]</span>
          <span className="ml-2">{choice.label}</span>
        </motion.button>
      ))}
    </div>
  );
}