"""The Soundbeats integration."""
import logging
import os

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.typing import ConfigType
from homeassistant.components.http import StaticPathConfig

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

    # Register frontend resources (card JS)
    await _register_frontend_resources(hass)

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

    async def start_game(call):
        """Start a new Soundbeats game session."""
        await game_service.start_game()

    async def stop_game(call):
        """Stop the current Soundbeats game session."""
        await game_service.stop_game()

    async def reset_game(call):
        """Reset the Soundbeats game to initial state."""
        await game_service.reset_game()

    async def next_song(call):
        """Skip to the next song and start the countdown timer."""
        await game_service.next_song()

    async def update_team_name(call):
        """Update the name of a team."""
        team_id = call.data.get("team_id")
        name = call.data.get("name")
        await team_service.update_team_attribute(
            team_id, "name", name, "update_team_name"
        )

    async def update_team_points(call):
        """Update the points of a team."""
        team_id = call.data.get("team_id")
        points = call.data.get("points")
        await team_service.update_team_attribute(
            team_id, "points", points, "update_team_points", 
            value_transform=int, state_attribute="points"
        )

    async def update_team_participating(call):
        """Update whether a team is participating in the game."""
        team_id = call.data.get("team_id")
        participating = call.data.get("participating")
        await team_service.update_team_attribute(
            team_id, "participating", participating, "update_team_participating", 
            value_transform=bool, state_attribute="participating"
        )

    async def update_team_year_guess(call):
        """Update the year guess of a team."""
        team_id = call.data.get("team_id")
        year_guess = call.data.get("year_guess")
        await team_service.update_team_attribute(
            team_id, "year_guess", year_guess, "update_team_year_guess", 
            value_transform=int, state_attribute="year_guess"
        )

    async def update_team_betting(call):
        """Update whether a team is betting on their guess."""
        team_id = call.data.get("team_id")
        betting = call.data.get("betting")
        await team_service.update_team_attribute(
            team_id, "betting", betting, "update_team_betting", 
            value_transform=bool, state_attribute="betting"
        )

    async def update_team_user_id(call):
        """Update the assigned user ID for a team."""
        team_id = call.data.get("team_id")
        user_id = call.data.get("user_id")
        await team_service.update_team_attribute(
            team_id, "user_id", user_id, "update_team_user_id", 
            state_attribute="user_id"
        )

    async def update_countdown_timer_length(call):
        """Update the countdown timer length in seconds."""
        timer_length = call.data.get("timer_length")
        await config_service.update_countdown_timer_length(timer_length)

    async def update_audio_player(call):
        """Update the selected audio player for the game."""
        audio_player = call.data.get("audio_player")
        await config_service.update_audio_player(audio_player)

    async def update_team_count(call):
        """Update the number of teams participating in the game."""
        team_count = call.data.get("team_count")
        await config_service.update_team_count(team_count)

    async def toggle_splash(call):
        """Toggle the splash screen override for testing purposes."""
        await game_service.toggle_splash()

    # Register all services under the "soundbeats" domain
    hass.services.async_register(DOMAIN, "start_game", start_game)
    hass.services.async_register(DOMAIN, "stop_game", stop_game)
    hass.services.async_register(DOMAIN, "reset_game", reset_game)
    hass.services.async_register(DOMAIN, "next_song", next_song)
    hass.services.async_register(DOMAIN, "update_team_name", update_team_name)
    hass.services.async_register(DOMAIN, "update_team_points", update_team_points)
    hass.services.async_register(DOMAIN, "update_team_participating", update_team_participating)
    hass.services.async_register(DOMAIN, "update_team_year_guess", update_team_year_guess)
    hass.services.async_register(DOMAIN, "update_team_betting", update_team_betting)
    hass.services.async_register(DOMAIN, "update_team_user_id", update_team_user_id)
    hass.services.async_register(DOMAIN, "update_countdown_timer_length", update_countdown_timer_length)
    hass.services.async_register(DOMAIN, "update_audio_player", update_audio_player)
    hass.services.async_register(DOMAIN, "update_team_count", update_team_count)
    hass.services.async_register(DOMAIN, "toggle_splash", toggle_splash)

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
