"""Data models for Soundbeats game state management."""
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime
import uuid


@dataclass
class Team:
    """Represents a game team."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    score: int = 0
    current_guess: Optional[int] = None
    has_bet: bool = False

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "score": self.score,
            "current_guess": self.current_guess,
            "has_bet": self.has_bet
        }


@dataclass
class GameRound:
    """Represents a single game round."""
    round_number: int
    song_id: int = 0  # Placeholder for Phase 4
    team_guesses: Dict[str, int] = field(default_factory=dict)
    team_bets: Dict[str, bool] = field(default_factory=dict)
    team_scores: Dict[str, int] = field(default_factory=dict)
    actual_year: int = 0  # Placeholder for Phase 4
    timestamp: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "round_number": self.round_number,
            "song_id": self.song_id,
            "team_guesses": self.team_guesses,
            "team_bets": self.team_bets,
            "team_scores": self.team_scores,
            "actual_year": self.actual_year,
            "timestamp": self.timestamp.isoformat()
        }


@dataclass
class GameState:
    """Represents complete game state."""
    game_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    teams: List[Team] = field(default_factory=list)
    current_round: int = 0
    rounds_played: List[GameRound] = field(default_factory=list)
    playlist_id: str = "default"  # Placeholder for Phase 4
    played_song_ids: List[int] = field(default_factory=list)
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization."""
        return {
            "game_id": self.game_id,
            "teams": [team.to_dict() for team in self.teams],
            "current_round": self.current_round,
            "rounds_played": [round.to_dict() for round in self.rounds_played],
            "playlist_id": self.playlist_id,
            "played_song_ids": self.played_song_ids,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: dict) -> "GameState":
        """Create GameState from dictionary."""
        state = cls(
            game_id=data.get("game_id", str(uuid.uuid4())),
            current_round=data.get("current_round", 0),
            playlist_id=data.get("playlist_id", "default"),
            played_song_ids=data.get("played_song_ids", []),
            is_active=data.get("is_active", True),
        )
        
        # Reconstruct teams
        for team_data in data.get("teams", []):
            team = Team(
                id=team_data["id"],
                name=team_data["name"],
                score=team_data["score"],
                current_guess=team_data.get("current_guess"),
                has_bet=team_data.get("has_bet", False)
            )
            state.teams.append(team)
        
        # Reconstruct rounds
        for round_data in data.get("rounds_played", []):
            game_round = GameRound(
                round_number=round_data["round_number"],
                song_id=round_data.get("song_id", 0),
                team_guesses=round_data.get("team_guesses", {}),
                team_bets=round_data.get("team_bets", {}),
                team_scores=round_data.get("team_scores", {}),
                actual_year=round_data.get("actual_year", 0)
            )
            state.rounds_played.append(game_round)
        
        # Parse created_at if it exists
        if "created_at" in data:
            try:
                state.created_at = datetime.fromisoformat(data["created_at"])
            except (ValueError, TypeError):
                pass
        
        return state