"""Soundbeats sensor platform."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Soundbeats sensor based on a config entry."""
    _LOGGER.info("Setting up Soundbeats sensor")
    
    # Create a simple game status sensor
    async_add_entities([SoundbeatsSensor()], True)


class SoundbeatsSensor(SensorEntity):
    """Representation of a Soundbeats sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._attr_name = "Soundbeats Game Status"
        self._attr_unique_id = "soundbeats_game_status"
        self._attr_icon = "mdi:music-note"
        self._state = "ready"
        self._teams = self._initialize_teams()

    def _initialize_teams(self) -> dict[str, dict[str, Any]]:
        """Initialize the 5 teams with default values."""
        teams = {}
        for i in range(1, 6):
            teams[f"team_{i}"] = {
                "name": f"Team {i}",
                "points": 0,
                "participating": True,
            }
        return teams

    @property
    def state(self) -> str:
        """Return the state of the sensor."""
        return self._state

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        attributes = {
            "friendly_name": "Soundbeats Game Status",
            "description": "Current status of the Soundbeats party game",
            "player_count": 0,
            "game_mode": "Classic",
        }
        # Add team data to attributes
        attributes.update(self._teams)
        return attributes

    def update_team_name(self, team_id: str, name: str) -> None:
        """Update a team's name."""
        if team_id in self._teams:
            self._teams[team_id]["name"] = name
            self.async_write_ha_state()

    def update_team_points(self, team_id: str, points: int) -> None:
        """Update a team's points."""
        if team_id in self._teams:
            self._teams[team_id]["points"] = points
            self.async_write_ha_state()

    def update_team_participating(self, team_id: str, participating: bool) -> None:
        """Update a team's participating status."""
        if team_id in self._teams:
            self._teams[team_id]["participating"] = participating
            self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        # This is where you would add logic to check game status
        # For now, we'll keep it simple
        _LOGGER.debug("Updating Soundbeats sensor")