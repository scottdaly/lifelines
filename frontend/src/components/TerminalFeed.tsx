import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../utils/sound';

export function TerminalFeed() {
  const { narrativeLines, isTyping, setTyping } = useGameStore();
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  
  const CHAR_DELAY = 40; // ms per character
  
  // Handle typewriter effect
  useEffect(() => {
    if (currentLineIndex >= narrativeLines.length) {
      setTyping(false);
      return;
    }
    
    const currentLine = narrativeLines[currentLineIndex];
    
    // Skip undefined or non-string lines
    if (!currentLine || typeof currentLine !== 'string') {
      setCurrentLineIndex(currentLineIndex + 1);
      return;
    }
    
    if (currentCharIndex < currentLine.length) {
      setTyping(true);
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          if (currentLineIndex === prev.length) {
            newLines.push(currentLine.slice(0, currentCharIndex + 1));
          } else {
            newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex + 1);
          }
          return newLines;
        });
        setCurrentCharIndex(currentCharIndex + 1);
        
        // Play typing sound for every few characters
        if (currentCharIndex % 3 === 0) {
          soundManager.playTypeSound();
        }
      }, CHAR_DELAY);
      
      return () => clearTimeout(timeout);
    } else {
      // Move to next line
      setCurrentLineIndex(currentLineIndex + 1);
      setCurrentCharIndex(0);
    }
  }, [currentLineIndex, currentCharIndex, narrativeLines, setTyping]);
  
  // Auto-scroll to bottom unless user is scrolling
  useEffect(() => {
    if (!isUserScrolling.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLines]);
  
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    
    isUserScrolling.current = !isAtBottom;
  };
  
  return (
    <div 
      ref={scrollRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto scrollbar-hide p-6 text-sm leading-relaxed"
      aria-live="polite"
    >
      {displayedLines.map((line, index) => {
        // Skip undefined or empty lines
        if (!line || typeof line !== 'string') {
          return null;
        }
        
        const isUserChoice = line.startsWith('> ');
        const isAgeMarker = line.startsWith('[AGE ') && line.endsWith(']');
        const isScenarioContext = line.startsWith('---') && line.endsWith('---');
        const totalLines = displayedLines.length;
        const distanceFromEnd = totalLines - index - 1;
        
        // Simple two-level opacity: faded for anything 2+ lines back
        const isFaded = distanceFromEnd >= 2;
        const opacityValue = isFaded ? 0.4 : 1;
        
        return (
          <div
            key={index}
            className={`mb-2 ${isAgeMarker || isScenarioContext ? 'text-center' : ''}`}
            style={{
              opacity: opacityValue
            }}
          >
            {isUserChoice ? (
              <>
                <span className="text-term-yellow mr-2">{'>'}</span>
                <span className="text-term-white">{line.substring(2)}</span>
              </>
            ) : isAgeMarker ? (
              <span className="text-term-yellow font-bold text-lg">
                {line}
              </span>
            ) : isScenarioContext ? (
              <span className="text-term-gray italic">
                {line.substring(4, line.length - 4)}
              </span>
            ) : (
              <>
                <span className="text-term-green mr-2">{'>'}</span>
                <span className="text-term-white">
                  {line}
                  {index === totalLines - 1 && isTyping && (
                    <span className="terminal-cursor" />
                  )}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}