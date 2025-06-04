# Soundbeats
Fun Home Assistant Party Game

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A custom Home Assistant integration for managing and playing the Soundbeats party game.

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

Add the following to your `configuration.yaml` file:

```yaml
soundbeats:
```

After adding the configuration, restart Home Assistant.

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

## Support

If you encounter any issues, please [open an issue](https://github.com/mholzi/Soundbeats/issues) on GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
