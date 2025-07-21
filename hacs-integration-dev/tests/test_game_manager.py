"""Test the game manager functionality."""
import pytest
from unittest.mock import Mock, patch
import asyncio
from datetime import datetime

# Mock Home Assistant imports
import sys
sys.modules['homeassistant'] = Mock()
sys.modules['homeassistant.core'] = Mock()
sys.modules['homeassistant.helpers'] = Mock()
sys.modules['homeassistant.helpers.dispatcher'] = Mock()

from custom_components.soundbeats.game_manager import GameManager
from custom_components.soundbeats.models import GameState, Team


class TestGameManager:
    """Test the GameManager class."""
    
    @pytest.fixture
    def hass(self):
        """Mock Home Assistant instance."""
        hass = Mock()
        hass.data = {
            "soundbeats": {
                "test_entry": {
                    "active_game": None,
                    "game_history": []
                }
            }
        }
        return hass
    
    @pytest.fixture
    def game_manager(self, hass):
        """Create a game manager instance."""
        return GameManager(hass, "test_entry")
    
    @pytest.mark.asyncio
    async def test_new_game_creation(self, game_manager):
        """Test creating a new game."""
        # Create a new game with 3 teams
        game_state = await game_manager.new_game(3)
        
        assert game_state is not None
        assert len(game_state.teams) == 3
        assert game_state.is_active is True
        assert all(team.name.startswith("Team") for team in game_state.teams)
        assert game_state.game_id is not None
    
    @pytest.mark.asyncio
    async def test_team_name_update(self, game_manager):
        """Test updating team names."""
        # Create a game first
        game_state = await game_manager.new_game(2)
        team_id = game_state.teams[0].id
        
        # Update team name
        await game_manager.update_team_name(team_id, "Awesome Team")
        
        # Verify the update
        updated_state = game_manager.get_state()
        assert updated_state["teams"][0]["name"] == "Awesome Team"
    
    @pytest.mark.asyncio
    async def test_add_team(self, game_manager):
        """Test adding a team."""
        # Create a game with 2 teams
        await game_manager.new_game(2)
        
        # Add a team
        new_team = await game_manager.add_team()
        assert new_team is not None
        assert new_team.name == "Team 3"
        
        # Verify the team was added
        state = game_manager.get_state()
        assert len(state["teams"]) == 3
    
    @pytest.mark.asyncio
    async def test_add_team_limit(self, game_manager):
        """Test adding teams beyond limit."""
        # Create a game with 5 teams (max)
        await game_manager.new_game(5)
        
        # Try to add another team
        new_team = await game_manager.add_team()
        assert new_team is None
        
        # Verify team count didn't change
        state = game_manager.get_state()
        assert len(state["teams"]) == 5
    
    @pytest.mark.asyncio
    async def test_remove_team(self, game_manager):
        """Test removing a team."""
        # Create a game with 3 teams
        game_state = await game_manager.new_game(3)
        team_to_remove = game_state.teams[1].id
        
        # Remove a team
        success = await game_manager.remove_team(team_to_remove)
        assert success is True
        
        # Verify the team was removed
        state = game_manager.get_state()
        assert len(state["teams"]) == 2
        assert all(team["id"] != team_to_remove for team in state["teams"])
    
    @pytest.mark.asyncio
    async def test_remove_team_minimum(self, game_manager):
        """Test removing team when at minimum."""
        # Create a game with 1 team
        await game_manager.new_game(1)
        team_id = game_manager.get_state()["teams"][0]["id"]
        
        # Try to remove the last team
        success = await game_manager.remove_team(team_id)
        assert success is False
        
        # Verify team count didn't change
        state = game_manager.get_state()
        assert len(state["teams"]) == 1
    
    @pytest.mark.asyncio
    async def test_state_persistence(self, game_manager):
        """Test game state persistence."""
        # Create a game
        game_state = await game_manager.new_game(2)
        game_id = game_state.game_id
        
        # Update team names
        await game_manager.update_team_name(game_state.teams[0].id, "Team A")
        await game_manager.update_team_name(game_state.teams[1].id, "Team B")
        
        # Simulate creating a new manager (like after restart)
        new_manager = GameManager(game_manager.hass, "test_entry")
        await new_manager.initialize()
        
        # Verify state was restored
        restored_state = new_manager.get_state()
        assert restored_state is not None
        assert restored_state["game_id"] == game_id
        assert restored_state["teams"][0]["name"] == "Team A"
        assert restored_state["teams"][1]["name"] == "Team B"


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])