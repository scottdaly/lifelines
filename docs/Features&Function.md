# Features & Function Documentation

## Game Overview

Lifelines is a text-based life simulation game that uses AI to generate unique, personalized narratives. Players guide a character from birth to death through choices that shape their personality, relationships, and life story. The game features a retro terminal aesthetic while leveraging modern AI technology to create emotionally engaging, emergent storytelling.

## Core Gameplay Loop

### Turn-Based Progression
Each turn follows this sequence:
1. **Narrative Presentation**: Story text appears with typewriter effect
2. **Choice Display**: 3 numbered options + custom action ability
3. **Player Selection**: Keyboard (1-3) or click selection
4. **Processing**: AI generates consequences and narrative
5. **State Updates**: Stats, relationships, and memories change
6. **Time Advancement**: Game progresses forward in time
7. **New Choices**: Next set of options generated

### Time Progression System
The game intelligently varies time progression based on life stage:

| Life Stage | Age Range | Turn Length | Special Features |
|------------|-----------|-------------|------------------|
| Early Life | 0-8 | Single 8-year jump | Foundational traits established |
| Tween | 9-12 | 4 years | Pre-teen development |
| High School | 13-17 | Seasonal (Fall/Spring/Summer) | Dense, detailed progression |
| Young Adult | 18-24 | 2 years ± 1 | College/early career |
| Adult | 25-64 | 3 years ± 2 | Career and family focus |
| Senior | 65+ | 2 years ± 1 | Reflection and legacy |

## Character System

### Core Statistics
Seven primary stats shape the character's capabilities:

1. **Intelligence** - Academic ability, problem-solving
2. **Charisma** - Social skills, leadership  
3. **Strength** - Physical capability, health
4. **Creativity** - Artistic expression, innovation
5. **Luck** - Random event favorability
6. **Health** - Physical and mental wellbeing
7. **Wealth** - Financial resources

### Character Creation
- **Name Selection**: Manual entry or random generation
- **Gender**: Male/Female/Non-binary options
- **Procedural Background**: Era-specific family history
- **Starting Traits**: Personality characteristics that influence gameplay

### Stat Progression
- Events modify stats with clear feedback: `[INTELLIGENCE +3, HEALTH -1]`
- Stats range from 0-100 with narrative impact
- Visual indicators show changes in real-time
- Stats influence available choices and outcomes

## Memory System

### Memory Hierarchy

#### Core Memories (7-10 maximum)
- Most formative experiences
- Define character's personality
- Referenced frequently in narrative
- Cannot be forgotten
- Examples: First day of school, parents' divorce, winning championship

#### Significant Memories
- Important but not defining events
- Can influence decisions
- May become core memories
- Subject to gradual decay
- Examples: Birthday parties, school performances, first job

#### Ordinary Memories  
- Day-to-day experiences
- Provide narrative texture
- Decay over time
- Automatically pruned
- Examples: Routine activities, minor social interactions

### Memory Properties
- **Emotional Valence** (-1 to 1): Positive or negative impact
- **Intensity** (0-1): Strength of emotional impact
- **Associations**: Links between related memories
- **Access Count**: How often recalled
- **Decay Rate**: How quickly forgotten

### Life Themes
The system detects recurring patterns that emerge from memories:
- **Academic Excellence**: Consistent scholarly achievement
- **Athletic Prowess**: Sports and physical accomplishments
- **Artistic Expression**: Creative pursuits and achievements
- **Social Butterfly**: Strong interpersonal connections
- **Rebellious Spirit**: Pattern of defying authority
- **Family Devotion**: Strong family bonds
- **Professional Ambition**: Career-focused decisions

## Relationship System

### Relationship Types
- **Parent**: Mother, father, step-parents
- **Sibling**: Brothers, sisters
- **Friend**: Close companions
- **Rival**: Competitive relationships
- **Mentor**: Teachers, coaches, advisors
- **Romantic**: Dating partners, crushes
- **Spouse**: Marriage partners
- **Child**: Sons, daughters
- **Coworker**: Professional relationships

### Relationship Mechanics

#### Four Relationship Stats
1. **Intimacy** (0-100): Emotional closeness
2. **Trust** (0-100): Reliability and faith
3. **Attraction** (0-100): Romantic/physical interest
4. **Conflict** (0-100): Tension and disagreement

#### Relationship States
- **Active**: Ongoing interaction
- **Estranged**: Damaged but repairable
- **Ended**: Concluded (breakup, falling out)
- **Deceased**: Character has died

#### Dynamic Evolution
- Relationships change based on choices
- Shared experiences create history
- Time apart may cause drift
- Conflicts can damage or strengthen bonds
- New relationships form throughout life

## Choice System

### Choice Types

#### Predefined Choices
- AI-generated based on context
- Tagged with categories (social, academic, risky)
- Consider current stats and relationships
- Age and stage appropriate

#### Custom Actions
- Free text input (3-200 characters)
- Allows creative player expression
- Processed by AI for consequences
- Enables emergent gameplay

### Choice Generation
Choices are contextually aware of:
- Current age and life stage
- Recent events and decisions
- Active relationships
- Character stats and traits
- Ongoing storylines
- Memory themes

### Choice Categories
- **Social**: Interpersonal interactions
- **Academic**: Education-related decisions
- **Career**: Professional choices
- **Family**: Domestic situations
- **Health**: Physical/mental wellbeing
- **Financial**: Money management
- **Romantic**: Love and relationships
- **Adventure**: Risk-taking options
- **Creative**: Artistic expression
- **Moral**: Ethical dilemmas

## Narrative Generation

### AI-Powered Storytelling
The game uses GPT-4 to create personalized narratives:

1. **Context Building**: System gathers relevant information
2. **Prompt Construction**: Structured prompt with character data
3. **Generation**: AI creates narrative and consequences
4. **Validation**: System ensures coherent output
5. **Integration**: Story elements woven into game state

### Narrative Elements
- **Descriptive Text**: Rich environmental and emotional details
- **Character Dialogue**: Realistic NPC conversations
- **Internal Monologue**: Character thoughts and feelings
- **Sensory Details**: Sights, sounds, smells
- **Emotional Resonance**: Callbacks to memories

### Continuity Features
- Memory callbacks create emotional threads
- Relationship history influences interactions
- Past decisions have long-term consequences
- Themes develop across lifetime
- Character growth feels authentic

## User Interface

### Terminal Aesthetic
- **Monospace Font**: JetBrains Mono for authenticity
- **Color Scheme**: Green primary, amber/white accents
- **ASCII Borders**: Terminal-style UI elements
- **Typewriter Effect**: 10ms per character reveal
- **Retro Feel**: 1980s computer terminal inspiration

### Interface Components

#### Main Terminal Feed
- Scrollable narrative history
- Visual hierarchy for content types
- Milestone highlighting
- Age/stage transitions marked
- Event notifications

#### Choice Panel
- Numbered options (1-3)
- Custom action input field
- Keyboard shortcuts displayed
- Processing state indication
- Clear visual separation

#### Stats Panel
- Real-time stat display
- Animated value changes
- Color-coded indicators
- Icon representation
- Compact layout

#### Relationships Panel
- Active relationship list
- Relationship type badges
- Multi-stat visualization
- Expandable details
- Status indicators

#### Core Memories Panel
- Important memory display
- Emotional valence indication
- Chronological ordering
- Visual prominence
- Theme associations

#### Timeline
- Life stage progression
- Current age display
- Visual progress indicator
- Milestone markers
- Stage transitions

## Special Features

### Procedural Background Generation
Creates unique starting conditions:
- **Era-Specific Content**: 1980-2025 periods
- **Geographic Variety**: Different locations worldwide
- **Family Dynamics**: Parents, siblings, circumstances
- **Socioeconomic Factors**: Wealth, education, opportunities
- **Cultural Elements**: Regional customs and values

### Dynamic Event System
- **Milestone Events**: Special ages trigger unique content
- **Narrative Pressure**: System ensures dramatic pacing
- **Contextual Events**: Situations arise from current state
- **Random Encounters**: Luck-based opportunities
- **Consequential Chains**: Events lead to follow-ups

### Multiple Endings
- Natural death from old age
- Health-related conclusions
- Accident or misfortune
- Achievement-based endings
- Player-driven conclusions

## Player Experience

### Engagement Mechanics

#### Emotional Investment
- Memory callbacks create nostalgia
- Relationships feel meaningful
- Consequences have weight
- Character growth is visible
- Stories feel personal

#### Replayability
- No two lives are identical
- Different choices yield new stories
- Various starting conditions
- Multiple achievement paths
- Exploration of "what-if" scenarios

#### Progression Satisfaction
- Clear character development
- Visible stat improvements
- Relationship evolution
- Achievement unlocking
- Life milestone completion

### Accessibility Features
- **Keyboard Navigation**: Full keyboard control
- **Clear Typography**: Readable monospace font
- **High Contrast**: Terminal green on black
- **Responsive Design**: Mobile-friendly
- **Auto-Save**: Progress never lost

## Technical Excellence

### Performance
- Instant choice response
- Smooth animations
- Fast page loads
- Efficient memory usage
- Responsive UI

### Reliability
- Robust error handling
- Graceful degradation
- Data persistence
- Crash recovery
- Consistent experience

## Unique Innovations

### What Sets Lifelines Apart

1. **Terminal-First Design**
   - Embraces text-based roots
   - Modern UX in retro package
   - Efficient information display
   - Nostalgic appeal

2. **AI-Driven Procedural Life**
   - Every playthrough unique
   - Coherent long-form narrative
   - Contextual awareness
   - Emotional continuity

3. **Sophisticated Memory System**
   - Hierarchical memory structure
   - Theme emergence
   - Narrative callbacks
   - Realistic forgetting

4. **Dynamic Time Progression**
   - Variable turn lengths
   - Life stage awareness
   - Narrative pacing
   - Meaningful milestones

5. **Relationship Depth**
   - Multi-dimensional relationships
   - Realistic evolution
   - Shared history tracking
   - Meaningful consequences

6. **Custom Action System**
   - Player creativity supported
   - Emergent gameplay
   - AI interpretation
   - Unlimited possibilities

## Future Roadmap

### Planned Features
1. **Achievement System**: Track special accomplishments
2. **Family Trees**: Multi-generational play
3. **Social Features**: Share life stories
4. **Sound Design**: Ambient audio and effects
5. **Extended Eras**: Historical periods
6. **Career Paths**: Detailed professions
7. **World Events**: Historical integration
8. **Mod Support**: Custom content creation

### Platform Expansion
- Mobile applications
- Steam release
- Console adaptations
- VR narrative mode
- Voice interaction

## Conclusion

Lifelines represents a unique fusion of classic text adventure sensibilities with cutting-edge AI technology. By focusing on emotional storytelling, meaningful choices, and emergent narrative, it creates deeply personal experiences that resonate with players. The terminal aesthetic provides nostalgic charm while the sophisticated systems underneath deliver modern gameplay depth. Every life lived in Lifelines is a unique story worth telling.