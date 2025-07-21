"""Example of a simple sensor implementation."""
from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorEntity,
    SensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensor platform."""
    async_add_entities([ExampleSensor(entry)])


class ExampleSensor(SensorEntity):
    """Representation of an Example Sensor."""

    def __init__(self, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        self._attr_unique_id = f"{entry.entry_id}_sensor"
        self._attr_name = "Example Sensor"

    @property
    def native_value(self) -> Any:
        """Return the state of the sensor."""
        return 42