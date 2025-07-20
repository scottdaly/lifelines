import { useState, useEffect } from 'react';
import { soundManager } from '../utils/sound';

export function SoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundManager.setEnabled(newState);
    
    // Resume audio context on first interaction
    if (newState) {
      soundManager.resume();
    }
  };
  
  // Resume audio context on mount
  useEffect(() => {
    soundManager.resume();
  }, []);
  
  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-4 right-4 text-xs text-term-gray hover:text-term-white transition-colors z-40"
      aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {soundEnabled ? '[SOUND ON]' : '[SOUND OFF]'}
    </button>
  );
}