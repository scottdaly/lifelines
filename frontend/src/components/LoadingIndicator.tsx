import { useEffect, useState } from 'react';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const MESSAGES = [
  'Processing your choice',
  'Calculating consequences',
  'Weaving your narrative',
  'Rolling the dice of fate',
  'Consulting the oracle',
  'Determining your path',
  'Simulating life events',
  'Updating relationships',
  'Advancing time'
];

export function LoadingIndicator() {
  const [frame, setFrame] = useState(0);
  const [messageIndex] = useState(() => Math.floor(Math.random() * MESSAGES.length));
  const [dots, setDots] = useState(1);
  
  useEffect(() => {
    const spinnerInterval = setInterval(() => {
      setFrame((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, 80);
    
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 500);
    
    return () => {
      clearInterval(spinnerInterval);
      clearInterval(dotsInterval);
    };
  }, []);
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-term-green mr-2">{'>'}</span>
      <span className="text-term-yellow">{SPINNER_FRAMES[frame]}</span>
      <span className="text-term-gray">
        {MESSAGES[messageIndex]}{'.'.repeat(dots)}
      </span>
    </div>
  );
}