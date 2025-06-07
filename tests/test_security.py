"""Test security utilities."""
import pytest

from custom_components.soundbeats.security import (
    sanitize_html_input,
    validate_entity_id,
    validate_team_id_format,
    sanitize_file_path,
    validate_year_range,
    validate_timer_length,
    sanitize_team_name,
    validate_points,
)


class TestSecurityUtils:
    """Test security utility functions."""

    def test_sanitize_html_input_basic(self):
        """Test basic HTML sanitization."""
        assert sanitize_html_input("normal text") == "normal text"
        assert sanitize_html_input("<script>alert('xss')</script>") == "scriptalert(xss)/script"
        assert sanitize_html_input("Team & Co.") == "Team &amp; Co."

    def test_sanitize_html_input_special_cases(self):
        """Test edge cases for HTML sanitization."""
        assert sanitize_html_input(None) == ""
        assert sanitize_html_input(123) == "123"
        assert sanitize_html_input("") == ""

    def test_validate_entity_id_valid(self):
        """Test valid entity ID validation."""
        assert validate_entity_id("media_player.living_room")
        assert validate_entity_id("sensor.temperature")
        assert validate_entity_id("light.bedroom_lamp")

    def test_validate_entity_id_invalid(self):
        """Test invalid entity ID validation."""
        assert not validate_entity_id("invalid")
        assert not validate_entity_id("UPPERCASE.entity")
        assert not validate_entity_id("entity.with.too.many.dots")
        assert not validate_entity_id("")
        assert not validate_entity_id(None)

    def test_validate_team_id_format_valid(self):
        """Test valid team ID format."""
        assert validate_team_id_format("team_1")
        assert validate_team_id_format("team_5")

    def test_validate_team_id_format_invalid(self):
        """Test invalid team ID format."""
        assert not validate_team_id_format("team_0")
        assert not validate_team_id_format("team_6")
        assert not validate_team_id_format("invalid")
        assert not validate_team_id_format("")
        assert not validate_team_id_format(None)

    def test_sanitize_file_path_basic(self):
        """Test basic file path sanitization."""
        assert sanitize_file_path("songs.json") == "songs.json"
        assert sanitize_file_path("../../../etc/passwd") == "etcpasswd"

    def test_sanitize_file_path_with_extensions(self):
        """Test file path sanitization with allowed extensions."""
        assert sanitize_file_path("songs.json", ["json"]) == "songs.json"
        assert sanitize_file_path("config.txt", ["json"]) is None

    def test_validate_year_range_valid(self):
        """Test valid year range validation."""
        assert validate_year_range(1980)
        assert validate_year_range("1995")
        assert validate_year_range(2020)

    def test_validate_year_range_invalid(self):
        """Test invalid year range validation."""
        assert not validate_year_range(1900)
        assert not validate_year_range(2050)
        assert not validate_year_range("invalid")
        assert not validate_year_range(None)

    def test_validate_timer_length_valid(self):
        """Test valid timer length validation."""
        assert validate_timer_length(30)
        assert validate_timer_length("60")
        assert validate_timer_length(300)

    def test_validate_timer_length_invalid(self):
        """Test invalid timer length validation."""
        assert not validate_timer_length(1)
        assert not validate_timer_length(500)
        assert not validate_timer_length("invalid")
        assert not validate_timer_length(None)

    def test_sanitize_team_name_basic(self):
        """Test basic team name sanitization."""
        assert sanitize_team_name("Team Alpha") == "Team Alpha"
        assert sanitize_team_name("<script>Team</script>") == "Team"
        assert sanitize_team_name("Team & Co.") == "Team & Co."

    def test_sanitize_team_name_length_limit(self):
        """Test team name length limiting."""
        long_name = "A" * 100
        sanitized = sanitize_team_name(long_name, max_length=10)
        assert len(sanitized) == 10
        assert sanitized == "A" * 10

    def test_validate_points_valid(self):
        """Test valid points validation."""
        assert validate_points(0)
        assert validate_points("100")
        assert validate_points(99999)

    def test_validate_points_invalid(self):
        """Test invalid points validation."""
        assert not validate_points(-1)
        assert not validate_points(100000)
        assert not validate_points("invalid")
        assert not validate_points(None)