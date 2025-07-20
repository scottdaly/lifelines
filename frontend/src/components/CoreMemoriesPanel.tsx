import { useGameStore } from '../store/gameStore';

export function CoreMemoriesPanel() {
  const { gameState } = useGameStore();
  
  if (!gameState?.memorySystem || gameState.memorySystem.coreMemoryIds.length === 0) {
    return null;
  }
  
  const coreMemories = gameState.memorySystem.coreMemoryIds
    .map(id => gameState.memorySystem!.memories[id])
    .filter(Boolean)
    .sort((a, b) => a.age - b.age);
  
  return (
    <div className="bg-term-black border border-term-gray rounded p-4">
      <h3 className="text-term-yellow font-bold mb-3">Core Memories</h3>
      <div className="space-y-2">
        {coreMemories.map(memory => {
          const event = gameState.events.find(e => e.id === memory.eventId);
          if (!event) return null;
          
          return (
            <div key={memory.id} className="flex items-start gap-2 text-sm">
              <span className="text-term-gray">Age {memory.age}</span>
              <span className="text-term-white flex-1">{event.title}</span>
              <span className={memory.emotionalValence > 0 ? 'text-term-green' : 'text-term-red'}>
                {memory.emotionalValence > 0 ? '◈' : '◆'}
              </span>
            </div>
          );
        })}
      </div>
      
      {Object.keys(gameState.memorySystem.themes).length > 0 && (
        <div className="mt-4 pt-3 border-t border-term-gray">
          <h4 className="text-term-yellow text-sm mb-2">Life Themes</h4>
          <div className="space-y-1">
            {Object.values(gameState.memorySystem.themes)
              .filter(theme => theme.strength > 0.3)
              .sort((a, b) => b.strength - a.strength)
              .slice(0, 5)
              .map(theme => (
                <div key={theme.id} className="flex items-center gap-2 text-xs">
                  <span className="text-term-gray">
                    {theme.name.replace(/_/g, ' ')}
                  </span>
                  <div className="flex-1 bg-term-gray-dark rounded-full h-1">
                    <div 
                      className="bg-term-yellow h-full rounded-full"
                      style={{ width: `${theme.strength * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}