# Soundbeats Music Addition Strategy

## Overview

This document outlines a comprehensive strategy for implementing music functionality in the Soundbeats party game integration. The goal is to source and play top party songs from 1950 onwards with year metadata, supporting playback on various smart speakers including Sonos, Echo/Apple Home, and Google Home devices.

## 1. Music Sourcing Strategy

### 1.1 Data Sources for Song Catalog

#### Option 1: MusicBrainz + Last.fm API (Recommended)
- **MusicBrainz**: Open-source music encyclopedia providing song metadata including release years
- **Last.fm API**: Provides popularity data and "top tracks" information
- **Pros**: Free, comprehensive metadata, no licensing issues for metadata
- **Cons**: Requires combining multiple sources, no direct audio streaming

#### Option 2: Spotify Web API
- **Features**: Extensive catalog, popularity metrics, audio features
- **Metadata**: Release dates, popularity scores, audio characteristics
- **Pros**: Comprehensive data, well-documented API, audio previews available
- **Cons**: Requires Spotify Premium for full playback, API rate limits

#### Option 3: YouTube Music API
- **Features**: Vast catalog including older tracks, popularity data
- **Pros**: Wide availability, good coverage of historical tracks
- **Cons**: Complex licensing, variable audio quality

### 1.2 Curated Party Songs Dataset

Create a curated database focusing on:
- **Decades**: 1950s through 2020s
- **Genres**: Rock, Pop, Disco, Hip-Hop, Electronic Dance, Classic Rock
- **Criteria**: 
  - Chart performance (Billboard Hot 100, regional charts)
  - Danceability metrics
  - Cultural significance
  - Wedding/party playlist frequency

#### Initial Seed Data Structure
```json
{
  "songs": [
    {
      "id": "song_001",
      "title": "Don't Stop Me Now",
      "artist": "Queen",
      "year": 1978,
      "genre": "Rock",
      "danceability": 0.9,
      "energy": 0.95,
      "popularity_score": 95,
      "chart_peak": 9,
      "spotify_id": "7hQHc2rB7SAKthm7J8ZzkNr",
      "youtube_id": "HgzGwKwLmgM",
      "duration_ms": 209000,
      "explicit": false
    }
  ]
}
```

## 2. Smart Speaker Integration Strategy

### 2.1 Home Assistant Media Player Integration

Leverage existing Home Assistant media player ecosystem:

#### Supported Platforms:
- **Sonos**: Native Home Assistant integration via UPnP/Sonos API
- **Echo/Alexa**: Home Assistant Alexa integration
- **Google Home**: Cast integration via Google Cast protocol
- **Apple HomePod**: HomeKit integration (limited)
- **Generic UPnP/DLNA**: Universal compatibility

### 2.2 Audio Source Implementation

#### Option A: Streaming Service Integration (Recommended)
```python
STREAMING_SERVICES = {
    "spotify": {
        "requires_premium": True,
        "api_endpoint": "https://api.spotify.com/v1/",
        "supports_remote_control": True
    },
    "youtube_music": {
        "requires_premium": False,
        "api_endpoint": "https://music.youtube.com/youtubei/v1/",
        "supports_remote_control": True
    },
    "apple_music": {
        "requires_subscription": True,
        "supports_airplay": True
    }
}
```

#### Option B: Local Media Library
- Support for user-uploaded music files
- Automatic metadata extraction
- Local network streaming via DLNA/UPnP

#### Option C: Audio Preview Playback
- Use 30-second preview clips from APIs
- Lower bandwidth, no subscription required
- Suitable for guessing games

## 3. Technical Implementation Plan

### 3.1 Enhanced Data Model

#### Extended Sensor Attributes
```python
def _initialize_game_settings(self) -> dict[str, Any]:
    return {
        "countdown_timer_length": 30,
        "audio_player": None,
        "music_service": "spotify",  # NEW
        "current_song": None,  # NEW
        "current_playlist": "party_hits_all_decades",  # NEW
        "shuffle_mode": True,  # NEW
        "year_range": {"start": 1950, "end": 2024},  # NEW
        "genre_filter": [],  # NEW
        "difficulty_level": "medium"  # NEW: affects song obscurity
    }
```

#### Song Queue Management
```python
class SongQueue:
    def __init__(self):
        self.current_playlist = []
        self.played_songs = []
        self.queue_index = 0
        
    def generate_playlist(self, year_range, genres, difficulty):
        """Generate playlist based on game settings"""
        pass
        
    def get_next_song(self):
        """Get next song in queue"""
        pass
        
    def shuffle_remaining(self):
        """Shuffle remaining songs in queue"""
        pass
```

### 3.2 New Services Implementation

#### Enhanced Services
```yaml
# services.yaml additions
load_music_catalog:
  name: Load Music Catalog
  description: Load curated music catalog for specified decades
  fields:
    year_range:
      name: Year Range
      description: Start and end years for music selection
      required: true
      selector:
        object:
    genres:
      name: Genres
      description: Music genres to include
      selector:
        select:
          options:
            - "rock"
            - "pop" 
            - "disco"
            - "hip-hop"
            - "electronic"
          multiple: true

play_song:
  name: Play Song
  description: Play a specific song on the selected audio player
  fields:
    song_id:
      name: Song ID
      description: Unique identifier for the song
      required: true
      selector:
        text:
    reveal_answer:
      name: Reveal Answer
      description: Whether to announce song details
      selector:
        boolean:

configure_music_service:
  name: Configure Music Service
  description: Set up streaming service integration
  fields:
    service:
      name: Service
      description: Music streaming service to use
      required: true
      selector:
        select:
          options:
            - "spotify"
            - "youtube_music"
            - "local_files"
            - "preview_mode"
```

### 3.3 Music Integration Component

#### New Python Module: `music_manager.py`
```python
"""Music management for Soundbeats integration."""
import asyncio
import logging
from typing import Dict, List, Optional

class MusicManager:
    def __init__(self, hass, config):
        self.hass = hass
        self.config = config
        self.catalog = MusicCatalog()
        self.current_service = None
        
    async def initialize_service(self, service_name: str):
        """Initialize selected music service"""
        pass
        
    async def search_songs(self, year_range: tuple, genres: List[str]) -> List[Dict]:
        """Search for songs matching criteria"""
        pass
        
    async def play_song(self, song_id: str, media_player: str):
        """Play song on specified media player"""
        pass
        
    async def get_song_metadata(self, song_id: str) -> Dict:
        """Get detailed song information"""
        pass

class MusicCatalog:
    """Manages the curated song database"""
    
    def __init__(self):
        self.songs_db = []
        self.load_catalog()
        
    def load_catalog(self):
        """Load song catalog from JSON file"""
        pass
        
    def filter_by_year(self, start_year: int, end_year: int):
        """Filter songs by year range"""
        pass
        
    def filter_by_genre(self, genres: List[str]):
        """Filter songs by genre"""
        pass
        
    def get_random_song(self, filters: Dict) -> Dict:
        """Get random song matching filters"""
        pass
```

### 3.4 Frontend Enhancements

#### Updated Lovelace Card Features
- Music service configuration
- Year range selector
- Genre filter checkboxes
- Current song display with album art
- Play/pause/skip controls
- Song reveal functionality

## 4. Game Modes and Music Integration

### 4.1 Enhanced Game Modes

#### Classic Mode with Music
- Play 30-second song clips
- Teams guess artist and/or song title
- Points awarded for correct guesses
- Bonus points for guessing the year

#### Decade Challenge
- Focus on specific decades
- Progressive difficulty (start with hits, move to deeper cuts)
- Era-specific bonus questions

#### Name That Tune
- Play first few seconds
- Gradually extend playback time
- Points decrease with more hints

#### Lyric Challenge
- Display song lyrics with missing words
- Play instrumental or censored versions
- Team collaboration rounds

### 4.2 Scoring System Enhancement

```python
SCORING_SYSTEM = {
    "correct_artist": 10,
    "correct_song": 15,
    "correct_year_exact": 20,
    "correct_year_within_2": 10,
    "correct_year_within_5": 5,
    "speed_bonus": {"0-5s": 10, "5-10s": 5, "10-15s": 2},
    "streak_multiplier": {"3": 1.2, "5": 1.5, "10": 2.0}
}
```

## 5. Legal and Licensing Considerations

### 5.1 Copyright Compliance

#### Music Usage Rights
- **Preview Clips**: 30-second previews generally fall under fair use
- **Full Songs**: Require proper licensing or subscription service
- **Metadata**: Song titles, artists, years are factual information (not copyrightable)

#### Recommended Approach
1. Use streaming service APIs (Spotify, YouTube Music) with user's existing subscriptions
2. Implement preview-only mode for unlicensed usage
3. Clear attribution of music sources
4. User responsibility for proper licensing

### 5.2 Terms of Service Compliance

#### Spotify API Guidelines
- No bulk downloading
- Respect rate limits (100 requests per minute)
- Require user authentication
- No caching of audio content

#### YouTube Music Guidelines
- Use official API endpoints
- Respect content policies
- No unauthorized downloads

## 6. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [x] Create music strategy document
- [ ] Set up basic music catalog structure
- [ ] Implement MusicManager class skeleton
- [ ] Add music service configuration options
- [ ] Update sensor attributes for music data

### Phase 2: Catalog and API Integration (Weeks 3-4)
- [ ] Build curated song database (500+ songs covering 1950-2024)
- [ ] Implement Spotify API integration
- [ ] Add YouTube Music API support
- [ ] Create song filtering and search functionality
- [ ] Implement playlist generation logic

### Phase 3: Playback Integration (Weeks 5-6)
- [ ] Enhance media player integration
- [ ] Implement song playback controls
- [ ] Add current song display to UI
- [ ] Create audio preview mode
- [ ] Test with various smart speakers

### Phase 4: Game Enhancement (Weeks 7-8)
- [ ] Update game modes with music integration
- [ ] Implement enhanced scoring system
- [ ] Add song reveal functionality
- [ ] Create decade-specific challenges
- [ ] Add lyrics and bonus round features

### Phase 5: Polish and Testing (Weeks 9-10)
- [ ] Comprehensive testing across devices
- [ ] Performance optimization
- [ ] Error handling and fallbacks
- [ ] Documentation updates
- [ ] User configuration guides

## 7. Configuration Examples

### Example Home Assistant Configuration

```yaml
# configuration.yaml
soundbeats:
  music:
    default_service: "spotify"
    catalog_file: "custom_components/soundbeats/data/party_songs.json"
    preview_duration: 30
    auto_advance: true
    year_range:
      start: 1950
      end: 2024
    genres:
      - "rock"
      - "pop"
      - "disco"
      - "hip-hop"
      - "electronic"
```

### Service Integration Setup

```yaml
# Music service authentication
spotify:
  client_id: !secret spotify_client_id
  client_secret: !secret spotify_client_secret

# Default media players for Soundbeats
soundbeats:
  default_players:
    - media_player.living_room_sonos
    - media_player.kitchen_google_home
    - media_player.bedroom_echo
```

## 8. Success Metrics

### Technical Metrics
- Song catalog coverage: 1000+ songs spanning 1950-2024
- API response time: <2 seconds for song queries
- Playback success rate: >95% across supported devices
- User setup time: <5 minutes for basic configuration

### User Experience Metrics
- Game engagement: Increased session duration
- Music variety: Balanced decade representation
- Accessibility: Support for multiple streaming services
- Party atmosphere: Enhanced entertainment value

## 9. Future Enhancements

### Advanced Features
- **AI-Generated Playlists**: Use machine learning to create optimal party mixes
- **Social Features**: Song request system, community playlists
- **Custom Categories**: Holiday songs, movie soundtracks, regional hits
- **Karaoke Mode**: Lyrics display and vocal removal
- **Tournament Mode**: Multi-round competitions with brackets

### Integration Expansions
- **Voice Assistants**: "Hey Google, play Soundbeats party game"
- **Mobile App**: Companion app for song submissions and voting
- **Multi-Room Audio**: Synchronized playback across multiple speakers
- **Smart Lighting**: Sync lights with music tempo and era

## Conclusion

This comprehensive strategy provides a roadmap for transforming Soundbeats into a fully-featured musical party game. By leveraging existing Home Assistant integrations and modern music APIs, we can create an engaging experience that brings decades of party music to life while maintaining legal compliance and broad device compatibility.

The phased implementation approach ensures steady progress with testable milestones, while the modular design allows for future enhancements and customization based on user feedback and emerging technologies.