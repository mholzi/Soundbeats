# Soundbeats - Home Assistant Music Trivia Game Integration

## Purpose
Build a complete HACS integration that turns Home Assistant into an interactive music trivia party game with a custom sidebar panel, featuring multi-team support, year guessing, betting mechanics, live leaderboards, and automated highscore tracking.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Create a production-ready HACS integration that provides a full music trivia game experience as a Home Assistant sidebar panel. The integration should support both single-admin and multi-user modes, handle Spotify/Apple Music playback, manage game state persistently, and provide an engaging, responsive UI optimized for various screen sizes.

## Why
- **Business value**: Transforms Home Assistant into an entertainment hub for parties and gatherings
- **Integration**: Leverages existing Home Assistant infrastructure and media players
- **Problems solved**: Provides zero-configuration party entertainment that works with existing smart home setup

## What
A complete Home Assistant integration that:
- Appears as a custom panel in the sidebar after HACS installation
- Manages up to 5 teams with real-time scoring
- Plays music snippets from Spotify/Apple Music
- Features year guessing with betting mechanics
- Maintains persistent game state and highscores
- Supports both admin-only and multi-user game modes
- Provides responsive UI for mobile, tablet, and TV displays

### Success Criteria
- [ ] Integration installs via HACS and appears in sidebar automatically
- [ ] Game supports 1-5 teams with customizable names
- [ ] Music playback works with Spotify media players
- [ ] Scoring system implements exact year (10pts), ±3 years (5pts), ±5 years (2pts)
- [ ] Betting doubles points for exact guesses, gives 0 for wrong
- [ ] Game state persists across Home Assistant restarts
- [ ] Multi-user mode allows team assignment and isolated controls
- [ ] All HACS validation checks pass

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
  - After EACH round, calculate and store score-per-round for comparison
  - Maintain highscores indexed by round number (e.g., best scores at round 2)
  - Show relevant highscore during gameplay (current round's historical best)
  - Update all-time best score when game ends

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
  - team-controls.js: Year slider, bet button, team name editor
  - countdown-timer.js: Animated circular progress timer
  - scoreboard.js: Real-time sorted team standings
  - admin-controls.js: Game management interface

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
  - Structure: {id, url, year, song, artist, playlist_ids}
  - Album art will come from media player attributes

CREATE custom_components/soundbeats/frontend/src/data/playlists.json:
  - Define available playlists (80s, German Party Songs, etc.)
  - Structure: {id, name, description, image_url}
  - Playlist cover images to be provided by developer

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
        # Calculate scores, reveal answer
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