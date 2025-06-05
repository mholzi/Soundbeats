# Soundbeats
Fun Home Assistant Music Guessing Party Game

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A custom Home Assistant integration that brings an interactive music guessing game to your smart home. Teams compete to guess the release year of songs, with points awarded based on accuracy. Features a stunning, animated user interface with modern music-themed design that works out-of-the-box. Perfect for parties, family gatherings, and music lovers!

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
3. **Round Tracking**: The system automatically tracks round numbers, starting from 0 and incrementing after each song evaluation
4. **Guessing Phase**: Teams have a configurable countdown timer (default 30 seconds) to guess the year
5. **Scoring System**: 
   - **20 points** for exact year matches
   - **10 points** for guesses within ±2 years
   - **5 points** for guesses within ±5 years
   - **0 points** for guesses more than 5 years off
6. **Auto-Evaluation**: Points are automatically calculated and awarded when the timer expires
7. **Team Rankings**: Teams are dynamically ranked based on their total points among active participants
   - **Round-Based Color Logic**: Team header colors change based on the current round:
     - **Round 0**: All teams display neutral gray gradient (no rankings shown initially)
     - **Round 1+**: Medal-based color assignment based on points
   - **Visual Ranking Indicators**: Each team displays a circular badge with their current position (1st, 2nd, 3rd, etc.)
   - **Medal-Based Color Assignment**: Team headers change color based on points with tie support:
     - **Gold gradient** for teams with the highest points (all tied teams get gold)
     - **Silver gradient** for teams with the next highest points (ties for 2nd place)
     - **Bronze gradient** for teams with the third highest points (no skipping medal levels)
     - **Neutral gray gradient** for all other positions
   - **Real-Time Updates**: Rankings and colors update immediately as points change during gameplay
   - **No Manual Setup**: All ranking logic is automatically handled by the integration


## Highscore System

Soundbeats features a comprehensive highscore tracking system that automatically monitors and celebrates team achievements with **zero configuration required**.

### Automatic Highscore Tracking

The integration continuously tracks two types of records:

- **All-Time Absolute Highscore**: The highest total score ever achieved by any team across all games and rounds
- **Per-Round Highscores**: The highest score achieved during each specific round number (Round 1, Round 2, etc.)

### Visual Highscore Display

#### Dedicated Highscore Section
The Lovelace card includes a dedicated **"Highscores"** section that displays:

- **🏆 All-Time Record**: Shows the absolute highest score with crown icon and golden styling
- **📋 Round Records**: Lists the highest score achieved for each round number played
- **Elegant Design**: Features golden gradient backgrounds and trophy-themed styling
- **Real-Time Updates**: Displays update immediately when new records are set

#### New Record Banner Notifications

When teams break highscore records, **celebratory banner notifications** automatically appear:

- **Prominent Display**: Golden animated banners slide in from the right side of the screen
- **Record-Specific Messages**: 
  - "New all-time record: X points! 🏆" for absolute highscore
  - "New Round X record: Y points! 🎯" for round-specific records
- **Eye-Catching Animation**: Features glowing effects, crown animations, and pulsing borders
- **Auto-Dismiss**: Banners automatically disappear after 8 seconds or can be manually closed
- **Smart Detection**: Only triggers for genuine new records, not initial setup

### Highscore Persistence

- **Permanent Storage**: All highscore data persists across Home Assistant restarts and integration updates
- **RestoreEntity Integration**: Built on Home Assistant's reliable state restoration system
- **Zero Data Loss**: Records are safely maintained even during system maintenance

### Integration Features

- **Automatic Detection**: The system automatically compares current team scores against existing records after each round
- **Immediate Recognition**: New records are detected and celebrated within seconds of being achieved
- **Multi-Record Support**: Teams can break both absolute and round records in the same round
- **No False Positives**: Smart initialization prevents triggering notifications on first load

### Technical Details

The highscore system integrates seamlessly with the existing game flow:

1. **Round Evaluation**: After each countdown timer expires and points are awarded
2. **Record Checking**: The system compares new team scores against existing records
3. **Record Updates**: New records are immediately stored in the highscore sensor
4. **UI Notification**: Banner notifications trigger for any broken records
5. **Display Updates**: The highscore section refreshes to show new records

**Zero Setup Required**: The entire highscore system works automatically upon installation with no configuration, manual setup, or additional steps needed.

### Troubleshooting Highscore Display

#### Diagnostic Feature

When the highscore section displays "Highscore data not available", a **diagnostic information panel** becomes available to help troubleshoot the issue:

- **📋 Expandable Panel**: Click on "Diagnostic Information" to expand the troubleshooting details
- **🔍 Entity Status**: Shows whether the `sensor.soundbeats_highscore` entity exists in Home Assistant
- **📝 Available Entities**: Lists all Soundbeats-related entities if the highscore sensor is missing
- **💡 Troubleshooting Steps**: Provides specific guidance for resolving common issues

**Common Solutions:**
1. **Integration Status**: Verify the Soundbeats integration is properly installed and running
2. **Entity Creation**: Check that the integration has successfully created the highscore sensor
3. **Home Assistant Restart**: Restart Home Assistant if the sensor was recently added
4. **Developer Tools**: Use Home Assistant's Developer Tools → States to verify entity presence

**Usage:** The diagnostic panel only appears when needed and is designed to be unobtrusive, helping users quickly identify and resolve highscore display issues without affecting normal operation.


## Configuration

No manual configuration is required! The integration will be automatically available in your Home Assistant interface after installation.

**Zero-Setup Design**: All features including team rankings, visual styling, and interface behaviors work out-of-the-box with intelligent defaults. The UI automatically adapts to game state changes, hiding unnecessary sections when not relevant and optimizing readability without any user configuration needed.

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
- `sensor.soundbeats_round_counter` - Current round number (increments after each round evaluation)
- `sensor.soundbeats_game_mode` - Current game mode (default: Classic)
- `sensor.soundbeats_current_song` - Currently playing song information and selected media player
- `sensor.soundbeats_played_songs` - Tracks song IDs played since current game started
- `sensor.soundbeats_highscore` - Highscore tracking for absolute and per-round records

**Note:** The `sensor.soundbeats_current_song` automatically manages all music-related functionality including song metadata (`year` and `url` properties) and the selected media player entity. This sensor serves as the single source of truth for both the currently selected media player and any playing song information. The integration automatically coordinates between this custom sensor (for year, URL, and media player selection) and your selected media player (for title, artist, and artwork) to provide complete song information with zero manual configuration required.

### Lovelace Card

The integration automatically provides a comprehensive custom Lovelace card with no additional setup required. The card features role-based sections:

#### Admin Sections (Admin Users Only)
- **Game Settings**: Start new games and adjust countdown timer duration (expandable section, collapsed by default)
- 

- **Song Controls**: Admin-only controls appear on the song display during active rounds
  - **Next Song Button**: Located in the bottom-right corner for skipping to the next song
  - **Volume Control Buttons**: Located in the bottom-left corner for adjusting media player volume
    - **Volume Up**: Increase volume by 10% with a single click
    - **Volume Down**: Decrease volume by 10% with a single click
    - **Consistent Styling**: Matches the design of other admin controls with hover effects
  - **Smart Audio Player Validation**: If no audio player is selected when using song controls, an alert notification banner slides in from the right side
  - **User-Friendly Alerts**: The alert banner provides clear guidance and can be dismissed by clicking the close button
  - **Zero-Setup Integration**: All controls work automatically without any configuration required

#### Teams Overview Section
- **User-Specific Display**: Team cards and overview only show teams assigned to the current Home Assistant user via the team management section. Each user sees only their assigned teams for a personalized experience.
- **Round-Aware Visibility**: Team ranking section automatically appears only when the game has started (round counter > 0), keeping the interface clean before gameplay begins
- **Horizontal Scrollable Leaderboard**: User-assigned active teams displayed in a single horizontal row with compact cards that scroll when overflowing
- **Compact Card Design**: Much smaller team cards (80-120px wide) with points prominently displayed at the top and team names in small font at the bottom
- **Enhanced Visual Layout**: 
  - **Header Alignment**: Title section perfectly aligns with card edges for a cleaner look
  - **Badge Positioning**: Guessed year and bet indicators positioned in the top right corner of each team card
  - **Improved Contrast**: Enhanced background colors ensure text and icons are always clearly visible, with dark backgrounds for non-medal teams
- **Context-Aware Display**: 
  - **During countdown (timer running)**: Shows ranking badge, current points at top, team name at bottom, and compact "BET" indicators in top right corner
  - **When timer is 0 (round over)**: Displays ranking badge, current points at top, team name at bottom, and last round guess year in top right corner
- **Visual Hierarchy**: Clear gold/silver/bronze styling for top 3 teams with distinct ranking badges using Material Design Icons (MDI)
- **Smart Sorting**: Teams automatically sorted by points in descending order
- **Responsive Design**: Horizontal scrolling ensures all teams remain visible regardless of screen size
- **No Manual Setup**: All functionality is built into the integration with zero configuration required

#### Individual Team Cards
- **User-Specific Access**: Individual team cards are only displayed for teams assigned to the current Home Assistant user ID, ensuring personalized gameplay and preventing access to other users' teams.
- **Interactive Controls**: Year guess sliders, betting buttons, and detailed results when timer expires
  - **Reactive Bet Buttons**: Button state (active/inactive, text, and styling) automatically updates in real-time when backend state changes, with no page reload required
  - **Zero-Setup Synchronization**: Bet button state is always kept in sync with Home Assistant backend state without any special user setup or configuration
- **Personal Team Views**: Separate detailed interface for each team's gameplay experience
- **Enhanced Scoring Display**: Clear, detailed explanations of points earned after each round
  - **Automatic Scoring Explanations**: Shows points earned and reasoning for all guesses (e.g., "Points earned: 10. You were within 2 years of the correct answer.")
  - **Smart Visual Feedback**: Green background for point-earning guesses, neutral background for zero points
  - **Betting Results**: Special highlighting for betting outcomes with clear win/loss indicators
  - **Always Visible**: Scoring explanations appear immediately when timer expires with no additional setup required

**Note**: The admin sections feature expandable/collapsible interfaces with chevron icons. Click on the section headers to expand or collapse these sections. The expanded state persists throughout your session but resets when the page is reloaded. The card requires zero manual setup for users.

To use the card, add it to your Lovelace dashboard by selecting **"Custom: Soundbeats Card"** when adding a new card.

#### Enhanced Modern Header Design

The Soundbeats card features a visually stunning, **zero-setup** header that brings the party game to life with modern music-themed aesthetics:

- **Animated Musical Elements**: 
  - **Floating Musical Notes** (♪ ♫ ♬) that gently animate around the header
  - **Live Sound Wave Visualizer** at the bottom with rhythmic pulsing bars
  - **Dynamic Music Icon** with subtle bouncing and rotation effects
  - **Pulsing Border** that mimics musical beats and rhythm

- **Modern Visual Design**:
  - **Premium Color Palette**: Deep navy gradients transitioning to vibrant music-themed orange and pink accents
  - **Professional Typography**: Enhanced font weights, letter-spacing, and dramatic text shadows
  - **Depth and Dimension**: Multi-layered shadows, inset highlights, and radial gradient overlays
  - **Animated Glow Effects**: Subtle breathing animations that make the header feel alive

- **Responsive & Accessible**:
  - **Mobile-Optimized**: Automatically adapts font sizes, spacing, and layout for different screen sizes
  - **Home Assistant Integration**: Seamlessly matches HA's design language while standing out as a premium experience
  - **Performance Optimized**: All animations use CSS transforms for smooth 60fps performance
  - **No External Dependencies**: Everything built into the card - no additional files, fonts, or resources needed

**Zero-Setup Philosophy**: The enhanced header design works immediately upon installation with no configuration required. All animations, colors, and effects are automatically applied to create an engaging, party-ready interface that matches the excitement of the game itself.

### UI Improvements & Accessibility

The Soundbeats card has been enhanced with improved visibility and clarity across all interface areas, maintaining the zero-setup philosophy:

- **Enhanced Team Overview Visibility**:
  - **Improved Typography**: Team names increased from 0.7em to 0.8em with enhanced font weight (600) for better readability
  - **Larger Point Display**: Team points increased from 0.9em to 1.0em with enhanced contrast through text shadows
  - **Better Visual Hierarchy**: Rank badges increased from 1.2em to 1.3em with drop-shadow effects for improved visibility
  - **Enhanced Contrast**: All ranking colors now feature stronger shadows and better text contrast

- **Refined Team Cards**:
  - **Improved Spacing**: Increased padding from 8px to 10px with larger corner radius (10px) for a more premium feel
  - **Enhanced Visual Appeal**: Increased card width (85-130px) and added subtle box shadows for better depth
  - **Stronger Medal Colors**: Gold, silver, and bronze rankings now have enhanced shadows and improved font weights
  - **Better Badge Styling**: Betting badges feature improved padding, shadows, and contrast for maximum visibility

- **Streamlined Betting Interface**:
  - **Cleaner Button Design**: Removed diamond icons from betting buttons and overview badges for a cleaner, more focused appearance
  - **Better Focus on State**: Betting state clearly indicated through color changes and animations without visual clutter
  - **Consistent Styling**: All betting indicators maintain the same high-contrast orange theme for instant recognition

- **Zero Configuration Required**: All UI improvements are automatically applied with no setup needed - simply install and enjoy the enhanced experience


- **Premium Visual Experience**: Modern, animated header design with zero-setup required
  - **Musical Theme**: Floating notes, sound wave visualizers, and rhythmic animations
  - **Professional Aesthetics**: Deep gradients, dynamic shadows, and premium typography
  - **Responsive Design**: Automatically adapts to mobile, tablet, and desktop screens
  - **Performance Optimized**: Smooth 60fps animations with no external dependencies
- **Enhanced UI Design**: Refined interface with improved visual hierarchy and layout
  - **Perfect Alignment**: Header sections align seamlessly with card boundaries for a professional look
  - **Optimized Controls**: Compact, right-aligned controls for better space utilization
  - **Corner Badge System**: Key indicators (betting status, guess years) positioned in card corners for maximum visibility
- **Comprehensive Teams Overview**: Horizontal scrollable leaderboard showing all teams in compact cards (only visible during active gameplay)
  - **Smart Visibility**: Section automatically appears when the game starts (round 1+) and stays hidden before gameplay begins for a cleaner interface
  - **Real-time Leaderboard**: During countdown, shows current standings with compact betting indicators positioned in top right corners
  - **Round Results View**: After timer expires, displays final guesses and updated points with year indicators in top right corners
  - **Medal-Style Rankings**: Gold/silver/bronze visual hierarchy for top 3 teams with enhanced contrast for better readability
- **Dynamic Team Rankings**: Teams are automatically ranked based on points with visual indicators
  - **Ranking Display**: Circular badges showing team position (1st, 2nd, 3rd, etc.) using MDI numeric icons
  - **Round-Aware Color Coding**: 
    - **Round 0**: All teams show neutral gray gradient (no competition yet)
    - **Round 1+**: Medal-based headers with tie support and improved contrast:
      - **Gold** gradient for all teams with highest points (handles ties)
      - **Silver** gradient for all teams with next highest points  
      - **Bronze** gradient for all teams with third highest points
      - **Neutral gray** gradient for all remaining teams
  - **Automatic Medal Logic**: No manual setup required - medals assigned based on actual point distribution
  - **Visual Distinction**: Clear separation between team headers and content areas with enhanced readability
- **Flexible Audio Integration**: Works with any Home Assistant media player
- **Configurable Timing**: Adjustable countdown timer (5-300 seconds)
- **Auto-Scoring**: Automatic point calculation based on guess accuracy
- **State Persistence**: Team information and settings persist across restarts
- **Real-time Updates**: Live score updates, countdown display, and ranking changes
- **Spotify Integration**: Supports Spotify URLs and other media formats
- **Debug Tools**: Built-in troubleshooting information for media playback
- **Robust Display**: Always shows meaningful song information with fallback values for improved user experience
- **Collapsible Interface**: Admin sections feature expandable/collapsible interfaces for cleaner UI organization
- **Advanced Highscore System**: Automatic tracking of all-time and per-round records with animated celebration banners

### Services

The integration provides comprehensive Home Assistant services for automation and external control:

#### Game Control Services
- `soundbeats.start_game` - Start a new game session (resets teams, round counter, played songs list, and stops countdown)
- `soundbeats.stop_game` - Stop the current game session  
- `soundbeats.reset_game` - Reset the game to initial state
- `soundbeats.next_song` - Skip to the next song and start countdown timer (automatically selects only unplayed songs)

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
- **No Audio Player Selected**: The system now shows an alert notification banner when you click "Next Song" without selecting an audio player. Simply choose an audio player in the admin settings section to resolve this.
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

#### Song Repeat System
- **All Songs Played Warning**: When all available songs have been played, a warning banner will slide in from the right
- **Dismissing the Warning**: Click the X button on the banner to close it temporarily
- **Resolving the Issue**: Start a new game to reset the played songs list and continue playing
- **Checking Song Status**: Use Developer Tools → States to check `sensor.soundbeats_played_songs` for the list of played song IDs

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

### Betting UI Issues

#### BET Button Behavior Problems
If the BET button shows unexpected visual behavior on mobile or desktop:

**Mobile Devices:**
- **Issue**: Tapping the BET button triggers blue hover color instead of orange betting state
- **Solution**: The integration now uses CSS media queries to disable hover effects on touch devices
- **Expected Behavior**: 
  - Tap "Place Bet" → Button immediately turns orange with "BETTING!" text and pulse animation
  - Tap "BETTING!" → Button returns to blue "Place Bet" state
  - Orange state only appears when backend confirms betting is active

**Betting Info Display:**
- **Bonus points info** ("Win: 20pts | Lose: 0pts") should appear immediately below the button when betting is active
- **If not showing**: Refresh the page or check that the team sensor entity is updating correctly
- **Timing**: Info display is controlled by the backend `betting` property, not just button clicks

**State Synchronization:**
- Button visual state reflects the actual backend entity state (`team.betting` property)
- **Real-time Updates**: Bet button state is automatically synchronized with backend state changes without requiring page reload
- **No Setup Required**: Button state synchronization works out-of-the-box with the Lovelace Card integration
- If button appears stuck in wrong state, check Home Assistant logs for service call errors
- The betting state persists across page refreshes and accurately reflects the team's actual betting status

#### Troubleshooting Betting State
1. **Check entity state**: Go to Developer Tools → States and verify `sensor.soundbeats_team_X` has correct `betting` attribute
2. **Service call verification**: Check Home Assistant logs for successful `soundbeats.update_team_betting` service calls
3. **Browser cache**: Clear browser cache if button behavior seems inconsistent
4. **CSS conflicts**: Disable browser extensions that might override CSS hover behavior

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
- Admin volume control for media players (up/down buttons)
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
