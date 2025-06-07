# 🎵 Soundbeats - The Ultimate Music Party Game for Home Assistant! 🎉

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

**Transform your smart home into the ultimate party destination!** Soundbeats brings the excitement of music trivia directly to your Home Assistant dashboard with a stunning, zero-setup experience that will have your guests competing for hours.

## 🚀 Why Soundbeats is a Game-Changer

✨ **Zero Technical Setup** - Install once, party forever! No YAML editing, no configuration files, no tech headaches  
🎵 **Works with ANY Audio Player** - As long as your audio player supports Spotify playback, you're ready to rock  
🏆 **Competitive Team Action** - Up to 5 teams battle to guess song release years with automatic scoring  
📱 **Mobile-First Design** - Gorgeous, responsive interface perfect for passing around at parties  
🎯 **Instant Gratification** - From installation to first game in under 2 minutes  

> **🎧 Audio Player Requirement:** Your selected audio player must support Spotify playback (most modern media players do). However, you do NOT need to install any Spotify integration in Home Assistant - Soundbeats handles everything internally!

**Version:** v0.3 (Final Release)  
**Minimum Home Assistant Version:** 2023.1.0  
**Integration Type:** Service-based with Custom Lovelace Card

## 🎉 What Makes v0.3 the Perfect Party Game

### 🎮 Revolutionary Zero-Setup Experience
- **Interactive Splash Screen** - Gorgeous onboarding that guides you through setup in seconds
- **Smart Auto-Configuration** - Everything works automatically after installation
- **One-Click Game Launch** - From dashboard to party game in one tap

### 🎵 Universal Audio Compatibility  
- **Works with ANY Home Assistant Media Player** that supports Spotify
- **No Spotify Integration Required** - Works without installing HA Spotify integration
- **Automatic Audio Management** - Just select your speaker and start playing

### 🏆 Competition-Ready Features
- **Intelligent Scoring System** - Automatic points based on guess accuracy
- **Real-Time Leaderboards** - Watch rankings change live during gameplay  
- **Team Management** - Up to 5 teams with persistent data across sessions
- **Professional Presentation** - Stunning animations and party-ready interface

---

## 🚀 Quick Installation Guide - Get Your Party Started!

### ⚡ Method 1: HACS Installation (Recommended - Takes 2 Minutes!)

**Perfect for most users - completely automated setup:**

1. **Install HACS** (if you haven't already) - [Get HACS here](https://hacs.xyz/)
2. **Go to HACS** → Integrations
3. **Add Custom Repository**: 
   - Click the three dots in top right → "Custom repositories"
   - Add `https://github.com/mholzi/Soundbeats` as repository with category "Integration"
4. **Install Soundbeats**: Click "Add" then "Install"
5. **Restart Home Assistant** (Settings → System → Restart)
6. **🎉 You're Done!** Add the Soundbeats card to your dashboard and start playing!

### ⚙️ Method 2: Manual Installation (For Advanced Users)

1. **Download the integration**: Get the `custom_components/soundbeats` folder from this repository
2. **Copy to your HA**: Place it in your Home Assistant `custom_components` directory
3. **Restart Home Assistant**
4. **Setup Complete!**

## 🎛️ Essential Setup - Your Audio Player Requirements

**Before you start playing, ensure your audio setup is party-ready:**

### ✅ Audio Player Compatibility Check
Your selected media player MUST support **Spotify playback**. Most modern players do:
- ✅ **Sonos speakers** - Perfect choice, excellent Spotify support
- ✅ **Google Cast/Chromecast devices** - Great compatibility  
- ✅ **VLC media player** - Reliable option
- ✅ **MPD/Mopidy players** - Advanced but powerful
- ✅ **Most modern smart speakers and streaming devices**

### 🎵 Spotify Integration Clarification
> **💡 Important:** You do NOT need to install or configure any Spotify integration in Home Assistant! Soundbeats handles all Spotify playback internally. Your media player just needs to be capable of playing Spotify URLs.

### 🔧 Integration Setup (Takes 30 Seconds!)
1. **Navigate to**: Settings → Devices & Services  
2. **Click**: "Add Integration"
3. **Search for**: "Soundbeats"  
4. **Complete Setup**: Follow the simple setup wizard
5. **Ready to Rock!** The integration creates all necessary entities automatically

## 🎮 Add the Game to Your Dashboard

1. **Edit your dashboard** (three dots → Edit Dashboard)
2. **Add a card** → Search for **"Custom: Soundbeats Card"**
3. **Save** and watch the magic happen!
4. **Launch your first game** through the interactive splash screen

## 🎯 How the Game Works - Party Competition at Its Best!

Get ready for intense musical competition! Soundbeats transforms your living room into a game show arena where music knowledge rules supreme.

### 🏁 Game Flow - Simple Yet Addictive

1. **🎪 Team Assembly**: Create up to 5 teams with epic names through the gorgeous splash screen
2. **🎵 Song Challenge**: Each round plays a mystery song through your selected audio player  
3. **⏱️ Pressure Time**: Teams get a customizable countdown (default 30 seconds) to guess the release year
4. **💰 Betting Drama**: Teams can bet their points for double-or-nothing excitement!
5. **🏆 Instant Results**: Automatic scoring with visual celebrations for great guesses
6. **📊 Live Leaderboard**: Watch team rankings shift in real-time with every round

### 🎖️ Scoring System - Precision Pays Off!

**Master the years, master the game:**
- **🥇 20 points** - Nail the exact year (legendary!)
- **🥈 10 points** - Within ±2 years (impressive!)  
- **🥉 5 points** - Within ±5 years (not bad!)
- **💸 0 points** - More than 5 years off (ouch!)

### 🎲 Betting System - Risk It for the Win!
- **Double or Nothing**: Confident teams can bet their points
- **Win**: Double your round points (20 → 40 points!)
- **Lose**: Lose all your points from that round (strategic risk!)

### 🏅 Dynamic Rankings - See the Competition Heat Up!
- **🎨 Color-Coded Teams**: Gold, Silver, Bronze headers for top performers
- **📱 Live Leaderboard**: Horizontal scrolling scoreboard shows all teams
- **🏆 Visual Badges**: Circular ranking indicators for instant position recognition
- **⚡ Real-Time Updates**: Rankings change immediately as scores update


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


## ⚙️ Configuration - Zero Technical Headaches!

**🎉 The best part? There's practically NOTHING to configure!** Soundbeats v0.3 follows a revolutionary zero-setup philosophy that gets you from installation to your first game in minutes.

### 🚀 Automatic Setup Magic

After installation, everything works automatically:
- ✅ **Integration auto-registers** in Home Assistant  
- ✅ **All sensors created automatically** (game state, teams, scoring, etc.)
- ✅ **Lovelace card registers itself** - just add it to your dashboard
- ✅ **Interactive splash screen** handles any remaining setup

### 🎵 Audio Player Selection Made Simple

The beautiful splash screen guides you through selecting your audio player:
1. **Dropdown shows all available media players** in your Home Assistant
2. **Select any player that supports Spotify** (most modern players do)
3. **Choice is saved automatically** - no repeated setup needed
4. **Change anytime** through the admin settings

### 👥 Team Management - Fun and Flexible

**Splash Screen Setup:**
- Create team names on the fly through the interactive interface
- Assign Home Assistant users to teams via simple dropdowns  
- All changes save instantly to Home Assistant entities
- **Required**: Every team must have a user assigned before game launch

**Admin Controls (During Game):**
- Expandable team management section for advanced users
- Modify team names, participation status, and point adjustments
- All changes persist across Home Assistant restarts

### 🎛️ Game Customization Options

**Timer Settings:**
- Adjustable countdown timer (5-300 seconds)
- Default 30 seconds works perfectly for most parties
- Change anytime through admin controls

**Team Participation:**
- Enable/disable teams without deleting their data
- Perfect for varying party sizes
- Inactive teams hidden from gameplay but data preserved

---

## 🌟 Why Choose Soundbeats? 

### 🎪 The Ultimate Party Game Experience
- **🎮 Instant Entertainment** - Transform any gathering into a competitive music trivia night
- **📱 Mobile-First Design** - Pass your phone/tablet around - everyone can play from the same device
- **🎵 Universal Music Appeal** - Songs span decades, appealing to all age groups
- **🏆 Competitive Spirit** - Real-time scoring and rankings fuel friendly competition

### 🛠️ Technical Excellence Without the Hassle  
- **⚡ Zero Configuration** - Works immediately after installation
- **🔄 Persistent Data** - Team progress and highscores survive Home Assistant restarts
- **🎯 Smart Integration** - Seamlessly works with your existing Home Assistant setup
- **📊 Professional Interface** - Stunning animations and party-ready design

### 🎵 Audio Flexibility That Just Works
- **🔌 Universal Compatibility** - Works with any Home Assistant media player supporting Spotify
- **🎧 No Extra Integrations** - Doesn't require separate Spotify HA integration
- **🔊 Volume Controls** - Built-in admin controls for perfect party audio
- **📻 Smart Fallbacks** - Robust error handling keeps the party going

---

### Team Assignment & User Management

**Immediate Persistence**: Team user assignments made through the splash screen are instantly and permanently written to Home Assistant entities. When you assign a user to a team via the dropdown, the change is immediately persisted to the respective team entity's `user_id` attribute in Home Assistant with zero delay or debouncing.

**Unified Backend**: Both the splash screen team assignment and the admin team management section use the exact same backend service (`soundbeats.update_team_user_id`), ensuring consistent behavior and immediate persistence across all interfaces.

**Unified Frontend Architecture**: The Team Management area in the main gaming screen directly uses the same rendering and update methods (`renderSplashInputs` and `updateSplashTeamsSection`) as the Splashscreen, eliminating code duplication and ensuring consistent UI behavior. Both sections share identical logic for team/user assignment functionality, dropdown updates, and UI refreshes, meaning changes in either section are instantly and correctly reflected in both UI areas.

**Zero-Setup Team Management**: Users can assign teams and users entirely from the UI with no manual setup required. All changes are instantly reflected in Home Assistant entities and persist across restarts, making team configuration completely seamless and reliable. **Important**: Before starting a game, every team (for your chosen team count) must have a user assigned—the Start Game button will only allow the transition once all teams are fully configured.

## ✨ Zero-Setup Experience with Interactive Splash Screen

Soundbeats v0.3 introduces a **brand new interactive splash/setup UI** that makes getting started completely effortless. No YAML editing, no manual configuration files, no complex setup steps—everything happens directly in the beautiful Lovelace Card interface!

### 🎮 Seamless Onboarding Flow


- **Persistent Settings**: All your preferences and team assignments are automatically saved and immediately written to Home Assistant entities, remembered for future games

**The Result**: From installation to your first game in under 2 minutes, with zero technical knowledge required!

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

**Music Selection:** Soundbeats uses a simple, curated song list without category or era filtering. The game does not include music category selection (rock, pop, etc.) or era filtering (60s, 80s, etc.) - songs are randomly selected from the complete list for maximum variety and simplicity. This design ensures zero configuration is required for music preferences and provides a straightforward gaming experience focused on year-guessing fun.

### Lovelace Card


The card features role-based sections:

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
- **Global Scoreboard Display**: Team overview now displays ALL participating teams regardless of user assignment, acting as a comprehensive scoreboard visible to all users for competitive transparency.
- **Round-Aware Visibility**: Team ranking section automatically appears only when the game has started (round counter > 0), keeping the interface clean before gameplay begins
- **Horizontal Scrollable Leaderboard**: All active participating teams displayed in a single horizontal row with compact cards that scroll when overflowing
- **Compact Card Design**: Much smaller team cards (80-120px wide) with points prominently displayed at the top and team names in small font at the bottom
- **Enhanced Visual Layout**: 
  - **Header Alignment**: Title section perfectly aligns with card edges for a cleaner look
  - **Badge Positioning**: Guessed year and bet indicators positioned in the top right corner of each team card
  - **Improved Contrast**: Enhanced background colors ensure text and icons are always clearly visible, with dark backgrounds for non-medal teams
- **Context-Aware Display**: 
  - **During countdown (timer running)**: Shows ranking badge, current points at top, team name at bottom, and compact "BET" indicators in top right corner
  - **When timer is 0 (round over)**: Displays ranking badge, current points at top, team name at bottom, and last round guess year in top right corner
- **Visual Hierarchy**: Clear gold/silver/bronze styling for top 3 teams with distinct ranking badges using Material Design Icons (MDI)
- **Smart Sorting**: Teams automatically sorted by points in descending order across all participants
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

**Note**: The admin sections feature expandable/collapsible interfaces with chevron icons. Click on the section headers to expand or collapse these sections. The expanded state persists throughout your session but resets when the page is reloaded. With the new interactive splash/setup screen, the card provides a completely seamless onboarding experience with zero manual setup required for users.

To use the card, add it to your Lovelace dashboard by selecting **"Custom: Soundbeats Card"** when adding a new card. The interactive splash screen will guide you through any necessary configuration automatically.

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
- `soundbeats.start_game` - Start a new game session (resets teams, round counter, played songs list, and stops countdown). **Note**: The UI Start/Launch Game button does NOT call this service - it only transitions the interface. This service is intended for automation or explicit game initialization via Home Assistant services.
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

## 🔧 Troubleshooting - Quick Fixes for Common Issues

### 🎮 Card Not Showing Up?

**Quick Fixes (solves 90% of issues):**
1. **Restart Home Assistant** after installation (Settings → System → Restart)
2. **Clear browser cache** and refresh the page
3. **Check integration status** - Go to Settings → Devices & Services, verify "Soundbeats" appears
4. **Add card correctly** - Choose **"Custom: Soundbeats Card"** when adding new card

### 🎵 Audio/Music Not Playing?

#### 🎧 Audio Player Requirements Check
**The #1 cause of audio issues - verify your player supports Spotify:**

✅ **Recommended Players (tested and reliable):**
- **Sonos speakers** - Excellent Spotify support
- **Google Cast/Chromecast** - Works great
- **VLC media player** - Reliable choice

❌ **Common Issues:**
- **Player doesn't support Spotify URLs** - Try a different media player
- **No audio player selected** - Choose one in the admin settings
- **Network issues** - Ensure your player has internet access

#### 🐛 Debug Information Helper
If music still won't play, check the **Debug Information** section at the bottom of the Soundbeats card:
- **Selected Audio Player** - Which player is chosen
- **Current Song URL** - The Spotify URL being used
- **Media Content Type** - Confirms Spotify URL detection
- **Media Player Assignment** - Shows the connection

### 🏆 Game State Issues

#### 🔄 All Songs Played Warning
- **Warning banner appears** when you've gone through all available songs
- **Solution**: Start a new game to reset the playlist
- **Quick check**: Developer Tools → States → `sensor.soundbeats_played_songs`

#### 👥 Teams Not Working
- **Team assignments**: Ensure every team has a user assigned
- **Admin permissions**: Verify you can see admin controls
- **Browser refresh**: Try reloading the page
- **Entity check**: Verify team sensors exist in Developer Tools → States
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
- Functionality improvements (difficulty adjustment, statistics)
- Implementation guides for each enhancement

### Contributing

The integration follows Home Assistant development best practices:
- Use config flows for setup (no YAML required)
- Implement RestoreEntity for state persistence
- Follow Home Assistant entity naming conventions
- Include comprehensive error handling and logging

## 🎉 Ready to Transform Your Next Party?

Soundbeats v0.3 is the final release of the ultimate Home Assistant party game. With zero-setup installation, universal audio compatibility, and a stunning interface designed for competition, you're just minutes away from turning any gathering into an unforgettable music trivia experience.

**🚀 Get Started Now:**
1. Install via HACS (2 minutes)
2. Add the card to your dashboard (30 seconds)  
3. Select your audio player (10 seconds)
4. Start your first game and watch the magic happen!

---

## 💬 Support & Community

**Need Help?** We've got you covered!
- 🐛 **Found a bug?** [Open an issue on GitHub](https://github.com/mholzi/Soundbeats/issues)
- 💡 **Have a suggestion?** We love feedback and feature requests!
- 📖 **Documentation questions?** The troubleshooting section covers most common issues

**Contributing:**
Soundbeats follows Home Assistant development best practices and welcomes contributions. Check out our development guidelines in the repository for more details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🎵 Start your party today with Soundbeats v0.3 - where music meets competition! 🏆**
