"""Soundbeats media player entities."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.media_player import (
    MediaPlayerEntity,
    MediaPlayerEntityFeature,
    MediaPlayerState,
    MediaType,
)
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
    """Set up the mock media player."""
    async_add_entities([MockMediaPlayer(config_entry.entry_id)], True)


class MockMediaPlayer(MediaPlayerEntity):
    """Soundbeats media player entities."""

    _attr_has_entity_name = True
    _attr_name = "Mock Player"
    
    def __init__(self, entry_id: str) -> None:
        """Initialize the mock media player."""
        self._entry_id = entry_id
        self._attr_unique_id = f"{entry_id}_mock_player"
        self._state = MediaPlayerState.IDLE
        self._volume = 0.5
        self._is_muted = False
        self._media_title: str | None = None
        self._media_artist: str | None = None
        self._media_duration: int | None = None
        self._media_position: int | None = None
        
        # Define supported features
        self._attr_supported_features = (
            MediaPlayerEntityFeature.PLAY
            | MediaPlayerEntityFeature.PAUSE
            | MediaPlayerEntityFeature.STOP
            | MediaPlayerEntityFeature.VOLUME_SET
            | MediaPlayerEntityFeature.VOLUME_MUTE
            | MediaPlayerEntityFeature.VOLUME_STEP
            | MediaPlayerEntityFeature.PLAY_MEDIA
            | MediaPlayerEntityFeature.NEXT_TRACK
            | MediaPlayerEntityFeature.PREVIOUS_TRACK
        )

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

    @property
    def state(self) -> MediaPlayerState | None:
        """Return the current state."""
        return self._state

    @property
    def volume_level(self) -> float | None:
        """Return the volume level."""
        return self._volume

    @property
    def is_volume_muted(self) -> bool | None:
        """Return whether volume is muted."""
        return self._is_muted

    @property
    def media_content_type(self) -> MediaType | str | None:
        """Return the content type of current playing media."""
        if self._state in (MediaPlayerState.PLAYING, MediaPlayerState.PAUSED):
            return MediaType.MUSIC
        return None

    @property
    def media_title(self) -> str | None:
        """Return the title of current playing media."""
        return self._media_title

    @property
    def media_artist(self) -> str | None:
        """Return the artist of current playing media."""
        return self._media_artist

    @property
    def media_duration(self) -> int | None:
        """Return the duration of current playing media in seconds."""
        return self._media_duration

    @property
    def media_position(self) -> int | None:
        """Return the position of current playing media in seconds."""
        return self._media_position

    async def async_play_media(
        self, media_type: MediaType | str, media_id: str, **kwargs: Any
    ) -> None:
        """Play media."""
        _LOGGER.debug("Playing media: %s - %s", media_type, media_id)
        self._state = MediaPlayerState.PLAYING
        self._media_title = f"Mock Track: {media_id}"
        self._media_artist = "Mock Artist"
        self._media_duration = 180  # 3 minutes
        self._media_position = 0
        self.async_write_ha_state()

    async def async_media_play(self) -> None:
        """Start playing."""
        if self._state == MediaPlayerState.PAUSED:
            self._state = MediaPlayerState.PLAYING
            self.async_write_ha_state()

    async def async_media_pause(self) -> None:
        """Pause playback."""
        if self._state == MediaPlayerState.PLAYING:
            self._state = MediaPlayerState.PAUSED
            self.async_write_ha_state()

    async def async_media_stop(self) -> None:
        """Stop playback."""
        self._state = MediaPlayerState.IDLE
        self._media_title = None
        self._media_artist = None
        self._media_duration = None
        self._media_position = None
        self.async_write_ha_state()

    async def async_media_next_track(self) -> None:
        """Skip to next track."""
        _LOGGER.debug("Skipping to next track")
        if self._state in (MediaPlayerState.PLAYING, MediaPlayerState.PAUSED):
            self._media_title = "Mock Track: Next"
            self._media_position = 0
            self.async_write_ha_state()

    async def async_media_previous_track(self) -> None:
        """Skip to previous track."""
        _LOGGER.debug("Skipping to previous track")
        if self._state in (MediaPlayerState.PLAYING, MediaPlayerState.PAUSED):
            self._media_title = "Mock Track: Previous"
            self._media_position = 0
            self.async_write_ha_state()

    async def async_set_volume_level(self, volume: float) -> None:
        """Set volume level."""
        self._volume = volume
        self.async_write_ha_state()

    async def async_mute_volume(self, mute: bool) -> None:
        """Mute/unmute volume."""
        self._is_muted = mute
        self.async_write_ha_state()

    async def async_volume_up(self) -> None:
        """Increase volume."""
        if self._volume < 1.0:
            self._volume = min(1.0, self._volume + 0.1)
            self.async_write_ha_state()

    async def async_volume_down(self) -> None:
        """Decrease volume."""
        if self._volume > 0.0:
            self._volume = max(0.0, self._volume - 0.1)
            self.async_write_ha_state()