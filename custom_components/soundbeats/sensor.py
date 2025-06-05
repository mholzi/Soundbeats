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
    countdown_current_sensor = SoundbeatsCountdownCurrentSensor()
    audio_sensor = SoundbeatsAudioPlayerSensor()
    game_mode_sensor = SoundbeatsGameModeSensor()
    current_song_sensor = SoundbeatsCurrentSongSensor()
    
    entities.extend([countdown_sensor, countdown_current_sensor, audio_sensor, game_mode_sensor, current_song_sensor])
    
    # Store entity references in hass data for service access
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["entities"] = {
        "main_sensor": main_sensor,
        "team_sensors": team_sensors,
        "countdown_sensor": countdown_sensor,
        "countdown_current_sensor": countdown_current_sensor,
        "audio_sensor": audio_sensor,
        "game_mode_sensor": game_mode_sensor,
        "current_song_sensor": current_song_sensor,
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
        self._year_guess = 1990
        self._betting = False
        self._last_round_betting = False

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
                    
                    if "year_guess" in last_state.attributes:
                        self._year_guess = int(last_state.attributes["year_guess"])
                        _LOGGER.debug("Restored team %d year guess: %d", self._team_number, self._year_guess)
                    
                    if "betting" in last_state.attributes:
                        self._betting = bool(last_state.attributes["betting"])
                        _LOGGER.debug("Restored team %d betting: %s", self._team_number, self._betting)
                    
                    if "last_round_betting" in last_state.attributes:
                        self._last_round_betting = bool(last_state.attributes["last_round_betting"])
                        _LOGGER.debug("Restored team %d last round betting: %s", self._team_number, self._last_round_betting)
                        
            except (ValueError, TypeError, KeyError) as e:
                _LOGGER.warning("Could not restore team %d state: %s, using defaults", self._team_number, e)
                self._team_name = f"Team {self._team_number}"
                self._points = 0
                self._participating = True
                self._year_guess = 1990
                self._betting = False
                self._last_round_betting = False

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
            "year_guess": self._year_guess,
            "betting": self._betting,
            "last_round_betting": self._last_round_betting,
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

    def update_team_year_guess(self, year_guess: int) -> None:
        """Update the team's year guess."""
        self._year_guess = year_guess
        self.async_write_ha_state()

    def update_team_betting(self, betting: bool) -> None:
        """Update the team's betting status."""
        self._betting = betting
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


class SoundbeatsCountdownCurrentSensor(SensorEntity):
    """Representation of a Soundbeats countdown current value sensor."""

    def __init__(self) -> None:
        """Initialize the countdown current sensor."""
        self._attr_name = "Soundbeats Countdown Current"
        self._attr_unique_id = "soundbeats_countdown_current"
        self._attr_icon = "mdi:timer-sand"
        self._attr_unit_of_measurement = "s"
        self._current_countdown = 0
        self._countdown_task = None
        self._evaluation_done = False

    async def async_added_to_hass(self) -> None:
        """Called when entity is added to hass."""
        await super().async_added_to_hass()
        _LOGGER.debug("Countdown current sensor added to hass")

    @property
    def state(self) -> int:
        """Return the state of the sensor (current countdown in seconds)."""
        return self._current_countdown

    def start_countdown(self, duration: int) -> None:
        """Start a countdown from the given duration."""
        self.stop_countdown()  # Stop any existing countdown
        self._current_countdown = duration
        self._evaluation_done = False  # Reset evaluation flag for new round
        self.async_write_ha_state()
        
        # Schedule countdown decrement
        if duration > 0:
            self._countdown_task = self.hass.loop.call_later(
                1, self._async_decrement_countdown
            )

    def stop_countdown(self) -> None:
        """Stop the countdown timer."""
        if self._countdown_task:
            self._countdown_task.cancel()  # Cancel the scheduled task
            self._countdown_task = None
        self._current_countdown = 0
        self._evaluation_done = False  # Reset evaluation flag
        self.async_write_ha_state()

    def _async_decrement_countdown(self) -> None:
        """Decrement the countdown by 1 second."""
        if self._current_countdown > 0:
            self._current_countdown -= 1
            self.async_write_ha_state()
            
            # Schedule next decrement if countdown is still running
            if self._current_countdown > 0:
                self._countdown_task = self.hass.loop.call_later(
                    1, self._async_decrement_countdown
                )
            else:
                self._countdown_task = None
                # Trigger evaluation when countdown reaches 0
                if not self._evaluation_done:
                    self._evaluation_done = True
                    self.hass.loop.call_soon(self._evaluate_round)

    def _evaluate_round(self) -> None:
        """Evaluate team guesses and award points after countdown reaches zero."""
        try:
            _LOGGER.info("Starting round evaluation")
            
            # Get current song year from the current song sensor
            current_song_sensor = None
            if hasattr(self.hass, 'data') and DOMAIN in self.hass.data:
                entities = self.hass.data[DOMAIN].get("entities", {})
                current_song_sensor = entities.get("current_song_sensor")
            
            if not current_song_sensor or not hasattr(current_song_sensor, 'extra_state_attributes'):
                _LOGGER.warning("Current song sensor not found or has no attributes")
                return
            
            song_attributes = current_song_sensor.extra_state_attributes
            if not song_attributes or "year" not in song_attributes:
                _LOGGER.warning("No current song or year information available")
                return
            
            song_year = song_attributes["year"]
            if not isinstance(song_year, int):
                try:
                    song_year = int(song_year)
                except (ValueError, TypeError):
                    _LOGGER.warning("Invalid song year: %s", song_year)
                    return
            
            _LOGGER.info("Song year: %d", song_year)
            
            # Get team sensors and evaluate each participating team
            entities = self.hass.data[DOMAIN].get("entities", {})
            team_sensors = entities.get("team_sensors", {})
            
            for team_key, team_sensor in team_sensors.items():
                if not team_sensor or not hasattr(team_sensor, 'extra_state_attributes'):
                    continue
                    
                team_attrs = team_sensor.extra_state_attributes
                if not team_attrs.get("participating", False):
                    continue  # Skip non-participating teams
                
                year_guess = team_attrs.get("year_guess")
                betting = team_attrs.get("betting", False)
                if year_guess is None:
                    continue
                    
                try:
                    year_guess = int(year_guess)
                except (ValueError, TypeError):
                    _LOGGER.warning("Invalid year guess for team %s: %s", team_key, year_guess)
                    continue
                
                # Calculate points based on accuracy and betting
                year_difference = abs(song_year - year_guess)
                points_to_add = 0
                
                if betting:
                    # Betting logic: 20 points if exact match, 0 points otherwise
                    if year_difference == 0:
                        points_to_add = 20  # Exact match with bet
                        _LOGGER.info("Team %s: BETTING WIN! guess %d, actual %d, awarded %d points", 
                                   team_key, year_guess, song_year, points_to_add)
                    else:
                        points_to_add = 0  # No points for betting and wrong guess
                        _LOGGER.info("Team %s: BETTING LOSS! guess %d, actual %d, no points awarded", 
                                   team_key, year_guess, song_year)
                else:
                    # Normal scoring logic
                    if year_difference == 0:
                        points_to_add = 20  # Exact match
                    elif year_difference <= 2:
                        points_to_add = 10  # Within 2 years
                    elif year_difference <= 5:
                        points_to_add = 5   # Within 5 years
                    
                    if points_to_add > 0:
                        _LOGGER.info("Team %s: guess %d, actual %d, awarded %d points", 
                                   team_key, year_guess, song_year, points_to_add)
                    else:
                        _LOGGER.info("Team %s: guess %d, actual %d, no points awarded (difference: %d years)", 
                                   team_key, year_guess, song_year, year_difference)
                
                # Update team points
                current_points = team_attrs.get("points", 0)
                new_points = current_points + points_to_add
                
                if hasattr(team_sensor, 'update_team_points'):
                    team_sensor.update_team_points(new_points)
                else:
                    _LOGGER.warning("Team sensor %s has no update_team_points method", team_key)
                
                # Store betting state for result display before resetting
                if hasattr(team_sensor, '_last_round_betting'):
                    team_sensor._last_round_betting = betting
                    team_sensor.async_write_ha_state()
                
                # Reset betting state after evaluation
                if hasattr(team_sensor, 'update_team_betting'):
                    team_sensor.update_team_betting(False)
                else:
                    _LOGGER.warning("Team sensor %s has no update_team_betting method", team_key)
                               
        except Exception as e:
            _LOGGER.error("Error during round evaluation: %s", e)

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats countdown current sensor")


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


class SoundbeatsCurrentSongSensor(SensorEntity):
    """Representation of a Soundbeats current song sensor."""

    def __init__(self) -> None:
        """Initialize the current song sensor."""
        self._attr_name = "Soundbeats Current Song"
        self._attr_unique_id = "soundbeats_current_song"
        self._attr_icon = "mdi:music-note"
        self._current_song_data = None

    @property
    def state(self) -> str:
        """Return the state of the sensor (media player entity ID or None)."""
        if self._current_song_data is not None:
            return self._current_song_data.get("media_player", "None")
        return "None"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        if self._current_song_data is None:
            return {}
        
        return {
            "media_player": self._current_song_data.get("media_player"),
            "song_id": self._current_song_data.get("song_id"),
            "year": self._current_song_data.get("year"),
            "url": self._current_song_data.get("url"),
            "media_content_type": self._current_song_data.get("media_content_type"),
        }

    def update_current_song(self, song_data: dict) -> None:
        """Update the current song data."""
        _LOGGER.debug("Updating current song sensor with data: %s", song_data)
        self._current_song_data = song_data
        self.async_write_ha_state()

    def clear_current_song(self) -> None:
        """Clear the current song."""
        self._current_song_data = None
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats current song sensor")