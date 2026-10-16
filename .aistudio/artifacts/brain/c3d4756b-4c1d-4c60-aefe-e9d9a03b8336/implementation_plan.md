# Implementation Plan: Distill Knowledge & Research Workspace for Alberto

This document defines the production-grade specification for transforming **Alberto AI** into a Distill-grade personal research, thinking, and commitment knowledge system.

---

## 1. Codebase Audit & Storage Engine Clarification

### Storage Engine Architecture (`src/lib/supabase.ts`)
- **Dual-Mode Engine**: `src/lib/supabase.ts` inspects `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - *Remote Mode*: When valid Supabase environment credentials are present, queries run against remote Firestore/Supabase PostgreSQL tables.
  - *Local Mode (Fallback)*: When environment variables are absent, `createLocalFallbackClient()` wraps a `LocalTableQuery` instance using `localStorage` prefixed by `zeno_db_${table}`.
- **Table Schema Mapping**:
  - `chat_history` -> Stores thread messages and tool execution logs.
  - `bookmarks` -> Stores saved articles, papers, and videos.
  - `settings` -> Stores API keys (`firecrawl`, `tinyfish`) and preferred categories.
  - `vault_entries`, `sources`, `claims`, `memories`, `actions`, `distills` -> New local-first tables with auto-fallback.

---

## 2. Knowledge Entities & Claims-First Provenance Architecture

To avoid summaries that merely look credible, entries are strictly decoupled from primary sources and supporting claims:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Vault Entry   │ ────> │ Source Record   │ ────> │ Extracted Claim │
│ (Thought/Note)  │       │ (URL, arXiv, YT)│       │ (Passage/Quote) │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Entity Schemas

1. **Vault Entry**:
   - `id`: UUID string.
   - `threadId`: Optional thread reference.
   - `projectId`: Optional project scope.
   - `type`: `'thought' | 'decision' | 'observation' | 'url' | 'media' | 'action'`.
   - `content`: Primary text input or note.
   - `createdAt`, `updatedAt`: ISO 8601 timestamps.

2. **Source Record**:
   - `id`: UUID string.
   - `url`: Canonical URL.
   - `title`: Extracted title.
   - `type`: `'arxiv' | 'github' | 'youtube' | 'news' | 'web'`.
   - `retrievedAt`: ISO timestamp.
   - `fullText` / `rawSnippet`: Plain text buffer.

3. **Extracted Claim**:
   - `id`: UUID string.
   - `sourceId`: Foreign key to `Source`.
   - `verbatimQuote`: Exact snippet extracted from source.
   - `claimText`: Synthesized atomic claim or fact.
   - `confidenceScore`: `0.0` - `1.0`.

4. **Durable Memory (With Lifecycle)**:
   - `id`: UUID string.
   - `category`: `'preference' | 'constraint' | 'decision' | 'fact'`.
   - `content`: Stored knowledge point.
   - `sourceClaimId`: Provenance link to `Extracted Claim`.
   - `status`: `'proposed' | 'approved' | 'deprecated'`.
   - `userApprovedAt`: Timestamp when user accepted memory extraction.

5. **Planner Action Item (Full Recurrence)**:
   - `id`: UUID string.
   - `title`: Actionable task label.
   - `dueAt`: ISO 8601 deadline.
   - `timezone`: e.g. `'America/Los_Angeles'`.
   - `recurrenceRule`: `'NONE' | 'FREQ=DAILY' | 'FREQ=WEEKLY' | 'FREQ=MONTHLY'`.
   - `status`: `'pending' | 'completed' | 'missed'`.

---

## 3. Executable Multi-Agent Roster & Tool Pipeline

Each agent is an executable engine backed by real server routes and TypeScript utilities:

| Agent | Role | Executable Tool Pipeline | Real Backend Services |
| :--- | :--- | :--- | :--- |
| **`@Alberto`** | Primary Orchestrator | Router, Memory Extractor, Synthesis Engine | `/functions/v1/alberto-chat` |
| **`@Neo`** | GitHub & arXiv Specialist | `searchArxiv`, `searchGithub`, `fetchGithubFile` | arXiv API, GitHub REST API v3 |
| **`@Radar`** | Live News & Specs Specialist | `fetchRSSFeeds`, `getTechSpecs` | 120+ RSS feeds (`src/data/sources.ts`), Google News RSS |
| **`@Media`** | YouTube & Media Intelligence | `fetchYouTubeTranscript`, `fetchVideoDetails` | YouTube oEmbed + Transcript API proxy |

### Engaged Mode Guardrails & Rate Limits
- **Execution Budget**: Max 3 automatic agent calls per prompt turn.
- **Trigger Conditions**: Triggered only when a valid URL, YouTube video, or explicit keyword is present.
- **Rate Limit**: Max 10 automated background fetches per minute to preserve battery and network performance.

---

## 4. Local Search & Mobile Responsive Design

### Search Architecture
- **Full-Text Search (FTS)**: Local FlexSearch / regex indexing over `vault_entries`, `sources`, `claims`, and `memories`.
- **Hybrid Filter**: Combines keyword matching with project scope and month key filtering (`2026-12`).

### Android & Mobile Responsiveness
- **Desktop (1024px+)**: 3-column layout (Vault Sidebar | Chat Canvas | Sidecar Panel).
- **Tablet / Mobile (<1024px)**: Single-column view with top navigation drawer and slide-out bottom sheet for Sidecar Vault and Planner.

---

## 5. Migration & Phased Execution Roadmap

```
Step 1: Codebase Audit & Storage Engine Consolidation
 └─ Verify src/lib/supabase.ts fallback & table schemas

Step 2: Knowledge Entities, Provenance & FTS Search
 └─ Implement VaultEntry, Source, Claim, Memory, Action schemas with local FTS

Step 3: Alberto Research & Provenance Pipeline
 └─ Wire claim extraction & citation badges into /functions/v1/alberto-chat

Step 4: Executable Neo, Radar, and Media Tools
 └─ Configure RSS stream parser, YouTube transcript fallback, and GitHub code reader

Step 5: Planner, Recurrence & Weekly Reviews
 └─ Add RRULE recurrence, timezone handling, and automated weekly distill generation

Step 6: Mobile Responsive UI & Regression Testing
 └─ Single-column Android layout, offline fallback, build compilation & lint verification
```
