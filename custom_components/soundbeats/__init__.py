"""The Soundbeats integration."""
import json
import logging
import os
import random

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.components.http import StaticPathConfig

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up Soundbeats integration from YAML (if needed)."""
    _LOGGER.info("Setting up Soundbeats integration from YAML")
    hass.data.setdefault(DOMAIN, {})

    # Register frontend resources (card JS)
    await _register_frontend_resources(hass)

    # If user placed “soundbeats:” in configuration.yaml, import it into a config entry
    if DOMAIN in config:
        if not hass.config_entries.async_entries(DOMAIN):
            hass.async_create_task(
                hass.config_entries.flow.async_init(
                    DOMAIN, context={"source": "import"}
                )
            )
    return True

async def _register_frontend_resources(hass: HomeAssistant) -> None:
    """Register the JS so that “/soundbeats_frontend_assets/soundbeats-card.js” is served."""
    www_dir = os.path.join(os.path.dirname(__file__), "www")
    card_file = os.path.join(www_dir, "soundbeats-card.js")

    if not os.path.isfile(card_file):
        _LOGGER.warning("Soundbeats card file not found at %s", card_file)
        return

    await hass.http.async_register_static_paths([
        StaticPathConfig(
            url_path="/soundbeats_frontend_assets",
            path=www_dir,
            cache_headers=False
        )
    ])
    _LOGGER.info("Registered Soundbeats static path → %s", www_dir)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Soundbeats from a config entry."""
    _LOGGER.info("Setting up Soundbeats config entry %s", entry.entry_id)
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}

    # Forward to sensor platform (so sensor.py is loaded)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register all game services (after entities are created)
    await _register_services(hass)
    
    return True

async def _register_services(hass: HomeAssistant) -> None:
    """Register all `soundbeats.*` services (start_game, stop_game, etc.)."""

    def _get_entities():
        """Get entity references from hass data."""
        return hass.data.get(DOMAIN, {}).get("entities", {})

    async def start_game(call):
        _LOGGER.info("Starting Soundbeats game")
        entities = _get_entities()
        
        # Set game status to playing
        main_sensor = entities.get("main_sensor")
        if main_sensor and hasattr(main_sensor, 'set_state'):
            main_sensor.set_state("playing")
        else:
            hass.states.async_set("sensor.soundbeats_game_status", "playing")
        
        # Stop any countdown timer
        countdown_current_sensor = entities.get("countdown_current_sensor")
        if countdown_current_sensor and hasattr(countdown_current_sensor, 'stop_countdown'):
            countdown_current_sensor.stop_countdown()
        else:
            hass.states.async_set("sensor.soundbeats_countdown_current", 0)
        
        # Reset all teams to default names and 0 points
        team_sensors = entities.get("team_sensors", {})
        for i in range(1, 6):
            team_key = f"soundbeats_team_{i}"
            team_sensor = team_sensors.get(team_key)
            if team_sensor:
                team_sensor.update_team_name(f"Team {i}")
                team_sensor.update_team_points(0)
                team_sensor.update_team_participating(True)
            else:
                # Fallback to direct state setting
                team_entity_id = f"sensor.soundbeats_team_{i}"
                hass.states.async_set(team_entity_id, f"Team {i}", {
                    "points": 0,
                    "participating": True,
                    "team_number": i
                })

    async def stop_game(call):
        _LOGGER.info("Stopping Soundbeats game")
        entities = _get_entities()
        main_sensor = entities.get("main_sensor")
        if main_sensor and hasattr(main_sensor, 'set_state'):
            main_sensor.set_state("stopped")
        else:
            hass.states.async_set("sensor.soundbeats_game_status", "stopped")

    async def reset_game(call):
        _LOGGER.info("Resetting Soundbeats game")
        entities = _get_entities()
        
        # Reset game status
        main_sensor = entities.get("main_sensor")
        if main_sensor and hasattr(main_sensor, 'set_state'):
            main_sensor.set_state("ready")
        else:
            hass.states.async_set("sensor.soundbeats_game_status", "ready")
        
        # Reset all teams
        team_sensors = entities.get("team_sensors", {})
        for i in range(1, 6):
            team_key = f"soundbeats_team_{i}"
            team_sensor = team_sensors.get(team_key)
            if team_sensor:
                team_sensor.update_team_name(f"Team {i}")
                team_sensor.update_team_points(0)
                team_sensor.update_team_participating(True)
            else:
                # Fallback to direct state setting
                team_entity_id = f"sensor.soundbeats_team_{i}"
                hass.states.async_set(team_entity_id, f"Team {i}", {
                    "points": 0,
                    "participating": True,
                    "team_number": i
                })

    async def next_song(call):
        _LOGGER.info("Skipping to next song")
        
        # Start countdown timer from configured timer length
        entities = _get_entities()
        countdown_sensor = entities.get("countdown_sensor")
        countdown_current_sensor = entities.get("countdown_current_sensor")
        current_song_sensor = entities.get("current_song_sensor")
        audio_sensor = entities.get("audio_sensor")
        
        # Get the selected audio player
        selected_player = None
        if audio_sensor and hasattr(audio_sensor, 'state'):
            selected_player = audio_sensor.state
        else:
            audio_entity = hass.states.get("sensor.soundbeats_audio_player")
            if audio_entity and audio_entity.state != "None":
                selected_player = audio_entity.state
        
        if not selected_player:
            _LOGGER.warning("No audio player selected. Please select one in the settings.")
            # Clear the current song sensor
            if current_song_sensor and hasattr(current_song_sensor, 'clear_current_song'):
                current_song_sensor.clear_current_song()
        else:
            # Randomly select a song from songs.json
            try:
                songs_file = os.path.join(os.path.dirname(__file__), "songs.json")
                
                def _load_songs_file():
                    with open(songs_file, 'r') as f:
                        return json.load(f)
                
                songs = await hass.async_add_executor_job(_load_songs_file)
                
                if songs:
                    selected_song = random.choice(songs)
                    _LOGGER.info("Selected song with ID %s from year %s", selected_song.get("id"), selected_song.get("year"))
                    
                    # Play the song on the selected media player
                    try:
                        await hass.services.async_call(
                            "media_player",
                            "play_media",
                            {
                                "entity_id": selected_player,
                                "media_content_id": selected_song.get("url"),
                                "media_content_type": "music"
                            }
                        )
                        _LOGGER.info("Started playing song on %s", selected_player)
                        
                        # Update the current song sensor with the media player entity ID and song details
                        if current_song_sensor and hasattr(current_song_sensor, 'update_current_song'):
                            current_song_sensor.update_current_song({
                                "media_player": selected_player,
                                "song_id": selected_song.get("id"),
                                "year": selected_song.get("year"),
                                "url": selected_song.get("url")
                            })
                    except Exception as e:
                        _LOGGER.error("Failed to play song on media player %s: %s", selected_player, e)
                        # Clear the current song sensor on error
                        if current_song_sensor and hasattr(current_song_sensor, 'clear_current_song'):
                            current_song_sensor.clear_current_song()
                else:
                    _LOGGER.warning("No songs found in songs.json")
                    if current_song_sensor and hasattr(current_song_sensor, 'clear_current_song'):
                        current_song_sensor.clear_current_song()
            except Exception as e:
                _LOGGER.error("Failed to select random song: %s", e)
                if current_song_sensor and hasattr(current_song_sensor, 'clear_current_song'):
                    current_song_sensor.clear_current_song()
        
        if countdown_sensor and countdown_current_sensor:
            # Get the configured timer length
            timer_length = int(countdown_sensor.state) if (hasattr(countdown_sensor, 'state') and countdown_sensor.state is not None) else 30
            
            # Start the countdown
            if hasattr(countdown_current_sensor, 'start_countdown'):
                countdown_current_sensor.start_countdown(timer_length)
            else:
                # Fallback to direct state setting
                hass.states.async_set("sensor.soundbeats_countdown_current", timer_length)
        else:
            # Fallback: get timer length from sensor state and start countdown
            timer_entity = hass.states.get("sensor.soundbeats_countdown_timer")
            timer_length = int(timer_entity.state) if (timer_entity and timer_entity.state is not None) else 30
            
            # Try to find the countdown current sensor entity and start countdown
            countdown_current_sensor = None
            
            # Check all config entries for the entity
            for config_entry_data in hass.data.get(DOMAIN, {}).values():
                if isinstance(config_entry_data, dict) and "entities" in config_entry_data:
                    countdown_current_sensor = config_entry_data["entities"].get("countdown_current_sensor")
                    if countdown_current_sensor:
                        break
            
            # If not found in config entries, check the global entities dict
            if not countdown_current_sensor:
                entities = hass.data.get(DOMAIN, {}).get("entities", {})
                countdown_current_sensor = entities.get("countdown_current_sensor")
            
            if countdown_current_sensor and hasattr(countdown_current_sensor, 'start_countdown'):
                countdown_current_sensor.start_countdown(timer_length)
            else:
                # Final fallback: just set the state (countdown won't auto-decrement)
                hass.states.async_set("sensor.soundbeats_countdown_current", timer_length)
        
        # Keep the game status unchanged but trigger an update
        state_obj = hass.states.get("sensor.soundbeats_game_status")
        if state_obj:
            hass.states.async_set("sensor.soundbeats_game_status", state_obj.state, state_obj.attributes)

    async def update_team_name(call):
        team_id = call.data.get("team_id")
        name = call.data.get("name")
        if not team_id or not name:
            _LOGGER.error("Missing team_id or name")
            return
        
        # Extract team number from team_id (e.g., "team_1" -> "1")
        team_number = team_id.split('_')[-1]
        unique_id = f"soundbeats_team_{team_number}"
        
        # Find the team sensor entity and call its update method
        entities = _get_entities()
        team_sensors = entities.get("team_sensors", {})
        team_sensor = team_sensors.get(unique_id)
        
        if team_sensor and hasattr(team_sensor, 'update_team_name'):
            _LOGGER.debug("Updating team %s name to '%s' via entity method", team_number, name)
            team_sensor.update_team_name(name)
        else:
            # Fallback to direct state setting
            _LOGGER.warning("Could not find team sensor entity %s, using fallback", unique_id)
            entity_id = f"sensor.soundbeats_team_{team_number}"
            state_obj = hass.states.get(entity_id)
            if state_obj:
                attrs = dict(state_obj.attributes) if state_obj.attributes else {}
                hass.states.async_set(entity_id, name, attrs)

    async def update_team_points(call):
        team_id = call.data.get("team_id")
        points = call.data.get("points")
        if not team_id or points is None:
            _LOGGER.error("Missing team_id or points")
            return
        
        # Extract team number from team_id (e.g., "team_1" -> "1")
        team_number = team_id.split('_')[-1]
        unique_id = f"soundbeats_team_{team_number}"
        
        # Find the team sensor entity and call its update method
        entities = _get_entities()
        team_sensors = entities.get("team_sensors", {})
        team_sensor = team_sensors.get(unique_id)
        
        if team_sensor and hasattr(team_sensor, 'update_team_points'):
            _LOGGER.debug("Updating team %s points to %d via entity method", team_number, points)
            team_sensor.update_team_points(int(points))
        else:
            # Fallback to direct state setting
            _LOGGER.warning("Could not find team sensor entity %s, using fallback", unique_id)
            entity_id = f"sensor.soundbeats_team_{team_number}"
            state_obj = hass.states.get(entity_id)
            if state_obj:
                attrs = dict(state_obj.attributes) if state_obj.attributes else {}
                attrs["points"] = int(points)
                hass.states.async_set(entity_id, state_obj.state, attrs)

    async def update_team_participating(call):
        team_id = call.data.get("team_id")
        participating = call.data.get("participating")
        if not team_id or participating is None:
            _LOGGER.error("Missing team_id or participating")
            return
        
        # Extract team number from team_id (e.g., "team_1" -> "1")
        team_number = team_id.split('_')[-1]
        unique_id = f"soundbeats_team_{team_number}"
        
        # Find the team sensor entity and call its update method
        entities = _get_entities()
        team_sensors = entities.get("team_sensors", {})
        team_sensor = team_sensors.get(unique_id)
        
        if team_sensor and hasattr(team_sensor, 'update_team_participating'):
            _LOGGER.debug("Updating team %s participating to %s via entity method", team_number, participating)
            team_sensor.update_team_participating(bool(participating))
        else:
            # Fallback to direct state setting
            _LOGGER.warning("Could not find team sensor entity %s, using fallback", unique_id)
            entity_id = f"sensor.soundbeats_team_{team_number}"
            state_obj = hass.states.get(entity_id)
            if state_obj:
                attrs = dict(state_obj.attributes) if state_obj.attributes else {}
                attrs["participating"] = bool(participating)
                hass.states.async_set(entity_id, state_obj.state, attrs)

    async def update_countdown_timer_length(call):
        length = call.data.get("timer_length")
        if length is None:
            _LOGGER.error("Missing timer_length")
            return
        
        entities = _get_entities()
        timer_sensor = entities.get("countdown_sensor")
        if timer_sensor and hasattr(timer_sensor, 'update_timer_length'):
            timer_sensor.update_timer_length(int(length))
        else:
            hass.states.async_set("sensor.soundbeats_countdown_timer", int(length))

    async def update_audio_player(call):
        player = call.data.get("audio_player")
        if not player:
            _LOGGER.error("Missing audio_player")
            return
        
        entities = _get_entities()
        audio_sensor = entities.get("audio_sensor")
        if audio_sensor and hasattr(audio_sensor, 'update_audio_player'):
            audio_sensor.update_audio_player(player)
        else:
            hass.states.async_set("sensor.soundbeats_audio_player", player)

    async def update_team_year_guess(call):
        team_id = call.data.get("team_id")
        year_guess = call.data.get("year_guess")
        if not team_id or year_guess is None:
            _LOGGER.error("Missing team_id or year_guess")
            return
        
        # Extract team number from team_id (e.g., "team_1" -> "1")
        team_number = team_id.split('_')[-1]
        unique_id = f"soundbeats_team_{team_number}"
        
        # Find the team sensor entity and call its update method
        entities = _get_entities()
        team_sensors = entities.get("team_sensors", {})
        team_sensor = team_sensors.get(unique_id)
        
        if team_sensor and hasattr(team_sensor, 'update_team_year_guess'):
            _LOGGER.debug("Updating team %s year guess to %d via entity method", team_number, year_guess)
            team_sensor.update_team_year_guess(int(year_guess))
        else:
            # Fallback to direct state setting
            _LOGGER.warning("Could not find team sensor entity %s, using fallback", unique_id)
            entity_id = f"sensor.soundbeats_team_{team_number}"
            state_obj = hass.states.get(entity_id)
            if state_obj:
                attrs = dict(state_obj.attributes) if state_obj.attributes else {}
                attrs["year_guess"] = int(year_guess)
                hass.states.async_set(entity_id, state_obj.state, attrs)

    # Register all services under the "soundbeats" domain
    hass.services.async_register(DOMAIN, "start_game", start_game)
    hass.services.async_register(DOMAIN, "stop_game", stop_game)
    hass.services.async_register(DOMAIN, "reset_game", reset_game)
    hass.services.async_register(DOMAIN, "next_song", next_song)
    hass.services.async_register(DOMAIN, "update_team_name", update_team_name)
    hass.services.async_register(DOMAIN, "update_team_points", update_team_points)
    hass.services.async_register(DOMAIN, "update_team_participating", update_team_participating)
    hass.services.async_register(DOMAIN, "update_team_year_guess", update_team_year_guess)
    hass.services.async_register(DOMAIN, "update_countdown_timer_length", update_countdown_timer_length)
    hass.services.async_register(DOMAIN, "update_audio_player", update_audio_player)

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry and remove services if no entries remain."""
    _LOGGER.info("Unloading Soundbeats entry %s", entry.entry_id)
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
        if not hass.data[DOMAIN]:
            # No more config entries—remove all services
            for svc in [
                "start_game",
                "stop_game",
                "reset_game",
                "next_song",
                "update_team_name",
                "update_team_points",
                "update_team_participating",
                "update_countdown_timer_length",
                "update_audio_player",
            ]:
                hass.services.async_remove(DOMAIN, svc)
    return unload_ok
