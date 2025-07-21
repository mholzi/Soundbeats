"""The Soundbeats component."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.components.frontend import async_register_built_in_panel
from homeassistant.components import websocket_api

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.MEDIA_PLAYER]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Soundbeats from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data

    # Register static path for frontend assets
    await hass.http.async_register_static_paths(
        "/soundbeats_static",
        hass.config.path(f"custom_components/{DOMAIN}/frontend/dist"),
        cache_headers=False,
    )

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

    # Register WebSocket commands for future use
    websocket_api.async_register_command(hass, websocket_get_status)

    # Forward entry setup to platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    if unload_ok := await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok


# Basic WebSocket command for testing
@websocket_api.websocket_command(
    {
        "type": "soundbeats/status",
    }
)
@websocket_api.async_response
async def websocket_get_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Handle get status command."""
    connection.send_result(
        msg["id"],
        {
            "status": "ready",
            "version": "1.0.0",
            "message": "Soundbeats integration is ready"
        }
    )