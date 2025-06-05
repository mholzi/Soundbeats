# Soundbeats
Fun Home Assistant Music Guessing Party Game

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A custom Home Assistant integration that brings an interactive music guessing game to your smart home. Teams compete to guess the release year of songs, with points awarded based on accuracy. Perfect for parties, family gatherings, and music lovers!

**Version:** 1.0.0  
**Minimum Home Assistant Version:** 2023.1.0  
**Integration Type:** Service-based with Custom Lovelace Card

## Installation

### HACS (Home Assistant Community Store)

This is the recommended installation method.

1. Install [HACS](https://hacs.xyz/) if you haven't already
2. Go to HACS → Integrations
3. Click the three dots in the top right corner and select "Custom repositories"
4. Add `https://github.com/mholzi/Soundbeats` as repository with category "Integration"
5. Click "Add" and then "Install"
6. Restart Home Assistant

### Manual Installation

1. Download the `custom_components/soundbeats` folder from this repository
2. Copy it to your Home Assistant `custom_components` directory
3. Restart Home Assistant

## How the Game Works

Soundbeats is a competitive music guessing game where teams compete to identify the release year of songs. Here's how it works:

1. **Teams Setup**: Up to 5 teams can participate, each with customizable names
2. **Song Playback**: Songs are played through your selected Home Assistant media player
3. **Guessing Phase**: Teams have a configurable countdown timer (default 30 seconds) to guess the year
4. **Scoring System**: 
   - **20 points** for exact year matches
   - **10 points** for guesses within ±2 years
   - **5 points** for guesses within ±5 years
   - **0 points** for guesses more than 5 years off
5. **Auto-Evaluation**: Points are automatically calculated and awarded when the timer expires

## Configuration

No manual configuration is required! The integration will be automatically available in your Home Assistant interface after installation.

1. Go to Settings → Devices & Services
2. Click "Add Integration"
3. Search for "Soundbeats"
4. Click to add the integration
5. Follow the setup wizard

The integration is now ready to use!

**Music Data Management:** Soundbeats automatically handles all song metadata including release years and playback URLs. You do not need to configure these properties in your media player entities - the integration manages this data internally through its custom sensor while utilizing your selected media player for audio playback and retrieving song titles, artists, and artwork. Media player selection is handled automatically through the integration's interface with no separate configuration required.

## Usage

Once installed and configured, the integration creates multiple sensor entities to track game state and provides a rich web interface for gameplay.

### Core Entities

The integration automatically creates the following entities:

- `sensor.soundbeats_game_status` - Main game status (ready/playing/stopped)
- `sensor.soundbeats_team_1` through `sensor.soundbeats_team_5` - Individual team information
- `sensor.soundbeats_countdown_timer` - Configurable timer duration  
- `sensor.soundbeats_countdown_current` - Live countdown value

- `sensor.soundbeats_game_mode` - Current game mode (default: Classic)
- `sensor.soundbeats_current_song` - Currently playing song information and selected media player

**Note:** The `sensor.soundbeats_current_song` automatically manages all music-related functionality including song metadata (`year` and `url` properties) and the selected media player entity. This sensor serves as the single source of truth for both the currently selected media player and any playing song information. The integration automatically coordinates between this custom sensor (for year, URL, and media player selection) and your selected media player (for title, artist, and artwork) to provide complete song information with zero manual configuration required.

### Lovelace Card

The integration automatically provides a comprehensive custom Lovelace card with no additional setup required. The card features role-based sections:

#### User Sections (Visible to All)
- **Title Section**: Game branding and status
- **Team Status**: Real-time team standings, points, and participation status
- **Current Song**: Song information with artwork when playing (shown only during reveal phase)
- **Debug Information**: Troubleshooting data for audio setup

#### Admin Sections (Admin Users Only)
- **Admin Controls**: Start/stop game, next song controls
- **Game Settings**: Configure countdown timer duration
- **Audio Player Selection**: Choose from available Home Assistant media players (unavailable players are automatically filtered out)
- **Team Management**: Edit team names and set participation status (team names update instantly as you type)

To use the card, add it to your Lovelace dashboard by selecting **"Custom: Soundbeats Card"** when adding a new card.

### Game Features

- **Smart Team Management**: Up to 5 teams with persistent names and scores
- **Flexible Audio Integration**: Works with any Home Assistant media player
- **Configurable Timing**: Adjustable countdown timer (5-300 seconds)
- **Auto-Scoring**: Automatic point calculation based on guess accuracy
- **State Persistence**: Team information and settings persist across restarts
- **Real-time Updates**: Live score updates and countdown display
- **Spotify Integration**: Supports Spotify URLs and other media formats
- **Debug Tools**: Built-in troubleshooting information for media playback

### Services

The integration provides comprehensive Home Assistant services for automation and external control:

#### Game Control Services
- `soundbeats.start_game` - Start a new game session (resets teams and stops countdown)
- `soundbeats.stop_game` - Stop the current game session  
- `soundbeats.reset_game` - Reset the game to initial state
- `soundbeats.next_song` - Skip to the next song and start countdown timer

#### Team Management Services
- `soundbeats.update_team_name` - Update a team's name
  - **Parameters**: `team_id` (team_1 to team_5), `name` (string)
- `soundbeats.update_team_points` - Update a team's points
  - **Parameters**: `team_id` (team_1 to team_5), `points` (0-99999)
- `soundbeats.update_team_participating` - Set team participation status
  - **Parameters**: `team_id` (team_1 to team_5), `participating` (boolean)

#### Game Configuration Services  
- `soundbeats.update_countdown_timer_length` - Update countdown timer duration
  - **Parameters**: `timer_length` (5-300 seconds, increments of 5)
- `soundbeats.update_audio_player` - Update selected media player (managed automatically via Current Song sensor)
  - **Parameters**: `audio_player` (media_player entity ID)

### Automation Examples

```yaml
# Start a game when a specific button is pressed
automation:
  - alias: "Start Soundbeats Game"
    trigger:
      - platform: state
        entity_id: input_button.party_start
        to: 'on'
    action:
      - service: soundbeats.start_game
      - service: tts.google_cloud_say
        data:
          message: "Let the music guessing begin!"

# Award bonus points for perfect guesses
automation:
  - alias: "Soundbeats Perfect Guess Bonus"
    trigger:
      - platform: state
        entity_id: sensor.soundbeats_team_1
        attribute: points
    condition:
      - condition: template
        value_template: "{{ trigger.to_state.attributes.points - trigger.from_state.attributes.points == 20 }}"
    action:
      - service: light.turn_on
        target:
          entity_id: light.party_lights
        data:
          effect: "colorloop"
```

## Troubleshooting

### Card Not Appearing
- Ensure the integration is properly installed and Home Assistant has been restarted
- Clear your browser cache and refresh the page  
- Check that you're selecting **"Custom: Soundbeats Card"** when adding a new card
- Verify the integration appears in Settings → Devices & Services

### Audio/Music Playback Issues

#### Next Song Function Not Playing Music
If the next song function triggers the timer but doesn't start playing music, check the **Debug Information** section at the bottom of the Soundbeats card:

- **Selected Audio Player**: The media player entity currently selected for playback
- **Current Song URL**: The URL from songs.json that was selected  
- **Media Content Type**: Whether the system detected it as a Spotify URL or regular music
- **Media Player Assignment**: Which media player entity is assigned to play the song

#### Common Audio Issues
- **Spotify URLs**: If you see Spotify URLs in the debug section, ensure your selected media player supports Spotify playback (e.g., a configured Spotify integration)
- **No Audio Player Selected**: Make sure you select an audio player in the admin settings section
- **Media Player Compatibility**: Not all media players support all URL types - try different media players if one doesn't work
- **Network Connectivity**: Ensure your media player has internet access for streaming

#### Supported Media Players
The integration works with any Home Assistant media player, including:
- Spotify integration (`media_player.spotify_*`)
- Sonos speakers (`media_player.sonos_*`)
- Google Cast devices (`media_player.chromecast_*`)
- VLC media player (`media_player.vlc_*`)
- MPD/Mopidy players

### Game State Issues

#### Sensor Not Created
- Ensure the integration is properly installed and configured through Settings → Devices & Services
- Check Home Assistant logs (`Settings → System → Logs`) for any error messages
- Restart Home Assistant after installation
- Verify the integration loaded without errors in the logs

#### Teams Not Updating
- Check that team participation is enabled in the Team Management section
- Verify admin permissions if you can't see admin controls
- Try refreshing the browser page
- Check that the team sensor entities exist in Developer Tools → States

#### Countdown Timer Issues  
- Ensure the countdown timer length is set to a valid value (5-300 seconds)
- Check that the timer isn't being stopped by another automation
- Verify the countdown current sensor is updating properly
- Look for JavaScript errors in browser developer console

### Performance Issues

#### Slow Updates
- Reduce the number of teams participating if not needed
- Check Home Assistant system resources
- Ensure your device has sufficient processing power for the frontend

#### Memory Usage
- The integration stores team data persistently but uses minimal memory
- Clear browser cache if the frontend becomes sluggish
- Restart Home Assistant if sensors seem stuck

## Development

### Architecture Overview

Soundbeats is built as a modern Home Assistant custom integration with:

- **Backend**: Python-based integration with multiple sensor entities
- **Frontend**: Custom Lovelace card with responsive design
- **Data Storage**: Home Assistant's restore entity system for persistence
- **Media Integration**: Compatible with all Home Assistant media players

### Music Database

The integration includes a JSON-based song database (`songs.json`) with:
- Spotify URLs for song playback
- Release year information for scoring
- Expandable structure for additional metadata

### Technical Implementation

**Core Components:**
- **Sensor Platform**: 8+ sensor entities tracking game state
- **Service Platform**: 7 services for game control and configuration  
- **Frontend Resources**: Self-registering Lovelace card
- **Config Flow**: User-friendly integration setup

**Key Features:**
- Automatic point calculation based on year guess accuracy
- Real-time countdown timer with visual feedback
- Persistent team data across Home Assistant restarts
- Role-based UI visibility (admin vs. regular users)
- Debug information for troubleshooting media playback

### Music Addition Strategy

For detailed information about implementing music functionality, including song sourcing, smart speaker integration, and game enhancement strategies, see the [Music Addition Strategy Document](MUSIC_STRATEGY.md).

This comprehensive guide covers:
- Music sourcing options and APIs for top party songs since 1950
- Integration approaches for Sonos, Echo/Apple Home, Google Home
- Technical implementation roadmap
- Legal considerations and licensing requirements
- Step-by-step development phases

### Future Enhancements

See [enhancements.md](enhancements.md) for detailed improvement suggestions including:
- UI enhancements (team color coding, animations, enhanced song display)  
- Functionality improvements (difficulty adjustment, category filtering, statistics)
- Implementation guides for each enhancement

### Contributing

The integration follows Home Assistant development best practices:
- Use config flows for setup (no YAML required)
- Implement RestoreEntity for state persistence
- Follow Home Assistant entity naming conventions
- Include comprehensive error handling and logging

## Support

If you encounter any issues, please [open an issue](https://github.com/mholzi/Soundbeats/issues) on GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
