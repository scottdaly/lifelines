import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
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
        const isMilestone = line === '[MILESTONE AGE]';
        const isSubTurn = line.startsWith('[') && line.endsWith(']') && !line.includes(':') && !isAgeMarker && !isMilestone && line !== '[Relationships]';
        const isTimeSkip = line.includes('YEARS PASS');
        const isAgeNarrative = (line.includes('You turn') || line.includes('You reach') || line.includes('Age ') || line.includes('At ') || line.includes('You mark')) && 
                               (line.includes('year') || line.includes('day') || line.includes('life'));
        const totalLines = displayedLines.length;
        const distanceFromEnd = totalLines - index - 1;
        
        // More gradual opacity falloff
        let opacityValue = 1;
        
        // Special elements maintain higher visibility
        const isSpecialElement = isAgeMarker || isEventLine || isRelationshipHeader || isUserChoice || isMilestone || isSubTurn || isTimeSkip || isAgeNarrative;
        
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
              <div className="inline-block bg-term-gray-dark px-2 py-1 rounded-sm my-1" style={{ opacity: opacityValue }}>
                <span className="text-term-white">{line.substring(2)}</span>
              </div>
            ) : isAgeMarker ? (
              <span className="text-term-yellow font-bold text-lg">
                {line}
              </span>
            ) : isEventLine ? (
              <EventLine line={line} opacity={opacityValue} />
            ) : isRelationshipHeader ? (
              <span className="text-term-gray mt-2 block">
                {line}
              </span>
            ) : isRelationshipLine ? (
              <RelationshipLine line={line} opacity={opacityValue} />
            ) : isMilestone ? (
              <div className="text-center my-3" style={{ opacity: opacityValue }}>
                <span className="inline-block bg-term-yellow text-term-black px-4 py-1 font-bold text-sm rounded">
                  {line}
                </span>
              </div>
            ) : isSubTurn ? (
              <div className="text-center my-2" style={{ opacity: opacityValue }}>
                <span className="inline-block border border-term-yellow text-term-yellow px-3 py-1 text-sm">
                  {line}
                </span>
              </div>
            ) : isTimeSkip ? (
              <div className="text-center my-2" style={{ opacity: opacityValue }}>
                <span className="text-term-gray italic">
                  {line}
                </span>
              </div>
            ) : isAgeNarrative ? (
              <div className="text-center my-1" style={{ opacity: opacityValue }}>
                <span className="text-term-gray">
                  {line}
                </span>
              </div>
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

// Component to render event lines with enhanced visual formatting
function EventLine({ line, opacity }: { line: string; opacity: number }) {
  // Parse event line format: [Event Title: STAT1 +5, STAT2 -3]
  const match = line.match(/^\[(.*?):(.*?)\]$/);
  
  if (!match) {
    return <span className="text-term-yellow">{line}</span>;
  }
  
  const [, title, statsString] = match;
  const stats = statsString ? statsString.split(',').map(s => s.trim()).filter(Boolean) : [];
  
  return (
    <div className="inline-block" style={{ opacity }}>
      <div className="border border-term-yellow bg-term-black px-3 py-2 rounded-sm">
        <div className="flex items-center gap-3">
          <span className="text-term-yellow font-semibold">{title}</span>
          {stats.length > 0 && (
            <>
              <span className="text-term-gray">|</span>
              <div className="flex gap-3 text-sm">
                {stats.map((stat, i) => {
                  const [statName, change] = stat.split(' ');
                  const isPositive = change && change.startsWith('+');
                  const isNegative = change && change.startsWith('-');
                  
                  return (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-term-gray text-xs">{statName}:</span>
                      <span className={
                        isPositive ? 'text-term-green font-mono' : 
                        isNegative ? 'text-term-red font-mono' : 
                        'text-term-white font-mono'
                      }>
                        {change}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Component to render relationship change lines with visual formatting
function RelationshipLine({ line, opacity }: { line: string; opacity: number }) {
  // Parse format: "- Name: narrative impact (stat1 +5, stat2 -3)"
  const match = line.match(/^- (.*?): (.*?) \((.*?)\)$/);
  
  if (!match) {
    return <span className="text-term-gray ml-4">{line}</span>;
  }
  
  const [, name, narrative, statsString] = match;
  const stats = statsString.split(',').map(s => s.trim());
  
  return (
    <div className="ml-4 mb-1" style={{ opacity }}>
      <div className="inline-block bg-term-gray-dark border-l-2 border-term-yellow px-3 py-1 rounded-sm">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-term-white font-medium">{name}:</span>
          <span className="text-term-gray italic">{narrative}</span>
          <span className="text-term-gray">•</span>
          <div className="flex gap-2">
            {stats.map((stat, i) => {
              const [statName, change] = stat.split(' ');
              const isPositive = change && change.startsWith('+');
              const isNegative = change && change.startsWith('-');
              
              return (
                <span key={i} className={
                  isPositive ? 'text-term-green text-xs font-mono' : 
                  isNegative ? 'text-term-red text-xs font-mono' : 
                  'text-term-white text-xs font-mono'
                }>
                  {statName} {change}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}