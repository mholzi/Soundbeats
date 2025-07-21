# 🎮 Phase 3: Game State Management - Product Requirements Prompt (PRP)

## 📋 Executive Summary
Implement comprehensive game state management for the Soundbeats Home Assistant integration, including team management, state persistence, and real-time WebSocket updates. This phase builds upon the completed HACS structure (Phase 1) and frontend framework (Phase 2) to add core game functionality.

## 🎯 Core Objectives
1. Create game manager with async state handling
2. Implement team creation and management (1-5 teams)
3. Add round progression logic and state persistence
4. Build WebSocket API for real-time updates
5. Create frontend game setup interface

## 📚 Essential Context & Documentation

### Home Assistant Developer Documentation
- **WebSocket API**: https://developers.home-assistant.io/docs/api/websocket/
  - Section: "Registering Commands" for command patterns
  - Section: "Subscribing to Events" for real-time updates
- **Config Entries**: https://developers.home-assistant.io/docs/config_entries_index/
  - Section: "Storing Data" for persistence patterns
- **Frontend Custom Panels**: https://developers.home-assistant.io/docs/frontend/custom-ui/custom-panel/
  - Section: "Lit Element Integration" for reactive UI
- **Integration Architecture**: https://developers.home-assistant.io/docs/architecture_index/
  - Section: "Async Programming" for proper patterns

### Reference Implementations
- **HACS WebSocket patterns**: https://github.com/hacs/integration/blob/main/custom_components/hacs/websocket.py
  - Excellent examples of bulk command registration and event broadcasting
- **Home Assistant JS WebSocket**: https://github.com/home-assistant/home-assistant-js-websocket
  - Client library for frontend WebSocket communication
- **Lit Element**: https://lit.dev/docs/
  - Section: "Reactive Properties" for state management
  - Section: "Lifecycle" for component updates

### Critical Implementation Notes
- **Config Entry Persistence**: `async_update_entry` has 1-minute delay - plan accordingly
- **WebSocket Cleanup**: Must unregister commands on unload to prevent memory leaks
- **State Mutations**: Never mutate ConfigEntry directly, use update methods
- **Async Patterns**: Use `@callback` decorator for sync functions in async context
- **Frontend State**: Lit's reactive properties automatically trigger re-renders

## 🏗️ Implementation Blueprint

### Data Models and Structure
```python
# models.py - Core data structures
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime
import uuid

@dataclass
class Team:
    """Represents a game team."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    score: int = 0
    current_guess: Optional[int] = None
    has_bet: bool = False

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "score": self.score,
            "current_guess": self.current_guess,
            "has_bet": self.has_bet
        }

@dataclass
class GameRound:
    """Represents a single game round."""
    round_number: int
    song_id: int = 0  # Placeholder for Phase 4
    team_guesses: Dict[str, int] = field(default_factory=dict)
    team_bets: Dict[str, bool] = field(default_factory=dict)
    team_scores: Dict[str, int] = field(default_factory=dict)
    actual_year: int = 0  # Placeholder for Phase 4
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "round_number": self.round_number,
            "song_id": self.song_id,
            "team_guesses": self.team_guesses,
            "team_bets": self.team_bets,
            "team_scores": self.team_scores,
            "actual_year": self.actual_year,
            "timestamp": self.timestamp.isoformat()
        }

@dataclass
class GameState:
    """Represents complete game state."""
    game_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    teams: List[Team] = field(default_factory=list)
    current_round: int = 0
    rounds_played: List[GameRound] = field(default_factory=list)
    playlist_id: str = "default"  # Placeholder for Phase 4
    played_song_ids: List[int] = field(default_factory=list)
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "game_id": self.game_id,
            "teams": [team.to_dict() for team in self.teams],
            "current_round": self.current_round,
            "rounds_played": [round.to_dict() for round in self.rounds_played],
            "playlist_id": self.playlist_id,
            "played_song_ids": self.played_song_ids,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: dict) -> "GameState":
        """Create GameState from dictionary."""
        state = cls(
            game_id=data.get("game_id", str(uuid.uuid4())),
            current_round=data.get("current_round", 0),
            playlist_id=data.get("playlist_id", "default"),
            played_song_ids=data.get("played_song_ids", []),
            is_active=data.get("is_active", True),
        )
        
        # Reconstruct teams
        for team_data in data.get("teams", []):
            team = Team(
                id=team_data["id"],
                name=team_data["name"],
                score=team_data["score"],
                current_guess=team_data.get("current_guess"),
                has_bet=team_data.get("has_bet", False)
            )
            state.teams.append(team)
        
        # Reconstruct rounds
        for round_data in data.get("rounds_played", []):
            game_round = GameRound(
                round_number=round_data["round_number"],
                song_id=round_data.get("song_id", 0),
                team_guesses=round_data.get("team_guesses", {}),
                team_bets=round_data.get("team_bets", {}),
                team_scores=round_data.get("team_scores", {}),
                actual_year=round_data.get("actual_year", 0)
            )
            state.rounds_played.append(game_round)
        
        return state
```

### Game Manager Implementation
```python
# game_manager.py - Core game logic
import asyncio
import logging
from typing import Optional, Dict, Any
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from .models import GameState, Team, GameRound
from .const import DOMAIN, EVENT_GAME_STATE_CHANGED

_LOGGER = logging.getLogger(__name__)

class GameManager:
    """Manages game state and operations."""
    
    def __init__(self, hass: HomeAssistant, entry_id: str) -> None:
        """Initialize game manager."""
        self.hass = hass
        self.entry_id = entry_id
        self._game_state: Optional[GameState] = None
        self._lock = asyncio.Lock()
        self._game_history: list[GameState] = []
    
    async def initialize(self) -> None:
        """Initialize game manager with persisted state."""
        # Load active game state from hass.data
        stored_data = self.hass.data[DOMAIN][self.entry_id]
        if "active_game" in stored_data:
            try:
                self._game_state = GameState.from_dict(stored_data["active_game"])
                _LOGGER.info("Restored active game state")
            except Exception as err:
                _LOGGER.error("Failed to restore game state: %s", err)
        
        # Load game history
        if "game_history" in stored_data:
            self._game_history = stored_data.get("game_history", [])
    
    async def new_game(self, team_count: int) -> GameState:
        """Create a new game with specified number of teams."""
        async with self._lock:
            # Archive current game if exists
            if self._game_state and not self._game_state.is_active:
                self._game_history.append(self._game_state.to_dict())
            
            # Create new game
            teams = []
            for i in range(team_count):
                team = Team(name=f"Team {i + 1}")
                teams.append(team)
            
            self._game_state = GameState(teams=teams)
            
            # Persist state
            await self._save_state()
            
            # Broadcast state change
            await self._broadcast_state_change()
            
            _LOGGER.info("Created new game with %d teams", team_count)
            return self._game_state
    
    async def update_team_name(self, team_id: str, name: str) -> None:
        """Update team name."""
        async with self._lock:
            if not self._game_state:
                raise ValueError("No active game")
            
            team = self._get_team(team_id)
            if team:
                team.name = name
                await self._save_state()
                await self._broadcast_state_change()
                _LOGGER.debug("Updated team %s name to %s", team_id, name)
    
    async def add_team(self) -> Optional[Team]:
        """Add a new team if under limit."""
        async with self._lock:
            if not self._game_state:
                raise ValueError("No active game")
            
            if len(self._game_state.teams) >= 5:
                return None
            
            team = Team(name=f"Team {len(self._game_state.teams) + 1}")
            self._game_state.teams.append(team)
            
            await self._save_state()
            await self._broadcast_state_change()
            
            _LOGGER.info("Added new team: %s", team.name)
            return team
    
    async def remove_team(self, team_id: str) -> bool:
        """Remove a team if more than 1 remain."""
        async with self._lock:
            if not self._game_state:
                raise ValueError("No active game")
            
            if len(self._game_state.teams) <= 1:
                return False
            
            self._game_state.teams = [t for t in self._game_state.teams if t.id != team_id]
            
            await self._save_state()
            await self._broadcast_state_change()
            
            _LOGGER.info("Removed team: %s", team_id)
            return True
    
    def get_state(self) -> Optional[Dict[str, Any]]:
        """Get current game state as dictionary."""
        if not self._game_state:
            return None
        return self._game_state.to_dict()
    
    def get_history(self) -> list[Dict[str, Any]]:
        """Get game history."""
        return self._game_history
    
    def _get_team(self, team_id: str) -> Optional[Team]:
        """Get team by ID."""
        if not self._game_state:
            return None
        return next((t for t in self._game_state.teams if t.id == team_id), None)
    
    async def _save_state(self) -> None:
        """Save current state to storage."""
        if not self._game_state:
            return
        
        # Update hass.data immediately
        self.hass.data[DOMAIN][self.entry_id]["active_game"] = self._game_state.to_dict()
        self.hass.data[DOMAIN][self.entry_id]["game_history"] = self._game_history
        
        # Note: ConfigEntry update has delay, consider Store helper for immediate persistence
    
    @callback
    def _broadcast_state_change(self) -> None:
        """Broadcast state change event."""
        async_dispatcher_send(
            self.hass,
            f"{EVENT_GAME_STATE_CHANGED}_{self.entry_id}",
            self.get_state()
        )
```

### WebSocket API Implementation
```python
# websocket_api.py - WebSocket command handlers
import logging
from typing import Any, Dict
import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from .const import DOMAIN, EVENT_GAME_STATE_CHANGED
from .game_manager import GameManager

_LOGGER = logging.getLogger(__name__)

def async_setup_websocket_api(hass: HomeAssistant) -> None:
    """Set up WebSocket API commands."""
    websocket_api.async_register_command(hass, websocket_new_game)
    websocket_api.async_register_command(hass, websocket_get_game_state)
    websocket_api.async_register_command(hass, websocket_update_team_name)
    websocket_api.async_register_command(hass, websocket_add_team)
    websocket_api.async_register_command(hass, websocket_remove_team)
    websocket_api.async_register_command(hass, websocket_subscribe_game_state)

@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/new_game",
    vol.Required("entry_id"): str,
    vol.Required("team_count"): vol.All(int, vol.Range(min=1, max=5)),
})
@websocket_api.async_response
async def websocket_new_game(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Handle new game creation."""
    entry_id = msg["entry_id"]
    team_count = msg["team_count"]
    
    if entry_id not in hass.data[DOMAIN]:
        connection.send_error(msg["id"], "invalid_entry", "Invalid entry ID")
        return
    
    game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
    
    try:
        game_state = await game_manager.new_game(team_count)
        connection.send_result(msg["id"], game_state.to_dict())
    except Exception as err:
        _LOGGER.error("Error creating new game: %s", err)
        connection.send_error(msg["id"], "game_error", str(err))

@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/get_game_state",
    vol.Required("entry_id"): str,
})
@websocket_api.async_response
async def websocket_get_game_state(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Get current game state."""
    entry_id = msg["entry_id"]
    
    if entry_id not in hass.data[DOMAIN]:
        connection.send_error(msg["id"], "invalid_entry", "Invalid entry ID")
        return
    
    game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
    state = game_manager.get_state()
    
    connection.send_result(msg["id"], {"state": state, "history": game_manager.get_history()})

@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/update_team_name",
    vol.Required("entry_id"): str,
    vol.Required("team_id"): str,
    vol.Required("name"): str,
})
@websocket_api.async_response
async def websocket_update_team_name(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Update team name."""
    entry_id = msg["entry_id"]
    
    if entry_id not in hass.data[DOMAIN]:
        connection.send_error(msg["id"], "invalid_entry", "Invalid entry ID")
        return
    
    game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
    
    try:
        await game_manager.update_team_name(msg["team_id"], msg["name"])
        connection.send_result(msg["id"], {"success": True})
    except Exception as err:
        _LOGGER.error("Error updating team name: %s", err)
        connection.send_error(msg["id"], "update_error", str(err))

@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/subscribe_game_state",
    vol.Required("entry_id"): str,
})
@websocket_api.require_admin
@websocket_api.async_response
async def websocket_subscribe_game_state(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Subscribe to game state changes."""
    entry_id = msg["entry_id"]
    
    @callback
    def forward_game_state(game_state: Dict[str, Any]) -> None:
        """Forward game state to websocket."""
        connection.send_message(
            websocket_api.event_message(msg["id"], {"state": game_state})
        )
    
    # Subscribe to state changes
    unsub = async_dispatcher_connect(
        hass,
        f"{EVENT_GAME_STATE_CHANGED}_{entry_id}",
        forward_game_state
    )
    
    # Send initial state
    if entry_id in hass.data[DOMAIN]:
        game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
        state = game_manager.get_state()
        if state:
            forward_game_state(state)
    
    # Handle unsubscribe
    connection.subscriptions[msg["id"]] = unsub
    connection.send_result(msg["id"])

# Similar implementations for add_team and remove_team...
```

### Frontend Implementation
```typescript
// src/services/websocket-service.ts
import { HomeAssistant } from "../types";

export interface GameState {
  game_id: string;
  teams: Team[];
  current_round: number;
  rounds_played: GameRound[];
  is_active: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  current_guess?: number;
  has_bet: boolean;
}

export class WebSocketService {
  private hass: HomeAssistant;
  private entryId: string;
  private subscriptionId?: number;
  
  constructor(hass: HomeAssistant, entryId: string) {
    this.hass = hass;
    this.entryId = entryId;
  }
  
  async newGame(teamCount: number): Promise<GameState> {
    const response = await this.hass.connection.sendMessagePromise({
      type: "soundbeats/new_game",
      entry_id: this.entryId,
      team_count: teamCount,
    });
    return response;
  }
  
  async getGameState(): Promise<{ state: GameState | null; history: any[] }> {
    const response = await this.hass.connection.sendMessagePromise({
      type: "soundbeats/get_game_state",
      entry_id: this.entryId,
    });
    return response;
  }
  
  async updateTeamName(teamId: string, name: string): Promise<void> {
    await this.hass.connection.sendMessagePromise({
      type: "soundbeats/update_team_name",
      entry_id: this.entryId,
      team_id: teamId,
      name: name,
    });
  }
  
  subscribeToStateChanges(callback: (state: GameState) => void): () => void {
    const unsubscribe = this.hass.connection.subscribeMessage(
      (msg) => callback(msg.state),
      {
        type: "soundbeats/subscribe_game_state",
        entry_id: this.entryId,
      }
    );
    
    return unsubscribe;
  }
}
```

```typescript
// src/components/game-setup.ts
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { WebSocketService, GameState, Team } from "../services/websocket-service";

@customElement("soundbeats-game-setup")
export class SoundbeatsGameSetup extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;
  @property() entryId!: string;
  
  @state() private gameState?: GameState;
  @state() private loading = false;
  
  private wsService?: WebSocketService;
  private unsubscribe?: () => void;
  
  static styles = css`
    :host {
      display: block;
      padding: 16px;
    }
    
    .team-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 24px 0;
    }
    
    .team-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color);
    }
    
    .team-name {
      flex: 1;
      font-size: 18px;
      border: none;
      background: transparent;
      color: var(--primary-text-color);
      outline: none;
      padding: 8px;
    }
    
    .team-name:focus {
      border-bottom: 2px solid var(--primary-color);
    }
    
    .controls {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }
    
    mwc-button {
      --mdc-theme-primary: var(--primary-color);
    }
    
    @media (max-width: 600px) {
      .controls {
        flex-direction: column;
      }
    }
  `;
  
  connectedCallback() {
    super.connectedCallback();
    this.wsService = new WebSocketService(this.hass, this.entryId);
    this.loadGameState();
    
    // Subscribe to state changes
    this.unsubscribe = this.wsService.subscribeToStateChanges((state) => {
      this.gameState = state;
    });
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  private async loadGameState() {
    this.loading = true;
    try {
      const { state } = await this.wsService!.getGameState();
      this.gameState = state || undefined;
    } catch (err) {
      console.error("Failed to load game state:", err);
    } finally {
      this.loading = false;
    }
  }
  
  private async createNewGame() {
    this.loading = true;
    try {
      const teamCount = this.gameState?.teams.length || 2;
      await this.wsService!.newGame(teamCount);
    } catch (err) {
      console.error("Failed to create game:", err);
    } finally {
      this.loading = false;
    }
  }
  
  private async updateTeamName(team: Team, event: Event) {
    const input = event.target as HTMLInputElement;
    const newName = input.value.trim();
    
    if (newName !== team.name) {
      try {
        await this.wsService!.updateTeamName(team.id, newName);
      } catch (err) {
        console.error("Failed to update team name:", err);
        // Revert on error
        input.value = team.name;
      }
    }
  }
  
  private async addTeam() {
    if (this.gameState && this.gameState.teams.length < 5) {
      try {
        await this.wsService!.addTeam();
      } catch (err) {
        console.error("Failed to add team:", err);
      }
    }
  }
  
  private async removeTeam(teamId: string) {
    if (this.gameState && this.gameState.teams.length > 1) {
      try {
        await this.wsService!.removeTeam(teamId);
      } catch (err) {
        console.error("Failed to remove team:", err);
      }
    }
  }
  
  render() {
    if (this.loading) {
      return html`<ha-circular-progress active></ha-circular-progress>`;
    }
    
    if (!this.gameState) {
      return html`
        <ha-card>
          <div class="card-content">
            <h2>Welcome to Soundbeats!</h2>
            <p>Create a new game to get started.</p>
            <div class="controls">
              <mwc-button raised @click=${this.createNewGame}>
                Create New Game
              </mwc-button>
            </div>
          </div>
        </ha-card>
      `;
    }
    
    return html`
      <ha-card>
        <div class="card-content">
          <h2>Game Setup</h2>
          
          <div class="team-list">
            ${this.gameState.teams.map(team => html`
              <div class="team-item">
                <mdi-icon icon="mdi:account-group"></mdi-icon>
                <input
                  class="team-name"
                  type="text"
                  .value=${team.name}
                  @blur=${(e: Event) => this.updateTeamName(team, e)}
                  @keyup=${(e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                />
                ${this.gameState!.teams.length > 1 ? html`
                  <mwc-icon-button
                    icon="mdi:delete"
                    @click=${() => this.removeTeam(team.id)}
                  ></mwc-icon-button>
                ` : ''}
              </div>
            `)}
          </div>
          
          <div class="controls">
            ${this.gameState.teams.length < 5 ? html`
              <mwc-button outlined @click=${this.addTeam}>
                Add Team
              </mwc-button>
            ` : ''}
            
            <mwc-button raised>
              Start Game
            </mwc-button>
          </div>
        </div>
      </ha-card>
    `;
  }
}
```

### Integration Updates
```python
# __init__.py updates
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Soundbeats from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "config": entry.data,
        "active_game": entry.data.get("active_game"),
        "game_history": entry.data.get("game_history", [])
    }
    
    # Initialize game manager
    game_manager = GameManager(hass, entry.entry_id)
    await game_manager.initialize()
    hass.data[DOMAIN][entry.entry_id]["game_manager"] = game_manager
    
    # Register WebSocket API
    async_setup_websocket_api(hass)
    
    # ... rest of setup

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # Clean up game manager
    if "game_manager" in hass.data[DOMAIN][entry.entry_id]:
        # Save final state before unloading
        game_manager = hass.data[DOMAIN][entry.entry_id]["game_manager"]
        state_data = {
            "active_game": game_manager.get_state(),
            "game_history": game_manager.get_history()
        }
        
        # Update config entry for persistence
        hass.config_entries.async_update_entry(
            entry, data={**entry.data, **state_data}
        )
    
    # ... rest of unload
```

## 📋 Implementation Tasks

### Task 1: Create Data Models
- **File**: `custom_components/soundbeats/models.py`
- Implement Team, GameRound, and GameState dataclasses
- Add serialization methods (to_dict, from_dict)
- Include type hints and docstrings

### Task 2: Implement Game Manager
- **File**: `custom_components/soundbeats/game_manager.py`
- Create GameManager class with async state handling
- Implement team CRUD operations
- Add state persistence logic
- Set up event broadcasting

### Task 3: Create WebSocket API
- **File**: `custom_components/soundbeats/websocket_api.py`
- Register WebSocket commands
- Implement handlers for all game operations
- Add subscription support for real-time updates
- Include proper error handling

### Task 4: Update Integration Setup
- **File**: `custom_components/soundbeats/__init__.py`
- Initialize game manager on setup
- Register WebSocket commands
- Handle state persistence on unload
- Add proper cleanup

### Task 5: Create Constants File
- **File**: `custom_components/soundbeats/const.py`
- Add EVENT_GAME_STATE_CHANGED constant
- Other game-related constants

### Task 6: Implement Frontend WebSocket Service
- **File**: `src/services/websocket-service.ts`
- Create service class for WebSocket communication
- Implement all command methods
- Add subscription handling
- Include TypeScript types

### Task 7: Create Game Setup Component
- **File**: `src/components/game-setup.ts`
- Build Lit Element component
- Team management UI
- Real-time state updates
- Responsive design

### Task 8: Update Main Panel Component
- **File**: `src/soundbeats-panel.ts`
- Import and use game setup component
- Handle routing between setup and game
- Pass required properties

### Task 9: Add TypeScript Types
- **File**: `src/types.ts`
- Define GameState, Team, and other interfaces
- Export for use across components

### Task 10: Build and Test
- Run `npm run build` to compile frontend
- Test in development HA instance
- Verify WebSocket communication
- Test state persistence

## ✅ Validation Gates

### Level 1: Syntax & Style
```bash
# Python validation
cd custom_components/soundbeats
python -m py_compile *.py
black . --check
pylint *.py --disable=R0903

# TypeScript validation
cd frontend
npm run lint
npm run type-check

# Expected: No errors
```

### Level 2: Unit Tests
```python
# tests/test_game_manager.py
import pytest
from custom_components.soundbeats.game_manager import GameManager
from custom_components.soundbeats.models import Team

async def test_new_game_creation():
    """Test creating a new game."""
    manager = GameManager(hass, "test_entry")
    game_state = await manager.new_game(3)
    
    assert len(game_state.teams) == 3
    assert game_state.is_active is True
    assert all(team.name.startswith("Team") for team in game_state.teams)

async def test_team_name_update():
    """Test updating team names."""
    manager = GameManager(hass, "test_entry")
    game_state = await manager.new_game(2)
    team_id = game_state.teams[0].id
    
    await manager.update_team_name(team_id, "Awesome Team")
    
    updated_state = manager.get_state()
    assert updated_state["teams"][0]["name"] == "Awesome Team"

async def test_state_persistence():
    """Test game state persistence."""
    manager = GameManager(hass, "test_entry")
    game_state = await manager.new_game(2)
    
    # Simulate restart
    new_manager = GameManager(hass, "test_entry")
    await new_manager.initialize()
    
    restored_state = new_manager.get_state()
    assert restored_state["game_id"] == game_state.game_id
```

```bash
# Run tests
pytest tests/ -v --cov=custom_components.soundbeats
# Expected: All tests pass, 80%+ coverage
```

### Level 3: Integration Test
```bash
# 1. Install in dev HA
cp -r custom_components/soundbeats /config/custom_components/

# 2. Restart HA
ha core restart

# 3. Check logs
tail -f /config/home-assistant.log | grep soundbeats

# 4. Test game flow
# - Navigate to Soundbeats panel
# - Create new game with 3 teams
# - Edit team names
# - Add/remove teams
# - Check browser console for WebSocket messages
# - Restart HA and verify state restored

# Expected: All operations work smoothly
```

### Level 4: Manual Validation
- [ ] Panel loads without errors
- [ ] Can create game with 1-5 teams
- [ ] Team names update in real-time
- [ ] Add/remove teams works correctly
- [ ] WebSocket messages show in browser DevTools
- [ ] State persists across HA restart
- [ ] Multiple browser tabs stay in sync
- [ ] No memory leaks after extended use

## 🎯 Success Metrics
1. **Functionality**: All Phase 3 requirements implemented
2. **Performance**: Real-time updates < 100ms latency
3. **Reliability**: State recovery works 100% of the time
4. **Code Quality**: Passes all linting and type checks
5. **Test Coverage**: > 80% code coverage

## ⚠️ Known Gotchas & Solutions

### ConfigEntry Update Delay
**Issue**: `async_update_entry` has 1-minute delay before disk persistence
**Solution**: Store critical state in hass.data for immediate access, consider Store helper for instant persistence

### WebSocket Connection Management
**Issue**: Connections can drop, subscriptions need cleanup
**Solution**: Use connection.subscriptions for automatic cleanup, implement reconnection in frontend

### State Mutation
**Issue**: Direct mutation of dataclasses can break reactivity
**Solution**: Always create new instances or use proper update methods

### Frontend Type Safety
**Issue**: TypeScript needs proper types for HA objects
**Solution**: Define comprehensive interfaces, use strict mode

## 📚 Additional Resources
- **WebSocket Debug**: Enable browser DevTools Network tab to monitor messages
- **State Inspection**: Use HA Developer Tools > States to view config entries
- **Memory Profiling**: Use HA System > Hardware to monitor resource usage

## 🏆 Confidence Score: 9/10

High confidence due to:
- ✅ Clear patterns from HACS and HA documentation
- ✅ Comprehensive implementation blueprint
- ✅ Detailed validation gates
- ✅ Known gotchas addressed
- ✅ Strong reference implementations

Minor uncertainty (-1):
- First-time integration of complex state management
- Potential edge cases in persistence timing

This PRP provides everything needed for successful one-pass implementation of Phase 3 Game State Management.