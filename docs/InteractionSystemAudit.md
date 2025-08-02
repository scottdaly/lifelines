# Lifelines Interaction System Audit

## Executive Summary

This document provides a comprehensive audit of the Lifelines game's interaction and choice implementation system. The audit reveals several architectural issues causing poor user experience, particularly the "double display" problem where choices appear twice - once without context and then again with context.

## Current Architecture Overview

### Frontend Components

1. **HomePage.tsx**
   - Creates new games with initial `pendingChoices: [{id: 'early_life_start', label: 'Take your first breath'}]`
   - Handles character creation and game initialization
   - Navigates to PlayPage after game creation

2. **PlayPage.tsx**
   - Loads game state from backend on mount
   - Displays current game state immediately
   - Shows TerminalFeed and ChoiceList components

3. **gameStore.ts (Zustand)**
   - `initializeGame()`: Sets initial narrative lines based on age
   - `processTurn()`: Sends choice to backend, receives response, updates state
   - Manages narrative lines and game state

4. **ChoiceList.tsx**
   - Displays `gameState.pendingChoices`
   - Handles choice selection and custom actions
   - Shows choices immediately when available

### Backend Components

1. **turn.ts (Controller)**
   - Handles turn processing
   - Special logic for `early_life_start` trigger
   - Calls LLM for narrative and new choices

2. **dynamicTurns.ts**
   - Determines turn progression
   - Special handling for age 0 with `early_life_start` trigger
   - Controls time advancement

3. **llm.ts**
   - Generates narrative and choices
   - Special prompts for early life choices
   - Returns new pending choices

## Flow Analysis

### Current Game Start Flow

```
1. User creates character in HomePage
   └─> Creates gameState with pendingChoices: ['Take your first breath']
   └─> Saves to backend
   └─> Navigates to /play/{gameId}

2. PlayPage loads
   └─> Fetches game from backend
   └─> initializeGame() adds birth narrative
   └─> ChoiceList shows 'Take your first breath' (WITHOUT CONTEXT)

3. User clicks 'Take your first breath'
   └─> processTurn() sends to backend
   └─> Backend: early_life_start trigger detected
   └─> LLM generates:
       - Brief birth narrative
       - Question: "What will your main hobby as a child be?"
       - 4 hobby choices
   └─> Returns to frontend
   └─> Updates narrativeLines and pendingChoices
   └─> ChoiceList now shows hobby choices (WITH CONTEXT)
```

## Identified Issues

### 1. Double Display Problem

**Root Cause**: The initial game state contains a choice that requires context from the LLM, but this context isn't generated until AFTER the user clicks the choice.

**Effect**: Users see:
- First: "Take your first breath" without any narrative context
- Click it
- Then: Birth narrative + "What will your main hobby be?" + choices

### 2. Mixed Initial State

**Problem**: Game initialization happens in multiple places:
- Character creation (HomePage)
- Game loading (gameStore.initializeGame)
- First turn processing (LLM)

**Effect**: Inconsistent user experience and complex state management.

### 3. Unclear Separation of Concerns

**Problem**: Early life logic is scattered across:
- HomePage (hardcoded initial choice)
- dynamicTurns (triggeredBy logic)
- turn.ts (special handling)
- llm.ts (special prompts)
- earlyLifeChoices.ts (unused in current flow)

### 4. Inconsistent State Updates

**Problem**: Different components update game state differently:
- Initial creation sets minimal state
- initializeGame adds some narrative
- processTurn completely replaces state

### 5. No Loading States for Context

**Problem**: Choices are displayed immediately without waiting for their context to be generated.

## Technical Debt

1. **Hardcoded Special Cases**: Early life handling has special cases throughout the codebase
2. **Tight Coupling**: Frontend components directly depend on specific backend responses
3. **State Synchronization**: Multiple sources of truth for game state
4. **No State Machine**: Game flow is implicit rather than explicit

## User Experience Impact

1. **Confusion**: Seeing choices without context is jarring
2. **Redundancy**: Same choices appear twice with different presentations
3. **Inconsistency**: First turn behaves differently from all others
4. **Poor Onboarding**: New players don't understand what's happening

## Architectural Weaknesses

### 1. Initialization Pattern
- No clear "game start" event
- Initial state is incomplete
- Requires immediate server round-trip

### 2. Turn Processing
- Special cases make code hard to maintain
- No clear pipeline for different turn types
- Mixed responsibilities in turn handler

### 3. Frontend State Management
- Immediate display of incomplete data
- No loading states for context generation
- Direct coupling to backend response structure

### 4. Choice Generation
- Choices exist without their narrative context
- No validation of choice prerequisites
- Special handling scattered across files

## Recommendations Summary

1. **Implement Proper Game Initialization**
   - Generate complete initial state including narrative
   - Remove need for immediate server call

2. **Create State Machine**
   - Explicit game states (initializing, ready, processing, etc.)
   - Clear transitions between states

3. **Separate Early Life Module**
   - Consolidate all early life logic
   - Clear interface for special game phases

4. **Improve Loading States**
   - Don't show choices until context is ready
   - Progressive disclosure of game elements

5. **Unified Turn Pipeline**
   - Single path for all turn types
   - Pluggable handlers for special cases

See `InteractionSystemRefactoring.md` for detailed implementation plan.