"""WebSocket API for Soundbeats game management."""
import logging
from typing import Any, Dict
import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from .const import DOMAIN, EVENT_GAME_STATE_CHANGED
from .game_manager import GameManager

_LOGGER = logging.getLogger(__name__)


def async_setup_websocket_api(hass: HomeAssistant) -> None:
    """Set up WebSocket API commands."""
    websocket_api.async_register_command(hass, websocket_new_game)
    websocket_api.async_register_command(hass, websocket_get_game_state)
    websocket_api.async_register_command(hass, websocket_update_team_name)
    websocket_api.async_register_command(hass, websocket_add_team)
    websocket_api.async_register_command(hass, websocket_remove_team)
    websocket_api.async_register_command(hass, websocket_subscribe_game_state)


@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/new_game",
    vol.Required("entry_id"): str,
    vol.Required("team_count"): vol.All(int, vol.Range(min=1, max=5)),
})
@websocket_api.async_response
async def websocket_new_game(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Handle new game creation."""
    entry_id = msg["entry_id"]
    team_count = msg["team_count"]
    
    if entry_id not in hass.data[DOMAIN]:
        connection.send_error(msg["id"], "invalid_entry", "Invalid entry ID")
        return
    
    game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
    
    try:
        game_state = await game_manager.new_game(team_count)
        connection.send_result(msg["id"], game_state.to_dict())
    except Exception as err:
        _LOGGER.error("Error creating new game: %s", err)
        connection.send_error(msg["id"], "game_error", str(err))


@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/get_game_state",
    vol.Required("entry_id"): str,
})
@websocket_api.async_response
async def websocket_get_game_state(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Get current game state."""
    entry_id = msg["entry_id"]
    
    if entry_id not in hass.data[DOMAIN]:
        connection.send_error(msg["id"], "invalid_entry", "Invalid entry ID")
        return
    
    game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
    state = game_manager.get_state()
    
    connection.send_result(msg["id"], {"state": state, "history": game_manager.get_history()})


@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/update_team_name",
    vol.Required("entry_id"): str,
    vol.Required("team_id"): str,
    vol.Required("name"): str,
})
@websocket_api.async_response
async def websocket_update_team_name(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Update team name."""
    entry_id = msg["entry_id"]
    
    if entry_id not in hass.data[DOMAIN]:
        connection.send_error(msg["id"], "invalid_entry", "Invalid entry ID")
        return
    
    game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
    
    try:
        await game_manager.update_team_name(msg["team_id"], msg["name"])
        connection.send_result(msg["id"], {"success": True})
    except Exception as err:
        _LOGGER.error("Error updating team name: %s", err)
        connection.send_error(msg["id"], "update_error", str(err))


@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/add_team",
    vol.Required("entry_id"): str,
})
@websocket_api.async_response
async def websocket_add_team(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Add a new team."""
    entry_id = msg["entry_id"]
    
    if entry_id not in hass.data[DOMAIN]:
        connection.send_error(msg["id"], "invalid_entry", "Invalid entry ID")
        return
    
    game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
    
    try:
        team = await game_manager.add_team()
        if team:
            connection.send_result(msg["id"], {"success": True, "team": team.to_dict()})
        else:
            connection.send_error(msg["id"], "limit_reached", "Maximum team limit reached")
    except Exception as err:
        _LOGGER.error("Error adding team: %s", err)
        connection.send_error(msg["id"], "add_error", str(err))


@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/remove_team",
    vol.Required("entry_id"): str,
    vol.Required("team_id"): str,
})
@websocket_api.async_response
async def websocket_remove_team(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Remove a team."""
    entry_id = msg["entry_id"]
    
    if entry_id not in hass.data[DOMAIN]:
        connection.send_error(msg["id"], "invalid_entry", "Invalid entry ID")
        return
    
    game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
    
    try:
        success = await game_manager.remove_team(msg["team_id"])
        if success:
            connection.send_result(msg["id"], {"success": True})
        else:
            connection.send_error(msg["id"], "min_teams", "Cannot remove team - minimum team limit reached")
    except Exception as err:
        _LOGGER.error("Error removing team: %s", err)
        connection.send_error(msg["id"], "remove_error", str(err))


@websocket_api.websocket_command({
    vol.Required("type"): "soundbeats/subscribe_game_state",
    vol.Required("entry_id"): str,
})
@websocket_api.async_response
async def websocket_subscribe_game_state(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: Dict[str, Any],
) -> None:
    """Subscribe to game state changes."""
    entry_id = msg["entry_id"]
    
    @callback
    def forward_game_state(game_state: Dict[str, Any]) -> None:
        """Forward game state to websocket."""
        connection.send_message(
            websocket_api.event_message(msg["id"], {"state": game_state})
        )
    
    # Subscribe to state changes
    unsub = async_dispatcher_connect(
        hass,
        f"{EVENT_GAME_STATE_CHANGED}_{entry_id}",
        forward_game_state
    )
    
    # Send initial state
    if entry_id in hass.data[DOMAIN] and "game_manager" in hass.data[DOMAIN][entry_id]:
        game_manager: GameManager = hass.data[DOMAIN][entry_id]["game_manager"]
        state = game_manager.get_state()
        if state:
            forward_game_state(state)
    
    # Handle unsubscribe
    connection.subscriptions[msg["id"]] = unsub
    connection.send_result(msg["id"])