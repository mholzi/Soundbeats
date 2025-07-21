"""Soundbeats sensor entities."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the mock sensor."""
    async_add_entities([MockSensor(config_entry.entry_id)], True)


class MockSensor(SensorEntity):
    """Soundbeats sensor entities."""

    _attr_has_entity_name = True
    _attr_name = "Mock Sensor"
    _attr_native_unit_of_measurement = "units"
    
    def __init__(self, entry_id: str) -> None:
        """Initialize the mock sensor."""
        self._entry_id = entry_id
        self._attr_unique_id = f"{entry_id}_mock_sensor"
        self._attr_native_value = 42

    @property
    def device_info(self) -> dict[str, Any]:
        """Return device info."""
        return {
            "identifiers": {(DOMAIN, self._entry_id)},
            "name": "Mock Media Device",
            "manufacturer": "Mock Manufacturer",
            "model": "Mock Model",
            "sw_version": "1.0.0",
        }