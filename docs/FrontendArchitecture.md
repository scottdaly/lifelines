# Frontend Architecture Documentation

## Overview

The Lifelines frontend is a modern React application built with TypeScript that provides a terminal-style interface for a text-based life simulation game. It features a unique retro aesthetic, sophisticated state management, and smooth animations while maintaining excellent performance and user experience.

## Technology Stack

### Core Technologies
- **Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 6.0 for fast development and optimized builds
- **Routing**: React Router DOM 7.7.0
- **State Management**: Zustand 5.0.6 with persistence
- **Styling**: Tailwind CSS 3.4.17 with custom terminal theme
- **Animation**: Framer Motion 12.23.6

### Key Dependencies
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.7.0",
  "zustand": "^5.0.6",
  "framer-motion": "^12.23.6",
  "@react-oauth/google": "^0.12.1",
  "tailwindcss": "^3.4.17",
  "date-fns": "^4.1.0",
  "howler": "^2.2.4"
}
```

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx               # Entry point
│   ├── index.css              # Global styles and CSS variables
│   ├── pages/                 # Page components
│   │   ├── HomePage.tsx       # Game selection/creation
│   │   ├── PlayPage.tsx       # Main gameplay interface
│   │   ├── AuthPage.tsx       # Login/signup
│   │   ├── AccountSettingsPage.tsx # User settings
│   │   └── IconLibraryPage.tsx # Developer tool
│   ├── components/            # Reusable components
│   │   ├── TerminalFeed.tsx   # Main narrative display
│   │   ├── ChoiceList.tsx     # Player choice interface
│   │   ├── StatsPanel.tsx     # Character statistics
│   │   ├── RelationshipsPanel.tsx # NPC relationships
│   │   ├── CoreMemoriesPanel.tsx # Important memories
│   │   ├── TimelineMini.tsx   # Life progression
│   │   ├── AnimatedLogo.tsx   # Animated game logo
│   │   ├── LoadingIndicator.tsx # Loading states
│   │   ├── Modal.tsx          # Modal dialog
│   │   └── ProtectedRoute.tsx # Auth wrapper
│   ├── store/                 # Zustand stores
│   │   ├── authStore.ts       # Authentication state
│   │   └── gameStore.ts       # Game state management
│   ├── types/                 # TypeScript definitions
│   │   ├── index.ts           # Core types
│   │   ├── memory.ts          # Memory system types
│   │   └── procedural.ts      # Generation types
│   ├── hooks/                 # Custom React hooks
│   │   └── useConfirmModal.tsx # Confirmation dialogs
│   └── utils/                 # Utility functions
│       └── names.ts           # Name formatting
├── public/                    # Static assets
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json
```

## Routing Architecture

### Route Structure
```typescript
<Routes>
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
  <Route path="/play/:gameId" element={<ProtectedRoute><PlayPage /></ProtectedRoute>} />
  <Route path="/settings" element={<ProtectedRoute><AccountSettingsPage /></ProtectedRoute>} />
  <Route path="/icon" element={<IconLibraryPage />} />
</Routes>
```

### Protected Routes
The `ProtectedRoute` component handles authentication:
- Checks for valid auth token
- Redirects to `/auth` if not authenticated
- Shows loading state during auth check
- Preserves intended destination after login

## State Management

### Auth Store (Zustand)
```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  checkAuth: () => Promise<void>
}
```

Features:
- Persistent storage with localStorage
- Automatic token refresh on 401 responses
- Google OAuth integration
- Optimistic UI updates

### Game Store
```typescript
interface GameState {
  currentGame: GameStateType | null
  narrativeLines: NarrativeLine[]
  currentNarrative: string
  isProcessingTurn: boolean
  
  // Actions
  loadGame: (gameId: string) => Promise<void>
  processTurn: (choice: Choice | string) => Promise<void>
  setTypewriterActive: (active: boolean) => void
  resetGame: () => void
}
```

Features:
- Turn processing with optimistic updates
- Narrative line management
- Typewriter effect control
- Error handling with user feedback

## Component Architecture

### Page Components

#### HomePage
- Displays user's saved games in a grid
- New game creation with character setup
- Random name generation
- Game deletion with confirmation
- Responsive grid layout

#### PlayPage
- Main gameplay interface
- Orchestrates all game components
- Handles keyboard shortcuts
- Manages scroll behavior
- Real-time stat updates

#### AuthPage
- Tabbed interface (Login/Signup)
- Email/password authentication
- Google OAuth integration
- Form validation
- Error messaging

### Core Components

#### TerminalFeed
The main narrative display with:
- Typewriter effect (10ms per character)
- Auto-scrolling with manual override
- Visual hierarchy for different content types
- Opacity gradient for older content
- Special formatting for milestones

```typescript
interface NarrativeLine {
  id: string
  content: string
  type: 'narrative' | 'milestone' | 'age_change' | 'stage_change' | 'event'
  timestamp: number
}
```

#### ChoiceList
Player interaction component:
- Numbered choices (1-3)
- Custom action input
- Keyboard navigation
- Disabled state during processing
- Visual feedback for selection

#### StatsPanel
Character statistics display:
- Seven core stats with icons
- Animated value changes
- Color-coded increases/decreases
- Smooth number transitions
- Responsive layout

#### RelationshipsPanel
NPC relationship tracking:
- Relationship type badges
- Multi-stat display (intimacy, trust, etc.)
- Shared history counter
- Status indicators
- Expandable details

## Styling System

### Terminal Aesthetic
The app uses a custom terminal theme:

```css
:root {
  --color-terminal-bg: #0a0a0a;
  --color-terminal-green: #00ff00;
  --color-terminal-amber: #ffaa00;
  --color-terminal-gray: #888888;
  --color-terminal-white: #ffffff;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Tailwind Configuration
Custom utilities for terminal styling:
```javascript
extend: {
  fontFamily: {
    'mono': ['JetBrains Mono', 'monospace'],
    'logo': ['Bitcount Mono Single', 'monospace']
  },
  colors: {
    'terminal': {
      'green': '#00ff00',
      'amber': '#ffaa00',
      'gray': '#888888'
    }
  }
}
```

### Component Styling Patterns
- Utility-first with Tailwind classes
- Custom CSS for complex animations
- Consistent spacing and typography
- Dark theme optimized
- Mobile-responsive design

## Animation System

### Framer Motion Integration
Used for smooth UI transitions:

```typescript
// Stats animation
<motion.span
  key={currentValue}
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 10 }}
>
  {currentValue}
</motion.span>
```

### Animation Types
1. **Number Transitions**: Smooth stat changes
2. **Logo Animation**: ASCII art reveal effect
3. **Panel Transitions**: Slide and fade effects
4. **Typewriter Effect**: Character-by-character text reveal
5. **Loading States**: Pulsing and spinning indicators

## API Integration

### HTTP Client Setup
```typescript
const apiCall = async (endpoint: string, options?: RequestInit) => {
  const token = authStore.getState().accessToken
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options?.headers
    }
  })
  
  if (response.status === 401) {
    await authStore.getState().refreshAccessToken()
    // Retry request
  }
  
  return response
}
```

### Error Handling
- Network error detection
- Token refresh on 401
- User-friendly error messages
- Graceful degradation
- Loading state management

## Performance Optimizations

### Code Splitting
- Route-based lazy loading
- Dynamic imports for heavy components
- Vite's automatic chunking

### Rendering Optimizations
- React.memo for expensive components
- useMemo for computed values
- useCallback for stable function references
- Virtual scrolling consideration for long narratives

### Bundle Optimization
- Tree shaking with Vite
- Minification and compression
- Asset optimization
- Efficient font loading

## User Experience Features

### Keyboard Navigation
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key >= '1' && e.key <= '3') {
      const index = parseInt(e.key) - 1
      if (choices[index]) {
        handleChoice(choices[index])
      }
    }
  }
  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [choices])
```

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Adaptive typography
- Collapsible panels on small screens

### Accessibility
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- High contrast colors
- Focus indicators

## Development Workflow

### Local Development
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment Variables
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Type Safety
- Strict TypeScript configuration
- Shared types with backend
- Runtime validation with Zod
- Type-safe API calls
- Component prop validation

## Testing Considerations

### Testing Strategy
1. Component testing with React Testing Library
2. Integration tests for critical flows
3. E2E tests for gameplay scenarios
4. Visual regression testing
5. Performance monitoring

### Key Test Areas
- Authentication flow
- Game state management
- Turn processing
- Memory system
- UI interactions

## Future Enhancements

### Planned Features
1. **Sound Effects**: Using Howler.js for ambient audio
2. **Achievements**: Visual achievement system
3. **Cloud Saves**: Cross-device synchronization
4. **Social Features**: Share life stories
5. **Mobile App**: React Native version

### Technical Improvements
1. **Service Worker**: Offline gameplay support
2. **WebSocket**: Real-time updates
3. **Internationalization**: Multi-language support
4. **Advanced Analytics**: Player behavior tracking
5. **Performance Monitoring**: Error tracking and metrics

## Best Practices

### Code Organization
- Single responsibility components
- Consistent file naming
- Logical folder structure
- Shared utilities
- Type definitions co-located

### State Management
- Minimal global state
- Local state when possible
- Computed values with selectors
- Action creators for complex logic
- Optimistic updates for UX

### Performance
- Lazy load routes
- Memoize expensive operations
- Debounce user input
- Efficient re-renders
- Asset optimization