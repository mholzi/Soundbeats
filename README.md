# Soundbeats
Fun Home Assistant Party Game

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A custom Home Assistant integration for managing and playing the Soundbeats party game.

**Version:** 1.0.0  
**Minimum Home Assistant Version:** 2023.1.0

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

## Configuration

No manual configuration is required! The integration will be automatically available in your Home Assistant interface after installation.

1. Go to Settings → Devices & Services
2. Click "Add Integration"
3. Search for "Soundbeats"
4. Click to add the integration
5. Follow the setup wizard

The integration is now ready to use!

## Usage

Once installed and configured, the integration will create a sensor entity called `sensor.soundbeats_game_status` that shows the current status of your party game.

### Lovelace Card

The integration automatically provides a custom Lovelace card with no additional setup required. The card features:

- **Title section**: Always visible to all users
- **Team section**: Game status and player information visible to all users  
- **Admin section**: Game controls visible only to admin users

To use the card, simply add it to your Lovelace dashboard by selecting "Custom: Soundbeats Card" when adding a new card.

### Features

- Game status monitoring
- Simple integration with Home Assistant automations
- Custom Lovelace card with role-based visibility
- Admin controls for game management
- Lightweight and fun party game integration

### Services

The integration provides the following Home Assistant services for automation and control:

- `soundbeats.start_game` - Start a new game session
- `soundbeats.stop_game` - Stop the current game session  
- `soundbeats.reset_game` - Reset the game to initial state
- `soundbeats.next_song` - Skip to the next song
- `soundbeats.update_team_name` - Update a team's name
- `soundbeats.update_team_points` - Update a team's points
- `soundbeats.update_team_participating` - Set team participation status

## Troubleshooting

### Card Not Appearing
- Ensure the integration is properly installed and Home Assistant has been restarted
- Clear your browser cache and refresh the page
- Check that you're selecting "Custom: Soundbeats Card" when adding a new card

### Sensor Not Created
- Ensure the integration is properly installed and configured through Settings → Devices & Services
- Check Home Assistant logs for any error messages
- Restart Home Assistant after installation

## Support

If you encounter any issues, please [open an issue](https://github.com/mholzi/Soundbeats/issues) on GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
