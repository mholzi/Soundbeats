# Soundbeats - Home Assistant Music Trivia Game Integration
## Phased Implementation Plan

### Project Overview
Build a complete HACS integration that turns Home Assistant into an interactive music trivia party game with a custom sidebar panel, featuring multi-team support, year guessing, betting mechanics, live leaderboards, and automated highscore tracking.

### Core Principles
1. **Phased Development**: Each phase delivers testable functionality
2. **Progressive Complexity**: Start with basics, build advanced features incrementally  
3. **Validation Gates**: Each phase has specific success criteria
4. **Context Rich**: Include all necessary documentation and patterns
5. **Global Rules**: Follow all rules in CLAUDE.md

---

## 🚀 PHASE-BY-PHASE IMPLEMENTATION

### Phase 1: Foundation & HACS Structure
**Goal**: Create basic HACS integration structure that loads without errors

**Deliverables**:
- Basic integration structure (`__init__.py`, `manifest.json`, `const.py`)
- HACS compliance files (`hacs.json`, `README.md`, `info.md`)
- Panel registration (empty panel that appears in sidebar)
- GitHub repository structure with proper workflows

**Success Criteria**:
- [ ] Integration appears in HACS
- [ ] Installs without errors
- [ ] Sidebar shows "Soundbeats" panel with icon
- [ ] Panel loads empty page successfully
- [ ] All HACS validation checks pass
- [ ] GitHub Actions CI passes

**Test Method**: Install via HACS, verify panel appears, check logs for errors

---

### Phase 2: Basic Frontend Framework  
**Goal**: Set up frontend build pipeline and basic panel UI

**Deliverables**:
- Frontend build system (webpack, package.json)
- Basic Lit Element panel component
- Home Assistant styling integration
- Static file serving configuration
- Basic responsive layout structure

**Success Criteria**:
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Panel displays "Soundbeats Game" header
- [ ] Responsive design works on mobile/desktop
- [ ] Uses Home Assistant theme variables
- [ ] Bundle size under 500KB

**Test Method**: Navigate to panel, test responsive behavior, check bundle size

---

### Phase 3: Game State Management
**Goal**: Core game logic and state persistence

**Deliverables**:
- Game manager component with state handling
- Team creation and management (1-5 teams)
- Round progression logic
- State persistence across HA restarts
- Basic WebSocket API for state updates

**Success Criteria**:
- [ ] Can create game with 1-5 teams
- [ ] Team names can be customized
- [ ] Game state persists after HA restart
- [ ] WebSocket updates work between frontend/backend
- [ ] Basic game flow: new game → add teams → ready state

**Test Method**: Create game, restart HA, verify state restored, test WebSocket connection

---

### Phase 4: Song Database & Music Integration
**Goal**: Song database and media player integration

**Deliverables**:
- Song database with year, artist, title data
- Playlist management system
- Media player entity integration
- Spotify URL playback functionality
- Song selection logic for rounds

**Success Criteria**:
- [ ] Song database loads with 50+ songs
- [ ] Can select different playlists (80s, 90s, etc.)
- [ ] Media player integration works with Spotify
- [ ] Songs play for specified duration (30 seconds)
- [ ] Random song selection without repeats

**Test Method**: Select playlist, start playback, verify 30-second clips work

---

### Phase 5: Basic Scoring System
**Goal**: Implement year guessing and scoring mechanics

**Deliverables**:
- Year input interface (slider/input field)
- Scoring algorithm (10pts exact, 5pts ±3yr, 2pts ±5yr)
- Round completion with score calculation
- Basic scoreboard display
- Answer reveal functionality

**Success Criteria**:
- [ ] Teams can submit year guesses
- [ ] Scoring works correctly for all point ranges
- [ ] Scoreboard updates after each round
- [ ] Answer reveal shows correct year and song info
- [ ] Scores persist across rounds

**Test Method**: Play complete round with multiple teams, verify all scoring scenarios

---

### Phase 6: Timer & Round Management
**Goal**: Add countdown timer and automated round progression

**Deliverables**:
- Countdown timer component (30 seconds default)
- Timer synchronization across all connected clients
- Automatic round progression when timer expires
- Admin controls for round management
- Round history tracking

**Success Criteria**:
- [ ] Timer counts down visually for all users
- [ ] Timer expiry prevents new guesses
- [ ] Admin can start/end rounds manually
- [ ] Round history shows previous results
- [ ] Timer works consistently across page refreshes

**Test Method**: Start round, verify timer syncs across multiple browser windows

---

### Phase 7: Betting Mechanics & Advanced Scoring  
**Goal**: Add betting system and advanced scoring features

**Deliverables**:
- Betting interface (bet button per team)
- Betting logic (doubles points for exact, 0 for wrong)
- Hot streak detection (3+ consecutive correct)
- Hot streak bonus rounds
- Enhanced scoring feedback

**Success Criteria**:
- [ ] Teams can place bets before guessing
- [ ] Betting doubles exact match points (20pts)
- [ ] Wrong bets give 0 points (no partial credit)
- [ ] Hot streak triggers after 3 consecutive correct
- [ ] Hot streak bonus round activates correctly

**Test Method**: Test betting scenarios, verify hot streak detection and bonuses

---

### Phase 8: Team Management & Multi-User Support
**Goal**: Advanced team features and multi-user functionality

**Deliverables**:
- Team assignment to Home Assistant users
- User role management (admin vs team member)
- Team-specific views and controls
- Comeback round detection (rounds 5, 10, 15)
- 3x point multiplier for bottom 2 teams in comeback rounds

**Success Criteria**:
- [ ] Users can be assigned to specific teams
- [ ] Team members only see their team's controls
- [ ] Admin sees full game management interface  
- [ ] Comeback rounds activate automatically
- [ ] Bottom 2 teams get 3x multiplier correctly

**Test Method**: Test with multiple HA user accounts, verify role isolation

---

### Phase 9: Animations & Visual Enhancements
**Goal**: Add celebration animations and enhanced UI

**Deliverables**:
- Team celebration animations
- Animated leaderboard position changes
- Sound effects for game events
- Enhanced timer visual effects
- Team customization (colors, celebration styles)

**Success Criteria**:
- [ ] Team celebrations play on round wins (max 3 seconds)
- [ ] Leaderboard animates position changes smoothly
- [ ] Sound effects work for scoring events
- [ ] Timer has visual flair (color changes, pulsing)
- [ ] Teams can customize appearance

**Test Method**: Complete game session, verify all animations play correctly

---

### Phase 10: Highscores & Game Completion
**Goal**: Persistent highscore tracking and game completion features

**Deliverables**:
- Highscore database and tracking
- Score-per-round calculations
- Historical comparison system
- Game completion ceremony
- Export/sharing functionality

**Success Criteria**:
- [ ] Highscores persist across games
- [ ] Shows relevant historical bests during gameplay
- [ ] Game completion shows final rankings
- [ ] Can export/share game results
- [ ] All-time leaderboard functions correctly

**Test Method**: Complete multiple games, verify highscore accuracy and persistence

---

## 📋 IMPLEMENTATION WORKFLOW

### How to Use This Plan with `/feature` Command

For each phase, use the `/feature` command to create detailed requirements:

1. **Start Phase**: `/feature Phase X - [Phase Name]`
2. **Select**: `feature` (for new functionality)  
3. **Provide Context**: Reference this planning document and specific phase goals
4. **Generate Requirements**: Let the feature command guide you through detailed requirements gathering
5. **Create PRP**: Use `/generate-ha-prp` on the generated requirements
6. **Implement**: Use `/execute-ha-prp` on the generated PRP

### Phase Dependencies

- **Phases 1-2**: Independent foundation work
- **Phase 3**: Depends on Phase 2 (frontend framework)
- **Phase 4**: Depends on Phase 3 (game state)
- **Phase 5**: Depends on Phase 4 (song integration)  
- **Phase 6**: Depends on Phase 5 (basic scoring)
- **Phase 7**: Depends on Phase 6 (timer system)
- **Phase 8**: Depends on Phase 7 (advanced scoring)
- **Phase 9**: Depends on Phase 8 (multi-user)
- **Phase 10**: Depends on Phase 9 (complete game)

### Quality Gates

Each phase must pass:
- ✅ All Success Criteria completed
- ✅ Test Method validates functionality  
- ✅ HACS validation passes
- ✅ No Home Assistant log errors
- ✅ Frontend console error-free
- ✅ Integration survives HA restart

---

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://www.hacs.xyz/docs/publish/
  why: HACS publishing requirements and validation rules
  
- url: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-panel/
  why: Custom panel registration and frontend integration patterns
  
- url: https://github.com/Clooos/Bubble-Card
  why: Reference implementation for complex HACS UI integration
  section: src/cards/ for component structure patterns
  
- url: https://lit.dev/docs/
  why: Lit Element framework for web components
  section: Reactive properties, lifecycle, styling
  
- url: https://developers.home-assistant.io/docs/api/websocket/
  why: WebSocket API for real-time state updates
  
- url: https://www.home-assistant.io/integrations/media_player/
  why: Media player service calls and state attributes
  
- docfile: initial.md
  why: Complete feature requirements and user stories

- url: https://developers.home-assistant.io/docs/development_validation/
  why: Integration quality guidelines
```

### Current Codebase tree
```bash
.
├── LICENSE
├── README.md
├── claude.md
├── initial.md
└── PRPs/
    └── templates/
        └── prp_base.md
```

### Desired Codebase tree with files to be added
```bash
.
├── custom_components/
│   └── soundbeats/
│       ├── __init__.py              # Integration setup, panel registration
│       ├── manifest.json            # HA integration manifest
│       ├── panel.py                 # Panel configuration and routing
│       ├── game_manager.py          # Core game logic and state management
│       ├── media_controller.py      # Media player interface
│       ├── websocket_api.py         # WebSocket handlers for real-time updates
│       └── frontend/                # Frontend assets
│           ├── index.html           # Panel HTML entry point
│           ├── soundbeats-panel.js  # Main panel component
│           ├── src/
│           │   ├── components/      # UI components
│           │   │   ├── game-board.js       # Main game interface
│           │   │   ├── team-controls.js    # Team guessing interface
│           │   │   ├── scoreboard.js       # Live leaderboard
│           │   │   ├── admin-controls.js   # Admin game controls
│           │   │   ├── countdown-timer.js  # Animated countdown
│           │   │   └── song-reveal.js      # Post-round song info (album art from media player)
│           │   ├── services/        # Business logic
│           │   │   ├── game-service.js     # Game state management
│           │   │   ├── websocket-service.js # Real-time communication
│           │   │   └── media-service.js    # Media player control
│           │   ├── styles/          # Styling
│           │   │   ├── game-theme.js       # Custom game visual theme
│           │   │   ├── animations.js       # Game animations and transitions
│           │   │   └── responsive.js       # Mobile/tablet/TV layouts
│           │   └── data/            # Game data
│           │       ├── songs.json          # Hardcoded song database
│           │       ├── playlists.json      # Playlist definitions with cover art
│           │       └── playlist-images/    # Playlist cover art images
│           └── dist/                # Built files (git-ignored)
├── hacs.json                        # HACS configuration
├── .github/
│   └── workflows/
│       └── validate.yaml            # HACS validation workflow
├── README.md                        # User documentation
├── package.json                     # Frontend dependencies
├── webpack.config.js               # Build configuration
├── tests/
│   ├── test_init.py                # Integration tests
│   ├── test_game_manager.py        # Game logic tests
│   ├── test_media_controller.py    # Media player tests
│   └── test_websocket_api.py       # WebSocket tests
└── .gitignore                      # Ignore built files, etc.
```

### Known Gotchas & Library Quirks
```python
# CRITICAL: Home Assistant requires specific directory structure for panels
# CRITICAL: Frontend files must be served via hass.http.register_static_path
# CRITICAL: WebSocket subscriptions need proper cleanup on disconnect
# CRITICAL: Media player must have source selected before Spotify playback
# CRITICAL: Lit Element requires TypeScript compilation for optimal performance
# CRITICAL: HACS validation requires exact directory structure
# CRITICAL: Game state must be stored in integration's config entry, not HA entities
# CRITICAL: Multi-user mode requires checking hass.user for permissions
# CRITICAL: Store only highscores in persistent storage, not full game history
# CRITICAL: Highscores must be comparable by round number (e.g., all round 2 scores)
# CRITICAL: Custom game theme with animations, not default HA styling
# CRITICAL: Timer expiry locks answers but waits for admin to advance rounds
# CRITICAL: Comeback rounds must be clearly indicated in UI before they start
# CRITICAL: Hot streak calculation must account for partial points (±3, ±5 years count as correct)
# CRITICAL: Celebration animations must not block game flow - max 3 seconds
# CRITICAL: Leaderboard animations need debouncing to prevent performance issues
```

## Implementation Blueprint

### Data models and structure

```python
# models.py - Core data structures for game state
from dataclasses import dataclass
from typing import List, Dict, Optional
from datetime import datetime

@dataclass
class Team:
    id: str
    name: str
    score: int = 0
    current_guess: Optional[int] = None
    has_bet: bool = False
    assigned_user: Optional[str] = None  # HA user ID
    consecutive_correct: int = 0  # For hot streak tracking
    celebration_type: str = "default"  # Animation preference
    previous_position: int = 0  # For leaderboard animation

@dataclass
class GameRound:
    round_number: int
    song_id: int
    team_guesses: Dict[str, int]  # team_id -> year guess
    team_bets: Dict[str, bool]    # team_id -> bet placed
    team_scores: Dict[str, int]   # team_id -> points earned
    actual_year: int
    timestamp: datetime

@dataclass
class GameState:
    game_id: str
    teams: List[Team]
    current_round: int
    rounds_played: List[GameRound]
    playlist_id: str
    played_song_ids: List[int]
    timer_seconds: int = 30
    is_active: bool = True
    created_at: datetime = None
    is_comeback_round: bool = False  # True for rounds 5, 10, 15, etc.
    bonus_round_active: bool = False  # True when hot streak bonus triggered
    bonus_round_team_id: Optional[str] = None  # Team that triggered bonus

@dataclass
class HighscoreEntry:
    team_name: str
    score_per_round: float  # Score divided by rounds played
    rounds_played: int      # Number of rounds when this score was achieved
    date: datetime
    playlist_id: str

@dataclass
class HighscoreTracker:
    by_round: Dict[int, List[HighscoreEntry]]  # round_number -> top scores at that round
    all_time_best: HighscoreEntry              # Best average score ever
    
@dataclass
class Song:
    id: int
    url: str
    year: int
    song: str
    artist: str
    playlist_ids: List[str]  # Which playlists include this song

@dataclass
class Playlist:
    id: str
    name: str
    description: str
    image_url: str  # Cover art for the playlist
```

### List of tasks to be completed

```yaml
Task 1: Setup Integration Structure and Configuration
CREATE custom_components/soundbeats/__init__.py:
  - PATTERN: Follow HA integration setup pattern
  - Register panel with sidebar icon and title
  - Initialize game state storage in config entry
  - Setup WebSocket API handlers

CREATE custom_components/soundbeats/manifest.json:
  - PATTERN: Standard HA manifest structure
  - Dependencies: ["frontend", "websocket_api", "media_player"]
  - Version: "1.0.0"

CREATE hacs.json:
  - PATTERN: HACS configuration for panel integration
  - Set correct domains and requirements

Task 2: Implement Game State Management
CREATE custom_components/soundbeats/game_manager.py:
  - PATTERN: Async state management with proper locking
  - Store state in self.hass.data[DOMAIN][entry.entry_id]
  - Implement game lifecycle: new_game, start_round, end_round
  - Calculate scores based on guessing rules
  - **NEW: Implement comeback round detection (rounds 5, 10, 15, etc.)**
  - **NEW: Track consecutive correct answers for hot streak**
  - **NEW: Apply 3x multiplier for bottom 2 teams in comeback rounds**
  - **NEW: Trigger bonus round after 3 consecutive correct guesses**
  - After EACH round, calculate and store score-per-round for comparison
  - Maintain highscores indexed by round number (e.g., best scores at round 2)
  - Show relevant highscore during gameplay (current round's historical best)
  - Update all-time best score when game ends
  - **NEW: Update team positions for leaderboard animations**

Task 3: Implement Media Player Controller
CREATE custom_components/soundbeats/media_controller.py:
  - PATTERN: Async media player control
  - Handle Spotify URL playback with source selection
  - Implement play_snippet(duration) with auto-pause
  - Volume control and playback state monitoring
  - Graceful error handling for disconnected players

Task 4: Create WebSocket API
CREATE custom_components/soundbeats/websocket_api.py:
  - PATTERN: HA WebSocket command registration
  - Commands: get_game_state, submit_guess, start_round, etc.
  - Real-time event broadcasting for state changes
  - User permission checking for multi-user mode

Task 5: Build Frontend Panel Structure
CREATE custom_components/soundbeats/frontend/index.html:
  - PATTERN: Panel HTML entry point
  - Load soundbeats-panel.js as module
  - Include HA frontend compatibility

CREATE custom_components/soundbeats/frontend/soundbeats-panel.js:
  - PATTERN: Lit Element custom element
  - Connect to WebSocket API
  - Route between game views based on user role
  - Handle responsive layout

Task 6: Implement Core UI Components
CREATE custom_components/soundbeats/frontend/src/components/:
  - PATTERN: Lit Element components with HA styling
  - game-board.js: Main game interface with conditional rendering
    - **NEW: Comeback round indicator banner**
    - **NEW: Hot streak progress indicator**
  - team-controls.js: Year slider, bet button, team name editor
    - **NEW: Celebration picker in team settings**
  - countdown-timer.js: Animated circular progress timer
  - scoreboard.js: Real-time sorted team standings
    - **NEW: Animated position transitions**
    - **NEW: Score change sound effects**
    - **NEW: Team celebration animations**
  - admin-controls.js: Game management interface
  - **NEW: celebration-library.js: Team victory animations**
  - **NEW: sound-effects.js: Audio feedback for game events**

Task 7: Implement Frontend Services
CREATE custom_components/soundbeats/frontend/src/services/:
  - PATTERN: ES6 modules with async/await
  - websocket-service.js: Connection management, command sending
  - game-service.js: State management, score calculations
  - media-service.js: Media player control via service calls

Task 8: Add Song and Playlist Database
CREATE custom_components/soundbeats/frontend/src/data/songs.json:
  - Create structure for songs (URLs to be provided by developer)
  - Include placeholder for default song list
  - Structure: {id, url, year, song, artist, playlist_ids, difficulty}
  - **NEW: Add difficulty rating (1-5) for bonus round selection**
  - Album art will come from media player attributes

CREATE custom_components/soundbeats/frontend/src/data/playlists.json:
  - Define available playlists (80s, German Party Songs, etc.)
  - Structure: {id, name, description, image_url}
  - Playlist cover images to be provided by developer

CREATE custom_components/soundbeats/frontend/src/data/celebrations.json:
  - **NEW: Define celebration animations library**
  - Structure: {id, name, animation_class, duration, sound_effect}

Task 9: Setup Build Pipeline
CREATE package.json:
  - Dependencies: lit, webpack, typescript
  - Scripts: dev (unminified), build (production)

CREATE webpack.config.js:
  - PATTERN: Standard webpack configuration
  - Entry: soundbeats-panel.js
  - Output: dist/soundbeats.js
  - Enable source maps for dev

Task 10: Add Comprehensive Tests
CREATE tests/:
  - PATTERN: pytest-homeassistant patterns
  - Mock WebSocket connections
  - Test game logic edge cases
  - Test media player integration
  - Ensure state persistence works

Task 11: Create Documentation
UPDATE README.md:
  - Installation via HACS
  - Initial configuration
  - Game modes explanation
  - Troubleshooting guide

Task 12: Add HACS Validation
CREATE .github/workflows/validate.yaml:
  - PATTERN: HACS validation action
  - Run on push and PR
```

### Per task pseudocode

```python
# Task 2: Game Manager - Core game logic
class GameManager:
    def __init__(self, hass, entry):
        self.hass = hass
        self.entry = entry
        self._game_state = None
        self._lock = asyncio.Lock()
    
    async def new_game(self, team_count: int, playlist_id: str) -> GameState:
        # PATTERN: Always use lock for state modifications
        async with self._lock:
            # Create teams with default names
            teams = [Team(id=f"team_{i}", name=f"Team {i+1}") 
                    for i in range(team_count)]
            
            # Initialize new game state
            self._game_state = GameState(
                game_id=str(uuid.uuid4()),
                teams=teams,
                current_round=0,
                rounds_played=[],
                playlist_id=playlist_id,
                played_song_ids=[],
                created_at=datetime.now()
            )
            
            # Persist to config entry
            await self._save_state()
            
            # Broadcast state change via WebSocket
            await self._broadcast_state_change("game_started")
            
            return self._game_state
    
    async def submit_guess(self, team_id: str, year: int, has_bet: bool):
        # CRITICAL: Validate timer is still running
        if not self._is_timer_active():
            raise ValueError("Timer has expired")
        
        # Update team's current guess
        team = self._get_team(team_id)
        team.current_guess = year
        team.has_bet = has_bet
        
        # Broadcast update
        await self._broadcast_state_change("guess_submitted", {
            "team_id": team_id,
            "year": year,
            "has_bet": has_bet
        })
    
    async def end_round(self):
        # Calculate scores with comeback multiplier
        current_round = self._game_state.current_round
        is_comeback = current_round % 5 == 0  # Rounds 5, 10, 15, etc.
        
        # Get bottom 2 teams before scoring
        sorted_teams = sorted(self._game_state.teams, key=lambda t: t.score)
        bottom_teams = [t.id for t in sorted_teams[:2]] if len(sorted_teams) > 2 else []
        
        # Calculate scores for each team
        for team in self._game_state.teams:
            base_score = self._calculate_base_score(team.current_guess, actual_year, team.has_bet)
            
            # Apply comeback multiplier
            if is_comeback and team.id in bottom_teams:
                final_score = base_score * 3
            else:
                final_score = base_score
            
            # Update consecutive correct counter
            if base_score > 0:
                team.consecutive_correct += 1
                # Check for hot streak bonus
                if team.consecutive_correct >= 3:
                    await self._trigger_hot_streak_bonus(team.id)
            else:
                team.consecutive_correct = 0
            
            team.score += final_score
        
        # Update positions for leaderboard animation
        await self._update_team_positions()
        
        # But DON'T auto-advance - wait for admin "Next Round" click

# Task 4: WebSocket API implementation
async def websocket_get_game_state(hass, connection, msg):
    """Handle get_game_state websocket command."""
    # PATTERN: Get game manager from hass.data
    game_manager = hass.data[DOMAIN][msg["entry_id"]]["game_manager"]
    
    # Check user permissions in multi-user mode
    user = connection.user
    if user and not user.is_admin:
        # Filter state to only show user's team
        state = game_manager.get_filtered_state(user.id)
    else:
        state = game_manager.get_state()
    
    connection.send_result(msg["id"], state)

# Task 6: Frontend component example - Countdown Timer
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('countdown-timer')
export class CountdownTimer extends LitElement {
    @property({ type: Number }) timeRemaining = 30;
    @property({ type: Number }) totalTime = 30;
    
    static styles = css`
        :host {
            display: block;
            --timer-size: 200px;
        }
        
        .timer-container {
            position: relative;
            width: var(--timer-size);
            height: var(--timer-size);
        }
        
        .timer-ring {
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
        }
        
        .timer-ring-circle {
            stroke: var(--primary-color);
            stroke-dasharray: 628; /* 2 * PI * 100 */
            stroke-dashoffset: calc(628 * (1 - var(--progress)));
            transition: stroke-dashoffset 1s linear;
        }
        
        .timer-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            font-weight: bold;
            color: var(--primary-text-color);
        }
        
        /* Comeback round special styling */
        :host([comeback-round]) .timer-ring-circle {
            stroke: var(--warning-color);
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
        
        @media (max-width: 600px) {
            :host {
                --timer-size: 150px;
            }
            .timer-text {
                font-size: 2rem;
            }
        }
    `;
    
    render() {
        const progress = this.timeRemaining / this.totalTime;
        
        return html`
            <div class="timer-container" style="--progress: ${progress}">
                <svg class="timer-ring" viewBox="0 0 200 200">
                    <circle
                        class="timer-ring-background"
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke="var(--divider-color)"
                        stroke-width="10"
                    />
                    <circle
                        class="timer-ring-circle"
                        cx="100"
                        cy="100"
                        r="90"
                        fill="none"
                        stroke-width="10"
                    />
                </svg>
                <div class="timer-text">${this.timeRemaining}</div>
            </div>
        `;
    }
}

// NEW: Scoreboard component with animations
@customElement('soundbeats-scoreboard')
export class SoundbeatsScoreboard extends LitElement {
    @property({ type: Array }) teams = [];
    @property({ type: Object }) previousPositions = {};
    
    static styles = css`
        .team-row {
            transition: transform 0.5s ease-in-out;
            position: relative;
        }
        
        .position-change {
            animation: scoreFlash 0.5s;
        }
        
        @keyframes scoreFlash {
            0% { background-color: var(--primary-color); }
            100% { background-color: transparent; }
        }
        
        .celebration {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }
        
        .celebration.fireworks {
            background: url('/local/soundbeats/animations/fireworks.gif');
            animation: celebrationFade 3s forwards;
        }
        
        @keyframes celebrationFade {
            0% { opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    
    updated(changedProperties) {
        if (changedProperties.has('teams')) {
            this._animatePositionChanges();
            this._playScoreSounds();
        }
    }
    
    _animatePositionChanges() {
        // Calculate position changes and trigger animations
        this.teams.forEach((team, index) => {
            const prevPos = this.previousPositions[team.id] || index;
            if (prevPos !== index) {
                // Position changed - trigger animation
                this._playPositionChangeSound(prevPos > index ? 'up' : 'down');
            }
        });
    }
}
```

### Integration Points
```yaml
HOME_ASSISTANT:
  - Panel Registration: __init__.py:async_setup_entry()
  - WebSocket Commands: websocket_api.py registration
  - Service Calls: Media player control via hass.services
  - State Storage: hass.data[DOMAIN][entry_id]
  
FRONTEND:
  - Entry Point: /soundbeats panel URL
  - WebSocket: /api/websocket connection
  - Styling: Use HA CSS variables (--primary-color, etc.)
  - Icons: Material Design Icons via mdi:
  
MEDIA_PLAYERS:
  - Entity Selection: Store in config entry
  - Service Calls: media_player.play_media, volume_set
  - State Monitoring: Subscribe to state_changed events
  
BUILD:
  - Development: npm run dev (webpack --mode development --watch)
  - Production: npm run build (webpack --mode production)
  - Output: dist/soundbeats.js (minified, <500KB)
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Python validation
cd custom_components/soundbeats
python -m py_compile *.py  # Syntax check
black *.py                  # Format code
pylint *.py                 # Linting

# JavaScript/TypeScript validation  
cd frontend
npm run lint               # ESLint
npm run type-check        # TypeScript compiler

# Expected: No errors. Fix any issues before proceeding.
```

### Level 2: Unit Tests
```python
# test_game_manager.py
async def test_scoring_exact_year():
    """Test 10 points for exact year match"""
    manager = GameManager(hass, entry)
    await manager.new_game(2, "playlist_80s")
    await manager.submit_guess("team_0", 1985, False)
    
    score = manager.calculate_score(1985, 1985, False)
    assert score == 10

async def test_scoring_with_bet():
    """Test betting doubles points for exact match"""
    score = manager.calculate_score(1985, 1985, True)
    assert score == 20
    
    score = manager.calculate_score(1985, 1990, True)
    assert score == 0  # No partial points with bet

async def test_media_player_disconnect():
    """Test graceful handling of disconnected player"""
    controller = MediaController(hass, "media_player.spotify")
    
    # Simulate disconnected state
    hass.states.async_set("media_player.spotify", "unavailable")
    
    result = await controller.play_snippet("spotify:track:123", 30)
    assert result.success is False
    assert "unavailable" in result.error
```

```bash
# Run tests
pytest tests/ -v --cov=custom_components.soundbeats
# Expected: 80%+ coverage, all tests pass
```

### Level 3: Integration Test
```bash
# 1. Install in development HA instance
cp -r custom_components/soundbeats /config/custom_components/

# 2. Restart Home Assistant
ha core restart

# 3. Check logs for errors
tail -f /config/home-assistant.log | grep soundbeats

# 4. Verify panel appears in sidebar
# Expected: "Soundbeats" item with music note icon

# 5. Test game flow
# - Start new game
# - Submit guesses via UI
# - Verify media player receives commands
# - Check WebSocket messages in browser DevTools

# 6. Test persistence
ha core restart
# Verify game state restored
```

### Level 4: HACS Validation
```bash
# Run HACS validation locally
pip install hacs-action
hacs-action --category integration

# GitHub Actions will also run this
git push origin main
# Check Actions tab for validation results

# Expected: All checks pass
# - Repository structure ✓
# - Manifest valid ✓
# - Version numbers match ✓
# - Documentation exists ✓
```

## Final Validation Checklist
- [ ] All Python tests pass: `pytest tests/ -v`
- [ ] No linting errors: `black . && pylint custom_components/soundbeats`
- [ ] Frontend builds successfully: `npm run build`
- [ ] Bundle size < 500KB: `ls -lh frontend/dist/`
- [ ] HACS validation passes: All GitHub checks green
- [ ] Manual test: Complete game flow works
- [ ] **Comeback rounds: 3x multiplier applies correctly to bottom 2 teams**
- [ ] **Hot streak: Bonus round triggers after 3 correct guesses**
- [ ] **Celebrations: Play without blocking game flow (max 3 seconds)**
- [ ] **Leaderboard: Smooth position animations with sound effects**
- [ ] Multi-user mode: Team isolation verified
- [ ] Media player: Spotify playback confirmed
- [ ] Persistence: State survives restart
- [ ] Mobile UI: Responsive on small screens
- [ ] TV mode: Spectator view readable from distance
- [ ] README includes setup instructions

---

## Anti-Patterns to Avoid
- ❌ Don't store game state in HA entities - use config entry data
- ❌ Don't skip WebSocket cleanup - memory leaks crash HA
- ❌ Don't hardcode media player entity - use configuration
- ❌ Don't ignore HACS validation - it catches real issues
- ❌ Don't bundle unnecessary libraries - use HA's built-ins
- ❌ Don't forget mobile optimization - many users play on phones
- ❌ Don't mix async/sync code - HA requires full async
- ❌ Don't trust user input - validate all WebSocket messages
- ❌ Don't use HA's default theme - create distinctive game visuals
- ❌ Don't aggregate scores only at game end - update after each round
- ❌ **Don't apply comeback multiplier to all teams - only bottom 2**
- ❌ **Don't reset hot streak on partial correct (±3, ±5) - only on wrong**
- ❌ **Don't block UI during celebrations - keep game interactive**
- ❌ **Don't update positions without debouncing - causes janky animations**

## Confidence Score: 9/10

High confidence due to:
- Clear patterns from Bubble Card reference
- Well-documented HA APIs and integration guidelines  
- Specific requirements with detailed game logic
- Comprehensive validation gates at each level
- Established HACS publishing process

Minor uncertainty around:
- Exact Apple Music URL handling (may need Music Assistant)
- First-time HACS publishing approval process

The implementation path is clear with strong reference examples and thorough documentation available.