# LifeLines Memory System Proposal

## Executive Summary

This document proposes a comprehensive memory system for LifeLines that will enable meaningful narrative continuity, character development through remembered experiences, and dynamic callbacks to past events. After analyzing three different approaches, I recommend implementing a **Hierarchical Memory System** that balances sophistication with practical implementation constraints.

## Current State Analysis

### Existing Implementation
- **Linear Event Storage**: All events stored in `gameState.events` array
- **Limited Context**: Only last 5 events passed to LLM
- **Basic Tagging**: Events have tags but they're primarily used for sub-turn triggers
- **No Persistence**: No concept of "significant" vs "ordinary" events
- **No Callbacks**: Past events aren't referenced in future narratives

### Current Limitations
1. **Narrative Discontinuity**: Major life events (first love, parent's death) forgotten after 5 turns
2. **No Character Growth**: Experiences don't shape future choices or personality
3. **Missed Opportunities**: Can't create poignant callbacks ("Just like when you were 5...")
4. **Generic Feel**: Every playthrough feels similar despite different events

## Proposed Approaches

### Approach 1: Enhanced Linear Memory

Extend the current system with significance scoring and smart retrieval.

```typescript
interface EnhancedEvent extends LifeEvent {
  significance: number; // 0-1 score
  memoryDecay: number; // How fast it fades
  lastRecalled?: number; // Year last referenced
}

interface LinearMemorySystem {
  events: EnhancedEvent[];
  getRelevantMemories(context: GameContext): EnhancedEvent[];
  calculateSignificance(event: LifeEvent): number;
}
```

**Pros:**
- Minimal changes to existing structure
- Easy to implement and understand
- Low performance overhead

**Cons:**
- Still fundamentally limited
- Doesn't capture relationships between memories
- No concept of themes or patterns

### Approach 2: Hierarchical Memory System (RECOMMENDED)

Three-tier memory structure with core memories, recurring themes, and associations.

```typescript
interface Memory {
  id: string;
  eventId: string;
  type: 'core' | 'significant' | 'ordinary';
  emotionalValence: number; // -1 to 1 (negative to positive)
  intensity: number; // 0-1
  associations: string[]; // Related memory IDs
  lastAccessed: number;
  accessCount: number;
}

interface Theme {
  id: string;
  name: string; // e.g., "academic_excellence", "family_conflict"
  relatedMemories: string[];
  strength: number; // 0-1, how prominent in character's life
  firstAppeared: number; // Year
  lastReinforced: number; // Year
}

interface MemorySystem {
  memories: Map<string, Memory>;
  themes: Map<string, Theme>;
  coreMemories: string[]; // Max 7-10 formative experiences
  
  processEvent(event: LifeEvent): Memory;
  identifyThemes(memory: Memory): Theme[];
  getContextualMemories(context: GameContext): Memory[];
  generateCallback(memory: Memory): string;
}
```

**Pros:**
- Rich narrative possibilities
- Supports character development
- Enables meaningful callbacks
- Manageable complexity

**Cons:**
- Requires careful tuning
- More complex than linear approach
- Need to design theme detection

### Approach 3: Graph-Based Memory Network

Most sophisticated approach using a graph structure to model memory connections.

```typescript
interface MemoryNode {
  id: string;
  event: LifeEvent;
  nodeType: 'event' | 'person' | 'place' | 'emotion';
  activation: number; // Current activation level
  baseActivation: number; // Resting activation
}

interface MemoryEdge {
  source: string;
  target: string;
  type: 'causal' | 'temporal' | 'emotional' | 'thematic';
  weight: number;
}

interface MemoryGraph {
  nodes: Map<string, MemoryNode>;
  edges: MemoryEdge[];
  
  activate(nodeId: string): void; // Spreads activation
  findPaths(from: string, to: string): MemoryPath[];
  getActivatedMemories(threshold: number): MemoryNode[];
}
```

**Pros:**
- Most realistic memory model
- Complex narrative possibilities
- Natural spreading activation

**Cons:**
- High implementation complexity
- Performance concerns
- May be overkill for the game's needs

## Recommended Approach: Hierarchical Memory System

After careful consideration, I recommend **Approach 2: Hierarchical Memory System** for the following reasons:

### 1. **Optimal Complexity-to-Value Ratio**
- Sophisticated enough to enable rich narratives
- Simple enough to implement in reasonable time
- Clear mental model for developers and players

### 2. **Natural Integration Points**
- Works well with existing trait system (traits influence memory formation)
- Complements relationship tracking (shared memories with NPCs)
- Fits with dynamic turn structure (milestones create core memories)

### 3. **Gameplay Benefits**
- Creates unique character arcs through accumulated themes
- Enables emotional callbacks at meaningful moments
- Supports both procedural and authored content

### 4. **Technical Feasibility**
- Reasonable save file size
- Efficient memory retrieval algorithms
- Clear upgrade path from current system

## Implementation Plan

### Phase 1: Core Data Structures
```typescript
// Add to GameState
export interface GameState {
  // ... existing fields
  memorySystem?: {
    memories: Record<string, Memory>;
    themes: Record<string, Theme>;
    coreMemoryIds: string[];
  };
}
```

### Phase 2: Memory Formation
```typescript
// Memory processor determines significance
class MemoryProcessor {
  evaluateEvent(event: LifeEvent, gameState: GameState): Memory {
    const significance = this.calculateSignificance(event, gameState);
    const emotionalValence = this.assessEmotionalImpact(event);
    const associations = this.findAssociations(event, gameState);
    
    return {
      id: `mem_${event.id}`,
      eventId: event.id,
      type: this.determineMemoryType(significance),
      emotionalValence,
      intensity: significance,
      associations,
      lastAccessed: gameState.currentYear,
      accessCount: 0
    };
  }
  
  private calculateSignificance(event: LifeEvent, gameState: GameState): number {
    let score = 0;
    
    // Large stat changes = significant
    const totalStatChange = Object.values(event.statChanges || {})
      .reduce((sum, val) => sum + Math.abs(val), 0);
    score += Math.min(totalStatChange / 40, 0.5); // Max 0.5 from stats
    
    // Relationship changes = significant
    if (event.affectedRelationships?.length > 0) {
      score += 0.2 * event.affectedRelationships.length;
    }
    
    // Milestone ages = automatic significance
    const age = gameState.currentYear - parseInt(gameState.character.dob.split('-')[0]);
    if ([5, 13, 16, 18, 21, 30, 40, 50, 65].includes(age)) {
      score += 0.3;
    }
    
    // Tagged events (first_love, graduation, etc.) = significant
    const significantTags = ['first_love', 'graduation', 'marriage', 'loss', 'achievement'];
    if (event.tags.some(tag => significantTags.includes(tag))) {
      score += 0.4;
    }
    
    return Math.min(score, 1);
  }
}
```

### Phase 3: Theme Detection
```typescript
class ThemeDetector {
  private themePatterns = {
    academic_excellence: ['study', 'achievement', 'academic', 'scholarship'],
    rebellious_spirit: ['rebel', 'conflict', 'defiant', 'independent'],
    family_loyalty: ['family', 'parent', 'sibling', 'home'],
    romantic_journey: ['love', 'romance', 'relationship', 'heartbreak'],
    creative_expression: ['art', 'creative', 'music', 'writing'],
    athletic_prowess: ['sport', 'athletic', 'competition', 'physical']
  };
  
  detectThemes(memory: Memory, event: LifeEvent): string[] {
    const themes: string[] = [];
    
    for (const [themeId, keywords] of Object.entries(this.themePatterns)) {
      const matchCount = keywords.filter(keyword => 
        event.tags.includes(keyword) || 
        event.title.toLowerCase().includes(keyword) ||
        event.description.toLowerCase().includes(keyword)
      ).length;
      
      if (matchCount >= 2) {
        themes.push(themeId);
      }
    }
    
    return themes;
  }
}
```

### Phase 4: Memory Retrieval
```typescript
class MemoryRetriever {
  getRelevantMemories(
    context: GameContext, 
    memorySystem: MemorySystem, 
    maxMemories: number = 10
  ): Memory[] {
    const memories = Object.values(memorySystem.memories);
    
    // Score each memory for relevance
    const scoredMemories = memories.map(memory => ({
      memory,
      score: this.calculateRelevance(memory, context, memorySystem)
    }));
    
    // Sort by score and take top N
    return scoredMemories
      .sort((a, b) => b.score - a.score)
      .slice(0, maxMemories)
      .map(item => item.memory);
  }
  
  private calculateRelevance(
    memory: Memory, 
    context: GameContext,
    memorySystem: MemorySystem
  ): number {
    let score = 0;
    
    // Core memories always relevant
    if (memory.type === 'core') score += 0.5;
    
    // Recent memories more relevant
    const yearsSince = context.currentYear - memory.lastAccessed;
    score += Math.max(0, 1 - yearsSince / 20);
    
    // Memories related to active themes
    const activeThemes = this.getActiveThemes(memorySystem, context);
    const relatedThemes = Object.values(memorySystem.themes)
      .filter(theme => theme.relatedMemories.includes(memory.id));
    
    score += relatedThemes.filter(theme => 
      activeThemes.includes(theme.id)
    ).length * 0.3;
    
    // Emotional resonance with current situation
    if (context.currentEmotionalState) {
      const emotionalMatch = 1 - Math.abs(
        memory.emotionalValence - context.currentEmotionalState
      );
      score += emotionalMatch * 0.2;
    }
    
    return score;
  }
}
```

### Phase 5: LLM Integration
Update the LLM prompt to include relevant memories:

```typescript
const relevantMemories = memoryRetriever.getRelevantMemories(context, memorySystem);
const coreMemories = memorySystem.coreMemoryIds
  .map(id => memorySystem.memories[id])
  .filter(Boolean);

const memoryContext = `
Character's Core Memories (formative experiences):
${coreMemories.map(m => {
  const event = gameState.events.find(e => e.id === m.eventId);
  return `- Age ${event.year - birthYear}: ${event.title}`;
}).join('\n')}

Relevant Past Experiences:
${relevantMemories.map(m => {
  const event = gameState.events.find(e => e.id === m.eventId);
  return `- ${event.title} (${m.emotionalValence > 0 ? 'positive' : 'negative'} memory)`;
}).join('\n')}

Recurring Life Themes:
${Object.values(memorySystem.themes)
  .filter(theme => theme.strength > 0.5)
  .map(theme => `- ${theme.name.replace('_', ' ')}: strength ${theme.strength}`)
  .join('\n')}
`;
```

### Phase 6: Callback Generation
```typescript
class CallbackGenerator {
  generateCallbacks(
    memories: Memory[], 
    currentContext: GameContext
  ): string[] {
    const callbacks: string[] = [];
    
    for (const memory of memories) {
      // Anniversary callbacks
      if (this.isAnniversary(memory, currentContext)) {
        callbacks.push(this.generateAnniversaryCallback(memory));
      }
      
      // Parallel situation callbacks
      if (this.isSimilarSituation(memory, currentContext)) {
        callbacks.push(this.generateParallelCallback(memory));
      }
      
      // Emotional echo callbacks
      if (this.isEmotionalEcho(memory, currentContext)) {
        callbacks.push(this.generateEmotionalCallback(memory));
      }
    }
    
    return callbacks;
  }
}
```

## UI Considerations

### Memory Display Options
1. **Timeline Integration**: Mark significant memories on the timeline
2. **Memory Journal**: Dedicated UI section for browsing memories
3. **Inline References**: Show memory callbacks in terminal feed
4. **Character Sheet**: Display dominant themes and core memories

### Visual Indicators
```typescript
// In TerminalFeed component
function MemoryCallback({ memory, text }: { memory: Memory; text: string }) {
  return (
    <div className="memory-callback italic text-term-gray border-l-2 border-term-gray-dark pl-3 my-2">
      <span className="text-xs">💭 Memory from age {memory.age}</span>
      <p>{text}</p>
    </div>
  );
}
```

## Performance Considerations

### Memory Limits
- Core memories: 7-10 maximum (psychological realism)
- Active themes: 5-8 maximum
- Total memories: Soft cap at 100, with decay for oldest non-core memories

### Optimization Strategies
1. **Lazy Loading**: Only load full memory details when needed
2. **Indexing**: Maintain indexes by year, theme, and emotional valence
3. **Caching**: Cache frequently accessed memory queries

## Migration Strategy

1. **Backward Compatibility**: New saves include memory system, old saves work without it
2. **Retroactive Analysis**: Can analyze existing events to build memory system
3. **Gradual Rollout**: Start with basic memories, add themes in update

## Success Metrics

1. **Player Engagement**: Increased emotional connection to character
2. **Narrative Richness**: More varied and personalized stories
3. **Replay Value**: Different memory patterns create unique playthroughs
4. **Performance**: Memory operations < 50ms on average hardware

## Conclusion

The Hierarchical Memory System provides the optimal balance of narrative sophistication and implementation feasibility. It will transform LifeLines from a series of disconnected events into a cohesive life story where past experiences meaningfully shape the present and future.

### Next Steps
1. Implement core data structures
2. Build memory formation logic
3. Create theme detection system
4. Integrate with LLM prompts
5. Add UI elements for memory display
6. Test and tune significance algorithms

This system will create deeply personal narratives where players feel their choices have lasting impact, making each playthrough a unique and emotionally resonant journey through life.