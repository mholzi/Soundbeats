"""The Soundbeats integration."""
from __future__ import annotations

import logging
import os
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType

_LOGGER = logging.getLogger(__name__)

DOMAIN = "soundbeats"
PLATFORMS: list[Platform] = [Platform.SENSOR]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Soundbeats component."""
    _LOGGER.info("Setting up Soundbeats integration")
    hass.data.setdefault(DOMAIN, {})
    
    # Register frontend resources
    await _register_frontend_resources(hass)
    
    return True


async def _register_frontend_resources(hass: HomeAssistant) -> None:
    """Register frontend resources for the Lovelace card."""
    try:
        # Get the path to the www directory
        www_path = os.path.join(os.path.dirname(__file__), "www")
        card_path = os.path.join(www_path, "soundbeats-card.js")
        
        # Check if the card file exists
        if os.path.exists(card_path):
            # Register the static path for the card
            hass.http.register_static_path(
                "/soundbeats/soundbeats-card.js",
                card_path,
                cache_headers=False,
            )
            _LOGGER.info("Registered Soundbeats card static path")
        else:
            _LOGGER.warning("Soundbeats card file not found at %s", card_path)
            
    except Exception as e:
        _LOGGER.error("Failed to register frontend resources: %s", e)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Soundbeats from a config entry."""
    _LOGGER.info("Setting up Soundbeats config entry: %s", entry.entry_id)
    
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}
    
    # Register services
    await _register_services(hass)
    
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _register_services(hass: HomeAssistant) -> None:
    """Register Soundbeats services."""
    
    async def start_game(call) -> None:
        """Handle start game service call."""
        _LOGGER.info("Starting Soundbeats game")
        # Update the sensor state
        sensor_id = "sensor.soundbeats_game_status"
        if sensor_id in hass.states.async_entity_ids():
            hass.states.async_set(sensor_id, "playing")
    
    async def stop_game(call) -> None:
        """Handle stop game service call."""
        _LOGGER.info("Stopping Soundbeats game")
        # Update the sensor state
        sensor_id = "sensor.soundbeats_game_status"
        if sensor_id in hass.states.async_entity_ids():
            hass.states.async_set(sensor_id, "stopped")
    
    async def reset_game(call) -> None:
        """Handle reset game service call."""
        _LOGGER.info("Resetting Soundbeats game")
        # Update the sensor state
        sensor_id = "sensor.soundbeats_game_status"
        if sensor_id in hass.states.async_entity_ids():
            hass.states.async_set(sensor_id, "ready")
    
    async def next_song(call) -> None:
        """Handle next song service call."""
        _LOGGER.info("Skipping to next song in Soundbeats game")
        # Update the sensor state (could update song info attributes)
        sensor_id = "sensor.soundbeats_game_status"
        if sensor_id in hass.states.async_entity_ids():
            # Keep current state but could update attributes like current_song
            current_state = hass.states.get(sensor_id)
            if current_state:
                hass.states.async_set(sensor_id, current_state.state)
    
    # Register the services
    hass.services.async_register(DOMAIN, "start_game", start_game)
    hass.services.async_register(DOMAIN, "stop_game", stop_game)
    hass.services.async_register(DOMAIN, "reset_game", reset_game)
    hass.services.async_register(DOMAIN, "next_song", next_song)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Soundbeats config entry: %s", entry.entry_id)
    
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
        
        # Remove services if no more entries
        if not hass.data[DOMAIN]:
            hass.services.async_remove(DOMAIN, "start_game")
            hass.services.async_remove(DOMAIN, "stop_game")
            hass.services.async_remove(DOMAIN, "reset_game")
            hass.services.async_remove(DOMAIN, "next_song")
    
    return unload_ok