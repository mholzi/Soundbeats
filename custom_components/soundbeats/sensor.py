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
    player_count_sensor = SoundbeatsPlayerCountSensor()
    game_mode_sensor = SoundbeatsGameModeSensor()
    current_song_sensor = SoundbeatsCurrentSongSensor()
    
    entities.extend([countdown_sensor, countdown_current_sensor, audio_sensor, player_count_sensor, game_mode_sensor, current_song_sensor])
    
    # Store entity references in hass data for service access
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["entities"] = {
        "main_sensor": main_sensor,
        "team_sensors": team_sensors,
        "countdown_sensor": countdown_sensor,
        "countdown_current_sensor": countdown_current_sensor,
        "audio_sensor": audio_sensor,
        "player_count_sensor": player_count_sensor,
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
        self._team_guesses = {}  # Store team year guesses {team_id: year}
        self._evaluation_done = False  # Track if evaluation was done for current round

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
        self._team_guesses = {}  # Reset guesses for new round
        self._evaluation_done = False  # Reset evaluation flag for new round
        self.async_write_ha_state()
        
        # Schedule countdown decrement
        if duration > 0:
            self._countdown_task = self.hass.helpers.event.async_call_later(
                1, self._decrement_countdown
            )

    def stop_countdown(self) -> None:
        """Stop the countdown timer."""
        if self._countdown_task:
            self._countdown_task()  # Cancel the scheduled task
            self._countdown_task = None
        self._current_countdown = 0
        self._team_guesses = {}  # Clear guesses when stopping
        self._evaluation_done = False  # Reset evaluation flag
        self.async_write_ha_state()

    async def _decrement_countdown(self, _) -> None:
        """Decrement the countdown by 1 second."""
        if self._current_countdown > 0:
            self._current_countdown -= 1
            self.async_write_ha_state()
            
            # Schedule next decrement if countdown is still running
            if self._current_countdown > 0:
                self._countdown_task = self.hass.helpers.event.async_call_later(
                    1, self._decrement_countdown
                )
            else:
                # Countdown reached zero - trigger evaluation
                self._countdown_task = None
                await self._evaluate_round()

    async def _evaluate_round(self) -> None:
        """Evaluate the round and award points when countdown reaches zero."""
        if self._evaluation_done:
            return  # Already evaluated this round
        
        self._evaluation_done = True
        _LOGGER.info("Evaluating round - countdown reached zero")
        
        # Get the current song year from the current song sensor
        current_song_sensor = None
        entities = self.hass.data.get(DOMAIN, {}).get("entities", {})
        current_song_sensor = entities.get("current_song_sensor")
        
        if not current_song_sensor:
            _LOGGER.warning("Could not find current song sensor for evaluation")
            return
            
        # Get the actual song year
        actual_year = None
        if hasattr(current_song_sensor, '_current_song_data') and current_song_sensor._current_song_data:
            actual_year = current_song_sensor._current_song_data.get("year")
            
        if actual_year is None:
            _LOGGER.warning("No song year available for evaluation")
            return
            
        _LOGGER.info("Evaluating guesses against actual year: %s", actual_year)
        
        # Get team sensors for point updates
        team_sensors = entities.get("team_sensors", {})
        
        # Evaluate each team's guess
        for team_id, guessed_year in self._team_guesses.items():
            try:
                # Calculate point difference
                year_diff = abs(int(actual_year) - int(guessed_year))
                points_awarded = 0
                
                # Award points based on accuracy
                if year_diff == 0:
                    points_awarded = 20  # Exact match
                elif year_diff <= 2:
                    points_awarded = 10  # Within 2 years
                elif year_diff <= 5:
                    points_awarded = 5   # Within 5 years
                
                if points_awarded > 0:
                    _LOGGER.info("Team %s guessed %s (actual: %s, diff: %d years) - awarded %d points",
                                team_id, guessed_year, actual_year, year_diff, points_awarded)
                    
                    # Find team sensor and update points
                    team_sensor = team_sensors.get(f"soundbeats_team_{team_id}")
                    if team_sensor and hasattr(team_sensor, 'update_team_points'):
                        # Get current points and add new points
                        current_points = getattr(team_sensor, '_points', 0)
                        new_total = current_points + points_awarded
                        team_sensor.update_team_points(new_total)
                    else:
                        # Fallback to direct state update
                        entity_id = f"sensor.soundbeats_team_{team_id}"
                        state_obj = self.hass.states.get(entity_id)
                        if state_obj:
                            current_points = state_obj.attributes.get("points", 0)
                            new_total = current_points + points_awarded
                            attrs = dict(state_obj.attributes)
                            attrs["points"] = new_total
                            self.hass.states.async_set(entity_id, state_obj.state, attrs)
                else:
                    _LOGGER.info("Team %s guessed %s (actual: %s, diff: %d years) - no points awarded",
                                team_id, guessed_year, actual_year, year_diff)
                                
            except (ValueError, TypeError) as e:
                _LOGGER.error("Error evaluating team %s guess: %s", team_id, e)

    def submit_team_guess(self, team_id: str, guessed_year: int) -> None:
        """Submit a team's year guess."""
        if self._current_countdown == 0:
            # Don't accept guesses when countdown is at zero (evaluation may have happened)
            _LOGGER.warning("Cannot submit guess for team %s - countdown has ended", team_id)
            return
            
        self._team_guesses[team_id] = guessed_year
        _LOGGER.debug("Team %s submitted guess: %s", team_id, guessed_year)

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
        }

    def update_current_song(self, song_data: dict) -> None:
        """Update the current song data."""
        self._current_song_data = song_data
        self.async_write_ha_state()

    def clear_current_song(self) -> None:
        """Clear the current song."""
        self._current_song_data = None
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats current song sensor")