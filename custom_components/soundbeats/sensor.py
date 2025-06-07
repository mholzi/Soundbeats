"""Soundbeats sensor platform."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity, RestoreEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .security import (
    sanitize_team_name,
    validate_points,
    validate_year_range,
    validate_timer_length,
)

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
    game_mode_sensor = SoundbeatsGameModeSensor()
    current_song_sensor = SoundbeatsCurrentSongSensor()
    round_counter_sensor = SoundbeatsRoundCounterSensor()
    played_songs_sensor = SoundbeatsPlayedSongsSensor()
    
    highscore_sensor = SoundbeatsHighscoreSensor()
    
    entities.extend([countdown_sensor, countdown_current_sensor, game_mode_sensor, current_song_sensor, round_counter_sensor, played_songs_sensor, highscore_sensor])
    
    # Store entity references in hass data for service access
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN]["entities"] = {
        "main_sensor": main_sensor,
        "team_sensors": team_sensors,
        "countdown_sensor": countdown_sensor,
        "countdown_current_sensor": countdown_current_sensor,
        "game_mode_sensor": game_mode_sensor,
        "current_song_sensor": current_song_sensor,
        "round_counter_sensor": round_counter_sensor,
        "played_songs_sensor": played_songs_sensor,
        "highscore_sensor": highscore_sensor,
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
        self._team_count = 3  # Default to 3 teams

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
            "team_count": self._team_count,
        }

    def set_state(self, new_state: str) -> None:
        """Set the game state."""
        self._state = new_state
        self.async_write_ha_state()

    def set_team_count(self, team_count: int) -> None:
        """Set the number of teams."""
        self._team_count = team_count
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
        self._last_round_points = 0
        self._user_id = None

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
                    
                    if "last_round_points" in last_state.attributes:
                        self._last_round_points = int(last_state.attributes["last_round_points"])
                        _LOGGER.debug("Restored team %d last round points: %s", self._team_number, self._last_round_points)
                    
                    if "user_id" in last_state.attributes:
                        self._user_id = last_state.attributes["user_id"]
                        _LOGGER.debug("Restored team %d user_id: %s", self._team_number, self._user_id)
                        
            except (ValueError, TypeError, KeyError) as e:
                _LOGGER.warning("Could not restore team %d state: %s, using defaults", self._team_number, e)
                self._team_name = f"Team {self._team_number}"
                self._points = 0
                self._participating = True
                self._year_guess = 1990
                self._betting = False
                self._last_round_betting = False
                self._last_round_points = 0
                self._user_id = None

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
            "last_round_points": self._last_round_points,
            "user_id": self._user_id,
        }

    def _update_attribute(self, attribute_name: str, value) -> None:
        """Generic helper for updating team attributes."""
        if not hasattr(self, f"_{attribute_name}"):
            _LOGGER.warning("Attribute %s does not exist on team %d", attribute_name, self._team_number)
            return
        setattr(self, f"_{attribute_name}", value)
        self.async_write_ha_state()

    def update_team_name(self, name: str) -> None:
        """Update the team's name."""
        if not name or not isinstance(name, str):
            _LOGGER.error("Invalid team name for team %d: %s", self._team_number, name)
            return
        # Sanitize the name for security
        name = sanitize_team_name(name)
        self._update_attribute("team_name", name)

    def update_team_points(self, points: int) -> None:
        """Update the team's points."""
        if not validate_points(points):
            _LOGGER.error("Invalid points for team %d: %s", self._team_number, points)
            return
        self._update_attribute("points", int(points))

    def update_team_participating(self, participating: bool) -> None:
        """Update the team's participating status."""
        try:
            participating = bool(participating)
        except (ValueError, TypeError):
            _LOGGER.error("Invalid participating status for team %d: %s", self._team_number, participating)
            return
        self._update_attribute("participating", participating)

    def update_team_year_guess(self, year_guess: int) -> None:
        """Update the team's year guess."""
        if not validate_year_range(year_guess):
            _LOGGER.error("Invalid year guess for team %d: %s", self._team_number, year_guess)
            return
        self._update_attribute("year_guess", int(year_guess))

    def update_team_betting(self, betting: bool) -> None:
        """Update the team's betting status."""
        self._update_attribute("betting", betting)

    def update_team_user_id(self, user_id: str) -> None:
        """Update the team's assigned user ID."""
        self._update_attribute("user_id", user_id)

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
        if not validate_timer_length(timer_length):
            _LOGGER.error("Invalid timer length: %s", timer_length)
            return
        self._timer_length = int(timer_length)
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
                
                # Store last round points for display
                if hasattr(team_sensor, '_last_round_points'):
                    team_sensor._last_round_points = points_to_add
                    team_sensor.async_write_ha_state()
                
                # Reset betting state after evaluation
                if hasattr(team_sensor, 'update_team_betting'):
                    team_sensor.update_team_betting(False)
                else:
                    _LOGGER.warning("Team sensor %s has no update_team_betting method", team_key)
            
            # Increment round counter after all teams have been evaluated
            if hasattr(self.hass, 'data') and DOMAIN in self.hass.data:
                entities = self.hass.data[DOMAIN].get("entities", {})
                round_counter_sensor = entities.get("round_counter_sensor")
                if round_counter_sensor and hasattr(round_counter_sensor, 'increment_round_counter'):
                    round_counter_sensor.increment_round_counter()
                    _LOGGER.info("Round counter incremented to %d", round_counter_sensor.state)
                else:
                    _LOGGER.warning("Round counter sensor not found or has no increment method")
                
                # Update highscores after round evaluation
                highscore_sensor = entities.get("highscore_sensor")
                if highscore_sensor and hasattr(highscore_sensor, 'update_highscore'):
                    current_round = round_counter_sensor.state if round_counter_sensor else 1
                    team_sensors = entities.get("team_sensors", {})
                    
                    # Check each participating team's total score for highscore records
                    for team_key, team_sensor in team_sensors.items():
                        if not team_sensor or not hasattr(team_sensor, 'extra_state_attributes'):
                            continue
                        team_attrs = team_sensor.extra_state_attributes
                        if not team_attrs.get("participating", False):
                            continue
                        
                        team_score = team_attrs.get("points", 0)
                        if team_score > 0:  # Only check for highscore if team has points
                            records_broken = highscore_sensor.update_highscore(team_score, current_round)
                            if records_broken["absolute"] or records_broken["round"]:
                                _LOGGER.info("Team %s broke records - Absolute: %s, Round %d: %s", 
                                           team_key, records_broken["absolute"], current_round, records_broken["round"])
                else:
                    _LOGGER.warning("Highscore sensor not found or has no update method")
                               
        except Exception as e:
            _LOGGER.error("Error during round evaluation: %s", e)

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats countdown current sensor")




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


class SoundbeatsCurrentSongSensor(SensorEntity, RestoreEntity):
    """Representation of a Soundbeats current song sensor."""

    def __init__(self) -> None:
        """Initialize the current song sensor."""
        self._attr_name = "Soundbeats Current Song"
        self._attr_unique_id = "soundbeats_current_song"
        self._attr_icon = "mdi:music-note"
        self._current_song_data = None
        self._selected_media_player = None

    async def async_added_to_hass(self) -> None:
        """Called when entity is added to hass."""
        await super().async_added_to_hass()
        
        # Restore previous state if available
        if (last_state := await self.async_get_last_state()) is not None:
            if last_state.state != "None":
                self._selected_media_player = last_state.state
                _LOGGER.debug("Restored selected media player: %s", self._selected_media_player)
            else:
                _LOGGER.debug("Previous selected media player was None, keeping default")

    @property
    def state(self) -> str:
        """Return the state of the sensor (selected media player entity ID)."""
        # Always return the selected media player, even when no song is playing
        if self._current_song_data is not None:
            return self._current_song_data.get("media_player", "None")
        return self._selected_media_player or "None"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        attributes = {
            "selected_media_player": self._selected_media_player or "None"
        }
        
        if self._current_song_data is not None:
            attributes.update({
                "media_player": self._current_song_data.get("media_player"),
                "song_id": self._current_song_data.get("song_id"),
                "year": self._current_song_data.get("year"),
                "url": self._current_song_data.get("url"),
                "media_content_type": self._current_song_data.get("media_content_type"),
            })
        
        return attributes

    def update_current_song(self, song_data: dict) -> None:
        """Update the current song data."""
        _LOGGER.debug("Updating current song sensor with data: %s", song_data)
        self._current_song_data = song_data
        # Also update the selected media player
        if "media_player" in song_data:
            self._selected_media_player = song_data["media_player"]
        self.async_write_ha_state()

    def update_selected_media_player(self, media_player: str) -> None:
        """Update the selected media player without song data."""
        _LOGGER.debug("Updating selected media player to: %s", media_player)
        self._selected_media_player = media_player
        # Clear current song data when explicitly changing media player
        self._current_song_data = None
        self.async_write_ha_state()

    def clear_current_song(self) -> None:
        """Clear the current song but keep the selected media player."""
        self._current_song_data = None
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats current song sensor")


class SoundbeatsRoundCounterSensor(SensorEntity, RestoreEntity):
    """Representation of a Soundbeats round counter sensor."""

    def __init__(self) -> None:
        """Initialize the round counter sensor."""
        self._attr_name = "Soundbeats Round Counter"
        self._attr_unique_id = "soundbeats_round_counter"
        self._attr_icon = "mdi:counter"
        self._attr_unit_of_measurement = None
        self._round_count = 0

    async def async_added_to_hass(self) -> None:
        """Called when entity is added to hass."""
        await super().async_added_to_hass()
        
        # Restore previous state if available
        if (last_state := await self.async_get_last_state()) is not None:
            try:
                self._round_count = int(last_state.state)
                _LOGGER.debug("Restored round counter: %d", self._round_count)
            except (ValueError, TypeError):
                _LOGGER.warning("Could not restore round counter state, using default")
                self._round_count = 0

    @property
    def state(self) -> int:
        """Return the state of the sensor (round count)."""
        return self._round_count

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        return {
            "friendly_name": "Soundbeats Round Counter",
            "description": "Current round number in the Soundbeats game",
        }

    def reset_round_counter(self) -> None:
        """Reset the round counter to 0."""
        self._round_count = 0
        self.async_write_ha_state()

    def increment_round_counter(self) -> None:
        """Increment the round counter by 1."""
        self._round_count += 1
        self.async_write_ha_state()

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats round counter sensor")


class SoundbeatsPlayedSongsSensor(SensorEntity):
    """Representation of a Soundbeats played songs sensor."""

    def __init__(self) -> None:
        """Initialize the played songs sensor."""
        self._attr_name = "Soundbeats Played Songs"
        self._attr_unique_id = "soundbeats_played_songs"
        self._attr_icon = "mdi:playlist-music"
        self._played_song_ids = []

    @property
    def state(self) -> int:
        """Return the state of the sensor (number of played songs)."""
        return len(self._played_song_ids)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        return {
            "played_song_ids": self._played_song_ids,
            "friendly_name": "Soundbeats Played Songs",
            "description": "List of song IDs played since the current game started",
        }

    def add_played_song(self, song_id: int) -> None:
        """Add a song ID to the played songs list."""
        if song_id not in self._played_song_ids:
            self._played_song_ids.append(song_id)
            _LOGGER.debug("Added song ID %d to played list. Total played: %d", song_id, len(self._played_song_ids))
            self.async_write_ha_state()

    def reset_played_songs(self) -> None:
        """Reset the played songs list to empty."""
        self._played_song_ids = []
        _LOGGER.info("Reset played songs list")
        self.async_write_ha_state()

    def is_song_played(self, song_id: int) -> bool:
        """Check if a song ID has been played."""
        return song_id in self._played_song_ids

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats played songs sensor")


class SoundbeatsHighscoreSensor(SensorEntity, RestoreEntity):
    """Representation of a Soundbeats highscore sensor."""

    def __init__(self) -> None:
        """Initialize the highscore sensor."""
        self._attr_name = "Soundbeats Highscore"
        self._attr_unique_id = "soundbeats_highscore"
        self._attr_icon = "mdi:trophy"
        self._attr_unit_of_measurement = "points"
        self._absolute_highscore = 0
        self._round_highscores = {}
        self._played_song_ids = []

    async def async_added_to_hass(self) -> None:
        """Called when entity is added to hass."""
        await super().async_added_to_hass()
        
        # Restore previous state if available
        if (last_state := await self.async_get_last_state()) is not None:
            try:
                # Convert state back to internal integer representation (* 100)
                restored_value = float(last_state.state)
                self._absolute_highscore = int(restored_value * 100)
                _LOGGER.debug("Restored average highscore: %.2f (internal: %d)", restored_value, self._absolute_highscore)
                
                # Restore round highscores from attributes
                if last_state.attributes:
                    for key, value in last_state.attributes.items():
                        if key.startswith("round_") and isinstance(value, (int, float)):
                            self._round_highscores[key] = int(value)
                    _LOGGER.debug("Restored round highscores: %s", self._round_highscores)
                    
            except (ValueError, TypeError):
                _LOGGER.warning("Could not restore highscore state, using defaults")
                self._absolute_highscore = 0
                self._round_highscores = {}

    @property
    def state(self) -> float:
        """Return the state of the sensor (average highscore per round)."""
        return self._absolute_highscore / 100.0 if self._absolute_highscore > 0 else 0.0

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        attributes = {
            "friendly_name": "Soundbeats Highscore",
            "description": "Average points per round highscore for Soundbeats game",
            "played_song_ids": self._played_song_ids,
        }
        # Add round highscores as attributes
        attributes.update(self._round_highscores)
        return attributes

    def add_played_song(self, song_id: int) -> None:
        """Add a song ID to the played songs list."""
        if song_id not in self._played_song_ids:
            self._played_song_ids.append(song_id)
            _LOGGER.debug("Added song ID %d to played list. Total played: %d", song_id, len(self._played_song_ids))
            self.async_write_ha_state()

    def reset_played_songs(self) -> None:
        """Reset the played songs list to empty."""
        self._played_song_ids = []
        _LOGGER.info("Reset played songs list")
        self.async_write_ha_state()

    def is_song_played(self, song_id: int) -> bool:
        """Check if a song ID has been played."""
        return song_id in self._played_song_ids

    async def async_update(self) -> None:
        """Update the sensor."""
        _LOGGER.debug("Updating Soundbeats highscore sensor")

    def update_highscore(self, team_score: int, round_number: int) -> dict[str, bool]:
        """Update highscore records based on average score per round.
        
        Args:
            team_score: The team's total aggregated score
            round_number: The current round number
            
        Returns:
            Dict with 'absolute' and 'round' keys indicating if records were broken
        """
        records_broken = {"absolute": False, "round": False}
        state_changed = False
        
        # Calculate average score per round for this team
        if round_number > 0:
            team_average = team_score / round_number
            
            # Check average highscore (stored as integer by multiplying by 100 for precision)
            team_average_int = int(team_average * 100)
            if team_average_int > self._absolute_highscore:
                self._absolute_highscore = team_average_int
                records_broken["absolute"] = True
                state_changed = True
                _LOGGER.info("NEW AVERAGE HIGHSCORE: %.2f points per round!", team_average)
            
            # Still track round-specific records for potential future use
            round_key = f"round_{round_number}"
            current_round_record = self._round_highscores.get(round_key, 0)
            
            # Ensure round attribute exists (initialize with 0 if not present)
            if round_key not in self._round_highscores:
                self._round_highscores[round_key] = 0
                state_changed = True
                _LOGGER.debug("Initialized round %d highscore to 0", round_number)
            
            if team_score > current_round_record:
                self._round_highscores[round_key] = team_score
                records_broken["round"] = True
                state_changed = True
                _LOGGER.info("NEW ROUND %d HIGHSCORE: %d points!", round_number, team_score)
        
        if state_changed:
            self.async_write_ha_state()
        
        return records_broken
