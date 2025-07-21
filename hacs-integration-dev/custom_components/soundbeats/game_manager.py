"""Game manager for Soundbeats - handles game state and operations."""
import asyncio
import logging
from typing import Optional, Dict, Any, List
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
        self._game_history: List[Dict[str, Any]] = []
    
    async def initialize(self) -> None:
        """Initialize game manager with persisted state."""
        # Load active game state from hass.data
        stored_data = self.hass.data[DOMAIN][self.entry_id]
        if "active_game" in stored_data and stored_data["active_game"]:
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
            self._broadcast_state_change()
            
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
                self._broadcast_state_change()
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
            self._broadcast_state_change()
            
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
            self._broadcast_state_change()
            
            _LOGGER.info("Removed team: %s", team_id)
            return True
    
    def get_state(self) -> Optional[Dict[str, Any]]:
        """Get current game state as dictionary."""
        if not self._game_state:
            return None
        return self._game_state.to_dict()
    
    def get_history(self) -> List[Dict[str, Any]]:
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