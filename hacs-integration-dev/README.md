# Soundbeats Home Assistant Integration

[![HACS](https://img.shields.io/badge/HACS-Default-orange.svg)](https://hacs.xyz)
[![Validate](https://github.com/yourusername/soundbeats-integration/actions/workflows/validate.yml/badge.svg)](https://github.com/yourusername/soundbeats-integration/actions)

A HACS-compatible Home Assistant integration that transforms your smart home into an interactive music trivia party game.

## Installation via HACS

### Prerequisites
- Home Assistant 2024.1.0 or newer
- HACS installed and configured

### Steps
1. Open HACS in Home Assistant
2. Go to "Integrations"
3. Click the "+" button
4. Search for "Soundbeats"
5. Click "Download"
6. Restart Home Assistant
7. Look for "Soundbeats" in your sidebar

## Current Status: Phase 2 Complete
- ✅ HACS integration structure
- ✅ Sidebar panel registration  
- ✅ Basic frontend framework
- ✅ Vite build system with TypeScript
- ✅ ESLint and Prettier configuration
- 🚧 Game mechanics (coming in future phases)

## Features (Planned)

- 🎵 **Music Trivia Gameplay** - Guess the year songs were released
- 👥 **Multi-Team Support** - Up to 5 teams competing simultaneously
- 🎯 **Betting System** - Double points for confident guesses
- 🔥 **Hot Streak Bonuses** - Rewards for consecutive correct answers
- 📊 **Live Leaderboards** - Real-time score tracking
- 🏆 **Highscore System** - Persistent record keeping
- 🎶 **Spotify Integration** - Play 30-second song snippets
- 📱 **Responsive Design** - Works on phones, tablets, and TV displays

## Manual Installation

1. Download the latest release
2. Copy `custom_components/soundbeats` to your Home Assistant config directory
3. Restart Home Assistant
4. Add the integration via Settings > Integrations

## Usage

After installation, you'll find a "Soundbeats" option in your Home Assistant sidebar. Click it to access the game panel.

### Phase 1 (Current)
The integration currently displays a "Coming Soon" message with the foundational structure in place.

### Future Phases
- **Phase 2**: Basic Frontend Framework
- **Phase 3**: Game State Management  
- **Phase 4**: Song Database & Music Integration
- **Phase 5**: Basic Scoring System
- **Phase 6**: Timer & Round Management
- **Phase 7**: Betting Mechanics & Advanced Scoring
- **Phase 8**: Team Management & Multi-User Support
- **Phase 9**: Animations & Visual Enhancements
- **Phase 10**: Highscores & Game Completion

## Troubleshooting

### Panel doesn't appear
1. Check Home Assistant logs for errors
2. Ensure integration installed correctly via HACS
3. Try refreshing browser/clearing cache

### Installation fails
1. Verify HACS is properly configured
2. Check Home Assistant version compatibility
3. Review installation logs in HACS

## Support

- [Issues](https://github.com/yourusername/soundbeats-integration/issues)
- [Discussions](https://github.com/yourusername/soundbeats-integration/discussions)

## Development

This integration follows Home Assistant development best practices and is structured for phased implementation of gaming features.

### Frontend Development

The frontend uses Vite with TypeScript for modern development experience.

#### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

#### Setup
```bash
cd custom_components/soundbeats/frontend
npm install
```

#### Development
```bash
# Start development build with watch mode
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

#### Build Notes
- Built files are committed to the repository for HACS compatibility
- Bundle size target: < 200KB (currently ~30KB)
- Source maps included for debugging
- TypeScript strict mode enabled

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Build frontend: `npm run build`
5. Run tests and validation
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.