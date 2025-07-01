"""The Soundbeats integration."""
import logging
import os

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.components.http import StaticPathConfig
from homeassistant.components import frontend

from .const import DOMAIN
from .services import SoundbeatsGameService, SoundbeatsTeamService, SoundbeatsConfigService

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR]

async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up Soundbeats integration from YAML (if needed)."""
    _LOGGER.info("Setting up Soundbeats integration from YAML")
    hass.data.setdefault(DOMAIN, {})

    # Register frontend resources (card JS)
    await _register_frontend_resources(hass)

    # Register dashboard panel in sidebar
    await _register_dashboard_panel(hass)

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

async def _register_dashboard_panel(hass: HomeAssistant) -> None:
    """Register the Soundbeats dashboard panel in the sidebar."""
    try:
        # Register the panel in Home Assistant's sidebar using the simpler registration method
        hass.components.frontend.async_register_built_in_panel(
            "iframe",
            "Soundbeats",
            "mdi:music-note",
            frontend_url_path="soundbeats-dashboard",
            config={"url": "/soundbeats_frontend_assets/soundbeats-dashboard.html"},
            require_admin=False,
        )
        _LOGGER.info("Registered Soundbeats dashboard panel in sidebar")
    except Exception as e:
        _LOGGER.error("Failed to register Soundbeats dashboard panel: %s", e)

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Soundbeats from a config entry."""
    _LOGGER.info("Setting up Soundbeats config entry %s", entry.entry_id)
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}

    # Register frontend resources (card JS)
    await _register_frontend_resources(hass)

    # Register dashboard panel in sidebar
    await _register_dashboard_panel(hass)

    # Forward to sensor platform (so sensor.py is loaded)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Register all game services (after entities are created)
    await _register_services(hass)
    
    return True

async def _register_services(hass: HomeAssistant) -> None:
    """Register all `soundbeats.*` services (start_game, stop_game, etc.)."""
    
    # Initialize service classes
    game_service = SoundbeatsGameService(hass)
    team_service = SoundbeatsTeamService(hass)
    config_service = SoundbeatsConfigService(hass)

    # Define service configurations
    # Format: service_name -> (handler_function, call_data_params, extra_kwargs)
    simple_services = {
        # Simple game services that don't need call data
        "start_game": game_service.start_game,
        "stop_game": game_service.stop_game, 
        "reset_game": game_service.reset_game,
        "next_song": game_service.next_song,
        "toggle_splash": game_service.toggle_splash,
    }
    
    # Services that extract a single parameter from call data
    parameter_services = {
        "update_countdown_timer_length": (config_service.update_countdown_timer_length, "timer_length"),
        "update_audio_player": (config_service.update_audio_player, "audio_player"),
        "update_team_count": (config_service.update_team_count, "team_count"),
    }
    
    # Team services that use update_team_attribute
    team_services = {
        "update_team_name": {
            "attribute": "name",
            "method": "update_team_name",
        },
        "update_team_points": {
            "attribute": "points", 
            "method": "update_team_points",
            "value_transform": int,
            "state_attribute": "points",
        },
        "update_team_participating": {
            "attribute": "participating",
            "method": "update_team_participating", 
            "value_transform": bool,
            "state_attribute": "participating",
        },
        "update_team_year_guess": {
            "attribute": "year_guess",
            "method": "update_team_year_guess",
            "value_transform": int,
            "state_attribute": "year_guess",
        },
        "update_team_betting": {
            "attribute": "betting",
            "method": "update_team_betting",
            "value_transform": bool,
            "state_attribute": "betting",
        },
        "update_team_user_id": {
            "attribute": "user_id",
            "method": "update_team_user_id",
            "state_attribute": "user_id",
        },
    }

    # Create wrapper functions and register simple services
    for service_name, handler in simple_services.items():
        async def service_wrapper(call, bound_handler=handler):
            await bound_handler()
        hass.services.async_register(DOMAIN, service_name, service_wrapper)

    # Create wrapper functions and register parameter services
    for service_name, (handler, param_name) in parameter_services.items():
        async def service_wrapper(call, bound_handler=handler, param=param_name):
            value = call.data.get(param)
            await bound_handler(value)
        hass.services.async_register(DOMAIN, service_name, service_wrapper)

    # Create wrapper functions and register team services
    for service_name, config in team_services.items():
        async def service_wrapper(call, service_config=config):
            team_id = call.data.get("team_id")
            value = call.data.get(service_config["attribute"])
            
            kwargs = {
                "team_id": team_id,
                "attribute_name": service_config["attribute"],
                "value": value,
                "method_name": service_config["method"],
            }
            
            # Add optional parameters if present
            if "value_transform" in service_config:
                kwargs["value_transform"] = service_config["value_transform"]
            if "state_attribute" in service_config:
                kwargs["state_attribute"] = service_config["state_attribute"]
                
            await team_service.update_team_attribute(**kwargs)
            
        hass.services.async_register(DOMAIN, service_name, service_wrapper)

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
                "update_team_year_guess",
                "update_team_betting",
                "update_team_user_id",
                "update_countdown_timer_length",
                "update_audio_player",
                "update_team_count",
                "toggle_splash",
            ]:
                hass.services.async_remove(DOMAIN, svc)
    return unload_ok
