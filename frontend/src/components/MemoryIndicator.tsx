import type { Memory } from '../types/memory';

interface MemoryIndicatorProps {
  text: string;
  memory?: Memory;
}

export function MemoryIndicator({ text, memory }: MemoryIndicatorProps) {
  // Extract the actual text from [MEMORY_CALLBACK] format
  const displayText = text.replace('[MEMORY_CALLBACK]', '').trim();
  
  return (
    <div className="memory-callback italic text-term-gray border-l-2 border-term-yellow pl-3 my-2 opacity-80">
      <div className="flex items-center gap-2 text-xs mb-1">
        <span className="text-term-yellow">💭</span>
        <span>Memory</span>
        {memory && <span>from age {memory.age}</span>}
      </div>
      <p className="text-sm">{displayText}</p>
    </div>
  );
}