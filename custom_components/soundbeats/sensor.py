"""Soundbeats sensor platform."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity, RestoreEntity
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
    _LOGGER.info("Setting up Soundbeats sensors")
    
    # Create all sensor entities
    entities = []
    
    # Main game status sensor
    main_sensor = SoundbeatsSensor()
    entities.append(main_sensor)
    
    # Individual team sensors
    team_sensors = {}
    for i in range(1, 6):
        team_sensor = SoundbeatsTeamSensor(i)
        team_sensors[f"soundbeats_team_{i}"] = team_sensor
        entities.append(team_sensor)
    
    # Individual game settings sensors
    countdown_sensor = SoundbeatsCountdownTimerSensor()
    audio_sensor = SoundbeatsAudioPlayerSensor()
    player_count_sensor = SoundbeatsPlayerCountSensor()
    game_mode_sensor = SoundbeatsGameModeSensor()
    
    entities.extend([countdown_sensor, audio_sensor, player_count_sensor, game_mode_sensor])
    
    # Store entity references in hass data for service access
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["entities"] = {
        "main_sensor": main_sensor,
        "team_sensors": team_sensors,
        "countdown_sensor": countdown_sensor,
        "audio_sensor": audio_sensor,
        "player_count_sensor": player_count_sensor,
        "game_mode_sensor": game_mode_sensor,
    }
    
    async_add_entities(entities, True)


class SoundbeatsSensor(SensorEntity):
    """Representation of a Soundbeats main game status sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._attr_name = "Soundbeats Game Status"
        self._attr_unique_id = "soundbeats_game_status"
        self._attr_icon = "mdi:music-note"
        self._state = "ready"

    @property
    def state(self) -> str:
        """Return the state of the sensor."""
        return self._state

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        return {
            "friendly_name": "Soundbeats Game Status",
            "description": "Current status of the Soundbeats party game",
        }

    def set_state(self, new_state: str) -> None:
        """Set the game state."""
        self._state = new_state
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        # This is where you would add logic to check game status
        # For now, we'll keep it simple
        _LOGGER.debug("Updating Soundbeats main sensor")


class SoundbeatsTeamSensor(SensorEntity, RestoreEntity):
    """Representation of a Soundbeats team sensor."""

    def __init__(self, team_number: int) -> None:
        """Initialize the team sensor."""
        self._team_number = team_number
        self._attr_name = f"Soundbeats Team {team_number}"
        self._attr_unique_id = f"soundbeats_team_{team_number}"
        self._attr_icon = "mdi:account-group"
        self._team_name = f"Team {team_number}"
        self._points = 0
        self._participating = True

    async def async_added_to_hass(self) -> None:
        """Called when entity is added to hass."""
        await super().async_added_to_hass()
        
        # Restore previous state if available
        if (last_state := await self.async_get_last_state()) is not None:
            try:
                # Restore team name from the state
                self._team_name = last_state.state
                _LOGGER.debug("Restored team %d name: %s", self._team_number, self._team_name)
                
                # Restore attributes if available
                if last_state.attributes:
                    if "points" in last_state.attributes:
                        self._points = int(last_state.attributes["points"])
                        _LOGGER.debug("Restored team %d points: %d", self._team_number, self._points)
                    
                    if "participating" in last_state.attributes:
                        self._participating = bool(last_state.attributes["participating"])
                        _LOGGER.debug("Restored team %d participating: %s", self._team_number, self._participating)
                        
            except (ValueError, TypeError, KeyError) as e:
                _LOGGER.warning("Could not restore team %d state: %s, using defaults", self._team_number, e)
                self._team_name = f"Team {self._team_number}"
                self._points = 0
                self._participating = True

    @property
    def state(self) -> str:
        """Return the state of the sensor (team name)."""
        return self._team_name

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        return {
            "points": self._points,
            "participating": self._participating,
            "team_number": self._team_number,
        }

    def update_team_name(self, name: str) -> None:
        """Update the team's name."""
        self._team_name = name
        self.async_write_ha_state()

    def update_team_points(self, points: int) -> None:
        """Update the team's points."""
        self._points = points
        self.async_write_ha_state()

    def update_team_participating(self, participating: bool) -> None:
        """Update the team's participating status."""
        self._participating = participating
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats team %d sensor", self._team_number)


class SoundbeatsCountdownTimerSensor(SensorEntity, RestoreEntity):
    """Representation of a Soundbeats countdown timer sensor."""

    def __init__(self) -> None:
        """Initialize the countdown timer sensor."""
        self._attr_name = "Soundbeats Countdown Timer"
        self._attr_unique_id = "soundbeats_countdown_timer"
        self._attr_icon = "mdi:timer"
        self._attr_unit_of_measurement = "s"
        self._timer_length = 30

    async def async_added_to_hass(self) -> None:
        """Called when entity is added to hass."""
        await super().async_added_to_hass()
        
        # Restore previous state if available
        if (last_state := await self.async_get_last_state()) is not None:
            try:
                self._timer_length = int(last_state.state)
                _LOGGER.debug("Restored countdown timer length: %d", self._timer_length)
            except (ValueError, TypeError):
                _LOGGER.warning("Could not restore countdown timer state, using default")
                self._timer_length = 30

    @property
    def state(self) -> int:
        """Return the state of the sensor (timer length in seconds)."""
        return self._timer_length

    def update_timer_length(self, timer_length: int) -> None:
        """Update the countdown timer length."""
        self._timer_length = timer_length
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats countdown timer sensor")


class SoundbeatsAudioPlayerSensor(SensorEntity, RestoreEntity):
    """Representation of a Soundbeats audio player sensor."""

    def __init__(self) -> None:
        """Initialize the audio player sensor."""
        self._attr_name = "Soundbeats Audio Player"
        self._attr_unique_id = "soundbeats_audio_player"
        self._attr_icon = "mdi:speaker"
        self._audio_player = None

    async def async_added_to_hass(self) -> None:
        """Called when entity is added to hass."""
        await super().async_added_to_hass()
        
        # Restore previous state if available
        if (last_state := await self.async_get_last_state()) is not None:
            if last_state.state != "None":
                self._audio_player = last_state.state
                _LOGGER.debug("Restored audio player: %s", self._audio_player)
            else:
                _LOGGER.debug("Previous audio player was None, keeping default")

    @property
    def state(self) -> str:
        """Return the state of the sensor (selected audio player)."""
        return self._audio_player or "None"

    def update_audio_player(self, audio_player: str) -> None:
        """Update the selected audio player."""
        self._audio_player = audio_player
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats audio player sensor")


class SoundbeatsPlayerCountSensor(SensorEntity):
    """Representation of a Soundbeats player count sensor."""

    def __init__(self) -> None:
        """Initialize the player count sensor."""
        self._attr_name = "Soundbeats Player Count"
        self._attr_unique_id = "soundbeats_player_count"
        self._attr_icon = "mdi:account-multiple"
        self._player_count = 0

    @property
    def state(self) -> int:
        """Return the state of the sensor (player count)."""
        return self._player_count

    def update_player_count(self, count: int) -> None:
        """Update the player count."""
        self._player_count = count
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats player count sensor")


class SoundbeatsGameModeSensor(SensorEntity):
    """Representation of a Soundbeats game mode sensor."""

    def __init__(self) -> None:
        """Initialize the game mode sensor."""
        self._attr_name = "Soundbeats Game Mode"
        self._attr_unique_id = "soundbeats_game_mode"
        self._attr_icon = "mdi:gamepad-variant"
        self._game_mode = "Classic"

    @property
    def state(self) -> str:
        """Return the state of the sensor (game mode)."""
        return self._game_mode

    def update_game_mode(self, mode: str) -> None:
        """Update the game mode."""
        self._game_mode = mode
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats game mode sensor")