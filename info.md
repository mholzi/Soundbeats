# Soundbeats Integration for Home Assistant

A custom Home Assistant integration for managing and playing the Soundbeats party game.

## Features

- **Game Status Monitoring**: Track the current status of your Soundbeats party game
- **Custom Lovelace Card**: Integrated card with role-based visibility (title, team, and admin sections)
- **Service Integration**: Control game functions through Home Assistant services
- **Lightweight**: Simple integration designed for party environments

## Installation via HACS

1. Install [HACS](https://hacs.xyz/) if you haven't already
2. Go to HACS → Integrations
3. Click the three dots in the top right corner and select "Custom repositories"
4. Add `https://github.com/mholzi/Soundbeats` as repository with category "Integration"
5. Click "Add" and then "Install"
6. Restart Home Assistant

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

The integration automatically provides a custom Lovelace card accessible by selecting "Custom: Soundbeats Card" when adding a new card to your dashboard.

## Support

If you encounter any issues, please [open an issue](https://github.com/mholzi/Soundbeats/issues) on GitHub.