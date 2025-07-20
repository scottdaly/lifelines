import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { soundManager } from '../utils/sound';
import { LoadingIndicator } from './LoadingIndicator';

export function TerminalFeed() {
  const { narrativeLines, isTyping, setTyping, isLoading } = useGameStore();
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  
  const CHAR_DELAY = 10; // ms per character
  
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
  }, [displayedLines, isLoading]);
  
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
        const isEventLine = line.startsWith('[') && line.endsWith(']') && line.includes(':');
        const isRelationshipHeader = line === '[Relationships]';
        const isRelationshipLine = line.startsWith('- ') && line.includes(':');
        const totalLines = displayedLines.length;
        const distanceFromEnd = totalLines - index - 1;
        
        // More gradual opacity falloff
        let opacityValue = 1;
        
        // Special elements maintain higher visibility
        const isSpecialElement = isAgeMarker || isEventLine || isRelationshipHeader || isUserChoice;
        
        if (distanceFromEnd > 20) {
          opacityValue = isSpecialElement ? 0.5 : 0.3; // Very old content
        } else if (distanceFromEnd > 10) {
          opacityValue = isSpecialElement ? 0.7 : 0.5; // Older content
        } else if (distanceFromEnd > 5) {
          opacityValue = isSpecialElement ? 0.85 : 0.7; // Recent but not latest
        }
        // Lines 0-5 from the end stay at full opacity
        
        return (
          <div
            key={index}
            className={`mb-1 ${isAgeMarker ? 'text-center mb-2' : ''}`}
            style={{
              opacity: isUserChoice ? 1 : opacityValue
            }}
          >
            {isUserChoice ? (
              <div className="inline-block bg-term-gray-dark border border-term-gray px-4 py-2 rounded my-1" style={{ opacity: opacityValue }}>
                <span className="text-term-white">{line.substring(2)}</span>
              </div>
            ) : isAgeMarker ? (
              <span className="text-term-yellow font-bold text-lg">
                {line}
              </span>
            ) : isEventLine ? (
              <span className="text-term-yellow">
                {line}
              </span>
            ) : isRelationshipHeader ? (
              <span className="text-term-gray mt-2">
                {line}
              </span>
            ) : isRelationshipLine ? (
              <span className="text-term-gray ml-4">
                {line}
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
      
      {/* Show loading indicator at the bottom when processing */}
      {isLoading && !isTyping && (
        <div className="mb-2">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
}