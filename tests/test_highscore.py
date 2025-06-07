"""Test Soundbeats highscore sensor functionality."""
import pytest
from unittest.mock import MagicMock, AsyncMock

from custom_components.soundbeats.sensor import SoundbeatsHighscoreSensor


@pytest.fixture
def highscore_sensor():
    """Return a highscore sensor instance."""
    return SoundbeatsHighscoreSensor()


class TestHighscoreSensor:
    """Test the highscore sensor."""
    
    def test_initialization(self, highscore_sensor):
        """Test that the sensor initializes with correct default values."""
        assert highscore_sensor._absolute_highscore == 0
        assert highscore_sensor._total_points == 0
        assert highscore_sensor._total_rounds == 0
        assert highscore_sensor._round_highscores == {}
        
    def test_state_returns_average(self, highscore_sensor):
        """Test that state returns the correct average score."""
        # Test with no highscore
        assert highscore_sensor.state == 0.0
        
        # Test with a highscore (stored as int * 100)
        highscore_sensor._absolute_highscore = 1550  # 15.5 points per round
        assert highscore_sensor.state == 15.5
        
    def test_extra_state_attributes(self, highscore_sensor):
        """Test that extra state attributes include new total_points and total_rounds."""
        attrs = highscore_sensor.extra_state_attributes
        
        assert "total_points" in attrs
        assert "total_rounds" in attrs
        assert attrs["total_points"] == 0
        assert attrs["total_rounds"] == 0
        
        # Set some values and test again
        highscore_sensor._total_points = 100
        highscore_sensor._total_rounds = 5
        
        attrs = highscore_sensor.extra_state_attributes
        assert attrs["total_points"] == 100
        assert attrs["total_rounds"] == 5
        
    def test_update_highscore_new_record(self, highscore_sensor):
        """Test updating highscore with a new record."""
        # Test new highscore record
        result = highscore_sensor.update_highscore(team_score=120, round_number=8)
        
        assert result["absolute"] is True
        assert result["round"] is True
        assert highscore_sensor._absolute_highscore == 1500  # 15.0 * 100
        assert highscore_sensor._total_points == 120
        assert highscore_sensor._total_rounds == 8
        assert highscore_sensor.state == 15.0
        
    def test_update_highscore_not_a_record(self, highscore_sensor):
        """Test updating highscore when score is not a record."""
        # Set an existing highscore
        highscore_sensor._absolute_highscore = 2000  # 20.0 points per round
        highscore_sensor._total_points = 80
        highscore_sensor._total_rounds = 4
        
        # Try to update with a lower average
        result = highscore_sensor.update_highscore(team_score=100, round_number=6)  # 16.67 average
        
        assert result["absolute"] is False
        assert result["round"] is True  # Round record might still be set
        # Values should remain unchanged for absolute highscore
        assert highscore_sensor._absolute_highscore == 2000
        assert highscore_sensor._total_points == 80  
        assert highscore_sensor._total_rounds == 4
        
    def test_update_highscore_same_average_higher_total(self, highscore_sensor):
        """Test that higher total points with same average doesn't update record."""
        # Set existing record: 60 points in 4 rounds = 15.0 average
        highscore_sensor._absolute_highscore = 1500
        highscore_sensor._total_points = 60
        highscore_sensor._total_rounds = 4
        
        # Try with same average but higher total: 90 points in 6 rounds = 15.0 average
        result = highscore_sensor.update_highscore(team_score=90, round_number=6)
        
        assert result["absolute"] is False
        # Original values should be preserved
        assert highscore_sensor._total_points == 60
        assert highscore_sensor._total_rounds == 4
        
    def test_round_attributes_initialization(self, highscore_sensor):
        """Test that round attributes are properly initialized."""
        # Test that round attribute is created when it doesn't exist
        result = highscore_sensor.update_highscore(team_score=50, round_number=3)
        
        assert "round_3" in highscore_sensor._round_highscores
        assert highscore_sensor._round_highscores["round_3"] == 50