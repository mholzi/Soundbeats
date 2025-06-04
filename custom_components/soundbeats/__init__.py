"""The Soundbeats integration."""
import logging
import os

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

    # Register all game services
    await _register_services(hass)

    # Forward to sensor platform (so sensor.py is loaded)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def _register_services(hass: HomeAssistant) -> None:
    """Register all `soundbeats.*` services (start_game, stop_game, etc.)."""

    async def start_game(call):
        _LOGGER.info("Starting Soundbeats game")
        hass.states.async_set("sensor.soundbeats_game_status", "playing")

    async def stop_game(call):
        _LOGGER.info("Stopping Soundbeats game")
        hass.states.async_set("sensor.soundbeats_game_status", "stopped")

    async def reset_game(call):
        _LOGGER.info("Resetting Soundbeats game")
        state_obj = hass.states.get("sensor.soundbeats_game_status")
        new_attrs = dict(state_obj.attributes) if state_obj else {}
        # Reset only team names/points...
        for i in range(1, 6):
            key = f"team_{i}"
            new_attrs[key] = {"name": f"Team {i}", "points": 0, "participating": True}
        hass.states.async_set("sensor.soundbeats_game_status", "ready", new_attrs)

    async def next_song(call):
        _LOGGER.info("Skipping to next song")
        state_obj = hass.states.get("sensor.soundbeats_game_status")
        if state_obj:
            hass.states.async_set("sensor.soundbeats_game_status", state_obj.state, state_obj.attributes)

    async def update_team_name(call):
        team_id = call.data.get("team_id")
        name = call.data.get("name")
        if not team_id or not name:
            _LOGGER.error("Missing team_id or name")
            return
        state_obj = hass.states.get("sensor.soundbeats_game_status")
        if state_obj:
            attrs = dict(state_obj.attributes)
            if team_id in attrs:
                attrs[team_id]["name"] = name
                hass.states.async_set("sensor.soundbeats_game_status", state_obj.state, attrs)

    async def update_team_points(call):
        team_id = call.data.get("team_id")
        points = call.data.get("points")
        if not team_id or points is None:
            _LOGGER.error("Missing team_id or points")
            return
        state_obj = hass.states.get("sensor.soundbeats_game_status")
        if state_obj:
            attrs = dict(state_obj.attributes)
            if team_id in attrs:
                attrs[team_id]["points"] = int(points)
                hass.states.async_set("sensor.soundbeats_game_status", state_obj.state, attrs)

    async def update_team_participating(call):
        team_id = call.data.get("team_id")
        participating = call.data.get("participating")
        if not team_id or participating is None:
            _LOGGER.error("Missing team_id or participating")
            return
        state_obj = hass.states.get("sensor.soundbeats_game_status")
        if state_obj:
            attrs = dict(state_obj.attributes)
            if team_id in attrs:
                attrs[team_id]["participating"] = bool(participating)
                hass.states.async_set("sensor.soundbeats_game_status", state_obj.state, attrs)

    async def update_countdown_timer_length(call):
        length = call.data.get("timer_length")
        if length is None:
            _LOGGER.error("Missing timer_length")
            return
        state_obj = hass.states.get("sensor.soundbeats_game_status")
        if state_obj:
            attrs = dict(state_obj.attributes)
            attrs["countdown_timer_length"] = int(length)
            hass.states.async_set("sensor.soundbeats_game_status", state_obj.state, attrs)

    async def update_audio_player(call):
        player = call.data.get("audio_player")
        if not player:
            _LOGGER.error("Missing audio_player")
            return
        state_obj = hass.states.get("sensor.soundbeats_game_status")
        if state_obj:
            attrs = dict(state_obj.attributes)
            attrs["audio_player"] = player
            hass.states.async_set("sensor.soundbeats_game_status", state_obj.state, attrs)

    # Register all services under the "soundbeats" domain
    hass.services.async_register(DOMAIN, "start_game", start_game)
    hass.services.async_register(DOMAIN, "stop_game", stop_game)
    hass.services.async_register(DOMAIN, "reset_game", reset_game)
    hass.services.async_register(DOMAIN, "next_song", next_song)
    hass.services.async_register(DOMAIN, "update_team_name", update_team_name)
    hass.services.async_register(DOMAIN, "update_team_points", update_team_points)
    hass.services.async_register(DOMAIN, "update_team_participating", update_team_participating)
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
