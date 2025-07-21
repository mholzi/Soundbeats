"""The Soundbeats component."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components import websocket_api
from homeassistant.components.http import StaticPathConfig

from .const import DOMAIN
from .game_manager import GameManager
from .websocket_api import async_setup_websocket_api

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.MEDIA_PLAYER]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Soundbeats from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "config": entry.data,
        "active_game": entry.data.get("active_game"),
        "game_history": entry.data.get("game_history", [])
    }
    
    # Initialize game manager
    game_manager = GameManager(hass, entry.entry_id)
    await game_manager.initialize()
    hass.data[DOMAIN][entry.entry_id]["game_manager"] = game_manager

    # Register static path for frontend assets
    await hass.http.async_register_static_paths([
        StaticPathConfig(
            "/soundbeats_static",
            str(hass.config.path(f"custom_components/{DOMAIN}/frontend/dist")),
            False
        )
    ])

    # Register panel in sidebar
    if DOMAIN not in hass.data.get("frontend_panels", {}):
        async_register_built_in_panel(
            hass,
            component_name="custom",
            sidebar_title="Soundbeats",
            sidebar_icon="mdi:music-note",
            frontend_url_path="soundbeats",
            config={
                "_panel_custom": {
                    "name": "soundbeats-frontend",
                    "embed_iframe": True,
                    "trust_external": False,
                    "js_url": "/soundbeats_static/soundbeats-panel.js",
                }
            },
            require_admin=False,
        )

    # Register WebSocket API
    async_setup_websocket_api(hass)

    # Forward entry setup to platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    # Clean up game manager
    if "game_manager" in hass.data[DOMAIN][entry.entry_id]:
        # Save final state before unloading
        game_manager = hass.data[DOMAIN][entry.entry_id]["game_manager"]
        state_data = {
            "active_game": game_manager.get_state(),
            "game_history": game_manager.get_history()
        }
        
        # Update config entry for persistence
        hass.config_entries.async_update_entry(
            entry, data={**entry.data, **state_data}
        )
    
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok

