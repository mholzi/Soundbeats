"""Test the Soundbeats panel integration."""
import asyncio
from unittest.mock import MagicMock, patch

import pytest

from custom_components.soundbeats import async_setup_entry, _register_dashboard_panel
from custom_components.soundbeats.const import DOMAIN


@pytest.fixture
def hass():
    """Return a mock HomeAssistant instance."""
    hass = MagicMock()
    hass.data = {DOMAIN: {}}
    hass.config_entries = MagicMock()
    hass.config_entries.async_forward_entry_setups = MagicMock(return_value=asyncio.Future())
    hass.config_entries.async_forward_entry_setups.return_value.set_result(True)
    hass.components = MagicMock()
    hass.components.frontend = MagicMock()
    hass.components.frontend.async_register_built_in_panel = MagicMock()
    return hass


@pytest.fixture  
def entry():
    """Return a mock config entry."""
    entry = MagicMock()
    entry.entry_id = "test_entry"
    return entry


class TestPanelIntegration:
    """Test the panel integration functionality."""

    async def test_register_dashboard_panel_success(self, hass):
        """Test successful panel registration."""
        await _register_dashboard_panel(hass)
        
        # Verify the panel was registered with correct parameters
        hass.components.frontend.async_register_built_in_panel.assert_called_once_with(
            "iframe",
            "Soundbeats", 
            "mdi:music-note",
            frontend_url_path="soundbeats-dashboard",
            config={"url": "/soundbeats_frontend_assets/soundbeats-dashboard.html"},
            require_admin=False,
        )

    async def test_register_dashboard_panel_failure(self, hass):
        """Test panel registration handles errors gracefully."""
        # Make the panel registration fail
        hass.components.frontend.async_register_built_in_panel.side_effect = Exception("Panel registration failed")
        
        # Should not raise exception, but log error
        await _register_dashboard_panel(hass)
        
        # Verify it was attempted
        hass.components.frontend.async_register_built_in_panel.assert_called_once()

    @patch('custom_components.soundbeats._register_frontend_resources')
    @patch('custom_components.soundbeats._register_dashboard_panel')
    @patch('custom_components.soundbeats._register_services')
    async def test_setup_entry_includes_panel_registration(
        self, mock_register_services, mock_register_panel, mock_register_resources, hass, entry
    ):
        """Test that setup_entry calls panel registration."""
        # Mock the async functions to return completed futures
        mock_register_resources.return_value = asyncio.Future()
        mock_register_resources.return_value.set_result(None)
        
        mock_register_panel.return_value = asyncio.Future()
        mock_register_panel.return_value.set_result(None)
        
        mock_register_services.return_value = asyncio.Future()
        mock_register_services.return_value.set_result(None)
        
        # Call setup entry
        result = await async_setup_entry(hass, entry)
        
        # Verify all registration functions were called
        assert result is True
        mock_register_resources.assert_called_once_with(hass)
        mock_register_panel.assert_called_once_with(hass)
        mock_register_services.assert_called_once_with(hass)