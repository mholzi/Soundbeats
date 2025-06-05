# Soundbeats for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

Turn your Home Assistant into a music guessing game arena. Teams compete to guess song release years, with automatic scoring and real-time rankings. No configuration files, no YAML editing - just install, add the card, and play.

## What You Get

- **Complete party game** with teams, scoring, and leaderboards
- **Built-in Lovelace card** - no manual setup required
- **Automatic music playback** through your media players
- **Smart scoring system** - closer guesses earn more points
- **Live team rankings** with visual indicators
- **Zero configuration** - works immediately after installation

**Requirements:** Home Assistant 2023.1.0+ and a Spotify-enabled media player

## Quick Start

### 1. Install via HACS
1. Open HACS → Integrations
2. Click ⋮ (three dots) → Custom repositories
3. Add `https://github.com/mholzi/Soundbeats` (Integration category)
4. Install and restart Home Assistant

### 2. Add the Integration
1. Go to Settings → Devices & Services
2. Click "Add Integration" 
3. Search for "Soundbeats" and add it

### 3. Add the Game Card
1. Edit your dashboard
2. Add card → Custom: Soundbeats Card
3. Save - you're ready to play!

## How to Play

1. **Set up teams** (up to 5) using manually created Home Assistant users
2. **Select your media player** (must support Spotify)
3. **Start the game** - songs play automatically
4. **Teams guess the release year** within the countdown timer
5. **Points awarded automatically** based on accuracy:
   - Exact year: 20 points
   - Within 2 years: 10 points  
   - Within 5 years: 5 points
6. **Rankings update live** with visual indicators

## Team Management

**Important:** Teams can only use manually created Home Assistant users, not the auto-generated "Home Assistant" accounts. Each user sees only their own teams for a personalized experience.

To create users for teams:
1. Go to Settings → People → Users
2. Add new users for each team captain
3. These users can then create and manage their teams in the game

## Troubleshooting

**Card not showing:** Ensure the integration is added and Home Assistant is restarted

**No music playing:** Verify your media player supports Spotify and is selected in the game

**Teams can't be created:** Use manually created HA users, not auto-generated ones

**Debug tools:** The integration includes built-in troubleshooting features accessible through the card interface

## License

MIT License - see [LICENSE](LICENSE) file for details.


