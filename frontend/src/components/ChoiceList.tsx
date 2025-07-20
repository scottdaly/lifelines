import { useEffect, useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

export function ChoiceList() {
  const { gameState, processTurn, isLoading, isTyping, addNarrativeLine } = useGameStore();
  const choices = gameState?.pendingChoices || [];
  const [customAction, setCustomAction] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleChoice = async (choice: typeof choices[0]) => {
    if (isLoading || isTyping) return;
    
    // Optimistic echo
    addNarrativeLine(`> ${choice.label}`);
    
    await processTurn({
      id: choice.id,
      label: choice.label
    });
  };
  
  const handleCustomAction = async () => {
    if (isLoading || isTyping || !customAction.trim()) return;
    
    // Validate custom action
    const trimmedAction = customAction.trim();
    if (trimmedAction.length < 3 || trimmedAction.length > 200) {
      return; // Silently reject invalid actions
    }
    
    // Optimistic echo
    addNarrativeLine(`> ${trimmedAction}`);
    
    // Clear input
    setCustomAction('');
    
    await processTurn({
      id: 'custom_action',
      label: trimmedAction,
      isCustom: true
    });
  };
  
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCustomAction();
    }
  };
  
  // Keyboard shortcuts and auto-focus
  useEffect(() => {
    const handleKeyPress = (e: globalThis.KeyboardEvent) => {
      if (isLoading || isTyping) return;
      
      const num = parseInt(e.key);
      if (num >= 1 && num <= choices.length) {
        handleChoice(choices[num - 1]);
      } else if (
        // Focus input if user types a letter or common punctuation
        e.key.length === 1 && 
        !e.ctrlKey && 
        !e.metaKey && 
        !e.altKey &&
        inputRef.current &&
        document.activeElement !== inputRef.current
      ) {
        inputRef.current.focus();
        // Let the character be typed in the input
        inputRef.current.value = e.key;
        setCustomAction(e.key);
      }
    };
    
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [choices, isLoading, isTyping]);
  
  if (choices.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <div className="text-xs text-term-gray mb-2">
        {isLoading || isTyping ? 'Loading...' : 'What will you do?'}
      </div>
      {choices.map((choice, index) => (
        <motion.button
          key={choice.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoading || isTyping ? 0.4 : 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => handleChoice(choice)}
          disabled={isLoading || isTyping}
          className={`w-full text-left transition-all py-2 px-4 group bg-term-gray-dark rounded-sm ${
            isLoading || isTyping 
              ? 'cursor-not-allowed opacity-40' 
              : 'hover:bg-term-white hover:text-term-black cursor-pointer'
          }`}
        >
          <span className={`${
            isLoading || isTyping ? 'text-term-gray' : 'text-term-yellow'
          } group-hover:text-term-black`}>[{index + 1}]</span>
          <span className="ml-2">{choice.label}</span>
        </motion.button>
      ))}
      
      {/* Custom action input */}
      <div className="mt-4 pt-3">
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={customAction}
            onChange={(e) => setCustomAction(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || isTyping}
            placeholder="Type your own action... (e.g., 'Look around nervously', 'Ask about the weather')"
            className={`flex-1 bg-transparent border border-term-gray px-3 py-3 pr-12 text-sm focus:outline-none focus:border-term-yellow ${
              isLoading || isTyping
                ? 'opacity-40 cursor-not-allowed'
                : 'text-term-white'
            }`}
          />
          <button
            onClick={handleCustomAction}
            disabled={isLoading || isTyping || !customAction.trim() || customAction.trim().length < 3}
            className={`absolute right-px px-2 py-2 transition-all duration-100 h-full ${
              isLoading || isTyping || !customAction.trim() || customAction.trim().length < 3
                ? 'text-term-gray cursor-not-allowed opacity-80'
                : 'text-term-yellow hover:bg-term-yellow hover:text-term-black cursor-pointer'
            }`}
            aria-label="Send custom action"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
        <div className="text-xs text-term-gray mt-1">
          Press Enter to submit • 3-200 characters
        </div>
      </div>
    </div>
  );
}