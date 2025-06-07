"""Security and utility helpers for Soundbeats integration."""
from __future__ import annotations

import html
import re
from typing import Any


def sanitize_html_input(value: Any) -> str:
    """Sanitize user input for safe HTML rendering."""
    if value is None:
        return ""
    
    # Convert to string and escape HTML entities
    safe_value = html.escape(str(value))
    
    # Remove any potentially dangerous characters
    safe_value = re.sub(r'[<>"\']', '', safe_value)
    
    return safe_value


def validate_entity_id(entity_id: str) -> bool:
    """Validate that an entity ID follows Home Assistant conventions."""
    if not entity_id or not isinstance(entity_id, str):
        return False
    
    # HA entity IDs must follow pattern: domain.name
    pattern = r'^[a-z][a-z0-9_]*\.[a-z0-9_]+$'
    return bool(re.match(pattern, entity_id))


def validate_team_id_format(team_id: str) -> bool:
    """Validate team ID format."""
    if not team_id or not isinstance(team_id, str):
        return False
    
    pattern = r'^team_[1-5]$'
    return bool(re.match(pattern, team_id))


def sanitize_file_path(file_path: str, allowed_extensions: list[str] = None) -> str | None:
    """Sanitize file path to prevent directory traversal attacks."""
    if not file_path or not isinstance(file_path, str):
        return None
    
    # Remove any path traversal attempts
    safe_path = file_path.replace('..', '').replace('/', '').replace('\\', '')
    
    # Check allowed extensions if provided
    if allowed_extensions:
        extension = safe_path.split('.')[-1].lower() if '.' in safe_path else ''
        if extension not in allowed_extensions:
            return None
    
    return safe_path


def validate_year_range(year: Any, min_year: int = 1950, max_year: int = 2030) -> bool:
    """Validate that a year is within reasonable bounds."""
    try:
        year = int(year)
        return min_year <= year <= max_year
    except (ValueError, TypeError):
        return False


def validate_timer_length(timer_length: Any, min_seconds: int = 5, max_seconds: int = 300) -> bool:
    """Validate countdown timer length."""
    try:
        timer_length = int(timer_length)
        return min_seconds <= timer_length <= max_seconds
    except (ValueError, TypeError):
        return False


def sanitize_team_name(name: Any, max_length: int = 50) -> str:
    """Sanitize team name input."""
    if not name:
        return ""
    
    # Convert to string and limit length
    name = str(name)[:max_length]
    
    # Remove potentially dangerous characters but allow normal punctuation
    name = re.sub(r'[<>"\'\\\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', name)
    
    return name.strip()


def validate_points(points: Any, min_points: int = 0, max_points: int = 99999) -> bool:
    """Validate team points value."""
    try:
        points = int(points)
        return min_points <= points <= max_points
    except (ValueError, TypeError):
        return False