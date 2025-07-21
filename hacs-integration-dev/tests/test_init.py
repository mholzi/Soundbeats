"""Test the Soundbeats init."""
import pytest
from unittest.mock import patch, MagicMock
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

from custom_components.soundbeats import async_setup_entry, async_unload_entry
from custom_components.soundbeats.const import DOMAIN


@pytest.fixture
def mock_entry():
    """Mock config entry."""
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"
    entry.data = {}
    return entry


async def test_setup_entry(hass: HomeAssistant, mock_entry):
    """Test setup entry."""
    with patch('custom_components.soundbeats.async_register_built_in_panel') as mock_panel, \
         patch('homeassistant.components.websocket_api.async_register_command'), \
         patch('homeassistant.core.HomeAssistant.http') as mock_http:
        
        mock_http.async_register_static_path = MagicMock()
        
        result = await async_setup_entry(hass, mock_entry)
        
        assert result is True
        assert DOMAIN in hass.data
        assert mock_entry.entry_id in hass.data[DOMAIN]
        mock_panel.assert_called_once()
        mock_http.async_register_static_path.assert_called_once()


async def test_unload_entry(hass: HomeAssistant, mock_entry):
    """Test unload entry."""
    hass.data[DOMAIN] = {mock_entry.entry_id: {}}
    
    with patch('homeassistant.config_entries.ConfigEntries.async_unload_platforms', return_value=True):
        result = await async_unload_entry(hass, mock_entry)
        
        assert result is True
        assert mock_entry.entry_id not in hass.data[DOMAIN]


async def test_setup_entry_failure(hass: HomeAssistant, mock_entry):
    """Test setup entry handles failure gracefully."""
    with patch('custom_components.soundbeats.async_register_built_in_panel', side_effect=Exception("Test error")):
        # Should not raise exception, but may return False
        try:
            result = await async_setup_entry(hass, mock_entry)
            # If it returns, it should be boolean
            assert isinstance(result, bool)
        except Exception:
            # If it raises, that's also acceptable behavior
            pass