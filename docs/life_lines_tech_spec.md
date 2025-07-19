# **Project Codename: “LifeLines”**

*A retro‑styled, LLM‑powered Game‑of‑Life simulator*

---

## 1 · Product Vision & User Experience

### 1.1 Goal

Deliver a text‑first life‑simulation where every session spins up a brand‑new human, evolving year‑by‑year through player choices and the unseen hand of an AI Game‑Master (the LLM).  The fun lies in emergent stories, branching relationships, and the thrill of restarting to discover wildly different fates.

### 1.2 Core Pillars

| Pillar                    | Description                                                                                                                                                |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Procedural Life**       | Seeded stats, traits, birthplace, and era make each run unique.                                                                                            |
| **Stage‑Aware Turns**     | Time advances in multi‑year “macro‑turns” during childhood, then tightens to semesters by high school and single years as an adult.                        |
| **LLM Game‑Master**       | A strictly‑bounded LLM narrates events, rolls hidden dice, and outputs JSON deltas for stats, relationships, & choices.                                    |
| **Dynamic Relationships** | NPCs track intimacy, trust, attraction, and conflict; player actions continuously reshape these meters.                                                    |
| **Retro‑Terminal UX**     | Monospace green‑on‑black, typewriter animations, subtle CRT scan‑lines, and hot‑keyed choices evoke classic text adventures while staying mobile‑friendly. |

### 1.3 Player Loop

1. **Read** results of last action in the scrolling terminal feed.
2. **Study** updated stats / relationship pulses in the sidebar.
3. **Choose** among 4‑5 numbered options *or* type a custom action.
4. **Wait** for the “FateEngine” (LLM) to narrate consequences.
5. **Advance** to the next stage of life until death or victory condition.

---

## 2 · Data Models (TypeScript)

```ts
/** stats.ts */
export type Stats = {
  intelligence: number; charisma: number; strength: number;
  creativity: number;   luck: number;     health: number; wealth: number;
};

/** npc & relationship */
export type RelType =
  | "parent" | "sibling" | "friend" | "rival" | "mentor"
  | "romantic" | "spouse" | "coworker" | "child";

export type RelStats = { intimacy: number; trust: number; attraction: number; conflict: number };

export type NPC = {
  id: string; name: string; age: number; gender: string; traits: string[]; stats: Partial<Stats>;
};

export type Relationship = {
  npc: NPC; relType: RelType; relStats: RelStats;
  history: LifeEvent[]; status: "active" | "estranged" | "ended" | "deceased";
};

/** life events */
export type LifeEvent = {
  id: string; year: number; title: string; description: string;
  statChanges: Partial<Stats>; tags: string[];
  affectedRelationships?: {
    npcId: string; relStatDeltas: Partial<RelStats>; narrativeImpact: string;
  }[];
};

/** life stages */
export type LifeStage =
  | "infancy" | "earlyChild" | "middleChild" | "tween"
  | "highSchool" | "youngAdult" | "adult" | "senior";

export interface StageConfig {
  name: LifeStage;
  turnSpan: number;              // years per macro‑turn
  subTurns?: string[];           // e.g. ["Fall", "Spring", "Summer"]
  promptTags: string[];
}

export const STAGES: StageConfig[] = [/* see §3.3 */];

/** central state */
export type GameState = {
  seed: string; currentYear: number; stageLocalIndex: number;
  character: { id: string; name: string; gender: string; dob: string; birthplace: string; stats: Stats; traits: string[]; inventory: Record<string, number>; };
  relationships: Relationship[];
  events: LifeEvent[];
  pendingChoices: Choice[];
};
```

---

## 3 · Backend Architecture

### 3.1 Stack

- **Runtime:** **Bun** (latest stable) running **Hono v3** for a minimal, high‑performance REST API.
- **Database:** SQLite (file‑based) accessed via Drizzle ORM (or Bun’s better‑sqlite3 driver).
- **Hosting:** A small Ubuntu VPS (DigitalOcean) fronted by **Caddy**.  Caddy serves the static React bundle and reverse‑proxies `/api/*` to the Bun/Hono server (no Docker layer needed).
- **LLM Provider:** OpenAI GPT‑4o‑mini (function‑calling) through a thin wrapper.
- **Environment & Deploy:** `bun install && bun run start` managed by a `systemd` service; SSL & automatic cert renewal handled by Caddy.

### 3.2 Endpoint Contract

| Method | URL             | Body                          | Returns                                   |
| ------ | --------------- | ----------------------------- | ----------------------------------------- |
| POST   | `/api/turn`     | `{ gameState, playerChoice }` | `{ newGameState, narrativeLines, toast }` |
| GET    | `/api/load/:id` | –                             | `{ gameState }`                           |
| POST   | `/api/save`     | `{ gameState }`               | `{ saveId }`                              |

### 3.3 Project Structure (Bun / Hono)

```
backend/
 ├─ src/
 │   ├─ index.ts            // Hono app + routes
 │   ├─ controllers/turn.ts // handleTurn logic
 │   ├─ models/             // Drizzle schema definitions
 │   └─ utils/llm.ts        // OpenAI wrapper & schema validation
 ├─ bunfig.toml
 └─ database.sqlite
```

### 3.4 LLM Prompt (abridged)

```txt
SYSTEM
You are *FateEngine v1.1* — narrator & referee.
Return ONLY valid JSON matching:
{
 "narrative": string,         // ≤120 words
 "appliedEvent": LifeEvent,
 "nextChoices": Choice[]
}
Rules:
• Respect stage metadata: {yearsCovered}, {promptTags}.
• Total stat delta ∈ [‑20, +20]; each relStat delta ∈ [‑20,+20].
• Romantic/sexual content only if all involved ≥18.
• No hate, no sexual violence, no incest.
```

### 3.5 Moderation & Cost Control

- Every narrative passes through OpenAI Moderation.
- Cache `(seed, year, choiceId)` responses to enable cheap replays.
- Summarise history older than 5 years before feeding the prompt.

---

## 4 · Frontend Architecture

### 4.1 Tech Picks

- **React + Vite** for the UI.
- **Global State:** **Zustand** (lightweight, hooks‑first).
- **Styling:** Tailwind CSS with CRT palette variables.
- **Animations:** Framer Motion.
- **Sound:** Howler.js (optional).
- **Routing:** React Router (`/play`, `/obituary`, `/settings`).

### 4.2 Component Tree

```
<App>
 ├─ <HeaderBar/>
 ├─ <MainArea>
 │    ├─ <TerminalFeed/>     // scroll + typewriter
 │    └─ <PromptBlock>
 │         ├─ <SituationPrompt/>
 │         ├─ <ChoiceList/>
 │         └─ <CustomChoiceInput/>
 └─ <SideBar>
      ├─ <StatsPanel/>
      ├─ <RelationshipsPanel/>
      └─ <TimelineMini/>
 <NotificationToast/>
</App>
```

### 4.3 UI Behaviour Highlights

- **TerminalFeed:** char‑by‑char typewriter (≈40 ms/char), auto‑scroll with pause on manual scroll‑up.
- **ChoiceList:** hover invert, hot‑keys `1‑5`, optimistic echo.
- **Panels:** stat change flashes with ▲/▼ icons; relationship row pulses.
- **Responsive:** sidebar collapses to bottom drawer on ≤768 px width.

### 4.4 Styling Tokens (CSS vars)

```css
:root {
  --crt-bg:   #0E0E0E;
  --crt-text: #31FF4C;
  --crt-fade: #208F31;
  --crt-accent: #FFC14D;
}
```

Scanlines overlay hidden when `prefers-reduced-motion`.

### 4.5 Accessibility

- `aria-live="polite"` on TerminalFeed.
- All choices focusable; hot‑keys reflect numbers.
- High‑contrast toggle swaps green for white.

---

## 5 · LLM ↔ Frontend Contract

```ts
export interface TurnResponse {
  narrativeLines: string[];   // streaming supported
  toast: { summary: string; deltas: Partial<Stats>; relHighlights: string[] };
  newGameState: GameState;
}

export interface PlayerChoice {
  id: string;                 // from ChoiceList OR "custom"
  label?: string;             // only for custom text
}
```

---

## 6 · Dev Roadmap (8‑week MVP)

| Week  | Outcome                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------ |
| **1** | Initialise Bun project, add Hono routes scaffold, global CRT styles, TerminalFeed typing effect. |
| **2** | GameState schema, mock `/api/turn`, ChoiceList with hot‑keys.                                    |
| **3** | Integrate GPT‑4o via function calling; JSON validation util.                                     |
| **4** | StatsPanel & RelationshipsPanel animations; SQLite schema via Drizzle.                           |
| **5** | Stage system & age progression; Toast summary.                                                   |
| **6** | Save/Load endpoints, CLI seed reset, basic auth scaffold.                                        |
| **7** | TimelineMini modal; NPC spawning + romance threshold logic.                                      |
| **8** | Polish pass, SFX, mobile break‑points, moderation QA.                                            |

---

## 7 · Stretch Goals

- **Obituary Card Generator** – shareable end‑screens via image\_gen.
- **Mod Packs** – YAML rule packs for new eras (cyberpunk, medieval).
- **Tauri Desktop Build** – ship on Steam.
- **Leaderboards** – daily “wildest life” showcase.

---

## 8 · License & Attribution

Code licensed MIT; narratives belong to players.  Model outputs moderated under OpenAI policy.

---

### Quick‑Reference Thresholds

- **Stat Clamp:** `0‑100` for Stats & RelStats.
- **Close Friend:** intimacy > 70 && conflict < 30.
- **Estranged:** intimacy < 20 || conflict > 80.

*End of updated technical specification – ready for build with Bun + Hono, SQLite, Caddy, React + Zustand.*



---

## 9 · Detailed Implementation Plan

> **Note:** Estimated durations assume a small team of 1‑2 devs working \~25 h/week.  Adjust as needed.

### Phase 0 – Project Setup (1‑2 days)

| Step | Description                                                                                           |
| ---- | ----------------------------------------------------------------------------------------------------- |
| 0.1  | Create mono‑repo (`life‑lines/`) with `apps/frontend`, `apps/backend`, `packages/shared`.             |
| 0.2  | Init Bun project (`bun init`) in `apps/backend`; add Hono, Zod, OpenAI SDK, better‑sqlite3.           |
| 0.3  | Init Vite + React + TS in `apps/frontend`; install Zustand, react‑router‑dom, framer‑motion.          |
| 0.4  | Add shared `eslint`, `prettier`, `husky` githooks.                                                    |
| 0.5  | Provision bare‑metal VPS (Ubuntu 22 LTS); install Caddy; point sub‑domain `play.<your‑domain>` to it. |

### Phase 1 – Backend Core (4 days)

| Step | Description                                                                                     |
| ---- | ----------------------------------------------------------------------------------------------- |
| 1.1  | Define REST routes: `POST /turn`, `POST /save`, `GET /load/:id`, health check.                  |
| 1.2  | Implement Hono server with Zod validation middleware.                                           |
| 1.3  | Create `db.ts` wrapper around better‑sqlite3; tables: `game_states`, `users` (future), `cache`. |
| 1.4  | Implement game state helper functions (`loadGame`, `saveGame`).                                 |
| 1.5  | Configure Bun’s hot‑reload for local dev (`bun --watch`).                                       |

### Phase 2 – LLM Integration (3 days)

| Step | Description                                                                     |
| ---- | ------------------------------------------------------------------------------- |
| 2.1  | Draft **System Prompt** & JSON schema matching spec §3.4.                       |
| 2.2  | Implement `callOpenAI()` with function‑calling, retry, and exponential backoff. |
| 2.3  | Add moderation endpoint call; block/ redact responses failing policy.           |
| 2.4  | Cache `(seed, year, choiceId)` results in `cache` table.                        |
| 2.5  | Write Jest tests mocking OpenAI to validate schema conformity.                  |

### Phase 3 – Frontend Core Shell (4 days)

| Step | Description                                                 |
| ---- | ----------------------------------------------------------- |
| 3.1  | Global CRT stylesheet (vars + scanline overlay).            |
| 3.2  | Build `TerminalFeed` with typewriter effect & auto‑scroll.  |
| 3.3  | Build `ChoiceList` with hot‑keys and disabled state.        |
| 3.4  | Implement Zustand store: `gameState`, `uiState`, `actions`. |
| 3.5  | Hook `/turn` call: optimistic choice echo, suspense loader. |

### Phase 4 – Gameplay Loop & Life Stages (5 days)

| Step | Description                                                |
| ---- | ---------------------------------------------------------- |
| 4.1  | Implement `STAGES` helper + `getStage()` util.             |
| 4.2  | Encode turn advancement algorithm (§3.3) on backend.       |
| 4.3  | Render age ticker and stage progress bar (`TimelineMini`). |
| 4.4  | Toast summary component showing deltas.                    |
| 4.5  | Add skeleton for sub‑turns (high‑school semesters).        |

### Phase 5 – Relationships System (4 days)

| Step | Description                                                    |
| ---- | -------------------------------------------------------------- |
| 5.1  | Extend DB schema with `npcs` & `relationships` tables.         |
| 5.2  | Update backend state mutation to apply `relStatDeltas`.        |
| 5.3  | Frontend `RelationshipsPanel` with heart‑bar animation.        |
| 5.4  | Pulse + log when thresholds (close friend, estranged) crossed. |

### Phase 6 – Persistence & Auth (3 days)

| Step | Description                                                                        |
| ---- | ---------------------------------------------------------------------------------- |
| 6.1  | Wire `save` on every successful turn; throttle to at most once/min.                |
| 6.2  | Implement anonymous session cookie + optional Supabase Auth placeholder for later. |
| 6.3  | "Continue" screen listing prior saves.                                             |

### Phase 7 – Polish & QA (5 days)

| Step | Description                                              |
| ---- | -------------------------------------------------------- |
| 7.1  | Responsive tweaks (≤768 px drawer sidebar).              |
| 7.2  | High‑contrast theme toggle & reduced‑motion media query. |
| 7.3  | Add sound FX (typing, ding) via Howler; mute toggle.     |
| 7.4  | End‑game obituary card placeholder.                      |
| 7.5  | Manual QA pass; fix edge‑case bugs, schema drift, 404s.  |

### Phase 8 – Deployment & Monitoring (2 days)

| Step | Description                                                                       |
| ---- | --------------------------------------------------------------------------------- |
| 8.1  | Create Caddy site config with automatic HTTPS (Let’s Encrypt).                    |
| 8.2  | Systemd service for Bun server with auto‑restart.                                 |
| 8.3  | Set up Uptime Robot ping & basic logging (Vector → Loki or simple file rotation). |
| 8.4  | Tag `v0.1` Git release; write launch blog‑post.                                   |

---

### 🗂 Milestone Recap (Total ≈ 28 dev‑days)

1. **Setup**
2. **Backend Core**
3. **LLM Integration**
4. **Frontend Core**
5. **Gameplay Loop**
6. **Relationships & Persistence**
7. **Polish & QA**
8. **Deploy & Monitor**

> Shipping mantra: *“Playable first, Pretty later.”*  Keep turns < 3 s, never break the feed, and let players restart lives at will.

