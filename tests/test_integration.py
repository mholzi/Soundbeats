"""Test Soundbeats config flow and basic integration."""
import pytest
from unittest.mock import MagicMock, patch

from homeassistant.const import CONF_NAME
from homeassistant.data_entry_flow import FlowResultType

from custom_components.soundbeats.config_flow import ConfigFlow
from custom_components.soundbeats.const import DOMAIN


@pytest.fixture
def hass():
    """Return a mock HomeAssistant instance."""
    hass = MagicMock()
    hass.data = {}
    return hass


class TestConfigFlow:
    """Test the config flow."""

    async def test_user_form_single_instance(self):
        """Test that we can only have one instance."""
        flow = ConfigFlow()
        flow.hass = MagicMock()
        
        # Mock existing entry
        flow._async_current_entries = MagicMock(return_value=[{"domain": DOMAIN}])
        
        result = await flow.async_step_user()
        
        assert result["type"] == FlowResultType.ABORT
        assert result["reason"] == "single_instance_allowed"

    async def test_user_form_success(self):
        """Test successful user form submission."""
        flow = ConfigFlow()
        flow.hass = MagicMock()
        
        # Mock no existing entries
        flow._async_current_entries = MagicMock(return_value=[])
        
        # Test showing the form
        result = await flow.async_step_user()
        assert result["type"] == FlowResultType.FORM
        assert result["step_id"] == "user"

    async def test_user_form_create_entry(self):
        """Test creating entry from user input."""
        flow = ConfigFlow()
        flow.hass = MagicMock()
        
        # Mock no existing entries
        flow._async_current_entries = MagicMock(return_value=[])
        
        # Test creating entry with user input
        result = await flow.async_step_user(user_input={})
        
        assert result["type"] == FlowResultType.CREATE_ENTRY
        assert result["title"] == "Soundbeats"
        assert result["data"] == {}

    async def test_import_step_single_instance(self):
        """Test import step with existing instance."""
        flow = ConfigFlow()
        flow.hass = MagicMock()
        
        # Mock existing entry
        flow._async_current_entries = MagicMock(return_value=[{"domain": DOMAIN}])
        
        result = await flow.async_step_import({})
        
        assert result["type"] == FlowResultType.ABORT
        assert result["reason"] == "single_instance_allowed"

    async def test_import_step_success(self):
        """Test successful import step."""
        flow = ConfigFlow()
        flow.hass = MagicMock()
        
        # Mock no existing entries
        flow._async_current_entries = MagicMock(return_value=[])
        
        result = await flow.async_step_import({})
        
        assert result["type"] == FlowResultType.CREATE_ENTRY
        assert result["title"] == "Soundbeats"
        assert result["data"] == {}


class TestIntegrationSetup:
    """Test basic integration setup."""

    @patch("custom_components.soundbeats.async_setup_entry")
    async def test_basic_setup(self, mock_setup_entry, hass):
        """Test basic integration setup doesn't crash."""
        from custom_components.soundbeats import async_setup
        
        mock_setup_entry.return_value = True
        
        # Test basic setup
        result = await async_setup(hass, {})
        
        assert result is True
        assert DOMAIN in hass.data

    @patch("custom_components.soundbeats._register_frontend_resources")
    @patch("custom_components.soundbeats._register_services")
    async def test_setup_entry_creation(self, mock_register_services, mock_register_frontend, hass):
        """Test config entry setup."""
        from custom_components.soundbeats import async_setup_entry
        
        # Mock config entry
        config_entry = MagicMock()
        config_entry.entry_id = "test_entry"
        
        # Mock hass methods
        hass.config_entries = MagicMock()
        hass.config_entries.async_forward_entry_setups = MagicMock()
        
        result = await async_setup_entry(hass, config_entry)
        
        assert result is True
        assert DOMAIN in hass.data
        assert config_entry.entry_id in hass.data[DOMAIN]