# Phase 3: Game State Management - Requirements Document

## 📋 Certainty Assessment Summary
**Requirements Certainty Score: 12/12** ✅
- Problem Clarity: 2/2
- Scope Definition: 2/2  
- Technical Details: 2/2
- Success Criteria: 2/2
- Edge Cases: 2/2
- UI/UX Criteria: 2/2

## 🎯 Problem Statement
Implement core game state management for the Soundbeats Home Assistant integration, enabling team creation, round progression, state persistence, and real-time WebSocket updates. This phase builds on the completed HACS structure (Phase 1) and frontend framework (Phase 2) to add the fundamental game logic.

## 📐 Detailed Requirements

### 1. Game Manager Component
**File**: `custom_components/soundbeats/game_manager.py`
- Implement `GameManager` class with async state management
- Handle game lifecycle: new_game, start_round, end_round
- Store state in `hass.data[DOMAIN][entry.entry_id]`
- Use asyncio locks for thread-safe state modifications
- Support 1-5 teams per game

### 2. Data Models
**File**: `custom_components/soundbeats/models.py`
```python
@dataclass
class Team:
    id: str
    name: str  # Dynamically editable, no validation
    score: int = 0
    current_guess: Optional[int] = None
    has_bet: bool = False

@dataclass
class GameRound:
    round_number: int
    song_id: int
    team_guesses: Dict[str, int]
    team_bets: Dict[str, bool]
    team_scores: Dict[str, int]
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
    is_active: bool = True
    created_at: datetime
```

### 3. Team Management
- Teams can update their names dynamically at any time
- No validation or character limits on team names
- Default names: "Team 1", "Team 2", etc.
- Team creation is dynamic during game setup
- Support 1-5 teams per game

### 4. State Persistence
- Store active game state in config entry data
- Maintain game history (completed games)
- Games must be fully recoverable after HA restart
- Handle mid-round recovery gracefully
- Incomplete rounds should resume from last known state
- Use `hass.data[DOMAIN][entry_id]["game_manager"]` for active state
- Persist to config entry on state changes

### 5. WebSocket API
**File**: `custom_components/soundbeats/websocket_api.py`
- All clients see all team data in real-time
- No permission filtering in Phase 3
- Commands to implement:
  - `soundbeats/new_game`: Create new game with team count
  - `soundbeats/get_game_state`: Get current state
  - `soundbeats/update_team_name`: Change team name
  - `soundbeats/add_team`: Add team (if < 5)
  - `soundbeats/remove_team`: Remove team (if > 1)
- Events to broadcast:
  - `game_state_changed`: Any state modification
  - `team_updated`: Team name/data changed
  - `game_started`: New game created
- Real-time updates on every state change

### 6. Frontend Components
**Update**: `src/soundbeats-panel.ts`
- Add game setup interface:
  - Select number of teams (1-5)
  - Team name editing fields
  - "Start Game" button
- Add basic game state display:
  - Show all teams and scores
  - Display current round number
  - Show game status (setup/active)
- WebSocket service for real-time updates
- Subscribe to state change events

### 7. Round Progression Logic
- Basic flow: setup → add teams → ready → playing
- No actual round gameplay in Phase 3
- Just state transitions and team management
- Prepare structure for Phase 4 song integration

## 🎯 Success Criteria
- ✅ Can create game with 1-5 teams
- ✅ Team names can be customized dynamically
- ✅ Game state persists after HA restart
- ✅ WebSocket updates work between frontend/backend
- ✅ Basic game flow: new game → add teams → ready state
- ✅ Game history is maintained
- ✅ Mid-round recovery works correctly
- ✅ All clients see real-time updates

## 🔧 Technical Constraints
- Must use Home Assistant's async patterns
- WebSocket cleanup on disconnect required
- State stored in config entry, not entities
- Frontend must use existing Vite build system
- All code must be type-hinted
- Follow HACS integration patterns

## 📝 Implementation Notes
- Game state is the source of truth
- Frontend is reactive to state changes
- No validation on team names per requirement
- Prepare data structures for future phases
- Consider extensibility for Phase 4 song integration

## 🚀 Next Steps
This requirements document is ready for PRP generation using the `/generate-ha-prp` command.