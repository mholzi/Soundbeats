"""Business logic services for Soundbeats integration."""
from __future__ import annotations

import json
import logging
import os
import random
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from .const import DOMAIN
from .security import (
    validate_entity_id,
    validate_team_id_format,
    validate_year_range,
    validate_timer_length,
    sanitize_team_name,
    validate_points,
)

_LOGGER = logging.getLogger(__name__)


class SoundbeatsGameService:
    """Service class for Soundbeats game logic."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the game service."""
        self.hass = hass

    def _get_entities(self) -> dict[str, Any]:
        """Get entity references from hass data."""
        return self.hass.data.get(DOMAIN, {}).get("entities", {})

    async def _load_songs_file(self) -> list[dict[str, Any]]:
        """Load songs from JSON file safely."""
        try:
            songs_file = os.path.join(os.path.dirname(__file__), "songs.json")
            
            def _load_file():
                try:
                    with open(songs_file, 'r', encoding='utf-8') as f:
                        return json.load(f)
                except (FileNotFoundError, json.JSONDecodeError) as e:
                    _LOGGER.error("Failed to load songs.json: %s", e)
                    return []
            
            songs = await self.hass.async_add_executor_job(_load_file)
            
            if not songs:
                _LOGGER.warning("No songs found in songs.json")
                return []
                
            return songs
            
        except Exception as e:
            _LOGGER.error("Unexpected error loading songs: %s", e)
            return []

    async def start_game(self) -> None:
        """Start a new Soundbeats game session."""
        _LOGGER.info("Starting Soundbeats game")
        entities = self._get_entities()
        
        try:
            # Set game status to playing
            main_sensor = entities.get("main_sensor")
            if main_sensor and hasattr(main_sensor, 'set_state'):
                main_sensor.set_state("playing")
            else:
                self.hass.states.async_set("sensor.soundbeats_game_status", "playing")
            
            # Stop any countdown timer
            countdown_current_sensor = entities.get("countdown_current_sensor")
            if countdown_current_sensor and hasattr(countdown_current_sensor, 'stop_countdown'):
                countdown_current_sensor.stop_countdown()
            else:
                self.hass.states.async_set("sensor.soundbeats_countdown_current", 0)
            
            # Reset round counter to 0
            round_counter_sensor = entities.get("round_counter_sensor")
            if round_counter_sensor and hasattr(round_counter_sensor, 'reset_round_counter'):
                round_counter_sensor.reset_round_counter()
            else:
                self.hass.states.async_set("sensor.soundbeats_round_counter", 0)
            
            # Reset played songs list
            played_songs_sensor = entities.get("played_songs_sensor")
            if played_songs_sensor and hasattr(played_songs_sensor, 'reset_played_songs'):
                played_songs_sensor.reset_played_songs()
            else:
                self.hass.states.async_set("sensor.soundbeats_played_songs", 0, {"played_song_ids": []})
            
            # Reset teams
            await self._reset_teams_for_game_start()
            
        except Exception as e:
            _LOGGER.error("Failed to start game: %s", e)
            raise ServiceValidationError(f"Failed to start game: {e}") from e

    async def _reset_teams_for_game_start(self) -> None:
        """Reset teams for game start based on current team count."""
        entities = self._get_entities()
        team_sensors = entities.get("team_sensors", {})
        main_sensor = entities.get("main_sensor")
        team_count = 5  # Default to all teams if we can't get the setting
        
        # Try to get current team count from main sensor
        if main_sensor and hasattr(main_sensor, '_team_count'):
            team_count = main_sensor._team_count
        else:
            # Fallback: check state attributes
            state_obj = self.hass.states.get("sensor.soundbeats_game_status")
            if state_obj and state_obj.attributes and 'team_count' in state_obj.attributes:
                team_count = int(state_obj.attributes['team_count'])
        
        # Reset active teams to default names and 0 points (preserve user assignments)
        for i in range(1, team_count + 1):
            await self._reset_single_team(i, team_sensors, active=True)
        
        # Disable any teams beyond the current team count
        for i in range(team_count + 1, 6):
            await self._reset_single_team(i, team_sensors, active=False)

    async def _reset_single_team(self, team_number: int, team_sensors: dict, active: bool = True) -> None:
        """Reset a single team's state."""
        team_key = f"soundbeats_team_{team_number}"
        team_sensor = team_sensors.get(team_key)
        
        if team_sensor:
            team_sensor.update_team_name(f"Team {team_number}")
            team_sensor.update_team_points(0)
            team_sensor.update_team_participating(active)
            if hasattr(team_sensor, 'update_team_betting'):
                team_sensor.update_team_betting(False)
            if hasattr(team_sensor, '_last_round_betting'):
                team_sensor._last_round_betting = False
                team_sensor.async_write_ha_state()
        else:
            # Fallback to direct state setting
            team_entity_id = f"sensor.soundbeats_team_{team_number}"
            self.hass.states.async_set(team_entity_id, f"Team {team_number}", {
                "points": 0,
                "participating": active,
                "team_number": team_number
            })

    async def stop_game(self) -> None:
        """Stop the current Soundbeats game session."""
        _LOGGER.info("Stopping Soundbeats game")
        try:
            entities = self._get_entities()
            main_sensor = entities.get("main_sensor")
            if main_sensor and hasattr(main_sensor, 'set_state'):
                main_sensor.set_state("stopped")
            else:
                self.hass.states.async_set("sensor.soundbeats_game_status", "stopped")
        except Exception as e:
            _LOGGER.error("Failed to stop game: %s", e)
            raise ServiceValidationError(f"Failed to stop game: {e}") from e

    async def reset_game(self) -> None:
        """Reset the Soundbeats game to initial state."""
        _LOGGER.info("Resetting Soundbeats game")
        try:
            entities = self._get_entities()
            
            # Reset game status
            main_sensor = entities.get("main_sensor")
            if main_sensor and hasattr(main_sensor, 'set_state'):
                main_sensor.set_state("ready")
            else:
                self.hass.states.async_set("sensor.soundbeats_game_status", "ready")
            
            # Reset all teams
            team_sensors = entities.get("team_sensors", {})
            for i in range(1, 6):
                await self._reset_team_completely(i, team_sensors)
                
        except Exception as e:
            _LOGGER.error("Failed to reset game: %s", e)
            raise ServiceValidationError(f"Failed to reset game: {e}") from e

    async def _reset_team_completely(self, team_number: int, team_sensors: dict) -> None:
        """Reset a team completely including user assignments."""
        team_key = f"soundbeats_team_{team_number}"
        team_sensor = team_sensors.get(team_key)
        
        if team_sensor:
            team_sensor.update_team_name(f"Team {team_number}")
            team_sensor.update_team_points(0)
            team_sensor.update_team_participating(True)
            if hasattr(team_sensor, 'update_team_betting'):
                team_sensor.update_team_betting(False)
            if hasattr(team_sensor, '_last_round_betting'):
                team_sensor._last_round_betting = False
                team_sensor.async_write_ha_state()
            if hasattr(team_sensor, 'update_team_user_id'):
                team_sensor.update_team_user_id(None)
        else:
            # Fallback to direct state setting
            team_entity_id = f"sensor.soundbeats_team_{team_number}"
            self.hass.states.async_set(team_entity_id, f"Team {team_number}", {
                "points": 0,
                "participating": True,
                "team_number": team_number,
                "user_id": None
            })

    async def next_song(self) -> None:
        """Skip to next song and start countdown timer."""
        _LOGGER.info("Skipping to next song")
        
        try:
            entities = self._get_entities()
            current_song_sensor = entities.get("current_song_sensor")
            
            # Get the selected audio player
            selected_player = self._get_selected_audio_player(current_song_sensor)
            
            if not selected_player:
                _LOGGER.warning("No audio player selected. Please select one in the settings.")
                if current_song_sensor and hasattr(current_song_sensor, 'clear_current_song'):
                    current_song_sensor.clear_current_song()
                return
            
            # Load and select a song
            song_selected = await self._select_and_play_song(selected_player, current_song_sensor, entities)
            
            # Start countdown regardless of song selection result
            await self._start_countdown_timer(entities)
            
            # Trigger state update
            self._trigger_game_status_update()
            
        except Exception as e:
            _LOGGER.error("Failed to skip to next song: %s", e)
            raise ServiceValidationError(f"Failed to skip to next song: {e}") from e

    def _get_selected_audio_player(self, current_song_sensor) -> str | None:
        """Get the currently selected audio player."""
        selected_player = None
        
        if current_song_sensor and hasattr(current_song_sensor, 'state'):
            selected_player = current_song_sensor.state
            if selected_player == "None":
                selected_player = None
            _LOGGER.debug("Got selected player from current_song_sensor: %s", selected_player)
        else:
            # Fallback to reading from current song sensor state directly
            current_song_entity = self.hass.states.get("sensor.soundbeats_current_song")
            if current_song_entity and current_song_entity.state != "None":
                selected_player = current_song_entity.state
                _LOGGER.debug("Got selected player from current song entity state: %s", selected_player)
        
        return selected_player

    async def _select_and_play_song(self, selected_player: str, current_song_sensor, entities: dict) -> bool:
        """Select and play a random unplayed song."""
        songs = await self._load_songs_file()
        if not songs:
            _LOGGER.warning("No songs available")
            if current_song_sensor and hasattr(current_song_sensor, 'clear_current_song'):
                current_song_sensor.clear_current_song()
            return False
        
        # Get played songs
        played_songs_sensor = entities.get("played_songs_sensor")
        played_song_ids = []
        
        if played_songs_sensor and hasattr(played_songs_sensor, 'extra_state_attributes'):
            played_song_ids = played_songs_sensor.extra_state_attributes.get("played_song_ids", [])
        
        # Filter out already played songs
        unplayed_songs = [song for song in songs if song.get("id") not in played_song_ids]
        
        if not unplayed_songs:
            _LOGGER.warning("All songs have been played! Total songs: %d", len(songs))
            if current_song_sensor and hasattr(current_song_sensor, 'clear_current_song'):
                current_song_sensor.clear_current_song()
            return False
        
        # Select random song from unplayed songs
        selected_song = random.choice(unplayed_songs)
        song_id = selected_song.get("id")
        
        _LOGGER.info("Selected unplayed song with ID %s from year %s (%d unplayed songs remaining)", 
                   song_id, selected_song.get("year"), len(unplayed_songs) - 1)
        
        # Add song to played list
        if played_songs_sensor and hasattr(played_songs_sensor, 'add_played_song'):
            played_songs_sensor.add_played_song(song_id)
        
        # Play the song
        return await self._play_song_on_media_player(selected_song, selected_player, current_song_sensor)

    async def _play_song_on_media_player(self, song: dict, selected_player: str, current_song_sensor) -> bool:
        """Play a song on the selected media player."""
        try:
            song_url = song.get("url")
            if not song_url:
                _LOGGER.error("Song %s has no URL", song.get("id"))
                return False
                
            _LOGGER.info("Attempting to play song URL '%s' on media player '%s'", song_url, selected_player)
            
            # Check if URL is a Spotify URL and adjust media_content_type accordingly
            media_content_type = "music"
            if "spotify.com" in song_url:
                media_content_type = "spotify"
                _LOGGER.info("Detected Spotify URL, setting media_content_type to 'spotify'")
            
            await self.hass.services.async_call(
                "media_player",
                "play_media",
                {
                    "entity_id": selected_player,
                    "media_content_id": song_url,
                    "media_content_type": media_content_type
                },
                blocking=True
            )
            _LOGGER.info("Successfully called media_player.play_media service for %s", selected_player)
            
            # Update the current song sensor
            if current_song_sensor and hasattr(current_song_sensor, 'update_current_song'):
                current_song_sensor.update_current_song({
                    "media_player": selected_player,
                    "song_id": song.get("id"),
                    "year": song.get("year"),
                    "url": song_url,
                    "media_content_type": media_content_type
                })
            
            return True
            
        except Exception as e:
            _LOGGER.error("Failed to play song on media player %s: %s", selected_player, e)
            if current_song_sensor and hasattr(current_song_sensor, 'clear_current_song'):
                current_song_sensor.clear_current_song()
            return False

    async def _start_countdown_timer(self, entities: dict) -> None:
        """Start the countdown timer."""
        countdown_sensor = entities.get("countdown_sensor")
        countdown_current_sensor = entities.get("countdown_current_sensor")
        
        if countdown_sensor and countdown_current_sensor:
            # Get the configured timer length
            timer_length = int(countdown_sensor.state) if (hasattr(countdown_sensor, 'state') and countdown_sensor.state is not None) else 30
            
            # Start the countdown
            if hasattr(countdown_current_sensor, 'start_countdown'):
                countdown_current_sensor.start_countdown(timer_length)
            else:
                # Fallback to direct state setting
                self.hass.states.async_set("sensor.soundbeats_countdown_current", timer_length)
        else:
            # Fallback: get timer length from sensor state and start countdown
            timer_entity = self.hass.states.get("sensor.soundbeats_countdown_timer")
            timer_length = int(timer_entity.state) if (timer_entity and timer_entity.state is not None) else 30
            
            # Try to find the countdown current sensor entity and start countdown
            countdown_current_sensor = self._find_countdown_current_sensor()
            
            if countdown_current_sensor and hasattr(countdown_current_sensor, 'start_countdown'):
                countdown_current_sensor.start_countdown(timer_length)
            else:
                # Final fallback: just set the state (countdown won't auto-decrement)
                self.hass.states.async_set("sensor.soundbeats_countdown_current", timer_length)

    def _find_countdown_current_sensor(self):
        """Find the countdown current sensor in hass data."""
        # Check all config entries for the entity
        for config_entry_data in self.hass.data.get(DOMAIN, {}).values():
            if isinstance(config_entry_data, dict) and "entities" in config_entry_data:
                countdown_current_sensor = config_entry_data["entities"].get("countdown_current_sensor")
                if countdown_current_sensor:
                    return countdown_current_sensor
        
        # If not found in config entries, check the global entities dict
        entities = self.hass.data.get(DOMAIN, {}).get("entities", {})
        return entities.get("countdown_current_sensor")

    def _trigger_game_status_update(self) -> None:
        """Trigger an update of the game status."""
        state_obj = self.hass.states.get("sensor.soundbeats_game_status")
        if state_obj:
            self.hass.states.async_set("sensor.soundbeats_game_status", state_obj.state, state_obj.attributes)


class SoundbeatsTeamService:
    """Service class for Soundbeats team management."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the team service."""
        self.hass = hass

    def _get_entities(self) -> dict[str, Any]:
        """Get entity references from hass data."""
        return self.hass.data.get(DOMAIN, {}).get("entities", {})

    def _validate_team_id(self, team_id: str) -> int:
        """Validate and extract team number from team_id."""
        if not validate_team_id_format(team_id):
            raise ServiceValidationError(f"Invalid team_id format: {team_id}")
        
        try:
            team_number = int(team_id.split('_')[-1])
            return team_number
        except (ValueError, IndexError) as e:
            raise ServiceValidationError(f"Invalid team_id format: {team_id}") from e

    async def update_team_attribute(self, team_id: str, attribute_name: str, value: Any, 
                                  method_name: str, value_transform=None, 
                                  state_attribute: str = None, fallback_state_value: Any = None) -> None:
        """Generic helper for updating team attributes."""
        if not team_id:
            raise ServiceValidationError("Missing team_id")
        
        # Validate team_id format
        team_number = self._validate_team_id(team_id)
        
        # Special validation for name attribute
        if attribute_name == "name":
            if not value:
                raise ServiceValidationError(f"Missing {attribute_name}")
            value = sanitize_team_name(value)
        elif attribute_name != "name" and value is None:
            raise ServiceValidationError(f"Missing {attribute_name}")
        
        # Additional validation for specific attributes
        if attribute_name == "points" and not validate_points(value):
            raise ServiceValidationError(f"Invalid points value: {value}")
        elif attribute_name == "year_guess" and not validate_year_range(value):
            raise ServiceValidationError(f"Invalid year guess: {value}")
        elif attribute_name == "timer_length" and not validate_timer_length(value):
            raise ServiceValidationError(f"Invalid timer length: {value}")
        
        unique_id = f"soundbeats_team_{team_number}"
        
        # Find the team sensor entity and call its update method
        entities = self._get_entities()
        team_sensors = entities.get("team_sensors", {})
        team_sensor = team_sensors.get(unique_id)
        
        # Transform value if needed
        if value_transform:
            try:
                value = value_transform(value)
            except (ValueError, TypeError) as e:
                raise ServiceValidationError(f"Invalid {attribute_name} value: {value}") from e
        
        if team_sensor and hasattr(team_sensor, method_name):
            _LOGGER.debug("Updating team %s %s via entity method", team_number, attribute_name)
            getattr(team_sensor, method_name)(value)
        else:
            # Fallback to direct state setting
            _LOGGER.warning("Could not find team sensor entity %s, using fallback", unique_id)
            await self._fallback_state_update(team_number, attribute_name, value, state_attribute, fallback_state_value)

    async def _fallback_state_update(self, team_number: int, attribute_name: str, value: Any,
                                   state_attribute: str = None, fallback_state_value: Any = None) -> None:
        """Fallback method to update team state directly."""
        entity_id = f"sensor.soundbeats_team_{team_number}"
        state_obj = self.hass.states.get(entity_id)
        
        if state_obj:
            attrs = dict(state_obj.attributes) if state_obj.attributes else {}
            if state_attribute:
                attrs[state_attribute] = value
                # Keep original state value unless fallback is specified
                state_value = fallback_state_value if fallback_state_value is not None else state_obj.state
                self.hass.states.async_set(entity_id, state_value, attrs)
            else:
                # For name updates, the value becomes the state
                self.hass.states.async_set(entity_id, value, attrs)
        else:
            _LOGGER.error("Team entity %s not found for fallback update", entity_id)


class SoundbeatsConfigService:
    """Service class for Soundbeats configuration management."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the config service."""
        self.hass = hass

    def _get_entities(self) -> dict[str, Any]:
        """Get entity references from hass data."""
        return self.hass.data.get(DOMAIN, {}).get("entities", {})

    async def update_countdown_timer_length(self, timer_length: int) -> None:
        """Update the countdown timer length."""
        if timer_length is None:
            raise ServiceValidationError("Missing timer_length")
        
        if not validate_timer_length(timer_length):
            raise ServiceValidationError(f"Invalid timer_length: {timer_length} (must be 5-300 seconds)")
        
        try:
            entities = self._get_entities()
            timer_sensor = entities.get("countdown_sensor")
            if timer_sensor and hasattr(timer_sensor, 'update_timer_length'):
                timer_sensor.update_timer_length(int(timer_length))
            else:
                self.hass.states.async_set("sensor.soundbeats_countdown_timer", int(timer_length))
        except Exception as e:
            _LOGGER.error("Failed to update timer length: %s", e)
            raise ServiceValidationError(f"Failed to update timer length: {e}") from e

    async def update_audio_player(self, audio_player: str) -> None:
        """Update the selected audio player."""
        if not audio_player:
            raise ServiceValidationError("Missing audio_player")
        
        # Validate that the entity exists and is a media_player
        if not validate_entity_id(audio_player) or not audio_player.startswith("media_player."):
            raise ServiceValidationError(f"Invalid audio_player: {audio_player} (must be a media_player entity)")
        
        state_obj = self.hass.states.get(audio_player)
        if not state_obj:
            raise ServiceValidationError(f"Media player entity not found: {audio_player}")
        
        try:
            entities = self._get_entities()
            current_song_sensor = entities.get("current_song_sensor")
            if current_song_sensor and hasattr(current_song_sensor, 'update_selected_media_player'):
                current_song_sensor.update_selected_media_player(audio_player)
            else:
                # Fallback to direct state setting
                self.hass.states.async_set("sensor.soundbeats_current_song", audio_player)
        except Exception as e:
            _LOGGER.error("Failed to update audio player: %s", e)
            raise ServiceValidationError(f"Failed to update audio player: {e}") from e

    async def update_team_count(self, team_count: int) -> None:
        """Update the number of teams."""
        if team_count is None:
            raise ServiceValidationError("Missing team_count")
        
        # Validate team count is between 1 and 5
        if team_count < 1 or team_count > 5:
            raise ServiceValidationError(f"Invalid team_count: {team_count} (must be 1-5)")
        
        try:
            entities = self._get_entities()
            main_sensor = entities.get("main_sensor")
            if main_sensor and hasattr(main_sensor, 'set_team_count'):
                main_sensor.set_team_count(team_count)
            else:
                # Update the game status entity with team_count attribute
                state_obj = self.hass.states.get("sensor.soundbeats_game_status")
                if state_obj:
                    attrs = dict(state_obj.attributes) if state_obj.attributes else {}
                    attrs["team_count"] = team_count
                    self.hass.states.async_set("sensor.soundbeats_game_status", state_obj.state, attrs)
                else:
                    # Create the entity if it doesn't exist
                    self.hass.states.async_set("sensor.soundbeats_game_status", "ready", {"team_count": team_count})
        except Exception as e:
            _LOGGER.error("Failed to update team count: %s", e)
            raise ServiceValidationError(f"Failed to update team count: {e}") from e