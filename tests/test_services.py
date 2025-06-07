"""Test the Soundbeats service classes."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch, mock_open

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ServiceValidationError

from custom_components.soundbeats.services import (
    SoundbeatsGameService,
    SoundbeatsTeamService,
    SoundbeatsConfigService,
)
from custom_components.soundbeats.const import DOMAIN


@pytest.fixture
def hass():
    """Return a mock HomeAssistant instance."""
    hass = MagicMock(spec=HomeAssistant)
    hass.data = {DOMAIN: {"entities": {}}}
    hass.states = MagicMock()
    hass.services = MagicMock()
    hass.services.async_call = AsyncMock()
    hass.async_add_executor_job = AsyncMock()
    return hass


@pytest.fixture
def game_service(hass):
    """Return a SoundbeatsGameService instance."""
    return SoundbeatsGameService(hass)


@pytest.fixture
def team_service(hass):
    """Return a SoundbeatsTeamService instance."""
    return SoundbeatsTeamService(hass)


@pytest.fixture
def config_service(hass):
    """Return a SoundbeatsConfigService instance."""
    return SoundbeatsConfigService(hass)


class TestSoundbeatsGameService:
    """Test the SoundbeatsGameService class."""

    async def test_start_game_success(self, game_service, hass):
        """Test successful game start."""
        # Setup mock entities
        main_sensor = MagicMock()
        main_sensor.set_state = MagicMock()
        hass.data[DOMAIN]["entities"]["main_sensor"] = main_sensor
        
        # Test
        await game_service.start_game()
        
        # Verify
        main_sensor.set_state.assert_called_once_with("playing")

    async def test_start_game_fallback_when_no_entity(self, game_service, hass):
        """Test game start with fallback to direct state setting."""
        # No entities available
        hass.data[DOMAIN]["entities"] = {}
        
        # Test
        await game_service.start_game()
        
        # Verify fallback was used
        hass.states.async_set.assert_called()

    async def test_stop_game_success(self, game_service, hass):
        """Test successful game stop."""
        # Setup mock entities
        main_sensor = MagicMock()
        main_sensor.set_state = MagicMock()
        hass.data[DOMAIN]["entities"]["main_sensor"] = main_sensor
        
        # Test
        await game_service.stop_game()
        
        # Verify
        main_sensor.set_state.assert_called_once_with("stopped")

    async def test_load_songs_file_success(self, game_service, hass):
        """Test successful songs file loading."""
        mock_songs = [{"id": "song1", "url": "http://example.com/song1.mp3"}]
        
        with patch("builtins.open", mock_open(read_data='[{"id": "song1", "url": "http://example.com/song1.mp3"}]')):
            hass.async_add_executor_job.return_value = mock_songs
            
            songs = await game_service._load_songs_file()
            
            assert songs == mock_songs

    async def test_load_songs_file_not_found(self, game_service, hass):
        """Test songs file not found."""
        def mock_load():
            raise FileNotFoundError("songs.json not found")
        
        hass.async_add_executor_job.side_effect = mock_load
        
        songs = await game_service._load_songs_file()
        
        assert songs == []

    async def test_next_song_no_player_selected(self, game_service, hass):
        """Test next song when no audio player is selected."""
        # Setup entities with no selected player
        current_song_sensor = MagicMock()
        current_song_sensor.state = "None"
        hass.data[DOMAIN]["entities"]["current_song_sensor"] = current_song_sensor
        
        # Test
        await game_service.next_song()
        
        # Verify current song was cleared
        current_song_sensor.clear_current_song.assert_called_once()

    async def test_next_song_with_valid_player(self, game_service, hass):
        """Test next song with valid audio player."""
        # Setup entities
        current_song_sensor = MagicMock()
        current_song_sensor.state = "media_player.test_player"
        played_songs_sensor = MagicMock()
        played_songs_sensor.extra_state_attributes = {"played_song_ids": []}
        countdown_sensor = MagicMock()
        countdown_sensor.state = 30
        countdown_current_sensor = MagicMock()
        
        hass.data[DOMAIN]["entities"] = {
            "current_song_sensor": current_song_sensor,
            "played_songs_sensor": played_songs_sensor,
            "countdown_sensor": countdown_sensor,
            "countdown_current_sensor": countdown_current_sensor,
        }
        
        # Mock songs loading
        mock_songs = [{"id": "song1", "url": "http://example.com/song1.mp3", "year": "1990"}]
        with patch.object(game_service, '_load_songs_file', return_value=mock_songs):
            
            # Test
            await game_service.next_song()
            
            # Verify media player service was called with blocking=True
            hass.services.async_call.assert_called()
            call_args = hass.services.async_call.call_args
            assert call_args[0][0] == "media_player"
            assert call_args[0][1] == "play_media"
            assert call_args[0][2]["entity_id"] == "media_player.test_player"
            assert call_args[0][2]["media_content_id"] == "http://example.com/song1.mp3"
            assert call_args[0][2]["media_content_type"] == "music"
            # Verify blocking=True is passed
            assert call_args[1]["blocking"] == True


class TestSoundbeatsTeamService:
    """Test the SoundbeatsTeamService class."""

    async def test_validate_team_id_valid(self, team_service):
        """Test valid team ID validation."""
        team_number = team_service._validate_team_id("team_1")
        assert team_number == 1

    async def test_validate_team_id_invalid_format(self, team_service):
        """Test invalid team ID format."""
        with pytest.raises(ServiceValidationError, match="Invalid team_id format"):
            team_service._validate_team_id("invalid")

    async def test_validate_team_id_out_of_range(self, team_service):
        """Test team ID out of valid range."""
        with pytest.raises(ServiceValidationError, match="Invalid team number"):
            team_service._validate_team_id("team_6")

    async def test_update_team_attribute_success(self, team_service, hass):
        """Test successful team attribute update."""
        # Setup mock team sensor
        team_sensor = MagicMock()
        team_sensor.update_team_name = MagicMock()
        hass.data[DOMAIN]["entities"]["team_sensors"] = {"soundbeats_team_1": team_sensor}
        
        # Test
        await team_service.update_team_attribute(
            "team_1", "name", "New Team Name", "update_team_name"
        )
        
        # Verify
        team_sensor.update_team_name.assert_called_once_with("New Team Name")

    async def test_update_team_attribute_missing_team_id(self, team_service):
        """Test team attribute update with missing team ID."""
        with pytest.raises(ServiceValidationError, match="Missing team_id"):
            await team_service.update_team_attribute(
                "", "name", "New Team Name", "update_team_name"
            )

    async def test_update_team_attribute_fallback(self, team_service, hass):
        """Test team attribute update fallback to direct state setting."""
        # No team sensors available
        hass.data[DOMAIN]["entities"]["team_sensors"] = {}
        
        # Mock existing state
        mock_state = MagicMock()
        mock_state.attributes = {"points": 10}
        mock_state.state = "Team 1"
        hass.states.get.return_value = mock_state
        
        # Test
        await team_service.update_team_attribute(
            "team_1", "points", 20, "update_team_points", 
            value_transform=int, state_attribute="points"
        )
        
        # Verify fallback was used
        hass.states.async_set.assert_called()


class TestSoundbeatsConfigService:
    """Test the SoundbeatsConfigService class."""

    async def test_update_countdown_timer_length_success(self, config_service, hass):
        """Test successful countdown timer length update."""
        # Setup mock timer sensor
        timer_sensor = MagicMock()
        timer_sensor.update_timer_length = MagicMock()
        hass.data[DOMAIN]["entities"]["countdown_sensor"] = timer_sensor
        
        # Test
        await config_service.update_countdown_timer_length(45)
        
        # Verify
        timer_sensor.update_timer_length.assert_called_once_with(45)

    async def test_update_countdown_timer_length_invalid_range(self, config_service):
        """Test countdown timer length update with invalid range."""
        with pytest.raises(ServiceValidationError, match="Invalid timer_length"):
            await config_service.update_countdown_timer_length(400)

    async def test_update_audio_player_success(self, config_service, hass):
        """Test successful audio player update."""
        # Setup mock current song sensor
        current_song_sensor = MagicMock()
        current_song_sensor.update_selected_media_player = MagicMock()
        hass.data[DOMAIN]["entities"]["current_song_sensor"] = current_song_sensor
        
        # Mock entity existence check
        mock_state = MagicMock()
        hass.states.get.return_value = mock_state
        
        # Test
        await config_service.update_audio_player("media_player.test_player")
        
        # Verify
        current_song_sensor.update_selected_media_player.assert_called_once_with("media_player.test_player")

    async def test_update_audio_player_invalid_entity(self, config_service):
        """Test audio player update with invalid entity."""
        with pytest.raises(ServiceValidationError, match="Invalid audio_player"):
            await config_service.update_audio_player("invalid_entity")

    async def test_update_audio_player_entity_not_found(self, config_service, hass):
        """Test audio player update with non-existent entity."""
        # Mock entity not found
        hass.states.get.return_value = None
        
        with pytest.raises(ServiceValidationError, match="Media player entity not found"):
            await config_service.update_audio_player("media_player.nonexistent")

    async def test_update_team_count_success(self, config_service, hass):
        """Test successful team count update."""
        # Setup mock main sensor
        main_sensor = MagicMock()
        main_sensor.set_team_count = MagicMock()
        hass.data[DOMAIN]["entities"]["main_sensor"] = main_sensor
        
        # Test
        await config_service.update_team_count(3)
        
        # Verify
        main_sensor.set_team_count.assert_called_once_with(3)

    async def test_update_team_count_invalid_range(self, config_service):
        """Test team count update with invalid range."""
        with pytest.raises(ServiceValidationError, match="Invalid team_count"):
            await config_service.update_team_count(6)